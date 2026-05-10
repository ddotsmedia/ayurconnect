// Gemini text-embedding-004 helper. Free tier: 1500 RPM, 768-dim output.
// We use raw fetch (no SDK install). Falls back to gemini-embedding-001 if
// the model name is overridden via GEMINI_EMBEDDING_MODEL.
//
// Returns a 768-element number array, or null on failure (caller decides
// whether to retry / skip / continue).

const KEY     = process.env.GOOGLE_API_KEY ?? ''
const MODEL   = process.env.GEMINI_EMBEDDING_MODEL ?? 'text-embedding-004'
const TASK    = 'SEMANTIC_SIMILARITY' // hint for tuning

export const embeddingsEnabled = (): boolean => Boolean(KEY) && /^AIza/.test(KEY)

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
      }),
    })
    if (!res.ok) return null
    const data = await res.json() as { embedding?: { values?: number[] } }
    const vec = data.embedding?.values
    if (!Array.isArray(vec) || vec.length === 0) return null
    return vec
  } catch { return null }
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
