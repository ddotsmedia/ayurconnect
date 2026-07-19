// Thin wrapper around groq-sdk for the jobs-portal AI extraction endpoints.
// Lazy-init so a missing GROQ_API_KEY doesn't crash the server at boot — the
// handler throws a classifiable error at call time instead.
//
// Model choice:
//  - Text:   llama-3.3-70b-versatile (Groq default, JSON-mode capable).
//            (mixtral-8x7b-32768, which appeared in an older spec, is
//            deprecated on Groq — using it would 404 every call.)
//  - Vision: meta-llama/llama-4-scout-17b-16e-instruct (multimodal on Groq).
// Both overrideable via env for zero-code model swaps.

import Groq from 'groq-sdk'

const MODEL_TEXT   = process.env.GROQ_MODEL        ?? 'llama-3.3-70b-versatile'
const MODEL_VISION = process.env.GROQ_VISION_MODEL ?? 'meta-llama/llama-4-scout-17b-16e-instruct'

let cachedClient: Groq | null = null

export class GroqNotConfiguredError extends Error {
  constructor() { super('GROQ_API_KEY not configured'); this.name = 'GroqNotConfiguredError' }
}

function client(): Groq {
  const key = process.env.GROQ_API_KEY ?? ''
  if (!key) throw new GroqNotConfiguredError()
  if (!cachedClient) cachedClient = new Groq({ apiKey: key })
  return cachedClient
}

// Text-in / JSON-out. Uses response_format so Groq emits a single JSON object
// without prose or code fences. Returns { text, model } for parity with the
// previous provider wrappers.
export async function groqJson(prompt: string, maxTokens = 2000): Promise<{ text: string; model: string }> {
  const rsp = await client().chat.completions.create({
    model:           MODEL_TEXT,
    messages:        [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens:      maxTokens,
    temperature:     0.2,
  })
  return { text: rsp.choices[0]?.message.content ?? '', model: MODEL_TEXT }
}

// Same as groqJson but with an inline image. Groq accepts a data-URL in the
// standard OpenAI-shaped image_url content part.
export async function groqVisionJson(prompt: string, imageBase64: string, mimeType: string, maxTokens = 2000): Promise<{ text: string; model: string }> {
  const dataUrl = `data:${mimeType};base64,${imageBase64}`
  const rsp = await client().chat.completions.create({
    model:    MODEL_VISION,
    messages: [{
      role: 'user',
      content: [
        { type: 'text',      text: prompt },
        { type: 'image_url', image_url: { url: dataUrl } },
      ],
    }],
    response_format: { type: 'json_object' },
    max_tokens:      maxTokens,
    temperature:     0.2,
  })
  return { text: rsp.choices[0]?.message.content ?? '', model: MODEL_VISION }
}

// Plain-text (non-JSON) generation — used by JD generator where the output is
// a document, not a JSON object.
export async function groqText(prompt: string, maxTokens = 2000): Promise<{ text: string; model: string }> {
  const rsp = await client().chat.completions.create({
    model:       MODEL_TEXT,
    messages:    [{ role: 'user', content: prompt }],
    max_tokens:  maxTokens,
    temperature: 0.4,
  })
  return { text: rsp.choices[0]?.message.content ?? '', model: MODEL_TEXT }
}
