import 'dotenv/config'
import Fastify from 'fastify'
import { app } from './app.js'
import { createSocketServer } from './socket.js'
import { forwardToBetterAuth } from './plugins/auth.js'

const server = Fastify({ logger: true })

// Register the /auth/* hook BEFORE registering app (must be before ready/listen).
// server.auth is resolved lazily inside the hook, after register(app) sets the decorator.
const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:4100'
server.addHook('onRequest', async (request, reply) => {
  if (!request.url.startsWith('/auth/') && request.url !== '/auth') return
  await forwardToBetterAuth(server.auth, request, reply, baseURL)
})

await server.register(app)
await server.ready()

server.log.info('--- ROUTES ---\n' + server.printRoutes({ commonPrefix: false }))

const port = Number(process.env.PORT ?? 4000)
const host = process.env.HOST ?? '0.0.0.0'
const socketPort = Number(process.env.SOCKET_PORT ?? 4001)

try {
  await server.listen({ port, host })
  server.log.info(`Fastify listening on http://${host}:${port}`)

  const { http } = createSocketServer(server)
  await new Promise<void>((resolve) => http.listen(socketPort, host, resolve))
  server.log.info(`Socket.io listening on http://${host}:${socketPort}`)
} catch (error) {
  server.log.error(error)
  process.exit(1)
}
