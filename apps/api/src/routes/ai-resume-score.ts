// AI resume scorer — Haiku, single-shot, structured JSON output.

import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/ai'

const KEY = process.env.ANTHROPIC_API_KEY
const HAIKU = process.env.ANTHROPIC_HAIKU_MODEL ?? 'claude-haiku-4-5-20251001'

const aiResumeScore: FastifyPluginAsync = async (fastify) => {
  fastify.post('/resume-score', async (request, reply) => {
    const b = request.body as { resume?: string; jobContext?: string }
    const resume = String(b.resume ?? '').slice(0, 12000)
    const jobContext = String(b.jobContext ?? '').slice(0, 4000)
    if (!resume || resume.length < 200 || !KEY) {
      return reply.code(400).send({ error: 'resume text required (200+ chars)' })
    }
    const prompt = `You are scoring an Ayurveda doctor's resume. Return ONLY JSON in this exact shape (no preamble, no markdown):
{
  "overallScore": 0-100 integer,
  "sections": [{"name":"...","score":0-100,"feedback":"≤2 sentences"}],
  "strengths": ["...", ...] (3 items),
  "improvements": ["...", ...] (3-5 items),
  "missingKeywords": ["..."] (only if jobContext given, else []),
  "atsCompatibility": 0-100 integer
}

Sections must be exactly: Professional Summary, Education, Experience, Skills, Certifications, Formatting.
Be specific and Ayurveda-aware (CCIM/KSMC, DHA, Panchakarma procedures, classical training).

RESUME:
${resume}

${jobContext ? `JOB CONTEXT:\n${jobContext}` : ''}`
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: HAIKU, max_tokens: 1500, messages: [{ role: 'user', content: prompt }] }),
      })
      if (!r.ok) return reply.code(502).send({ error: 'upstream' })
      const j = await r.json() as { content?: Array<{ text?: string }> }
      const text = (j.content?.[0]?.text ?? '{}').replace(/```json\n?|```/g, '').trim()
      try {
        return JSON.parse(text)
      } catch {
        return reply.code(502).send({ error: 'parse' })
      }
    } catch {
      return reply.code(502).send({ error: 'upstream' })
    }
  })
}

export default aiResumeScore
