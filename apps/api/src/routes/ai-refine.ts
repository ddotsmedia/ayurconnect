// AI text-refinement endpoint — always uses Haiku (cheap, fast).
// On error or missing API key: returns the original text so the UI keeps working.

import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/ai'

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
const HAIKU_MODEL   = process.env.ANTHROPIC_HAIKU_MODEL ?? 'claude-haiku-4-5-20251001'

const aiRefine: FastifyPluginAsync = async (fastify) => {
  fastify.post('/refine', async (request, reply) => {
    const b = request.body as { field?: string; text?: string; context?: string }
    const text = String(b.text ?? '').slice(0, 4000)
    if (!text || !ANTHROPIC_KEY) return reply.send({ text })
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: HAIKU_MODEL,
          max_tokens: 400,
          messages: [{
            role: 'user',
            content: `You are editing a single section of an Ayurveda doctor's resume.\nContext: ${b.context ?? 'Resume section'}.\nField: ${b.field ?? 'text'}.\nRewrite the following to be concise, professional, and impactful (3-5 sentences max). Keep classical Ayurveda terminology accurate. Return ONLY the revised text, no preamble.\n\n---\n${text}`,
          }],
        }),
      })
      if (!res.ok) return reply.send({ text })
      const j = await res.json() as { content?: Array<{ text?: string }> }
      const out = j.content?.[0]?.text?.trim() ?? text
      return reply.send({ text: out })
    } catch { return reply.send({ text }) }
  })
}

export default aiRefine
