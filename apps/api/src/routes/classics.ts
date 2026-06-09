import type { FastifyPluginAsync } from 'fastify'
import { chat } from '../lib/llm.js'
import { rateLimitOk } from '../lib/rate-limit.js'
import { SAMHITA_CORPUS, type SamhitaChunk } from '../data/samhita-corpus.js'

export const autoPrefix = '/classics'

// "Ask the Classics" — a grounded RAG-lite over a curated corpus of classical
// Ayurvedic verses. Retrieval is keyword-based (no embedding dependency, so it
// works without an embedding key or vector DB), and the answer is generated
// strictly from the retrieved verses with inline citations. If retrieval is
// weak, we say so rather than hallucinate scripture.

const ASK_RATE = {
  bucket:    'classics.ask',
  windowSec: 600,
  max:       10,
  by:        'ip' as const,
  message:   'Too many questions — please try again in a few minutes.',
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'of', 'to', 'in', 'is', 'are', 'and', 'or', 'for', 'on', 'what',
  'how', 'why', 'when', 'which', 'who', 'does', 'do', 'can', 'i', 'my', 'me', 'about',
  'with', 'that', 'this', 'it', 'as', 'be', 'should', 'tell', 'explain', 'ayurveda',
])

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9\sऀ-ॿഀ-ൿ]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t))
}

// Simple lexical relevance score: topic hits weigh heaviest, then translation
// text, then source/chapter. Returns the top-k chunks above a floor.
function retrieve(question: string, k = 4): Array<{ chunk: SamhitaChunk; score: number }> {
  const tokens = tokenize(question)
  if (tokens.length === 0) return []
  const scored = SAMHITA_CORPUS.map((chunk) => {
    const topicBlob = chunk.topics.join(' ').toLowerCase()
    const textBlob = `${chunk.translation} ${chunk.source} ${chunk.chapter}`.toLowerCase()
    let score = 0
    for (const tok of tokens) {
      if (topicBlob.includes(tok)) score += 3
      if (textBlob.includes(tok)) score += 1
    }
    return { chunk, score }
  })
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
}

const SYSTEM = `You are a scholarly assistant answering questions about classical Ayurveda, grounded STRICTLY in the verses provided below. Rules:
- Answer ONLY using the provided verses. Do not introduce outside claims or invent verse numbers.
- Cite the source and verse inline in square brackets, e.g. [Charaka Samhita, Sutrasthana 1.41].
- If the provided verses do not adequately address the question, say clearly that the classical corpus available does not cover it well, and suggest consulting a verified Ayurveda doctor. Do NOT fabricate.
- Keep the tone respectful of the tradition. This is educational scholarship, not personal medical advice.
- End with: "Based on classical texts; consult a doctor for personal advice."`

const route: FastifyPluginAsync = async (fastify) => {
  // Suggest example questions for the UI.
  fastify.get('/examples', async () => ({
    examples: [
      'What is the Ayurvedic definition of health?',
      'What are the three doshas?',
      'Why is the monsoon (Karkidaka) good for treatment?',
      'What is Rasayana and what does it do?',
      'What are the five Panchakarma therapies?',
      'What does Ayurveda say about daily routine (dinacharya)?',
      'What is Ojas?',
      'What is Kshara Sutra used for?',
    ],
  }))

  fastify.post('/ask', async (request, reply) => {
    if (!(await rateLimitOk(fastify, request, reply, ASK_RATE))) return
    const body = request.body as Record<string, unknown>
    const question = typeof body.question === 'string' ? body.question.trim().slice(0, 500) : ''
    if (question.length < 4) return reply.code(400).send({ error: 'question too short' })

    const hits = retrieve(question)
    const citations = hits.map((h) => ({
      id: h.chunk.id,
      source: h.chunk.source,
      chapter: h.chunk.chapter,
      verse: h.chunk.verse,
      textSa: h.chunk.textSa ?? null,
      iast: h.chunk.iast ?? null,
      translation: h.chunk.translation,
    }))

    if (hits.length === 0) {
      return {
        answer:
          'The classical corpus available here does not contain verses closely matching your question. Please rephrase, or consult a verified Ayurveda doctor for personal guidance. Based on classical texts; consult a doctor for personal advice.',
        weakRetrieval: true,
        citations: [],
        provider: null,
      }
    }

    const context = hits
      .map(
        (h, i) =>
          `[${i + 1}] ${h.chunk.source}, ${h.chunk.chapter} ${h.chunk.verse}\n` +
          (h.chunk.iast ? `Sanskrit (IAST): ${h.chunk.iast}\n` : '') +
          `Translation: ${h.chunk.translation}`,
      )
      .join('\n\n')

    const res = await chat({
      system: `${SYSTEM}\n\nRETRIEVED VERSES:\n${context}`,
      message: question,
      maxTokens: 900,
    })

    if (res.ok !== true) {
      // LLM unavailable — still return the retrieved verses so the user gets value.
      fastify.log.warn({ reason: res.reason }, 'classics.ask: llm unavailable')
      return {
        answer:
          'The answer assistant is temporarily unavailable, but here are the most relevant classical verses for your question. Based on classical texts; consult a doctor for personal advice.',
        weakRetrieval: false,
        citations,
        provider: null,
      }
    }

    const weak = hits[0].score < 4
    return { answer: res.text, weakRetrieval: weak, citations, provider: res.provider }
  })
}

export default route
