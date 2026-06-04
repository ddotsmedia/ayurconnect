import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/seminars'

const route: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const q = request.query as Record<string, string | undefined>
    const tab = q.tab === 'past' ? 'past' : 'upcoming'
    const now = new Date()
    const where = tab === 'upcoming'
      ? { status: { in: ['upcoming', 'live'] }, scheduledFor: { gte: new Date(now.getTime() - 60 * 60_000) } }
      : { OR: [{ status: 'completed' }, { scheduledFor: { lt: now } }] }
    const items = await fastify.prisma.webinar.findMany({
      where, take: 60,
      orderBy: { scheduledFor: tab === 'upcoming' ? 'asc' : 'desc' },
      select: {
        id: true, slug: true, title: true, description: true, speakerName: true,
        scheduledFor: true, durationMin: true, cmeCredits: true, status: true,
        recordingUrl: true, thumbnailUrl: true, specialty: true, topics: true,
      },
    })
    return { seminars: items, tab }
  })
}

export default route
