import type { FastifyPluginAsync } from 'fastify'
import { chat } from '../lib/llm.js'

export const autoPrefix = '/triage'

const SPECIALIZATIONS = ['Panchakarma', 'Kayachikitsa', 'Prasuti Tantra', 'Kaumarbhritya', 'Shalya Tantra', 'Shalakya', 'Manasika', 'Rasashastra', 'Dravyaguna', 'Roganidana']

const SYSTEM = `You are an Ayurveda triage assistant. Given a patient's free-text description of their concerns, output STRICT JSON only — no markdown fences, no prose, exactly:

{
  "specialization":      "Kayachikitsa | Panchakarma | Prasuti Tantra | Kaumarbhritya | Shalya Tantra | Shalakya | Manasika | Rasashastra | Dravyaguna | Roganidana",
  "doshaImbalance":      "vata | pitta | kapha | vata-pitta | pitta-kapha | vata-kapha | tridosha",
  "summary":             "1-2 sentence overview of what's likely going on, in classical Ayurveda terms.",
  "lifestyleTips":       ["3-5 specific lifestyle/diet tips"],
  "herbsToConsider":     [{ "name": "Ashwagandha | Brahmi | etc.", "why": "1 sentence reason" }],
  "urgency":             "self-care | see-vaidya-soon | see-allopathic-emergency",
  "redFlags":            ["any symptoms suggesting allopathic emergency, or empty array"]
}

Constraints:
- Do not invent herb names — use classical, well-known Ayurvedic herbs.
- If anything sounds like a medical emergency (chest pain, breathing difficulty, severe bleeding, suicidal ideation, suspected stroke), set urgency="see-allopathic-emergency" AND list it in redFlags.
- For specialization, pick the closest match from the list above. Default to Kayachikitsa for general internal medicine.
- Output ONLY the JSON object. No prefix, suffix, comments, or markdown.`

export type TriageResult = {
  specialization: string
  doshaImbalance: string
  summary: string
  lifestyleTips: string[]
  herbsToConsider: Array<{ name: string; why: string }>
  urgency: 'self-care' | 'see-vaidya-soon' | 'see-allopathic-emergency'
  redFlags: string[]
}

const route: FastifyPluginAsync = async (fastify) => {
  // POST /triage — body: { symptoms: string, age?: number, sex?: 'M'|'F'|'O', duration?: string }
  fastify.post('/', async (request, reply) => {
    const body = request.body as { symptoms?: string; age?: number; sex?: string; duration?: string }
    const symptoms = (body.symptoms ?? '').trim()
    if (symptoms.length < 15) {
      return reply.code(400).send({ error: 'Please describe your symptoms in at least a sentence (15+ chars).' })
    }

    const ctx: string[] = [`Symptoms: ${symptoms}`]
    if (body.age)      ctx.push(`Age: ${body.age}`)
    if (body.sex)      ctx.push(`Sex: ${body.sex}`)
    if (body.duration) ctx.push(`Duration: ${body.duration}`)

    const result = await chat({ system: SYSTEM, message: ctx.join('\n') })
    if (!result.ok) {
      const f = result as Extract<typeof result, { ok: false }>
      return reply.code(503).send({ error: f.reason ?? 'AI unavailable', code: f.code, provider: f.provider })
    }

    let parsed: TriageResult
    try {
      const cleaned = result.text.trim().replace(/^```json\s*|\s*```$/g, '').replace(/^```\s*|\s*```$/g, '')
      parsed = JSON.parse(cleaned) as TriageResult
    } catch {
      return reply.code(502).send({ error: 'AI returned invalid JSON', raw: result.text.slice(0, 500) })
    }

    // Sanitise / clamp
    if (!SPECIALIZATIONS.includes(parsed.specialization)) parsed.specialization = 'Kayachikitsa'
    if (!['self-care', 'see-vaidya-soon', 'see-allopathic-emergency'].includes(parsed.urgency)) parsed.urgency = 'see-vaidya-soon'
    if (!Array.isArray(parsed.lifestyleTips))  parsed.lifestyleTips = []
    if (!Array.isArray(parsed.herbsToConsider)) parsed.herbsToConsider = []
    if (!Array.isArray(parsed.redFlags))       parsed.redFlags = []

    return { ...parsed, provider: result.provider }
  })
}

export default route
