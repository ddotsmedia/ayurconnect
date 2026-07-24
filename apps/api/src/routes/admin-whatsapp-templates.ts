// Admin CRUD for WhatsAppMessageTemplate. Gated by fastify.requireAdmin
// (same hook pattern as the other /admin/* routes).

import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/admin/whatsapp-templates'

const ALLOWED_CONTEXTS = new Set(['doctor', 'hospital'])
const MAX_TEXT_LEN = 500

const route: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireAdmin)

  // List — all templates, grouped in caller (admin UI groups by context).
  fastify.get('/', async () => {
    const items = await fastify.prisma.whatsAppMessageTemplate.findMany({
      orderBy: [{ context: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    })
    return { items, count: items.length }
  })

  // Create
  fastify.post('/', async (request, reply) => {
    const body = request.body as Record<string, unknown>
    const context = String(body.context ?? '').trim()
    const text    = String(body.text ?? '').trim()
    if (!ALLOWED_CONTEXTS.has(context)) {
      return reply.code(400).send({ error: 'context must be "doctor" or "hospital"' })
    }
    if (!text) return reply.code(400).send({ error: 'text required' })
    const sortOrder = typeof body.sortOrder === 'number' ? body.sortOrder : 100
    const item = await fastify.prisma.whatsAppMessageTemplate.create({
      data: { context, text: text.slice(0, MAX_TEXT_LEN), sortOrder },
    })
    return { item }
  })

  // Update
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    if (typeof body.context === 'string') {
      const c = body.context.trim()
      if (!ALLOWED_CONTEXTS.has(c)) {
        return reply.code(400).send({ error: 'context must be "doctor" or "hospital"' })
      }
      data.context = c
    }
    if (typeof body.text === 'string') {
      const t = body.text.trim()
      if (!t) return reply.code(400).send({ error: 'text cannot be empty' })
      data.text = t.slice(0, MAX_TEXT_LEN)
    }
    if (typeof body.sortOrder === 'number') data.sortOrder = body.sortOrder
    try {
      const item = await fastify.prisma.whatsAppMessageTemplate.update({ where: { id }, data })
      return { item }
    } catch {
      return reply.code(404).send({ error: 'not found' })
    }
  })

  // Delete — hard delete, templates are UX copy and safe to remove.
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      await fastify.prisma.whatsAppMessageTemplate.delete({ where: { id } })
      return { deleted: true }
    } catch {
      return reply.code(404).send({ error: 'not found' })
    }
  })
}

export default route
