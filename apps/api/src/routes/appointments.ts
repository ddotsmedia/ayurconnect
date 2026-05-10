import type { FastifyPluginAsync } from 'fastify'
import { createNotification } from '../lib/notify.js'
import { sendWhatsApp } from '../lib/whatsapp.js'
import { sendEmail, emailEnabled } from '../lib/email.js'

export const autoPrefix = '/appointments'

const route: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireSession)

  // List my appointments (or all if admin/doctor for their own consults)
  fastify.get('/', async (request) => {
    const sess = request.session!
    const where: Record<string, unknown> = {}
    const userExt = sess.user as unknown as { doctorId?: string; role: string; id: string }
    if (userExt.role === 'ADMIN') {
      // admin sees all
    } else if (userExt.role === 'DOCTOR' && userExt.doctorId) {
      // doctor sees appointments where they're the doctor
      where.doctorId = userExt.doctorId
    } else {
      where.userId = sess.user.id
    }
    return fastify.prisma.appointment.findMany({
      where,
      include: {
        doctor: { select: { id: true, name: true, specialization: true, district: true, photoUrl: true } },
        user:   { select: { id: true, name: true, email: true } },
      },
      orderBy: { dateTime: 'desc' },
      take: 100,
    })
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const sess = request.session!
    const appt = await fastify.prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: { select: { id: true, name: true, specialization: true, district: true, photoUrl: true, contact: true } },
        user:   { select: { id: true, name: true, email: true } },
      },
    })
    if (!appt) return reply.code(404).send({ error: 'not found' })
    // Authorization: only the patient who booked, the assigned doctor, or admin
    const isAdmin = sess.user.role === 'ADMIN'
    const isMine = appt.userId === sess.user.id
    const userExt = sess.user as unknown as { doctorId?: string; role: string }
    const isMyDoctor = userExt.role === 'DOCTOR' && userExt.doctorId === appt.doctorId
    if (!isAdmin && !isMine && !isMyDoctor) return reply.code(403).send({ error: 'forbidden' })
    return appt
  })

  fastify.post('/', async (request, reply) => {
    const sess = request.session!
    const body = request.body as Record<string, unknown>
    if (!body.doctorId || !body.dateTime || !body.type) {
      return reply.code(400).send({ error: 'doctorId, dateTime, type required' })
    }
    // Sanity: doctor exists
    const doctor = await fastify.prisma.doctor.findUnique({ where: { id: String(body.doctorId) } })
    if (!doctor) return reply.code(404).send({ error: 'doctor not found' })

    const appt = await fastify.prisma.appointment.create({
      data: {
        userId: sess.user.id,
        doctorId: String(body.doctorId),
        dateTime: new Date(String(body.dateTime)),
        type: String(body.type),
        chiefComplaint: body.chiefComplaint ? String(body.chiefComplaint) : null,
        duration: body.duration ? String(body.duration) : null,
        notes: body.notes ? String(body.notes) : null,
        fee: doctor.consultationFee ?? null,
        paymentStatus: 'pending',
        status: 'scheduled',
      },
    })

    // ─── Fan-out: notification, email, WhatsApp ──────────────────────────
    void (async () => {
      try {
        const when = new Date(appt.dateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })

        // 1. In-app notification (patient)
        await createNotification(fastify, {
          userId: sess.user.id,
          type:   'appointment-booked',
          title:  `Appointment booked with ${doctor.name}`,
          body:   `${when} · ${appt.type}`,
          link:   '/dashboard/appointments',
        })

        // 2. In-app notification (doctor's owner user, if linked)
        const docOwner = await fastify.prisma.user.findFirst({ where: { doctorId: doctor.id }, select: { id: true } })
        if (docOwner) {
          await createNotification(fastify, {
            userId: docOwner.id,
            type:   'appointment-booked',
            title:  'New consultation booking',
            body:   `${when} · ${appt.type}`,
            link:   '/dashboard/appointments',
          })
        }

        // 3. Email confirmation to patient (if Resend configured)
        if (emailEnabled() && sess.user.email) {
          await sendEmail({
            to: sess.user.email,
            subject: `Appointment confirmed — ${doctor.name}`,
            html: `<p>Your appointment with <strong>${doctor.name}</strong> is scheduled for <strong>${when}</strong>.</p>
                   <p>Type: ${appt.type}<br>Fee: ${appt.fee ? `₹${appt.fee}` : 'TBD'}</p>
                   <p>You can cancel or reschedule from your dashboard at https://ayurconnect.com/dashboard/appointments.</p>`,
            text: `Appointment with ${doctor.name} on ${when}. Manage at https://ayurconnect.com/dashboard/appointments`,
          })
        }

        // 4. WhatsApp reminder to patient (if Twilio configured + user has phone)
        const me = await fastify.prisma.user.findUnique({ where: { id: sess.user.id }, select: { phone: true } })
        if (me?.phone) {
          await sendWhatsApp({
            to:   me.phone,
            body: `🌿 AyurConnect: appointment with ${doctor.name} on ${when}. Manage at https://ayurconnect.com/dashboard/appointments`,
          })
        }
      } catch (err) {
        fastify.log.warn({ err }, 'appointment fan-out failed (non-fatal)')
      }
    })()

    return reply.code(201).send(appt)
  })

  fastify.patch('/:id/cancel', async (request, reply) => {
    const { id } = request.params as { id: string }
    const sess = request.session!
    const appt = await fastify.prisma.appointment.findUnique({ where: { id } })
    if (!appt) return reply.code(404).send({ error: 'not found' })
    const isAdmin = sess.user.role === 'ADMIN'
    const isMine = appt.userId === sess.user.id
    if (!isAdmin && !isMine) return reply.code(403).send({ error: 'forbidden' })
    return fastify.prisma.appointment.update({
      where: { id },
      data: { status: 'cancelled' },
    })
  })
}

export default route
