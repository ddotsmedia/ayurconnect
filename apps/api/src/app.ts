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

  // ─── Bootstrap Meilisearch indexes (non-blocking) ────────────────────────
  // Runs after autoload so prisma + meili decorators are ready. Failure is
  // non-fatal; search just falls back to empty results until reindex succeeds.
  fastify.addHook('onReady', async () => {
    try {
      const { ensureIndexes, reindexAll } = await import('./lib/search-sync.js')
      await ensureIndexes(fastify)
      const counts = await reindexAll(fastify)
      fastify.log.info({ counts }, 'meilisearch: indexes bootstrapped')
    } catch (err) {
      fastify.log.warn({ err }, 'meilisearch: bootstrap failed (search will return empty)')
    }
  })
}, { name: 'app' })

export default app
export { app, options }
