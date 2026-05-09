import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/articles'

const articles: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const { page = '1', limit = '20', category, language, search } = request.query as Record<string, string>
    const pageNum = Number(page) || 1
    const limitNum = Math.min(Number(limit) || 20, 100)
    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (language) where.language = language
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
      { source: { contains: search, mode: 'insensitive' } },
    ]

    const [items, total] = await Promise.all([
      fastify.prisma.knowledgeArticle.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      fastify.prisma.knowledgeArticle.count({ where }),
    ])
    return { articles: items, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } }
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const article = await fastify.prisma.knowledgeArticle.findUnique({ where: { id } })
    if (!article) return reply.code(404).send({ error: 'Article not found' })
    return article
  })

  fastify.post('/', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const body = request.body as Record<string, string>
    if (!body.title || !body.content || !body.category) {
      return reply.code(400).send({ error: 'title, content, category required' })
    }
    const article = await fastify.prisma.knowledgeArticle.create({
      data: {
        title: body.title,
        content: body.content,
        category: body.category,
        source: body.source,
        language: body.language || 'en',
      },
    })
    return reply.code(201).send(article)
  })

  fastify.patch('/:id', { preHandler: fastify.requireAdmin }, async (request) => {
    const { id } = request.params as { id: string }
    const body = request.body as Record<string, string>
    const data: Record<string, unknown> = {}
    for (const k of ['title', 'content', 'category', 'source', 'language'] as const) {
      if (body[k] !== undefined) data[k] = body[k]
    }
    return fastify.prisma.knowledgeArticle.update({ where: { id }, data })
  })

  fastify.delete('/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.knowledgeArticle.delete({ where: { id } })
    return reply.code(204).send()
  })

  fastify.get('/categories', async () => [
    { id: 'classical-text', name: 'Classical Texts', description: 'Charaka Samhita, Ashtanga Hridayam, Sushruta Samhita' },
    { id: 'research', name: 'Research', description: 'PubMed papers and modern Ayurveda studies' },
    { id: 'seasonal-health', name: 'Seasonal Health', description: 'Ritucharya — seasonal regimens' },
    { id: 'lifestyle', name: 'Lifestyle', description: 'Dinacharya, diet, yoga' },
  ])
}

export default articles
