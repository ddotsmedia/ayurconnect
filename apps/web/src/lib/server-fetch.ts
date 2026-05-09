// API URL for SSR / server component fetches.
//
// Prefer INTERNAL_API_URL (e.g. http://127.0.0.1:4100 in prod) so we stay on
// loopback and don't make a round-trip through Cloudflare for every server-side
// page render. Falls back to the public URL for local dev.
export const API_INTERNAL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4100'
