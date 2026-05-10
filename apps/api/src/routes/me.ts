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
        prakriti: true, phone: true, emailVerified: true, doctorId: true,
        createdAt: true, updatedAt: true,
        ownedDoctor: {
          select: {
            id: true, name: true, specialization: true, district: true,
            ccimVerified: true, qualification: true, experienceYears: true,
            languages: true, availableDays: true, availableForOnline: true,
            consultationFee: true, profile: true, bio: true, photoUrl: true,
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
    if (Object.keys(data).length === 0) return reply.code(400).send({ error: 'no editable fields' })
    return fastify.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, prakriti: true, phone: true, image: true },
    })
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
    setStrOrNull('qualification')
    setStrOrNull('profile')
    setStrOrNull('bio')
    setStrOrNull('contact')
    setStrOrNull('address')
    setStrOrNull('photoUrl')
    setIntOrNull('experienceYears')
    setIntOrNull('consultationFee')
    setBool('availableForOnline')
    setStrArray('languages')
    setStrArray('availableDays')

    if (Object.keys(data).length === 0) return reply.code(400).send({ error: 'no editable fields' })

    return fastify.prisma.doctor.update({ where: { id: user.doctorId }, data })
  })
}

export default me
