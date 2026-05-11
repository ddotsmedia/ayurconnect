import type { FastifyPluginAsync } from 'fastify'
import { runJobImport, ALL_SOURCES } from '../services/jobImporter.js'

// Mounted under /admin/import/jobs to avoid colliding with the existing
// /admin/import/{doctors,hospitals} CSV-based import endpoints.
export const autoPrefix = '/admin/import/jobs'

const route: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireAdmin)

  // POST /admin/import/jobs/run — trigger a manual import. Synchronous so
  // admins see the per-source breakdown in the response. Use cautiously
  // (each call fans out to all 10 upstream sources in parallel).
  fastify.post('/run', async () => {
    const summary = await runJobImport(fastify)
    return summary
  })

  // GET /admin/import/jobs/status — total count, breakdown by all 10 sources
  // (sources with no rows still appear with count:0), last 20 imported jobs.
  fastify.get('/status', async () => {
    const [total, perSourceGroups, recent] = await Promise.all([
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

    // Project DB groups onto the canonical 10-source list so all sources
    // appear in the response (with count:0 for sources that haven't produced
    // any rows yet). Any DB-only sources (legacy / removed) are appended.
    const byKey = new Map(perSourceGroups.map((g) => [g.source, g]))
    const canonical = ALL_SOURCES.map((source) => {
      const g = byKey.get(source)
      return {
        source,
        count:           g?._count._all   ?? 0,
        lastImportedAt:  g?._max.importedAt ?? null,
      }
    })
    const extraneous = perSourceGroups
      .filter((g) => !ALL_SOURCES.includes(g.source as never))
      .map((g) => ({ source: g.source, count: g._count._all, lastImportedAt: g._max.importedAt }))

    return {
      total,
      perSource: [...canonical, ...extraneous],
      recent,
    }
  })
}

export default route
