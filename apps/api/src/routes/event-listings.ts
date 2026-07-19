import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/event-listings'

// Public read endpoints for admin-managed EventListing rows.
// Kept on a separate prefix (/event-listings) so it doesn't collide with the
// analytics tracker at /events (POST / — page-view emitter).
//
//   GET /event-listings            → published events with filters
//   GET /event-listings/:id        → single event (published only for public)

const ALLOWED_CATEGORY = new Set(['seminar', 'workshop', 'job-fair', 'consultation', 'other'])

const route: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const q = request.query as { category?: string; location?: string; past?: string; limit?: string; upcoming?: string }
    const where: Record<string, unknown> = { isPublished: true }
    if (q.category && ALLOWED_CATEGORY.has(q.category)) where.category = q.category
    if (q.location) where.location = { contains: q.location, mode: 'insensitive' }
    // Default: upcoming (eventDate >= now). ?past=1 flips to past events.
    // ?upcoming=true is accepted as a no-op — it matches the default.
    const now = new Date()
    if (q.past === '1' || q.past === 'true') {
      where.eventDate = { lt: now }
    } else {
      where.eventDate = { gte: now }
    }
    const items = await fastify.prisma.eventListing.findMany({
      where,
      orderBy: { eventDate: q.past ? 'desc' : 'asc' },
      take:    Math.min(Number(q.limit) || 60, 200),
    })
    return { items, count: items.length }
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const ev = await fastify.prisma.eventListing.findUnique({ where: { id } })
    if (!ev || !ev.isPublished) return reply.code(404).send({ error: 'event not found' })
    return ev
  })
}

export default route
