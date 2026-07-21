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

  const isProd  = process.env.NODE_ENV === 'production'
  const auth = betterAuth({
    database: prismaAdapter(fastify.prisma, { provider: 'postgresql' }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL,
    basePath: '/auth',
    trustedOrigins: trusted,
    // Explicit cookie security flags — don't rely on Better Auth defaults
    // changing across versions. SameSite=Lax is the right trade-off for our
    // OAuth-style flows and CSRF resistance.
    advanced: {
      cookies: {
        sessionToken: { name: 'better-auth.session_token', sameSite: 'lax' },
      },
      useSecureCookies: isProd,
      crossSubDomainCookies: { enabled: false },
      // Behind nginx on 127.0.0.1 → Fastify; without this, Better Auth's rate
      // limiter buckets every request into one shared "127.0.0.1" IP. Reading
      // the client IP from the standard proxy headers scopes limits per real
      // client. Only trust the header when the immediate hop is loopback.
      ipAddress: {
        ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
        trustedProxies: ['127.0.0.1'],
      },
    },
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      // Email verification DISABLED (2026-07-21). Trust model switched to
      // admin approval — doctors moderated at /admin/doctors, sign-in works
      // immediately for all users. The sendVerificationEmail block below
      // is kept but only wired up if we ever want to re-enable the gate.
      requireEmailVerification: false,
    },
    // Kept for the manual resend endpoint (POST /api/auth/send-verification-email)
    // and future re-enable. sendOnSignUp is FALSE so signup doesn't email.
    emailVerification: emailEnabled() ? {
      sendOnSignUp: false,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmail({
          to: user.email,
          subject: 'Verify your AyurConnect email',
          html: `
            <div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
              <h1 style="font-family:Georgia,serif;color:#155724;margin:0 0 12px">Welcome to AyurConnect 🌿</h1>
              <p>Hi ${user.name ?? 'there'},</p>
              <p>Click below to verify <strong>${user.email}</strong> and start booking consultations with verified Kerala doctors.</p>
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

  // Soft-attach session on every request that carries a cookie. Per-route
  // guards (requireSession, requireAdmin, requireDrRead, requireDrWrite) then
  // do the actual 401/403. Single source of truth — new modules can read
  // req.session without wiring per-plugin preHandlers.
  fastify.addHook('onRequest', async (req: FastifyRequest) => {
    if (req.session) return
    if (!req.headers.cookie) return  // short-circuit anonymous public traffic
    try {
      // Build the Headers object inside the try block so a malformed header
      // (e.g. a Chrome cookie containing chars `undici`'s Headers rejects)
      // doesn't escape and surface as a generic 400. Previously: TypeError
      // from headers.set bubbled to Fastify's default error handler and got
      // mapped to a 400, killing /api/videos/admin and other admin GETs for
      // affected users. Now any header-construction failure is silenced and
      // the route's normal session-required gate (401) takes over.
      const headers = new Headers()
      for (const [k, v] of Object.entries(req.headers)) {
        try {
          if (Array.isArray(v)) headers.set(k, v.join(','))
          else if (typeof v === 'string') headers.set(k, v)
        } catch { /* per-header failure: skip this one, continue with the rest */ }
      }
      const sess = await auth.api.getSession({ headers })
      if (sess) req.session = sess as unknown as AuthSession
    } catch (err) {
      // Bad/expired cookie — leave req.session undefined; route guards 401.
      fastify.log.debug({ err }, 'auth: soft-attach failed')
    }
  })

  // P1-H4 (2026-05-18 healthcare audit): every response on an authenticated
  // request gets Cache-Control: no-store, private. Prevents PHI leakage via
  // intermediate caches (Cloudflare, corporate proxies, school networks). We
  // attach the header in onSend BEFORE the body is serialised so it survives
  // route handlers that don't set it themselves. Public endpoints are
  // unaffected (no session => no header change, public CDN caching works).
  fastify.addHook('onSend', async (req: FastifyRequest, reply: FastifyReply, payload) => {
    if (!req.session) return payload
    // Don't clobber stronger no-cache directives a route already set.
    if (!reply.getHeader('cache-control')) {
      reply.header('cache-control', 'no-store, private')
    }
    return payload
  })

  fastify.decorate('requireSession', async (req: FastifyRequest, reply: FastifyReply) => {
    const headers = new Headers()
    for (const [k, v] of Object.entries(req.headers)) {
      // Per-header try/catch — a single malformed header (HTTP/2 pseudo,
      // unusual cookie byte, etc.) must not throw out of this function and
      // get mis-mapped to a 400 by Fastify's default error handler.
      try {
        if (Array.isArray(v)) headers.set(k, v.join(','))
        else if (typeof v === 'string') headers.set(k, v)
      } catch { /* skip header */ }
    }
    const sess = await auth.api.getSession({ headers })
    if (!sess) {
      reply.code(401).send({ error: 'Unauthorized' })
      return reply
    }
    req.session = sess as unknown as AuthSession
    // Email-verification guard disabled 2026-07-21 in favour of admin
    // approval on the Doctor.moderationStatus column. Trust model:
    //   User creates account + auto-signs-in → free to browse
    //   Doctor completes profile → moderationStatus='pending'
    //   Admin flips to 'approved' at /admin/doctors → doctor goes live
    // Left the block here as a comment so it's easy to re-enable if we
    // ever want to re-flip requireEmailVerification: true.
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
    try {
      if (Array.isArray(v)) headers.set(k, v.join(','))
      else if (typeof v === 'string') headers.set(k, v)
    } catch { /* skip malformed header — see onRequest hook above */ }
  }
  const init: RequestInit = { method: request.method, headers }
  if (!['GET', 'HEAD'].includes(request.method)) {
    const chunks: Buffer[] = []
    for await (const chunk of request.raw) chunks.push(chunk as Buffer)
    const bodyText = Buffer.concat(chunks).toString('utf8')
    if (bodyText.length > 0) {
      init.body = bodyText
      // Only claim application/json if the client didn't set a content-type AND
      // we actually have a body. Otherwise Better Auth's better-call router
      // tries JSON.parse('') and throws SyntaxError "Unexpected end of JSON
      // input" — which is what was killing sign-out.
      if (!headers.has('content-type')) headers.set('content-type', 'application/json')
    } else {
      // No body — strip any spurious content-type the client may have sent so
      // Better Auth doesn't try to parse nothing.
      headers.delete('content-type')
      headers.delete('content-length')
    }
  }
  const res = await auth.handler(new Request(url, init))
  reply.status(res.status)
  res.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'content-encoding') return
    reply.header(key, value)
  })
  return reply.send(await res.text())
}
