// Audit log — write one row per destructive admin mutation so we have a
// breadcrumb trail when someone asks "who deleted that doctor?". The helper
// swallows its own errors (try/catch + .catch) because losing an audit row
// must never break the user-facing action.
//
// All admin routes that should be audited:
//   - DELETE /admin/users/:id              (action='delete', targetType='User')
//   - PATCH  /admin/users/:id role change  (action='role-change', targetType='User')
//   - DELETE /doctors/:id                  (action='delete', targetType='Doctor')
//   - DELETE /hospitals/:id                (action='delete', targetType='Hospital')
//   - DELETE /admin/leads/:id              (action='delete', targetType='Lead')
//   - PATCH  /doctors/:id ccim verify      (action='ccim-verify', targetType='Doctor')

import type { FastifyInstance, FastifyRequest } from 'fastify'

export type AuditAction =
  | 'delete'
  | 'role-change'
  | 'ccim-verify'
  | 'ccim-unverify'
  | 'force-update'
  // P0-H5 (2026-05-18 healthcare audit): read-events on PHI tables. The
  // DPDP Act + HIPAA-equivalents expect a record of WHO ACCESSED WHAT WHEN,
  // not just who modified it. We log:
  //   'phi-read'      — admin/non-owning-doctor accessed a clinical row
  //   'phi-export'    — bulk export request (right-to-portability)
  | 'phi-read'
  | 'phi-export'

type AuditTargetType =
  | 'User' | 'Doctor' | 'Hospital' | 'Lead' | 'Article' | 'Job'
  | 'Herb' | 'College' | 'Tourism' | 'HealthTip'
  // PHI target types (P0-H5)
  | 'Appointment' | 'Prescription' | 'JournalEntry' | 'HealthMetric'
  | 'ClinicalCase' | 'DoctorReferral' | 'RpmAlert' | 'TreatmentEpisode' | 'OutcomeLog'

type AuditInput = {
  actorId:    string
  action:     AuditAction
  targetType: AuditTargetType
  targetId:   string
  before?:    Record<string, unknown> | null
  after?:     Record<string, unknown> | null
  reason?:    string | null
  ip?:        string | null
}

export function clientIp(req: FastifyRequest): string {
  return (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() || req.ip || 'unknown'
}

export async function logAudit(fastify: FastifyInstance, input: AuditInput): Promise<void> {
  try {
    await fastify.prisma.auditLog.create({
      data: {
        actorId:    input.actorId,
        action:     input.action,
        targetType: input.targetType,
        targetId:   input.targetId,
        before:     (input.before ?? undefined) as never,
        after:      (input.after ?? undefined) as never,
        reason:     input.reason ?? null,
        ip:         input.ip ?? null,
      },
    })
  } catch (err) {
    // Never break the originating action because audit logging fails.
    fastify.log.warn({ err, input: { ...input, before: undefined, after: undefined } }, 'audit log write failed')
  }
}

// P0-H5 (2026-05-18 healthcare audit): convenience wrapper for PHI reads.
// Pass through every route that surfaces clinical content to a non-owner
// (admin viewing any patient's record, doctor viewing a patient outside
// their assigned care relationship). For self-reads we sample (1-in-N) so
// the table doesn't explode — set sampleEvery=1 for "always log".
export function logPhiRead(
  fastify:    FastifyInstance,
  req:        FastifyRequest,
  args: {
    targetType: AuditTargetType
    targetId:   string
    sampleEvery?: number
    reason?:    string
  },
): void {
  const actorId = req.session?.user?.id
  if (!actorId) return
  if (args.sampleEvery && args.sampleEvery > 1) {
    if (Math.floor(Math.random() * args.sampleEvery) !== 0) return
  }
  // Fire-and-forget — auditing is best-effort.
  void logAudit(fastify, {
    actorId,
    action:     'phi-read',
    targetType: args.targetType,
    targetId:   args.targetId,
    reason:     args.reason ?? null,
    ip:         clientIp(req),
  })
}
