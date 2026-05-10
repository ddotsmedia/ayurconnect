import type { FastifyPluginAsync } from 'fastify'
import { embedText, embedTexts, toVectorLiteral, embeddingsEnabled } from '../lib/embeddings.js'

export const autoPrefix = '/admin/embed'

const adminEmbed: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireAdmin)

  // POST /admin/embed/status — quick check that embeddings are configured + how many herbs are indexed.
  fastify.get('/status', async () => {
    const total: Array<{ count: bigint }> = await fastify.prisma.$queryRaw`SELECT COUNT(*)::bigint as count FROM "Herb"`
    const indexed: Array<{ count: bigint }> = await fastify.prisma.$queryRaw`SELECT COUNT(*)::bigint as count FROM "Herb" WHERE embedding IS NOT NULL`
    return {
      enabled: embeddingsEnabled(),
      total: Number(total[0]?.count ?? 0n),
      indexed: Number(indexed[0]?.count ?? 0n),
    }
  })

  // POST /admin/embed/herbs?force=true — embed all herbs that don't have a vector yet.
  // Free Gemini tier handles 145 herbs in ~30 seconds at concurrency=4.
  fastify.post('/herbs', async (request, reply) => {
    if (!embeddingsEnabled()) {
      return reply.code(503).send({ error: 'GOOGLE_API_KEY not set — cannot embed' })
    }
    const force = (request.query as { force?: string }).force === 'true'

    // Pick herbs that need embedding (or all if force).
    const candidates = force
      ? await fastify.prisma.herb.findMany({ select: { id: true, name: true, sanskrit: true, english: true, malayalam: true, rasa: true, virya: true, description: true, uses: true } })
      : await fastify.prisma.$queryRaw<Array<{ id: string; name: string; sanskrit: string | null; english: string | null; malayalam: string | null; rasa: string | null; virya: string | null; description: string | null; uses: string | null }>>`
          SELECT id, name, sanskrit, english, malayalam, rasa, virya, description, uses
          FROM "Herb"
          WHERE embedding IS NULL`

    if (candidates.length === 0) return { embedded: 0, total: 0, skipped: 'all already indexed' }

    // Build the text we embed: combine all searchable fields. This is what
    // similarity will be computed against, so include alternate names + uses
    // + description for the richest signal.
    const texts = candidates.map((h) => [
      h.name,
      h.sanskrit, h.english, h.malayalam,
      h.rasa ? `Rasa: ${h.rasa}` : '',
      h.virya ? `Virya: ${h.virya}` : '',
      h.description ?? '',
      h.uses ? `Uses: ${h.uses}` : '',
    ].filter(Boolean).join('. '))

    const vectors = await embedTexts(texts, 4)

    let embedded = 0
    let failed   = 0
    for (let i = 0; i < candidates.length; i++) {
      const vec = vectors[i]
      const id  = candidates[i].id
      if (!vec) { failed++; continue }
      // Postgres vector update via raw SQL (Prisma can't type vector yet).
      const lit = toVectorLiteral(vec)
      await fastify.prisma.$executeRawUnsafe(
        `UPDATE "Herb" SET embedding = $1::vector WHERE id = $2`,
        lit,
        id,
      )
      embedded++
    }

    return { embedded, failed, total: candidates.length }
  })
}

export default adminEmbed

// Helper kept here so it's importable elsewhere if needed later.
export async function embedQuery(q: string): Promise<number[] | null> {
  return embedText(q)
}
