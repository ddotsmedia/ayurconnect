// Appointment reminder + post-visit review-prompt cron.
//
// Runs every 15 minutes. Three jobs per fire:
//   1. 24h-window reminders   — patients with a confirmed appointment
//                              22-26h from now AND reminded24hAt is NULL.
//   2. 1h-window reminders    — same but 45-75 min from now AND reminded1hAt is NULL.
//   3. Review prompt          — appointments where dateTime is 4-24h IN THE PAST,
//                              status is confirmed/completed, reviewPrompted=false.
//
// Each appointment is updated with the timestamp of the firing so the next
// cron pass doesn't re-send. WhatsApp + email + in-app bell all fire (each
// best-effort, isolated try/catch).
//
// Disable entirely: APPOINTMENT_REMINDER_CRON_DISABLED=true
// Override schedule: APPOINTMENT_REMINDER_CRON_SCHEDULE='*/15 * * * *'

import cron, { type ScheduledTask } from 'node-cron'
import type { FastifyInstance } from 'fastify'
import { createNotification } from '../lib/notify.js'
import { sendWhatsApp, whatsappEnabled } from '../lib/whatsapp.js'
import { sendEmail, emailEnabled } from '../lib/email.js'

const SCHEDULE = process.env.APPOINTMENT_REMINDER_CRON_SCHEDULE ?? '*/15 * * * *'
const STARTUP_DELAY_MS = 30_000

let task: ScheduledTask | null = null
let runInFlight = false

function fmt(dt: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata',
  }).format(dt)
}

export async function runAppointmentReminders(fastify: FastifyInstance): Promise<{
  reminded24h: number; reminded1h: number; reviewPrompted: number
}> {
  const now = new Date()
  const t = now.getTime()

  // ─── 1. 24-hour reminders (window: 22h to 26h from now) ──────────────
  const win24 = await fastify.prisma.appointment.findMany({
    where: {
      status:        { in: ['confirmed', 'scheduled'] },
      dateTime:      { gte: new Date(t + 22 * 3600_000), lt: new Date(t + 26 * 3600_000) },
      reminded24hAt: null,
    },
    include: {
      doctor: { select: { name: true } },
      user:   { select: { id: true, email: true, phone: true, name: true } },
    },
    take: 100,
  })

  let n24 = 0
  for (const appt of win24) {
    const when = fmt(appt.dateTime)
    const doc = appt.doctor?.name ?? 'your doctor'
    await Promise.allSettled([
      createNotification(fastify, {
        userId: appt.userId,
        type:   'appointment-reminder-24h',
        title:  `Tomorrow: appointment with ${doc}`,
        body:   `${when} · ${appt.type}. Review your intake and prep.`,
        link:   '/dashboard/appointments',
      }),
      emailEnabled() && appt.user.email
        ? sendEmail({
            to:      appt.user.email,
            subject: `Reminder: appointment with ${doc} tomorrow`,
            html:    `<p>Hi ${appt.user.name ?? 'there'},</p>
                      <p>This is a reminder that you have an appointment with <strong>${doc}</strong> on <strong>${when}</strong>.</p>
                      <p>Type: ${appt.type}</p>
                      <p>Manage at https://ayurconnect.com/dashboard/appointments</p>`,
            text:    `Reminder: appointment with ${doc} on ${when} (${appt.type}). https://ayurconnect.com/dashboard/appointments`,
          })
        : Promise.resolve(),
      whatsappEnabled() && appt.user.phone
        ? sendWhatsApp({ to: appt.user.phone, body: `🌿 AyurConnect reminder: appointment with ${doc} tomorrow at ${when}.` })
        : Promise.resolve(),
    ])
    await fastify.prisma.appointment.update({ where: { id: appt.id }, data: { reminded24hAt: now } })
    n24++
  }

  // ─── 2. 1-hour reminders (window: 45-75 min from now) ────────────────
  const win1 = await fastify.prisma.appointment.findMany({
    where: {
      status:       { in: ['confirmed', 'scheduled'] },
      dateTime:     { gte: new Date(t + 45 * 60_000), lt: new Date(t + 75 * 60_000) },
      reminded1hAt: null,
    },
    include: {
      doctor: { select: { name: true } },
      user:   { select: { id: true, email: true, phone: true, name: true } },
    },
    take: 100,
  })

  let n1 = 0
  for (const appt of win1) {
    const when = fmt(appt.dateTime)
    const doc = appt.doctor?.name ?? 'your doctor'
    const isVideo = appt.type.includes('video')
    const videoLink = isVideo && appt.notes?.match(/Video room: (https?:\/\/\S+)/)?.[1] || null
    await Promise.allSettled([
      createNotification(fastify, {
        userId: appt.userId,
        type:   'appointment-reminder-1h',
        title:  `Appointment in 1 hour with ${doc}`,
        body:   `${when} · ${appt.type}${videoLink ? `. Join: ${videoLink}` : ''}`,
        link:   '/dashboard/appointments',
      }),
      whatsappEnabled() && appt.user.phone
        ? sendWhatsApp({ to: appt.user.phone, body: `🌿 AyurConnect: appointment with ${doc} in 1 hour (${when}).${videoLink ? ' Video: ' + videoLink : ''}` })
        : Promise.resolve(),
    ])
    await fastify.prisma.appointment.update({ where: { id: appt.id }, data: { reminded1hAt: now } })
    n1++
  }

  // ─── 3. Post-appointment review prompt (4-24h after dateTime) ────────
  const reviewWindow = await fastify.prisma.appointment.findMany({
    where: {
      status:         { in: ['confirmed', 'completed'] },
      dateTime:       { gte: new Date(t - 24 * 3600_000), lt: new Date(t - 4 * 3600_000) },
      reviewPrompted: false,
      doctorId:       { not: null },
    },
    include: { doctor: { select: { name: true } }, user: { select: { email: true, name: true } } },
    take: 100,
  })

  let nReview = 0
  for (const appt of reviewWindow) {
    const doc = appt.doctor?.name ?? 'your doctor'
    await Promise.allSettled([
      createNotification(fastify, {
        userId: appt.userId,
        type:   'appointment-review-prompt',
        title:  `How was your consultation with ${doc}?`,
        body:   'A short review helps other patients find the right care.',
        link:   `/doctors/${appt.doctorId}?review=1`,
      }),
      emailEnabled() && appt.user.email
        ? sendEmail({
            to:      appt.user.email,
            subject: `How was your consultation with ${doc}?`,
            html:    `<p>Hi ${appt.user.name ?? 'there'},</p>
                      <p>We hope your consultation with <strong>${doc}</strong> went well. Would you take 60 seconds to leave a short review? It helps other Ayurveda patients find the right doctor.</p>
                      <p><a href="https://ayurconnect.com/doctors/${appt.doctorId}?review=1">Leave a review →</a></p>`,
            text:    `Leave a review for ${doc}: https://ayurconnect.com/doctors/${appt.doctorId}?review=1`,
          })
        : Promise.resolve(),
    ])
    await fastify.prisma.appointment.update({ where: { id: appt.id }, data: { reviewPrompted: true } })
    nReview++
  }

  return { reminded24h: n24, reminded1h: n1, reviewPrompted: nReview }
}

export function startAppointmentReminderCron(fastify: FastifyInstance): { stop: () => void } | null {
  if (process.env.APPOINTMENT_REMINDER_CRON_DISABLED === 'true') {
    fastify.log.info('appointment-reminder cron: disabled')
    return null
  }
  if (!cron.validate(SCHEDULE)) {
    fastify.log.warn({ schedule: SCHEDULE }, 'appointment-reminder cron: invalid schedule, refusing')
    return null
  }

  const tick = async (label: 'startup' | 'cron') => {
    if (runInFlight) {
      fastify.log.info({ label }, 'appointment-reminder cron: skipping (in flight)')
      return
    }
    runInFlight = true
    const t0 = Date.now()
    try {
      const summary = await runAppointmentReminders(fastify)
      fastify.log.info({ label, ...summary, durationMs: Date.now() - t0 }, 'appointment-reminder cron: complete')
    } catch (err) {
      fastify.log.warn({ err, label }, 'appointment-reminder cron: failed')
    } finally {
      runInFlight = false
    }
  }

  task = cron.schedule(SCHEDULE, () => { void tick('cron') }, { timezone: 'Asia/Kolkata' })
  fastify.log.info({ schedule: SCHEDULE, tz: 'Asia/Kolkata' }, 'appointment-reminder cron: started')
  setTimeout(() => { void tick('startup') }, STARTUP_DELAY_MS)
  return { stop: () => { task?.stop() } }
}
