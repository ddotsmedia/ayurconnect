// Ayurveda formulary — searchable catalogue of classical compound medicines
// (Yogaraj Guggulu, Triphala Choornam, etc.). Distinct from /herbs (which is
// raw materia medica). Inspired by NirogStreet / Practo's medicine index.

import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/formulations'

const formulary: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const { category, q, dosha, page = '1', limit = '30' } = request.query as Record<string, string>
    const pageNum = Number(page) || 1
    const limitNum = Math.min(Number(limit) || 30, 100)
    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (dosha)    where.doshaImpact = { contains: dosha, mode: 'insensitive' }
    if (q) where.OR = [
      { name:         { contains: q, mode: 'insensitive' } },
      { sanskritName: { contains: q, mode: 'insensitive' } },
      { description:  { contains: q, mode: 'insensitive' } },
      { primaryUses:  { has: q } },
    ]
    const [items, total] = await Promise.all([
      fastify.prisma.ayurvedaFormulation.findMany({
        where,
        orderBy: { name: 'asc' },
        skip:    (pageNum - 1) * limitNum,
        take:    limitNum,
      }),
      fastify.prisma.ayurvedaFormulation.count({ where }),
    ])
    return { formulations: items, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } }
  })

  fastify.get('/categories', async () => {
    const groups = await fastify.prisma.ayurvedaFormulation.groupBy({
      by:     ['category'],
      _count: { _all: true },
    })
    return groups.map((g) => ({ id: g.category, count: g._count._all }))
  })

  fastify.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string }
    const f = await fastify.prisma.ayurvedaFormulation.findUnique({ where: { slug } })
    if (!f) return reply.code(404).send({ error: 'not found' })
    return f
  })
}

export default formulary
