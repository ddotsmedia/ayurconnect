import type { FastifyPluginAsync } from 'fastify'
import { logAudit, clientIp } from '../lib/audit.js'
import { moderate as moderateRecord, completenessScoreHospital } from '../lib/moderation-flow.js'

export const autoPrefix = '/hospitals'

const FLAG_FIELDS = ['ccimVerified', 'ayushCertified', 'panchakarma', 'nabh'] as const
const STRING_FIELDS = [
  'name', 'type', 'district', 'state', 'country', 'profile', 'contact', 'address',
  'websiteUrl', 'linkedinUrl', 'facebookUrl', 'instagramUrl', 'twitterUrl', 'youtubeUrl',
] as const
const SOCIAL_URL_FIELDS = ['websiteUrl', 'linkedinUrl', 'facebookUrl', 'instagramUrl', 'twitterUrl', 'youtubeUrl'] as const

function normalizeUrl(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim()
  if (!s) return null
  if (!/^https?:\/\/\S+\.\S+/i.test(s)) return null
  return s.slice(0, 500)
}

const hospitals: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const { country, state, district, type, q, verified, limit } = request.query as Record<string, string>
    const where: Record<string, unknown> = {}
    if (country && /^[A-Z]{2}$/.test(country)) where.country = country
    if (state)    where.state    = { contains: state, mode: 'insensitive' }
    if (district) where.district = { contains: district, mode: 'insensitive' }
    if (type)     where.type     = { contains: type, mode: 'insensitive' }
    if (verified === 'true')  where.ccimVerified = true
    if (verified === 'false') where.ccimVerified = false
    if (q) where.OR = [
      { name:     { contains: q, mode: 'insensitive' } },
      { type:     { contains: q, mode: 'insensitive' } },
      { district: { contains: q, mode: 'insensitive' } },
      { state:    { contains: q, mode: 'insensitive' } },
    ]
    const take = Math.min(Number(limit) || 100, 500)
    // Only need ratings for the averaging math in the list view; pulling full
    // review rows blows up payload + query time as reviews grow.
    return fastify.prisma.hospital.findMany({
      where,
      include: { reviews: { select: { rating: true } } },
      orderBy: { createdAt: 'desc' },
      take,
    })
  })

  // GET /hospitals/countries — country breakdown for the directory pills row.
  // Returns one entry per country that has at least one hospital, sorted by
  // count desc. Used to render an always-visible country-wise filter strip
  // at the top of /hospitals so users don't have to open the dropdown.
  fastify.get('/countries', async () => {
    const groups = await fastify.prisma.hospital.groupBy({
      by: ['country'],
      _count: { _all: true },
      orderBy: { _count: { country: 'desc' } },
    })
    return groups.map((g) => ({ code: g.country, count: g._count._all }))
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const hospital = await fastify.prisma.hospital.findUnique({
      where: { id },
      include: {
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    if (!hospital) return reply.code(404).send({ error: 'Hospital not found' })
    return hospital
  })

  fastify.post('/', { preHandler: fastify.requireAdmin }, async (request) => {
    const body = request.body as Record<string, unknown>
    const country = typeof body.country === 'string' && /^[A-Z]{2}$/.test(body.country) ? body.country : 'IN'
    const state   = typeof body.state === 'string' && body.state.trim() ? body.state.trim().slice(0, 100) : null
    return fastify.prisma.hospital.create({
      data: {
        name: String(body.name),
        type: String(body.type),
        country,
        state,
        district: String(body.district),
        ccimVerified: Boolean(body.ccimVerified),
        ayushCertified: Boolean(body.ayushCertified),
        panchakarma: Boolean(body.panchakarma),
        nabh: Boolean(body.nabh),
        profile: (body.profile as string) || null,
        contact: (body.contact as string) || null,
        address: (body.address as string) || null,
        latitude: body.latitude != null && body.latitude !== '' ? Number(body.latitude) : null,
        longitude: body.longitude != null && body.longitude !== '' ? Number(body.longitude) : null,
        websiteUrl:   normalizeUrl(body.websiteUrl),
        linkedinUrl:  normalizeUrl(body.linkedinUrl),
        facebookUrl:  normalizeUrl(body.facebookUrl),
        instagramUrl: normalizeUrl(body.instagramUrl),
        twitterUrl:   normalizeUrl(body.twitterUrl),
        youtubeUrl:   normalizeUrl(body.youtubeUrl),
      },
    })
  })

  fastify.patch('/:id', { preHandler: fastify.requireAdmin }, async (request) => {
    const { id } = request.params as { id: string }
    const body = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    for (const k of STRING_FIELDS) {
      if (body[k] === undefined) continue
      // Validate country (ISO-2). Allow null/empty state. Pass-through for the rest.
      if (k === 'country') {
        const v = typeof body.country === 'string' && /^[A-Z]{2}$/.test(body.country) ? body.country : null
        if (v) data.country = v
        continue
      }
      if (k === 'state') {
        data.state = typeof body.state === 'string' && body.state.trim() ? body.state.trim().slice(0, 100) : null
        continue
      }
      if ((SOCIAL_URL_FIELDS as readonly string[]).includes(k)) {
        data[k] = normalizeUrl(body[k])
        continue
      }
      data[k] = body[k]
    }
    for (const k of FLAG_FIELDS) {
      if (body[k] !== undefined) data[k] = Boolean(body[k])
    }
    if (body.latitude !== undefined) data.latitude = body.latitude === '' || body.latitude === null ? null : Number(body.latitude)
    if (body.longitude !== undefined) data.longitude = body.longitude === '' || body.longitude === null ? null : Number(body.longitude)
    return fastify.prisma.hospital.update({ where: { id }, data })
  })

  // ─── Moderation endpoints (Phase 9) — mirrors doctors.ts ──
  for (const action of ['approve', 'decline', 'request-info', 'flag', 'note', 'reset'] as const) {
    fastify.post(`/:id/${action}`, { preHandler: fastify.requireAdmin }, async (request, reply) => {
      const { id } = request.params as { id: string }
      const body = (request.body ?? {}) as { reason?: string; note?: string }
      if ((action === 'decline' || action === 'request-info' || action === 'flag') && !body.reason?.trim()) {
        return reply.code(400).send({ error: `${action} requires a reason` })
      }
      if (action === 'note' && !body.note?.trim()) {
        return reply.code(400).send({ error: 'note text required' })
      }
      const result = await moderateRecord(fastify, 'hospital', id, action, {
        adminSession: request.session! as never,
        reason:       body.reason?.trim() ?? null,
        note:         body.note?.trim() ?? null,
        request,
      })
      if (result.ok === false) return reply.code(result.status).send({ error: result.error })
      return result.record
    })
  }

  // Admin queue with provenance + owner + completeness.
  fastify.get('/_admin/queue', { preHandler: fastify.requireAdmin }, async (request) => {
    const { status = 'pending', q } = request.query as Record<string, string>
    const where: Record<string, unknown> = {}
    if (status === 'all') {
      // no filter
    } else if (status) {
      where.moderationStatus = status
    }
    if (q) where.OR = [
      { name:     { contains: q, mode: 'insensitive' } },
      { type:     { contains: q, mode: 'insensitive' } },
      { district: { contains: q, mode: 'insensitive' } },
    ]
    const items = await fastify.prisma.hospital.findMany({
      where,
      orderBy: [{ moderationStatus: 'asc' }, { createdAt: 'asc' }],
      take:    100,
      include: {
        ownedBy:        { select: { id: true, email: true, name: true, phone: true, createdAt: true, role: true } },
        lastReviewedBy: { select: { id: true, name: true, email: true } },
      },
    })
    return {
      hospitals: items.map((h) => ({ ...h, completeness: completenessScoreHospital(h as unknown as Record<string, unknown>) })),
      count:     items.length,
    }
  })

  // Admin-only counts widget — pending/needs-info/flagged across both entities.
  fastify.get('/_admin/queue-counts', { preHandler: fastify.requireAdmin }, async () => {
    const [docPending, docNeeds, docFlagged, hosPending, hosNeeds, hosFlagged] = await Promise.all([
      fastify.prisma.doctor.count({   where: { moderationStatus: 'pending' } }),
      fastify.prisma.doctor.count({   where: { moderationStatus: 'needs-info' } }),
      fastify.prisma.doctor.count({   where: { moderationStatus: 'flagged' } }),
      fastify.prisma.hospital.count({ where: { moderationStatus: 'pending' } }),
      fastify.prisma.hospital.count({ where: { moderationStatus: 'needs-info' } }),
      fastify.prisma.hospital.count({ where: { moderationStatus: 'flagged' } }),
    ])
    return {
      doctors:   { pending: docPending, needsInfo: docNeeds, flagged: docFlagged, total: docPending + docNeeds + docFlagged },
      hospitals: { pending: hosPending, needsInfo: hosNeeds, flagged: hosFlagged, total: hosPending + hosNeeds + hosFlagged },
    }
  })

  fastify.delete('/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const before = await fastify.prisma.hospital.findUnique({
      where: { id },
      select: { id: true, name: true, type: true, country: true, district: true, ccimVerified: true },
    })
    await fastify.prisma.hospital.delete({ where: { id } })
    if (before) {
      void logAudit(fastify, {
        actorId:    request.session!.user.id,
        action:     'delete',
        targetType: 'Hospital',
        targetId:   id,
        before:     before as unknown as Record<string, unknown>,
        ip:         clientIp(request),
      })
    }
    return reply.code(204).send()
  })
}

export default hospitals
