// Doctor Hub — AI Research Assistant.
//
// Different from /ayurbot/chat: doctor-only, structured response format,
// citations required. Uses the existing LLM chain (Gemini → Groq → Anthropic).
//
// Strategy: instead of embedding-based RAG (which would need pgvector setup
// on the ResearchPaper.abstract field), we use keyword-match retrieval:
// extract candidate papers via Postgres full-text search on the query, then
// inject the top 5 abstracts into the system prompt as grounded context.
// The LLM is instructed to only cite from this provided list — refusal if
// it lacks coverage.
//
// Rate-limited per-doctor: 30/day.

import type { FastifyPluginAsync, FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { chat } from '../lib/llm.js'
import { embedText, embeddingsEnabled, toVectorLiteral } from '../lib/embeddings.js'
import { requireDrRead } from '../lib/dr-access.js'

export const autoPrefix = '/dr/ai-research'

const RL_WINDOW_SECONDS = 86400  // 1 day
const RL_MAX = 30

async function rateLimitOk(
  fastify: FastifyInstance,
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<boolean> {
  const userId = req.session?.user.id ?? 'anon'
  const key = `rl:dr-ai-research:${userId}:${Math.floor(Date.now() / (RL_WINDOW_SECONDS * 1000))}`
  try {
    const count = await fastify.redis.incr(key)
    if (count === 1) await fastify.redis.expire(key, RL_WINDOW_SECONDS)
    if (count > RL_MAX) {
      reply.code(429).send({ error: `Daily limit reached (${RL_MAX}/day). Resets at midnight UTC.`, code: 'rate-limited' })
      return false
    }
    return true
  } catch {
    return true  // fall open on Redis error
  }
}

type Candidate = { id: string; title: string; authors: string[]; journal: string; year: number; doi: string | null; abstract: string; url: string | null }

// Extract distinctive keywords from a query — used as a fallback retrieval
// when embeddings are disabled (no GOOGLE_API_KEY) or no papers have vectors
// yet. Strip stop-words + symbols.
function keywordsOf(q: string): string[] {
  const stop = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'for', 'with', 'to', 'is', 'are', 'what', 'how', 'best', 'about', 'any', 'some'])
  return q.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w))
    .slice(0, 8)
}

async function keywordRetrieve(fastify: FastifyInstance, query: string, limit: number): Promise<Candidate[]> {
  const kws = keywordsOf(query)
  if (kws.length === 0) return []
  const items = await fastify.prisma.researchPaper.findMany({
    where: {
      OR: kws.flatMap((kw) => [
        { title:    { contains: kw, mode: 'insensitive' as const } },
        { abstract: { contains: kw, mode: 'insensitive' as const } },
        { conditions: { has: kw } },
      ]),
    },
    select: { id: true, title: true, authors: true, journal: true, year: true, doi: true, abstract: true, url: true },
    orderBy: { year: 'desc' },
    take: limit,
  })
  return items
}

// Semantic retrieval via pgvector cosine similarity. Embed the query, then
// ORDER BY embedding <=> $vector. Returns []  if the embed call fails — caller
// falls back to keyword retrieval.
async function semanticRetrieve(fastify: FastifyInstance, query: string, limit: number): Promise<Candidate[]> {
  if (!embeddingsEnabled()) return []
  const queryVec = await embedText(query)
  if (!queryVec) return []
  const lit = toVectorLiteral(queryVec)
  // `<=>` is pgvector's cosine-distance operator; lower = more similar.
  const rows = await fastify.prisma.$queryRawUnsafe<Candidate[]>(
    `SELECT id, title, authors, journal, year, doi, abstract, url
       FROM "ResearchPaper"
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> $1::vector
      LIMIT $2`,
    lit,
    limit,
  )
  return rows
}

async function retrieveCandidates(fastify: FastifyInstance, query: string, limit = 5): Promise<{ items: Candidate[]; mode: 'semantic' | 'keyword' }> {
  const semantic = await semanticRetrieve(fastify, query, limit)
  if (semantic.length > 0) return { items: semantic, mode: 'semantic' }
  const keyword = await keywordRetrieve(fastify, query, limit)
  return { items: keyword, mode: 'keyword' }
}

const SYSTEM_PROMPT_BASE = `You are a research librarian for Ayurveda doctors. The user is a verified Ayurvedic practitioner asking you to summarise the published research on a specific clinical question.

STRICT RULES:
1. Only cite papers that are listed in the CANDIDATE PAPERS section below. Do NOT invent citations or reference papers not in that list.
2. If the candidate list doesn't cover the question, say so explicitly and recommend the doctor search PubMed directly.
3. Structure your response as:
   - 2-3 sentence summary
   - Key findings (bullet points, each citing a paper by [number])
   - Clinical implications for practice
   - Gaps in the evidence
4. Use the doctor's clinical vocabulary — assume BAMS-level Ayurveda training.
5. Cite as: [Author Year] e.g. [Sharma 2019], with the bracketed number matching the candidate index.
6. Never give patient-specific advice — this is a research summary, not a consultation.`

const drAiResearch: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', async (request, reply) => {
    if (!requireDrRead(request, reply)) return
    if (!(await rateLimitOk(fastify, request, reply))) return
    const { question } = request.body as { question?: string }
    if (!question?.trim() || question.length < 10) {
      return reply.code(400).send({ error: 'question >=10 chars required' })
    }
    if (question.length > 1000) {
      return reply.code(400).send({ error: 'question too long (max 1000 chars)' })
    }

    const { items: candidates, mode: retrievalMode } = await retrieveCandidates(fastify, question, 5)
    fastify.log.info({ mode: retrievalMode, hits: candidates.length, question: question.slice(0, 80) }, 'dr-ai-research retrieval')

    // Build augmented prompt with citation list. If no candidates, the model
    // is instructed to say so (rule 2 above) rather than fabricate.
    const candidateBlock = candidates.length === 0
      ? 'CANDIDATE PAPERS: (none matched in our curated library — recommend the doctor search PubMed directly)'
      : 'CANDIDATE PAPERS:\n' + candidates.map((p, i) => `[${i + 1}] ${p.authors.slice(0, 3).join(', ')}${p.authors.length > 3 ? ' et al.' : ''} (${p.year}). "${p.title}". ${p.journal}.${p.doi ? ` DOI: ${p.doi}.` : ''}\nAbstract: ${p.abstract.slice(0, 800)}`).join('\n\n')

    const system = SYSTEM_PROMPT_BASE + '\n\n' + candidateBlock

    const result = await chat({ system, message: question, maxTokens: 1500 })
    if (result.ok === true) {
      return {
        response: result.text,
        candidates: candidates.map((c, i) => ({
          index: i + 1,
          id: c.id, title: c.title, authors: c.authors, journal: c.journal, year: c.year,
          doi: c.doi, url: c.url,
        })),
        provider: result.provider,
        retrieval: retrievalMode,
      }
    }
    return reply.code(503).send({
      error: 'AI research service temporarily unavailable.',
      reason: result.reason,
      code: result.code,
    })
  })
}

export default drAiResearch
