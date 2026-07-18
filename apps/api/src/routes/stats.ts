import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/stats'

// Public site-wide counts. Consumed by the root opengraph-image.tsx and any
// share-card / stats-strip component that would otherwise hardcode
// "500+ verified doctors". Cache-Control lets nginx + browsers hold the
// values for 5 minutes — counts change slowly and stale-by-5min is far
// less bad than a stale "500+" hardcoded string for years.
//
// Medicine count is derived from the static in-app catalogue (135), not the
// DB — medicines don't have their own table yet, and the count is stable.
const MEDICINE_CATALOGUE_COUNT = 135

const route: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (_req, reply) => {
    const [doctorsTotal, doctorsVerified, herbs, hospitals, articles] = await Promise.all([
      fastify.prisma.doctor.count(),
      fastify.prisma.doctor.count({ where: { ccimVerified: true } }),
      fastify.prisma.herb.count(),
      fastify.prisma.hospital.count(),
      fastify.prisma.knowledgeArticle.count({ where: { status: 'published' } }),
    ])
    reply.header('cache-control', 'public, max-age=300, s-maxage=300')
    return {
      doctors: { total: doctorsTotal, verified: doctorsVerified },
      herbs,
      medicines: MEDICINE_CATALOGUE_COUNT,
      hospitals,
      articles,
    }
  })
}

export default route
