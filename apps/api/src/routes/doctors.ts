import type { FastifyPluginAsync } from 'fastify'
import { createNotification } from '../lib/notify.js'

export const autoPrefix = '/doctors'

const STR_FIELDS = ['name', 'specialization', 'district', 'profile', 'bio', 'qualification', 'photoUrl', 'contact', 'address'] as const
const ARR_FIELDS = ['languages', 'availableDays'] as const
const NUM_FIELDS = ['experienceYears'] as const

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
      district, specialization, q, language, verified, online,
      sort = 'rating', page = '1', limit = '12',
    } = request.query as Record<string, string>
    const pageNum = Number(page) || 1
    const limitNum = Math.min(Number(limit) || 12, 60)
    const where: Record<string, unknown> = {}
    if (district) where.district = { contains: district, mode: 'insensitive' }
    if (specialization) where.specialization = { contains: specialization, mode: 'insensitive' }
    if (verified === 'true')  where.ccimVerified = true
    if (verified === 'false') where.ccimVerified = false
    if (online === 'true') where.availableForOnline = true
    if (language) where.languages = { has: language }
    if (q) where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { specialization: { contains: q, mode: 'insensitive' } },
      { profile: { contains: q, mode: 'insensitive' } },
      { bio: { contains: q, mode: 'insensitive' } },
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
    for (const k of STR_FIELDS) if (body[k] !== undefined) data[k] = body[k] || null
    for (const k of ARR_FIELDS) { const v = arr(body[k]); if (v !== undefined) data[k] = v }
    for (const k of NUM_FIELDS) { const v = num(body[k]); if (v !== undefined) data[k] = v }
    if (body.ccimVerified !== undefined)        data.ccimVerified        = Boolean(body.ccimVerified)
    if (body.availableForOnline !== undefined)  data.availableForOnline  = Boolean(body.availableForOnline)
    return fastify.prisma.doctor.create({ data: data as never })
  })

  fastify.patch('/:id', { preHandler: fastify.requireAdmin }, async (request) => {
    const { id } = request.params as { id: string }
    const body = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    for (const k of STR_FIELDS) if (body[k] !== undefined) data[k] = body[k] || null
    for (const k of ARR_FIELDS) { const v = arr(body[k]); if (v !== undefined) data[k] = v }
    for (const k of NUM_FIELDS) { const v = num(body[k]); if (v !== undefined) data[k] = v }
    if (body.ccimVerified !== undefined)        data.ccimVerified        = Boolean(body.ccimVerified)
    if (body.availableForOnline !== undefined)  data.availableForOnline  = Boolean(body.availableForOnline)

    // Detect a transition to verified=true so we can ping the doctor's owner user.
    const before = await fastify.prisma.doctor.findUnique({ where: { id }, select: { ccimVerified: true } })
    const updated = await fastify.prisma.doctor.update({ where: { id }, data })
    if (before && !before.ccimVerified && updated.ccimVerified) {
      try {
        const owner = await fastify.prisma.user.findFirst({ where: { doctorId: id }, select: { id: true } })
        if (owner) {
          void createNotification(fastify, {
            userId: owner.id,
            type:   'doctor-verified',
            title:  '🎉 Your CCIM verification is approved',
            body:   'Your doctor profile is now publicly visible with the CCIM-verified badge.',
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

  fastify.delete('/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.doctor.delete({ where: { id } })
    return reply.code(204).send()
  })
}

export default doctors
