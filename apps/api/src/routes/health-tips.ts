import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/health-tips'

const FIELDS = ['title', 'content', 'dosha', 'season', 'language'] as const
const VALID_DOSHA = ['vata', 'pitta', 'kapha', 'tridosha']
const VALID_SEASON = ['varsha', 'grishma', 'vasantha', 'sharad', 'hemanta', 'shishira']

const healthTips: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const { dosha, season, language, page = '1', limit = '12', search } = request.query as Record<string, string>
    const pageNum = Number(page) || 1
    const limitNum = Math.min(Number(limit) || 12, 100)
    const where: Record<string, unknown> = {}
    if (dosha) where.dosha = dosha
    if (season) where.season = season
    if (language) where.language = language
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ]

    const [items, total] = await Promise.all([
      fastify.prisma.healthTip.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      fastify.prisma.healthTip.count({ where }),
    ])
    return { tips: items, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } }
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const tip = await fastify.prisma.healthTip.findUnique({ where: { id } })
    if (!tip) return reply.code(404).send({ error: 'Tip not found' })
    return tip
  })

  fastify.post('/', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const body = request.body as Record<string, string>
    if (!body.title || !body.content || !body.dosha) {
      return reply.code(400).send({ error: 'title, content, dosha required' })
    }
    if (!VALID_DOSHA.includes(body.dosha)) {
      return reply.code(400).send({ error: `dosha must be one of ${VALID_DOSHA.join(', ')}` })
    }
    if (body.season && !VALID_SEASON.includes(body.season)) {
      return reply.code(400).send({ error: `season must be one of ${VALID_SEASON.join(', ')}` })
    }
    const data: Record<string, unknown> = {}
    for (const k of FIELDS) if (body[k] !== undefined) data[k] = body[k] || null
    return reply.code(201).send(await fastify.prisma.healthTip.create({ data: { ...data, title: body.title, content: body.content, dosha: body.dosha } }))
  })

  fastify.patch('/:id', { preHandler: fastify.requireAdmin }, async (request) => {
    const { id } = request.params as { id: string }
    const body = request.body as Record<string, string>
    const data: Record<string, unknown> = {}
    for (const k of FIELDS) if (body[k] !== undefined) data[k] = body[k] || null
    return fastify.prisma.healthTip.update({ where: { id }, data })
  })

  fastify.delete('/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.healthTip.delete({ where: { id } })
    return reply.code(204).send()
  })
}

export default healthTips
