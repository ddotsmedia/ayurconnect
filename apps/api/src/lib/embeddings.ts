// Gemini embedding helper. Default model: gemini-embedding-001 (the
// successor to text-embedding-004). Free tier on Google AI Studio.
//
// Returns a 768-element number array (MRL-truncated), or null on failure.
// We pass outputDimensionality: 768 explicitly to match Herb.embedding vector(768).

const KEY     = process.env.GOOGLE_API_KEY ?? ''
const MODEL   = process.env.GEMINI_EMBEDDING_MODEL ?? 'gemini-embedding-001'
const TASK    = 'SEMANTIC_SIMILARITY'
const DIM     = 768

// Kill-switch: set EMBEDDINGS_DISABLED=true to short-circuit the whole
// pipeline when the Google API key is present but rejected upstream
// (e.g. billing suspended, key revoked). Prevents the boot-time reindexAll +
// on-write embed calls from crash-looping the api with 400s. Downstream
// callers (embedText, embedTexts, admin routes, search-sync) already gate
// on embeddingsEnabled() so one flag disables the whole surface.
export const embeddingsEnabled = (): boolean =>
  process.env.EMBEDDINGS_DISABLED !== 'true'
  && Boolean(KEY)
  && /^AIza/.test(KEY)

export async function embedText(text: string): Promise<number[] | null> {
  if (!embeddingsEnabled()) return null
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:embedContent?key=${encodeURIComponent(KEY)}`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        taskType: TASK,
        outputDimensionality: DIM,
      }),
    })
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn('[embed] HTTP', res.status, (await res.text().catch(() => '')).slice(0, 200))
      return null
    }
    const data = await res.json() as { embedding?: { values?: number[] } }
    const vec = data.embedding?.values
    if (!Array.isArray(vec) || vec.length === 0) return null
    // Gemini returns L2-normalized vectors at the default dim; for MRL-truncated
    // dimensions we should re-normalize so cosine similarity stays meaningful.
    const sumSq = vec.reduce((acc, v) => acc + v * v, 0)
    const norm = Math.sqrt(sumSq)
    return norm > 0 ? vec.map((v) => v / norm) : vec
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[embed] error', e instanceof Error ? e.message : String(e))
    return null
  }
}

// Batch embed with simple concurrency cap (4 in-flight). Returns aligned array.
export async function embedTexts(texts: string[], concurrency = 4): Promise<Array<number[] | null>> {
  const out: Array<number[] | null> = new Array(texts.length).fill(null)
  let i = 0
  async function worker() {
    while (i < texts.length) {
      const idx = i++
      out[idx] = await embedText(texts[idx])
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, texts.length) }, () => worker()))
  return out
}

// Format a Postgres `vector` literal: '[0.1,0.2,...]'
export function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(',')}]`
}
