// Job Portal API — employer + candidate + applications + alerts + licensing.
// Builds on the existing /jobs API; this is the "v3" surface for the
// dedicated portal experience.

import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'

export const autoPrefix = '/jobs-portal'

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80)
}

async function meCandidate(req: FastifyRequest, reply: FastifyReply): Promise<string | null> {
  const uid = req.session!.user.id
  const c = await req.server.prisma.candidateProfile.findUnique({ where: { userId: uid }, select: { id: true } })
  if (!c) { reply.code(404).send({ error: 'No candidate profile yet' }); return null }
  return c.id
}
async function meEmployer(req: FastifyRequest, reply: FastifyReply): Promise<string | null> {
  const uid = req.session!.user.id
  const e = await req.server.prisma.employerProfile.findUnique({ where: { userId: uid }, select: { id: true } })
  if (!e) { reply.code(404).send({ error: 'No employer profile yet' }); return null }
  return e.id
}

const COMPANY_TYPES = ['hospital','clinic','wellness_centre','resort','pharma','government','recruiter','telemedicine','college','corporate']

const jobsPortal: FastifyPluginAsync = async (fastify) => {
  // ─── Public licensing guide listing ───────────────────────────────
  fastify.get('/licensing', async () => {
    return fastify.prisma.licensingGuide.findMany({
      orderBy: { jurisdiction: 'asc' },
      select: { id: true, jurisdiction: true, slug: true, title: true, description: true, processingTime: true, estimatedCost: true },
    })
  })
  fastify.get('/licensing/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string }
    const g = await fastify.prisma.licensingGuide.findUnique({ where: { slug } })
    if (!g) return reply.code(404).send({ error: 'not found' })
    return g
  })

  // ─── Public employer profile ──────────────────────────────────────
  fastify.get('/employers/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string }
    const e = await fastify.prisma.employerProfile.findUnique({ where: { slug } })
    if (!e) return reply.code(404).send({ error: 'not found' })
    const activeJobs = await fastify.prisma.job.findMany({
      where: { userId: e.userId, status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, title: true, location: true, type: true, specialty: true, salaryMin: true, salaryMax: true, currency: true, featured: true, urgent: true, createdAt: true },
    })
    return { employer: e, activeJobs }
  })

  // ─── Authed routes ────────────────────────────────────────────────
  fastify.register(async (sub) => {
    sub.addHook('preHandler', fastify.requireSession)

    // ─── Employer register / read / update ──────────────────────────
    sub.post('/employers/register', async (request, reply) => {
      const uid = request.session!.user.id
      const existing = await fastify.prisma.employerProfile.findUnique({ where: { userId: uid } })
      if (existing) return reply.code(409).send({ error: 'Employer profile exists', employerId: existing.id })
      const b = request.body as Record<string, unknown>
      const companyName = String(b.companyName ?? '').trim()
      const companyType = String(b.companyType ?? '').trim()
      if (!companyName || !COMPANY_TYPES.includes(companyType)) return reply.code(400).send({ error: 'companyName + valid companyType required' })
      const baseSlug = slugify(companyName) || 'employer'
      const slug = `${baseSlug}-${uid.slice(-6)}`
      return fastify.prisma.employerProfile.create({
        data: {
          userId: uid, companyName: companyName.slice(0, 200), companyType, slug,
          companyNameMl: typeof b.companyNameMl === 'string' ? b.companyNameMl.slice(0, 200) : null,
          description:   typeof b.description   === 'string' ? b.description.slice(0, 4000)  : '',
          website:       typeof b.website       === 'string' ? b.website.slice(0, 500) : null,
          phone:         typeof b.phone         === 'string' ? b.phone.slice(0, 32) : null,
          email:         typeof b.email         === 'string' ? b.email.slice(0, 200) : null,
          whatsapp:      typeof b.whatsapp      === 'string' ? b.whatsapp.slice(0, 32) : null,
          address:       typeof b.address       === 'string' ? b.address.slice(0, 500) : null,
          city:          typeof b.city          === 'string' ? b.city.slice(0, 100) : null,
          state:         typeof b.state         === 'string' ? b.state.slice(0, 100) : null,
          country:       typeof b.country       === 'string' && /^[A-Z]{2}$/.test(b.country) ? b.country : 'IN',
          employeeCount: typeof b.employeeCount === 'string' ? b.employeeCount.slice(0, 50) : null,
          foundedYear:   b.foundedYear ? Number(b.foundedYear) || null : null,
          accreditations: Array.isArray(b.accreditations) ? (b.accreditations as unknown[]).filter((x): x is string => typeof x === 'string').slice(0, 20) : [],
        },
      })
    })

    sub.get('/employers/me', async (request, reply) => {
      const eid = await meEmployer(request, reply); if (!eid) return
      return fastify.prisma.employerProfile.findUnique({ where: { id: eid } })
    })

    sub.patch('/employers/me', async (request, reply) => {
      const eid = await meEmployer(request, reply); if (!eid) return
      const b = request.body as Record<string, unknown>
      const data: Record<string, unknown> = {}
      for (const k of ['companyName','companyNameMl','description','descriptionMl','website','phone','email','whatsapp','address','city','state','country','employeeCount','logo','banner'] as const) {
        if (typeof b[k] === 'string') data[k] = (b[k] as string).slice(0, 4000)
      }
      if (b.foundedYear != null) data.foundedYear = Number(b.foundedYear) || null
      if (Array.isArray(b.accreditations)) data.accreditations = (b.accreditations as unknown[]).filter((x): x is string => typeof x === 'string').slice(0, 20)
      return fastify.prisma.employerProfile.update({ where: { id: eid }, data })
    })

    // ─── Employer dashboard stats ───────────────────────────────────
    sub.get('/employers/dashboard', async (request, reply) => {
      const uid = request.session!.user.id
      const eid = await meEmployer(request, reply); if (!eid) return
      const since = new Date(Date.now() - 30 * 86_400_000)
      const [employer, activeJobs, totalJobs, applicationsByStatus, recent] = await Promise.all([
        fastify.prisma.employerProfile.findUnique({ where: { id: eid } }),
        fastify.prisma.job.count({ where: { userId: uid, status: 'active' } }),
        fastify.prisma.job.count({ where: { userId: uid } }),
        fastify.prisma.jobApp.groupBy({
          by: ['status'],
          where: { job: { userId: uid } } as unknown as Record<string, unknown>,
          _count: { _all: true },
        }).catch(() => [] as Array<{ status: string; _count: { _all: number } }>),
        fastify.prisma.jobApp.findMany({
          where: { appliedAt: { gte: since } } as unknown as Record<string, unknown>,
          orderBy: { appliedAt: 'desc' },
          take: 10,
          include: { candidate: { select: { fullName: true, headline: true, currentLocation: true, totalExperience: true } } },
        }).catch(() => []),
      ])
      return { employer, stats: { activeJobs, totalJobs, applicationsByStatus, interviewsThisMonth: 0, hiresThisMonth: 0 }, recent }
    })

    // ─── Job create / update (richer than /api/jobs) ────────────────
    sub.post('/jobs', async (request, reply) => {
      const uid = request.session!.user.id
      const eid = await meEmployer(request, reply); if (!eid) return
      const b = request.body as Record<string, unknown>
      const title = String(b.title ?? '').trim()
      if (!title) return reply.code(400).send({ error: 'title required' })
      const job = await fastify.prisma.job.create({
        data: {
          userId: uid, type: typeof b.jobType === 'string' ? b.jobType : 'doctor',
          title: title.slice(0, 200),
          description: String(b.description ?? '').slice(0, 8000),
          kind: 'hiring', status: 'active', clinic: typeof b.companyName === 'string' ? b.companyName : null,
          location: typeof b.location === 'string' ? b.location : null,
          district: typeof b.district === 'string' ? b.district : null,
          specialty: typeof b.specialization === 'string' ? b.specialization : null,
          qualifications: Array.isArray(b.qualifications) ? (b.qualifications as unknown[]).filter((x): x is string => typeof x === 'string') : [],
          expMin: b.experienceMin != null ? Number(b.experienceMin) || 0 : null,
          expMax: b.experienceMax != null ? Number(b.experienceMax) || null : null,
          currency: typeof b.salaryCurrency === 'string' ? b.salaryCurrency : 'INR',
          salaryMin: b.salaryMin != null ? Number(b.salaryMin) || null : null,
          salaryMax: b.salaryMax != null ? Number(b.salaryMax) || null : null,
          deadline: typeof b.applicationDeadline === 'string' ? new Date(b.applicationDeadline) : null,
          remote: b.workMode === 'remote' || b.workMode === 'hybrid',
          urgent: Boolean(b.isUrgent),
          featured: Boolean(b.isFeatured),
          tags: Array.isArray(b.skills) ? (b.skills as unknown[]).filter((x): x is string => typeof x === 'string') : [],
          requirements: Array.isArray(b.requirements) ? (b.requirements as unknown[]).filter((x): x is string => typeof x === 'string') : [],
          benefits: Array.isArray(b.benefits) ? (b.benefits as unknown[]).filter((x): x is string => typeof x === 'string') : [],
          contactEmail: typeof b.contactEmail === 'string' ? b.contactEmail : null,
          postedByRole: 'employer',
        },
      })
      return job
    })

    sub.get('/jobs/mine', async (request, reply) => {
      const uid = request.session!.user.id
      const eid = await meEmployer(request, reply); if (!eid) return
      return fastify.prisma.job.findMany({
        where: { userId: uid },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { applications: true } } },
      })
    })

    // ─── ATS: applications for one job ──────────────────────────────
    sub.get('/jobs/:id/applications', async (request, reply) => {
      const uid = request.session!.user.id
      const eid = await meEmployer(request, reply); if (!eid) return
      const { id } = request.params as { id: string }
      const job = await fastify.prisma.job.findUnique({ where: { id }, select: { userId: true } })
      if (!job || job.userId !== uid) return reply.code(404).send({ error: 'not found' })
      return fastify.prisma.jobApp.findMany({
        where: { jobId: id },
        orderBy: { appliedAt: 'desc' },
        include: { candidate: { select: { id: true, fullName: true, headline: true, currentLocation: true, totalExperience: true, specializations: true, languages: true } } },
      })
    })

    sub.patch('/applications/:id', async (request, reply) => {
      const uid = request.session!.user.id
      const eid = await meEmployer(request, reply); if (!eid) return
      const { id } = request.params as { id: string }
      const app = await fastify.prisma.jobApp.findUnique({ where: { id }, select: { jobId: true } })
      if (!app) return reply.code(404).send({ error: 'not found' })
      const job = await fastify.prisma.job.findUnique({ where: { id: app.jobId }, select: { userId: true } })
      if (!job || job.userId !== uid) return reply.code(403).send({ error: 'forbidden' })
      const b = request.body as Record<string, unknown>
      const data: Record<string, unknown> = { statusUpdatedAt: new Date() }
      if (typeof b.status          === 'string') data.status          = b.status
      if (typeof b.rejectionReason === 'string') data.rejectionReason = b.rejectionReason.slice(0, 500)
      if (typeof b.notes           === 'string') data.notes           = b.notes.slice(0, 4000)
      return fastify.prisma.jobApp.update({ where: { id }, data })
    })

    // ─── Candidate register / read / update ─────────────────────────
    sub.post('/candidates/register', async (request, reply) => {
      const uid = request.session!.user.id
      const existing = await fastify.prisma.candidateProfile.findUnique({ where: { userId: uid } })
      if (existing) return reply.code(409).send({ error: 'Candidate profile exists', candidateId: existing.id })
      const b = request.body as Record<string, unknown>
      const fullName = String(b.fullName ?? '').trim() || (request.session!.user.name ?? request.session!.user.email.split('@')[0])
      const meUser = await fastify.prisma.user.findUnique({ where: { id: uid }, select: { doctorId: true } })
      // If user has a linked Doctor row, mirror profile fields.
      let doctor: { specialization: string; languages: string[]; experienceYears: number | null; district: string | null; country: string | null } | null = null
      if (meUser?.doctorId) {
        doctor = await fastify.prisma.doctor.findUnique({
          where: { id: meUser.doctorId },
          select: { specialization: true, languages: true, experienceYears: true, district: true, country: true },
        })
      }
      return fastify.prisma.candidateProfile.create({
        data: {
          userId: uid,
          doctorId: meUser?.doctorId ?? null,
          fullName: fullName.slice(0, 200),
          email: typeof b.email === 'string' ? b.email.slice(0, 200) : request.session!.user.email,
          phone: typeof b.phone === 'string' ? b.phone.slice(0, 32) : null,
          whatsapp: typeof b.whatsapp === 'string' ? b.whatsapp.slice(0, 32) : null,
          headline: typeof b.headline === 'string' ? b.headline.slice(0, 200) : null,
          currentLocation: typeof b.currentLocation === 'string' ? b.currentLocation : (doctor?.district ?? null),
          specializations: doctor?.specialization ? [doctor.specialization] : (Array.isArray(b.specializations) ? (b.specializations as unknown[]).filter((x): x is string => typeof x === 'string') : []),
          languages: doctor?.languages ?? (Array.isArray(b.languages) ? (b.languages as unknown[]).filter((x): x is string => typeof x === 'string') : []),
          totalExperience: doctor?.experienceYears ?? 0,
        },
      })
    })

    sub.get('/candidates/me', async (request, reply) => {
      const cid = await meCandidate(request, reply); if (!cid) return
      return fastify.prisma.candidateProfile.findUnique({
        where: { id: cid },
        include: { education: true, experience: { orderBy: { startDate: 'desc' } }, certifications: true },
      })
    })

    sub.patch('/candidates/me', async (request, reply) => {
      const cid = await meCandidate(request, reply); if (!cid) return
      const b = request.body as Record<string, unknown>
      const data: Record<string, unknown> = {}
      for (const k of ['fullName','fullNameMl','headline','phone','whatsapp','email','currentLocation','noticePeriod','availability','profileVisibility','resumeUrl','highestQualification','salaryCurrency'] as const) {
        if (typeof b[k] === 'string') data[k] = (b[k] as string).slice(0, 2000)
      }
      for (const k of ['preferredLocations','specializations','skills','languages','currentLicenses'] as const) {
        if (Array.isArray(b[k])) data[k] = (b[k] as unknown[]).filter((x): x is string => typeof x === 'string').slice(0, 50)
      }
      if (b.currentSalary  != null) data.currentSalary  = Number(b.currentSalary) || null
      if (b.expectedSalary != null) data.expectedSalary = Number(b.expectedSalary) || null
      if (b.totalExperience != null) data.totalExperience = Number(b.totalExperience) || 0
      if (b.willingToRelocate  !== undefined) data.willingToRelocate  = Boolean(b.willingToRelocate)
      if (b.openToTelemedicine !== undefined) data.openToTelemedicine = Boolean(b.openToTelemedicine)
      if (b.openToLocum        !== undefined) data.openToLocum        = Boolean(b.openToLocum)
      // Recompute simple completeness.
      const completeness = computeCompleteness(data, await fastify.prisma.candidateProfile.findUnique({ where: { id: cid } }))
      data.profileCompleteness = completeness
      return fastify.prisma.candidateProfile.update({ where: { id: cid }, data })
    })

    // Apply to a job
    sub.post('/jobs/:jobId/apply', async (request, reply) => {
      const cid = await meCandidate(request, reply); if (!cid) return
      const { jobId } = request.params as { jobId: string }
      const b = request.body as Record<string, unknown>
      const existing = await fastify.prisma.jobApp.findUnique({ where: { jobId_candidateId: { jobId, candidateId: cid } } })
      if (existing) return reply.code(409).send({ error: 'Already applied' })
      const job = await fastify.prisma.job.findUnique({ where: { id: jobId }, select: { id: true, status: true } })
      if (!job || job.status !== 'active') return reply.code(404).send({ error: 'Job not active' })
      return fastify.prisma.jobApp.create({
        data: {
          jobId, candidateId: cid,
          coverLetter: typeof b.coverLetter === 'string' ? b.coverLetter.slice(0, 4000) : null,
          resumeUrl:   typeof b.resumeUrl   === 'string' ? b.resumeUrl   : null,
        },
      })
    })

    sub.get('/applications', async (request, reply) => {
      const cid = await meCandidate(request, reply); if (!cid) return
      return fastify.prisma.jobApp.findMany({ where: { candidateId: cid }, orderBy: { appliedAt: 'desc' }, take: 200 })
    })
    sub.post('/applications/:id/withdraw', async (request, reply) => {
      const cid = await meCandidate(request, reply); if (!cid) return
      const { id } = request.params as { id: string }
      const a = await fastify.prisma.jobApp.findUnique({ where: { id } })
      if (!a || a.candidateId !== cid) return reply.code(404).send({ error: 'not found' })
      return fastify.prisma.jobApp.update({ where: { id }, data: { status: 'withdrawn', statusUpdatedAt: new Date() } })
    })

    // Saved jobs
    sub.get('/saved', async (request, reply) => {
      const cid = await meCandidate(request, reply); if (!cid) return
      return fastify.prisma.savedJob.findMany({ where: { candidateId: cid }, orderBy: { createdAt: 'desc' } })
    })
    sub.post('/saved/:jobId', async (request, reply) => {
      const cid = await meCandidate(request, reply); if (!cid) return
      const { jobId } = request.params as { jobId: string }
      return fastify.prisma.savedJob.upsert({
        where:  { candidateId_jobId: { candidateId: cid, jobId } },
        update: {},
        create: { candidateId: cid, jobId },
      })
    })
    sub.delete('/saved/:jobId', async (request, reply) => {
      const cid = await meCandidate(request, reply); if (!cid) return
      const { jobId } = request.params as { jobId: string }
      await fastify.prisma.savedJob.delete({ where: { candidateId_jobId: { candidateId: cid, jobId } } }).catch(() => {})
      return reply.code(204).send()
    })

    // Job alerts
    sub.get('/alerts', async (request, reply) => {
      const cid = await meCandidate(request, reply); if (!cid) return
      return fastify.prisma.jobAlert.findMany({ where: { candidateId: cid }, orderBy: { createdAt: 'desc' } })
    })
    sub.post('/alerts', async (request, reply) => {
      const cid = await meCandidate(request, reply); if (!cid) return
      const b = request.body as Record<string, unknown>
      return fastify.prisma.jobAlert.create({
        data: {
          candidateId: cid,
          keywords:       typeof b.keywords       === 'string' ? b.keywords.slice(0, 200) : null,
          specialization: typeof b.specialization === 'string' ? b.specialization.slice(0, 100) : null,
          location:       typeof b.location       === 'string' ? b.location.slice(0, 200) : null,
          jobType:        typeof b.jobType        === 'string' ? b.jobType.slice(0, 50)  : null,
          salaryMin:      b.salaryMin != null ? Number(b.salaryMin) || null : null,
          frequency:      typeof b.frequency      === 'string' && ['instant','daily','weekly'].includes(b.frequency) ? b.frequency : 'daily',
          channel:        typeof b.channel        === 'string' && ['email','whatsapp','both'].includes(b.channel) ? b.channel : 'email',
        },
      })
    })
    sub.patch('/alerts/:id', async (request, reply) => {
      const cid = await meCandidate(request, reply); if (!cid) return
      const { id } = request.params as { id: string }
      const a = await fastify.prisma.jobAlert.findUnique({ where: { id } })
      if (!a || a.candidateId !== cid) return reply.code(404).send({ error: 'not found' })
      const b = request.body as Record<string, unknown>
      return fastify.prisma.jobAlert.update({ where: { id }, data: { isActive: Boolean(b.isActive) } })
    })
    sub.delete('/alerts/:id', async (request, reply) => {
      const cid = await meCandidate(request, reply); if (!cid) return
      const { id } = request.params as { id: string }
      const a = await fastify.prisma.jobAlert.findUnique({ where: { id } })
      if (!a || a.candidateId !== cid) return reply.code(404).send({ error: 'not found' })
      await fastify.prisma.jobAlert.delete({ where: { id } })
      return reply.code(204).send()
    })

    // Locum availability
    sub.get('/locum/me', async (request, reply) => {
      const cid = await meCandidate(request, reply); if (!cid) return
      return fastify.prisma.locumAvailability.findMany({ where: { candidateId: cid }, orderBy: { startDate: 'asc' } })
    })
    sub.post('/locum', async (request, reply) => {
      const cid = await meCandidate(request, reply); if (!cid) return
      const b = request.body as Record<string, unknown>
      if (!b.startDate || !b.endDate) return reply.code(400).send({ error: 'startDate + endDate required' })
      return fastify.prisma.locumAvailability.create({
        data: {
          candidateId: cid,
          startDate: new Date(b.startDate as string),
          endDate:   new Date(b.endDate   as string),
          locations: Array.isArray(b.locations) ? (b.locations as unknown[]).filter((x): x is string => typeof x === 'string').slice(0, 20) : [],
          minDailyRate: b.minDailyRate != null ? Number(b.minDailyRate) || null : null,
          currency:  typeof b.currency === 'string' ? b.currency : 'INR',
          notes:     typeof b.notes    === 'string' ? b.notes.slice(0, 2000) : null,
        },
      })
    })

    // License tracking
    sub.get('/licensing/me', async (request, reply) => {
      const cid = await meCandidate(request, reply); if (!cid) return
      return fastify.prisma.candidateLicenseTrack.findMany({ where: { candidateId: cid } })
    })
    sub.put('/licensing/me/:slug', async (request, reply) => {
      const cid = await meCandidate(request, reply); if (!cid) return
      const { slug } = request.params as { slug: string }
      const b = request.body as Record<string, unknown>
      const stage = typeof b.stage === 'string' ? b.stage : 'documents_collected'
      return fastify.prisma.candidateLicenseTrack.upsert({
        where:  { candidateId_jurisdictionSlug: { candidateId: cid, jurisdictionSlug: slug } },
        update: { stage, notes: typeof b.notes === 'string' ? b.notes.slice(0, 2000) : null },
        create: { candidateId: cid, jurisdictionSlug: slug, stage },
      })
    })

    // Candidate search (employer-only)
    sub.get('/candidates/search', async (request, reply) => {
      const eid = await meEmployer(request, reply); if (!eid) return
      const { q, specialization, location, minExp, availability } = request.query as Record<string, string | undefined>
      const where: Record<string, unknown> = { profileVisibility: { in: ['public','recruiters_only'] } }
      if (q) where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { headline: { contains: q, mode: 'insensitive' } },
        { specializations: { has: q } },
      ]
      if (specialization) where.specializations = { has: specialization }
      if (location) where.currentLocation = { contains: location, mode: 'insensitive' }
      if (minExp) where.totalExperience = { gte: Number(minExp) || 0 }
      if (availability) where.availability = availability
      return fastify.prisma.candidateProfile.findMany({
        where, take: 50, orderBy: { updatedAt: 'desc' },
        select: { id: true, fullName: true, headline: true, currentLocation: true, totalExperience: true, specializations: true, languages: true, availability: true, openToTelemedicine: true, openToLocum: true },
      })
    })
  })
}

function computeCompleteness(updates: Record<string, unknown>, existing: Record<string, unknown> | null): number {
  const m = { ...(existing ?? {}), ...updates } as Record<string, unknown>
  let s = 0
  if (m.fullName)         s += 10
  if (m.headline)         s += 10
  if (m.phone || m.whatsapp) s += 10
  if (m.email)            s += 5
  if (m.currentLocation)  s += 10
  if (Array.isArray(m.specializations) && (m.specializations as unknown[]).length > 0) s += 15
  if (Array.isArray(m.languages)       && (m.languages as unknown[]).length > 0)       s += 5
  if (Array.isArray(m.skills)          && (m.skills as unknown[]).length > 0)          s += 10
  if (m.totalExperience && (m.totalExperience as number) > 0) s += 10
  if (m.resumeUrl)        s += 15
  return Math.min(100, s)
}

export default jobsPortal
