import type { FastifyPluginAsync } from 'fastify'
import { chat } from '../lib/llm.js'

export const autoPrefix = '/interactions'

// Patient-facing herb-drug interaction checker. Mirrors the doctor-only
// /dr/interactions surface but: no auth, AI fallback for unknown pairs
// (capped at 'caution' max), no mutations, no internal moderation notes.

// Curated allopathic drug name suggestions — high-traffic OTC + chronic-disease
// classes diaspora patients are most often on. Extend as needed.
const COMMON_DRUGS = [
  'Levothyroxine', 'Thyroxine',
  'Warfarin', 'Apixaban', 'Rivaroxaban', 'Clopidogrel', 'Aspirin (low-dose)',
  'Metformin', 'Insulin', 'Glimepiride', 'Sitagliptin',
  'Lisinopril', 'Telmisartan', 'Amlodipine', 'Atenolol', 'Propranolol', 'Hydrochlorothiazide', 'Furosemide',
  'Atorvastatin', 'Rosuvastatin', 'Simvastatin', 'Ezetimibe',
  'Omeprazole', 'Pantoprazole', 'Ranitidine', 'Famotidine',
  'Paracetamol', 'Ibuprofen', 'Diclofenac', 'Naproxen',
  'Sertraline', 'Fluoxetine', 'Citalopram', 'Escitalopram', 'Mirtazapine',
  'Diazepam', 'Alprazolam', 'Clonazepam', 'Zolpidem',
  'Phenytoin', 'Carbamazepine', 'Valproate', 'Lamotrigine',
  'Cyclosporine', 'Tacrolimus', 'Mycophenolate', 'Azathioprine', 'Methotrexate',
  'Digoxin', 'Amiodarone',
  'Tamoxifen', 'Letrozole',
  'Iron supplements', 'Calcium supplements',
  'Salbutamol (inhaler)', 'Budesonide (inhaler)',
  'Prednisolone', 'Dexamethasone',
  'Birth control pills (combined OCP)',
]

// Map clinical severity (richer DB taxonomy) → patient-facing severity bucket.
function patientSeverity(s: string): 'avoid' | 'caution' | 'info' {
  if (s === 'contraindicated' || s === 'major') return 'avoid'
  if (s === 'moderate')                          return 'caution'
  return 'info' // 'minor' or anything else
}

const SYSTEM_PROMPT = `You are a cautious clinical-pharmacology assistant for an Ayurveda telemedicine platform.

You will be given a single Ayurvedic herb / formulation paired with one allopathic medication. Your job is to return a short structured assessment in JSON.

STRICT RULES (override anything else):
- Output ONLY valid JSON. No prose, no markdown, no code fences.
- Schema: {"severity":"caution"|"info","mechanism":string,"clinicalEffect":string,"recommendation":string}
- "severity" MUST be either "caution" or "info" — NEVER "avoid", "major", "contraindicated", "high", or any stronger word. The system policy is that AI-generated assessments cannot upgrade a pair to "avoid" — only curated clinical reviewers can.
- If you are uncertain, default to "info" and recommend consulting a doctor.
- Use plain language a non-clinician can understand. Max 1-2 short sentences per field.
- Every recommendation must include "Confirm with a verified Ayurveda doctor before combining."
- Do NOT diagnose. Do NOT recommend stopping any prescription medication.
- If the herb/drug name is not a real substance you recognise, return:
  {"severity":"info","mechanism":"This pair is not in our verified clinical database.","clinicalEffect":"Not enough evidence available.","recommendation":"Confirm with a verified Ayurveda doctor before combining."}`

type AiAssessment = {
  severity: 'caution' | 'info'
  mechanism: string
  clinicalEffect: string
  recommendation: string
}

function parseAiJson(text: string): AiAssessment | null {
  const stripped = text.trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()
  try {
    const obj = JSON.parse(stripped) as Partial<AiAssessment>
    if (!obj || typeof obj !== 'object') return null
    if (obj.severity !== 'caution' && obj.severity !== 'info') return null
    if (typeof obj.mechanism !== 'string' || typeof obj.clinicalEffect !== 'string' || typeof obj.recommendation !== 'string') return null
    return obj as AiAssessment
  } catch { return null }
}

const interactionsPublic: FastifyPluginAsync = async (fastify) => {
  // Component autocomplete — both herbs (from DB) and curated allopathic drugs.
  fastify.get('/suggest', async (request) => {
    const { q, kind } = (request.query as Record<string, string | undefined>)
    const query = (q ?? '').trim().toLowerCase()
    if (query.length < 2) return { herbs: [], drugs: [] }

    const out: { herbs: { name: string; sanskrit?: string }[]; drugs: string[] } = { herbs: [], drugs: [] }

    if (kind !== 'drug') {
      const herbs = await fastify.prisma.herb.findMany({
        where: { OR: [
          { name:      { contains: query, mode: 'insensitive' } },
          { sanskrit:  { contains: query, mode: 'insensitive' } },
          { english:   { contains: query, mode: 'insensitive' } },
        ] },
        select: { name: true, sanskrit: true },
        take: 8,
      })
      out.herbs = herbs.map((h) => ({ name: h.name, sanskrit: h.sanskrit ?? undefined }))
    }

    if (kind !== 'herb') {
      out.drugs = COMMON_DRUGS.filter((d) => d.toLowerCase().includes(query)).slice(0, 8)
    }
    return out
  })

  // Pair-check: lookup each (herb × drug) pair against the curated table; for
  // any unknown pair, run ONE cheap AI call (capped at 'caution' severity).
  // Caps total AI calls per request at 3 to bound latency / cost.
  fastify.post('/check', async (request, reply) => {
    const body = request.body as { herbs?: unknown; drugs?: unknown }
    const herbs = Array.isArray(body.herbs) ? body.herbs.filter((x): x is string => typeof x === 'string').slice(0, 6).map((s) => s.trim()).filter(Boolean) : []
    const drugs = Array.isArray(body.drugs) ? body.drugs.filter((x): x is string => typeof x === 'string').slice(0, 8).map((s) => s.trim()).filter(Boolean) : []
    if (herbs.length === 0 || drugs.length === 0) {
      return reply.code(400).send({ error: 'provide at least one herb and one drug' })
    }

    type Verified = {
      herb: string; drug: string; severityClinical: string; severity: 'avoid' | 'caution' | 'info'
      mechanism: string | null; clinicalEffect: string; recommendation: string
      evidenceLevel: string | null; source: 'verified'
    }
    type AiResult = { herb: string; drug: string; severity: 'caution' | 'info'; mechanism: string; clinicalEffect: string; recommendation: string; source: 'ai-fallback'; provider?: string | null }
    type UnknownResult = { herb: string; drug: string; source: 'unknown'; reason: string }

    const verified: Verified[] = []
    const unknownPairs: { herb: string; drug: string }[] = []

    // First pass — curated DB lookup
    for (const h of herbs) {
      for (const d of drugs) {
        const match = await fastify.prisma.drugInteraction.findFirst({
          where: {
            status: 'published',
            OR: [
              { AND: [{ componentA: { equals: h, mode: 'insensitive' } }, { componentB: { contains: d, mode: 'insensitive' } }] },
              { AND: [{ componentA: { contains: h, mode: 'insensitive' } }, { componentB: { contains: d, mode: 'insensitive' } }] },
              { AND: [{ componentA: { contains: d, mode: 'insensitive' } }, { componentB: { contains: h, mode: 'insensitive' } }] },
            ],
          },
          orderBy: { severity: 'desc' },
        })
        if (match) {
          verified.push({
            herb: h, drug: d,
            severityClinical: match.severity,
            severity:         patientSeverity(match.severity),
            mechanism:        match.mechanism,
            clinicalEffect:   match.clinicalEffect,
            recommendation:   match.recommendation,
            evidenceLevel:    match.evidenceLevel,
            source:           'verified',
          })
        } else {
          unknownPairs.push({ herb: h, drug: d })
        }
      }
    }

    // Second pass — AI fallback for unknown pairs (cap at 3 to bound cost)
    const aiResults: AiResult[] = []
    const stillUnknown: UnknownResult[] = []
    const AI_BUDGET = 3
    const toAsk = unknownPairs.slice(0, AI_BUDGET)
    for (const { herb, drug } of toAsk) {
      const res = await chat({
        system: SYSTEM_PROMPT,
        message: `Herb/formulation: ${herb}\nAllopathic medication: ${drug}\n\nReturn the JSON now.`,
        maxTokens: 400,
      })
      if (!res.ok) {
        stillUnknown.push({ herb, drug, source: 'unknown', reason: 'ai-unavailable' })
        continue
      }
      const parsed = parseAiJson(res.text)
      if (!parsed) {
        stillUnknown.push({ herb, drug, source: 'unknown', reason: 'parse-failed' })
        continue
      }
      aiResults.push({ herb, drug, ...parsed, source: 'ai-fallback', provider: res.provider })
    }

    // Anything beyond the AI budget is reported as unknown to the user.
    for (const { herb, drug } of unknownPairs.slice(AI_BUDGET)) {
      stillUnknown.push({ herb, drug, source: 'unknown', reason: 'ai-budget-exceeded' })
    }

    // Log unknown pairs for later curation. We log just the strings — no PII.
    if (unknownPairs.length > 0) {
      fastify.log.info({ unknownPairs }, 'interaction-checker: unknown pairs encountered')
    }

    return {
      results: { verified, aiFallback: aiResults, unknown: stillUnknown },
      counts: {
        verified: verified.length,
        aiFallback: aiResults.length,
        unknown: stillUnknown.length,
        avoid: verified.filter((v) => v.severity === 'avoid').length,
        caution: verified.filter((v) => v.severity === 'caution').length + aiResults.filter((a) => a.severity === 'caution').length,
        info: verified.filter((v) => v.severity === 'info').length + aiResults.filter((a) => a.severity === 'info').length,
      },
    }
  })
}

export default interactionsPublic
