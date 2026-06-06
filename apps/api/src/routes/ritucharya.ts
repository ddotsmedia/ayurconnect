import type { FastifyPluginAsync } from 'fastify'
import { chat } from '../lib/llm.js'

export const autoPrefix = '/ritucharya'

// Ritucharya (seasonal regimen) generator. Reads the user's existing
// prakriti — does NOT re-quiz. Maps city → climate, date+climate → Ritu,
// then asks the model for a structured per-prakriti × season × climate
// regimen. Returns strict JSON. Bounded in-memory cache to keep model
// quota down.

type Climate =
  | 'kerala-coastal' | 'kerala-highland' | 'south-india' | 'north-india'
  | 'gulf-arid' | 'uk-temperate' | 'us-east' | 'us-west' | 'aus-temperate' | 'singapore-malaysia'

type Ritu =
  | 'shishira' | 'vasanta' | 'grishma' | 'varsha' | 'sharad' | 'hemanta'
  | 'gulf-summer' | 'gulf-winter'
  | 'temperate-summer' | 'temperate-winter' | 'temperate-spring' | 'temperate-autumn'

const CITY_TO_CLIMATE: Record<string, Climate> = {
  thiruvananthapuram: 'kerala-coastal', trivandrum: 'kerala-coastal', kollam: 'kerala-coastal',
  alappuzha: 'kerala-coastal', alleppey: 'kerala-coastal', kochi: 'kerala-coastal', ernakulam: 'kerala-coastal',
  kannur: 'kerala-coastal', kozhikode: 'kerala-coastal', calicut: 'kerala-coastal', thrissur: 'kerala-coastal',
  kottayam: 'kerala-coastal', malappuram: 'kerala-coastal', kasaragod: 'kerala-coastal',
  pathanamthitta: 'kerala-coastal', palakkad: 'kerala-coastal',
  idukki: 'kerala-highland', wayanad: 'kerala-highland', munnar: 'kerala-highland',
  bangalore: 'south-india', bengaluru: 'south-india', chennai: 'south-india',
  hyderabad: 'south-india', pune: 'south-india', mysore: 'south-india', coimbatore: 'south-india',
  mumbai: 'south-india', kolkata: 'south-india',
  delhi: 'north-india', 'new delhi': 'north-india', lucknow: 'north-india', jaipur: 'north-india',
  chandigarh: 'north-india', amritsar: 'north-india',
  dubai: 'gulf-arid', 'abu dhabi': 'gulf-arid', sharjah: 'gulf-arid', ajman: 'gulf-arid',
  fujairah: 'gulf-arid', 'ras al khaimah': 'gulf-arid', 'al ain': 'gulf-arid',
  doha: 'gulf-arid', riyadh: 'gulf-arid', jeddah: 'gulf-arid', dammam: 'gulf-arid',
  'kuwait city': 'gulf-arid', manama: 'gulf-arid', muscat: 'gulf-arid', salalah: 'gulf-arid',
  london: 'uk-temperate', birmingham: 'uk-temperate', manchester: 'uk-temperate',
  glasgow: 'uk-temperate', edinburgh: 'uk-temperate', leicester: 'uk-temperate',
  'new york': 'us-east', nyc: 'us-east', boston: 'us-east', washington: 'us-east',
  toronto: 'us-east', montreal: 'us-east', chicago: 'us-east', atlanta: 'us-east',
  'los angeles': 'us-west', la: 'us-west', 'san francisco': 'us-west', sf: 'us-west',
  seattle: 'us-west', vancouver: 'us-west', 'san diego': 'us-west', 'san jose': 'us-west',
  sydney: 'aus-temperate', melbourne: 'aus-temperate', perth: 'aus-temperate',
  brisbane: 'aus-temperate', adelaide: 'aus-temperate',
  singapore: 'singapore-malaysia', 'kuala lumpur': 'singapore-malaysia',
}

function detectClimate(city?: string | null): Climate | null {
  if (!city) return null
  return CITY_TO_CLIMATE[city.trim().toLowerCase().replace(/[.,;]/g, '')] ?? null
}

function currentRitu(d: Date, climate: Climate): Ritu {
  const m = d.getUTCMonth()
  if (climate === 'gulf-arid')         return m >= 3 && m <= 9 ? 'gulf-summer' : 'gulf-winter'
  if (climate === 'singapore-malaysia') return m >= 4 && m <= 9 ? 'varsha' : 'grishma'
  if (climate === 'uk-temperate' || climate === 'us-east' || climate === 'us-west') {
    if (m >= 2 && m <= 4)  return 'temperate-spring'
    if (m >= 5 && m <= 7)  return 'temperate-summer'
    if (m >= 8 && m <= 10) return 'temperate-autumn'
    return 'temperate-winter'
  }
  if (climate === 'aus-temperate') {
    if (m >= 2 && m <= 4)  return 'temperate-autumn'
    if (m >= 5 && m <= 7)  return 'temperate-winter'
    if (m >= 8 && m <= 10) return 'temperate-spring'
    return 'temperate-summer'
  }
  if (m === 0 || m === 1) return 'shishira'
  if (m === 2 || m === 3) return 'vasanta'
  if (m === 4 || m === 5) return 'grishma'
  if (m === 6 || m === 7) return 'varsha'
  if (m === 8 || m === 9) return 'sharad'
  return 'hemanta'
}

type Regimen = {
  summary: string
  ahara:      { favor: string[]; reduce: string[] }
  vihara:     { favor: string[]; reduce: string[] }
  dinacharya: string[]
  herbs:      { favor: string[]; reduce: string[] }
  redFlags?:  string[]
}

const SYSTEM_PROMPT = `You are an Ayurveda Vaidya generating a seasonal regimen (Ritucharya).
You will be given a patient's prakriti (constitution), the current Ritu (season), and the local climate.
Generate a STRUCTURED, EVIDENCE-INFORMED regimen in valid JSON.

STRICT RULES:
- Output ONLY valid JSON. No prose, no markdown, no code fences.
- Schema: {"summary": string, "ahara": {"favor": string[], "reduce": string[]}, "vihara": {"favor": string[], "reduce": string[]}, "dinacharya": string[], "herbs": {"favor": string[], "reduce": string[]}, "redFlags"?: string[]}
- Every array must have 3-6 items. Each item: ≤ 90 characters, plain language, no medical jargon.
- "summary" ≤ 200 characters — one sentence on the goal of this season for this prakriti in this climate.
- "ahara" = diet (foods to favor / reduce).
- "vihara" = lifestyle (exercise, sleep, environment).
- "dinacharya" = daily routine adjustments specific to this season + climate (e.g., wake earlier in Grishma, oil massage timing in winter).
- "herbs" = Ayurvedic herbs to favor or reduce in this season. Use common names; never prescribe doses.
- "redFlags" = optional symptoms that should trigger a doctor consultation this season.
- DO NOT prescribe medication, doses, or treatment protocols. Frame everything as general daily-living guidance.
- DO NOT diagnose or claim to cure any disease.
- Climate matters: for hot-arid (gulf-arid) climates, emphasise hydration + Pitta-pacification even in "winter".`

const MAX_AGE_MS = 6 * 60 * 60_000 // 6h in-memory cache
type CacheEntry = { regimen: Regimen; at: number }
const cache = new Map<string, CacheEntry>()

function cacheKey(dosha: string, ritu: Ritu, climate: Climate): string {
  return `${dosha}|${ritu}|${climate}`
}

function parseJson(text: string): Regimen | null {
  const stripped = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
  try {
    const obj = JSON.parse(stripped) as Partial<Regimen>
    if (!obj || typeof obj.summary !== 'string') return null
    if (!obj.ahara      || !Array.isArray(obj.ahara.favor)      || !Array.isArray(obj.ahara.reduce))      return null
    if (!obj.vihara     || !Array.isArray(obj.vihara.favor)     || !Array.isArray(obj.vihara.reduce))     return null
    if (!Array.isArray(obj.dinacharya))                                                                  return null
    if (!obj.herbs      || !Array.isArray(obj.herbs.favor)      || !Array.isArray(obj.herbs.reduce))      return null
    // Length-cap defensively to limit damage from a noisy model
    const cap = (arr: string[]) => arr.slice(0, 8).map((s) => String(s).slice(0, 140))
    return {
      summary:    String(obj.summary).slice(0, 300),
      ahara:      { favor: cap(obj.ahara.favor),  reduce: cap(obj.ahara.reduce) },
      vihara:     { favor: cap(obj.vihara.favor), reduce: cap(obj.vihara.reduce) },
      dinacharya: cap(obj.dinacharya),
      herbs:      { favor: cap(obj.herbs.favor),  reduce: cap(obj.herbs.reduce) },
      redFlags:   Array.isArray(obj.redFlags) ? cap(obj.redFlags) : undefined,
    }
  } catch { return null }
}

const route: FastifyPluginAsync = async (fastify) => {
  fastify.post('/generate', async (request, reply) => {
    const body = request.body as { dosha?: string; city?: string; climate?: Climate; ritu?: Ritu }
    const dosha = (body.dosha ?? '').trim().toLowerCase()
    const validDoshas = new Set(['vata', 'pitta', 'kapha', 'vata-pitta', 'pitta-kapha', 'vata-kapha', 'tridoshic'])
    if (!validDoshas.has(dosha)) return reply.code(400).send({ error: 'dosha required (vata|pitta|kapha|vata-pitta|pitta-kapha|vata-kapha|tridoshic)' })

    const climate: Climate | null = body.climate ?? detectClimate(body.city)
    if (!climate) return reply.code(400).send({ error: 'climate or recognized city required' })
    const ritu: Ritu = body.ritu ?? currentRitu(new Date(), climate)

    const key = cacheKey(dosha, ritu, climate)
    const hit = cache.get(key)
    if (hit && Date.now() - hit.at < MAX_AGE_MS) {
      return { regimen: hit.regimen, dosha, ritu, climate, cached: true, generatedAt: new Date(hit.at).toISOString() }
    }

    const message = `Prakriti: ${dosha}\nCurrent Ritu: ${ritu}\nClimate: ${climate}\nDate: ${new Date().toISOString().slice(0, 10)}\n\nReturn the JSON now.`
    const res = await chat({ system: SYSTEM_PROMPT, message, maxTokens: 900 })
    if (res.ok !== true) {
      const reason = res.code === 'not-configured' ? 'AI not configured' : res.code
      return reply.code(503).send({ error: 'regimen generator is unavailable', reason })
    }
    const regimen = parseJson(res.text)
    if (!regimen) {
      fastify.log.warn({ text: res.text.slice(0, 500), provider: res.provider }, 'ritucharya: parse failed')
      return reply.code(502).send({ error: 'regimen response could not be parsed; please try again' })
    }
    cache.set(key, { regimen, at: Date.now() })
    return { regimen, dosha, ritu, climate, cached: false, generatedAt: new Date().toISOString(), provider: res.provider }
  })
}

export default route
