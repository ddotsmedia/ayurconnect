import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/saved-doctors'

const route: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireSession)

  fastify.get('/', async (request) => {
    const userId = request.session!.user.id
    const items = await fastify.prisma.savedDoctor.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { doctor: { include: { reviews: { select: { rating: true } } } } },
    })
    return items.map((s) => {
      const ratings = s.doctor.reviews.map((r) => r.rating)
      const avg = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null
      return {
        id: s.id,
        savedAt: s.createdAt,
        doctor: { ...s.doctor, averageRating: avg, reviewsCount: ratings.length, reviews: undefined },
      }
    })
  })

  fastify.post('/:doctorId', async (request, reply) => {
    const userId = request.session!.user.id
    const { doctorId } = request.params as { doctorId: string }
    try {
      const saved = await fastify.prisma.savedDoctor.create({ data: { userId, doctorId } })
      return reply.code(201).send(saved)
    } catch {
      return reply.code(409).send({ error: 'already saved' })
    }
  })

  fastify.delete('/:doctorId', async (request, reply) => {
    const userId = request.session!.user.id
    const { doctorId } = request.params as { doctorId: string }
    await fastify.prisma.savedDoctor.deleteMany({ where: { userId, doctorId } })
    return reply.code(204).send()
  })
}

export default route
