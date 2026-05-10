import type { FastifyPluginAsync } from 'fastify'
import { createNotification } from '../lib/notify.js'
import { moderate } from '../lib/moderation.js'

export const autoPrefix = '/reviews'

const reviews: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', { preHandler: fastify.requireAdmin }, async (request) => {
    const { page = '1', limit = '20' } = request.query as Record<string, string>
    const pageNum = Number(page) || 1
    const limitNum = Math.min(Number(limit) || 20, 100)
    const [items, total] = await Promise.all([
      fastify.prisma.review.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          doctor: { select: { id: true, name: true } },
          hospital: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      fastify.prisma.review.count(),
    ])
    return { reviews: items, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } }
  })

  fastify.delete('/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.review.delete({ where: { id } })
    return reply.code(204).send()
  })

  // ─── Public: signed-in users may post a review for a doctor or hospital ──
  // Body: { doctorId?: string, hospitalId?: string, rating: 1-5, comment?: string }
  // One review per (user, doctor) and (user, hospital) — second submission updates the first.
  fastify.post('/', { preHandler: fastify.requireSession }, async (request, reply) => {
    const userId = request.session!.user.id
    const { doctorId, hospitalId, rating, comment } = request.body as {
      doctorId?: string; hospitalId?: string; rating?: number; comment?: string
    }
    if (!doctorId && !hospitalId) return reply.code(400).send({ error: 'doctorId or hospitalId required' })
    if (doctorId && hospitalId)   return reply.code(400).send({ error: 'review one entity at a time' })
    const r = Number(rating)
    if (!Number.isFinite(r) || r < 1 || r > 5) return reply.code(400).send({ error: 'rating must be 1-5' })

    // ─── AI moderation: block abusive / spam / medical-fraud reviews ─────
    if (typeof comment === 'string' && comment.trim().length > 5) {
      const m = await moderate(comment)
      if (m.blocked) {
        return reply.code(422).send({
          error: 'Review couldn\'t be posted.',
          reason: m.reason,
          verdict: m.verdict,
          code: 'moderation-blocked',
        })
      }
    }

    // Idempotent: if the same user already reviewed the same target, update instead.
    const existing = await fastify.prisma.review.findFirst({
      where: doctorId ? { userId, doctorId } : { userId, hospitalId },
    })

    const data = {
      userId,
      doctorId: doctorId ?? null,
      hospitalId: hospitalId ?? null,
      rating: r,
      comment: typeof comment === 'string' && comment.trim() ? comment.trim().slice(0, 2000) : null,
    }

    const review = existing
      ? await fastify.prisma.review.update({ where: { id: existing.id }, data })
      : await fastify.prisma.review.create({ data })

    // Notify the reviewed entity's owner (if the doctor/hospital has a linked user).
    if (!existing) {
      try {
        if (doctorId) {
          const owner = await fastify.prisma.user.findFirst({ where: { doctorId }, select: { id: true } })
          const doctor = await fastify.prisma.doctor.findUnique({ where: { id: doctorId }, select: { id: true, name: true } })
          if (owner && doctor) {
            void createNotification(fastify, {
              userId: owner.id,
              type:   'review-received',
              title:  `New ${review.rating}★ review on your profile`,
              body:   review.comment ? review.comment.slice(0, 140) : 'A patient left a star rating.',
              link:   `/doctors/${doctor.id}`,
            })
          }
        }
        if (hospitalId) {
          const owner = await fastify.prisma.user.findFirst({ where: { hospitalId }, select: { id: true } })
          const hospital = await fastify.prisma.hospital.findUnique({ where: { id: hospitalId }, select: { id: true, name: true } })
          if (owner && hospital) {
            void createNotification(fastify, {
              userId: owner.id,
              type:   'review-received',
              title:  `New ${review.rating}★ review for ${hospital.name}`,
              body:   review.comment ? review.comment.slice(0, 140) : 'A patient left a star rating.',
              link:   `/hospitals/${hospital.id}`,
            })
          }
        }
      } catch (err) {
        fastify.log.warn({ err }, 'review-received notification failed')
      }
    }

    return { review, action: existing ? 'updated' : 'created' }
  })
}

export default reviews
