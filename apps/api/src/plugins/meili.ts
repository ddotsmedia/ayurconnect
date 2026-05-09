import fp from 'fastify-plugin'
import { MeiliSearch } from 'meilisearch'

declare module 'fastify' {
  interface FastifyInstance {
    meili: MeiliSearch
  }
}

export default fp(async (fastify) => {
  const meili = new MeiliSearch({
    host: process.env.MEILI_HOST ?? 'http://localhost:7700',
    apiKey: process.env.MEILI_KEY,
  })

  // Probe (warn-only); real index creation happens lazily in Phase 5 search wiring.
  try {
    await meili.health()
  } catch (err) {
    fastify.log.warn({ err }, 'meilisearch unreachable at boot')
  }

  fastify.decorate('meili', meili)
}, { name: 'meili' })
