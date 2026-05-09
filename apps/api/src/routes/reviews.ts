import type { FastifyPluginAsync } from 'fastify'

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
}

export default reviews
