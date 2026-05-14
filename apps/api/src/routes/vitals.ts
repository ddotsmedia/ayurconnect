// Health metrics / vitals. Each row is one measurement. `source` distinguishes
// manual entry (the only path supported today via this API) from future
// wearable integrations — clients of those would call POST /vitals/ingest
// with `source: 'apple_health'` etc.

import type { FastifyPluginAsync, FastifyInstance } from 'fastify'

export const autoPrefix = '/me/vitals'

// Sanity bounds per metric kind so a typo can't store nonsense in the DB.
// Wider than clinical reality on purpose — we're filtering data-entry typos,
// not validating diagnosis.
const KIND_BOUNDS: Record<string, { min: number; max: number; unit: string }> = {
  bp_systolic:   { min: 50,  max: 260, unit: 'mmHg' },
  bp_diastolic:  { min: 30,  max: 180, unit: 'mmHg' },
  hr:            { min: 30,  max: 220, unit: 'bpm'  },
  weight_kg:     { min: 2,   max: 400, unit: 'kg'   },
  glucose_mg_dl: { min: 30,  max: 800, unit: 'mg/dL'},
  temp_c:        { min: 30,  max: 45,  unit: '°C'   },
  spo2:          { min: 50,  max: 100, unit: '%'    },
  sleep_hours:   { min: 0,   max: 16,  unit: 'h'    },
  steps:         { min: 0,   max: 100000, unit: 'steps' },
  hrv_ms:        { min: 5,   max: 250, unit: 'ms'   },
}

const ALLOWED_SOURCES = ['manual', 'apple_health', 'google_fit', 'fitbit', 'omron_bp', 'doctor_entry'] as const

const vitals: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireSession)

  // GET /me/vitals?kind=bp_systolic&days=30&familyMemberId=...
  fastify.get('/', async (request) => {
    const userId = request.session!.user.id
    const { kind, days = '30', familyMemberId } = request.query as Record<string, string>
    const daysNum = Math.min(Math.max(Number(days) || 30, 1), 365)
    const since = new Date(Date.now() - daysNum * 86400 * 1000)
    const where: Record<string, unknown> = { userId, recordedAt: { gte: since } }
    if (kind) where.kind = kind
    if (familyMemberId) where.familyMemberId = familyMemberId
    else if (familyMemberId === 'self') where.familyMemberId = null

    const items = await fastify.prisma.healthMetric.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
      take: 500,
    })
    return { items, kinds: KIND_BOUNDS }
  })

  // GET /me/vitals/latest — most recent value of each kind (for dashboard cards)
  fastify.get('/latest', async (request) => {
    const userId = request.session!.user.id
    const all = await fastify.prisma.healthMetric.findMany({
      where: { userId, familyMemberId: null },
      orderBy: { recordedAt: 'desc' },
      take: 200,
    })
    const latest: Record<string, { value: number; recordedAt: Date; source: string }> = {}
    for (const m of all) {
      if (!latest[m.kind]) latest[m.kind] = { value: m.value, recordedAt: m.recordedAt, source: m.source }
    }
    return { latest, kinds: KIND_BOUNDS }
  })

  // POST /me/vitals — single manual entry
  fastify.post('/', async (request, reply) => {
    const userId = request.session!.user.id
    const body = request.body as Record<string, unknown>
    const kind  = String(body.kind ?? '')
    const value = Number(body.value)
    const bounds = KIND_BOUNDS[kind]
    if (!bounds) return reply.code(400).send({ error: `unknown vital kind: ${kind}` })
    if (!Number.isFinite(value) || value < bounds.min || value > bounds.max) {
      return reply.code(400).send({ error: `value out of range for ${kind} (expected ${bounds.min}–${bounds.max} ${bounds.unit})` })
    }
    const source = typeof body.source === 'string' && (ALLOWED_SOURCES as readonly string[]).includes(body.source) ? body.source : 'manual'
    const recordedAt = body.recordedAt ? new Date(String(body.recordedAt)) : new Date()

    // If familyMemberId is provided, validate it belongs to the same user.
    let familyMemberId: string | null = null
    if (body.familyMemberId && typeof body.familyMemberId === 'string') {
      const fm = await fastify.prisma.familyMember.findUnique({ where: { id: body.familyMemberId }, select: { userId: true } })
      if (!fm || fm.userId !== userId) return reply.code(403).send({ error: 'familyMemberId not in your household' })
      familyMemberId = body.familyMemberId
    }

    const metric = await fastify.prisma.healthMetric.create({
      data: {
        userId,
        familyMemberId,
        kind,
        value,
        unit: bounds.unit,
        source,
        recordedAt: isNaN(recordedAt.getTime()) ? new Date() : recordedAt,
        notes: typeof body.notes === 'string' ? body.notes.slice(0, 500) : null,
      },
    })

    // RPM hook: evaluate active rules for this user + kind. Simple inline
    // evaluation (no streak windows yet — single-reading triggers only).
    void evaluateRpmRules(fastify, userId, kind, value).catch(() => null)

    return reply.code(201).send(metric)
  })

  fastify.delete('/:id', async (request, reply) => {
    const userId = request.session!.user.id
    const { id } = request.params as { id: string }
    const existing = await fastify.prisma.healthMetric.findUnique({ where: { id }, select: { userId: true } })
    if (!existing || existing.userId !== userId) return reply.code(404).send({ error: 'not found' })
    await fastify.prisma.healthMetric.delete({ where: { id } })
    return reply.code(204).send()
  })
}

// Evaluate the active RPM rules for a given patient+kind and create alerts
// if the new value violates a threshold. Kept simple (single-reading
// triggers); the windowDays / consecutiveCount fields exist on the rule so
// we can layer rolling-window logic later without schema changes.
async function evaluateRpmRules(
  fastify: FastifyInstance,
  patientId: string,
  kind: string,
  value: number,
): Promise<void> {
  const rules = await fastify.prisma.rpmAlertRule.findMany({
    where: { patientId, kind, active: true },
  })
  for (const r of rules) {
    let hit = false
    switch (r.operator) {
      case 'gt':  hit = value > r.threshold;  break
      case 'gte': hit = value >= r.threshold; break
      case 'lt':  hit = value < r.threshold;  break
      case 'lte': hit = value <= r.threshold; break
      case 'between':
        hit = r.threshold2 != null && (value < r.threshold || value > r.threshold2)
        break
    }
    if (hit) {
      await fastify.prisma.rpmAlert.create({
        data: { ruleId: r.id, patientId, kind, value },
      })
    }
  }
}

export default vitals
