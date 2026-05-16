import type { FastifyPluginAsync } from 'fastify'
import { createNotification } from '../lib/notify.js'
import { logAudit, clientIp } from '../lib/audit.js'
import { moderate as moderateRecord, completenessScoreDoctor } from '../lib/moderation-flow.js'

export const autoPrefix = '/doctors'

const STR_FIELDS = [
  'name', 'specialization', 'district', 'state', 'country',
  'profile', 'bio', 'qualification', 'photoUrl', 'contact', 'address',
  'websiteUrl', 'linkedinUrl', 'facebookUrl', 'instagramUrl', 'twitterUrl', 'youtubeUrl',
  'workplace', 'workplaceUrl',
] as const
const ARR_FIELDS = ['languages', 'availableDays'] as const
const NUM_FIELDS = ['experienceYears'] as const
const SOCIAL_URL_FIELDS = ['websiteUrl', 'linkedinUrl', 'facebookUrl', 'instagramUrl', 'twitterUrl', 'youtubeUrl', 'workplaceUrl'] as const
type SocialUrlField = typeof SOCIAL_URL_FIELDS[number]

const POST_PLATFORMS = ['twitter', 'instagram', 'youtube', 'facebook', 'linkedin', 'tiktok', 'other'] as const

// Permissive URL check — accept http(s) only, max 500 chars. Empty / non-string
// becomes null. Pattern is intentionally loose so users can paste short URLs.
function normalizeUrl(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim()
  if (!s) return null
  if (!/^https?:\/\/\S+\.\S+/i.test(s)) return null
  return s.slice(0, 500)
}

// Validate + normalise featuredArticles JSON. Returns null if input is empty
// or not an array; trims to max 10 items; each item must have title+url.
// Articles with invalid url or empty title are dropped silently.
function normalizeFeaturedArticles(v: unknown): unknown {
  if (v === null || v === undefined) return null
  if (!Array.isArray(v)) return null
  const out: Array<{ title: string; url: string; source: string | null; year: number | null }> = []
  for (const raw of v.slice(0, 10)) {
    if (!raw || typeof raw !== 'object') continue
    const r = raw as Record<string, unknown>
    const title = typeof r.title === 'string' ? r.title.trim().slice(0, 250) : ''
    const url = normalizeUrl(r.url)
    if (!title || !url) continue
    out.push({
      title, url,
      source: typeof r.source === 'string' && r.source.trim() ? r.source.trim().slice(0, 120) : null,
      year:   typeof r.year   === 'number' && r.year > 1900 && r.year < 2200 ? Math.floor(r.year) : null,
    })
  }
  return out.length > 0 ? out : null
}

// Same shape for featuredPosts.
function normalizeFeaturedPosts(v: unknown): unknown {
  if (v === null || v === undefined) return null
  if (!Array.isArray(v)) return null
  const out: Array<{ platform: string; url: string; caption: string | null }> = []
  for (const raw of v.slice(0, 10)) {
    if (!raw || typeof raw !== 'object') continue
    const r = raw as Record<string, unknown>
    const url = normalizeUrl(r.url)
    if (!url) continue
    const platform = typeof r.platform === 'string' && (POST_PLATFORMS as readonly string[]).includes(r.platform) ? r.platform : 'other'
    out.push({
      platform,
      url,
      caption: typeof r.caption === 'string' && r.caption.trim() ? r.caption.trim().slice(0, 400) : null,
    })
  }
  return out.length > 0 ? out : null
}

function arr(v: unknown): string[] | undefined {
  if (v === undefined) return undefined
  if (Array.isArray(v)) return v.filter((x) => typeof x === 'string')
  if (typeof v === 'string') return v.split(',').map((s) => s.trim()).filter(Boolean)
  return []
}
function num(v: unknown): number | null | undefined {
  if (v === undefined) return undefined
  if (v === null || v === '') return null
  const n = Number(v); return Number.isFinite(n) ? n : null
}

const doctors: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const {
      country, state, district, specialization, q, language, verified, online,
      sort = 'rating', page = '1', limit = '12',
    } = request.query as Record<string, string>
    const pageNum = Number(page) || 1
    const limitNum = Math.min(Number(limit) || 12, 60)
    const where: Record<string, unknown> = {}
    if (country && /^[A-Z]{2}$/.test(country)) where.country = country
    if (state)    where.state    = { contains: state, mode: 'insensitive' }
    if (district) where.district = { contains: district, mode: 'insensitive' }
    if (specialization) where.specialization = { contains: specialization, mode: 'insensitive' }
    if (verified === 'true')  where.ccimVerified = true
    if (verified === 'false') where.ccimVerified = false
    if (online === 'true') where.availableForOnline = true
    if (language) where.languages = { has: language }
    if (q) where.OR = [
      { name:           { contains: q, mode: 'insensitive' } },
      { specialization: { contains: q, mode: 'insensitive' } },
      { profile:        { contains: q, mode: 'insensitive' } },
      { bio:            { contains: q, mode: 'insensitive' } },
      { state:          { contains: q, mode: 'insensitive' } },
    ]

    const orderBy: Record<string, 'asc' | 'desc'> =
      sort === 'experience' ? { experienceYears: 'desc' } :
      sort === 'newest'     ? { createdAt: 'desc' } :
                              { ccimVerified: 'desc' }

    const [items, total] = await Promise.all([
      fastify.prisma.doctor.findMany({
        where,
        include: { reviews: { select: { rating: true } } },
        orderBy: [orderBy, { createdAt: 'desc' }],
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      fastify.prisma.doctor.count({ where }),
    ])

    const enriched = items.map((d) => {
      const ratings = d.reviews.map((r) => r.rating)
      const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null
      // consultationFee is a deprecated DB column — strip from public responses.
      const { consultationFee: _fee, ...rest } = d
      return { ...rest, reviewsCount: ratings.length, averageRating: avg ? Math.round(avg * 10) / 10 : null }
    })

    return {
      doctors: enriched,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    }
  })

  // GET /doctors/countries — country breakdown for the directory pills row.
  // Returns one entry per country that has at least one doctor, sorted by
  // count desc. Used to render an always-visible country-wise filter strip
  // at the top of /doctors so users don't have to open the dropdown.
  fastify.get('/countries', async () => {
    const groups = await fastify.prisma.doctor.groupBy({
      by: ['country'],
      _count: { _all: true },
      orderBy: { _count: { country: 'desc' } },
    })
    return groups.map((g) => ({ code: g.country, count: g._count._all }))
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const doctor = await fastify.prisma.doctor.findUnique({
      where: { id },
      include: {
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    if (!doctor) return reply.code(404).send({ error: 'Doctor not found' })
    const ratings = doctor.reviews.map((r) => r.rating)
    const { consultationFee: _fee, ...rest } = doctor
    return {
      ...rest,
      averageRating: ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null,
      reviewsCount: ratings.length,
    }
  })

  fastify.post('/', { preHandler: fastify.requireAdmin }, async (request) => {
    const body = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    for (const k of STR_FIELDS) {
      if (body[k] === undefined) continue
      if (k === 'country') {
        // Country must be ISO-2; silently coerce invalid → 'IN' default.
        const v = typeof body.country === 'string' && /^[A-Z]{2}$/.test(body.country) ? body.country : 'IN'
        data.country = v
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
      if (k === 'workplace') {
        data.workplace = typeof body.workplace === 'string' && body.workplace.trim() ? body.workplace.trim().slice(0, 200) : null
        continue
      }
      data[k] = body[k] || null
    }
    for (const k of ARR_FIELDS) { const v = arr(body[k]); if (v !== undefined) data[k] = v }
    for (const k of NUM_FIELDS) { const v = num(body[k]); if (v !== undefined) data[k] = v }
    if (body.ccimVerified !== undefined)        data.ccimVerified        = Boolean(body.ccimVerified)
    if (body.availableForOnline !== undefined)  data.availableForOnline  = Boolean(body.availableForOnline)
    if (body.featuredArticles !== undefined)    data.featuredArticles    = normalizeFeaturedArticles(body.featuredArticles) as never
    if (body.featuredPosts !== undefined)       data.featuredPosts       = normalizeFeaturedPosts(body.featuredPosts) as never
    return fastify.prisma.doctor.create({ data: data as never })
  })

  fastify.patch('/:id', { preHandler: fastify.requireAdmin }, async (request) => {
    const { id } = request.params as { id: string }
    const body = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    for (const k of STR_FIELDS) {
      if (body[k] === undefined) continue
      if (k === 'country') {
        // Country must be ISO-2; silently coerce invalid → 'IN' default.
        const v = typeof body.country === 'string' && /^[A-Z]{2}$/.test(body.country) ? body.country : 'IN'
        data.country = v
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
      if (k === 'workplace') {
        data.workplace = typeof body.workplace === 'string' && body.workplace.trim() ? body.workplace.trim().slice(0, 200) : null
        continue
      }
      data[k] = body[k] || null
    }
    for (const k of ARR_FIELDS) { const v = arr(body[k]); if (v !== undefined) data[k] = v }
    for (const k of NUM_FIELDS) { const v = num(body[k]); if (v !== undefined) data[k] = v }
    if (body.ccimVerified !== undefined)        data.ccimVerified        = Boolean(body.ccimVerified)
    if (body.availableForOnline !== undefined)  data.availableForOnline  = Boolean(body.availableForOnline)
    if (body.featuredArticles !== undefined)    data.featuredArticles    = normalizeFeaturedArticles(body.featuredArticles) as never
    if (body.featuredPosts !== undefined)       data.featuredPosts       = normalizeFeaturedPosts(body.featuredPosts) as never

    // Detect a transition to verified=true so we can ping the doctor's owner user.
    const before = await fastify.prisma.doctor.findUnique({ where: { id }, select: { ccimVerified: true } })
    const updated = await fastify.prisma.doctor.update({ where: { id }, data })
    if (before && before.ccimVerified !== updated.ccimVerified) {
      void logAudit(fastify, {
        actorId:    request.session!.user.id,
        action:     updated.ccimVerified ? 'ccim-verify' : 'ccim-unverify',
        targetType: 'Doctor',
        targetId:   id,
        before:     { ccimVerified: before.ccimVerified },
        after:      { ccimVerified: updated.ccimVerified },
        ip:         clientIp(request),
      })
    }
    if (before && !before.ccimVerified && updated.ccimVerified) {
      try {
        const owner = await fastify.prisma.user.findFirst({ where: { doctorId: id }, select: { id: true } })
        if (owner) {
          void createNotification(fastify, {
            userId: owner.id,
            type:   'doctor-verified',
            title:  '🎉 Your verification is approved',
            body:   'Your doctor profile is now publicly visible with the verified badge.',
            link:   `/doctors/${id}`,
          })
          // Promote DOCTOR_PENDING → DOCTOR
          await fastify.prisma.user.update({ where: { id: owner.id }, data: { role: 'DOCTOR' } }).catch(() => null)
        }
      } catch (err) {
        fastify.log.warn({ err }, 'doctor-verified notification failed')
      }
    }
    return updated
  })

  // ─── Moderation endpoints (Phase 9) ──
  // Each maps to one of: approve, decline, request-info, flag, note, reset.
  // POST /doctors/:id/approve         { reason?: string }
  // POST /doctors/:id/decline         { reason: string }
  // POST /doctors/:id/request-info    { reason: string }   reason = what's missing
  // POST /doctors/:id/flag            { reason: string }
  // POST /doctors/:id/note            { note: string }
  // POST /doctors/:id/reset           — moves back to pending
  for (const action of ['approve', 'decline', 'request-info', 'flag', 'note', 'reset'] as const) {
    fastify.post(`/:id/${action}`, { preHandler: fastify.requireAdmin }, async (request, reply) => {
      const { id } = request.params as { id: string }
      const body = (request.body ?? {}) as { reason?: string; note?: string }
      // Required-reason gate for decline / request-info / flag.
      if ((action === 'decline' || action === 'request-info' || action === 'flag') && !body.reason?.trim()) {
        return reply.code(400).send({ error: `${action} requires a reason` })
      }
      if (action === 'note' && !body.note?.trim()) {
        return reply.code(400).send({ error: 'note text required' })
      }
      const result = await moderateRecord(fastify, 'doctor', id, action, {
        adminSession: request.session! as never,
        reason:       body.reason?.trim() ?? null,
        note:         body.note?.trim() ?? null,
        request,
      })
      if (result.ok === false) return reply.code(result.status).send({ error: result.error })
      return result.record
    })
  }

  // Admin-only: pending queue with provenance + owner + completeness score.
  fastify.get('/_admin/queue', { preHandler: fastify.requireAdmin }, async (request) => {
    const { status = 'pending', q } = request.query as Record<string, string>
    const where: Record<string, unknown> = {}
    if (status === 'all') {
      // no filter
    } else if (status) {
      where.moderationStatus = status
    }
    if (q) where.OR = [
      { name:           { contains: q, mode: 'insensitive' } },
      { specialization: { contains: q, mode: 'insensitive' } },
      { district:       { contains: q, mode: 'insensitive' } },
      { tcmcNumber:     { contains: q, mode: 'insensitive' } },
    ]
    const items = await fastify.prisma.doctor.findMany({
      where,
      orderBy: [{ moderationStatus: 'asc' }, { createdAt: 'asc' }],
      take:    100,
      include: {
        ownedBy:        { select: { id: true, email: true, name: true, phone: true, createdAt: true, role: true } },
        lastReviewedBy: { select: { id: true, name: true, email: true } },
      },
    })
    const enriched = items.map((d) => {
      const { consultationFee: _fee, ...rest } = d
      return { ...rest, completeness: completenessScoreDoctor(d as unknown as Record<string, unknown>) }
    })
    return { doctors: enriched, count: items.length }
  })

  fastify.delete('/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const before = await fastify.prisma.doctor.findUnique({
      where: { id },
      select: { id: true, name: true, specialization: true, country: true, district: true, ccimVerified: true },
    })
    await fastify.prisma.doctor.delete({ where: { id } })
    if (before) {
      void logAudit(fastify, {
        actorId:    request.session!.user.id,
        action:     'delete',
        targetType: 'Doctor',
        targetId:   id,
        before:     before as unknown as Record<string, unknown>,
        ip:         clientIp(request),
      })
    }
    return reply.code(204).send()
  })
}

export default doctors
