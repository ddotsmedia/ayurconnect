import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/jobs'

const KERALA_DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode',
  'Wayanad', 'Kannur', 'Kasaragod',
]

const STR_ARR = (v: unknown, max = 20): string[] =>
  Array.isArray(v) ? (v as unknown[]).filter((x): x is string => typeof x === 'string').slice(0, max) : []
const STR = (v: unknown, max = 500): string | null =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null
const INT = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? Math.trunc(v) : null

const jobs: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const q = request.query as Record<string, string | undefined>
    const pageNum  = Number(q.page)  || 1
    const limitNum = Math.min(Number(q.limit) || 12, 50)
    const where: Record<string, unknown> = {}

    // Default to status=active for public consumption; admin can pass status=all.
    if (q.status && q.status !== 'all') where.status = q.status
    else if (q.includeAll !== '1')      where.status = 'active'

    if (q.type)        where.type = q.type
    if (q.district)    where.district = q.district
    if (q.specialty)   where.specialty = q.specialty
    if (q.kind)        where.kind = q.kind
    if (q.featured)    where.featured = q.featured === '1' || q.featured === 'true'
    if (q.urgent)      where.urgent   = q.urgent   === '1' || q.urgent   === 'true'
    if (q.remote)      where.remote   = q.remote === '1' || q.remote === 'true'
    if (q.tag)         where.tags = { has: q.tag }
    if (q.expMaxLte)   where.expMin = { lte: Math.max(0, parseInt(q.expMaxLte, 10) || 0) }
    if (q.search) {
      where.OR = [
        { title:       { contains: q.search, mode: 'insensitive' as const } },
        { description: { contains: q.search, mode: 'insensitive' as const } },
        { clinic:      { contains: q.search, mode: 'insensitive' as const } },
        { tags:        { has: q.search } },
      ]
    }

    // Hide doctor-availability posts from anonymous + USER viewers
    // (visible to verified clinics + admin only).
    const role = request.session?.user?.role
    const canSeeAvailability = role === 'HOSPITAL' || role === 'HOSPITAL_PENDING' || role === 'ADMIN'
    if (!canSeeAvailability && !q.kind) {
      where.kind = 'hiring'
    }

    const sort = q.sort
    const orderBy: Record<string, 'asc' | 'desc'>[] =
      sort === 'salary-desc' ? [{ salaryMax: 'desc' }, { createdAt: 'desc' }] :
      sort === 'salary-asc'  ? [{ salaryMax: 'asc'  }, { createdAt: 'desc' }] :
      sort === 'deadline'    ? [{ deadline:  'asc'  }, { createdAt: 'desc' }] :
      sort === 'featured'    ? [{ featured:  'desc' }, { createdAt: 'desc' }] :
                               [{ featured:  'desc' }, { createdAt: 'desc' }]

    const [jobsList, total] = await Promise.all([
      fastify.prisma.job.findMany({
        where, orderBy,
        include: {
          user: { select: { id: true, name: true } },
          _count: { select: { applications: true } },
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      fastify.prisma.job.count({ where }),
    ])

    return {
      jobs: jobsList.map((j) => ({ ...j, applicationCount: j._count?.applications ?? 0 })),
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    }
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const job = await fastify.prisma.job.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        _count: { select: { applications: true } },
      },
    })
    if (!job) return reply.code(404).send({ error: 'Job not found' })
    // Don't expose pending/rejected posts publicly.
    const role = request.session?.user?.role
    const isOwner = request.session?.user?.id === job.userId
    const isAdmin = role === 'ADMIN'
    if (job.status !== 'active' && !isOwner && !isAdmin) {
      return reply.code(404).send({ error: 'Job not found' })
    }
    return { ...job, applicationCount: job._count?.applications ?? 0 }
  })

  fastify.post('/', { preHandler: fastify.requireSession }, async (request, reply) => {
    const sess = request.session!
    const role = sess.user.role
    if (role === 'USER' || role === 'THERAPIST') {
      return reply.code(403).send({
        error: 'Only doctors, hospitals, or admins can post jobs. Register as a doctor or hospital first.',
        code:  'role-required',
      })
    }
    const body = request.body as Record<string, unknown>
    const kind: 'hiring' | 'availability' = role === 'DOCTOR' || role === 'DOCTOR_PENDING' ? 'availability' : 'hiring'

    const title = STR(body.title, 200)
    if (!title) return reply.code(400).send({ error: 'title required' })

    // Hospitals are bound to pending status until admin approval. Doctor
    // availability and admin posts can go live immediately. Admin may
    // force-publish via body.publishImmediately.
    const initialStatus: 'pending' | 'active' =
      role === 'ADMIN'
        ? (body.publishImmediately === false ? 'pending' : (typeof body.status === 'string' ? (body.status as 'pending' | 'active') : 'active'))
        : kind === 'availability'
          ? 'active'
          : 'pending'

    const created = await fastify.prisma.job.create({
      data: {
        userId:          sess.user.id,
        title,
        description:     STR(body.description, 8000) ?? '',
        type:            STR(body.type, 40) ?? 'doctor',
        kind,
        status:          initialStatus,
        clinic:          STR(body.clinic, 200),
        location:        STR(body.location, 200),
        district:        STR(body.district, 100),
        specialty:       STR(body.specialty, 80),
        qualifications:  STR_ARR(body.qualifications, 10),
        expMin:          INT(body.expMin),
        expMax:          INT(body.expMax),
        currency:        typeof body.currency === 'string' && ['INR', 'AED', 'USD'].includes(body.currency) ? body.currency : null,
        salaryMin:       INT(body.salaryMin),
        salaryMax:       INT(body.salaryMax),
        salary:          STR(body.salaryDisplay, 80),
        deadline:        typeof body.deadline === 'string' ? new Date(body.deadline) : null,
        remote:          body.remote === true,
        urgent:          body.urgent === true,
        featured:        role === 'ADMIN' && body.featured === true,
        tags:            STR_ARR(body.tags, 20),
        requirements:    STR_ARR(body.requirements, 30),
        benefits:        STR_ARR(body.benefits, 20),
        contactEmail:    STR(body.contactEmail, 200),
        contactKind:     typeof body.contactKind === 'string' && ['email', 'whatsapp', 'phone'].includes(body.contactKind) ? body.contactKind : null,
        contactValue:    STR(body.contactValue, 200),
        availFrom:       typeof body.availFrom === 'string' ? new Date(body.availFrom) : null,
        availDurationDays: INT(body.availDurationDays),
        postedByRole:    role,
        internalNotes:   role === 'ADMIN' ? STR(body.internalNotes, 2000) : null,
      },
      include: { user: { select: { id: true, name: true } } },
    })
    return reply.code(201).send(created)
  })

  // Admin-only patch supports all editable fields incl. status/featured.
  const ADMIN_PATCH = [
    'title', 'description', 'type', 'district', 'salary', 'kind', 'status',
    'clinic', 'location', 'specialty', 'qualifications', 'expMin', 'expMax',
    'currency', 'salaryMin', 'salaryMax', 'deadline', 'remote', 'urgent',
    'featured', 'tags', 'requirements', 'benefits', 'contactEmail',
    'rejectionReason', 'internalNotes',
  ] as const

  fastify.patch('/:id', { preHandler: fastify.requireAdmin }, async (request) => {
    const { id } = request.params as { id: string }
    const body = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    for (const k of ADMIN_PATCH) {
      if (body[k] === undefined) continue
      if (k === 'qualifications' || k === 'tags' || k === 'requirements' || k === 'benefits') data[k] = STR_ARR(body[k], 30)
      else if (k === 'remote' || k === 'urgent' || k === 'featured')                          data[k] = body[k] === true
      else if (k === 'expMin' || k === 'expMax' || k === 'salaryMin' || k === 'salaryMax')    data[k] = INT(body[k])
      else if (k === 'deadline')                                                              data[k] = typeof body[k] === 'string' ? new Date(body[k] as string) : null
      else                                                                                    data[k] = body[k] ?? null
    }
    if (body.status !== undefined) data.reviewedAt = new Date(), data.reviewedById = request.session!.user.id
    return fastify.prisma.job.update({ where: { id }, data })
  })

  fastify.delete('/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.job.delete({ where: { id } })
    return reply.code(204).send()
  })

  // ─── Applications ──────────────────────────────────────────────────────
  // POST /jobs/:id/apply — anonymous + signed-in. Idempotent by (jobId,email).
  fastify.post('/:id/apply', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = request.body as Record<string, unknown>
    const job = await fastify.prisma.job.findUnique({ where: { id }, select: { id: true, status: true } })
    if (!job || job.status !== 'active') return reply.code(404).send({ error: 'Job not found or no longer accepting applications' })

    const name = STR(body.name, 120)
    const phone = STR(body.phone, 40)
    // Signed-in one-click apply: email defaults to the session user's email
    // so the modal doesn't need to collect it. Anonymous apply still requires
    // an email in the body.
    const email = STR(body.email, 200) ?? (request.session?.user.email ?? null)
    if (!name || !email || !phone) return reply.code(400).send({ error: 'name, phone required (email required for anonymous apply)' })

    const existing = await fastify.prisma.jobApplication.findUnique({ where: { jobId_email: { jobId: id, email } } })
    if (existing) return reply.code(409).send({ error: 'You have already applied to this job with this email', code: 'already-applied' })

    const created = await fastify.prisma.jobApplication.create({
      data: {
        jobId:           id,
        applicantUserId: request.session?.user.id ?? null,
        name, email, phone,
        qualification:   STR(body.qualification, 80),
        experience:      STR(body.experience, 80),
        coverNote:       STR(body.coverNote, 2000),
      },
    })
    return reply.code(201).send({ id: created.id, status: created.status })
  })

  // GET /jobs/:id/applications — job owner or admin only.
  fastify.get('/:id/applications', { preHandler: fastify.requireSession }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const sess = request.session!
    const job = await fastify.prisma.job.findUnique({ where: { id }, select: { userId: true } })
    if (!job) return reply.code(404).send({ error: 'Job not found' })
    if (job.userId !== sess.user.id && sess.user.role !== 'ADMIN') return reply.code(403).send({ error: 'forbidden' })
    const apps = await fastify.prisma.jobApplication.findMany({
      where: { jobId: id },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
    return { applications: apps }
  })

  // PATCH /jobs/applications/:id — job owner or admin updates status.
  fastify.patch('/applications/:id', { preHandler: fastify.requireSession }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const sess = request.session!
    const body = request.body as { status?: string }
    if (!body.status || !['new', 'reviewed', 'shortlisted', 'rejected'].includes(body.status)) {
      return reply.code(400).send({ error: 'invalid status' })
    }
    const app = await fastify.prisma.jobApplication.findUnique({ where: { id }, include: { job: { select: { userId: true } } } })
    if (!app) return reply.code(404).send({ error: 'Application not found' })
    if (app.job.userId !== sess.user.id && sess.user.role !== 'ADMIN') return reply.code(403).send({ error: 'forbidden' })
    return fastify.prisma.jobApplication.update({ where: { id }, data: { status: body.status } })
  })

  fastify.get('/job-types', async () => [
    { id: 'doctor',     name: 'Ayurvedic Doctor',     description: 'BAMS qualified practitioners' },
    { id: 'therapist',  name: 'Therapist',            description: 'Panchakarma and therapy specialists' },
    { id: 'pharmacist', name: 'Pharmacist',           description: 'Ayurvedic pharmacy professionals' },
    { id: 'government', name: 'Government Positions', description: 'AYUSH government roles' },
    { id: 'clinic',     name: 'Clinic Staff',         description: 'Clinic management and support' },
    { id: 'teaching',   name: 'Teaching',             description: 'Academic and training positions' },
  ])

  fastify.get('/districts', async () => KERALA_DISTRICTS)
}

export default jobs
