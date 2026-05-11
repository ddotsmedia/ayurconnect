import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/admin/leads'

// Admin-only triage of submissions from the public lead-capture pages
// (cost estimator, contact, partnership). The public POST endpoint lives in
// routes/leads.ts.

const VALID_STATUSES = new Set(['new', 'contacted', 'closed', 'spam'])

const route: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireAdmin)

  fastify.get('/', async (request) => {
    const { kind, status, q, page = '1', limit = '50' } = request.query as Record<string, string>
    const pageNum = Number(page) || 1
    const limitNum = Math.min(Number(limit) || 50, 200)

    const where: Record<string, unknown> = {}
    if (kind) where.kind = kind
    if (status) where.status = status
    if (q) where.OR = [
      { name:    { contains: q, mode: 'insensitive' } },
      { email:   { contains: q, mode: 'insensitive' } },
      { subject: { contains: q, mode: 'insensitive' } },
      { message: { contains: q, mode: 'insensitive' } },
    ]

    const [items, total, byKind, byStatus] = await Promise.all([
      fastify.prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      fastify.prisma.lead.count({ where }),
      fastify.prisma.lead.groupBy({ by: ['kind'],   _count: { _all: true } }),
      fastify.prisma.lead.groupBy({ by: ['status'], _count: { _all: true } }),
    ])

    return {
      items,
      total,
      page: pageNum,
      limit: limitNum,
      summary: {
        byKind:   Object.fromEntries(byKind.map((g)   => [g.kind,   g._count._all])),
        byStatus: Object.fromEntries(byStatus.map((g) => [g.status, g._count._all])),
      },
    }
  })

  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = request.body as { status?: string }
    if (!body.status || !VALID_STATUSES.has(body.status)) {
      return reply.code(400).send({ error: `status must be one of ${[...VALID_STATUSES].join(', ')}` })
    }
    const updated = await fastify.prisma.lead.update({
      where: { id },
      data:  { status: body.status },
    })
    return { lead: updated }
  })

  fastify.delete('/:id', async (request) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.lead.delete({ where: { id } })
    return { ok: true }
  })
}

export default route
