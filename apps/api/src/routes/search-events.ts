// Anonymous search event recording + hospital-side demand-signal queries.
//
// POST /api/search-events       — public, throttled, fire-and-forget recording
// GET  /api/search-events/demand-signals?district=... — aggregated counts

import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/search-events'

// In-memory dedupe: 5-min cooldown per (IP, query) pair. Acceptable for
// single-instance deployments; if we scale horizontally, move to Redis.
const RECENT = new Map<string, number>()
const COOLDOWN_MS = 5 * 60_000

function ipOf(req: any): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? 'unknown'
}

function clipString(s: unknown, max: number): string | null {
  if (typeof s !== 'string') return null
  const t = s.trim()
  if (!t) return null
  return t.slice(0, max)
}

const route: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', async (request, reply) => {
    const b = request.body as Record<string, unknown>
    const query = clipString(b.query, 200)
    if (!query) return reply.code(400).send({ error: 'query required' })

    const key = `${ipOf(request)}::${query.toLowerCase()}`
    const last = RECENT.get(key) ?? 0
    const now  = Date.now()
    if (now - last < COOLDOWN_MS) return { ok: true, throttled: true }
    RECENT.set(key, now)
    // Crude eviction
    if (RECENT.size > 5000) {
      const cutoff = now - COOLDOWN_MS
      for (const [k, v] of RECENT) if (v < cutoff) RECENT.delete(k)
    }

    await fastify.prisma.anonymousSearchEvent.create({
      data: {
        query,
        specialization: clipString(b.specialization, 120),
        district:       clipString(b.district, 120),
        country:        clipString(b.country, 60),
        source:         clipString(b.source, 60),
      },
    }).catch(() => {})
    return { ok: true }
  })

  // Aggregated demand signals — public read (hospital dashboards consume it
  // with their own district baked in). No PII is exposed.
  fastify.get('/demand-signals', async (request) => {
    const q = request.query as { district?: string }
    const district = (q.district ?? '').trim() || null

    const weekStart = new Date(); weekStart.setUTCDate(weekStart.getUTCDate() - 7)
    const prevStart = new Date(); prevStart.setUTCDate(prevStart.getUTCDate() - 14)
    const prevEnd   = new Date(); prevEnd.setUTCDate(prevEnd.getUTCDate() - 7)

    const baseWhere = district ? { district } : {}

    const [topQueries, topSpecs, thisWeek, lastWeek] = await Promise.all([
      fastify.prisma.anonymousSearchEvent.groupBy({
        by: ['query'],
        where: { ...baseWhere, createdAt: { gte: weekStart } },
        _count: { _all: true },
        orderBy: { _count: { query: 'desc' } },
        take: 10,
      }),
      fastify.prisma.anonymousSearchEvent.groupBy({
        by: ['specialization'],
        where: { ...baseWhere, createdAt: { gte: weekStart }, specialization: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { specialization: 'desc' } },
        take: 5,
      }),
      fastify.prisma.anonymousSearchEvent.count({ where: { ...baseWhere, createdAt: { gte: weekStart } } }),
      fastify.prisma.anonymousSearchEvent.count({ where: { ...baseWhere, createdAt: { gte: prevStart, lt: prevEnd } } }),
    ])

    const deltaPct = lastWeek === 0 ? null : Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
    return {
      district,
      thisWeekCount: thisWeek,
      lastWeekCount: lastWeek,
      deltaPct,
      topQueries: topQueries.map((r) => ({ query: r.query, count: r._count._all })),
      topSpecializations: topSpecs.map((r) => ({ specialization: r.specialization, count: r._count._all })),
    }
  })
}

export default route
