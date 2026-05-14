import fp from 'fastify-plugin'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'

// Parse + validate CORS_ORIGIN. We expect a comma-separated list of explicit
// origins (e.g. "https://ayurconnect.com,https://www.ayurconnect.com"). Reject
// '*' wildcards because we send credentials — '*' + credentials is unsafe and
// would silently open the API to every origin if someone misconfigures the env.
function parseOrigins(raw: string | undefined): string[] {
  const fallback = ['http://localhost:3000']
  if (!raw) return fallback
  const list = raw.split(',').map((s) => s.trim()).filter(Boolean)
  if (list.length === 0) return fallback
  const safe = list.filter((o) => !o.includes('*') && /^https?:\/\//.test(o))
  if (safe.length === 0) {
    // No usable entries — fail closed to the safe default rather than wildcard.
    return fallback
  }
  return safe
}

export default fp(async (fastify) => {
  await fastify.register(cookie)
  const origins = parseOrigins(process.env.CORS_ORIGIN)
  fastify.log.info({ origins }, 'cors: allowed origins')
  await fastify.register(cors, {
    origin: origins,
    credentials: true,
  })
}, { name: 'cors' })
