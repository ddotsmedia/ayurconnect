// Web-side health check. PM2/Cloudflare/nginx can hit this to confirm the
// Next.js process is alive without going through Cloudflare (bypass with
// http://127.0.0.1:3100/api/health).
//
// Deliberately does not touch the API — the web process being alive is
// orthogonal to the API being alive. For deep health, hit /health/ready on
// the API side directly.

export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({
    status: 'ok',
    uptime: process.uptime(),
    ts: new Date().toISOString(),
  })
}
