// Weekly health-journal AI summary cron.
//
// Schedule: Sunday at 19:00 IST. For each user with >= 3 journal entries
// in the trailing 7 days, generate the AI summary via the existing LLM chain
// (Gemini → Groq → Claude), email it + in-app notification.
//
// Skip users who already received a summary in the last 5 days (de-dupe by
// notification record).
//
// Disable: JOURNAL_SUMMARY_CRON_DISABLED=true
// Override schedule: JOURNAL_SUMMARY_CRON_SCHEDULE='0 19 * * 0'

import cron, { type ScheduledTask } from 'node-cron'
import type { FastifyInstance } from 'fastify'
import { chat } from '../lib/llm.js'
import { createNotification } from '../lib/notify.js'
import { sendEmail, emailEnabled } from '../lib/email.js'

const SCHEDULE = process.env.JOURNAL_SUMMARY_CRON_SCHEDULE ?? '0 19 * * 0' // Sunday 19:00
const MIN_ENTRIES = 3

let task: ScheduledTask | null = null
let runInFlight = false

const SYSTEM_PROMPT = `You are an Ayurveda-savvy wellness summarizer. Given a daily journal of mood/sleep/energy/symptoms/food, write a concise weekly digest in this exact structure:

**Trend overview** (2-3 sentences on overall direction)
**Dosha pattern** (Vata/Pitta/Kapha tilt observed; cite evidence from the journal)
**Standout days** (1-2 best and 1-2 worst, with reasons)
**Suggestions** (3 short bullet points: dietary, lifestyle, herbs to consider — classical Ayurveda only)

End with the disclaimer: "Educational only. Consult a qualified Vaidya for personal advice."

No greeting, no markdown headers besides the bolded section names, no emoji.`

export async function runJournalSummary(fastify: FastifyInstance): Promise<{ users: number; sent: number; skipped: number }> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000)
  const fiveDaysAgo  = new Date(Date.now() - 5 * 24 * 3600 * 1000)

  // Find users with at least MIN_ENTRIES journal entries this week.
  const grouped = await fastify.prisma.journalEntry.groupBy({
    by:    ['userId'],
    where: { date: { gte: sevenDaysAgo } },
    _count: { _all: true },
    having: { userId: { _count: { gte: MIN_ENTRIES } } },
  })

  let sent = 0
  let skipped = 0

  for (const g of grouped) {
    const userId = g.userId

    // Skip if we already sent a summary in the last 5 days.
    const recent = await fastify.prisma.notification.findFirst({
      where: { userId, type: 'journal-weekly-summary', createdAt: { gte: fiveDaysAgo } },
      select: { id: true },
    })
    if (recent) { skipped++; continue }

    // Pull entries
    const entries = await fastify.prisma.journalEntry.findMany({
      where:   { userId, date: { gte: sevenDaysAgo } },
      orderBy: { date: 'asc' },
    })
    if (entries.length < MIN_ENTRIES) { skipped++; continue }

    // Compose the prompt body
    const rows = entries.map((e) => {
      const parts: string[] = []
      parts.push(`[${e.date.toISOString().slice(0, 10)}]`)
      if (e.mood       != null) parts.push(`mood ${e.mood}/5`)
      if (e.sleepHours != null) parts.push(`sleep ${e.sleepHours}h`)
      if (e.energy     != null) parts.push(`energy ${e.energy}/5`)
      if (e.doshaFeel)          parts.push(`dosha-feel ${e.doshaFeel}`)
      if (e.symptoms?.length)   parts.push(`symptoms: ${e.symptoms.join(', ')}`)
      if (e.food)               parts.push(`food: ${e.food}`)
      if (e.notes)              parts.push(`notes: ${e.notes}`)
      return parts.join(' · ')
    }).join('\n')

    const result = await chat({
      system:  SYSTEM_PROMPT,
      message: `Last 7 days of journal entries for one user:\n\n${rows}\n\nWrite the digest.`,
    })
    if (!result.ok) { skipped++; continue }

    // Fetch the user's email to deliver
    const user = await fastify.prisma.user.findUnique({
      where:  { id: userId },
      select: { email: true, name: true },
    })

    const summary = result.text
    const safeSummaryHtml = summary
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

    await Promise.allSettled([
      createNotification(fastify, {
        userId,
        type:  'journal-weekly-summary',
        title: 'Your weekly Ayurveda journal digest',
        body:  summary.slice(0, 200) + (summary.length > 200 ? '…' : ''),
        link:  '/dashboard/journal',
      }),
      emailEnabled() && user?.email
        ? sendEmail({
            to:      user.email,
            subject: 'Your weekly Ayurveda journal digest',
            html:    `<p>Hi ${user.name ?? 'there'},</p>
                      <p>Here's your AI-generated digest of the last 7 days of journal entries:</p>
                      <hr>
                      <div>${safeSummaryHtml}</div>
                      <hr>
                      <p><a href="https://ayurconnect.com/dashboard/journal">Open your journal →</a></p>`,
            text:    `Hi ${user.name ?? 'there'}, here is your weekly journal digest:\n\n${summary}\n\nhttps://ayurconnect.com/dashboard/journal`,
          })
        : Promise.resolve(),
    ])

    sent++
  }

  return { users: grouped.length, sent, skipped }
}

export function startJournalSummaryCron(fastify: FastifyInstance): { stop: () => void } | null {
  if (process.env.JOURNAL_SUMMARY_CRON_DISABLED === 'true') {
    fastify.log.info('journal-summary cron: disabled')
    return null
  }
  if (!cron.validate(SCHEDULE)) {
    fastify.log.warn({ schedule: SCHEDULE }, 'journal-summary cron: invalid schedule, refusing')
    return null
  }

  task = cron.schedule(SCHEDULE, async () => {
    if (runInFlight) return
    runInFlight = true
    const t0 = Date.now()
    try {
      const summary = await runJournalSummary(fastify)
      fastify.log.info({ ...summary, durationMs: Date.now() - t0 }, 'journal-summary cron: complete')
    } catch (err) {
      fastify.log.warn({ err }, 'journal-summary cron: failed')
    } finally { runInFlight = false }
  }, { timezone: 'Asia/Kolkata' })
  fastify.log.info({ schedule: SCHEDULE, tz: 'Asia/Kolkata' }, 'journal-summary cron: started')
  return { stop: () => { task?.stop() } }
}
