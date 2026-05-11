import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/me'

const me: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireSession)

  fastify.get('/', async (request) => {
    const id = request.session!.user.id
    const user = await fastify.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, role: true, image: true,
        prakriti: true, phone: true, emailVerified: true,
        doctorId: true, hospitalId: true,
        createdAt: true, updatedAt: true,
        ownedDoctor: {
          select: {
            id: true, name: true, specialization: true, district: true,
            ccimVerified: true, qualification: true, experienceYears: true,
            languages: true, availableDays: true, availableForOnline: true,
            profile: true, bio: true, photoUrl: true,
          },
        },
        ownedHospital: {
          select: {
            id: true, name: true, type: true, district: true,
            ccimVerified: true, ayushCertified: true, panchakarma: true, nabh: true,
            establishedYear: true, services: true, profile: true,
            contact: true, address: true, latitude: true, longitude: true,
          },
        },
      },
    })
    if (!user) return { user: null }

    const [savedCount, apptCount, postCount, upcomingAppts] = await Promise.all([
      fastify.prisma.savedDoctor.count({ where: { userId: id } }),
      fastify.prisma.appointment.count({ where: { userId: id } }),
      fastify.prisma.post.count({ where: { userId: id } }),
      fastify.prisma.appointment.findMany({
        where: { userId: id, dateTime: { gte: new Date() }, status: { in: ['scheduled', 'confirmed'] } },
        include: { doctor: { select: { id: true, name: true, specialization: true } } },
        orderBy: { dateTime: 'asc' },
        take: 3,
      }),
    ])

    return {
      user,
      stats: { savedCount, apptCount, postCount },
      upcomingAppts,
    }
  })

  fastify.patch('/', async (request, reply) => {
    const id = request.session!.user.id
    const body = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    if (typeof body.name === 'string')     data.name = body.name
    if (typeof body.phone === 'string')    data.phone = body.phone || null
    if (typeof body.prakriti === 'string') data.prakriti = body.prakriti || null
    if (typeof body.image === 'string')    data.image = body.image || null
    if (typeof body.country === 'string')  data.country = /^[A-Z]{2}$/.test(body.country) ? body.country : null
    if (typeof body.state === 'string')    data.state = body.state.trim().slice(0, 100) || null
    if (Object.keys(data).length === 0) return reply.code(400).send({ error: 'no editable fields' })
    return fastify.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, prakriti: true, phone: true, image: true, country: true, state: true },
    })
  })

  // ─── Promote-to-Doctor: a USER becomes DOCTOR_PENDING + creates a Doctor row ───
  // Called from /register/doctor right after Better Auth signup. Idempotent: if
  // the user already owns a doctor, returns 409. Sets ccimVerified=false; admin
  // approves later via /admin/verify.
  fastify.post('/promote-to-doctor', async (request, reply) => {
    const userId = request.session!.user.id
    const existing = await fastify.prisma.user.findUnique({ where: { id: userId }, select: { doctorId: true, role: true } })
    if (!existing) return reply.code(404).send({ error: 'user not found' })
    if (existing.doctorId) return reply.code(409).send({ error: 'user already linked to a doctor profile', doctorId: existing.doctorId })

    const body = request.body as Record<string, unknown>
    const name           = String(body.name ?? '').trim()
    const specialization = String(body.specialization ?? '').trim()
    const district       = String(body.district ?? '').trim()
    if (!name || !specialization || !district) {
      return reply.code(400).send({ error: 'name, specialization, district required' })
    }
    const country = typeof body.country === 'string' && /^[A-Z]{2}$/.test(body.country) ? body.country : 'IN'
    const state   = typeof body.state === 'string' && body.state.trim() ? body.state.trim().slice(0, 100) : null

    const doctor = await fastify.prisma.doctor.create({
      data: {
        name,
        specialization,
        country,
        state,
        district,
        ccimVerified: false, // admin-approved later
        qualification:   typeof body.qualification === 'string'   ? body.qualification   : null,
        experienceYears: body.experienceYears != null && !Number.isNaN(Number(body.experienceYears)) ? Number(body.experienceYears) : null,
        contact:         typeof body.contact === 'string' ? body.contact : null,
        address:         typeof body.address === 'string' ? body.address : null,
        languages:       Array.isArray(body.languages) ? (body.languages as unknown[]).filter((x): x is string => typeof x === 'string') : [],
        availableDays:   Array.isArray(body.availableDays) ? (body.availableDays as unknown[]).filter((x): x is string => typeof x === 'string') : [],
        profile:         typeof body.profile === 'string' ? body.profile : null,
        bio:             typeof body.bio === 'string' ? body.bio : null,
      },
    })
    await fastify.prisma.user.update({
      where: { id: userId },
      data: { doctorId: doctor.id, role: existing.role === 'ADMIN' ? 'ADMIN' : 'DOCTOR_PENDING' },
    })
    return { doctor, role: 'DOCTOR_PENDING' }
  })

  // ─── Promote-to-Hospital: same flow, for hospital owners/admins ───
  fastify.post('/promote-to-hospital', async (request, reply) => {
    const userId = request.session!.user.id
    const existing = await fastify.prisma.user.findUnique({ where: { id: userId }, select: { hospitalId: true, role: true } })
    if (!existing) return reply.code(404).send({ error: 'user not found' })
    if (existing.hospitalId) return reply.code(409).send({ error: 'user already linked to a hospital', hospitalId: existing.hospitalId })

    const body = request.body as Record<string, unknown>
    const name     = String(body.name ?? '').trim()
    const type     = String(body.type ?? '').trim()
    const district = String(body.district ?? '').trim()
    if (!name || !type || !district) {
      return reply.code(400).send({ error: 'name, type, district required' })
    }
    const country = typeof body.country === 'string' && /^[A-Z]{2}$/.test(body.country) ? body.country : 'IN'
    const state   = typeof body.state === 'string' && body.state.trim() ? body.state.trim().slice(0, 100) : null

    const hospital = await fastify.prisma.hospital.create({
      data: {
        name,
        type,
        country,
        state,
        district,
        ccimVerified:    false,
        ayushCertified:  Boolean(body.ayushCertified),
        panchakarma:     Boolean(body.panchakarma),
        nabh:            Boolean(body.nabh),
        establishedYear: body.establishedYear != null && !Number.isNaN(Number(body.establishedYear)) ? Number(body.establishedYear) : null,
        services:        Array.isArray(body.services) ? (body.services as unknown[]).filter((x): x is string => typeof x === 'string') : [],
        profile:         typeof body.profile === 'string' ? body.profile : null,
        contact:         typeof body.contact === 'string' ? body.contact : null,
        address:         typeof body.address === 'string' ? body.address : null,
      },
    })
    await fastify.prisma.user.update({
      where: { id: userId },
      data: { hospitalId: hospital.id, role: existing.role === 'ADMIN' ? 'ADMIN' : 'HOSPITAL_PENDING' },
    })
    return { hospital, role: 'HOSPITAL_PENDING' }
  })

  // ─── Hospital self-edit: only the user with user.hospitalId can edit it ───
  fastify.patch('/hospital', async (request, reply) => {
    const userId = request.session!.user.id
    const user = await fastify.prisma.user.findUnique({ where: { id: userId }, select: { hospitalId: true } })
    if (!user?.hospitalId) return reply.code(403).send({ error: 'no linked hospital profile' })

    const body = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    const setStr = (k: string) => { if (typeof body[k] === 'string') data[k] = body[k] }
    const setStrOrNull = (k: string) => { if (typeof body[k] === 'string') data[k] = (body[k] as string) || null }
    const setIntOrNull = (k: string) => { if (body[k] == null) return; const n = Number(body[k]); if (!Number.isNaN(n)) data[k] = n }
    const setFloatOrNull = (k: string) => { if (body[k] == null) return; const n = Number(body[k]); if (!Number.isNaN(n)) data[k] = n }
    const setBool = (k: string) => { if (typeof body[k] === 'boolean') data[k] = body[k] }
    const setStrArray = (k: string) => { if (Array.isArray(body[k])) data[k] = (body[k] as unknown[]).filter((v): v is string => typeof v === 'string') }

    setStr('name')
    setStr('type')
    setStr('district')
    setStr('country')
    setStrOrNull('state')
    setStrOrNull('profile')
    setStrOrNull('contact')
    setStrOrNull('address')
    setIntOrNull('establishedYear')
    setFloatOrNull('latitude')
    setFloatOrNull('longitude')
    setBool('ayushCertified')
    setBool('panchakarma')
    setBool('nabh')
    setStrArray('services')

    if (Object.keys(data).length === 0) return reply.code(400).send({ error: 'no editable fields' })

    return fastify.prisma.hospital.update({ where: { id: user.hospitalId }, data })
  })

  // Doctor self-edit: only the user with user.doctorId === <doctor id> can edit it.
  fastify.patch('/doctor', async (request, reply) => {
    const userId = request.session!.user.id
    const user = await fastify.prisma.user.findUnique({ where: { id: userId }, select: { doctorId: true } })
    if (!user?.doctorId) return reply.code(403).send({ error: 'no linked doctor profile' })

    const body = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    const setStr = (k: string) => { if (typeof body[k] === 'string') data[k] = body[k] }
    const setStrOrNull = (k: string) => { if (typeof body[k] === 'string') data[k] = (body[k] as string) || null }
    const setIntOrNull = (k: string) => { if (body[k] == null) return; const n = Number(body[k]); if (!Number.isNaN(n)) data[k] = n }
    const setBool = (k: string) => { if (typeof body[k] === 'boolean') data[k] = body[k] }
    const setStrArray = (k: string) => { if (Array.isArray(body[k])) data[k] = (body[k] as unknown[]).filter((v): v is string => typeof v === 'string') }

    setStr('name')
    setStr('specialization')
    setStr('district')
    setStr('country')
    setStrOrNull('state')
    setStrOrNull('qualification')
    setStrOrNull('profile')
    setStrOrNull('bio')
    setStrOrNull('contact')
    setStrOrNull('address')
    setStrOrNull('photoUrl')
    setIntOrNull('experienceYears')
    setBool('availableForOnline')
    setStrArray('languages')
    setStrArray('availableDays')

    if (Object.keys(data).length === 0) return reply.code(400).send({ error: 'no editable fields' })

    return fastify.prisma.doctor.update({ where: { id: user.doctorId }, data })
  })
}

export default me
