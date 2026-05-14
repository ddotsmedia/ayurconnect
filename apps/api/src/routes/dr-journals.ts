// Doctor Hub — Journal database + subscriptions.

import type { FastifyPluginAsync } from 'fastify'
import { requireDrRead, canModerate } from '../lib/dr-access.js'

export const autoPrefix = '/dr/journals'

const drJournals: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const items = await fastify.prisma.journal.findMany({
      orderBy: { title: 'asc' },
      take:    100,
    })
    const userId = request.session!.user.id
    const subs = await fastify.prisma.journalSubscription.findMany({
      where:  { userId, journalId: { in: items.map((j) => j.id) } },
      select: { journalId: true },
    })
    const subSet = new Set(subs.map((s) => s.journalId))
    return { journals: items.map((j) => ({ ...j, subscribed: subSet.has(j.id) })) }
  })

  fastify.get('/:slug', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { slug } = request.params as { slug: string }
    const j = await fastify.prisma.journal.findUnique({ where: { slug } })
    if (!j) return reply.code(404).send({ error: 'not found' })
    const sub = await fastify.prisma.journalSubscription.findUnique({
      where: { userId_journalId: { userId: request.session!.user.id, journalId: j.id } },
    })
    return { ...j, subscribed: !!sub }
  })

  fastify.post('/:slug/subscribe', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { slug } = request.params as { slug: string }
    const j = await fastify.prisma.journal.findUnique({ where: { slug }, select: { id: true } })
    if (!j) return reply.code(404).send({ error: 'not found' })
    const userId = request.session!.user.id
    const existing = await fastify.prisma.journalSubscription.findUnique({
      where: { userId_journalId: { userId, journalId: j.id } },
    })
    if (existing) {
      await fastify.prisma.journalSubscription.delete({ where: { id: existing.id } })
      return { subscribed: false }
    }
    await fastify.prisma.journalSubscription.create({ data: { userId, journalId: j.id } })
    return { subscribed: true }
  })

  fastify.post('/', async (request, reply) => {
    if (!request.session || !canModerate(request.session.user.role)) return reply.code(403).send({ error: 'admin only' })
    const body = request.body as Record<string, unknown>
    if (typeof body.slug !== 'string' || typeof body.title !== 'string') {
      return reply.code(400).send({ error: 'slug + title required' })
    }
    return fastify.prisma.journal.create({
      data: {
        slug:           body.slug,
        title:          body.title.slice(0, 250),
        shortName:      typeof body.shortName === 'string' ? body.shortName : null,
        issn:           typeof body.issn      === 'string' ? body.issn      : null,
        publisher:      typeof body.publisher === 'string' ? body.publisher : null,
        scope:          typeof body.scope     === 'string' ? body.scope     : null,
        url:            typeof body.url       === 'string' ? body.url       : null,
        latestIssueUrl: typeof body.latestIssueUrl === 'string' ? body.latestIssueUrl : null,
        sampleArticles: (body.sampleArticles ?? null) as never,
        language:       typeof body.language === 'string' ? body.language : 'en',
        openAccess:     !!body.openAccess,
        impactFactor:   typeof body.impactFactor === 'number' ? body.impactFactor : null,
      },
    })
  })
}

export default drJournals
