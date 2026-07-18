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
  "experience_required": string|null,
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
  "confidence": number
}
"confidence" is your own 0-100 estimate of extraction quality. If a field is not visible in the image, use null (or [] for arrays). Do not invent values.`

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
  "experience_required": string|null,
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
  "confidence": number
}
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
  const rsp = await fastify.anthropic.messages.create({
    model: HAIKU,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userContent as never }],
  })
  const text = rsp.content
    .filter((b: { type: string }) => b.type === 'text')
    .map((b: { type: string; text?: string }) => b.text ?? '')
    .join('\n')
  return { text, usage: rsp.usage }
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
      const { text, usage } = await callHaiku(
        fastify,
        POSTER_SCHEMA_PROMPT,
        [
          { type: 'image', source: { type: 'base64', media_type: file.mimetype, data: b64 } },
          { type: 'text',  text: 'Extract the Ayurveda job details from this image.' },
        ],
        2000,
      )
      const parsed = extractJson(text) as Record<string, unknown>
      return { ok: true, parsed, rawTextLength: text.length, usage }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      request.log.error({ err: message }, 'jobs-ai parse-poster failed')
      return reply.code(500).send({ error: 'failed to parse poster', detail: message })
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
      const { text, usage } = await callHaiku(
        fastify,
        TEXT_SCHEMA_PROMPT,
        [{ type: 'text', text: raw }],
        1500,
      )
      const parsed = extractJson(text) as Record<string, unknown>
      return { ok: true, parsed, usage }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      request.log.error({ err: message }, 'jobs-ai parse-text failed')
      return reply.code(500).send({ error: 'failed to parse text', detail: message })
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
