import type { FastifyPluginAsync } from 'fastify'
import { chat } from '../lib/llm.js'
import { rateLimitOk } from '../lib/rate-limit.js'
import { requireDrWrite } from '../lib/dr-access.js'

export const autoPrefix = '/dr/copilot'

// Doctor Co-Pilot (Phase 7). Doctor-gated AI assistance with the doctor strictly
// in the loop:
//   1. /intake       — structure raw pre-consult intake into a classical case sheet.
//   2. /prescription — generate a DRAFT prescription scaffold (review required).
//   3. /finalize     — record the draft-vs-final diff to the AuditLog.
//
// No new tables: the case sheet / draft live in the doctor's browser; only the
// audit trail of (draft → final) is persisted, via the existing AuditLog model.

const INTAKE_SYSTEM = `You are a clinical scribe for a verified Ayurvedic doctor (BAMS-level). Convert the patient's raw pre-consult intake into a STRUCTURED classical Ayurvedic case sheet. Return JSON ONLY in this shape:
{
  "chiefComplaint": string,
  "historyOfPresentIllness": string,
  "currentMedications": string[],
  "pastHistory": string,
  "ashtavidhaPariksha": {           // the eightfold examination prompts — fill from intake where stated, else "to assess"
    "nadi": string, "mutra": string, "mala": string, "jihva": string,
    "shabda": string, "sparsha": string, "drik": string, "akriti": string
  },
  "doshaImpression": string,        // tentative, clearly provisional
  "redFlags": string[],             // anything needing urgent in-person review
  "notesForDoctor": string
}
Rules: Do NOT diagnose or prescribe. Mark anything not stated in the intake as "to assess". Be concise and clinical.`

const RX_SYSTEM = `You are a prescription-drafting assistant for a verified Ayurvedic doctor. Generate a DRAFT prescription scaffold for the doctor to review and edit — it is NOT a final prescription. Return JSON ONLY in this shape:
{
  "draftLabel": "DRAFT — review required",
  "items": [
    { "dravya": string, "form": string, "matra": string, "anupana": string, "kala": string, "duration": string, "rationale": string }
  ],
  "pathyaApathya": { "pathya": string[], "apathya": string[] },
  "lifestyle": string[],
  "followUp": string,
  "cautions": string[],             // interactions, contraindications to verify
  "disclaimer": "Draft generated for doctor review. The prescribing doctor is responsible for the final prescription."
}
Rules:
- dravya = medicine/dravya; form = kashaya/gulika/churna/taila/etc; matra = dose; anupana = vehicle; kala = timing.
- Use classical Ayurvedic formulations appropriate to the case sheet provided.
- Every item must be reviewable and editable; never present as final.
- Flag any drug/herb interactions the doctor must verify in "cautions".
- Do NOT invent dosages beyond conventional classical ranges; when unsure, state a conservative range and note "confirm".`

const COPILOT_RATE = {
  bucket:    'dr.copilot',
  windowSec: 600,
  max:       20,
  by:        'ip' as const,
  message:   'Too many co-pilot requests — please slow down.',
}

const route: FastifyPluginAsync = async (fastify) => {
  // Structure raw intake → classical case sheet (cheaper model is fine).
  fastify.post('/intake', async (request, reply) => {
    if (!requireDrWrite(request, reply)) return
    if (!(await rateLimitOk(fastify, request, reply, COPILOT_RATE))) return
    const { intake } = request.body as { intake?: string }
    if (!intake?.trim() || intake.trim().length < 10) {
      return reply.code(400).send({ error: 'intake text (>=10 chars) required' })
    }
    // Privacy: doctors paste real patient intake — log only metadata, never content.
    fastify.log.info({ len: intake.length, by: request.session?.user.id }, 'dr-copilot.intake')

    const res = await chat({ system: INTAKE_SYSTEM, message: intake.slice(0, 4000), maxTokens: 1200 })
    if (res.ok !== true) return reply.code(503).send({ error: 'AI unavailable', reason: res.reason })
    const m = res.text.match(/\{[\s\S]*\}/)
    if (!m) return reply.code(502).send({ error: 'could not parse case sheet' })
    try {
      return { ok: true, caseSheet: JSON.parse(m[0]), provider: res.provider }
    } catch {
      return reply.code(502).send({ error: 'could not parse case sheet' })
    }
  })

  // Generate a DRAFT prescription scaffold from a case sheet / summary.
  fastify.post('/prescription', async (request, reply) => {
    if (!requireDrWrite(request, reply)) return
    if (!(await rateLimitOk(fastify, request, reply, COPILOT_RATE))) return
    const { caseSummary } = request.body as { caseSummary?: string }
    if (!caseSummary?.trim() || caseSummary.trim().length < 10) {
      return reply.code(400).send({ error: 'caseSummary (>=10 chars) required' })
    }
    fastify.log.info({ len: caseSummary.length, by: request.session?.user.id }, 'dr-copilot.prescription')

    const res = await chat({ system: RX_SYSTEM, message: caseSummary.slice(0, 4000), maxTokens: 1600 })
    if (res.ok !== true) return reply.code(503).send({ error: 'AI unavailable', reason: res.reason })
    const m = res.text.match(/\{[\s\S]*\}/)
    if (!m) return reply.code(502).send({ error: 'could not parse draft' })
    try {
      return { ok: true, draft: JSON.parse(m[0]), provider: res.provider }
    } catch {
      return reply.code(502).send({ error: 'could not parse draft' })
    }
  })

  // Record the draft → final diff so there is a full audit trail of what the AI
  // proposed vs what the doctor actually issued.
  fastify.post('/finalize', async (request, reply) => {
    if (!requireDrWrite(request, reply)) return
    const body = request.body as { draft?: unknown; final?: unknown; patientRef?: string }
    if (body.draft == null || body.final == null) {
      return reply.code(400).send({ error: 'draft and final required' })
    }
    const actorId = request.session!.user.id
    const log = await fastify.prisma.auditLog.create({
      data: {
        actorId,
        action: 'copilot-prescription-finalized',
        targetType: 'CopilotPrescription',
        targetId: (body.patientRef ?? 'unspecified').slice(0, 120),
        before: body.draft as never,   // AI draft
        after: body.final as never,    // doctor's final
        reason: 'Doctor reviewed and edited AI draft before issuing.',
        ip: request.ip,
      },
      select: { id: true, createdAt: true },
    })
    fastify.log.info({ auditId: log.id, by: actorId }, 'dr-copilot.finalized')
    return { ok: true, auditId: log.id }
  })
}

export default route
