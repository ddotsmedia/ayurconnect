import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/jobs'

const KERALA_DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode',
  'Wayanad', 'Kannur', 'Kasaragod',
]

const jobs: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const { page = '1', limit = '10', type, district, search } = request.query as Record<string, string>
    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 10
    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (district) where.district = district
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [jobsList, total] = await Promise.all([
      fastify.prisma.job.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      fastify.prisma.job.count({ where }),
    ])

    return {
      jobs: jobsList,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    }
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const job = await fastify.prisma.job.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    if (!job) return reply.code(404).send({ error: 'Job not found' })
    return job
  })

  fastify.post('/', { preHandler: fastify.requireSession }, async (request, reply) => {
    const { title, description, type, district, salary } = request.body as Record<string, string>
    if (!title || !description || !type) {
      return reply.code(400).send({ error: 'title, description, type required' })
    }
    const userId = request.session!.user.id
    const job = await fastify.prisma.job.create({
      data: { title, description, type, district, salary, userId },
      include: { user: { select: { id: true, name: true } } },
    })
    return reply.code(201).send(job)
  })

  fastify.patch('/:id', { preHandler: fastify.requireAdmin }, async (request) => {
    const { id } = request.params as { id: string }
    const body = request.body as Record<string, string>
    const data: Record<string, unknown> = {}
    for (const k of ['title', 'description', 'type', 'district', 'salary'] as const) {
      if (body[k] !== undefined) data[k] = body[k] || null
    }
    return fastify.prisma.job.update({ where: { id }, data })
  })

  fastify.delete('/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.job.delete({ where: { id } })
    return reply.code(204).send()
  })

  fastify.get('/job-types', async () => [
    { id: 'doctor', name: 'Ayurvedic Doctor', description: 'BAMS qualified practitioners' },
    { id: 'therapist', name: 'Therapist', description: 'Panchakarma and therapy specialists' },
    { id: 'pharmacist', name: 'Pharmacist', description: 'Ayurvedic pharmacy professionals' },
    { id: 'government', name: 'Government Positions', description: 'AYUSH government roles' },
    { id: 'clinic', name: 'Clinic Staff', description: 'Clinic management and support' },
    { id: 'teaching', name: 'Teaching', description: 'Academic and training positions' },
  ])

  fastify.get('/districts', async () => KERALA_DISTRICTS)
}

export default jobs
