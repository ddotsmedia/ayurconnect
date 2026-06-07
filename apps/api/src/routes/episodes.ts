import type { FastifyPluginAsync } from 'fastify'
import { logPhiRead } from '../lib/audit.js'

export const autoPrefix = '/episodes'

// Longitudinal outcome tracking — patient-facing CRUD.
// Doctor-facing read endpoints live under /dr/episodes (separate file).
// Public k-anonymized aggregates live under /research/outcomes.

type StatusEnum = 'active' | 'completed' | 'paused' | 'abandoned'
const VALID_STATUSES = new Set<StatusEnum>(['active', 'completed', 'paused', 'abandoned'])

const route: FastifyPluginAsync = async (fastify) => {
  // List the signed-in patient's own episodes.
  fastify.get('/', async (request, reply) => {
    const userId = request.session?.user?.id
    if (!userId) return reply.code(401).send({ error: 'auth required' })

    const items = await fastify.prisma.treatmentEpisode.findMany({
      where: { patientUserId: userId },
      orderBy: { startDate: 'desc' },
      include: { _count: { select: { logs: true } } },
    })
    return { episodes: items }
  })

  // Create a new episode (patient initiates).
  fastify.post('/', async (request, reply) => {
    const userId = request.session?.user?.id
    if (!userId) return reply.code(401).send({ error: 'auth required' })

    const body = request.body as Partial<{
      condition: string; conditionSlug: string; doctorUserId: string
      protocolNotes: string; consentForResearch: boolean
    }>
    const condition = (body.condition ?? '').trim()
    if (!condition) return reply.code(400).send({ error: 'condition required' })

    const ep = await fastify.prisma.treatmentEpisode.create({
      data: {
        patientUserId:      userId,
        doctorUserId:       body.doctorUserId ?? null,
        condition:          condition.slice(0, 200),
        conditionSlug:      body.conditionSlug?.slice(0, 100) ?? null,
        protocolNotes:      body.protocolNotes?.slice(0, 2000) ?? null,
        consentForResearch: Boolean(body.consentForResearch),
        status:             'active',
      },
    })
    return { episode: ep }
  })

  // Fetch one episode + its logs.
  fastify.get('/:id', async (request, reply) => {
    const userId = request.session?.user?.id
    if (!userId) return reply.code(401).send({ error: 'auth required' })
    const { id } = request.params as { id: string }

    const ep = await fastify.prisma.treatmentEpisode.findUnique({
      where: { id },
      include: { logs: { orderBy: { date: 'asc' } } },
    })
    if (!ep) return reply.code(404).send({ error: 'not found' })
    // Patient may only read their own; doctor may read episodes they're the assigned doctor for.
    const role = request.session?.user?.role ?? 'USER'
    const isOwnerPatient = ep.patientUserId === userId
    const isAssignedDoctor = ep.doctorUserId === userId && (role === 'DOCTOR' || role === 'ADMIN')
    if (!isOwnerPatient && !isAssignedDoctor) return reply.code(403).send({ error: 'forbidden' })

    // Audit PHI read when the reader isn't the patient.
    if (!isOwnerPatient) {
      logPhiRead(fastify, request, { targetType: 'TreatmentEpisode', targetId: ep.id, reason: 'doctor view of patient outcome trend' })
    }
    return { episode: ep }
  })

  // Patch episode status / consent / endDate (patient only).
  fastify.patch('/:id', async (request, reply) => {
    const userId = request.session?.user?.id
    if (!userId) return reply.code(401).send({ error: 'auth required' })
    const { id } = request.params as { id: string }
    const ep = await fastify.prisma.treatmentEpisode.findUnique({ where: { id }, select: { patientUserId: true } })
    if (!ep) return reply.code(404).send({ error: 'not found' })
    if (ep.patientUserId !== userId) return reply.code(403).send({ error: 'forbidden' })

    const body = request.body as Partial<{ status: StatusEnum; consentForResearch: boolean; endDate: string | null }>
    const data: Record<string, unknown> = {}
    if (body.status && VALID_STATUSES.has(body.status)) data.status = body.status
    if (typeof body.consentForResearch === 'boolean')   data.consentForResearch = body.consentForResearch
    if ('endDate' in body) data.endDate = body.endDate ? new Date(body.endDate) : null
    const updated = await fastify.prisma.treatmentEpisode.update({ where: { id }, data })
    return { episode: updated }
  })

  // Daily check-in log (upsert on episode + date).
  fastify.post('/:id/logs', async (request, reply) => {
    const userId = request.session?.user?.id
    if (!userId) return reply.code(401).send({ error: 'auth required' })
    const { id } = request.params as { id: string }
    const ep = await fastify.prisma.treatmentEpisode.findUnique({ where: { id }, select: { patientUserId: true } })
    if (!ep) return reply.code(404).send({ error: 'not found' })
    if (ep.patientUserId !== userId) return reply.code(403).send({ error: 'forbidden' })

    const body = request.body as Partial<{ date: string; severity: number; energy: number; sleepQuality: number; mood: number; note: string }>
    const clamp = (v: unknown): number | null => {
      if (typeof v !== 'number' || !Number.isFinite(v)) return null
      return Math.max(0, Math.min(10, Math.round(v)))
    }
    const sev = clamp(body.severity)
    if (sev === null) return reply.code(400).send({ error: 'severity required (0-10)' })

    const date = body.date ? new Date(body.date) : new Date()
    date.setUTCHours(0, 0, 0, 0)

    const log = await fastify.prisma.outcomeLog.upsert({
      where:  { episodeId_date: { episodeId: id, date } },
      create: {
        episodeId: id, date,
        severity: sev,
        energy:       clamp(body.energy),
        sleepQuality: clamp(body.sleepQuality),
        mood:         clamp(body.mood),
        note:         body.note?.slice(0, 1000) ?? null,
      },
      update: {
        severity: sev,
        energy:       clamp(body.energy),
        sleepQuality: clamp(body.sleepQuality),
        mood:         clamp(body.mood),
        note:         body.note?.slice(0, 1000) ?? null,
      },
    })
    return { log }
  })
}

export default route
