// LLM provider abstraction for AyurBot.
//
// Auto-picks a provider based on which env keys are set, with this priority:
//   1. AYURBOT_PROVIDER env var (gemini|groq|anthropic) — explicit override
//   2. GOOGLE_API_KEY     → Gemini 2.5 Flash      (free tier, 15 RPM)
//   3. GROQ_API_KEY       → Llama 3.3 70B on Groq (free tier, 30 RPM)
//   4. ANTHROPIC_API_KEY  → Claude Haiku 4.5      (paid)
//
// All three are called via raw fetch to keep deps minimal.

export type Provider = 'gemini' | 'groq' | 'anthropic'
export type ProviderState = { ok: boolean; provider: Provider | null; reason?: string; model?: string }

// Standard placeholder rejection used by all providers.
function looksLikePlaceholder(v: string): string | null {
  if (!v) return 'not set'
  if (/^replace_me/i.test(v)) return 'placeholder REPLACE_ME_…'
  if (/\.{3}/.test(v)) return 'contains "..." (looks like an example)'
  if (/your[-_]?real[-_]?key|your[-_]?key|xxxx|placeholder/i.test(v)) return 'contains placeholder text'
  return null
}

// ─── Provider availability checks ────────────────────────────────────────
function checkAnthropic(k: string): { ok: boolean; reason?: string; model: string } {
  const placeholder = looksLikePlaceholder(k)
  if (placeholder)              return { ok: false, reason: `ANTHROPIC_API_KEY ${placeholder}`,                             model: 'claude-haiku-4-5-20251001' }
  if (!k.startsWith('sk-ant-')) return { ok: false, reason: 'ANTHROPIC_API_KEY does not start with sk-ant-',                  model: 'claude-haiku-4-5-20251001' }
  if (k.length < 50)            return { ok: false, reason: `ANTHROPIC_API_KEY too short (${k.length}; real keys ~108)`,      model: 'claude-haiku-4-5-20251001' }
  return { ok: true, model: 'claude-haiku-4-5-20251001' }
}
function checkGemini(k: string): { ok: boolean; reason?: string; model: string } {
  const placeholder = looksLikePlaceholder(k)
  if (placeholder)            return { ok: false, reason: `GOOGLE_API_KEY ${placeholder}`,                       model: 'gemini-2.5-flash' }
  if (!k.startsWith('AIza'))  return { ok: false, reason: 'GOOGLE_API_KEY does not start with AIza',              model: 'gemini-2.5-flash' }
  if (k.length < 30)          return { ok: false, reason: `GOOGLE_API_KEY too short (${k.length}; real keys ~39)`, model: 'gemini-2.5-flash' }
  return { ok: true, model: 'gemini-2.5-flash' }
}
function checkGroq(k: string): { ok: boolean; reason?: string; model: string } {
  const placeholder = looksLikePlaceholder(k)
  if (placeholder)          return { ok: false, reason: `GROQ_API_KEY ${placeholder}`,                       model: 'llama-3.3-70b-versatile' }
  if (!k.startsWith('gsk_'))return { ok: false, reason: 'GROQ_API_KEY does not start with gsk_',              model: 'llama-3.3-70b-versatile' }
  if (k.length < 40)        return { ok: false, reason: `GROQ_API_KEY too short (${k.length}; real keys ~56)`,model: 'llama-3.3-70b-versatile' }
  return { ok: true, model: 'llama-3.3-70b-versatile' }
}

// ─── Pick which provider to use right now ────────────────────────────────
export function pickProvider(): ProviderState {
  const override = (process.env.AYURBOT_PROVIDER ?? '').toLowerCase() as Provider | ''
  const candidates: Array<{ name: Provider; key: string; check: (k: string) => { ok: boolean; reason?: string; model: string } }> = [
    { name: 'gemini',    key: process.env.GOOGLE_API_KEY    ?? '', check: checkGemini },
    { name: 'groq',      key: process.env.GROQ_API_KEY      ?? '', check: checkGroq },
    { name: 'anthropic', key: process.env.ANTHROPIC_API_KEY ?? '', check: checkAnthropic },
  ]

  if (override) {
    const c = candidates.find((x) => x.name === override)
    if (!c) return { ok: false, provider: null, reason: `AYURBOT_PROVIDER=${override} is not a known provider` }
    const r = c.check(c.key)
    return { ok: r.ok, provider: c.name, reason: r.reason, model: r.model }
  }

  // Auto-pick: first one that passes checks wins.
  for (const c of candidates) {
    const r = c.check(c.key)
    if (r.ok) return { ok: true, provider: c.name, model: r.model }
  }
  // None work — return the most informative reason (first candidate that has any key set, or "no key configured").
  const first = candidates.find((c) => c.key.trim().length > 0)
  if (first) return { ok: false, provider: null, reason: first.check(first.key).reason }
  return { ok: false, provider: null, reason: 'no LLM API key configured (set GOOGLE_API_KEY, GROQ_API_KEY, or ANTHROPIC_API_KEY)' }
}

// ─── chat() — unified call into whichever provider is active ─────────────
export type ChatResult =
  | { ok: true; text: string; provider: Provider }
  | { ok: false; status: number; reason: string; code: 'auth-failed' | 'no-credits' | 'rate-limited' | 'upstream-error' | 'not-configured'; provider: Provider | null }

export async function chat(opts: { system: string; message: string; maxTokens?: number }): Promise<ChatResult> {
  const state = pickProvider()
  if (!state.ok || !state.provider) {
    return { ok: false, status: 503, reason: state.reason ?? 'AyurBot is not configured', code: 'not-configured', provider: null }
  }
  switch (state.provider) {
    case 'gemini':    return callGemini(opts, state.model!)
    case 'groq':      return callGroq(opts, state.model!)
    case 'anthropic': return callAnthropic(opts, state.model!)
  }
}

// ─── Gemini (Google AI Studio free tier) ─────────────────────────────────
async function callGemini({ system, message, maxTokens }: { system: string; message: string; maxTokens?: number }, model: string): Promise<ChatResult> {
  const key = process.env.GOOGLE_API_KEY!
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: message }] }],
        generationConfig: { maxOutputTokens: maxTokens ?? 1024, temperature: 0.7 },
      }),
    })
    const body = await res.json().catch(() => ({} as Record<string, unknown>))
    if (!res.ok) {
      const err = (body as { error?: { message?: string; status?: string } }).error
      const msg = err?.message ?? `HTTP ${res.status}`
      if (res.status === 401 || res.status === 403)              return { ok: false, status: res.status, reason: msg, code: 'auth-failed',    provider: 'gemini' }
      if (res.status === 429)                                    return { ok: false, status: res.status, reason: msg, code: 'rate-limited',   provider: 'gemini' }
      if (/quota|billing|exceeded/i.test(msg))                   return { ok: false, status: res.status, reason: msg, code: 'no-credits',     provider: 'gemini' }
      return { ok: false, status: res.status, reason: msg, code: 'upstream-error', provider: 'gemini' }
    }
    const text = (body as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })
      .candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
    return { ok: true, text, provider: 'gemini' }
  } catch (e) {
    return { ok: false, status: 502, reason: e instanceof Error ? e.message : String(e), code: 'upstream-error', provider: 'gemini' }
  }
}

// ─── Groq (Llama 3.3 70B free tier) ──────────────────────────────────────
async function callGroq({ system, message, maxTokens }: { system: string; message: string; maxTokens?: number }, model: string): Promise<ChatResult> {
  const key = process.env.GROQ_API_KEY!
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens ?? 1024,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: message },
        ],
      }),
    })
    const body = await res.json().catch(() => ({} as Record<string, unknown>))
    if (!res.ok) {
      const msg = (body as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`
      if (res.status === 401)                          return { ok: false, status: res.status, reason: msg, code: 'auth-failed',  provider: 'groq' }
      if (res.status === 429)                          return { ok: false, status: res.status, reason: msg, code: 'rate-limited', provider: 'groq' }
      if (/quota|billing/i.test(msg))                  return { ok: false, status: res.status, reason: msg, code: 'no-credits',   provider: 'groq' }
      return { ok: false, status: res.status, reason: msg, code: 'upstream-error', provider: 'groq' }
    }
    const text = (body as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message?.content ?? ''
    return { ok: true, text, provider: 'groq' }
  } catch (e) {
    return { ok: false, status: 502, reason: e instanceof Error ? e.message : String(e), code: 'upstream-error', provider: 'groq' }
  }
}

// ─── Streaming variant ───────────────────────────────────────────────────
// Yields one chunk per `text` delta from the active provider. Falls back to
// emitting the full response in one chunk if the provider is reached but
// streaming isn't supported (kept robust against odd network failures).

export type StreamChunk =
  | { type: 'text'; delta: string }
  | { type: 'done'; provider: Provider }
  | { type: 'error'; reason: string; code: ChatResult extends { code: infer C } ? C : never; provider: Provider | null }

export async function* chatStream(opts: { system: string; message: string }): AsyncGenerator<StreamChunk> {
  const state = pickProvider()
  if (!state.ok || !state.provider) {
    yield { type: 'error', reason: state.reason ?? 'AyurBot not configured', code: 'not-configured' as never, provider: null }
    return
  }
  try {
    if (state.provider === 'gemini')    { yield* streamGemini(opts, state.model!);   yield { type: 'done', provider: 'gemini'    }; return }
    if (state.provider === 'groq')      { yield* streamGroq(opts, state.model!);     yield { type: 'done', provider: 'groq'      }; return }
    if (state.provider === 'anthropic') { yield* streamAnthropic(opts, state.model!); yield { type: 'done', provider: 'anthropic' }; return }
  } catch (e) {
    yield { type: 'error', reason: e instanceof Error ? e.message : String(e), code: 'upstream-error' as never, provider: state.provider }
  }
}

// Gemini streaming via streamGenerateContent
async function* streamGemini({ system, message }: { system: string; message: string }, model: string): AsyncGenerator<StreamChunk> {
  const key = process.env.GOOGLE_API_KEY!
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(key)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: message }] }],
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
    }),
  })
  if (!res.ok || !res.body) {
    const errBody = await res.text().catch(() => '')
    const m = errBody.match(/"message":\s*"([^"]+)"/)?.[1] ?? `HTTP ${res.status}`
    if (res.status === 401 || res.status === 403)        { yield { type: 'error', reason: m, code: 'auth-failed'    as never, provider: 'gemini' }; return }
    if (res.status === 429)                              { yield { type: 'error', reason: m, code: 'rate-limited'   as never, provider: 'gemini' }; return }
    if (/quota|billing|exceeded/i.test(m))               { yield { type: 'error', reason: m, code: 'no-credits'     as never, provider: 'gemini' }; return }
    yield { type: 'error', reason: m, code: 'upstream-error' as never, provider: 'gemini' }
    return
  }
  yield* readSSE(res.body, (raw) => {
    try {
      const obj = JSON.parse(raw) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
      const parts = obj.candidates?.[0]?.content?.parts ?? []
      return parts.map((p) => p.text ?? '').join('')
    } catch { return '' }
  })
}

// Groq streaming via OpenAI-compatible SSE
async function* streamGroq({ system, message }: { system: string; message: string }, model: string): AsyncGenerator<StreamChunk> {
  const key = process.env.GROQ_API_KEY!
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model, max_tokens: 1024, stream: true,
      messages: [{ role: 'system', content: system }, { role: 'user', content: message }],
    }),
  })
  if (!res.ok || !res.body) {
    yield { type: 'error', reason: `HTTP ${res.status}`, code: 'upstream-error' as never, provider: 'groq' }
    return
  }
  yield* readSSE(res.body, (raw) => {
    if (raw === '[DONE]') return ''
    try {
      const obj = JSON.parse(raw) as { choices?: Array<{ delta?: { content?: string } }> }
      return obj.choices?.[0]?.delta?.content ?? ''
    } catch { return '' }
  })
}

// Anthropic streaming via Messages API
async function* streamAnthropic({ system, message }: { system: string; message: string }, model: string): AsyncGenerator<StreamChunk> {
  const key = process.env.ANTHROPIC_API_KEY!
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model, max_tokens: 1024, system, stream: true, messages: [{ role: 'user', content: message }] }),
  })
  if (!res.ok || !res.body) {
    yield { type: 'error', reason: `HTTP ${res.status}`, code: 'upstream-error' as never, provider: 'anthropic' }
    return
  }
  yield* readSSE(res.body, (raw) => {
    try {
      const obj = JSON.parse(raw) as { type?: string; delta?: { type?: string; text?: string } }
      if (obj.type === 'content_block_delta' && obj.delta?.type === 'text_delta') return obj.delta.text ?? ''
      return ''
    } catch { return '' }
  })
}

// Generic SSE reader. Calls `extractText` on each `data:` payload to pull the text delta.
async function* readSSE(body: ReadableStream<Uint8Array>, extractText: (raw: string) => string): AsyncGenerator<StreamChunk> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const raw = trimmed.slice(5).trim()
      if (!raw) continue
      const delta = extractText(raw)
      if (delta) yield { type: 'text', delta }
    }
  }
}

// ─── Anthropic Claude (paid) ─────────────────────────────────────────────
async function callAnthropic({ system, message, maxTokens }: { system: string; message: string; maxTokens?: number }, model: string): Promise<ChatResult> {
  const key = process.env.ANTHROPIC_API_KEY!
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens ?? 1024,
        system,
        messages: [{ role: 'user', content: message }],
      }),
    })
    const body = await res.json().catch(() => ({} as Record<string, unknown>))
    if (!res.ok) {
      const msg = (body as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`
      if (res.status === 401)                                          return { ok: false, status: res.status, reason: msg, code: 'auth-failed',  provider: 'anthropic' }
      if (res.status === 429)                                          return { ok: false, status: res.status, reason: msg, code: 'rate-limited', provider: 'anthropic' }
      if (res.status === 400 && /credit balance|insufficient.*credit|billing/i.test(msg))
                                                                        return { ok: false, status: res.status, reason: msg, code: 'no-credits',   provider: 'anthropic' }
      return { ok: false, status: res.status, reason: msg, code: 'upstream-error', provider: 'anthropic' }
    }
    const text = (body as { content?: Array<{ type?: string; text?: string }> }).content?.find((c) => c.type === 'text')?.text ?? ''
    return { ok: true, text, provider: 'anthropic' }
  } catch (e) {
    return { ok: false, status: 502, reason: e instanceof Error ? e.message : String(e), code: 'upstream-error', provider: 'anthropic' }
  }
}
