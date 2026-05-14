// Doctor Hub — Clinical case discussions.
// Public list/detail = published cases only. Drafts visible to author + admin.

import type { FastifyPluginAsync } from 'fastify'
import { requireDrRead, requireDrWrite, canModerate } from '../lib/dr-access.js'
import { awardCmeCredit } from '../lib/cme-credit.js'

export const autoPrefix = '/dr/cases'

const SPECIALTIES = ['kayachikitsa', 'panchakarma', 'prasuti-tantra', 'kaumarbhritya', 'shalya', 'shalakya', 'manasika', 'rasashastra', 'dravyaguna', 'roganidana', 'general']

const drCases: FastifyPluginAsync = async (fastify) => {
  // Browse published cases (read-gated to doctors)
  fastify.get('/', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { specialty, condition, q, page = '1', limit = '20' } = request.query as Record<string, string>
    const pageNum  = Number(page) || 1
    const limitNum = Math.min(Number(limit) || 20, 50)
    const where: Record<string, unknown> = { status: 'published' }
    if (specialty) where.specialty = specialty
    if (condition) where.condition = { contains: condition, mode: 'insensitive' }
    if (q) where.OR = [
      { title:              { contains: q, mode: 'insensitive' } },
      { chiefComplaint:     { contains: q, mode: 'insensitive' } },
      { ayurvedicDiagnosis: { contains: q, mode: 'insensitive' } },
    ]
    const [items, total] = await Promise.all([
      fastify.prisma.clinicalCase.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip:    (pageNum - 1) * limitNum,
        take:    limitNum,
        include: {
          author:  { select: { id: true, name: true, ownedDoctor: { select: { specialization: true, ccimVerified: true } } } },
          _count:  { select: { comments: true, upvotes: true } },
        },
      }),
      fastify.prisma.clinicalCase.count({ where }),
    ])
    return { cases: items, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } }
  })

  fastify.get('/_admin/queue', async (request, reply) => {
    if (!request.session || !canModerate(request.session.user.role)) return reply.code(403).send({ error: 'admin only' })
    const items = await fastify.prisma.clinicalCase.findMany({
      where:   { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { id: true, name: true, email: true } } },
      take:    100,
    })
    return { cases: items }
  })

  fastify.get('/mine', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const items = await fastify.prisma.clinicalCase.findMany({
      where:   { authorId: request.session!.user.id },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { comments: true, upvotes: true } } },
      take:    100,
    })
    return { cases: items }
  })

  fastify.get('/:id', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { id } = request.params as { id: string }
    const c = await fastify.prisma.clinicalCase.findUnique({
      where: { id },
      include: {
        author:   { select: { id: true, name: true, ownedDoctor: { select: { specialization: true, ccimVerified: true } } } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, name: true, ownedDoctor: { select: { ccimVerified: true } } } } },
        },
        _count:   { select: { upvotes: true } },
      },
    })
    if (!c) return reply.code(404).send({ error: 'not found' })
    const sess = request.session!
    if (c.status !== 'published' && c.authorId !== sess.user.id && !canModerate(sess.user.role)) {
      return reply.code(403).send({ error: 'not authorised' })
    }
    void fastify.prisma.clinicalCase.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => null)
    return c
  })

  fastify.post('/', async (request, reply) => {
    if (!requireDrWrite(request, reply)) return
    const body = request.body as Record<string, unknown>
    if (typeof body.title !== 'string' || body.title.trim().length < 10)               return reply.code(400).send({ error: 'title >=10 chars required' })
    if (typeof body.chiefComplaint !== 'string' || body.chiefComplaint.trim().length < 10) return reply.code(400).send({ error: 'chiefComplaint required' })
    if (typeof body.presentingHistory !== 'string' || body.presentingHistory.trim().length < 20) return reply.code(400).send({ error: 'presentingHistory >=20 chars required' })
    if (typeof body.ayurvedicDiagnosis !== 'string' || !body.ayurvedicDiagnosis.trim()) return reply.code(400).send({ error: 'ayurvedicDiagnosis required' })
    if (!body.protocolJson || typeof body.protocolJson !== 'object')                    return reply.code(400).send({ error: 'protocolJson required' })

    const specialty = typeof body.specialty === 'string' && SPECIALTIES.includes(body.specialty) ? body.specialty : 'general'

    const created = await fastify.prisma.clinicalCase.create({
      data: {
        authorId:           request.session!.user.id,
        title:              body.title.trim().slice(0, 250),
        chiefComplaint:     body.chiefComplaint.trim().slice(0, 1000),
        presentingHistory:  body.presentingHistory.trim().slice(0, 8000),
        prakriti:           typeof body.prakriti === 'string' ? body.prakriti.slice(0, 30) : null,
        vikriti:            typeof body.vikriti  === 'string' ? body.vikriti.slice(0, 30)  : null,
        ashtavidhaJson:     (body.ashtavidhaJson ?? null) as never,
        ayurvedicDiagnosis: body.ayurvedicDiagnosis.trim().slice(0, 400),
        modernDiagnosis:    typeof body.modernDiagnosis === 'string' ? body.modernDiagnosis.slice(0, 400) : null,
        protocolJson:       body.protocolJson as never,
        outcomeAtFollowUp:  typeof body.outcomeAtFollowUp === 'string' ? body.outcomeAtFollowUp.slice(0, 30) : null,
        outcomeDetail:      typeof body.outcomeDetail === 'string' ? body.outcomeDetail.slice(0, 4000) : null,
        durationMonths:     typeof body.durationMonths === 'number' ? body.durationMonths : null,
        doctorNotes:        typeof body.doctorNotes === 'string' ? body.doctorNotes.slice(0, 4000) : null,
        specialty,
        condition:          typeof body.condition === 'string' ? body.condition.trim().slice(0, 120) : 'general',
        tags:               Array.isArray(body.tags) ? (body.tags as unknown[]).map(String).slice(0, 20) : [],
        citations:          (body.citations ?? null) as never,
        status:             'pending',  // goes into moderation queue
      },
    })
    return reply.code(201).send(created)
  })

  fastify.patch('/:id', async (request, reply) => {
    if (!requireDrWrite(request, reply)) return
    const { id } = request.params as { id: string }
    const existing = await fastify.prisma.clinicalCase.findUnique({ where: { id }, select: { authorId: true, status: true } })
    if (!existing) return reply.code(404).send({ error: 'not found' })
    if (existing.authorId !== request.session!.user.id && !canModerate(request.session!.user.role)) {
      return reply.code(403).send({ error: 'not yours' })
    }
    if (existing.status === 'published' && !canModerate(request.session!.user.role)) {
      return reply.code(409).send({ error: 'published cases need admin to edit; contact info@ayurconnect.com' })
    }
    const body = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    for (const k of ['title', 'chiefComplaint', 'presentingHistory', 'prakriti', 'vikriti', 'ayurvedicDiagnosis', 'modernDiagnosis', 'outcomeAtFollowUp', 'outcomeDetail', 'doctorNotes', 'condition'] as const) {
      if (typeof body[k] === 'string') data[k] = body[k]
    }
    if (body.protocolJson)   data.protocolJson   = body.protocolJson
    if (body.ashtavidhaJson) data.ashtavidhaJson = body.ashtavidhaJson
    if (body.citations !== undefined) data.citations = body.citations
    if (Array.isArray(body.tags)) data.tags = body.tags
    return fastify.prisma.clinicalCase.update({ where: { id }, data })
  })

  // Admin moderation
  fastify.post('/:id/publish', async (request, reply) => {
    if (!request.session || !canModerate(request.session.user.role)) return reply.code(403).send({ error: 'admin only' })
    const { id } = request.params as { id: string }
    const c = await fastify.prisma.clinicalCase.update({
      where: { id },
      data:  { status: 'published', publishedAt: new Date(), rejectionReason: null },
    })
    // CME credit for case publication.
    void awardCmeCredit(fastify, {
      userId:      c.authorId,
      source:      'case-published',
      sourceRefId: c.id,
      credits:     1.0,
      description: `Case published: ${c.title.slice(0, 80)}`,
    })
    return c
  })

  fastify.post('/:id/reject', async (request, reply) => {
    if (!request.session || !canModerate(request.session.user.role)) return reply.code(403).send({ error: 'admin only' })
    const { id } = request.params as { id: string }
    const { reason } = request.body as { reason?: string }
    if (!reason?.trim()) return reply.code(400).send({ error: 'reason required' })
    return fastify.prisma.clinicalCase.update({
      where: { id },
      data:  { status: 'rejected', rejectionReason: reason.trim().slice(0, 1000) },
    })
  })

  // Comments
  fastify.post('/:id/comments', async (request, reply) => {
    if (!requireDrWrite(request, reply)) return
    const { id } = request.params as { id: string }
    const { body, citations } = request.body as { body?: string; citations?: unknown }
    if (!body?.trim() || body.length < 10) return reply.code(400).send({ error: 'body >=10 chars required' })
    const exists = await fastify.prisma.clinicalCase.findUnique({ where: { id }, select: { id: true, status: true } })
    if (!exists || exists.status !== 'published') return reply.code(404).send({ error: 'case not found or not published' })
    const c = await fastify.prisma.caseComment.create({
      data: { caseId: id, authorId: request.session!.user.id, body: body.trim().slice(0, 4000), citations: (citations ?? null) as never },
    })
    return reply.code(201).send(c)
  })

  // Upvote (toggle)
  fastify.post('/:id/upvote', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { id } = request.params as { id: string }
    const userId = request.session!.user.id
    const existing = await fastify.prisma.caseUpvote.findUnique({ where: { caseId_userId: { caseId: id, userId } } })
    if (existing) {
      await fastify.prisma.caseUpvote.delete({ where: { id: existing.id } })
      return { upvoted: false }
    }
    await fastify.prisma.caseUpvote.create({ data: { caseId: id, userId } })
    return { upvoted: true }
  })
}

export default drCases
