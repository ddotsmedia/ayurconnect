// AI-powered job-candidate matching — Haiku batch scoring + on-demand compute.

import type { FastifyPluginAsync, FastifyInstance } from 'fastify'

export const autoPrefix = '/jobs-portal/matches'

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
const HAIKU         = process.env.ANTHROPIC_HAIKU_MODEL ?? 'claude-haiku-4-5-20251001'

type CandidateLite = { id: string; fullName: string; headline: string | null; currentLocation: string | null; totalExperience: number; specializations: string[]; languages: string[]; expectedSalary: number | null; salaryCurrency: string; openToTelemedicine: boolean; openToLocum: boolean; willingToRelocate: boolean }
type JobLite       = { id: string; title: string; description: string; specialty: string | null; location: string | null; salaryMin: number | null; salaryMax: number | null; currency: string | null; expMin: number | null; expMax: number | null; requirements: string[]; tags: string[] }

// Heuristic scorer — used when Haiku is unavailable. Same weights as the prompt.
function heuristicScore(job: JobLite, c: CandidateLite): { score: number; reason: string } {
  let s = 0
  const reasons: string[] = []
  if (job.specialty && c.specializations.some((x) => x.toLowerCase().includes(job.specialty!.toLowerCase()) || job.specialty!.toLowerCase().includes(x.toLowerCase()))) { s += 25; reasons.push('specialty match') }
  if (job.expMin != null) {
    if (c.totalExperience >= job.expMin) { s += 15; reasons.push('experience OK') }
    else { s += Math.max(0, 15 - (job.expMin - c.totalExperience) * 2) }
  } else { s += 8 }
  if (job.location && c.currentLocation && (job.location.toLowerCase().includes(c.currentLocation.toLowerCase()) || c.currentLocation.toLowerCase().includes(job.location.toLowerCase()))) { s += 15; reasons.push('same location') }
  else if (c.willingToRelocate) { s += 8; reasons.push('relocate ok') }
  if (job.salaryMin && c.expectedSalary && c.expectedSalary <= job.salaryMin * 1.2) { s += 15; reasons.push('salary fit') }
  else { s += 7 }
  s += 10 // qualification baseline
  s += 5  // language baseline
  if (Array.isArray(c.languages) && c.languages.length > 0) s += 3
  const skillsLower = c.specializations.concat(c.languages).map((x) => x.toLowerCase())
  const tagMatches = (job.tags ?? []).filter((t) => skillsLower.includes(t.toLowerCase())).length
  s += Math.min(5, tagMatches * 2)
  return { score: Math.min(100, Math.max(0, Math.round(s))), reason: reasons.slice(0, 3).join(', ') || 'baseline' }
}

// Batch-score N candidates against one job. Haiku one-shot per batch.
async function scoreBatch(job: JobLite, candidates: CandidateLite[]): Promise<Array<{ candidateId: string; score: number; reason: string }>> {
  if (!ANTHROPIC_KEY) {
    return candidates.map((c) => ({ candidateId: c.id, ...heuristicScore(job, c) }))
  }
  try {
    const prompt = `You are scoring Ayurveda doctor candidates for a job posting. Return ONLY a JSON array (no preamble) like: [{"id":"...","score":0-100,"reason":"≤10 words"}]\n\nJOB: ${JSON.stringify(job)}\n\nCANDIDATES: ${JSON.stringify(candidates.map((c) => ({ id: c.id, fullName: c.fullName, headline: c.headline, specializations: c.specializations, totalExperience: c.totalExperience, currentLocation: c.currentLocation, expectedSalary: c.expectedSalary, languages: c.languages, willingToRelocate: c.willingToRelocate })))}\n\nWeights: specialization 25, experience 15, location 15, salary 15, qualification 10, license 10, language 5, skills 5.`
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: HAIKU, max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
    })
    if (!r.ok) return candidates.map((c) => ({ candidateId: c.id, ...heuristicScore(job, c) }))
    const j = await r.json() as { content?: Array<{ text?: string }> }
    const text = j.content?.[0]?.text ?? '[]'
    const cleaned = text.replace(/```json\n?|```/g, '').trim()
    const parsed = JSON.parse(cleaned) as Array<{ id: string; score: number; reason: string }>
    return parsed.map((p) => ({ candidateId: p.id, score: Math.max(0, Math.min(100, Math.round(p.score))), reason: String(p.reason ?? '').slice(0, 200) }))
  } catch {
    return candidates.map((c) => ({ candidateId: c.id, ...heuristicScore(job, c) }))
  }
}

export async function computeJobMatches(fastify: FastifyInstance, jobId: string): Promise<number> {
  const job = await fastify.prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, title: true, description: true, specialty: true, location: true, salaryMin: true, salaryMax: true, currency: true, expMin: true, expMax: true, requirements: true, tags: true },
  })
  if (!job) return 0
  const cands = await fastify.prisma.candidateProfile.findMany({
    where: { availability: { in: ['actively_looking', 'open_to_offers'] }, profileVisibility: { in: ['public', 'recruiters_only'] } },
    take: 100,
    select: { id: true, fullName: true, headline: true, currentLocation: true, totalExperience: true, specializations: true, languages: true, expectedSalary: true, salaryCurrency: true, openToTelemedicine: true, openToLocum: true, willingToRelocate: true },
  })
  if (cands.length === 0) return 0
  let written = 0
  for (let i = 0; i < cands.length; i += 15) {
    const batch = cands.slice(i, i + 15)
    const scored = await scoreBatch(job as JobLite, batch as CandidateLite[])
    await Promise.all(scored.map((s) =>
      fastify.prisma.matchScore.upsert({
        where: { jobId_candidateId: { jobId: job.id, candidateId: s.candidateId } },
        update: { score: s.score, explanation: s.reason, computedAt: new Date() },
        create: { jobId: job.id, candidateId: s.candidateId, score: s.score, explanation: s.reason },
      }).then(() => { written++ }).catch(() => {})
    ))
  }
  return written
}

const matches: FastifyPluginAsync = async (fastify) => {
  // Public-ish endpoints to read top matches.
  fastify.get('/job/:jobId', async (request) => {
    const { jobId } = request.params as { jobId: string }
    return fastify.prisma.matchScore.findMany({
      where: { jobId },
      orderBy: { score: 'desc' },
      take: 50,
      include: { candidate: { select: { id: true, fullName: true, headline: true, currentLocation: true, totalExperience: true, specializations: true } } },
    })
  })
  fastify.get('/candidate/:candidateId', async (request) => {
    const { candidateId } = request.params as { candidateId: string }
    return fastify.prisma.matchScore.findMany({
      where: { candidateId },
      orderBy: { score: 'desc' },
      take: 50,
    })
  })
  // Authenticated recompute trigger.
  fastify.register(async (sub) => {
    sub.addHook('preHandler', fastify.requireSession)
    sub.post('/compute/:jobId', async (request) => {
      const { jobId } = request.params as { jobId: string }
      const n = await computeJobMatches(fastify, jobId)
      return { ok: true, scored: n }
    })
  })
}

export default matches
