// AI Mock Interview — Haiku, conversational. Asks 5 Ayurveda interview
// questions and evaluates the candidate's answer briefly between each.

import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/ai'

const KEY = process.env.ANTHROPIC_API_KEY
const HAIKU = process.env.ANTHROPIC_HAIKU_MODEL ?? 'claude-haiku-4-5-20251001'

const aiMockInterview: FastifyPluginAsync = async (fastify) => {
  fastify.post('/mock-interview', async (request, reply) => {
    const b = request.body as { role?: string; history?: Array<{ role: 'user' | 'assistant'; text: string }> }
    const role = String(b.role ?? 'GCC Clinical').slice(0, 50)
    const history = (b.history ?? []).slice(-12)
    if (!KEY) {
      return reply.send({ reply: 'Mock interviewer offline (no API key). Use the Q&A tab for prepared answers.' })
    }
    const system = `You are conducting a mock interview for an Ayurveda doctor seeking a ${role} role.

You ask 5 questions total, one at a time. After each candidate answer (except for the first answer which gets just a "good, next question"):
- Give brief, constructive feedback (2-3 sentences) — what worked, what could be stronger
- Then ask the next question

After the 5th answer, instead of asking another question, give a final evaluation (3-4 sentences):
- Overall strengths from their answers
- 2-3 specific improvement areas
- A score (0-100) and verdict (strong / acceptable / needs work)
- Encourage them

Tone: professional, supportive, specific. No generic praise.
Question pool: background + motivation; specific clinical scenario; difficult patient/conflict; salary expectations; long-term goals.`
    const userMessages = history.map((m) => ({ role: m.role, content: m.text }))
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: HAIKU, max_tokens: 500, system, messages: userMessages }),
      })
      if (!r.ok) return reply.send({ reply: 'Sorry, interviewer offline right now.' })
      const j = await r.json() as { content?: Array<{ text?: string }> }
      return reply.send({ reply: j.content?.[0]?.text?.trim() ?? '—' })
    } catch { return reply.send({ reply: 'Sorry, interviewer offline right now.' }) }
  })
}

export default aiMockInterview
