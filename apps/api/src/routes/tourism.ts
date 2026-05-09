import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/tourism'

const KERALA_DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode',
  'Wayanad', 'Kannur', 'Kasaragod',
]

const tourism: FastifyPluginAsync = async (fastify) => {
  fastify.get('/packages', async (request) => {
    const { page = '1', limit = '20', location, minPrice, maxPrice } = request.query as Record<string, string>
    const pageNum = Number(page) || 1
    const limitNum = Math.min(Number(limit) || 20, 100)
    const where: Record<string, unknown> = {}
    if (location) where.location = { contains: location, mode: 'insensitive' }
    if (minPrice || maxPrice) {
      const price: Record<string, number> = {}
      if (minPrice) price.gte = Number(minPrice)
      if (maxPrice) price.lte = Number(maxPrice)
      where.price = price
    }

    const [packages, total] = await Promise.all([
      fastify.prisma.medicalTourismPackage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      fastify.prisma.medicalTourismPackage.count({ where }),
    ])

    return {
      packages,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    }
  })

  fastify.get('/packages/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const pkg = await fastify.prisma.medicalTourismPackage.findUnique({ where: { id } })
    if (!pkg) return reply.code(404).send({ error: 'Package not found' })
    return pkg
  })

  fastify.post('/packages', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const body = request.body as Record<string, string>
    if (!body.title || !body.description || !body.duration || !body.location) {
      return reply.code(400).send({ error: 'title, description, duration, location required' })
    }
    const pkg = await fastify.prisma.medicalTourismPackage.create({
      data: {
        title: body.title,
        description: body.description,
        duration: Number(body.duration),
        price: body.price ? Number(body.price) : null,
        location: body.location,
        includes: body.includes || null,
      },
    })
    return reply.code(201).send(pkg)
  })

  fastify.patch('/packages/:id', { preHandler: fastify.requireAdmin }, async (request) => {
    const { id } = request.params as { id: string }
    const body = request.body as Record<string, string>
    const data: Record<string, unknown> = {}
    if (body.title !== undefined) data.title = body.title
    if (body.description !== undefined) data.description = body.description
    if (body.duration !== undefined) data.duration = Number(body.duration)
    if (body.price !== undefined) data.price = body.price === '' ? null : Number(body.price)
    if (body.location !== undefined) data.location = body.location
    if (body.includes !== undefined) data.includes = body.includes || null
    return fastify.prisma.medicalTourismPackage.update({ where: { id }, data })
  })

  fastify.delete('/packages/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.medicalTourismPackage.delete({ where: { id } })
    return reply.code(204).send()
  })

  fastify.get('/locations', async () => KERALA_DISTRICTS)

  fastify.get('/package-types', async () => [
    { id: 'panchakarma', name: 'Panchakarma Treatment', duration: '7-21 days' },
    { id: 'rejuvenation', name: 'Rejuvenation Therapy', duration: '14-28 days' },
    { id: 'chronic-care', name: 'Chronic Disease Management', duration: '21-45 days' },
    { id: 'weight-management', name: 'Weight Management', duration: '14-30 days' },
    { id: 'stress-relief', name: 'Stress Relief & Mental Health', duration: '7-14 days' },
    { id: 'beauty-wellness', name: 'Beauty & Wellness', duration: '7-14 days' },
  ])
}

export default tourism
