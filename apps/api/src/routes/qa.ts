// Public Q&A library — iCliniq pattern. Patients ask anonymous questions;
// CCIM-verified doctors answer publicly. Approved Q&As are SEO content.
//
// - GET    /qa                  — list approved questions (filter by category, search)
// - GET    /qa/:slug            — single question with answers
// - POST   /qa                  — submit (anonymous or signed-in); status='pending'
// - PATCH  /qa/:id/answer       — doctor adds/edits their answer
// - PATCH  /qa/:id/approve      — admin only
// - GET    /qa/categories       — facet counts

import type { FastifyPluginAsync } from 'fastify'
import { moderate } from '../lib/moderation.js'

export const autoPrefix = '/qa'

const VALID_CATEGORIES = ['panchakarma', 'womens-health', 'stress', 'diabetes', 'skin', 'pediatric', 'joint', 'digestion', 'sleep', 'general'] as const

function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

const qa: FastifyPluginAsync = async (fastify) => {
  // Public list — approved only.
  fastify.get('/', async (request) => {
    const { category, q, page = '1', limit = '20' } = request.query as Record<string, string>
    const pageNum = Number(page) || 1
    const limitNum = Math.min(Number(limit) || 20, 50)
    const where: Record<string, unknown> = { status: 'approved' }
    if (category && (VALID_CATEGORIES as readonly string[]).includes(category)) where.category = category
    if (q) where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { body:  { contains: q, mode: 'insensitive' } },
    ]
    const [items, total] = await Promise.all([
      fastify.prisma.publicQuestion.findMany({
        where,
        select: {
          id: true, slug: true, title: true, body: true, category: true,
          authorName: true, age: true, gender: true, country: true,
          viewCount: true, createdAt: true,
          answers: { select: { id: true }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      fastify.prisma.publicQuestion.count({ where }),
    ])
    return {
      questions: items.map((q) => ({ ...q, answerCount: q.answers.length, answers: undefined })),
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    }
  })

  // Category facets — counts of approved questions per category.
  fastify.get('/categories', async () => {
    const groups = await fastify.prisma.publicQuestion.groupBy({
      by:     ['category'],
      where:  { status: 'approved' },
      _count: { _all: true },
    })
    return groups.map((g) => ({ id: g.category, count: g._count._all }))
  })

  fastify.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string }
    const q = await fastify.prisma.publicQuestion.findUnique({
      where: { slug },
      include: {
        answers: {
          where: { },
          include: {
            doctor: {
              select: {
                id: true, name: true,
                ownedDoctor: { select: { id: true, specialization: true, qualification: true, ccimVerified: true, photoUrl: true } },
              },
            },
          },
          orderBy: [{ featured: 'desc' }, { helpfulCount: 'desc' }, { createdAt: 'asc' }],
        },
      },
    })
    if (!q || q.status !== 'approved') return reply.code(404).send({ error: 'not found' })
    // Fire-and-forget view increment; don't block the response.
    void fastify.prisma.publicQuestion.update({ where: { id: q.id }, data: { viewCount: { increment: 1 } } }).catch(() => null)
    return q
  })

  // Submit — anonymous OK. Goes into moderation queue.
  fastify.post('/', async (request, reply) => {
    const body = request.body as Record<string, unknown>
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 200) : ''
    const text  = typeof body.body  === 'string' ? body.body.trim().slice(0, 4000) : ''
    const category = typeof body.category === 'string' && (VALID_CATEGORIES as readonly string[]).includes(body.category) ? body.category : 'general'
    if (!title || title.length < 10) return reply.code(400).send({ error: 'title must be at least 10 characters' })
    if (!text || text.length < 20)   return reply.code(400).send({ error: 'question must be at least 20 characters' })

    // Spam / abuse pre-screen — block clearly-bad submissions before they sit in the queue.
    const mod = await moderate(`${title}\n\n${text}`)
    if (mod.blocked) {
      return reply.code(422).send({ error: 'Question couldn\'t be submitted.', reason: mod.reason, code: 'moderation-blocked' })
    }

    const userId = request.session?.user.id ?? null
    const created = await fastify.prisma.publicQuestion.create({
      data: {
        userId,
        title, body: text, category,
        authorName: (typeof body.authorName === 'string' && body.authorName.trim()) ? body.authorName.trim().slice(0, 80) : 'Anonymous',
        age:        typeof body.age    === 'number' && body.age > 0    && body.age < 130    ? body.age    : null,
        gender:     typeof body.gender === 'string' && ['female','male','other'].includes(body.gender) ? body.gender : null,
        country:    typeof body.country === 'string' && /^[A-Z]{2}$/.test(body.country) ? body.country : null,
        language:   typeof body.language === 'string' && ['en','ml'].includes(body.language) ? body.language : 'en',
        status: 'pending',
      },
    })
    return reply.code(201).send({ ok: true, id: created.id, message: 'Question submitted — a doctor will review and respond. Approved questions are published anonymously.' })
  })

  // Doctor posts an answer to an approved question. Doctor must have role=DOCTOR or ADMIN.
  fastify.post('/:id/answers', { preHandler: fastify.requireSession }, async (request, reply) => {
    const sess = request.session!
    if (sess.user.role !== 'DOCTOR' && sess.user.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'doctor role required' })
    }
    const { id } = request.params as { id: string }
    const { body } = request.body as { body?: string }
    if (!body || body.trim().length < 30) return reply.code(400).send({ error: 'answer must be at least 30 characters' })
    const q = await fastify.prisma.publicQuestion.findUnique({ where: { id }, select: { status: true } })
    if (!q) return reply.code(404).send({ error: 'question not found' })
    if (q.status !== 'approved') return reply.code(400).send({ error: 'question not approved yet' })

    const answer = await fastify.prisma.doctorAnswer.create({
      data: {
        questionId:   id,
        doctorUserId: sess.user.id,
        body:         body.trim().slice(0, 6000),
      },
    })
    return reply.code(201).send(answer)
  })

  // ─── Admin moderation ──
  fastify.patch('/:id/approve', { preHandler: fastify.requireAdmin }, async (request) => {
    const { id } = request.params as { id: string }
    const existing = await fastify.prisma.publicQuestion.findUnique({ where: { id } })
    if (!existing) return { ok: false, error: 'not found' }
    // Generate slug on first approval.
    const slug = existing.slug ?? `${slugify(existing.title)}-q-${id.slice(-8)}`
    return fastify.prisma.publicQuestion.update({
      where: { id },
      data:  { status: 'approved', slug },
    })
  })

  fastify.patch('/:id/reject', { preHandler: fastify.requireAdmin }, async (request) => {
    const { id } = request.params as { id: string }
    return fastify.prisma.publicQuestion.update({ where: { id }, data: { status: 'rejected' } })
  })

  fastify.delete('/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.publicQuestion.delete({ where: { id } })
    return reply.code(204).send()
  })
}

export default qa
