import type { FastifyPluginAsync } from 'fastify'
import { cached, bust } from '../lib/cache.js'
import { upsertDoc, deleteDoc } from '../lib/search-sync.js'

export const autoPrefix = '/herbs'

const HERB_FIELDS = ['name', 'sanskrit', 'english', 'malayalam', 'rasa', 'guna', 'virya', 'vipaka', 'description', 'uses'] as const

const herbs: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const { page = '1', limit = '12', search, rasa, guna } = request.query as Record<string, string>
    const pageNum = Number(page) || 1
    const limitNum = Math.min(Number(limit) || 12, 100)

    // Cache is only safe for unfiltered list pages (the most-hit case).
    // Filtered queries fall through to Postgres directly.
    const cacheKey = `herbs:list:p${pageNum}:l${limitNum}` + (search ? '' : '') // skip cache when search present
    const skipCache = !!search || !!rasa || !!guna

    const compute = async () => {
      const where: Record<string, unknown> = {}
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { sanskrit: { contains: search, mode: 'insensitive' } },
          { english: { contains: search, mode: 'insensitive' } },
          { malayalam: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { uses: { contains: search, mode: 'insensitive' } },
        ]
      }
      if (rasa) where.rasa = rasa
      if (guna) where.guna = guna

      const [herbsList, total] = await Promise.all([
        fastify.prisma.herb.findMany({
          where,
          orderBy: { name: 'asc' },
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
        }),
        fastify.prisma.herb.count({ where }),
      ])
      return {
        herbs: herbsList,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      }
    }

    return skipCache ? compute() : cached(fastify, cacheKey, 3600, compute)
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const herb = await fastify.prisma.herb.findUnique({ where: { id } })
    if (!herb) return reply.code(404).send({ error: 'Herb not found' })
    return herb
  })

  fastify.post('/', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const body = request.body as Record<string, string>
    if (!body.name) return reply.code(400).send({ error: 'name required' })
    const data: Record<string, unknown> = {}
    for (const k of HERB_FIELDS) data[k] = body[k] ?? null
    const created = await fastify.prisma.herb.create({ data: { ...data, name: body.name } })
    void bust(fastify, 'herbs:list:*')
    void upsertDoc(fastify, 'herbs', created)
    return created
  })

  fastify.patch('/:id', { preHandler: fastify.requireAdmin }, async (request) => {
    const { id } = request.params as { id: string }
    const body = request.body as Record<string, string>
    const data: Record<string, unknown> = {}
    for (const k of HERB_FIELDS) {
      if (body[k] !== undefined) data[k] = body[k] || null
    }
    const updated = await fastify.prisma.herb.update({ where: { id }, data })
    void bust(fastify, 'herbs:list:*')
    void upsertDoc(fastify, 'herbs', updated)
    return updated
  })

  fastify.delete('/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.herb.delete({ where: { id } })
    void bust(fastify, 'herbs:list:*')
    void deleteDoc(fastify, 'herbs', id)
    return reply.code(204).send()
  })

  fastify.get('/properties', async () => ({
    rasa: [
      { id: 'madhura', name: 'Madhura (Sweet)' },
      { id: 'amla', name: 'Amla (Sour)' },
      { id: 'lavana', name: 'Lavana (Salty)' },
      { id: 'katu', name: 'Katu (Pungent)' },
      { id: 'tikta', name: 'Tikta (Bitter)' },
      { id: 'kashaya', name: 'Kashaya (Astringent)' },
    ],
    guna: [
      { id: 'guru', name: 'Guru (Heavy)' },
      { id: 'laghu', name: 'Laghu (Light)' },
      { id: 'snigdha', name: 'Snigdha (Oily)' },
      { id: 'ruksha', name: 'Ruksha (Dry)' },
      { id: 'sara', name: 'Sara (Mobile)' },
      { id: 'sthira', name: 'Sthira (Stable)' },
    ],
    virya: [
      { id: 'ushna', name: 'Ushna (Hot)' },
      { id: 'sheeta', name: 'Sheeta (Cold)' },
    ],
    vipaka: [
      { id: 'madhura', name: 'Madhura (Sweet)' },
      { id: 'amla', name: 'Amla (Sour)' },
      { id: 'katu', name: 'Katu (Pungent)' },
    ],
  }))
}

export default herbs
