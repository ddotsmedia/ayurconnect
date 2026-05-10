// WhatsApp job-alert sender. Uses the existing Twilio WhatsApp wrapper at
// lib/whatsapp.ts (no-op in dev when TWILIO_WHATSAPP_FROM isn't set).
//
// Triggered after each successful job-import run. Finds active subscribers
// whose preferences match newly-created jobs, batches up to 20 messages
// per run, and stamps lastSentAt so we don't double-send the same digest.

import type { FastifyInstance } from 'fastify'
import { sendWhatsApp, whatsappEnabled } from '../lib/whatsapp.js'

const MAX_SENDS_PER_RUN = 20
const MIN_INTERVAL_MS = 1000 * 60 * 60 * 6 // don't send to the same subscriber more than once per 6h

type JobBrief = {
  id:          string
  title:       string
  organization: string | null
  location:    string | null
  salary:      string | null
  applyUrl:    string
  source:      string
  category:    string | null
}

function formatMessage(j: JobBrief): string {
  const lines: string[] = [
    '🌿 New Ayurveda job in Kerala!',
    '',
    `*${j.title}*`,
  ]
  if (j.organization) lines.push(`🏥 ${j.organization}`)
  if (j.location)     lines.push(`📍 ${j.location}`)
  if (j.salary)       lines.push(`💰 ${j.salary}`)
  lines.push('')
  lines.push(`Apply: ${j.applyUrl}`)
  lines.push('')
  lines.push('Reply STOP to unsubscribe')
  return lines.join('\n')
}

function matches(sub: { specialization: string | null; district: string | null; source: string | null }, job: JobBrief): boolean {
  // null filters mean "match anything"
  if (sub.source && sub.source !== job.source) return false

  if (sub.specialization) {
    const blob = `${job.title} ${job.organization ?? ''} ${job.category ?? ''}`.toLowerCase()
    if (!blob.includes(sub.specialization.toLowerCase())) return false
  }
  if (sub.district) {
    const blob = (job.location ?? '').toLowerCase()
    if (!blob.includes(sub.district.toLowerCase())) return false
  }
  return true
}

// Called by the cron after a successful import. `newJobs` should be the
// jobs the importer's persist() reported as `created` this run.
export async function sendAlertsForNewJobs(
  fastify: FastifyInstance,
  newJobs: JobBrief[],
): Promise<{ sent: number; skipped: number }> {
  if (newJobs.length === 0) return { sent: 0, skipped: 0 }
  if (!whatsappEnabled()) {
    fastify.log.info({ newJobs: newJobs.length }, 'whatsappAlerts: WhatsApp not configured, skipping fan-out')
    return { sent: 0, skipped: newJobs.length }
  }

  const cutoff = new Date(Date.now() - MIN_INTERVAL_MS)
  const subs = await fastify.prisma.whatsAppAlertSubscription.findMany({
    where: {
      isActive: true,
      OR: [
        { lastSentAt: null },
        { lastSentAt: { lt: cutoff } },
      ],
    },
    take: MAX_SENDS_PER_RUN,
  })

  let sent = 0, skipped = 0
  for (const sub of subs) {
    const matchedJob = newJobs.find((j) => matches(sub, j))
    if (!matchedJob) { skipped++; continue }

    const result = await sendWhatsApp({ to: sub.phone, body: formatMessage(matchedJob) })
    if (result.ok) {
      sent++
      await fastify.prisma.whatsAppAlertSubscription.update({
        where: { id: sub.id },
        data:  { lastSentAt: new Date() },
      })
    } else {
      fastify.log.warn({ phone: sub.phone, err: result.error }, 'whatsappAlerts: send failed')
      skipped++
    }
    if (sent >= MAX_SENDS_PER_RUN) break
  }

  fastify.log.info({ subs: subs.length, sent, skipped, newJobs: newJobs.length }, 'whatsappAlerts: fan-out complete')
  return { sent, skipped }
}
