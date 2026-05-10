import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/jobs/ayurveda'

// Public, paginated feed of auto-imported Ayurveda jobs.
// Keeps the user-posted /jobs feed (jobs.ts) untouched.
const route: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const { page = '1', limit = '20', source, q, location } = request.query as Record<string, string>
    const pageNum  = Math.max(1, Number(page) || 1)
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 20))

    const where: Record<string, unknown> = { isActive: true }
    if (source)   where.source = source
    if (location) where.location = { contains: location, mode: 'insensitive' }
    if (q) {
      where.OR = [
        { title:        { contains: q, mode: 'insensitive' } },
        { organization: { contains: q, mode: 'insensitive' } },
        { description:  { contains: q, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      fastify.prisma.importedJob.findMany({
        where,
        orderBy: { importedAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        select: {
          id: true, title: true, organization: true, location: true,
          description: true, qualifications: true, lastDate: true,
          applyUrl: true, source: true, salary: true, jobType: true,
          category: true, importedAt: true,
        },
      }),
      fastify.prisma.importedJob.count({ where }),
    ])

    return {
      jobs: items,
      pagination: {
        page: pageNum, limit: limitNum, total,
        pages: Math.ceil(total / limitNum),
      },
    }
  })
}

export default route
