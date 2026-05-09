import fp from 'fastify-plugin'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import type { FastifyReply, FastifyRequest } from 'fastify'

type AuthSession = {
  user: { id: string; email: string; name: string | null; role: string }
  session: { id: string; userId: string; expiresAt: Date }
}

// Better Auth's inferred return type narrows to the literal config object, which
// then fails to satisfy its own internal PluginContext<BetterAuthOptions>. We
// only need duck-typed access (`auth.handler`, `auth.api.getSession`), so use a
// permissive interface and cast at construction time.
export type AuthInstance = {
  handler: (req: Request) => Promise<Response>
  api: { getSession: (opts: { headers: Headers }) => Promise<unknown> }
}

declare module 'fastify' {
  interface FastifyInstance {
    auth: AuthInstance
    requireSession: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
    requireAdmin: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
  interface FastifyRequest {
    session?: AuthSession
  }
}

export default fp(async (fastify) => {
  const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:4100'
  const trusted = (process.env.CORS_ORIGIN ?? 'http://localhost:3100')
    .split(',')
    .map((s) => s.trim())

  const auth = betterAuth({
    database: prismaAdapter(fastify.prisma, { provider: 'postgresql' }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL,
    basePath: '/auth',
    trustedOrigins: trusted,
    emailAndPassword: { enabled: true, autoSignIn: true },
    user: {
      additionalFields: {
        role: { type: 'string', defaultValue: 'USER', input: false },
      },
    },
  }) as unknown as AuthInstance
  fastify.decorate('auth', auth)

  fastify.decorate('requireSession', async (req: FastifyRequest, reply: FastifyReply) => {
    const headers = new Headers()
    for (const [k, v] of Object.entries(req.headers)) {
      if (Array.isArray(v)) headers.set(k, v.join(','))
      else if (typeof v === 'string') headers.set(k, v)
    }
    const sess = await auth.api.getSession({ headers })
    if (!sess) {
      reply.code(401).send({ error: 'Unauthorized' })
      return reply
    }
    req.session = sess as unknown as AuthSession
  })

  fastify.decorate('requireAdmin', async (req: FastifyRequest, reply: FastifyReply) => {
    await fastify.requireSession(req, reply)
    if (reply.sent) return
    if (req.session?.user?.role !== 'ADMIN') {
      reply.code(403).send({ error: 'Forbidden — admin only' })
      return reply
    }
  })
}, { name: 'auth', dependencies: ['db'] })

// Helper used by server.ts to mount /auth/* directly on the root instance
// (must be called at root scope so the onRequest hook fires for all incoming requests).
export async function forwardToBetterAuth(
  auth: AuthInstance,
  request: FastifyRequest,
  reply: FastifyReply,
  baseURL: string,
) {
  const url = new URL(request.url, baseURL)
  const headers = new Headers()
  for (const [k, v] of Object.entries(request.headers)) {
    if (Array.isArray(v)) headers.set(k, v.join(','))
    else if (typeof v === 'string') headers.set(k, v)
  }
  const init: RequestInit = { method: request.method, headers }
  if (!['GET', 'HEAD'].includes(request.method)) {
    const chunks: Buffer[] = []
    for await (const chunk of request.raw) chunks.push(chunk as Buffer)
    init.body = Buffer.concat(chunks).toString('utf8')
    if (!headers.has('content-type')) headers.set('content-type', 'application/json')
  }
  const res = await auth.handler(new Request(url, init))
  reply.status(res.status)
  res.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'content-encoding') return
    reply.header(key, value)
  })
  return reply.send(await res.text())
}
