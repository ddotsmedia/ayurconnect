// CME tracker — list / add / delete for the authenticated user.
// Built on the existing CmeCredit model. The brief asked for fields
// (eventName/organizer/date/category/notes/certificateUrl/isVerified) that
// overlap with existing columns:
//   description ≈ eventName  ·  source ≈ category
//   credits     ≈ creditsEarned  ·  earnedAt ≈ date
//   sourceRefId ≈ certificateUrl  ·  certificateId ≈ admin-issued cert id
// No schema migration; reuse fields. Extra org/notes packed into description.

import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/cme'

const CATEGORIES = ['conference', 'workshop', 'webinar', 'online_course', 'publication', 'other'] as const

const route: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireSession)

  fastify.get('/', async (request) => {
    const userId = request.session!.user.id
    const items = await fastify.prisma.cmeCredit.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
      take: 200,
    })
    const totalCredits = items.reduce((a, c) => a + (c.credits ?? 0), 0)
    const year = new Date().getUTCFullYear()
    const thisYear = items.filter((i) => new Date(i.earnedAt).getUTCFullYear() === year).reduce((a, c) => a + (c.credits ?? 0), 0)
    return { items, totalCredits, thisYearCredits: thisYear, eventsAttended: items.length }
  })

  fastify.post('/', async (request, reply) => {
    const userId = request.session!.user.id
    const b = request.body as Record<string, unknown>
    const eventName = String(b.eventName ?? '').trim()
    const credits   = Number(b.credits ?? 0)
    if (!eventName || !Number.isFinite(credits) || credits < 0) return reply.code(400).send({ error: 'eventName + credits required' })
    const category = typeof b.category === 'string' && CATEGORIES.includes(b.category as typeof CATEGORIES[number]) ? b.category : 'other'
    const organizer = typeof b.organizer === 'string' ? b.organizer.slice(0, 200).trim() : ''
    const notes     = typeof b.notes     === 'string' ? b.notes.slice(0, 1000).trim()    : ''
    const certificateUrl = typeof b.certificateUrl === 'string' ? b.certificateUrl.slice(0, 500).trim() : null
    const dateStr   = typeof b.date === 'string' ? b.date.trim() : ''
    const earnedAt  = dateStr ? new Date(dateStr) : new Date()

    const description = [
      eventName.slice(0, 200),
      organizer ? `Organizer: ${organizer}` : '',
      notes     ? `Notes: ${notes}`         : '',
    ].filter(Boolean).join(' — ').slice(0, 1500)

    const row = await fastify.prisma.cmeCredit.create({
      data: { userId, source: category, sourceRefId: certificateUrl, credits, description, earnedAt },
    })
    return row
  })

  fastify.delete('/:id', async (request, reply) => {
    const userId = request.session!.user.id
    const { id } = request.params as { id: string }
    const row = await fastify.prisma.cmeCredit.findUnique({ where: { id } })
    if (!row || row.userId !== userId) return reply.code(404).send({ error: 'not found' })
    await fastify.prisma.cmeCredit.delete({ where: { id } })
    return reply.code(204).send()
  })
}

export default route
