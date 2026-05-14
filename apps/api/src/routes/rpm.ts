// Remote Patient Monitoring — doctor-defined rules on a patient's vitals.
// When a new HealthMetric is recorded, vitals.ts calls evaluateRpmRules()
// which inserts RpmAlert rows for any rule whose threshold is crossed.
//
// MVP: doctor → patient rules only (no self-monitoring rules), no aggregate
// streak logic yet (single-reading triggers). Future: rolling windows via
// the windowDays + consecutiveCount fields already on the schema.

import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/rpm'

const OPERATORS = ['gt', 'gte', 'lt', 'lte', 'between'] as const

function isDoctorOrAdmin(role: string): boolean {
  return role === 'DOCTOR' || role === 'ADMIN'
}

const rpm: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireSession)

  // GET /rpm/rules?patientId=... — rules visible to the caller.
  // Doctors see rules they authored. Patients see rules targeting them.
  fastify.get('/rules', async (request) => {
    const sess = request.session!
    const { patientId } = request.query as { patientId?: string }
    const where: Record<string, unknown> = {}
    if (isDoctorOrAdmin(sess.user.role)) {
      where.doctorId = sess.user.id
      if (patientId) where.patientId = patientId
    } else {
      where.patientId = sess.user.id
    }
    const rules = await fastify.prisma.rpmAlertRule.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true, email: true } },
        doctor:  { select: { id: true, name: true } },
      },
      orderBy: [{ active: 'desc' }, { createdAt: 'desc' }],
      take: 100,
    })
    return { rules }
  })

  fastify.post('/rules', async (request, reply) => {
    const sess = request.session!
    if (!isDoctorOrAdmin(sess.user.role)) return reply.code(403).send({ error: 'doctor role required' })
    const body = request.body as Record<string, unknown>
    const patientId = typeof body.patientId === 'string' ? body.patientId : ''
    const kind      = typeof body.kind === 'string' ? body.kind : ''
    const operator  = typeof body.operator === 'string' && (OPERATORS as readonly string[]).includes(body.operator) ? body.operator : ''
    const threshold = Number(body.threshold)
    if (!patientId || !kind || !operator || !Number.isFinite(threshold)) {
      return reply.code(400).send({ error: 'patientId, kind, operator, threshold required' })
    }
    const threshold2 = operator === 'between' ? Number(body.threshold2) : null
    if (operator === 'between' && !Number.isFinite(threshold2!)) {
      return reply.code(400).send({ error: 'threshold2 required when operator=between' })
    }

    // Confirm patient exists.
    const patient = await fastify.prisma.user.findUnique({ where: { id: patientId }, select: { id: true } })
    if (!patient) return reply.code(404).send({ error: 'patient not found' })

    const rule = await fastify.prisma.rpmAlertRule.create({
      data: {
        patientId,
        doctorId:         sess.user.id,
        kind,
        operator,
        threshold,
        threshold2,
        windowDays:       typeof body.windowDays === 'number' && body.windowDays > 0 ? Math.min(body.windowDays, 90) : 1,
        consecutiveCount: typeof body.consecutiveCount === 'number' && body.consecutiveCount > 0 ? Math.min(body.consecutiveCount, 20) : 1,
        active:           body.active === false ? false : true,
        label:            typeof body.label === 'string' ? body.label.slice(0, 120) : null,
      },
    })
    return reply.code(201).send(rule)
  })

  fastify.patch('/rules/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const sess = request.session!
    const existing = await fastify.prisma.rpmAlertRule.findUnique({ where: { id }, select: { doctorId: true } })
    if (!existing) return reply.code(404).send({ error: 'not found' })
    if (existing.doctorId !== sess.user.id && sess.user.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'only the rule author can edit' })
    }
    const body = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    if (typeof body.active    === 'boolean') data.active    = body.active
    if (typeof body.threshold === 'number')  data.threshold = body.threshold
    if (typeof body.threshold2 === 'number') data.threshold2 = body.threshold2
    if (typeof body.label     === 'string')  data.label     = body.label.slice(0, 120)
    return fastify.prisma.rpmAlertRule.update({ where: { id }, data })
  })

  fastify.delete('/rules/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const sess = request.session!
    const existing = await fastify.prisma.rpmAlertRule.findUnique({ where: { id }, select: { doctorId: true } })
    if (!existing) return reply.code(404).send({ error: 'not found' })
    if (existing.doctorId !== sess.user.id && sess.user.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'forbidden' })
    }
    await fastify.prisma.rpmAlertRule.delete({ where: { id } })
    return reply.code(204).send()
  })

  // GET /rpm/alerts — unacknowledged alerts visible to the caller.
  fastify.get('/alerts', async (request) => {
    const sess = request.session!
    const { acknowledged } = request.query as { acknowledged?: string }
    const where: Record<string, unknown> = {}
    if (isDoctorOrAdmin(sess.user.role)) {
      // Doctor sees alerts on rules they authored.
      where.rule = { doctorId: sess.user.id }
    } else {
      where.patientId = sess.user.id
    }
    if (acknowledged === 'false') where.acknowledged = false
    if (acknowledged === 'true')  where.acknowledged = true

    const alerts = await fastify.prisma.rpmAlert.findMany({
      where,
      include: {
        rule:    { include: { patient: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return { alerts }
  })

  fastify.post('/alerts/:id/ack', async (request, reply) => {
    const { id } = request.params as { id: string }
    const sess = request.session!
    const alert = await fastify.prisma.rpmAlert.findUnique({
      where: { id },
      include: { rule: { select: { doctorId: true, patientId: true } } },
    })
    if (!alert) return reply.code(404).send({ error: 'not found' })
    const isAuthorized = alert.rule.doctorId === sess.user.id || alert.rule.patientId === sess.user.id || sess.user.role === 'ADMIN'
    if (!isAuthorized) return reply.code(403).send({ error: 'forbidden' })
    return fastify.prisma.rpmAlert.update({
      where: { id },
      data:  { acknowledged: true, acknowledgedAt: new Date() },
    })
  })
}

export default rpm
