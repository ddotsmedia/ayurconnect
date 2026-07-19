import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/jobs-portal/saved'

// User bookmark ("heart icon") wishlist for jobs. Any authenticated user can
// save any Job.id; distinct from SavedJob which is scoped to CandidateProfile.
//
//   POST   /jobs-portal/saved/:jobId   → save (idempotent), returns { saved:true }
//   DELETE /jobs-portal/saved/:jobId   → unsave (idempotent), returns { saved:false }
//   GET    /jobs-portal/saved          → list saved jobs with Job data + filters
//   GET    /jobs-portal/saved/ids      → cheap batch: { ids: string[] } for hydrating
//                                        heart state on public list pages

const route: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireSession)

  // Cheap batch: only IDs, so the /jobs list can hydrate heart state on
  // hundreds of cards without a heavy join. Cache-friendly.
  fastify.get('/ids', async (request) => {
    const userId = request.session!.user.id
    const rows = await fastify.prisma.userSavedJob.findMany({
      where:   { userId },
      select:  { jobId: true },
      orderBy: { savedAt: 'desc' },
      take:    500,
    })
    return { ids: rows.map((r) => r.jobId) }
  })

  // Full list with Job data + optional filters. type/district/specialty
  // match the same shape /jobs public list uses.
  fastify.get('/', async (request) => {
    const userId = request.session!.user.id
    const { type, district, specialty } = request.query as Record<string, string | undefined>
    const jobWhere: Record<string, unknown> = { status: 'active' }
    if (type)      jobWhere.type      = type
    if (district)  jobWhere.district  = district
    if (specialty) jobWhere.specialty = specialty

    const rows = await fastify.prisma.userSavedJob.findMany({
      where:   { userId, job: jobWhere },
      include: { job: true },
      orderBy: { savedAt: 'desc' },
      take:    200,
    })
    return {
      items: rows.map((r) => ({ savedAt: r.savedAt, ...r.job })),
      count: rows.length,
    }
  })

  fastify.post('/:jobId', async (request, reply) => {
    const userId = request.session!.user.id
    const { jobId } = request.params as { jobId: string }
    // Verify the Job exists before creating the FK row so we return a clean
    // 404 instead of a Prisma FK-violation stack.
    const job = await fastify.prisma.job.findUnique({ where: { id: jobId }, select: { id: true } })
    if (!job) return reply.code(404).send({ error: 'job not found' })
    // upsert() is idempotent — repeated saves are a no-op instead of a 409.
    await fastify.prisma.userSavedJob.upsert({
      where:  { userId_jobId: { userId, jobId } },
      create: { userId, jobId },
      update: {},
    })
    return { saved: true }
  })

  fastify.delete('/:jobId', async (request) => {
    const userId = request.session!.user.id
    const { jobId } = request.params as { jobId: string }
    // deleteMany + userId + jobId is idempotent — deleting a non-existent
    // row silently returns count=0, not a P2025 crash.
    await fastify.prisma.userSavedJob.deleteMany({ where: { userId, jobId } })
    return { saved: false }
  })
}

export default route
