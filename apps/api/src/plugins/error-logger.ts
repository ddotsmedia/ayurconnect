// Structured error logger.
//
// Two hooks:
//   - onResponse: every 4xx/5xx is pino-logged with route + status + duration.
//     5xx logs at warn; 4xx at info. Gives us visibility we currently lack —
//     until this was added, silent fallbacks in the web layer (e.g. the
//     testimonials list returning an empty array) made every transient API
//     failure invisible.
//
//   - onError: caught Fastify errors are logged with their stack. This catches
//     anything the route handlers didn't explicitly reply to (e.g. throws).
//
// SENTRY_DSN gate: when set, also forward to Sentry. The package is loaded
// dynamically so the codebase still compiles without @sentry/node installed
// — install when you're ready to wire it up.
//
//   pnpm --filter api add @sentry/node
//   SENTRY_DSN=https://… in the API env

import fp from 'fastify-plugin'
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

type SentryLike = {
  init: (opts: { dsn: string; tracesSampleRate?: number; environment?: string }) => void
  captureException: (e: unknown, ctx?: Record<string, unknown>) => void
}

let sentry: SentryLike | null = null

async function maybeInitSentry(): Promise<void> {
  if (sentry) return
  const dsn = process.env.SENTRY_DSN
  if (!dsn) return
  // String-via-variable defeats TS's static module resolution so this
  // typechecks even before `pnpm --filter api add @sentry/node` is run.
  const pkg = '@sentry/node'
  try {
    const mod = (await import(pkg).catch(() => null)) as SentryLike | null
    if (!mod) return
    mod.init({
      dsn,
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.05),
      environment: process.env.NODE_ENV ?? 'production',
    })
    sentry = mod
  } catch {
    // @sentry/node not installed — fall back to pino-only logging.
  }
}

export default fp(async (fastify) => {
  await maybeInitSentry()

  fastify.addHook('onResponse', async (req: FastifyRequest, reply: FastifyReply) => {
    const status = reply.statusCode
    if (status < 400) return
    const route = req.routeOptions?.url ?? req.url
    const ctx = {
      method:   req.method,
      route,
      status,
      duration: Math.round(reply.elapsedTime ?? 0),
      userId:   req.session?.user?.id ?? null,
    }
    if (status >= 500)      fastify.log.warn(ctx, 'api 5xx')
    else if (status >= 400) fastify.log.info(ctx, 'api 4xx')
  })

  fastify.addHook('onError', async (req: FastifyRequest, _reply, error: FastifyError) => {
    fastify.log.error(
      { err: error, route: req.routeOptions?.url ?? req.url, method: req.method },
      'api onError',
    )
    sentry?.captureException(error, {
      tags: { route: req.routeOptions?.url ?? req.url, method: req.method },
    })
  })

  fastify.log.info(
    { sentry: sentry ? 'enabled' : 'disabled' },
    'error-logger ready',
  )
}, { name: 'error-logger' })
