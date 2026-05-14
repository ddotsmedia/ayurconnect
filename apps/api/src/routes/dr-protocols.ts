// Doctor Hub — Community clinical protocols + comments.

import type { FastifyPluginAsync } from 'fastify'
import { requireDrRead, requireDrWrite, canModerate } from '../lib/dr-access.js'
import { awardCmeCredit } from '../lib/cme-credit.js'

export const autoPrefix = '/dr/protocols'

const drProtocols: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { condition, dosha, q } = request.query as Record<string, string>
    const where: Record<string, unknown> = { status: 'published' }
    if (condition) where.condition = { contains: condition, mode: 'insensitive' }
    if (dosha)     where.doshas    = { has: dosha }
    if (q) where.OR = [
      { title:    { contains: q, mode: 'insensitive' } },
      { summary:  { contains: q, mode: 'insensitive' } },
    ]
    const items = await fastify.prisma.clinicalProtocol.findMany({
      where, orderBy: { publishedAt: 'desc' }, take: 60,
      include: { author: { select: { id: true, name: true } }, _count: { select: { comments: true } } },
    })
    return { protocols: items }
  })

  fastify.get('/mine', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const items = await fastify.prisma.clinicalProtocol.findMany({
      where:   { authorId: request.session!.user.id },
      orderBy: { createdAt: 'desc' },
      take:    50,
    })
    return { protocols: items }
  })

  fastify.get('/_admin/queue', async (request, reply) => {
    if (!request.session || !canModerate(request.session.user.role)) return reply.code(403).send({ error: 'admin only' })
    const items = await fastify.prisma.clinicalProtocol.findMany({
      where:   { status: 'under-review' },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { id: true, name: true, email: true } } },
      take:    100,
    })
    return { protocols: items }
  })

  fastify.get('/:slug', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { slug } = request.params as { slug: string }
    const p = await fastify.prisma.clinicalProtocol.findUnique({
      where: { slug },
      include: {
        author:   { select: { id: true, name: true } },
        comments: { orderBy: { createdAt: 'asc' }, include: { author: { select: { id: true, name: true } } } },
      },
    })
    if (!p) return reply.code(404).send({ error: 'not found' })
    const sess = request.session!
    if (p.status !== 'published' && p.authorId !== sess.user.id && !canModerate(sess.user.role)) {
      return reply.code(403).send({ error: 'not authorised' })
    }
    void fastify.prisma.clinicalProtocol.update({ where: { slug }, data: { viewCount: { increment: 1 } } }).catch(() => null)
    return p
  })

  fastify.post('/', async (request, reply) => {
    if (!requireDrWrite(request, reply)) return
    const body = request.body as Record<string, unknown>
    for (const k of ['slug', 'title', 'condition', 'summary', 'rationale'] as const) {
      if (typeof body[k] !== 'string' || !(body[k] as string).trim()) {
        return reply.code(400).send({ error: `${k} required` })
      }
    }
    if (!body.phasesJson || typeof body.phasesJson !== 'object') {
      return reply.code(400).send({ error: 'phasesJson required' })
    }
    return fastify.prisma.clinicalProtocol.create({
      data: {
        slug:              (body.slug as string).slice(0, 100),
        title:             (body.title as string).slice(0, 250),
        condition:         (body.condition as string).slice(0, 200),
        doshas:            Array.isArray(body.doshas) ? (body.doshas as unknown[]).map(String) : [],
        summary:           (body.summary as string).slice(0, 2000),
        rationale:         (body.rationale as string).slice(0, 8000),
        phasesJson:        body.phasesJson as never,
        contraindications: typeof body.contraindications === 'string' ? body.contraindications.slice(0, 4000) : null,
        expectedDuration:  typeof body.expectedDuration  === 'string' ? body.expectedDuration  : null,
        expectedOutcome:   typeof body.expectedOutcome   === 'string' ? body.expectedOutcome   : null,
        citations:         (body.citations ?? null) as never,
        authorId:          request.session!.user.id,
        status:            'under-review',
      },
    })
  })

  fastify.post('/:slug/publish', async (request, reply) => {
    if (!request.session || !canModerate(request.session.user.role)) return reply.code(403).send({ error: 'admin only' })
    const { slug } = request.params as { slug: string }
    const p = await fastify.prisma.clinicalProtocol.update({
      where: { slug },
      data:  { status: 'published', publishedAt: new Date() },
    })
    void awardCmeCredit(fastify, {
      userId:      p.authorId,
      source:      'protocol-published',
      sourceRefId: p.id,
      credits:     2.0,
      description: `Protocol published: ${p.title.slice(0, 80)}`,
    })
    return p
  })

  fastify.post('/:slug/reject', async (request, reply) => {
    if (!request.session || !canModerate(request.session.user.role)) return reply.code(403).send({ error: 'admin only' })
    const { slug } = request.params as { slug: string }
    const { notes } = request.body as { notes?: string }
    return fastify.prisma.clinicalProtocol.update({
      where: { slug },
      data:  { status: 'rejected', reviewerNotes: notes?.trim().slice(0, 2000) ?? null },
    })
  })

  fastify.post('/:slug/comments', async (request, reply) => {
    if (!requireDrWrite(request, reply)) return
    const { slug } = request.params as { slug: string }
    const { body } = request.body as { body?: string }
    if (!body?.trim() || body.length < 10) return reply.code(400).send({ error: 'body >=10 chars required' })
    const p = await fastify.prisma.clinicalProtocol.findUnique({ where: { slug }, select: { id: true, status: true } })
    if (!p || p.status !== 'published') return reply.code(404).send({ error: 'protocol not found or not published' })
    const c = await fastify.prisma.protocolComment.create({
      data: { protocolId: p.id, authorId: request.session!.user.id, body: body.trim().slice(0, 4000) },
    })
    return reply.code(201).send(c)
  })
}

export default drProtocols
