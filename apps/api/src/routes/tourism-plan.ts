import type { FastifyPluginAsync } from 'fastify'
import { chat } from '../lib/llm.js'
import { rateLimitOk } from '../lib/rate-limit.js'

export const autoPrefix = '/tourism'

// AI medical-tourism trip planner (Phase 9b). Inputs (condition, dates, budget,
// origin city) → a structured treatment package. Output is a REVIEWABLE plan
// (booking request only in v1) — no live payment, no live booking.

const PLAN_RATE = {
  bucket:    'tourism.plan',
  windowSec: 600,
  max:       6,
  by:        'ip' as const,
  message:   'Too many planning requests — please try again in a few minutes.',
}

const SYSTEM = `You are an Ayurveda medical-tourism trip planner for Kerala, India. Given a patient's condition, travel window, budget and origin city, produce a STRUCTURED treatment package as JSON ONLY (no prose outside the JSON).

Return exactly this shape:
{
  "summary": string,                       // 1-2 sentence overview
  "recommendedTreatment": string,          // e.g. "Panchakarma + Rasayana, 21 days"
  "durationDays": number,
  "phases": [ { "title": string, "days": string, "detail": string } ],
  "centreGuidance": string,                // what KIND of accredited centre to choose (do NOT invent specific clinic names)
  "stayGuidance": string,                  // lodging type near the centre
  "visaGuidance": string,                  // e-Ayush / e-Medical / tourist visa note for the origin country
  "estimatedCost": { "currency": string, "low": number, "high": number, "note": string },
  "itinerary": [ { "day": string, "activity": string } ],
  "disclaimer": string
}

Rules:
- Do NOT invent specific clinic, hotel or doctor names — give guidance on what to look for instead.
- Keep medical claims conservative and non-diagnostic.
- Costs are rough estimates; say so in the note.
- Always include a disclaimer that this is an indicative plan, not medical advice or a confirmed booking.`

type PlanReq = {
  condition?: string
  originCity?: string
  country?: string
  startDate?: string
  durationDays?: number
  budget?: string
}

const route: FastifyPluginAsync = async (fastify) => {
  fastify.post('/plan', async (request, reply) => {
    if (!(await rateLimitOk(fastify, request, reply, PLAN_RATE))) return
    const b = (request.body ?? {}) as PlanReq
    const condition = (b.condition ?? '').trim().slice(0, 300)
    if (condition.length < 3) return reply.code(400).send({ error: 'condition required' })

    const message = [
      `Condition / goal: ${condition}`,
      b.originCity ? `Origin city: ${b.originCity}` : null,
      b.country ? `Origin country: ${b.country}` : null,
      b.startDate ? `Preferred start: ${b.startDate}` : null,
      b.durationDays ? `Available days: ${b.durationDays}` : null,
      b.budget ? `Budget: ${b.budget}` : null,
      'Return the JSON package now.',
    ].filter(Boolean).join('\n')

    const res = await chat({ system: SYSTEM, message, maxTokens: 1600 })
    if (res.ok !== true) {
      return reply.code(503).send({ error: 'Planner temporarily unavailable. Please try again or submit an enquiry.', reason: res.reason })
    }

    // Extract the JSON object from the model output.
    const match = res.text.match(/\{[\s\S]*\}/)
    if (!match) {
      return reply.code(502).send({ error: 'Could not parse the generated plan. Please try again.' })
    }
    try {
      const plan = JSON.parse(match[0])
      return { ok: true, plan, provider: res.provider }
    } catch {
      return reply.code(502).send({ error: 'Could not parse the generated plan. Please try again.' })
    }
  })
}

export default route
