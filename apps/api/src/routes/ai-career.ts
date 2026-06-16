// AI Career Advisor — pickModel() pattern: Haiku for default queries,
// Sonnet for explicitly complex requests. Never Opus.

import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/ai'

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
const HAIKU         = process.env.ANTHROPIC_HAIKU_MODEL  ?? 'claude-haiku-4-5-20251001'
const SONNET        = process.env.ANTHROPIC_SONNET_MODEL ?? 'claude-sonnet-4-6'

const SYSTEM = `You are AyurConnect Career Advisor, an expert in Ayurveda healthcare careers.
Help BAMS graduates and Ayurveda professionals with career guidance, salary info, licensing,
interview prep, and job market insights. Be specific to the Ayurveda/AYUSH sector.
Keep answers concise (under 200 words). When relevant, suggest concrete next steps and
link to: /jobs (job board), /jobs/licensing (licensing guides), /jobs/profile (build profile).`

function pickModel(text: string): string {
  const complex = /plan|roadmap|detailed|comprehensive|review my resume|skill gap|long-term|career path/i
  return complex.test(text) ? SONNET : HAIKU
}

const aiCareer: FastifyPluginAsync = async (fastify) => {
  fastify.post('/career', async (request, reply) => {
    const b = request.body as { message?: string; history?: Array<{ role: 'user' | 'assistant'; text: string }> }
    const message = String(b.message ?? '').slice(0, 2000)
    if (!message || !ANTHROPIC_KEY) {
      return reply.send({ reply: 'Advisor offline (no API key configured). For now, try /jobs/licensing for jurisdiction guides or /jobs for live openings.' })
    }
    const history = (b.history ?? []).slice(-6).map((m) => ({ role: m.role, content: m.text }))
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: pickModel(message),
          max_tokens: 600,
          system: SYSTEM,
          messages: [...history, { role: 'user', content: message }],
        }),
      })
      if (!r.ok) return reply.send({ reply: 'Sorry, advisor offline right now.' })
      const j = await r.json() as { content?: Array<{ text?: string }> }
      return reply.send({ reply: j.content?.[0]?.text?.trim() ?? '—' })
    } catch { return reply.send({ reply: 'Sorry, advisor offline right now.' }) }
  })
}

export default aiCareer
