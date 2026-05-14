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

type AuditInput = {
  actorId:    string
  action:     AuditAction
  targetType: 'User' | 'Doctor' | 'Hospital' | 'Lead' | 'Article' | 'Job' | 'Herb' | 'College' | 'Tourism' | 'HealthTip'
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
