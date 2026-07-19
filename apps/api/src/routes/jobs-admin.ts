// Admin endpoints for the job portal — verification queues + counters.

import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/jobs-portal/admin'

const jobsAdmin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireAdmin)

  fastify.get('/counts', async () => {
    const [pendingEmployers, totalEmployers, totalCandidates, totalJobs] = await Promise.all([
      fastify.prisma.employerProfile.count({ where: { isVerified: false } }),
      fastify.prisma.employerProfile.count(),
      fastify.prisma.candidateProfile.count(),
      fastify.prisma.job.count({ where: { status: 'active' } }),
    ])
    return { pendingEmployers, totalEmployers, totalCandidates, totalJobs }
  })

  fastify.get('/employers', async (request) => {
    const { status = 'pending' } = request.query as Record<string, string>
    const where = status === 'pending' ? { isVerified: false } : status === 'verified' ? { isVerified: true } : {}
    return fastify.prisma.employerProfile.findMany({
      where, take: 100, orderBy: { createdAt: 'desc' },
      select: { id: true, slug: true, companyName: true, companyType: true, country: true, city: true, isVerified: true, verifiedAt: true, createdAt: true },
    })
  })
  fastify.post('/employers/:id/verify', async (request) => {
    const { id } = request.params as { id: string }
    return fastify.prisma.employerProfile.update({ where: { id }, data: { isVerified: true, verifiedAt: new Date() } })
  })
  fastify.post('/employers/:id/unverify', async (request) => {
    const { id } = request.params as { id: string }
    return fastify.prisma.employerProfile.update({ where: { id }, data: { isVerified: false, verifiedAt: null } })
  })

  fastify.get('/candidates', async (request) => {
    const { q } = request.query as Record<string, string>
    const where: Record<string, unknown> = {}
    if (q) where.OR = [
      { fullName: { contains: q, mode: 'insensitive' } },
      { email:    { contains: q, mode: 'insensitive' } },
    ]
    return fastify.prisma.candidateProfile.findMany({
      where, take: 100, orderBy: { createdAt: 'desc' },
      select: { id: true, fullName: true, email: true, currentLocation: true, totalExperience: true, profileCompleteness: true, createdAt: true },
    })
  })

  // ─── Per-job saves analytics (drives /admin/jobs/[id]/analytics) ────────
  fastify.get('/jobs/:id/analytics', async (request, reply) => {
    const { id } = request.params as { id: string }
    const job = await fastify.prisma.job.findUnique({
      where:  { id },
      select: { id: true, title: true, type: true, district: true, createdAt: true },
    })
    if (!job) return reply.code(404).send({ error: 'job not found' })

    const [savedRows, applyCount] = await Promise.all([
      fastify.prisma.userSavedJob.findMany({
        where:   { jobId: id },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { savedAt: 'desc' },
        take:    500,
      }),
      fastify.prisma.jobApplication.count({ where: { jobId: id } }),
    ])
    const totalSaves = savedRows.length
    const uniqueUsers = new Set(savedRows.map((r) => r.userId)).size
    return {
      job,
      totalSaves,
      uniqueUsers,
      applyCount,
      highInterest: isHighInterest(totalSaves, applyCount),
      saves: savedRows.map((r) => ({
        userId:    r.user.id,
        userName:  r.user.name,
        userEmail: r.user.email,
        savedAt:   r.savedAt,
      })),
    }
  })

  // ─── Site-wide saves report (drives /admin/saved-jobs-report) ──────────
  // Groups saves by job, joins Job data, computes save-rate + high-interest.
  // Optional filters: from/to (ISO date on savedAt), type, district.
  fastify.get('/saved-jobs-report', async (request) => {
    const q = request.query as { from?: string; to?: string; type?: string; district?: string; limit?: string }
    const where: Record<string, unknown> = {}
    if (q.from) where.savedAt = { ...(where.savedAt as object ?? {}), gte: new Date(q.from) }
    if (q.to)   where.savedAt = { ...(where.savedAt as object ?? {}), lte: new Date(q.to) }
    if (q.type || q.district) {
      where.job = {
        ...(q.type     ? { type:     q.type }     : {}),
        ...(q.district ? { district: q.district } : {}),
      }
    }
    const groups = await fastify.prisma.userSavedJob.groupBy({
      by:      ['jobId'],
      where,
      _count:  { _all: true, userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take:    Math.min(Number(q.limit) || 200, 500),
    })
    const jobIds = groups.map((g) => g.jobId)
    if (jobIds.length === 0) return { items: [], count: 0 }

    const [jobs, applyGroups] = await Promise.all([
      fastify.prisma.job.findMany({
        where:  { id: { in: jobIds } },
        select: { id: true, title: true, type: true, district: true, salary: true, status: true, createdAt: true, clinic: true },
      }),
      fastify.prisma.jobApplication.groupBy({ by: ['jobId'], where: { jobId: { in: jobIds } }, _count: { _all: true } }),
    ])
    const jobById   = new Map(jobs.map((j) => [j.id, j]))
    const applyById = new Map(applyGroups.map((g) => [g.jobId, g._count._all]))

    const items = groups
      .map((g) => {
        const job = jobById.get(g.jobId)
        if (!job) return null
        const savesCount  = g._count._all
        const uniqueUsers = g._count.userId  // groupBy on jobId → same rows, but here just to make report shape explicit
        const applyCount  = applyById.get(g.jobId) ?? 0
        return {
          jobId: g.jobId, title: job.title, type: job.type, district: job.district, clinic: job.clinic,
          status: job.status, salary: job.salary, createdAt: job.createdAt,
          savesCount, uniqueUsers, applyCount,
          highInterest: isHighInterest(savesCount, applyCount),
        }
      })
      .filter(<T>(x: T): x is NonNullable<T> => x !== null)

    return { items, count: items.length }
  })

  // ─── Trending: jobs with most saves in the last N days (default 7) ─────
  fastify.get('/saved-jobs-trending', async (request) => {
    const days = Math.min(Math.max(Number((request.query as { days?: string }).days) || 7, 1), 90)
    const since = new Date(Date.now() - days * 86_400_000)
    const groups = await fastify.prisma.userSavedJob.groupBy({
      by:      ['jobId'],
      where:   { savedAt: { gte: since } },
      _count:  { _all: true },
      orderBy: { _count: { jobId: 'desc' } },
      take:    20,
    })
    const jobIds = groups.map((g) => g.jobId)
    if (jobIds.length === 0) return { items: [], sinceDays: days }
    const jobs = await fastify.prisma.job.findMany({
      where:  { id: { in: jobIds } },
      select: { id: true, title: true, type: true, district: true, clinic: true },
    })
    const jobById = new Map(jobs.map((j) => [j.id, j]))
    return {
      sinceDays: days,
      items: groups.map((g) => {
        const j = jobById.get(g.jobId)
        return j ? { ...j, savesInWindow: g._count._all } : null
      }).filter(<T>(x: T): x is NonNullable<T> => x !== null),
    }
  })
}

// High-interest heuristic: many saves relative to applies. The Job model has
// no viewCount column, so we rely on save-vs-apply signal only:
//   - saves >= 5 AND applies * 2 < saves → attractive but low conversion
//   - saves >= 10 (regardless of applies) → strong bookmark magnet
function isHighInterest(saves: number, applies: number): boolean {
  if (saves >= 10) return true
  if (saves >= 5 && applies * 2 < saves) return true
  return false
}

export default jobsAdmin
