// Public read endpoints for article taxonomy + view-counter increments +
// like/share counters. Lightweight; no per-visitor uniqueness tracking
// — the spec explicitly asks to keep this simple.

import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/article-categories'

const route: FastifyPluginAsync = async (fastify) => {
  // Public list — only isActive=true, sorted
  fastify.get('/', async () => {
    const items = await fastify.prisma.articleCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, slug: true, name: true, nameMl: true, description: true, descriptionMl: true, icon: true, color: true, articleCount: true },
    })
    return { items }
  })

  // Single by slug
  fastify.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string }
    const cat = await fastify.prisma.articleCategory.findUnique({ where: { slug } })
    if (!cat || !cat.isActive) return reply.code(404).send({ error: 'not found' })
    return { item: cat }
  })

  // Increment view count for an article. Endpoint mirrored under /articles/:id/view.
  fastify.post('/articles/:id/view', async (request) => {
    const { id } = request.params as { id: string }
    const a = await fastify.prisma.knowledgeArticle.update({
      where: { id },
      data:  { viewCount: { increment: 1 } },
      select: { viewCount: true },
    }).catch(() => null)
    return { viewCount: a?.viewCount ?? null }
  })

  // Like
  fastify.post('/articles/:id/like', async (request) => {
    const { id } = request.params as { id: string }
    const a = await fastify.prisma.knowledgeArticle.update({
      where: { id }, data: { likeCount: { increment: 1 } }, select: { likeCount: true },
    }).catch(() => null)
    return { likeCount: a?.likeCount ?? null }
  })

  // Share
  fastify.post('/articles/:id/share', async (request) => {
    const { id } = request.params as { id: string }
    const a = await fastify.prisma.knowledgeArticle.update({
      where: { id }, data: { shareCount: { increment: 1 } }, select: { shareCount: true },
    }).catch(() => null)
    return { shareCount: a?.shareCount ?? null }
  })
}

export default route
