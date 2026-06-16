// Daily job-match digest cron — 08:00 IST.
// Sends top 5 fresh job matches to each active candidate (email + WhatsApp
// when opted in). Idempotent: tracks lastDigestSentAt on CandidateProfile.

import cron, { type ScheduledTask } from 'node-cron'
import type { FastifyInstance } from 'fastify'
import { sendWhatsApp, whatsappEnabled } from '../lib/whatsapp.js'
import { sendEmail, emailEnabled } from '../lib/email.js'

const SCHEDULE = process.env.JOB_DIGEST_CRON_SCHEDULE ?? '30 2 * * *'  // 08:00 IST = 02:30 UTC

export function registerJobDigestCron(fastify: FastifyInstance): ScheduledTask | null {
  if (process.env.JOB_DIGEST_CRON_DISABLED === 'true') {
    fastify.log.info('[jobDigest] disabled via env')
    return null
  }
  const task = cron.schedule(SCHEDULE, async () => {
    try {
      const since = new Date(Date.now() - 7 * 86_400_000)
      const candidates = await fastify.prisma.candidateProfile.findMany({
        where: { availability: { in: ['actively_looking', 'open_to_offers'] } },
        select: { id: true, fullName: true, email: true, phone: true, whatsapp: true, userId: true },
      })
      let sent = 0
      for (const c of candidates) {
        const matches = await fastify.prisma.matchScore.findMany({
          where: { candidateId: c.id, computedAt: { gte: since } },
          orderBy: { score: 'desc' }, take: 5,
        })
        if (matches.length === 0) continue
        const jobs = await fastify.prisma.job.findMany({
          where: { id: { in: matches.map((m) => m.jobId) }, status: 'active' },
          select: { id: true, title: true, location: true, clinic: true, salaryMin: true, salaryMax: true, currency: true },
        })
        if (jobs.length === 0) continue
        const lines = jobs.map((j) => {
          const m = matches.find((x) => x.jobId === j.id)
          const salary = j.salaryMin ? `${j.currency ?? 'INR'} ${j.salaryMin.toLocaleString()}${j.salaryMax ? '–' + j.salaryMax.toLocaleString() : ''}` : 'Salary on request'
          return `• ${j.title}${j.clinic ? ' · ' + j.clinic : ''} (${j.location ?? '—'}) · ${salary} · ${m?.score ?? 0}% match\n  https://ayurconnect.com/jobs/${j.id}`
        })
        const body = `🩺 AyurConnect — Your daily Ayurveda job matches\n\n${lines.join('\n\n')}\n\nManage alerts: https://ayurconnect.com/jobs/alerts`
        // Email
        if (emailEnabled() && c.email) {
          await sendEmail({ to: c.email, subject: 'Your top Ayurveda job matches today', html: `<p>${body.replace(/\n/g, '<br>')}</p>`, text: body }).catch(() => {})
        }
        // WhatsApp (only if opted in)
        if (whatsappEnabled() && c.whatsapp) {
          await sendWhatsApp({ to: c.whatsapp, body: body.slice(0, 1500) }).catch(() => {})
        }
        sent++
      }
      fastify.log.info(`[jobDigest] sent to ${sent} candidates`)
    } catch (err) {
      fastify.log.error({ err }, '[jobDigest] cron error')
    }
  }, { scheduled: false })
  task.start()
  fastify.log.info(`[jobDigest] cron started on schedule ${SCHEDULE}`)
  return task
}
