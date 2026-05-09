import { createServer, type Server as HttpServer } from 'node:http'
import { Server as SocketIOServer } from 'socket.io'
import type { FastifyInstance } from 'fastify'

export type SocketBundle = {
  http: HttpServer
  io: SocketIOServer
}

export function createSocketServer(fastify: FastifyInstance): SocketBundle {
  const http = createServer()
  const io = new SocketIOServer(http, {
    cors: {
      origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(','),
      credentials: true,
    },
  })

  // Session check via Better Auth on every new connection.
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie ?? ''
      const headers = new Headers({ cookie: cookieHeader })
      const sess = (await fastify.auth.api.getSession({ headers })) as { user?: { id: string } } | null
      if (sess?.user) {
        ;(socket.data as { userId?: string }).userId = sess.user.id
      }
      next()
    } catch (err) {
      fastify.log.warn({ err }, 'socket auth check failed')
      next() // unauthenticated connections allowed for public namespaces
    }
  })

  const forum = io.of('/forum')
  forum.on('connection', (socket) => {
    fastify.log.info({ id: socket.id, userId: socket.data.userId }, 'forum socket connected')
    socket.on('ping', (cb) => typeof cb === 'function' && cb('pong'))
  })

  const consult = io.of('/consult')
  consult.on('connection', (socket) => {
    fastify.log.info({ id: socket.id, userId: socket.data.userId }, 'consult socket connected (Phase 3 stub)')
    socket.on('ping', (cb) => typeof cb === 'function' && cb('pong'))
  })

  return { http, io }
}
