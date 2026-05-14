// Wellness programs — Ayushakti-style structured multi-week journeys.
//
// Public:
//   GET /programs                   — published catalogue
//   GET /programs/:slug             — single program with day list
// Authenticated (patient):
//   GET    /programs/me             — my enrollments
//   POST   /programs/:slug/enroll   — enroll
//   POST   /programs/:slug/check-in — mark today's day complete

import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/programs'

const programs: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const { category, dosha } = request.query as Record<string, string>
    const where: Record<string, unknown> = { published: true }
    if (category) where.category = category
    if (dosha)    where.dosha    = dosha
    const items = await fastify.prisma.wellnessProgram.findMany({
      where,
      orderBy: [{ category: 'asc' }, { durationDays: 'asc' }],
      include: { _count: { select: { days: true, enrollments: true } } },
    })
    return { programs: items }
  })

  fastify.get('/me', { preHandler: fastify.requireSession }, async (request) => {
    const userId = request.session!.user.id
    const enrollments = await fastify.prisma.programEnrollment.findMany({
      where:   { userId },
      include: { program: { select: { id: true, slug: true, name: true, tagline: true, durationDays: true, heroEmoji: true, heroColor: true } } },
      orderBy: { startedAt: 'desc' },
    })
    return { enrollments }
  })

  fastify.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string }
    const program = await fastify.prisma.wellnessProgram.findUnique({
      where:   { slug },
      include: { days: { orderBy: { dayNumber: 'asc' } } },
    })
    if (!program || !program.published) return reply.code(404).send({ error: 'not found' })
    return program
  })

  fastify.post('/:slug/enroll', { preHandler: fastify.requireSession }, async (request, reply) => {
    const userId = request.session!.user.id
    const { slug } = request.params as { slug: string }
    const program = await fastify.prisma.wellnessProgram.findUnique({ where: { slug }, select: { id: true, published: true } })
    if (!program || !program.published) return reply.code(404).send({ error: 'program not found' })
    // Idempotent — upsert returns existing if user already enrolled.
    const enrollment = await fastify.prisma.programEnrollment.upsert({
      where:  { userId_programId: { userId, programId: program.id } },
      create: { userId, programId: program.id, status: 'active', currentDay: 1, completedDays: [] },
      update: { status: 'active' },
    })
    return enrollment
  })

  fastify.post('/:slug/check-in', { preHandler: fastify.requireSession }, async (request, reply) => {
    const userId = request.session!.user.id
    const { slug } = request.params as { slug: string }
    const { day } = request.body as { day?: number }

    const program = await fastify.prisma.wellnessProgram.findUnique({ where: { slug }, select: { id: true, durationDays: true } })
    if (!program) return reply.code(404).send({ error: 'program not found' })
    const enrollment = await fastify.prisma.programEnrollment.findUnique({ where: { userId_programId: { userId, programId: program.id } } })
    if (!enrollment) return reply.code(400).send({ error: 'not enrolled' })

    const targetDay = typeof day === 'number' && day > 0 && day <= program.durationDays ? day : enrollment.currentDay
    const completed = Array.from(new Set([...enrollment.completedDays, targetDay])).sort((a, b) => a - b)
    const nextCurrent = Math.min(targetDay + 1, program.durationDays)
    const allDone = completed.length >= program.durationDays
    return fastify.prisma.programEnrollment.update({
      where: { id: enrollment.id },
      data:  {
        completedDays: completed,
        currentDay:    nextCurrent,
        status:        allDone ? 'completed' : 'active',
        completedAt:   allDone ? new Date() : null,
      },
    })
  })
}

export default programs
