// Student study community — threads + replies, filterable by subject,
// upvote toggle (best-effort, no Upvote join table — we just inc the counter
// and trust the optimistic UI).
//
// GET    /api/study-community/threads
// POST   /api/study-community/threads
// GET    /api/study-community/threads/:id
// POST   /api/study-community/threads/:id/replies
// POST   /api/study-community/threads/:id/upvote
// POST   /api/study-community/replies/:id/upvote
// POST   /api/study-community/replies/:id/accept

import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/study-community'

const CATEGORIES = ['doubt', 'discussion', 'resource', 'tip'] as const

const route: FastifyPluginAsync = async (fastify) => {
  // List — public read
  fastify.get('/threads', async (request) => {
    const q = request.query as { subject?: string; category?: string; sort?: string; limit?: string }
    const where: Record<string, unknown> = {}
    if (q.subject)  where.subjectSlug = q.subject
    if (q.category) where.category    = q.category
    const orderBy = q.sort === 'popular' ? { upvoteCount: 'desc' as const } : { createdAt: 'desc' as const }
    const items = await fastify.prisma.studyThread.findMany({
      where, orderBy, take: Math.min(50, Math.max(1, parseInt(q.limit ?? '20', 10))),
      include: { author: { select: { name: true } } },
    })
    return { items }
  })

  // Thread detail — public read
  fastify.get('/threads/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const thread = await fastify.prisma.studyThread.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        replies: { orderBy: [{ isAccepted: 'desc' }, { upvoteCount: 'desc' }, { createdAt: 'asc' }], include: { author: { select: { id: true, name: true } } } },
      },
    })
    if (!thread) return reply.code(404).send({ error: 'not found' })
    return thread
  })

  // Authenticated mutations
  fastify.register(async (sub) => {
    sub.addHook('preHandler', fastify.requireSession)

    sub.post('/threads', async (request, reply) => {
      const userId = request.session!.user.id
      const b = request.body as Record<string, unknown>
      const title   = String(b.title ?? '').trim()
      const content = String(b.content ?? '').trim()
      if (!title || !content || content.length < 10) return reply.code(400).send({ error: 'title + content (10+ chars) required' })
      const category = typeof b.category === 'string' && CATEGORIES.includes(b.category as typeof CATEGORIES[number]) ? b.category : 'discussion'
      const subjectSlug = typeof b.subjectSlug === 'string' ? b.subjectSlug.slice(0, 60).trim() : null
      const row = await fastify.prisma.studyThread.create({
        data: { userId, title: title.slice(0, 200), content: content.slice(0, 8000), category, subjectSlug },
      })
      return row
    })

    sub.post('/threads/:id/replies', async (request, reply) => {
      const userId = request.session!.user.id
      const { id } = request.params as { id: string }
      const b = request.body as Record<string, unknown>
      const content = String(b.content ?? '').trim()
      if (!content || content.length < 5) return reply.code(400).send({ error: 'content (5+ chars) required' })
      const r = await fastify.prisma.studyReply.create({
        data: { threadId: id, userId, content: content.slice(0, 5000) },
      })
      await fastify.prisma.studyThread.update({ where: { id }, data: { replyCount: { increment: 1 } } })
      return r
    })

    sub.post('/threads/:id/upvote', async (request) => {
      const { id } = request.params as { id: string }
      await fastify.prisma.studyThread.update({ where: { id }, data: { upvoteCount: { increment: 1 } } })
      return { ok: true }
    })

    sub.post('/replies/:id/upvote', async (request) => {
      const { id } = request.params as { id: string }
      await fastify.prisma.studyReply.update({ where: { id }, data: { upvoteCount: { increment: 1 } } })
      return { ok: true }
    })

    sub.post('/replies/:id/accept', async (request, reply) => {
      const userId = request.session!.user.id
      const { id } = request.params as { id: string }
      const r = await fastify.prisma.studyReply.findUnique({ where: { id }, include: { thread: true } })
      if (!r) return reply.code(404).send({ error: 'not found' })
      if (r.thread.userId !== userId) return reply.code(403).send({ error: 'only the thread author can accept' })
      await fastify.prisma.studyReply.updateMany({ where: { threadId: r.threadId }, data: { isAccepted: false } })
      const updated = await fastify.prisma.studyReply.update({ where: { id }, data: { isAccepted: true } })
      return updated
    })
  })
}

export default route
