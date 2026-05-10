import * as path from 'node:path'
import AutoLoad, { type AutoloadPluginOptions } from '@fastify/autoload'
import fp from 'fastify-plugin'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export type AppOptions = Partial<AutoloadPluginOptions>

const options: AppOptions = {}

// Wrapped in fp so plugin decorators (fastify.auth, fastify.prisma, ...)
// propagate to the root server instance.
const app = fp(async (fastify, opts: AppOptions) => {
  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: opts,
    forceESM: true,
  })

  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: opts,
    forceESM: true,
  })

  // ─── Bootstrap Meilisearch indexes + embed missing herb vectors ──────────
  // Both run on boot. Failure non-fatal: search/semantic just return empty.
  fastify.addHook('onReady', async () => {
    try {
      const { ensureIndexes, reindexAll } = await import('./lib/search-sync.js')
      await ensureIndexes(fastify)
      const counts = await reindexAll(fastify)
      fastify.log.info({ counts }, 'meilisearch: indexes bootstrapped')
    } catch (err) {
      fastify.log.warn({ err }, 'meilisearch: bootstrap failed (search will return empty)')
    }

    // Embed any herbs missing a vector (one-time on first boot after migration,
    // then no-op on subsequent boots). Free Gemini quota easily covers 145 herbs.
    try {
      const { embedTexts, toVectorLiteral, embeddingsEnabled } = await import('./lib/embeddings.js')
      if (!embeddingsEnabled()) {
        fastify.log.info('embeddings: GOOGLE_API_KEY not set, skipping')
        return
      }
      const missing = await fastify.prisma.$queryRaw<Array<{ id: string; name: string; sanskrit: string | null; english: string | null; malayalam: string | null; rasa: string | null; virya: string | null; description: string | null; uses: string | null }>>`
        SELECT id, name, sanskrit, english, malayalam, rasa, virya, description, uses
        FROM "Herb" WHERE embedding IS NULL`
      if (missing.length === 0) {
        fastify.log.info('embeddings: all herbs indexed')
        return
      }
      fastify.log.info({ count: missing.length }, 'embeddings: indexing herbs missing vectors')
      const texts = missing.map((h) => [
        h.name, h.sanskrit, h.english, h.malayalam,
        h.rasa ? `Rasa: ${h.rasa}` : '',
        h.virya ? `Virya: ${h.virya}` : '',
        h.description ?? '',
        h.uses ? `Uses: ${h.uses}` : '',
      ].filter(Boolean).join('. '))
      const vectors = await embedTexts(texts, 4)
      let ok = 0
      for (let i = 0; i < missing.length; i++) {
        const v = vectors[i]
        if (!v) continue
        await fastify.prisma.$executeRawUnsafe(`UPDATE "Herb" SET embedding = $1::vector WHERE id = $2`, toVectorLiteral(v), missing[i].id)
        ok++
      }
      fastify.log.info({ embedded: ok, total: missing.length }, 'embeddings: bootstrap complete')
    } catch (err) {
      fastify.log.warn({ err }, 'embeddings: bootstrap failed (semantic search will be empty)')
    }
  })
}, { name: 'app' })

export default app
export { app, options }
