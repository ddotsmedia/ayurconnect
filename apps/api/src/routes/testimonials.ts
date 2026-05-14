import type { FastifyPluginAsync } from 'fastify'

// CRUD for homepage "Stories of Healing" testimonials. Public GET only returns
// published rows; admin endpoints (preHandler: requireAdmin) can see/edit all.

export const autoPrefix = '/testimonials'

const FIELDS = ['name', 'condition', 'initials', 'quote', 'imageUrl'] as const

function deriveInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((s) => s.charAt(0).toUpperCase()).join('')
}

const testimonials: FastifyPluginAsync = async (fastify) => {
  // Public list — published only, sorted for homepage rendering.
  fastify.get('/', async (request) => {
    const { limit = '12', all } = request.query as Record<string, string>
    const limitNum = Math.min(Number(limit) || 12, 50)
    const where = all ? {} : { published: true }
    const items = await fastify.prisma.testimonial.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: limitNum,
    })
    return { testimonials: items }
  })

  // Admin list — includes drafts.
  fastify.get('/admin', { preHandler: fastify.requireAdmin }, async () => {
    const items = await fastify.prisma.testimonial.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return { testimonials: items }
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const row = await fastify.prisma.testimonial.findUnique({ where: { id } })
    if (!row) return reply.code(404).send({ error: 'Testimonial not found' })
    return row
  })

  fastify.post('/', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const body = request.body as Record<string, unknown>
    const name  = typeof body.name === 'string' ? body.name.trim() : ''
    const quote = typeof body.quote === 'string' ? body.quote.trim() : ''
    if (!name || !quote) return reply.code(400).send({ error: 'name and quote are required' })

    const stars     = clampStars(body.stars)
    const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0
    const published = body.published !== false  // default true

    const data: Record<string, unknown> = {
      name,
      quote,
      stars,
      sortOrder,
      published,
      condition: typeof body.condition === 'string' ? body.condition.trim() || null : null,
      initials:  typeof body.initials  === 'string' && body.initials.trim()
                   ? body.initials.trim().slice(0, 4).toUpperCase()
                   : deriveInitials(name),
      imageUrl:  typeof body.imageUrl  === 'string' ? body.imageUrl.trim() || null : null,
    }
    return reply.code(201).send(await fastify.prisma.testimonial.create({ data: data as never }))
  })

  fastify.patch('/:id', { preHandler: fastify.requireAdmin }, async (request) => {
    const { id } = request.params as { id: string }
    const body = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    for (const k of FIELDS) {
      if (body[k] !== undefined) {
        const v = body[k]
        if (typeof v === 'string') data[k] = v.trim() || (k === 'name' || k === 'quote' ? undefined : null)
        else if (v === null) data[k] = null
      }
    }
    if (body.stars     !== undefined) data.stars     = clampStars(body.stars)
    if (body.sortOrder !== undefined && Number.isFinite(Number(body.sortOrder))) data.sortOrder = Number(body.sortOrder)
    if (typeof body.published === 'boolean') data.published = body.published
    // If name changed and initials were never explicitly set, re-derive.
    if (typeof data.name === 'string' && (body.initials === undefined || body.initials === null || body.initials === '')) {
      data.initials = deriveInitials(data.name as string)
    }
    return fastify.prisma.testimonial.update({ where: { id }, data })
  })

  fastify.delete('/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.testimonial.delete({ where: { id } })
    return reply.code(204).send()
  })
}

function clampStars(v: unknown): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return 5
  return Math.max(1, Math.min(5, Math.round(n)))
}

export default testimonials
