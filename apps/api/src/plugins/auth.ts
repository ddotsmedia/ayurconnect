import fp from 'fastify-plugin'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { sendEmail, emailEnabled } from '../lib/email.js'

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
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      requireEmailVerification: emailEnabled(),
    },
    emailVerification: emailEnabled() ? {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmail({
          to: user.email,
          subject: 'Verify your AyurConnect email',
          html: `
            <div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
              <h1 style="font-family:Georgia,serif;color:#155724;margin:0 0 12px">Welcome to AyurConnect 🌿</h1>
              <p>Hi ${user.name ?? 'there'},</p>
              <p>Click below to verify <strong>${user.email}</strong> and start booking consultations with CCIM-verified Kerala doctors.</p>
              <p style="margin:20px 0">
                <a href="${url}" style="display:inline-block;padding:12px 20px;background:#1b5e20;color:white;text-decoration:none;border-radius:8px;font-weight:600">Verify email</a>
              </p>
              <p style="font-size:13px;color:#6b7280">If the button doesn't work, paste this link: <br><a href="${url}">${url}</a></p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
              <p style="font-size:12px;color:#9ca3af">If you didn't sign up, ignore this email.</p>
            </div>`,
          text: `Welcome to AyurConnect. Verify your email: ${url}`,
        })
      },
    } : undefined,
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
