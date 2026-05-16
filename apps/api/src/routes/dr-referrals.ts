// Doctor Hub — Doctor-to-doctor referral network.
//
// Lifecycle:
//   1. Dr A sees a patient outside their specialty → POST /dr/referrals with
//      patient name + reason + toDoctorId (+ optional caseId link).
//   2. Dr B sees it in their inbox (GET /dr/referrals?direction=received).
//   3. Dr B accepts or declines (PATCH /:id/respond) — both sides get notified.
//   4. After consultation, Dr B marks completed (PATCH /:id/complete).
//
// Gated to DOCTOR / ADMIN. DOCTOR_PENDING can READ their inbox but cannot send
// referrals until verification completes.

import type { FastifyPluginAsync } from 'fastify'
import { requireDrRead, requireDrWrite } from '../lib/dr-access.js'
import { createNotification } from '../lib/notify.js'

export const autoPrefix = '/dr/referrals'

const URGENCIES = new Set(['routine', 'soon', 'urgent'])
const STATUSES_RESPOND  = new Set(['accepted', 'declined'])

async function doctorIdForUser(fastify: import('fastify').FastifyInstance, userId: string): Promise<string | null> {
  const u = await fastify.prisma.user.findUnique({ where: { id: userId }, select: { doctorId: true } })
  return u?.doctorId ?? null
}

const route: FastifyPluginAsync = async (fastify) => {
  // ─── List ───────────────────────────────────────────────────────────────
  // GET /dr/referrals?direction=received|sent&status=pending
  fastify.get('/', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { direction = 'received', status } = request.query as Record<string, string>
    const userId = request.session!.user.id
    const doctorId = await doctorIdForUser(fastify, userId)
    if (!doctorId) return reply.code(404).send({ error: 'no doctor profile linked to this account' })

    const where: Record<string, unknown> = direction === 'sent'
      ? { fromDoctorId: doctorId }
      : { toDoctorId:   doctorId }
    if (status) where.status = status

    const items = await fastify.prisma.doctorReferral.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        fromDoctor: { select: { id: true, name: true, specialization: true, district: true } },
        toDoctor:   { select: { id: true, name: true, specialization: true, district: true } },
        case:       { select: { id: true, title: true } },
      },
    })

    // Inbox badge: pending count for the recipient direction.
    const pendingCount = direction === 'received'
      ? await fastify.prisma.doctorReferral.count({ where: { toDoctorId: doctorId, status: 'pending' } })
      : 0

    return { referrals: items, pendingCount, doctorId }
  })

  // ─── Detail ─────────────────────────────────────────────────────────────
  fastify.get('/:id', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    const { id } = request.params as { id: string }
    const userId   = request.session!.user.id
    const doctorId = await doctorIdForUser(fastify, userId)
    if (!doctorId) return reply.code(404).send({ error: 'no doctor profile' })

    const r = await fastify.prisma.doctorReferral.findUnique({
      where: { id },
      include: {
        fromDoctor: { select: { id: true, name: true, specialization: true, district: true, contact: true } },
        toDoctor:   { select: { id: true, name: true, specialization: true, district: true, contact: true } },
        case:       { select: { id: true, title: true, condition: true, specialty: true } },
      },
    })
    if (!r) return reply.code(404).send({ error: 'referral not found' })
    if (r.fromDoctorId !== doctorId && r.toDoctorId !== doctorId && request.session!.user.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'not authorized' })
    }
    return r
  })

  // ─── Create ─────────────────────────────────────────────────────────────
  fastify.post('/', async (request, reply) => {
    if (!requireDrWrite(request, reply)) return
    const userId = request.session!.user.id
    const fromDoctorId = await doctorIdForUser(fastify, userId)
    if (!fromDoctorId) return reply.code(404).send({ error: 'no doctor profile linked to this account' })

    const body = request.body as Record<string, unknown>
    const toDoctorId  = typeof body.toDoctorId  === 'string' ? body.toDoctorId.trim()  : ''
    const patientName = typeof body.patientName === 'string' ? body.patientName.trim() : ''
    const reason      = typeof body.reason      === 'string' ? body.reason.trim()      : ''
    if (!toDoctorId || !patientName || reason.length < 10) {
      return reply.code(400).send({ error: 'toDoctorId, patientName, and reason (≥10 chars) required' })
    }
    if (toDoctorId === fromDoctorId) {
      return reply.code(400).send({ error: 'cannot refer to yourself' })
    }

    // Verify recipient exists + is verified (avoids referrals into deleted
    // or unverified profiles).
    const recipient = await fastify.prisma.doctor.findUnique({
      where: { id: toDoctorId },
      select: { id: true, name: true, ccimVerified: true, ownedBy: { select: { id: true, email: true } } },
    })
    if (!recipient) return reply.code(404).send({ error: 'recipient doctor not found' })
    if (!recipient.ccimVerified) return reply.code(400).send({ error: 'recipient is not verified' })

    const urgency = typeof body.urgency === 'string' && URGENCIES.has(body.urgency) ? body.urgency : 'routine'

    const created = await fastify.prisma.doctorReferral.create({
      data: {
        fromDoctorId,
        toDoctorId,
        patientName:  patientName.slice(0, 120),
        patientEmail: typeof body.patientEmail === 'string' ? body.patientEmail.slice(0, 200) : null,
        patientPhone: typeof body.patientPhone === 'string' ? body.patientPhone.slice(0,  40) : null,
        patientAge:   typeof body.patientAge === 'number' && body.patientAge > 0 && body.patientAge < 130 ? body.patientAge : null,
        specialty:    typeof body.specialty === 'string' ? body.specialty.slice(0, 60) : null,
        condition:    typeof body.condition === 'string' ? body.condition.slice(0, 200) : null,
        reason:       reason.slice(0, 2000),
        urgency,
        caseId:       typeof body.caseId === 'string' && body.caseId.length > 0 ? body.caseId : null,
      },
      include: { fromDoctor: { select: { name: true } } },
    })

    // Best-effort notify the recipient. Failure is non-fatal — the referral
    // still exists; the in-app inbox surfaces it on next load.
    if (recipient.ownedBy?.id) {
      void createNotification(fastify, {
        userId: recipient.ownedBy.id,
        type:   'doctor-referral',
        title:  `New referral from Dr ${created.fromDoctor.name}`,
        body:   `Patient ${created.patientName}${created.specialty ? ` · ${created.specialty}` : ''}${urgency !== 'routine' ? ` · ${urgency.toUpperCase()}` : ''}`,
        link:   `/dr/referrals/${created.id}`,
      })
    }

    return reply.code(201).send(created)
  })

  // ─── Respond (accept / decline) ─────────────────────────────────────────
  fastify.patch('/:id/respond', async (request, reply) => {
    if (!requireDrWrite(request, reply)) return
    const { id } = request.params as { id: string }
    const userId   = request.session!.user.id
    const doctorId = await doctorIdForUser(fastify, userId)
    if (!doctorId) return reply.code(404).send({ error: 'no doctor profile' })

    const body = request.body as { status?: string; responseNote?: string }
    if (!body.status || !STATUSES_RESPOND.has(body.status)) {
      return reply.code(400).send({ error: 'status must be "accepted" or "declined"' })
    }

    const r = await fastify.prisma.doctorReferral.findUnique({
      where: { id },
      include: { fromDoctor: { select: { name: true, ownedBy: { select: { id: true } } } } },
    })
    if (!r) return reply.code(404).send({ error: 'referral not found' })
    if (r.toDoctorId !== doctorId) return reply.code(403).send({ error: 'only the recipient can respond' })
    if (r.status !== 'pending')    return reply.code(400).send({ error: 'referral already responded to' })

    const updated = await fastify.prisma.doctorReferral.update({
      where: { id },
      data:  {
        status:       body.status,
        responseNote: typeof body.responseNote === 'string' ? body.responseNote.slice(0, 1000) : null,
        respondedAt:  new Date(),
      },
    })

    // Notify the referrer.
    if (r.fromDoctor.ownedBy?.id) {
      void createNotification(fastify, {
        userId: r.fromDoctor.ownedBy.id,
        type:   'doctor-referral-response',
        title:  `Your referral was ${body.status}`,
        body:   `Patient ${r.patientName}`,
        link:   `/dr/referrals/${r.id}`,
      })
    }

    return updated
  })

  // ─── Complete ───────────────────────────────────────────────────────────
  fastify.patch('/:id/complete', async (request, reply) => {
    if (!requireDrWrite(request, reply)) return
    const { id } = request.params as { id: string }
    const userId   = request.session!.user.id
    const doctorId = await doctorIdForUser(fastify, userId)
    if (!doctorId) return reply.code(404).send({ error: 'no doctor profile' })

    const r = await fastify.prisma.doctorReferral.findUnique({ where: { id } })
    if (!r) return reply.code(404).send({ error: 'referral not found' })
    if (r.toDoctorId !== doctorId) return reply.code(403).send({ error: 'only the recipient can mark complete' })
    if (r.status !== 'accepted')   return reply.code(400).send({ error: 'only accepted referrals can be completed' })

    return fastify.prisma.doctorReferral.update({
      where: { id },
      data:  { status: 'completed', completedAt: new Date() },
    })
  })
}

export default route
