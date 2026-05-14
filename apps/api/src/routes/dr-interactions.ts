// Doctor Hub — Drug interaction checker.
// Search a pair of components and see known interactions. Both directions
// indexed so order of input doesn't matter.

import type { FastifyPluginAsync } from 'fastify'
import { requireDrRead, canModerate } from '../lib/dr-access.js'

export const autoPrefix = '/dr/interactions'

const drInteractions: FastifyPluginAsync = async (fastify) => {
  // Search by either component
  fastify.get('/', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { q, severity } = request.query as Record<string, string>
    const where: Record<string, unknown> = { status: 'published' }
    if (severity && ['minor', 'moderate', 'major', 'contraindicated'].includes(severity)) where.severity = severity
    if (q) where.OR = [
      { componentA: { contains: q, mode: 'insensitive' } },
      { componentB: { contains: q, mode: 'insensitive' } },
    ]
    const items = await fastify.prisma.drugInteraction.findMany({
      where, orderBy: [{ severity: 'desc' }, { componentA: 'asc' }],
      take: 100,
    })
    return { interactions: items, count: items.length }
  })

  // Check a specific pair
  fastify.get('/check', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { a, b } = request.query as { a?: string; b?: string }
    if (!a?.trim() || !b?.trim()) return reply.code(400).send({ error: 'a + b query params required' })
    // Match in either order
    const items = await fastify.prisma.drugInteraction.findMany({
      where: {
        status: 'published',
        OR: [
          { AND: [{ componentA: { equals: a, mode: 'insensitive' } }, { componentB: { equals: b, mode: 'insensitive' } }] },
          { AND: [{ componentA: { equals: b, mode: 'insensitive' } }, { componentB: { equals: a, mode: 'insensitive' } }] },
          // Loose contains match as fallback
          { AND: [{ componentA: { contains: a, mode: 'insensitive' } }, { componentB: { contains: b, mode: 'insensitive' } }] },
          { AND: [{ componentA: { contains: b, mode: 'insensitive' } }, { componentB: { contains: a, mode: 'insensitive' } }] },
        ],
      },
      orderBy: { severity: 'desc' },
      take: 5,
    })
    return { a, b, matches: items, found: items.length > 0 }
  })

  fastify.post('/', async (request, reply) => {
    if (!request.session || !canModerate(request.session.user.role)) return reply.code(403).send({ error: 'admin only' })
    const body = request.body as Record<string, unknown>
    if (typeof body.componentA !== 'string' || typeof body.componentB !== 'string' || typeof body.severity !== 'string' || typeof body.clinicalEffect !== 'string' || typeof body.recommendation !== 'string') {
      return reply.code(400).send({ error: 'componentA, componentB, severity, clinicalEffect, recommendation required' })
    }
    return fastify.prisma.drugInteraction.create({
      data: {
        componentA:      body.componentA.slice(0, 200),
        componentB:      body.componentB.slice(0, 200),
        componentBKind:  typeof body.componentBKind === 'string' && ['allopathic', 'ayurvedic', 'food', 'lifestyle'].includes(body.componentBKind) ? body.componentBKind : 'allopathic',
        severity:        body.severity,
        mechanism:       typeof body.mechanism === 'string' ? body.mechanism.slice(0, 2000) : null,
        clinicalEffect:  body.clinicalEffect.slice(0, 2000),
        recommendation:  body.recommendation.slice(0, 2000),
        evidenceLevel:   typeof body.evidenceLevel === 'string' ? body.evidenceLevel : null,
        citations:       (body.citations ?? null) as never,
        status:          'published',
        contributedById: request.session!.user.id,
      },
    })
  })
}

export default drInteractions
