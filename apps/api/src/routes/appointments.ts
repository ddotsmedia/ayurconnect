import type { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { createNotification } from '../lib/notify.js'
import { sendWhatsApp } from '../lib/whatsapp.js'
import { sendEmail, emailEnabled } from '../lib/email.js'
import { createVideoRoom, createMeetingToken, videoEnabled } from '../lib/video.js'
import { logPhiRead } from '../lib/audit.js'

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
    // P0-H4 (2026-05-18 healthcare audit): the list endpoint used to return
    // every PHI field on each row (consultation notes, prescription text,
    // treatment plan, doctorPrivateNotes, declineReason). For 100 rows per
    // call, an admin XSS or session leak dumped the entire clinical record
    // for every patient. The list now returns only the directory-level
    // summary; full PHI lives on GET /:id which is gated per row.
    return fastify.prisma.appointment.findMany({
      where,
      select: {
        id:            true,
        status:        true,
        type:          true,
        dateTime:      true,
        duration:      true,
        fee:           true,
        paymentStatus: true,
        createdAt:     true,
        updatedAt:     true,
        // Patient summary so the patient sees their own short complaint in
        // their list, but admins/doctors get a redacted preview only when
        // looking at someone else's row. Trade-off: doctors see this on
        // their own assigned patients (legitimate). Admin sees a redacted
        // marker — they can drill into GET /:id (audited) for full PHI.
        chiefComplaint: true,
        doctor: { select: { id: true, name: true, specialization: true, district: true, photoUrl: true } },
        user:   { select: { id: true, name: true } },
        // PHI fields intentionally NOT in this select:
        // consultationSummary, prescription, treatmentPlan, doctorPrivateNotes,
        // declineReason, notes (free-text), consultationStartedAt/EndedAt
        // markers stay out; followUpRecommended/AfterWeeks fine.
        followUpRecommended: true,
        followUpAfterWeeks:  true,
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
    // P0-H5: audit every non-owner read (admin or unrelated-doctor) of PHI.
    if (!isMine) {
      logPhiRead(fastify, request, { targetType: 'Appointment', targetId: appt.id })
    }
    return appt
  })

  fastify.post('/', async (request, reply) => {
    const sess = request.session!
    const body = request.body as Record<string, unknown>
    if (!body.doctorId || !body.dateTime || !body.type) {
      return reply.code(400).send({ error: 'doctorId, dateTime, type required' })
    }
    // Validate dateTime: must be a real ISO date and must be in the future
    // (allow 1min grace for clock skew). Rejecting bad input here stops garbage
    // ("yesterday", "abc", or a 1970-epoch zero) before it hits the DB.
    const dt = new Date(String(body.dateTime))
    if (isNaN(dt.getTime())) {
      return reply.code(400).send({ error: 'dateTime must be a valid ISO timestamp' })
    }
    if (dt.getTime() < Date.now() - 60_000) {
      return reply.code(400).send({ error: 'dateTime must be in the future' })
    }
    // Cap at 2 years out — anything further is almost certainly a typo / abuse.
    if (dt.getTime() > Date.now() + 2 * 365 * 86400 * 1000) {
      return reply.code(400).send({ error: 'dateTime is too far in the future' })
    }
    // Sanity: doctor exists
    const doctor = await fastify.prisma.doctor.findUnique({ where: { id: String(body.doctorId) } })
    if (!doctor) return reply.code(404).send({ error: 'doctor not found' })
    // P1-H6 (2026-05-18 healthcare audit): block PHI flow against unverified
    // doctors. A patient's chiefComplaint (free-text symptoms) is PHI; until
    // the doctor's credentials clear admin review, that data should not be
    // collected on their behalf. The patient UI can offer an explicit
    // `acceptUnverified: true` flag for legitimate "we know each other
    // already, urgent slot" cases; bookings that don't set it are blocked.
    if (!doctor.ccimVerified && body.acceptUnverified !== true && sess.user.role !== 'ADMIN') {
      return reply.code(409).send({
        error: 'this doctor is awaiting verification — book only if you have explicit prior contact',
        code:  'doctor-not-verified',
      })
    }

    // P1-11 (2026-05-18 audit): slot booking is wrapped in a transaction with
    // a conditional UPDATE — only flip slot.status='open' → 'booked' (the
    // updateMany returns 0 if a concurrent booking already flipped it).
    // Then we create the appointment. If the slot update doesn't take, abort
    // with 409. Eliminates the previous TOCTOU race where two concurrent
    // bookings both passed the open-check and both created appointments.
    const slotId = body.slotId ? String(body.slotId) : null

    const appt = await fastify.prisma.$transaction(async (tx) => {
      if (slotId) {
        const slot = await tx.doctorSlot.findUnique({ where: { id: slotId } })
        if (!slot || slot.doctorId !== doctor.id) throw new Error('SLOT_NOT_FOUND')
        if (slot.status !== 'open')               throw new Error('SLOT_NOT_OPEN')
        // Atomic claim: only succeeds if the slot is still open.
        const claim = await tx.doctorSlot.updateMany({
          where: { id: slotId, status: 'open' },
          data:  { status: 'booked' },
        })
        if (claim.count === 0) throw new Error('SLOT_NOT_OPEN')
      }
      return tx.appointment.create({
        data: {
          userId:        sess.user.id,
          doctorId:      String(body.doctorId),
          dateTime:      dt,
          type:          String(body.type),
          chiefComplaint: body.chiefComplaint ? String(body.chiefComplaint) : null,
          duration:      body.duration ? String(body.duration) : null,
          notes:         body.notes ? String(body.notes) : null,
          fee:           null,
          paymentStatus: 'free',
          status:        'scheduled',
        },
      })
    }).catch((err: Error) => {
      if (err.message === 'SLOT_NOT_FOUND') return { __error: 404, message: 'slot not found for this doctor' } as const
      if (err.message === 'SLOT_NOT_OPEN')  return { __error: 409, message: 'slot is already booked' } as const
      throw err
    })
    if ('__error' in appt) return reply.code(appt.__error).send({ error: appt.message })

    // ─── Create video room if this is a video consultation ──────────────
    let videoUrl: string | null = null
    if (appt.type === 'consultation-video' && videoEnabled()) {
      try {
        const room = await createVideoRoom({
          name: `${doctor.name}-${appt.id.slice(-6)}`,
          validFrom:  Math.floor(new Date(appt.dateTime).getTime() / 1000) - 600, // 10min early
          validUntil: Math.floor(new Date(appt.dateTime).getTime() / 1000) + 90 * 60, // 90min window
        })
        if (room.ok) {
          videoUrl = room.url
          await fastify.prisma.appointment.update({ where: { id: appt.id }, data: { notes: `${appt.notes ? appt.notes + '\n\n' : ''}Video room: ${room.url}` } })
        }
      } catch (err) { fastify.log.warn({ err }, 'video room creation failed (non-fatal)') }
    }

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
        // P0-H3 (2026-05-18 healthcare audit): we used to embed the Daily.co
        // room URL directly in email + WhatsApp. Lock-screen previews of
        // notifications could leak the join URL to anyone glancing at the
        // patient's phone, and email forwarding/inbox-indexers turn that
        // into a permanent leak. The room URL is now only revealed via the
        // authenticated /consult/[id] surface — emails/WhatsApp link there.
        if (emailEnabled() && sess.user.email) {
          await sendEmail({
            to: sess.user.email,
            subject: `Your AyurConnect appointment is confirmed`,
            html: `<p>Your consultation is scheduled for <strong>${when}</strong>.</p>
                   <p>Open the consultation from your dashboard when it's time to join: <a href="https://ayurconnect.com/dashboard/appointments">dashboard/appointments</a></p>
                   <p>You can cancel or reschedule from the same page.</p>`,
            text: `Your AyurConnect consultation is scheduled for ${when}. Manage and join at https://ayurconnect.com/dashboard/appointments`,
          })
        }

        // 4. WhatsApp reminder to patient (if Twilio configured + user has phone)
        const me = await fastify.prisma.user.findUnique({ where: { id: sess.user.id }, select: { phone: true } })
        if (me?.phone) {
          await sendWhatsApp({
            to:   me.phone,
            body: `🌿 Your AyurConnect consultation is confirmed for ${when}. Open it from your dashboard at https://ayurconnect.com/dashboard/appointments`,
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
    // P1-H2 (2026-05-18 healthcare audit): block cancel-after-complete which
    // would otherwise damage the clinical record + confuse Razorpay refund
    // state. Same guard for declined. Admin can still force-edit via direct
    // PATCH /admin/appointments/:id if a legitimate override is needed.
    if (!isAdmin && (appt.status === 'completed' || appt.status === 'declined')) {
      return reply.code(409).send({
        error: `cannot cancel an appointment that is already ${appt.status}`,
        code:  'invalid-status-transition',
      })
    }
    return fastify.prisma.appointment.update({
      where: { id },
      data: { status: 'cancelled' },
    })
  })

  // ─── Doctor-side status transitions ─────────────────────────────────────
  // Only the assigned doctor (user.doctorId === appt.doctorId) or an admin
  // can accept/decline/propose-new-time/complete a booking.
  async function loadDoctorAuthed(request: FastifyRequest) {
    const { id } = request.params as { id: string }
    const sess = request.session!
    const appt = await fastify.prisma.appointment.findUnique({
      where: { id },
      include: { doctor: { select: { id: true, name: true } }, user: { select: { id: true, email: true, name: true } } },
    })
    if (!appt) return { error: { code: 404, msg: 'not found' } as const }
    const userExt = sess.user as unknown as { doctorId?: string; role: string; id: string }
    const isAdmin = userExt.role === 'ADMIN'
    const isMyDoctor = userExt.doctorId === appt.doctorId
    if (!isAdmin && !isMyDoctor) return { error: { code: 403, msg: 'forbidden — only the assigned doctor can change status' } as const }
    return { appt }
  }

  async function notifyPatient(
    appt: { id: string; userId: string },
    patient: { email: string; name: string | null } | null,
    payload: { type: 'appointment-confirmed' | 'appointment-declined' | 'appointment-rescheduled'; title: string; body: string; whatsappBody?: string },
  ) {
    try {
      await createNotification(fastify, {
        userId: appt.userId, type: payload.type, title: payload.title, body: payload.body,
        link: '/dashboard/appointments',
      })
      if (emailEnabled() && patient?.email) {
        await sendEmail({
          to: patient.email, subject: payload.title,
          html: `<p>${payload.body}</p><p>Manage at https://ayurconnect.com/dashboard/appointments</p>`,
          text: `${payload.body} — https://ayurconnect.com/dashboard/appointments`,
        })
      }
      const p = await fastify.prisma.user.findUnique({ where: { id: appt.userId }, select: { phone: true } })
      if (p?.phone && payload.whatsappBody) {
        await sendWhatsApp({ to: p.phone, body: payload.whatsappBody })
      }
    } catch (err) {
      fastify.log.warn({ err, apptId: appt.id }, 'doctor-status-change patient notification failed')
    }
  }

  // POST /appointments/:id/accept — doctor confirms the booking
  fastify.patch('/:id/accept', async (request, reply) => {
    const res = await loadDoctorAuthed(request)
    if ('error' in res) return reply.code(res.error.code).send({ error: res.error.msg })
    const { appt } = res
    if (appt.status === 'cancelled' || appt.status === 'declined' || appt.status === 'completed') {
      return reply.code(409).send({ error: `cannot accept appointment in status ${appt.status}` })
    }
    const updated = await fastify.prisma.appointment.update({
      where: { id: appt.id },
      data: { status: 'confirmed' },
    })
    const when = new Date(updated.dateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })
    void notifyPatient(updated, appt.user, {
      type: 'appointment-confirmed',
      title: `Your appointment is confirmed`,
      body:  `${appt.doctor?.name} confirmed your appointment on ${when}.`,
      whatsappBody: `🌿 AyurConnect: ${appt.doctor?.name} confirmed your appointment on ${when}.`,
    })
    return updated
  })

  // PATCH /appointments/:id/decline — doctor refuses + optional reason
  fastify.patch('/:id/decline', async (request, reply) => {
    const res = await loadDoctorAuthed(request)
    if ('error' in res) return reply.code(res.error.code).send({ error: res.error.msg })
    const { appt } = res
    const body = request.body as { reason?: string }
    const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 500) : null

    const updated = await fastify.prisma.appointment.update({
      where: { id: appt.id },
      data: { status: 'declined', declineReason: reason },
    })
    void notifyPatient(updated, appt.user, {
      type: 'appointment-declined',
      title: 'Your appointment was declined',
      body:  reason
        ? `${appt.doctor?.name} couldn't take this booking. Reason: ${reason}. Please reschedule with another time or doctor.`
        : `${appt.doctor?.name} couldn't take this booking. Please book a different slot.`,
      whatsappBody: `🌿 AyurConnect: ${appt.doctor?.name} couldn't take your booking${reason ? ` (${reason})` : ''}. Reschedule at ayurconnect.com/dashboard/appointments`,
    })
    return updated
  })

  // PATCH /appointments/:id/propose-new-time — doctor suggests alternate slot
  // Body: { proposedAt: ISO datetime, note?: string }
  fastify.patch('/:id/propose-new-time', async (request, reply) => {
    const res = await loadDoctorAuthed(request)
    if ('error' in res) return reply.code(res.error.code).send({ error: res.error.msg })
    const { appt } = res
    const body = request.body as { proposedAt?: string; note?: string }
    if (!body.proposedAt) return reply.code(400).send({ error: 'proposedAt required' })
    const proposed = new Date(body.proposedAt)
    if (Number.isNaN(proposed.getTime())) return reply.code(400).send({ error: 'invalid proposedAt' })
    if (proposed.getTime() < Date.now()) return reply.code(400).send({ error: 'proposedAt must be in the future' })

    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : null
    const updated = await fastify.prisma.appointment.update({
      where: { id: appt.id },
      data: { status: 'reschedule-proposed', proposedAt: proposed, declineReason: note },
    })
    const when = proposed.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })
    void notifyPatient(updated, appt.user, {
      type: 'appointment-rescheduled',
      title: `${appt.doctor?.name} proposed a new time`,
      body:  `${appt.doctor?.name} suggested rescheduling your appointment to ${when}${note ? ` (${note})` : ''}. Accept or rebook from your dashboard.`,
      whatsappBody: `🌿 AyurConnect: ${appt.doctor?.name} proposed a new time: ${when}. Confirm at ayurconnect.com/dashboard/appointments`,
    })
    return updated
  })

  // PATCH /appointments/:id/complete — doctor marks as completed (post-visit)
  fastify.patch('/:id/complete', async (request, reply) => {
    const res = await loadDoctorAuthed(request)
    if ('error' in res) return reply.code(res.error.code).send({ error: res.error.msg })
    const { appt } = res
    if (appt.status === 'cancelled' || appt.status === 'declined') {
      return reply.code(409).send({ error: `cannot complete appointment in status ${appt.status}` })
    }
    const updated = await fastify.prisma.appointment.update({
      where: { id: appt.id },
      data: { status: 'completed', consultationEndedAt: new Date() },
    })
    // Don't fire the "leave a review" prompt here — the reminder cron does that
    // a few hours later so the patient has time to digest the visit.
    return updated
  })

  // ─── Online consultation endpoints ──────────────────────────────────────
  // GET /appointments/:id/consultation
  // Returns appointment + video-room URL + role-filtered clinical notes.
  // doctorPrivateNotes is never sent to the patient.
  fastify.get('/:id/consultation', async (request, reply) => {
    const { id } = request.params as { id: string }
    const sess = request.session!
    const appt = await fastify.prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: { select: { id: true, name: true, specialization: true, qualification: true, photoUrl: true } },
        user:   { select: { id: true, name: true, email: true } },
      },
    })
    if (!appt) return reply.code(404).send({ error: 'not found' })
    const userExt = sess.user as unknown as { doctorId?: string; role: string; id: string }
    const isAdmin = userExt.role === 'ADMIN'
    const isMine = appt.userId === sess.user.id
    const isMyDoctor = userExt.doctorId === appt.doctorId
    if (!isAdmin && !isMine && !isMyDoctor) return reply.code(403).send({ error: 'forbidden' })

    // P0-H2 (2026-05-18 healthcare audit): rooms are now `privacy: 'private'`,
    // so the bare URL no longer grants access. Mint a per-user Daily.co
    // meeting token scoped to this participant + this room, valid until the
    // appointment window ends. Returns null if Daily is unconfigured (dev).
    const videoUrl    = appt.notes?.match(/Video room: (https?:\/\/\S+)/)?.[1] ?? null
    const roomNameMatch = videoUrl ? videoUrl.match(/\/([a-z0-9-]+)$/) : null
    let videoToken: string | null = null
    if (videoUrl && roomNameMatch && videoEnabled() && !isAdmin) {
      const t = await createMeetingToken({
        roomName:  roomNameMatch[1],
        userName:  (isMyDoctor ? `Dr ${appt.doctor.name}` : appt.user?.name ?? 'Patient').slice(0, 60),
        userId:    sess.user.id,
        isOwner:   isMyDoctor,
        validFrom: Math.floor(new Date(appt.dateTime).getTime() / 1000) - 600,
        validUntil: Math.floor(new Date(appt.dateTime).getTime() / 1000) + 90 * 60,
      })
      if (t.ok) videoToken = t.token
    }

    // Role-filter the clinical notes — patient never sees doctor's private notes.
    const baseFields = {
      id: appt.id, status: appt.status, type: appt.type, dateTime: appt.dateTime,
      chiefComplaint: appt.chiefComplaint, duration: appt.duration,
      consultationStartedAt: appt.consultationStartedAt, consultationEndedAt: appt.consultationEndedAt,
      consultationSummary: appt.consultationSummary,
      prescription: appt.prescription,
      treatmentPlan: appt.treatmentPlan,
      followUpRecommended: appt.followUpRecommended,
      followUpAfterWeeks: appt.followUpAfterWeeks,
      doctor: appt.doctor, user: appt.user,
      videoUrl,
      videoToken,             // P0-H2: required to join — without it, private rooms reject
      videoEnabled: videoEnabled(),
      role: isMyDoctor || isAdmin ? 'doctor' : 'patient',
    }
    if (isMyDoctor || isAdmin) {
      return { ...baseFields, doctorPrivateNotes: appt.doctorPrivateNotes }
    }
    return baseFields
  })

  // PATCH /appointments/:id/clinical-notes — doctor-only structured notes update.
  // Accepts any subset of: consultationSummary, prescription, treatmentPlan,
  // doctorPrivateNotes, followUpRecommended, followUpAfterWeeks.
  fastify.patch('/:id/clinical-notes', async (request, reply) => {
    const res = await loadDoctorAuthed(request)
    if ('error' in res) return reply.code(res.error.code).send({ error: res.error.msg })
    const { appt } = res
    const body = request.body as Record<string, unknown>
    const data: Record<string, unknown> = {}

    const setStr = (k: 'consultationSummary' | 'prescription' | 'treatmentPlan' | 'doctorPrivateNotes') => {
      if (body[k] === null) { data[k] = null; return }
      if (typeof body[k] === 'string') data[k] = (body[k] as string).slice(0, 8000)
    }
    setStr('consultationSummary')
    setStr('prescription')
    setStr('treatmentPlan')
    setStr('doctorPrivateNotes')
    if (typeof body.followUpRecommended === 'boolean') data.followUpRecommended = body.followUpRecommended
    if (body.followUpAfterWeeks === null) data.followUpAfterWeeks = null
    else if (typeof body.followUpAfterWeeks === 'number' && Number.isFinite(body.followUpAfterWeeks)) {
      data.followUpAfterWeeks = Math.max(1, Math.min(52, Math.round(body.followUpAfterWeeks)))
    }
    if (Object.keys(data).length === 0) return reply.code(400).send({ error: 'no editable fields' })

    return fastify.prisma.appointment.update({ where: { id: appt.id }, data })
  })

  // PATCH /appointments/:id/start — marks consultation as started (when doctor
  // or patient opens /consult page within the appointment window). Idempotent;
  // only sets the first time. Either party can trigger.
  fastify.patch('/:id/start', async (request, reply) => {
    const { id } = request.params as { id: string }
    const sess = request.session!
    const appt = await fastify.prisma.appointment.findUnique({ where: { id }, select: { id: true, userId: true, doctorId: true, consultationStartedAt: true } })
    if (!appt) return reply.code(404).send({ error: 'not found' })
    const userExt = sess.user as unknown as { doctorId?: string; role: string }
    const isAdmin = userExt.role === 'ADMIN'
    const isMine = appt.userId === sess.user.id
    const isMyDoctor = userExt.doctorId === appt.doctorId
    if (!isAdmin && !isMine && !isMyDoctor) return reply.code(403).send({ error: 'forbidden' })

    if (appt.consultationStartedAt) return { ok: true, alreadyStarted: true }
    await fastify.prisma.appointment.update({ where: { id }, data: { consultationStartedAt: new Date() } })
    return { ok: true, alreadyStarted: false }
  })
}

export default route
