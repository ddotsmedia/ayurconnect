import { type FastifyPluginAsync } from 'fastify'

type DepStatus = { ok: boolean; latencyMs: number; err?: string }

async function timed(fn: () => Promise<unknown>): Promise<DepStatus> {
  const t = Date.now()
  try {
    await fn()
    return { ok: true, latencyMs: Date.now() - t }
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - t,
      err: err instanceof Error ? err.message : String(err),
    }
  }
}

const root: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Liveness — process is alive. Never touches deps. PM2 / container liveness
  // probes should hit THIS one so a DB blip doesn't restart Node itself.
  fastify.get('/health/live', async () => ({
    status: 'ok',
    uptime: process.uptime(),
  }))

  // Readiness — process is alive AND critical deps are reachable. Load balancer
  // probes should hit this so traffic drains during a DB outage. Redis + Meili
  // are advisory (site degrades gracefully); only DB failure returns 503.
  fastify.get('/health/ready', async (_req, reply) => {
    const [db, redis, meili] = await Promise.all([
      timed(() => fastify.prisma.$queryRaw`SELECT 1`),
      timed(async () => { await fastify.redis.ping() }),
      timed(async () => { await fastify.meili.health() }),
    ])
    const ok = db.ok
    reply.status(ok ? 200 : 503)
    return {
      status: ok ? 'ok' : 'degraded',
      uptime: process.uptime(),
      deps: { db, redis, meili },
    }
  })

  // Legacy /health kept for existing smoke tests + external monitors.
  // Aliased to /health/live so nothing that pings this today changes behavior.
  fastify.get('/health', async () => ({
    status: 'ok',
    uptime: process.uptime(),
  }))

  fastify.get('/', async () => ({
    name: 'ayurconnect-api',
    version: '1.0.0',
    docs: 'GET /health, /health/live, /health/ready, /doctors, /hospitals, /ayurbot/chat, /forum/posts, /jobs, /herbs, /tourism/packages, /colleges',
  }))
}

export default root
