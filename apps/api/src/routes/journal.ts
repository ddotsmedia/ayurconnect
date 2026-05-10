import type { FastifyPluginAsync } from 'fastify'
import { chat } from '../lib/llm.js'

export const autoPrefix = '/me/journal'

const journal: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireSession)

  // GET /me/journal?from=YYYY-MM-DD&to=YYYY-MM-DD — list entries (default last 30 days).
  fastify.get('/', async (request) => {
    const userId = request.session!.user.id
    const { from, to } = request.query as { from?: string; to?: string }
    const start = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end   = to   ? new Date(to)   : new Date()
    const items = await fastify.prisma.journalEntry.findMany({
      where: { userId, date: { gte: start, lte: end } },
      orderBy: { date: 'desc' },
      take: 60,
    })
    return { items }
  })

  // POST /me/journal — upsert today's (or specified) entry.
  fastify.post('/', async (request, reply) => {
    const userId = request.session!.user.id
    const body = request.body as Record<string, unknown>

    const dateStr = typeof body.date === 'string' && body.date ? body.date : new Date().toISOString().slice(0, 10)
    const date    = new Date(dateStr + 'T00:00:00Z')
    if (Number.isNaN(date.getTime())) return reply.code(400).send({ error: 'invalid date' })

    const data = {
      mood:       num(body.mood, 1, 5),
      sleepHours: num(body.sleepHours, 0, 24),
      energy:     num(body.energy, 1, 5),
      symptoms:   Array.isArray(body.symptoms) ? (body.symptoms as unknown[]).filter((s): s is string => typeof s === 'string').slice(0, 30) : [],
      doshaFeel:  typeof body.doshaFeel === 'string' && ['vata', 'pitta', 'kapha', 'balanced'].includes(body.doshaFeel) ? body.doshaFeel : null,
      food:       typeof body.food === 'string' && body.food.trim() ? body.food.trim().slice(0, 1000) : null,
      notes:      typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim().slice(0, 2000) : null,
    }

    const entry = await fastify.prisma.journalEntry.upsert({
      where:  { userId_date: { userId, date } },
      create: { userId, date, ...data },
      update: data,
    })
    return entry
  })

  // DELETE /me/journal/:id
  fastify.delete('/:id', async (request, reply) => {
    const userId = request.session!.user.id
    const { id } = request.params as { id: string }
    const e = await fastify.prisma.journalEntry.findFirst({ where: { id, userId } })
    if (!e) return reply.code(404).send({ error: 'not found' })
    await fastify.prisma.journalEntry.delete({ where: { id } })
    return reply.code(204).send()
  })

  // GET /me/journal/summary?days=7 — AI summary of the last N days via Gemini.
  fastify.get('/summary', async (request, reply) => {
    const userId = request.session!.user.id
    const days = Math.min(Math.max(Number((request.query as { days?: string }).days ?? 7), 3), 90)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const entries = await fastify.prisma.journalEntry.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: 'asc' },
    })
    if (entries.length === 0) return reply.code(404).send({ error: `no journal entries in the last ${days} days` })

    // Compose the prompt content from raw entries (date + numeric scores + free text).
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

    const system = `You are an Ayurveda-savvy wellness summarizer. Given a daily journal of mood/sleep/energy/symptoms/food, write a concise weekly digest in this exact structure:

**Trend overview** (2-3 sentences on overall direction)
**Dosha pattern** (Vata/Pitta/Kapha tilt observed; cite evidence from the journal)
**Standout days** (1-2 best and 1-2 worst, with reasons)
**Suggestions** (3 short bullet points: dietary, lifestyle, herbs to consider — classical Ayurveda only)

End with the disclaimer: "Educational only. Consult a qualified Vaidya for personal advice."

No greeting, no markdown headers besides the bolded section names, no emoji.`

    const result = await chat({ system, message: `Last ${days} days of journal entries for one user:\n\n${rows}\n\nWrite the digest.` })
    if (!result.ok) {
      const f = result as Extract<typeof result, { ok: false }>
      return reply.code(503).send({ error: f.reason ?? 'LLM unavailable', code: f.code, provider: f.provider })
    }
    return { summary: result.text, provider: result.provider, days, entries: entries.length }
  })
}

function num(v: unknown, min: number, max: number): number | null {
  if (v == null) return null
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  return Math.max(min, Math.min(max, n))
}

export default journal
