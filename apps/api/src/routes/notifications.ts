import type { FastifyPluginAsync } from 'fastify'
import { subscribe, startHeartbeat } from '../lib/notify.js'

export const autoPrefix = '/me/notifications'

const notifications: FastifyPluginAsync = async (fastify) => {
  startHeartbeat()

  // GET /me/notifications — recent 20 + unread count.
  fastify.get('/', { preHandler: fastify.requireSession }, async (request) => {
    const userId = request.session!.user.id
    const [items, unread] = await Promise.all([
      fastify.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      fastify.prisma.notification.count({ where: { userId, read: false } }),
    ])
    return { items, unread }
  })

  // PATCH /me/notifications/:id/read
  fastify.patch('/:id/read', { preHandler: fastify.requireSession }, async (request, reply) => {
    const userId = request.session!.user.id
    const { id } = request.params as { id: string }
    const n = await fastify.prisma.notification.findFirst({ where: { id, userId } })
    if (!n) return reply.code(404).send({ error: 'not found' })
    return fastify.prisma.notification.update({ where: { id }, data: { read: true } })
  })

  // PATCH /me/notifications/read-all
  fastify.patch('/read-all', { preHandler: fastify.requireSession }, async (request) => {
    const userId = request.session!.user.id
    const r = await fastify.prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } })
    return { updated: r.count }
  })

  // GET /me/notifications/stream — SSE long-poll. Browser EventSource keeps it open;
  // we fan out new notifications via lib/notify.ts.
  fastify.get('/stream', { preHandler: fastify.requireSession }, async (request, reply) => {
    const userId = request.session!.user.id

    reply.raw.writeHead(200, {
      'content-type':   'text/event-stream; charset=utf-8',
      'cache-control':  'no-cache, no-transform',
      'connection':     'keep-alive',
      'x-accel-buffering': 'no',
    })
    reply.raw.write(`event: hello\ndata: ${JSON.stringify({ ok: true, ts: Date.now() })}\n\n`)

    const unsub = subscribe(userId, reply)
    request.raw.on('close', () => {
      unsub()
      try { reply.raw.end() } catch { /* noop */ }
    })

    // Hold the response open. Fastify needs us to return a never-resolving
    // promise so the request-lifecycle doesn't conclude.
    return new Promise<never>(() => { /* held open */ })
  })
}

export default notifications
