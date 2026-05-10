import type { FastifyPluginAsync } from 'fastify'
import { chat } from '../lib/llm.js'

export const autoPrefix = '/interview-prep'

const SYSTEM = `You are an expert coach for Kerala government Ayurveda job interviews — Kerala PSC, NHM Kerala, AYUSH Mission Kerala, Govt Ayurveda colleges, and AYUSH-certified hospital recruitment. Output STRICT JSON only — no markdown fences, no prose. Exactly:

{
  "questions": [
    { "id":1,  "category":"clinical",     "question":"...", "modelAnswer":"..." },
    { "id":2,  "category":"clinical",     "question":"...", "modelAnswer":"..." },
    { "id":3,  "category":"clinical",     "question":"...", "modelAnswer":"..." },
    { "id":4,  "category":"clinical",     "question":"...", "modelAnswer":"..." },
    { "id":5,  "category":"clinical",     "question":"...", "modelAnswer":"..." },
    { "id":6,  "category":"policy",       "question":"...", "modelAnswer":"..." },
    { "id":7,  "category":"policy",       "question":"...", "modelAnswer":"..." },
    { "id":8,  "category":"policy",       "question":"...", "modelAnswer":"..." },
    { "id":9,  "category":"behavioral",   "question":"...", "modelAnswer":"..." },
    { "id":10, "category":"behavioral",   "question":"...", "modelAnswer":"..." }
  ],
  "tips": ["3-5 short, specific Kerala PSC interview tips"]
}

Rules:
- Exactly 5 clinical-knowledge questions tailored to the role's specialisation.
- Exactly 3 Kerala-specific policy/regulation questions (KPSC syllabus, AYUSH Mission, Kerala state Ayurveda code, Drug & Cosmetics Act 1940 schedule e/T1).
- Exactly 2 situational/behavioural questions (patient triage, ethical dilemmas).
- Model answers: 80-150 words each, factual, classical Ayurveda terms where appropriate, end with brief practical takeaway.
- Tips: actionable, specific to Kerala govt format (e.g. "Carry attested mark-list copies", "Brush up on Charaka Chikitsa Sthana — last year had 3 questions").
- Output ONLY the JSON object.`

type PrepQ = { id: number; category: 'clinical' | 'policy' | 'behavioral'; question: string; modelAnswer: string }
type PrepResponse = { questions: PrepQ[]; tips: string[]; provider?: string }

const route: FastifyPluginAsync = async (fastify) => {
  // POST /interview-prep
  // Body: { jobTitle: string, organization?: string, jobDescription?: string }
  fastify.post('/', async (request, reply) => {
    const { jobTitle, organization, jobDescription } = request.body as {
      jobTitle?: string; organization?: string; jobDescription?: string
    }
    if (!jobTitle || jobTitle.trim().length < 4) {
      return reply.code(400).send({ error: 'jobTitle required (4+ chars)' })
    }

    const userPrompt = [
      `Role: ${jobTitle.trim()}`,
      organization   ? `Organisation: ${organization.trim()}` : '',
      jobDescription ? `Description: ${jobDescription.trim().slice(0, 2000)}` : '',
      'Generate the interview-prep JSON.',
    ].filter(Boolean).join('\n')

    const result = await chat({ system: SYSTEM, message: userPrompt })
    if (!result.ok) {
      const f = result as Extract<typeof result, { ok: false }>
      return reply.code(503).send({ error: f.reason ?? 'AI unavailable', code: f.code, provider: f.provider })
    }

    let parsed: PrepResponse
    try {
      const cleaned = result.text.trim().replace(/^```json\s*|\s*```$/g, '').replace(/^```\s*|\s*```$/g, '')
      parsed = JSON.parse(cleaned) as PrepResponse
      if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) throw new Error('missing questions')
      if (!Array.isArray(parsed.tips))      parsed.tips = []
    } catch (err) {
      return reply.code(502).send({ error: 'AI returned invalid JSON', raw: result.text.slice(0, 500) })
    }

    return { ...parsed, provider: result.provider }
  })
}

export default route
