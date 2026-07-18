import type { FastifyPluginAsync } from 'fastify'
import { rateLimitOk } from '../lib/rate-limit.js'

export const autoPrefix = '/articles/ai'

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
const HAIKU_MODEL   = process.env.ANTHROPIC_HAIKU_MODEL ?? 'claude-haiku-4-5-20251001'

const RATE = { bucket: 'articles.ai.optimize', windowSec: 60, max: 6, by: 'user' as const, message: 'Too many optimize requests — try again in a minute.' }

type Result = {
  titles:       string[]
  descriptions: string[]
  keywords:     string[]
  readingTime:  number
  gaps:         string
}

function readingTimeFromContent(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220)) // 220 wpm typical for informational reading
}

// Fallback if Anthropic is unreachable / no key. Returns something useful so
// the editor never leaves the author stranded.
function heuristicResult(title: string, content: string): Result {
  const rt = readingTimeFromContent(content)
  const t = title.trim()
  return {
    titles:       [t, `${t} — A Complete Guide`, `${t}: What You Need to Know`].filter((x, i, arr) => arr.indexOf(x) === i),
    descriptions: [content.replace(/\s+/g, ' ').trim().slice(0, 155), content.replace(/\s+/g, ' ').trim().slice(0, 130)],
    keywords:     ['ayurveda', 'kerala', 'wellness', 'panchakarma', 'natural remedy'],
    readingTime:  rt,
    gaps:         'Consider adding: dosage, contraindications, references.',
  }
}

const route: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireAdmin)

  fastify.post('/optimize', async (request, reply) => {
    if (!(await rateLimitOk(fastify, request, reply, RATE))) return

    const body = (request.body ?? {}) as { title?: string; content?: string; tags?: string }
    const title   = String(body.title   ?? '').trim().slice(0, 300)
    const content = String(body.content ?? '').trim().slice(0, 20_000) // cap tokens sent to LLM
    const tags    = String(body.tags    ?? '').trim().slice(0, 200)
    if (!title || !content) return reply.code(400).send({ error: 'title + content required' })

    if (!ANTHROPIC_KEY) return heuristicResult(title, content)

    const prompt = `You are an SEO editor for a Kerala Ayurveda platform. Analyze this draft article and return JSON only, no prose.

TITLE: ${title}
CATEGORY / TAGS: ${tags || 'general'}
CONTENT: """${content.slice(0, 8000)}"""

Return this exact JSON shape:
{
  "titles":       ["...","...","..."],            // 3 improved titles, ranked most compelling first, max 65 chars each
  "descriptions": ["...","..."],                   // 2 meta descriptions, ≤155 chars each, keyword-rich
  "keywords":     ["...","...", ...],              // 10 SEO keywords/phrases, lowercase, ordered by importance
  "readingTime":  N,                               // integer minutes based on 220 wpm
  "gaps":         "..."                            // one short sentence naming missing sections (e.g. dosage, contraindications, references, patient examples)
}
Only output the JSON object, nothing else.`

    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model:      HAIKU_MODEL,
          max_tokens: 900,
          messages:   [{ role: 'user', content: prompt }],
        }),
      })
      if (!r.ok) {
        fastify.log.warn({ status: r.status }, 'articles.ai.optimize upstream failed — falling back')
        return heuristicResult(title, content)
      }
      const data = await r.json() as { content?: Array<{ text?: string }> }
      const raw = data.content?.[0]?.text ?? ''
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) return heuristicResult(title, content)
      const parsed = JSON.parse(match[0]) as Partial<Result>
      const out: Result = {
        titles:       Array.isArray(parsed.titles)       ? parsed.titles.slice(0, 3).map((s) => String(s).slice(0, 100))   : heuristicResult(title, content).titles,
        descriptions: Array.isArray(parsed.descriptions) ? parsed.descriptions.slice(0, 2).map((s) => String(s).slice(0, 200)) : heuristicResult(title, content).descriptions,
        keywords:     Array.isArray(parsed.keywords)     ? parsed.keywords.slice(0, 10).map((s) => String(s).toLowerCase().slice(0, 60)) : heuristicResult(title, content).keywords,
        readingTime:  Number.isFinite(parsed.readingTime) ? Math.max(1, Math.min(120, Math.round(parsed.readingTime as number))) : readingTimeFromContent(content),
        gaps:         typeof parsed.gaps === 'string' ? parsed.gaps.slice(0, 400) : '',
      }
      return out
    } catch (err) {
      fastify.log.warn({ err }, 'articles.ai.optimize threw — falling back')
      return heuristicResult(title, content)
    }
  })
}

export default route
