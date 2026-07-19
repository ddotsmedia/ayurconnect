// Thin wrapper around @google/generative-ai for the jobs-portal AI extraction
// endpoints. Lazy-init so a missing GOOGLE_API_KEY doesn't crash the server at
// boot — the handler throws a classifiable error at call time instead.
//
// Model choice: `gemini-2.0-flash` is multimodal (text + vision) in the free
// tier — 15 req/min, ~1M tokens/day — so we use it for BOTH text-only and
// image inputs. Override via env if a different model is needed.

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GenerativeModel } from '@google/generative-ai'

const MODEL_TEXT   = process.env.GEMINI_MODEL        ?? 'gemini-2.0-flash'
const MODEL_VISION = process.env.GEMINI_VISION_MODEL ?? MODEL_TEXT

let cachedClient: GoogleGenerativeAI | null = null
let cachedTextModel:   GenerativeModel | null = null
let cachedVisionModel: GenerativeModel | null = null

// Thrown when GOOGLE_API_KEY is missing/blank. Caller can classify → 503.
export class GeminiNotConfiguredError extends Error {
  constructor() { super('GOOGLE_API_KEY not configured'); this.name = 'GeminiNotConfiguredError' }
}

function client(): GoogleGenerativeAI {
  const key = process.env.GOOGLE_API_KEY ?? ''
  if (!key) throw new GeminiNotConfiguredError()
  if (!cachedClient) cachedClient = new GoogleGenerativeAI(key)
  return cachedClient
}

function textModel(): GenerativeModel {
  if (!cachedTextModel) cachedTextModel = client().getGenerativeModel({ model: MODEL_TEXT })
  return cachedTextModel
}

function visionModel(): GenerativeModel {
  if (!cachedVisionModel) cachedVisionModel = client().getGenerativeModel({ model: MODEL_VISION })
  return cachedVisionModel
}

// Text-in / JSON-out. Uses responseMimeType so Gemini emits valid JSON without
// prose or code fences (much more reliable than "please return JSON only" in
// the prompt). Returns { text, model } for parity with the old Anthropic path.
export async function geminiJson(prompt: string, maxOutputTokens = 2000): Promise<{ text: string; model: string }> {
  const rsp = await textModel().generateContent({
    contents:         [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json', maxOutputTokens, temperature: 0.2 },
  })
  return { text: rsp.response.text(), model: MODEL_TEXT }
}

// Same but with an image attached. mimeType must be one Gemini accepts
// (image/jpeg | image/png | image/webp | image/heic | image/heif).
export async function geminiVisionJson(prompt: string, imageBase64: string, mimeType: string, maxOutputTokens = 2000): Promise<{ text: string; model: string }> {
  const rsp = await visionModel().generateContent({
    contents: [{
      role: 'user',
      parts: [
        { text: prompt },
        { inlineData: { data: imageBase64, mimeType } },
      ],
    }],
    generationConfig: { responseMimeType: 'application/json', maxOutputTokens, temperature: 0.2 },
  })
  return { text: rsp.response.text(), model: MODEL_VISION }
}

// Plain-text (non-JSON) generation — used by JD generator + interview Qs where
// the response is a document/markdown, not a JSON object.
export async function geminiText(prompt: string, maxOutputTokens = 2000): Promise<{ text: string; model: string }> {
  const rsp = await textModel().generateContent({
    contents:         [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens, temperature: 0.4 },
  })
  return { text: rsp.response.text(), model: MODEL_TEXT }
}
