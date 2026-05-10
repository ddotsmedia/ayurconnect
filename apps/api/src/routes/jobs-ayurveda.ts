import type { FastifyPluginAsync, FastifyInstance } from 'fastify'
import { scoreJobMatch } from '../services/jobMatcher.js'

export const autoPrefix = '/jobs/ayurveda'

// Public, paginated feed of auto-imported Ayurveda jobs.
// Keeps the user-posted /jobs feed (jobs.ts) untouched.
//
// If the request is signed-in and the user owns a Doctor profile, each job
// gets a `matchScore` (0-100) + `matchLabel` based on specialisation, district,
// qualification, experience, and languages. Anonymous & non-doctor users get
// the same job list without match decoration (frontend hides the badge).
const route: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const { page = '1', limit = '20', source, q, location, jobType } = request.query as Record<string, string>
    const pageNum  = Math.max(1, Number(page) || 1)
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 20))

    const where: Record<string, unknown> = { isActive: true }
    if (source)   where.source  = source
    if (jobType)  where.jobType = jobType
    if (location) where.location = { contains: location, mode: 'insensitive' }
    if (q) {
      where.OR = [
        { title:        { contains: q, mode: 'insensitive' } },
        { organization: { contains: q, mode: 'insensitive' } },
        { description:  { contains: q, mode: 'insensitive' } },
      ]
    }

    // Best-effort session lookup — anonymous calls are allowed on this route.
    let profile: Awaited<ReturnType<typeof loadDoctorProfile>> = null
    try {
      const headers = new Headers()
      for (const [k, v] of Object.entries(request.headers)) {
        if (Array.isArray(v)) headers.set(k, v.join(','))
        else if (typeof v === 'string') headers.set(k, v)
      }
      const sess = (await fastify.auth.api.getSession({ headers })) as { user?: { id: string } } | null
      if (sess?.user?.id) profile = await loadDoctorProfile(fastify, sess.user.id)
    } catch { /* anonymous — fall through */ }

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

    const jobs = profile
      ? items.map((j) => {
          const m = scoreJobMatch(j, profile!)
          return { ...j, matchScore: m.score, matchLabel: m.label }
        })
      : items

    return {
      jobs,
      pagination: {
        page: pageNum, limit: limitNum, total,
        pages: Math.ceil(total / limitNum),
      },
    }
  })
}

async function loadDoctorProfile(fastify: FastifyInstance, userId: string) {
  const user = await fastify.prisma.user.findUnique({
    where: { id: userId },
    select: {
      ownedDoctor: { select: { specialization: true, district: true, qualification: true, experienceYears: true, languages: true } },
    },
  })
  if (!user?.ownedDoctor) return null
  return {
    specialization:  user.ownedDoctor.specialization,
    district:        user.ownedDoctor.district,
    qualification:   user.ownedDoctor.qualification,
    experienceYears: user.ownedDoctor.experienceYears,
    languages:       user.ownedDoctor.languages,
  }
}

export default route
