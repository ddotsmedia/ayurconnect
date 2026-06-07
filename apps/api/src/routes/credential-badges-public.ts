// Public read of verified, non-expired credential badges. Pending/expired/
// rejected rows are NEVER returned. Indexed on (entityType, entityId, badgeType).

import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/credential-badges'

const route: FastifyPluginAsync = async (fastify) => {
  fastify.get('/:entityType/:entityId', async (request) => {
    const { entityType, entityId } = request.params as { entityType: string; entityId: string }
    const now = new Date()
    const items = await fastify.prisma.credentialBadge.findMany({
      where: {
        entityType, entityId, status: 'verified',
        OR: [{ validUntil: null }, { validUntil: { gt: now } }],
      },
      orderBy: [{ badgeType: 'asc' }],
      select: {
        id: true, badgeType: true, tier: true, sourceName: true, sourceUrl: true,
        verifiedAt: true, validUntil: true, referenceNumber: true,
      },
    })
    return { badges: items, count: items.length }
  })

  // Bulk read — used by list pages so they don't N+1.
  fastify.post('/bulk', async (request) => {
    const body = request.body as { entityType?: string; entityIds?: unknown }
    const ids  = Array.isArray(body.entityIds) ? body.entityIds.filter((x): x is string => typeof x === 'string').slice(0, 200) : []
    if (!body.entityType || ids.length === 0) return { byEntity: {} as Record<string, unknown[]> }
    const now = new Date()
    const items = await fastify.prisma.credentialBadge.findMany({
      where: {
        entityType: body.entityType, entityId: { in: ids }, status: 'verified',
        OR: [{ validUntil: null }, { validUntil: { gt: now } }],
      },
      select: {
        entityId: true, badgeType: true, tier: true,
      },
    })
    const byEntity: Record<string, { badgeType: string; tier: string | null }[]> = {}
    for (const it of items) {
      (byEntity[it.entityId] ??= []).push({ badgeType: it.badgeType, tier: it.tier })
    }
    return { byEntity }
  })
}

export default route
