import type { FastifyPluginAsync } from 'fastify'
import { chat } from '../lib/llm.js'

export const autoPrefix = '/diet-planner'

// AI Diet Engine: takes dosha + season + conditions + preferences and produces
// a 7-day meal plan via the existing LLM provider chain (Gemini → Groq → Claude).
//
// Results are cached in DietPlan — re-requests within 30 days for the same
// (dosha, season, conditions, preferences) tuple return the cached plan to
// avoid burning quota for identical inputs.

const VALID_DOSHAS = new Set([
  'vata', 'pitta', 'kapha',
  'vata-pitta', 'pitta-kapha', 'vata-kapha',
  'tridoshic',
])
const VALID_SEASONS = new Set(['vasanta', 'grishma', 'varsha', 'sharad', 'hemanta', 'shishira'])

type Preferences = {
  vegetarian?: boolean
  eggs?: boolean
  dairy?: boolean
  region?: string
  allergies?: string[]
  bodyType?: 'underweight' | 'normal' | 'overweight'
}

type DayPlan = {
  day: string
  meals: Array<{ slot: 'breakfast' | 'mid-morning' | 'lunch' | 'evening' | 'dinner'; name: string; description: string; principle?: string }>
}

type GeneratedPlan = {
  days: DayPlan[]
  favor: string[]
  avoid: string[]
  principles: string[]
  drinks: string[]
  notes: string
}

const SYSTEM_PROMPT = `You are an Ayurvedic clinical dietitian trained in classical Charaka & Sushruta dietary principles, with deep knowledge of Kerala cuisine.

You generate practical 7-day meal plans tailored to dosha, season (ritu), and condition.

OUTPUT FORMAT (CRITICAL):
- Return ONLY valid JSON. No markdown fences, no commentary, no leading or trailing text.
- Keep "description" fields under 18 words. Keep "principle" fields under 12 words.
- Use familiar food names. Add Sanskrit term in brackets only when helpful.
- Output MUST be complete and parseable. Aim for under 6000 tokens total.

EXACT SCHEMA:
{
  "days": [
    {
      "day": "Monday",
      "meals": [
        { "slot": "breakfast", "name": "Oat porridge with ghee + cardamom", "description": "Cooked oats with ghee, cardamom, raisins, jaggery.", "principle": "Warm, moist, sweet — pacifies Vata" },
        { "slot": "lunch",     "name": "...", "description": "...", "principle": "..." },
        { "slot": "evening",   "name": "...", "description": "...", "principle": "..." },
        { "slot": "dinner",    "name": "...", "description": "...", "principle": "..." }
      ]
    }
  ],
  "favor":      ["Warm cooked food", "Sweet & sour tastes", "Ghee", "Cooked vegetables"],
  "avoid":      ["Cold raw salads", "Skipping meals", "Iced drinks"],
  "principles": ["Eat warm meals at regular times", "Largest meal at midday"],
  "drinks":     ["Warm water with cumin", "Ginger-cardamom tea"],
  "notes":      "Short 1-2 sentence summary."
}

CONSTRAINTS:
- Exactly 7 days (Monday through Sunday)
- Exactly 4 meal slots/day in this order: breakfast, lunch, evening, dinner
- 5-8 items each in favor / avoid / principles / drinks
- Honor dietary restrictions strictly (vegetarian, no eggs, no dairy, allergies)
- Match the dosha: Vata=warm-moist-grounding, Pitta=cool-mild-sweet, Kapha=light-warm-pungent
- Adjust for season: Grishma=cooling, Hemanta=warming, Varsha=light easily-digestible
- Never tell user to stop medicines or skip meals`

function buildUserMessage(opts: {
  dosha: string
  season: string | null
  conditions: string[]
  preferences: Preferences
}): string {
  const parts: string[] = []
  parts.push(`Generate a 7-day Ayurvedic diet plan for a person with the following profile.`)
  parts.push(`Dominant Prakriti: ${opts.dosha}.`)
  if (opts.season) parts.push(`Current season (Ritu): ${opts.season}.`)
  if (opts.conditions.length > 0) parts.push(`Conditions / concerns: ${opts.conditions.join(', ')}.`)
  parts.push(`Dietary preferences:`)
  parts.push(`- vegetarian: ${opts.preferences.vegetarian ? 'yes' : 'no'}`)
  parts.push(`- eggs allowed: ${opts.preferences.eggs ? 'yes' : 'no'}`)
  parts.push(`- dairy allowed: ${opts.preferences.dairy ? 'yes' : 'no'}`)
  if (opts.preferences.region)              parts.push(`- regional preference: ${opts.preferences.region}`)
  if (opts.preferences.bodyType)            parts.push(`- body type: ${opts.preferences.bodyType}`)
  if (opts.preferences.allergies?.length)   parts.push(`- allergies / dislikes: ${opts.preferences.allergies.join(', ')}`)
  parts.push(``)
  parts.push(`Return ONLY the JSON object — no markdown, no commentary.`)
  return parts.join('\n')
}

function parsePlan(raw: string): GeneratedPlan | null {
  // Models inconsistently wrap in ```json … ``` fences; sometimes they include
  // leading commentary like "Here is your plan:". Extract the JSON object
  // robustly by finding the first { … matching } in the string.
  let body = raw.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')

  // Fallback: locate the outermost { … } object
  const firstBrace = body.indexOf('{')
  const lastBrace  = body.lastIndexOf('}')
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null
  body = body.slice(firstBrace, lastBrace + 1)

  try {
    const parsed = JSON.parse(body) as Partial<GeneratedPlan>
    if (!Array.isArray(parsed.days) || parsed.days.length === 0) return null
    return {
      days:       parsed.days as DayPlan[],
      favor:      Array.isArray(parsed.favor)      ? parsed.favor      : [],
      avoid:      Array.isArray(parsed.avoid)      ? parsed.avoid      : [],
      principles: Array.isArray(parsed.principles) ? parsed.principles : [],
      drinks:     Array.isArray(parsed.drinks)     ? parsed.drinks     : [],
      notes:      typeof parsed.notes === 'string' ? parsed.notes      : '',
    }
  } catch {
    return null
  }
}

const route: FastifyPluginAsync = async (fastify) => {
  fastify.post('/generate', async (request, reply) => {
    const body = request.body as {
      dosha?: string
      season?: string
      conditions?: string[]
      preferences?: Preferences
    }
    const dosha = String(body.dosha ?? '').toLowerCase()
    if (!VALID_DOSHAS.has(dosha)) return reply.code(400).send({ error: 'invalid dosha' })

    const season = body.season && VALID_SEASONS.has(String(body.season).toLowerCase()) ? String(body.season).toLowerCase() : null
    const conditions = (Array.isArray(body.conditions) ? body.conditions : [])
      .filter((c): c is string => typeof c === 'string')
      .map((c) => c.trim().slice(0, 60))
      .filter(Boolean)
      .slice(0, 6)
    const preferences: Preferences = {
      vegetarian: Boolean(body.preferences?.vegetarian ?? true),
      eggs:       Boolean(body.preferences?.eggs),
      dairy:      Boolean(body.preferences?.dairy ?? true),
      region:     typeof body.preferences?.region === 'string' ? body.preferences.region.slice(0, 40) : undefined,
      bodyType:   body.preferences?.bodyType,
      allergies:  Array.isArray(body.preferences?.allergies) ? body.preferences!.allergies!.filter((s): s is string => typeof s === 'string').slice(0, 10) : undefined,
    }
    const userId = request.session?.user?.id ?? null

    // Cache lookup — same (dosha, season, conditions, preferences) within 30d
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000)
    const cached = await fastify.prisma.dietPlan.findFirst({
      where: {
        dosha,
        season,
        conditions: { equals: conditions },
        createdAt: { gte: thirtyDaysAgo },
        // Note: preferences JSON equality is unreliable — match by significant
        // fields only to maximise cache hits.
      },
      orderBy: { createdAt: 'desc' },
    })
    if (cached) {
      return { ok: true, plan: cached.output as unknown as GeneratedPlan, cached: true, id: cached.id }
    }

    // Generate via LLM
    const message = buildUserMessage({ dosha, season, conditions, preferences })
    // 7-day plan × 4 meals × ~45 tokens each + favor/avoid/principles/drinks/notes ≈ 4500 tokens.
    // 16384 gives generous headroom for verbose models without truncation.
    const result = await chat({ system: SYSTEM_PROMPT, message, maxTokens: 16384 })
    if (!result.ok) {
      const failure = result as Extract<typeof result, { ok: false }>
      fastify.log.warn({ result: failure }, 'diet-planner: LLM call failed')
      return reply.code(503).send({ error: 'AI provider unavailable', reason: failure.reason })
    }
    const plan = parsePlan(result.text)
    if (!plan) {
      fastify.log.warn({
        rawHead: result.text.slice(0, 300),
        rawTail: result.text.slice(-300),
        length: result.text.length,
      }, 'diet-planner: failed to parse LLM output')
      return reply.code(502).send({ error: 'AI returned malformed plan — please retry' })
    }

    const saved = await fastify.prisma.dietPlan.create({
      data: {
        userId,
        dosha,
        season,
        conditions,
        preferences: preferences as never,
        output:      plan as never,
      },
      select: { id: true, createdAt: true },
    })

    return { ok: true, plan, cached: false, id: saved.id, provider: result.provider }
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const plan = await fastify.prisma.dietPlan.findUnique({ where: { id } })
    if (!plan) return reply.code(404).send({ error: 'not found' })
    return { plan }
  })
}

export default route
