// Admin badge-management API. Gated behind the existing requireAdmin hook
// from /admin. HARD RULE: a row cannot be set status='verified' unless it
// has sourceUrl OR referenceNumber non-empty — enforced server-side, the
// UI is just a mirror.

import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/admin/credential-badges'

const VALID_STATUS = new Set(['pending', 'verified', 'rejected', 'expired'])
const VALID_ENTITY = new Set(['doctor', 'centre', 'college', 'manufacturer', 'product'])
const VALID_BADGE  = new Set(['state_registered', 'tourism_classified', 'gmp_licensed', 'ncism_kuhs', 'lineage_verified'])
const VALID_TIER   = new Set(['diamond', 'gold', 'silver', 'green_leaf', 'olive_leaf'])

const route: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireAdmin)

  // Queue + filters. status defaults to 'pending'; ?status=all returns every row.
  fastify.get('/', async (request) => {
    const q = request.query as Record<string, string | undefined>
    const status = q.status === 'all' ? undefined : (q.status ?? 'pending')
    const where: Record<string, unknown> = {}
    if (status)                                                  where.status     = status
    if (q.entityType && VALID_ENTITY.has(q.entityType))           where.entityType = q.entityType
    if (q.badgeType  && VALID_BADGE.has(q.badgeType))             where.badgeType  = q.badgeType
    if (q.district)                                               where.entityDistrictCached = q.district
    const items = await fastify.prisma.credentialBadge.findMany({
      where, orderBy: [{ status: 'asc' }, { createdAt: 'desc' }], take: 200,
    })
    return { items, count: items.length }
  })

  // Re-verify queue: rows whose validUntil is in the past, or within the next 60 days.
  fastify.get('/expiring', async () => {
    const now    = new Date()
    const cutoff = new Date(now.getTime() + 60 * 86_400_000)
    const items = await fastify.prisma.credentialBadge.findMany({
      where: {
        OR: [
          { status: 'expired' },
          { AND: [{ status: 'verified' }, { validUntil: { not: null, lte: cutoff } }] },
        ],
      },
      orderBy: [{ validUntil: 'asc' }], take: 200,
    })
    return { items, count: items.length }
  })

  // Patch one row.
  fastify.patch('/:id', async (request, reply) => {
    const { id }   = request.params as { id: string }
    const body     = request.body as Record<string, unknown>
    const existing = await fastify.prisma.credentialBadge.findUnique({ where: { id } })
    if (!existing) return reply.code(404).send({ error: 'not found' })

    const data: Record<string, unknown> = {}
    if (typeof body.entityId        === 'string') data.entityId        = body.entityId.slice(0, 200)
    if (typeof body.referenceNumber === 'string') data.referenceNumber = body.referenceNumber.slice(0, 100) || null
    if (typeof body.sourceUrl       === 'string') data.sourceUrl       = body.sourceUrl.slice(0, 500)       || null
    if (typeof body.sourceName      === 'string') data.sourceName      = body.sourceName.slice(0, 200)      || null
    if (typeof body.notes           === 'string') data.notes           = body.notes.slice(0, 2000)          || null
    if (typeof body.tier            === 'string') data.tier            = VALID_TIER.has(body.tier) ? body.tier : null
    if (body.validUntil === null)                  data.validUntil      = null
    else if (typeof body.validUntil === 'string')  data.validUntil      = new Date(body.validUntil)

    // HARD RULE: cannot verify without a source.
    if (typeof body.status === 'string') {
      if (!VALID_STATUS.has(body.status)) return reply.code(400).send({ error: 'invalid status' })
      if (body.status === 'verified') {
        const newRef    = (typeof body.referenceNumber === 'string' ? body.referenceNumber : existing.referenceNumber) ?? ''
        const newSource = (typeof body.sourceUrl       === 'string' ? body.sourceUrl       : existing.sourceUrl)       ?? ''
        if (!newRef.trim() && !newSource.trim()) {
          return reply.code(400).send({ error: 'cannot verify without sourceUrl OR referenceNumber' })
        }
        data.verifiedAt   = new Date()
        data.verifiedById = request.session?.user.id ?? null
        // Default tourism validity = 3 years if not set explicitly.
        if (existing.badgeType === 'tourism_classified' && !data.validUntil && !existing.validUntil) {
          data.validUntil = new Date(Date.now() + 3 * 365.25 * 86_400_000)
        }
      }
      data.status = body.status
    }
    const updated = await fastify.prisma.credentialBadge.update({ where: { id }, data })
    return { item: updated }
  })

  // Bulk verify a clean source batch. Same hard rule applies row-by-row.
  fastify.post('/bulk-verify', async (request, reply) => {
    const body = request.body as { ids?: unknown; sourceUrl?: unknown; sourceName?: unknown }
    const ids = Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === 'string').slice(0, 500) : []
    const sourceUrl  = typeof body.sourceUrl  === 'string' ? body.sourceUrl.slice(0, 500)  : undefined
    const sourceName = typeof body.sourceName === 'string' ? body.sourceName.slice(0, 200) : undefined
    if (ids.length === 0) return reply.code(400).send({ error: 'ids required' })

    const rows = await fastify.prisma.credentialBadge.findMany({ where: { id: { in: ids } } })
    const verifierId = request.session?.user.id ?? null
    let verified = 0, refused = 0
    for (const r of rows) {
      const ref = (r.referenceNumber ?? '').trim()
      const src = (sourceUrl ?? r.sourceUrl ?? '').trim()
      if (!ref && !src) { refused++; continue }
      await fastify.prisma.credentialBadge.update({
        where: { id: r.id },
        data: {
          status:       'verified',
          verifiedAt:   new Date(),
          verifiedById: verifierId,
          sourceUrl:    sourceUrl  ?? r.sourceUrl,
          sourceName:   sourceName ?? r.sourceName,
          validUntil:   r.badgeType === 'tourism_classified' && !r.validUntil
            ? new Date(Date.now() + 3 * 365.25 * 86_400_000)
            : r.validUntil,
        },
      })
      verified++
    }
    return { requested: ids.length, verified, refused }
  })
}

export default route
