import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'

export const autoPrefix = '/jobs-portal/ai'

// AI-powered helpers for job workflows:
//  - POST /parse-poster    (multipart image → extracted job JSON via Claude vision)
//  - POST /parse-text      (free text → extracted job JSON)
//  - POST /parse-resume    (text extracted client-side from CV → candidate JSON)
//  - POST /generate-description  (title+context → 300-500 word description)
//  - POST /interview-questions   (specialty+level → 10 Q&A pairs)
//  - POST /salary-estimate       (context → INR/AED range + comparison notes)
//
// Model: claude-haiku-4-5-20251001 for text; same model with `image` block for
// posters (Haiku 4.5 supports vision).

const HAIKU = 'claude-haiku-4-5-20251001'

const POSTER_SCHEMA_PROMPT = `You are extracting Ayurveda job details from an image (poster, screenshot, or WhatsApp share).
Return ONLY a JSON object (no prose, no code fence) with this exact shape:
{
  "title": string,
  "company": string,
  "location": string,
  "salary_min": number|null,
  "salary_max": number|null,
  "currency": "INR"|"AED"|"USD"|"GBP"|"QAR"|"SAR"|"OMR"|null,
  "job_type": "full-time"|"part-time"|"contract"|"locum"|"walk-in"|null,
  "role_type": "doctor"|"therapist"|"consultant"|null,
  "therapist_type": string|null,
  "certifications": string[],
  "experience_required": string|null,
  "experience_years": number|null,
  "qualifications": string[],
  "specialization": string|null,
  "description": string,
  "contact_phone": string|null,
  "contact_email": string|null,
  "contact_whatsapp": string|null,
  "walk_in_date": string|null,
  "walk_in_time": string|null,
  "walk_in_venue": string|null,
  "required_documents": string|null,
  "is_urgent": boolean,
  "visa_sponsorship": boolean,
  "confidence": number,
  "confidence_by_field": { "title": number, "location": number, "salary": number, "role_type": number, "specialization": number, "contact": number }
}

Rules:
- role_type inference: if the poster asks for BAMS / MD Ayurveda / a "Doctor" title → "doctor". If it asks for a therapist / masseur / operator of Panchakarma procedures → "therapist". Wellness consultant / dietician / yoga instructor → "consultant". Null only if truly ambiguous.
- confidence_by_field: 0-100 per-field score. 0 = not present in source; 50 = ambiguous / inferred; 100 = explicit exact quote.
- therapist_type: populate ONLY when role_type = "therapist". Use one of: "Panchakarma", "Abhyanga", "Shirodhara", "Nasya", "Swedana", "Vazhichil", "Pizhichil", "Njavarakizhi", "Kizhi", "Marma", "General Ayurveda". Null for non-therapist postings.
- certifications: array of certification tokens visible on the poster (e.g. "AYTC", "BNYS", "CPR", "First Aid", "yoga certified", "on-the-job trained"). Empty array if none.
- experience_years: numeric years extracted from "X years experience" style copy. If a range ("2-5 years"), pick the minimum.
- experience_required stays as the human-readable string for back-compat.
- "confidence" is your own 0-100 estimate of extraction quality. If a field is not visible, use null (or [] for arrays). Do not invent values.`

const TEXT_SCHEMA_PROMPT = `Extract Ayurveda job details from the pasted text (may be WhatsApp, email, or social post; may be in English or Malayalam).
Return ONLY a JSON object (no prose, no code fence):
{
  "title": string,
  "company": string,
  "location": string,
  "salary_min": number|null,
  "salary_max": number|null,
  "currency": "INR"|"AED"|"USD"|"GBP"|"QAR"|"SAR"|"OMR"|null,
  "job_type": "full-time"|"part-time"|"contract"|"locum"|"walk-in"|null,
  "role_type": "doctor"|"therapist"|"consultant"|null,
  "therapist_type": string|null,
  "certifications": string[],
  "experience_required": string|null,
  "experience_years": number|null,
  "qualifications": string[],
  "specialization": string|null,
  "description": string,
  "contact_phone": string|null,
  "contact_email": string|null,
  "contact_whatsapp": string|null,
  "walk_in_date": string|null,
  "walk_in_time": string|null,
  "walk_in_venue": string|null,
  "is_urgent": boolean,
  "confidence": number,
  "confidence_by_field": { "title": number, "location": number, "salary": number, "role_type": number, "specialization": number, "contact": number }
}

Rules:
- confidence_by_field: 0-100 per-field score. 0 = not present in source; 50 = ambiguous / inferred; 100 = explicit exact quote.
- role_type: "doctor" for BAMS / MD Ayurveda / Physician postings; "therapist" for Panchakarma / Abhyanga / Shirodhara / Kizhi / massage operator postings; "consultant" for wellness / nutrition / yoga / BNYS roles. Null only if ambiguous.
- therapist_type: only when role_type = "therapist". One of: "Panchakarma", "Abhyanga", "Shirodhara", "Nasya", "Swedana", "Vazhichil", "Pizhichil", "Njavarakizhi", "Kizhi", "Marma", "General Ayurveda". Null otherwise.
- certifications: string array (AYTC, BNYS, CPR, First Aid, yoga certified, on-the-job trained, etc.). [] if none.
- experience_years: numeric from "X years experience"; take the minimum of a range. experience_required keeps the raw human-readable string.
Do not invent fields — null / [] for missing.`

const RESUME_SCHEMA_PROMPT = `Extract a candidate profile from the pasted CV / resume text.
Return ONLY a JSON object (no prose, no code fence):
{
  "name": string,
  "email": string|null,
  "phone": string|null,
  "qualification": string|null,
  "specialization": string|null,
  "experience_years": number|null,
  "current_employer": string|null,
  "current_position": string|null,
  "location": string|null,
  "skills": string[],
  "certifications": string[],
  "education": [{"degree": string, "college": string, "year": string|null}],
  "languages": string[],
  "summary": string,
  "confidence": number
}`

// Small util — extracts first JSON object from a possibly-fenced model reply.
function extractJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '')
  const start = cleaned.indexOf('{')
  const end   = cleaned.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error('no JSON in reply')
  return JSON.parse(cleaned.slice(start, end + 1))
}

async function callHaiku(fastify: import('fastify').FastifyInstance, systemPrompt: string, userContent: unknown, maxTokens = 2000) {
  return callModel(fastify, HAIKU, systemPrompt, userContent, maxTokens)
}

const SONNET = process.env.ANTHROPIC_SONNET_MODEL ?? 'claude-sonnet-5'

async function callModel(fastify: import('fastify').FastifyInstance, model: string, systemPrompt: string, userContent: unknown, maxTokens: number) {
  const rsp = await fastify.anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userContent as never }],
  })
  const text = rsp.content
    .filter((b: { type: string }) => b.type === 'text')
    .map((b: { type: string; text?: string }) => b.text ?? '')
    .join('\n')
  return { text, usage: rsp.usage, model }
}

// Classify an Anthropic error message → friendly code the client can react to.
type ExtractErrorCode = 'no-credits' | 'rate-limited' | 'auth-failed' | 'invalid-json' | 'upstream-error'

function classifyError(err: unknown): { code: ExtractErrorCode; message: string; canRetry: boolean } {
  const raw = err instanceof Error ? err.message : String(err)
  const low = raw.toLowerCase()
  if (low.includes('credit balance is too low') || low.includes('billing') || low.includes('402')) {
    return { code: 'no-credits',    message: "AI service is temporarily out of credits — please enter details manually below.", canRetry: false }
  }
  if (low.includes('rate limit') || low.includes('429')) {
    return { code: 'rate-limited',  message: "Too many AI requests — please wait a moment and try again.",                     canRetry: true  }
  }
  if (low.includes('authentication') || low.includes('401') || low.includes('invalid api key')) {
    return { code: 'auth-failed',   message: "AI service authentication failed — please enter details manually.",              canRetry: false }
  }
  if (low.includes('no json in reply') || low.includes('unexpected token')) {
    return { code: 'invalid-json',  message: "AI returned an unreadable response — please enter details manually.",             canRetry: true  }
  }
  return   { code: 'upstream-error', message: "AI extraction failed — please enter details manually below.",                    canRetry: true  }
}

// Try Haiku first; if it fails with an error class where Sonnet has a chance
// (upstream-error, invalid-json), retry once with Sonnet. Skip retry on
// no-credits / auth-failed (Sonnet uses the same key so it would just fail
// the same way at 3–4x the cost).
async function callHaikuWithSonnetFallback(fastify: import('fastify').FastifyInstance, systemPrompt: string, userContent: unknown, maxTokens = 2000) {
  try {
    return { ...(await callHaiku(fastify, systemPrompt, userContent, maxTokens)), fallbackUsed: false }
  } catch (haikuErr) {
    const { code } = classifyError(haikuErr)
    if (code === 'no-credits' || code === 'auth-failed') throw haikuErr
    fastify.log.warn({ err: haikuErr instanceof Error ? haikuErr.message : haikuErr, retryWith: SONNET }, 'jobs-ai: Haiku failed, retrying with Sonnet')
    try {
      return { ...(await callModel(fastify, SONNET, systemPrompt, userContent, maxTokens)), fallbackUsed: true }
    } catch (sonnetErr) {
      // Rethrow ORIGINAL Haiku error so the friendly-error classifier sees
      // the primary failure reason (Sonnet often fails the same way for the
      // same cause).
      throw haikuErr
    }
  }
}

const route: FastifyPluginAsync = async (fastify) => {
  // ─── POST /parse-poster — multipart image → JSON ────────────────────────
  fastify.post('/parse-poster', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!process.env.ANTHROPIC_API_KEY) return reply.code(503).send({ error: 'AI not configured' })
    const file = await request.file()
    if (!file) return reply.code(400).send({ error: 'image file required (multipart field "file")' })
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
    if (!allowed.has(file.mimetype)) return reply.code(400).send({ error: `unsupported type ${file.mimetype}. Use JPG/PNG/WEBP/GIF.` })
    const buf = await file.toBuffer()
    if (buf.length > 8 * 1024 * 1024) return reply.code(413).send({ error: 'image too large (max 8 MB)' })
    const b64 = buf.toString('base64')
    try {
      const { text, usage, model, fallbackUsed } = await callHaikuWithSonnetFallback(
        fastify,
        POSTER_SCHEMA_PROMPT,
        [
          { type: 'image', source: { type: 'base64', media_type: file.mimetype, data: b64 } },
          { type: 'text',  text: 'Extract the Ayurveda job details from this image.' },
        ],
        2000,
      )
      const parsed = extractJson(text) as Record<string, unknown>
      return { ok: true, parsed, rawTextLength: text.length, usage, model, fallbackUsed }
    } catch (err: unknown) {
      const { code, message, canRetry } = classifyError(err)
      request.log.error({ err: err instanceof Error ? err.message : String(err), code }, 'jobs-ai parse-poster failed')
      // 422 (not 502) — Cloudflare / nginx intercept 5xx responses with
      // their own text/plain error pages, losing our JSON body. 422 is
      // in the client-error range and passes through unchanged.
      return reply.code(422).send({ ok: false, code, message, canRetry })
    }
  })

  // ─── POST /parse-text — free text → JSON ────────────────────────────────
  fastify.post('/parse-text', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!process.env.ANTHROPIC_API_KEY) return reply.code(503).send({ error: 'AI not configured' })
    const body = (request.body ?? {}) as { text?: unknown }
    const raw = typeof body.text === 'string' ? body.text : ''
    if (raw.length < 20) return reply.code(400).send({ error: 'text too short (min 20 chars)' })
    if (raw.length > 8000) return reply.code(413).send({ error: 'text too long (max 8000 chars)' })
    try {
      const { text, usage, model, fallbackUsed } = await callHaikuWithSonnetFallback(
        fastify,
        TEXT_SCHEMA_PROMPT,
        [{ type: 'text', text: raw }],
        1500,
      )
      const parsed = extractJson(text) as Record<string, unknown>
      return { ok: true, parsed, usage, model, fallbackUsed }
    } catch (err: unknown) {
      const { code, message, canRetry } = classifyError(err)
      request.log.error({ err: err instanceof Error ? err.message : String(err), code }, 'jobs-ai parse-text failed')
      // 422 (not 502) — Cloudflare / nginx intercept 5xx responses with
      // their own text/plain error pages, losing our JSON body. 422 is
      // in the client-error range and passes through unchanged.
      return reply.code(422).send({ ok: false, code, message, canRetry })
    }
  })

  // ─── POST /parse-resume — free text CV → candidate JSON ─────────────────
  // Client extracts text from a PDF or DOCX (no server pdf-parse dep needed).
  fastify.post('/parse-resume', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!process.env.ANTHROPIC_API_KEY) return reply.code(503).send({ error: 'AI not configured' })
    const body = (request.body ?? {}) as { text?: unknown }
    const raw = typeof body.text === 'string' ? body.text : ''
    if (raw.length < 50) return reply.code(400).send({ error: 'CV text too short (min 50 chars)' })
    if (raw.length > 20000) return reply.code(413).send({ error: 'CV text too long (max 20000 chars)' })
    try {
      const { text, usage } = await callHaiku(
        fastify,
        RESUME_SCHEMA_PROMPT,
        [{ type: 'text', text: raw }],
        2500,
      )
      const parsed = extractJson(text) as Record<string, unknown>
      return { ok: true, parsed, usage }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      request.log.error({ err: message }, 'jobs-ai parse-resume failed')
      return reply.code(500).send({ error: 'failed to parse resume', detail: message })
    }
  })

  // ─── POST /generate-description ─────────────────────────────────────────
  fastify.post('/generate-description', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!process.env.ANTHROPIC_API_KEY) return reply.code(503).send({ error: 'AI not configured' })
    const body = (request.body ?? {}) as { title?: unknown; specialization?: unknown; location?: unknown; salary?: unknown }
    const title = typeof body.title === 'string' ? body.title.slice(0, 200) : ''
    if (!title) return reply.code(400).send({ error: 'title required' })
    const specialization = typeof body.specialization === 'string' ? body.specialization.slice(0, 100) : ''
    const location       = typeof body.location       === 'string' ? body.location.slice(0, 200)       : ''
    const salary         = typeof body.salary         === 'string' ? body.salary.slice(0, 100)         : ''

    const userText = [
      `Job title: ${title}`,
      specialization && `Specialization: ${specialization}`,
      location && `Location: ${location}`,
      salary && `Salary: ${salary}`,
    ].filter(Boolean).join('\n')

    try {
      const { text, usage } = await callHaiku(
        fastify,
        `Write a professional Ayurveda job description in 300-500 words. Structure it as:
- 1 paragraph role overview
- "Key responsibilities" section with 5-7 bullet points
- "Qualifications required" section with 3-5 bullets (mention BAMS / MD Ayurveda / KSMC as appropriate)
- "Experience needed" section
- "Skills preferred" section with 3-5 bullets
- "Benefits" section with 3-5 bullets

Use realistic Ayurveda-industry language. Do NOT invent hospital names, salary numbers, or benefits that were not provided. Return plain text (no markdown headings), just sections separated by blank lines.`,
        [{ type: 'text', text: userText }],
        1200,
      )
      return { ok: true, description: text.trim(), usage }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      request.log.error({ err: message }, 'jobs-ai generate-description failed')
      return reply.code(500).send({ error: 'failed to generate description', detail: message })
    }
  })

  // ─── POST /interview-questions ──────────────────────────────────────────
  fastify.post('/interview-questions', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!process.env.ANTHROPIC_API_KEY) return reply.code(503).send({ error: 'AI not configured' })
    const body = (request.body ?? {}) as { specialization?: unknown; level?: unknown }
    const specialization = typeof body.specialization === 'string' ? body.specialization.slice(0, 100) : 'Kayachikitsa'
    const level          = typeof body.level          === 'string' ? body.level.slice(0, 40)          : 'fresher'

    try {
      const { text, usage } = await callHaiku(
        fastify,
        `Generate 10 Ayurveda interview questions with model answers for a ${level} candidate in ${specialization}.
Distribute exactly:
- 3 clinical knowledge questions
- 3 practical/case-based questions
- 2 Ayurvedic philosophy / classical text questions
- 2 professional/behavioral questions

Return ONLY a JSON array (no prose, no code fence) of 10 objects:
[{"category": "clinical"|"practical"|"philosophy"|"behavioral", "question": string, "modelAnswer": string}, ...]

Model answers should be 2-4 sentences each. Cite classical texts (Charaka, Sushruta, Ashtanga Hridaya) where relevant.`,
        [{ type: 'text', text: `Specialization: ${specialization}\nLevel: ${level}` }],
        3500,
      )
      const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '')
      const start = cleaned.indexOf('[')
      const end   = cleaned.lastIndexOf(']')
      if (start < 0 || end <= start) throw new Error('no JSON array in reply')
      const questions = JSON.parse(cleaned.slice(start, end + 1))
      return { ok: true, questions, usage }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      request.log.error({ err: message }, 'jobs-ai interview-questions failed')
      return reply.code(500).send({ error: 'failed to generate questions', detail: message })
    }
  })

  // ─── POST /salary-estimate ──────────────────────────────────────────────
  fastify.post('/salary-estimate', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!process.env.ANTHROPIC_API_KEY) return reply.code(503).send({ error: 'AI not configured' })
    const body = (request.body ?? {}) as { specialization?: unknown; experienceYears?: unknown; location?: unknown; qualifications?: unknown }
    const specialization = typeof body.specialization === 'string' ? body.specialization.slice(0, 100) : 'Ayurveda Physician'
    const expYears       = Number(body.experienceYears) || 0
    const location       = typeof body.location        === 'string' ? body.location.slice(0, 100)        : 'Kerala'
    const qualifications = typeof body.qualifications  === 'string' ? body.qualifications.slice(0, 100)  : 'BAMS'

    try {
      const { text, usage } = await callHaiku(
        fastify,
        `You are estimating market salary for an Ayurveda doctor role.
Return ONLY a JSON object (no prose, no code fence):
{
  "currency": "INR"|"AED"|"USD"|"GBP",
  "estimated_min": number,
  "estimated_max": number,
  "period": "month"|"year",
  "market_comparison": string,
  "negotiation_tips": string[]
}
Use realistic 2026 market ranges. For India use INR/month, for UAE use AED/month, for UK use GBP/year. 3 tips max. Be honest — don't inflate.`,
        [{ type: 'text', text: `Specialization: ${specialization}\nExperience years: ${expYears}\nLocation: ${location}\nQualifications: ${qualifications}` }],
        1000,
      )
      const parsed = extractJson(text) as Record<string, unknown>
      return { ok: true, estimate: parsed, usage }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      request.log.error({ err: message }, 'jobs-ai salary-estimate failed')
      return reply.code(500).send({ error: 'failed to estimate salary', detail: message })
    }
  })
}

export default route
