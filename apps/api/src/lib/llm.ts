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

// All providers in priority order, with their config checks.
function allProviders(): Array<{ name: Provider; key: string; check: (k: string) => { ok: boolean; reason?: string; model: string } }> {
  return [
    { name: 'gemini',    key: process.env.GOOGLE_API_KEY    ?? '', check: checkGemini },
    { name: 'groq',      key: process.env.GROQ_API_KEY      ?? '', check: checkGroq },
    { name: 'anthropic', key: process.env.ANTHROPIC_API_KEY ?? '', check: checkAnthropic },
  ]
}

// Returns every usable provider in priority order. chat() / chatStream() cascade
// down this list when one fails with a transient code (rate-limited, upstream-error).
function usableProviders(): Array<{ name: Provider; model: string }> {
  const override = (process.env.AYURBOT_PROVIDER ?? '').toLowerCase() as Provider | ''
  const all = allProviders()
  if (override) {
    const c = all.find((x) => x.name === override)
    if (!c) return []
    const r = c.check(c.key)
    return r.ok ? [{ name: c.name, model: r.model }] : []
  }
  const usable: Array<{ name: Provider; model: string }> = []
  for (const c of all) {
    const r = c.check(c.key)
    if (r.ok) usable.push({ name: c.name, model: r.model })
  }
  return usable
}

// ─── Pick which provider to use right now ────────────────────────────────
// Used by /ayurbot/status for diagnostics — reports the primary (first usable)
// provider. The actual chat() call may cascade to others if this one is
// transiently unavailable.
export function pickProvider(): ProviderState {
  const usable = usableProviders()
  if (usable.length > 0) {
    return { ok: true, provider: usable[0].name, model: usable[0].model }
  }
  const all = allProviders()
  // None work — return the most informative reason (first candidate with any key set).
  const first = all.find((c) => c.key.trim().length > 0)
  if (first) return { ok: false, provider: null, reason: first.check(first.key).reason }
  return { ok: false, provider: null, reason: 'no LLM API key configured (set GOOGLE_API_KEY, GROQ_API_KEY, or ANTHROPIC_API_KEY)' }
}

// Which failure codes are worth retrying on the next provider. auth-failed
// and not-configured indicate config problems that won't resolve by switching.
// no-credits means we burned through the budget; next provider may have its
// own quota so it's worth trying. rate-limited and upstream-error are exactly
// what cascade is for (provider is temporarily flaky).
type ChatErrorCode = Extract<ChatResult, { ok: false }>['code']
function isRetryable(code: ChatErrorCode): boolean {
  return code === 'rate-limited' || code === 'upstream-error' || code === 'no-credits'
}

// ─── chat() — unified call into whichever provider is active ─────────────
export type ChatResult =
  | { ok: true; text: string; provider: Provider }
  | { ok: false; status: number; reason: string; code: 'auth-failed' | 'no-credits' | 'rate-limited' | 'upstream-error' | 'not-configured'; provider: Provider | null }

export async function chat(opts: { system: string; message: string; maxTokens?: number }): Promise<ChatResult> {
  const usable = usableProviders()
  if (usable.length === 0) {
    const state = pickProvider()
    return { ok: false, status: 503, reason: state.reason ?? 'AyurBot is not configured', code: 'not-configured', provider: null }
  }
  // Try each provider in priority order. Cascade on retryable failures (rate
  // limits, upstream overload, quota exhausted) so a Gemini overload doesn't
  // take the whole bot offline when Groq/Anthropic are still up.
  type ChatErr = Extract<ChatResult, { ok: false }>
  let lastErr: ChatErr | null = null
  for (const p of usable) {
    const r: ChatResult =
      p.name === 'gemini'    ? await callGemini(opts, p.model)    :
      p.name === 'groq'      ? await callGroq(opts, p.model)      :
                                await callAnthropic(opts, p.model)
    if (r.ok === true) return r
    const err = r as ChatErr
    lastErr = err
    if (!isRetryable(err.code)) break  // auth-failed / not-configured: stop
  }
  return lastErr ?? { ok: false, status: 503, reason: 'no provider succeeded', code: 'upstream-error', provider: null }
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
  const usable = usableProviders()
  if (usable.length === 0) {
    const state = pickProvider()
    yield { type: 'error', reason: state.reason ?? 'AyurBot not configured', code: 'not-configured' as never, provider: null }
    return
  }
  // Try each provider in order. The inner stream*() functions yield ONLY an
  // 'error' chunk (no 'text') if the upstream rejects the request — we use
  // that as the signal to advance. Once any 'text' chunk lands we commit to
  // that provider for the rest of the stream.
  let lastError: StreamChunk & { type: 'error' } | null = null
  for (const p of usable) {
    const stream =
      p.name === 'gemini'    ? streamGemini(opts, p.model)    :
      p.name === 'groq'      ? streamGroq(opts, p.model)      :
                                streamAnthropic(opts, p.model)
    let committed = false
    try {
      for await (const chunk of stream) {
        if (chunk.type === 'error') {
          // Only retry if we haven't streamed any text yet; mid-stream errors
          // are surfaced as-is so the user sees a partial response + an error.
          if (!committed && isRetryable(chunk.code as never)) {
            lastError = chunk
            break  // try next provider
          }
          yield chunk
          return
        }
        if (chunk.type === 'text') {
          committed = true
          yield chunk
        }
      }
      if (committed) {
        yield { type: 'done', provider: p.name }
        return
      }
      // Stream ended with no text and no error — treat as upstream issue and try next.
      if (!lastError) lastError = { type: 'error', reason: `${p.name} returned empty stream`, code: 'upstream-error' as never, provider: p.name }
    } catch (e) {
      if (committed) {
        yield { type: 'error', reason: e instanceof Error ? e.message : String(e), code: 'upstream-error' as never, provider: p.name }
        return
      }
      lastError = { type: 'error', reason: e instanceof Error ? e.message : String(e), code: 'upstream-error' as never, provider: p.name }
    }
  }
  // Every provider failed before producing text — surface the most recent error.
  if (lastError) yield lastError
  else yield { type: 'error', reason: 'no provider succeeded', code: 'upstream-error' as never, provider: null }
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
