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
}

export default jobsAdmin
