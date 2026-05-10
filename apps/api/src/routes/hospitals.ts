import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/hospitals'

const FLAG_FIELDS = ['ccimVerified', 'ayushCertified', 'panchakarma', 'nabh'] as const
const STRING_FIELDS = ['name', 'type', 'district', 'profile', 'contact', 'address'] as const

const hospitals: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const { district, type, q, verified, limit } = request.query as Record<string, string>
    const where: Record<string, unknown> = {}
    if (district) where.district = { contains: district, mode: 'insensitive' }
    if (type)     where.type     = { contains: type, mode: 'insensitive' }
    if (verified === 'true')  where.ccimVerified = true
    if (verified === 'false') where.ccimVerified = false
    if (q) where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { type: { contains: q, mode: 'insensitive' } },
      { district: { contains: q, mode: 'insensitive' } },
    ]
    const take = Math.min(Number(limit) || 100, 500)
    return fastify.prisma.hospital.findMany({
      where,
      include: { reviews: true },
      orderBy: { createdAt: 'desc' },
      take,
    })
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const hospital = await fastify.prisma.hospital.findUnique({
      where: { id },
      include: {
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    if (!hospital) return reply.code(404).send({ error: 'Hospital not found' })
    return hospital
  })

  fastify.post('/', { preHandler: fastify.requireAdmin }, async (request) => {
    const body = request.body as Record<string, unknown>
    return fastify.prisma.hospital.create({
      data: {
        name: String(body.name),
        type: String(body.type),
        district: String(body.district),
        ccimVerified: Boolean(body.ccimVerified),
        ayushCertified: Boolean(body.ayushCertified),
        panchakarma: Boolean(body.panchakarma),
        nabh: Boolean(body.nabh),
        profile: (body.profile as string) || null,
        contact: (body.contact as string) || null,
        address: (body.address as string) || null,
        latitude: body.latitude != null && body.latitude !== '' ? Number(body.latitude) : null,
        longitude: body.longitude != null && body.longitude !== '' ? Number(body.longitude) : null,
      },
    })
  })

  fastify.patch('/:id', { preHandler: fastify.requireAdmin }, async (request) => {
    const { id } = request.params as { id: string }
    const body = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    for (const k of STRING_FIELDS) {
      if (body[k] !== undefined) data[k] = body[k]
    }
    for (const k of FLAG_FIELDS) {
      if (body[k] !== undefined) data[k] = Boolean(body[k])
    }
    if (body.latitude !== undefined) data.latitude = body.latitude === '' || body.latitude === null ? null : Number(body.latitude)
    if (body.longitude !== undefined) data.longitude = body.longitude === '' || body.longitude === null ? null : Number(body.longitude)
    return fastify.prisma.hospital.update({ where: { id }, data })
  })

  fastify.delete('/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.hospital.delete({ where: { id } })
    return reply.code(204).send()
  })
}

export default hospitals
