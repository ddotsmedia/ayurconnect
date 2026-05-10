import type { FastifyPluginAsync } from 'fastify'
import { chat } from '../lib/llm.js'

export const autoPrefix = '/admin/ai/seo'

// AI-powered SEO helpers for the admin panel. Uses the same provider
// abstraction as AyurBot — auto-picks Gemini (free) > Groq > Anthropic.
// Admin-gated: only logged-in admins can trigger generation.

const adminAiSeo: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireAdmin)

  // POST /admin/ai/seo/meta-description
  // Body: { text: string, max?: number, language?: 'en'|'ml' }
  // Returns: { description: string }  — exactly one short, SEO-friendly meta description.
  fastify.post('/meta-description', async (request, reply) => {
    const { text, max = 155, language = 'en' } = request.body as { text?: string; max?: number; language?: 'en' | 'ml' }
    if (!text || typeof text !== 'string' || text.trim().length < 20) {
      return reply.code(400).send({ error: 'text required (min 20 chars)' })
    }

    const system = `You write meta descriptions for SEO. Output exactly ONE description, no quotes, no preamble, no markdown. Constraints:
- Maximum ${max} characters (hard limit).
- ${language === 'ml' ? 'Malayalam, plain readable script.' : 'English (en-IN), professional medical-tourism tone.'}
- Mention specific keywords naturally — Ayurveda, Kerala, treatments, doctors, herbs as relevant.
- No trailing ellipsis. No emojis. Active voice. Action-oriented.`

    const result = await chat({ system, message: `Write a meta description for this content:\n\n${text.trim()}` })
    if (!result.ok) {
      const f = result as Extract<typeof result, { ok: false }>
      return reply.code(503).send({ error: f.reason ?? 'LLM unavailable', code: f.code, provider: f.provider })
    }
    const description = result.text.trim().replace(/^["']|["']$/g, '').slice(0, max)
    return { description, provider: result.provider }
  })

  // POST /admin/ai/seo/faq
  // Body: { text: string, count?: number }
  // Returns: { faqs: Array<{ q, a }> }
  fastify.post('/faq', async (request, reply) => {
    const { text, count = 5 } = request.body as { text?: string; count?: number }
    if (!text || typeof text !== 'string' || text.trim().length < 100) {
      return reply.code(400).send({ error: 'text required (min 100 chars)' })
    }

    const n = Math.max(3, Math.min(count, 10))
    const system = `You generate FAQ pairs for an Ayurveda medical platform's SEO. Output STRICT JSON only — no markdown fences, no prose. Exactly this shape:
{"faqs":[{"q":"...","a":"..."},...]}
Constraints:
- Exactly ${n} FAQ pairs.
- Questions must be search-realistic (what real patients/visitors actually ask).
- Answers: 2-3 sentences each, factual, include classical Ayurveda terms where appropriate.
- Always end answers with a brief disclaimer to consult a qualified Vaidya for personal advice.`

    const result = await chat({ system, message: `Generate ${n} FAQs from this content:\n\n${text.trim()}` })
    if (!result.ok) {
      const f = result as Extract<typeof result, { ok: false }>
      return reply.code(503).send({ error: f.reason ?? 'LLM unavailable', code: f.code, provider: f.provider })
    }

    let faqs: Array<{ q: string; a: string }> = []
    try {
      // Strip any accidental markdown fence
      const cleaned = result.text.trim().replace(/^```json\s*|\s*```$/g, '').replace(/^```\s*|\s*```$/g, '')
      const parsed = JSON.parse(cleaned) as { faqs?: Array<{ q: string; a: string }> }
      faqs = (parsed.faqs ?? []).filter((f) => f && typeof f.q === 'string' && typeof f.a === 'string').slice(0, n)
    } catch (e) {
      return reply.code(502).send({ error: 'LLM returned invalid JSON', raw: result.text.slice(0, 500) })
    }

    return { faqs, provider: result.provider }
  })

  // POST /admin/ai/seo/keywords
  // Body: { text: string }
  // Returns: { keywords: string[] }
  fastify.post('/keywords', async (request, reply) => {
    const { text } = request.body as { text?: string }
    if (!text || typeof text !== 'string' || text.trim().length < 50) {
      return reply.code(400).send({ error: 'text required (min 50 chars)' })
    }

    const system = `Extract 8-12 search keywords / phrases from the content for SEO meta tags. Output ONE comma-separated line, no preamble, no quotes. Mix short and long-tail. Include Ayurveda-specific terms in Sanskrit/English where relevant.`
    const result = await chat({ system, message: text.trim() })
    if (!result.ok) {
      const f = result as Extract<typeof result, { ok: false }>
      return reply.code(503).send({ error: f.reason ?? 'LLM unavailable', code: f.code, provider: f.provider })
    }
    const keywords = result.text.trim().split(',').map((s) => s.trim()).filter(Boolean).slice(0, 12)
    return { keywords, provider: result.provider }
  })
}

export default adminAiSeo
