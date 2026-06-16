// Interview scheduling + feedback + WhatsApp prefs for the job portal.

import type { FastifyPluginAsync } from 'fastify'
import { sendWhatsApp, whatsappEnabled } from '../lib/whatsapp.js'
import { sendEmail, emailEnabled } from '../lib/email.js'

export const autoPrefix = '/jobs-portal'

function googleCalendarLink(title: string, startIso: string, durationMin: number, details: string): string {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const start = new Date(startIso)
  const end   = new Date(start.getTime() + durationMin * 60 * 1000)
  const params = new URLSearchParams({
    action: 'TEMPLATE', text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: details.slice(0, 1500),
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

const interviews: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireSession)

  // Employer: schedule
  fastify.post('/applications/:id/interview', async (request, reply) => {
    const uid = request.session!.user.id
    const { id } = request.params as { id: string }
    const app = await fastify.prisma.jobApp.findUnique({ where: { id }, include: { candidate: { select: { id: true, fullName: true, email: true, whatsapp: true, whatsappReminderOptIn: true } } } })
    if (!app) return reply.code(404).send({ error: 'application not found' })
    const job = await fastify.prisma.job.findUnique({ where: { id: app.jobId }, select: { id: true, userId: true, title: true, clinic: true } })
    if (!job || job.userId !== uid) return reply.code(403).send({ error: 'forbidden' })
    const b = request.body as Record<string, unknown>
    if (!b.scheduledAt || !b.type) return reply.code(400).send({ error: 'scheduledAt + type required' })
    const iv = await fastify.prisma.interview.create({
      data: {
        applicationId: id,
        scheduledAt: new Date(b.scheduledAt as string),
        duration: Number(b.duration) || 30,
        type: String(b.type),
        location:    typeof b.location    === 'string' ? b.location    : null,
        meetingLink: typeof b.meetingLink === 'string' ? b.meetingLink : null,
        interviewerNames: Array.isArray(b.interviewerNames) ? (b.interviewerNames as unknown[]).filter((x): x is string => typeof x === 'string').slice(0, 10) : [],
      },
    })
    await fastify.prisma.jobApp.update({ where: { id }, data: { status: 'interview_scheduled', statusUpdatedAt: new Date() } })

    // Notifications — best effort
    const calLink = googleCalendarLink(`Interview: ${job.title}`, iv.scheduledAt.toISOString(), iv.duration, `Interview at ${job.clinic ?? 'AyurConnect employer'}. ${iv.meetingLink ?? iv.location ?? ''}`.trim())
    const dateStr = iv.scheduledAt.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
    const subj = `Interview scheduled: ${job.title}`
    const body = `Your interview for ${job.title} at ${job.clinic ?? 'AyurConnect employer'} is scheduled on ${dateStr} (${iv.duration} min, ${iv.type}).${iv.meetingLink ? ' Link: ' + iv.meetingLink : ''}\n\nAdd to calendar: ${calLink}\nView application: https://ayurconnect.com/jobs/applications`
    if (emailEnabled() && app.candidate.email) {
      void sendEmail({ to: app.candidate.email, subject: subj, html: `<p>${body.replace(/\n/g, '<br>')}</p>`, text: body }).catch(() => {})
    }
    if (whatsappEnabled() && app.candidate.whatsapp && app.candidate.whatsappReminderOptIn) {
      void sendWhatsApp({ to: app.candidate.whatsapp, body }).catch(() => {})
    }
    return { interview: iv, calLink }
  })

  // Candidate: view own interview details
  fastify.get('/applications/:id/interview', async (request, reply) => {
    const uid = request.session!.user.id
    const me = await fastify.prisma.candidateProfile.findUnique({ where: { userId: uid }, select: { id: true } })
    const { id } = request.params as { id: string }
    const app = await fastify.prisma.jobApp.findUnique({ where: { id }, select: { candidateId: true, jobId: true } })
    if (!app) return reply.code(404).send({ error: 'not found' })
    if (me?.id !== app.candidateId) {
      // Employer can also fetch
      const job = await fastify.prisma.job.findUnique({ where: { id: app.jobId }, select: { userId: true } })
      if (!job || job.userId !== uid) return reply.code(403).send({ error: 'forbidden' })
    }
    return fastify.prisma.interview.findMany({ where: { applicationId: id }, orderBy: { scheduledAt: 'desc' } })
  })

  // Candidate: request reschedule
  fastify.post('/applications/:id/interview/:ivId/reschedule', async (request, reply) => {
    const uid = request.session!.user.id
    const me = await fastify.prisma.candidateProfile.findUnique({ where: { userId: uid }, select: { id: true } })
    const { id, ivId } = request.params as { id: string; ivId: string }
    const app = await fastify.prisma.jobApp.findUnique({ where: { id } })
    if (!app || me?.id !== app.candidateId) return reply.code(403).send({ error: 'forbidden' })
    const b = request.body as { suggestedAt?: string; note?: string }
    await fastify.prisma.interview.update({
      where: { id: ivId },
      data: { status: 'rescheduled', feedback: `Candidate suggested: ${b.suggestedAt ?? '—'}. ${b.note ?? ''}`.slice(0, 1000) },
    })
    return { ok: true }
  })

  // Employer: post-interview feedback scorecard
  fastify.post('/interviews/:ivId/feedback', async (request, reply) => {
    const uid = request.session!.user.id
    const { ivId } = request.params as { ivId: string }
    const iv = await fastify.prisma.interview.findUnique({ where: { id: ivId }, include: { application: true } })
    if (!iv) return reply.code(404).send({ error: 'not found' })
    const job = await fastify.prisma.job.findUnique({ where: { id: iv.application.jobId }, select: { userId: true } })
    if (!job || job.userId !== uid) return reply.code(403).send({ error: 'forbidden' })
    const b = request.body as Record<string, unknown>
    return fastify.prisma.interview.update({
      where: { id: ivId },
      data: {
        rating:         typeof b.rating === 'number' ? Math.max(1, Math.min(5, b.rating)) : null,
        feedback:       typeof b.notes  === 'string' ? b.notes.slice(0, 4000) : null,
        recommendation: typeof b.recommendation === 'string' && ['strong_hire','hire','maybe','no_hire'].includes(b.recommendation) ? b.recommendation : null,
        scorecard:      {
          communication:      typeof b.communication      === 'number' ? b.communication      : null,
          clinicalKnowledge:  typeof b.clinicalKnowledge  === 'number' ? b.clinicalKnowledge  : null,
          practicalSkills:    typeof b.practicalSkills    === 'number' ? b.practicalSkills    : null,
          culturalFit:        typeof b.culturalFit        === 'number' ? b.culturalFit        : null,
        },
        status: 'completed',
      },
    })
  })

  // Update candidate WhatsApp preferences
  fastify.patch('/candidates/me/notifications', async (request, reply) => {
    const uid = request.session!.user.id
    const me = await fastify.prisma.candidateProfile.findUnique({ where: { userId: uid } })
    if (!me) return reply.code(404).send({ error: 'no candidate profile' })
    const b = request.body as Record<string, unknown>
    return fastify.prisma.candidateProfile.update({
      where: { id: me.id },
      data: {
        whatsapp:             typeof b.whatsapp             === 'string' ? b.whatsapp.slice(0, 32) : me.whatsapp,
        whatsappAlertOptIn:    Boolean(b.whatsappAlertOptIn),
        whatsappStatusOptIn:   Boolean(b.whatsappStatusOptIn),
        whatsappReminderOptIn: Boolean(b.whatsappReminderOptIn),
      },
    })
  })

  fastify.patch('/employers/me/notifications', async (request, reply) => {
    const uid = request.session!.user.id
    const me = await fastify.prisma.employerProfile.findUnique({ where: { userId: uid } })
    if (!me) return reply.code(404).send({ error: 'no employer profile' })
    const b = request.body as Record<string, unknown>
    return fastify.prisma.employerProfile.update({
      where: { id: me.id },
      data: {
        whatsappApplicationOptIn: Boolean(b.whatsappApplicationOptIn),
        whatsappDigestOptIn:      Boolean(b.whatsappDigestOptIn),
      },
    })
  })
}

export default interviews
