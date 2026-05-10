import type { FastifyPluginAsync } from 'fastify'
import { runJobImport } from '../services/jobImporter.js'

// Mounted under /admin/import/jobs to avoid colliding with the existing
// /admin/import/{doctors,hospitals} CSV-based import endpoints.
export const autoPrefix = '/admin/import/jobs'

const route: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireAdmin)

  // POST /admin/import/jobs/run — trigger a manual import. Synchronous so
  // admins see the per-source breakdown in the response. Use cautiously
  // (each call hits all four upstream sources).
  fastify.post('/run', async () => {
    const summary = await runJobImport(fastify)
    return summary
  })

  // GET /admin/import/jobs/status — total count, breakdown by source,
  // last 20 imported jobs.
  fastify.get('/status', async () => {
    const [total, perSource, recent] = await Promise.all([
      fastify.prisma.importedJob.count(),
      fastify.prisma.importedJob.groupBy({
        by: ['source'],
        _count: { _all: true },
        _max:   { importedAt: true },
      }),
      fastify.prisma.importedJob.findMany({
        orderBy: { importedAt: 'desc' },
        take:    20,
        select: {
          id: true, title: true, organization: true, location: true,
          source: true, applyUrl: true, importedAt: true, isActive: true,
        },
      }),
    ])

    return {
      total,
      perSource: perSource.map((p) => ({
        source: p.source,
        count:  p._count._all,
        lastImportedAt: p._max.importedAt,
      })),
      recent,
    }
  })
}

export default route
