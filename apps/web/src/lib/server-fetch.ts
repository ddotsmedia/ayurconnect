// API URL for SSR / server component fetches.
//
// Prefer INTERNAL_API_URL (e.g. http://127.0.0.1:4100 in prod) so we stay on
// loopback and don't make a round-trip through Cloudflare for every server-side
// page render. Falls back to the public URL for local dev.
export const API_INTERNAL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4100'

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
