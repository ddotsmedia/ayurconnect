import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/admin/consultation-requests'

// Admin CRM for the public /online-consultation callback form.
// Sister public POST endpoint: routes/consultation.ts.

const VALID_STATUSES = new Set(['NEW', 'CONTACTED', 'MATCHED', 'CLOSED'])

const route: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireAdmin)

  fastify.get('/', async (request) => {
    const { status, q, limit = '200' } = request.query as Record<string, string>
    const take = Math.min(Number(limit) || 200, 500)
    const where: Record<string, unknown> = {}
    if (status && VALID_STATUSES.has(status)) where.status = status
    if (q) where.OR = [
      { name:    { contains: q, mode: 'insensitive' } },
      { phone:   { contains: q, mode: 'insensitive' } },
      { concern: { contains: q, mode: 'insensitive' } },
    ]
    const [items, total, byStatus] = await Promise.all([
      fastify.prisma.consultationRequest.findMany({ where, orderBy: { createdAt: 'desc' }, take }),
      fastify.prisma.consultationRequest.count({ where }),
      fastify.prisma.consultationRequest.groupBy({ by: ['status'], _count: { _all: true } }),
    ])
    return {
      items,
      total,
      summary: { byStatus: Object.fromEntries(byStatus.map((g) => [g.status, g._count._all])) },
    }
  })

  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = (request.body ?? {}) as { status?: string; adminNotes?: string | null }
    const data: Record<string, unknown> = {}
    if (body.status !== undefined) {
      if (!VALID_STATUSES.has(body.status)) return reply.code(400).send({ error: 'invalid status' })
      data.status = body.status
    }
    if (body.adminNotes !== undefined) {
      data.adminNotes = body.adminNotes ? String(body.adminNotes).slice(0, 4000) : null
    }
    if (Object.keys(data).length === 0) return reply.code(400).send({ error: 'no edits' })
    const updated = await fastify.prisma.consultationRequest.update({ where: { id }, data })
    return { item: updated }
  })

  fastify.delete('/:id', async (request) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.consultationRequest.delete({ where: { id } })
    return { ok: true }
  })
}

export default route
