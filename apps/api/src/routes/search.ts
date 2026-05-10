import type { FastifyPluginAsync } from 'fastify'
import { INDEXES, ensureIndexes, reindexAll, type IndexKey } from '../lib/search-sync.js'

export const autoPrefix = '/search'

const search: FastifyPluginAsync = async (fastify) => {
  // Public unified search.  GET /search?q=panchakarma&limit=8
  // Returns top hits per index. Designed for the navbar dropdown + /search page.
  fastify.get('/', async (request) => {
    const { q = '', limit = '6', type } = request.query as { q?: string; limit?: string; type?: IndexKey }
    const term = q.trim()
    if (!term) return { query: '', results: { doctors: [], hospitals: [], herbs: [], articles: [] } }

    const lim = Math.min(Number(limit) || 6, 20)
    const indices: IndexKey[] = type ? [type] : (['doctors', 'hospitals', 'herbs', 'articles'] as IndexKey[])

    const out: Record<string, unknown[]> = { doctors: [], hospitals: [], herbs: [], articles: [] }

    await Promise.all(indices.map(async (key) => {
      try {
        const r = await fastify.meili.index(INDEXES[key]).search(term, { limit: lim, attributesToHighlight: [] })
        out[key] = r.hits ?? []
      } catch (err) {
        fastify.log.warn({ err, key }, 'meili search failed')
        out[key] = []
      }
    }))

    return { query: term, results: out }
  })

  // Admin-only: trigger a full reindex from Postgres.  POST /search/reindex
  fastify.post('/reindex', { preHandler: fastify.requireAdmin }, async () => {
    const counts = await reindexAll(fastify)
    return { ok: true, counts }
  })

  // Admin-only: ensure indexes exist + settings are current.  POST /search/setup
  fastify.post('/setup', { preHandler: fastify.requireAdmin }, async () => {
    await ensureIndexes(fastify)
    return { ok: true }
  })
}

export default search
