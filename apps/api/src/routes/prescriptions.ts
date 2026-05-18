// Structured prescriptions written by doctors, viewable by patients.
//
// Access rules:
//   - GET /prescriptions/:id        patient or prescribing doctor
//   - GET /me/prescriptions         the patient's own active prescriptions
//   - GET /doctor/prescriptions     authored by the signed-in doctor user
//   - POST /prescriptions           DOCTOR role only; patientId in body
//   - PATCH /prescriptions/:id      author only (edit advice / items)
//   - POST /prescriptions/:id/cancel author only

import type { FastifyPluginAsync } from 'fastify'
import { createNotification } from '../lib/notify.js'
import { logPhiRead } from '../lib/audit.js'

export const autoPrefix = '/prescriptions'

type RxItemInput = {
  medication?: unknown
  herbId?:     unknown
  dose?:       unknown
  frequency?:  unknown
  duration?:   unknown
  anupana?:    unknown
  instructions?: unknown
  position?:   unknown
}

function cleanStr(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t ? t.slice(0, max) : null
}

function validateItems(raw: unknown): { ok: true; items: Array<{ medication: string; herbId: string | null; dose: string; frequency: string; duration: string | null; anupana: string | null; instructions: string | null; position: number }> } | { ok: false; error: string } {
  if (!Array.isArray(raw) || raw.length === 0) return { ok: false, error: 'at least one item required' }
  if (raw.length > 50) return { ok: false, error: 'too many items (max 50)' }
  const items: Array<{ medication: string; herbId: string | null; dose: string; frequency: string; duration: string | null; anupana: string | null; instructions: string | null; position: number }> = []
  for (let i = 0; i < raw.length; i++) {
    const x = raw[i] as RxItemInput
    const medication = cleanStr(x.medication, 200)
    const dose       = cleanStr(x.dose, 80)
    const frequency  = cleanStr(x.frequency, 80)
    if (!medication || !dose || !frequency) {
      return { ok: false, error: `item ${i + 1}: medication, dose, frequency required` }
    }
    items.push({
      medication,
      herbId:       cleanStr(x.herbId, 40),
      dose,
      frequency,
      duration:     cleanStr(x.duration, 80),
      anupana:      cleanStr(x.anupana, 80),
      instructions: cleanStr(x.instructions, 500),
      position:     typeof x.position === 'number' ? x.position : i,
    })
  }
  return { ok: true, items }
}

const prescriptions: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireSession)

  // Patient's own prescriptions
  fastify.get('/me', async (request) => {
    const userId = request.session!.user.id
    const rxs = await fastify.prisma.prescription.findMany({
      where: { patientId: userId },
      include: {
        items:  { orderBy: { position: 'asc' } },
        doctor: { select: { id: true, name: true, email: true, ownedDoctor: { select: { id: true, specialization: true, qualification: true } } } },
      },
      orderBy: { issuedAt: 'desc' },
      take: 100,
    })
    return { prescriptions: rxs }
  })

  // Doctor's authored prescriptions (signed-in user must be a doctor)
  fastify.get('/by-me', async (request, reply) => {
    const sess = request.session!
    if (sess.user.role !== 'DOCTOR' && sess.user.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'doctor role required' })
    }
    const rxs = await fastify.prisma.prescription.findMany({
      where: { doctorId: sess.user.id },
      include: {
        items:   { orderBy: { position: 'asc' } },
        patient: { select: { id: true, name: true, email: true } },
      },
      orderBy: { issuedAt: 'desc' },
      take: 100,
    })
    return { prescriptions: rxs }
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const sess = request.session!
    const rx = await fastify.prisma.prescription.findUnique({
      where: { id },
      include: {
        items:   { orderBy: { position: 'asc' } },
        patient: { select: { id: true, name: true, email: true, phone: true } },
        doctor:  { select: { id: true, name: true, email: true, ownedDoctor: { select: { id: true, specialization: true, qualification: true, ccimVerified: true } } } },
      },
    })
    if (!rx) return reply.code(404).send({ error: 'not found' })
    if (rx.patientId !== sess.user.id && rx.doctorId !== sess.user.id && sess.user.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'forbidden' })
    }
    // P0-H5: audit non-owner reads of prescription PHI.
    if (rx.patientId !== sess.user.id) {
      logPhiRead(fastify, request, { targetType: 'Prescription', targetId: rx.id })
    }
    return rx
  })

  fastify.post('/', async (request, reply) => {
    const sess = request.session!
    if (sess.user.role !== 'DOCTOR' && sess.user.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'doctor role required' })
    }
    const body = request.body as Record<string, unknown>
    const patientId = cleanStr(body.patientId, 40)
    if (!patientId) return reply.code(400).send({ error: 'patientId required' })

    // Validate the patient actually exists AND has the USER role (P2-H8
    // 2026-05-18 healthcare audit): a doctor previously could prescribe to
    // another doctor or admin by passing their id. This created confusing
    // records and bypassed the patient-side prescription UI assumptions.
    const patient = await fastify.prisma.user.findUnique({
      where: { id: patientId }, select: { id: true, role: true },
    })
    if (!patient) return reply.code(404).send({ error: 'patient not found' })
    if (patient.role !== 'USER') {
      return reply.code(400).send({
        error: 'prescriptions can only be issued to standard patient accounts (role=USER)',
        code:  'invalid-target-role',
      })
    }

    // P0-1 (2026-05-18 audit): enforce a care relationship. Any DOCTOR could
    // previously POST /prescriptions to an arbitrary userId and inject a
    // prescription into that user's dashboard. Now we require either:
    //   (a) the doctor's user.id is the doctorId on a non-cancelled Appointment
    //       with this patient, OR
    //   (b) the caller is ADMIN (legitimate admin override during operations).
    if (sess.user.role !== 'ADMIN') {
      const link = await fastify.prisma.appointment.findFirst({
        where: {
          userId:   patientId,
          doctorId: sess.user.id,
          status:   { in: ['confirmed', 'completed'] },
        },
        select: { id: true },
      })
      if (!link) {
        return reply.code(403).send({
          error: 'no care relationship — prescribe only for patients you have a confirmed or completed appointment with',
          code:  'no-care-relationship',
        })
      }
    }

    const v = validateItems(body.items)
    if (v.ok === false) return reply.code(400).send({ error: v.error })

    const appointmentId = cleanStr(body.appointmentId, 40)
    const followUpAfterWeeks = typeof body.followUpAfterWeeks === 'number' && body.followUpAfterWeeks > 0 ? Math.min(body.followUpAfterWeeks, 104) : null

    const rx = await fastify.prisma.prescription.create({
      data: {
        patientId,
        doctorId: sess.user.id,
        appointmentId,
        diagnosis:          cleanStr(body.diagnosis, 500),
        advice:             cleanStr(body.advice, 4000),
        followUpAfterWeeks,
        status:             'active',
        items: { create: v.items },
      },
      include: { items: { orderBy: { position: 'asc' } } },
    })

    // Notify the patient.
    void createNotification(fastify, {
      userId: patientId,
      type:   'prescription-issued' as never, // narrow union extended below if you want strict typing
      title:  '📜 A new prescription is available',
      body:   `Dr ${sess.user.name ?? 'your doctor'} issued a prescription for you.`,
      link:   `/dashboard/prescriptions/${rx.id}`,
    }).catch(() => null)

    return reply.code(201).send(rx)
  })

  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const sess = request.session!
    const existing = await fastify.prisma.prescription.findUnique({ where: { id }, select: { doctorId: true } })
    if (!existing) return reply.code(404).send({ error: 'not found' })
    if (existing.doctorId !== sess.user.id && sess.user.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'only the prescribing doctor can edit' })
    }
    const body = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    if (body.diagnosis !== undefined)          data.diagnosis = cleanStr(body.diagnosis, 500)
    if (body.advice !== undefined)             data.advice    = cleanStr(body.advice, 4000)
    if (body.followUpAfterWeeks !== undefined) data.followUpAfterWeeks = typeof body.followUpAfterWeeks === 'number' && body.followUpAfterWeeks > 0 ? Math.min(body.followUpAfterWeeks, 104) : null
    if (body.status !== undefined && ['active', 'completed', 'cancelled'].includes(String(body.status))) {
      data.status = body.status
    }

    // If items are present, replace the whole set.
    if (Array.isArray(body.items)) {
      const v = validateItems(body.items)
      if (v.ok === false) return reply.code(400).send({ error: v.error })
      await fastify.prisma.prescriptionItem.deleteMany({ where: { prescriptionId: id } })
      await fastify.prisma.prescriptionItem.createMany({
        data: v.items.map((it) => ({ ...it, prescriptionId: id })),
      })
    }

    const updated = await fastify.prisma.prescription.update({
      where: { id },
      data,
      include: { items: { orderBy: { position: 'asc' } } },
    })
    return updated
  })
}

export default prescriptions
