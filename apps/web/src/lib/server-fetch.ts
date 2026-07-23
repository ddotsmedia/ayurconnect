// API URL for SSR / server component fetches.
//
// 2026-07-23 (post-504 incident): fallback to NEXT_PUBLIC_API_URL removed.
// Under prod, that env resolves to https://ayurconnect.com — server-side
// fetches then routed through Cloudflare + nginx, causing recursion and
// the multi-hour 504 cascade. Server-only. Falls back to the loopback dev
// port only, never the public domain.
export const API_INTERNAL =
  process.env.INTERNAL_API_URL ??
  'http://127.0.0.1:4100'

// Production sanity check: warn once at module load if INTERNAL_API_URL is
// missing. Fails loud in prod logs; harmless in dev where the fallback is
// the intended dev API port.
if (
  typeof process !== 'undefined'
  && process.env.NODE_ENV === 'production'
  && !process.env.INTERNAL_API_URL
) {
  // eslint-disable-next-line no-console
  console.warn(
    '[server-fetch] INTERNAL_API_URL is not set in production — '
    + 'falling back to http://127.0.0.1:4100. Set INTERNAL_API_URL '
    + 'explicitly in apps/web/.env.production to silence this.',
  )
}

// Timeout-wrapped fetch helper for server-side loaders. Prefer over bare
// `fetch(...)` in server components + route handlers so no request can hang
// long enough to pin the SSR worker.
//
//   const r = await srvFetch(`${API_INTERNAL}/doctors?limit=6`, { timeoutMs: 5000 })
//   if (!r.ok) return []
//
// Callers should still check r.ok + content-type before parsing JSON.
export async function srvFetch(
  input: string | URL,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = 8000, ...rest } = init
  return fetch(input, {
    ...rest,
    signal: rest.signal ?? AbortSignal.timeout(timeoutMs),
  })
}

// Structured logger for server-side fetch failures. Use this instead of a
// bare `} catch {` so we can see when graceful-degradation fallbacks fire.
// The label is the loader name; err is whatever the catch caught.
//
// Wired to console.warn for now; swap with Sentry / pino when error tracking
// is wired up (see apps/api error logging for the analogous server-side hook).
export function logServerFetchError(label: string, err: unknown, extra?: Record<string, unknown>): void {
  const msg = err instanceof Error ? err.message : String(err)
  // eslint-disable-next-line no-console
  console.warn(`[server-fetch] ${label} failed: ${msg}`, extra ?? {})
}
