import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/colleges'

const KERALA_DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode',
  'Wayanad', 'Kannur', 'Kasaragod',
]

const COLLEGE_FIELDS = ['name', 'district', 'type', 'profile', 'contact', 'address'] as const

const colleges: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const { page = '1', limit = '20', district, type } = request.query as Record<string, string>
    const pageNum = Number(page) || 1
    const limitNum = Math.min(Number(limit) || 20, 100)
    const where: Record<string, unknown> = {}
    if (district) where.district = district
    if (type) where.type = type

    const [list, total] = await Promise.all([
      fastify.prisma.medicalCollege.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      fastify.prisma.medicalCollege.count({ where }),
    ])

    return {
      colleges: list,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    }
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const college = await fastify.prisma.medicalCollege.findUnique({ where: { id } })
    if (!college) return reply.code(404).send({ error: 'College not found' })
    return college
  })

  fastify.post('/', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const body = request.body as Record<string, string>
    if (!body.name || !body.district || !body.type) {
      return reply.code(400).send({ error: 'name, district, type required' })
    }
    const data: Record<string, unknown> = {}
    for (const k of COLLEGE_FIELDS) data[k] = body[k] ?? null
    return fastify.prisma.medicalCollege.create({
      data: { ...data, name: body.name, district: body.district, type: body.type },
    })
  })

  fastify.patch('/:id', { preHandler: fastify.requireAdmin }, async (request) => {
    const { id } = request.params as { id: string }
    const body = request.body as Record<string, string>
    const data: Record<string, unknown> = {}
    for (const k of COLLEGE_FIELDS) {
      if (body[k] !== undefined) data[k] = body[k] || null
    }
    return fastify.prisma.medicalCollege.update({ where: { id }, data })
  })

  fastify.delete('/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.medicalCollege.delete({ where: { id } })
    return reply.code(204).send()
  })

  fastify.get('/types', async () => [
    { id: 'ayurveda', name: 'Ayurveda College', description: 'BAMS' },
    { id: 'modern', name: 'Modern Medicine', description: 'MBBS' },
    { id: 'nursing', name: 'Nursing College' },
    { id: 'pharmacy', name: 'Pharmacy College' },
    { id: 'research', name: 'Research Institute' },
  ])

  fastify.get('/districts', async () => KERALA_DISTRICTS)
}

export default colleges
