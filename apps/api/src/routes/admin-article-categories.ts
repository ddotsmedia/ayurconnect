// Admin CRUD for ArticleCategory. Gated by fastify.requireAdmin (same hook
// pattern as the other /admin/* routes).

import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/admin/article-categories'

const slugify = (s: string) => s.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'category'

const route: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireAdmin)

  // List
  fastify.get('/', async () => {
    const items = await fastify.prisma.articleCategory.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] })
    return { items, count: items.length }
  })

  // Create
  fastify.post('/', async (request, reply) => {
    const body = request.body as Record<string, unknown>
    const name = String(body.name ?? '').trim()
    if (!name) return reply.code(400).send({ error: 'name required' })
    const slug = String(body.slug ?? slugify(name))
    const optStr = (k: string, cap = 1000) => typeof body[k] === 'string' ? (body[k] as string).slice(0, cap) : null
    try {
      const cat = await fastify.prisma.articleCategory.create({
        data: {
          slug,
          name:        name.slice(0, 100),
          nameMl:      optStr('nameMl', 100),
          description: optStr('description', 1000),
          descriptionMl: optStr('descriptionMl', 1000),
          icon:        optStr('icon', 50),
          color:       optStr('color', 16),
          sortOrder:   typeof body.sortOrder === 'number' ? body.sortOrder : 100,
          isActive:    body.isActive !== false,
        },
      })
      return { item: cat }
    } catch (e) {
      return reply.code(400).send({ error: `slug must be unique: ${slug}` })
    }
  })

  // Update
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    const setStr = (k: string, cap = 1000) => { if (typeof body[k] === 'string') data[k] = (body[k] as string).slice(0, cap) }
    if (typeof body.name === 'string')      data.name = body.name.trim().slice(0, 100)
    setStr('nameMl', 100); setStr('description', 1000); setStr('descriptionMl', 1000)
    setStr('icon', 50); setStr('color', 16); setStr('slug', 80)
    if (typeof body.sortOrder === 'number') data.sortOrder = body.sortOrder
    if (typeof body.isActive  === 'boolean') data.isActive  = body.isActive
    try {
      const cat = await fastify.prisma.articleCategory.update({ where: { id }, data })
      return { item: cat }
    } catch { return reply.code(404).send({ error: 'not found or slug conflict' }) }
  })

  // Soft delete (set isActive=false). Hard delete forbidden if articles exist.
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const count = await fastify.prisma.knowledgeArticle.count({ where: { categoryId: id } })
    if (count > 0) {
      await fastify.prisma.articleCategory.update({ where: { id }, data: { isActive: false } })
      return { deactivated: true, articleCount: count }
    }
    await fastify.prisma.articleCategory.delete({ where: { id } })
    return { deleted: true }
  })

  // Refresh denormalised counts
  fastify.post('/refresh-counts', async () => {
    const cats = await fastify.prisma.articleCategory.findMany({ select: { id: true } })
    let updated = 0
    for (const c of cats) {
      const n = await fastify.prisma.knowledgeArticle.count({ where: { categoryId: c.id } })
      await fastify.prisma.articleCategory.update({ where: { id: c.id }, data: { articleCount: n } })
      updated++
    }
    return { updated }
  })
}

export default route
