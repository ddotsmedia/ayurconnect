// Shared admin-moderation workflow for Doctor + Hospital records.
//
// Decisions:
// - `moderationStatus` is the queue state ('pending'|'approved'|'declined'|'needs-info'|'flagged').
// - `ccimVerified` is the public-facing boolean — true only when status='approved'.
// - Every state change writes an AuditLog row + appends to moderationNotes + sets lastReviewedAt/By.
// - On approval, the owner User (if any) is auto-promoted: DOCTOR_PENDING→DOCTOR or HOSPITAL_PENDING→HOSPITAL.
// - On decline/needs-info, the owner User gets a Notification (if linked) — never blocking the response.

import type { FastifyInstance, FastifyRequest } from 'fastify'
import { createNotification } from './notify.js'
import { logAudit, clientIp } from './audit.js'

export type ModerationKind = 'doctor' | 'hospital'
export type ModerationAction = 'approve' | 'decline' | 'request-info' | 'flag' | 'note' | 'reset'

type AdminSession = { user: { id: string; name: string | null; email: string } }

type ModerationNote = {
  at:            string
  byAdminId:     string
  byAdminName:   string
  kind:          ModerationAction
  text:          string | null
}

function appendNote(existing: unknown, note: ModerationNote): ModerationNote[] {
  const arr = Array.isArray(existing) ? (existing as ModerationNote[]) : []
  return [...arr, note]
}

// Compute the verifiedBoolean + role promotion target from the new status.
function statusEffects(status: string): { ccimVerified: boolean; promoteTo: 'DOCTOR' | 'HOSPITAL' | null } {
  if (status === 'approved') return { ccimVerified: true,  promoteTo: null /* set per kind below */ }
  return { ccimVerified: false, promoteTo: null }
}

export async function moderate(
  fastify: FastifyInstance,
  kind: ModerationKind,
  recordId: string,
  action: ModerationAction,
  opts: { adminSession: AdminSession; reason?: string | null; note?: string | null; request: FastifyRequest },
): Promise<{ ok: true; record: Record<string, unknown> } | { ok: false; status: number; error: string }> {
  const admin = opts.adminSession.user

  // Lookup is per-kind to keep Prisma's typed signatures intact (union of
  // model delegates collapses to never if we try to share a variable).
  const existing = kind === 'doctor'
    ? await fastify.prisma.doctor.findUnique({ where: { id: recordId } })
    : await fastify.prisma.hospital.findUnique({ where: { id: recordId } })
  if (!existing) return { ok: false, status: 404, error: `${kind} not found` }

  // Action → new state.
  const newStatus =
    action === 'approve'      ? 'approved'    :
    action === 'decline'      ? 'declined'    :
    action === 'request-info' ? 'needs-info'  :
    action === 'flag'         ? 'flagged'     :
    action === 'reset'        ? 'pending'     :
                                 (existing as { moderationStatus: string }).moderationStatus  // 'note' keeps state

  const { ccimVerified } = statusEffects(newStatus)

  const noteEntry: ModerationNote = {
    at:           new Date().toISOString(),
    byAdminId:    admin.id,
    byAdminName:  admin.name ?? admin.email,
    kind:         action,
    text:         opts.note ?? opts.reason ?? null,
  }

  const data: Record<string, unknown> = {
    moderationStatus: newStatus,
    lastReviewedAt:   new Date(),
    lastReviewedById: admin.id,
    moderationNotes:  appendNote((existing as { moderationNotes: unknown }).moderationNotes, noteEntry) as never,
  }
  if (action !== 'note') data.ccimVerified = ccimVerified
  if (action === 'decline' || action === 'request-info' || action === 'flag') {
    data.moderationReason = opts.reason ?? null
  }
  if (action === 'approve') {
    data.moderationReason = null  // clear any prior decline reason
  }

  const updated = await (kind === 'doctor'
    ? fastify.prisma.doctor.update({ where: { id: recordId }, data })
    : fastify.prisma.hospital.update({ where: { id: recordId }, data }))

  // ─── Role promotion: approval flips the owner user's role ──
  // Doctor approved → DOCTOR_PENDING → DOCTOR
  // Hospital approved → HOSPITAL_PENDING → HOSPITAL
  if (action === 'approve') {
    try {
      const where = kind === 'doctor' ? { doctorId: recordId } : { hospitalId: recordId }
      const owner = await fastify.prisma.user.findFirst({ where, select: { id: true, role: true } })
      if (owner) {
        const promoteFrom = kind === 'doctor' ? 'DOCTOR_PENDING' : 'HOSPITAL_PENDING'
        const promoteTo   = kind === 'doctor' ? 'DOCTOR'         : 'HOSPITAL'
        if (owner.role === promoteFrom) {
          await fastify.prisma.user.update({ where: { id: owner.id }, data: { role: promoteTo } })
        }
      }
    } catch (err) {
      fastify.log.warn({ err, kind, recordId }, 'role promotion on approval failed')
    }
  }

  // ─── Notify the owner user (best-effort) ──
  try {
    const where = kind === 'doctor' ? { doctorId: recordId } : { hospitalId: recordId }
    const owner = await fastify.prisma.user.findFirst({ where, select: { id: true } })
    if (owner) {
      const display = (updated as { name: string }).name
      const baseLink = kind === 'doctor' ? `/dashboard/profile` : `/dashboard/profile`
      if (action === 'approve') {
        await createNotification(fastify, {
          userId: owner.id,
          type:   kind === 'doctor' ? 'doctor-verified' : 'hospital-verified',
          title:  kind === 'doctor' ? '🎉 Your CCIM verification is approved' : '🎉 Your hospital verification is approved',
          body:   kind === 'doctor'
            ? 'Your doctor profile is now publicly visible with the CCIM-verified badge.'
            : 'Your hospital profile is now publicly visible with the verified badge.',
          link:   kind === 'doctor' ? `/doctors/${recordId}` : `/hospitals/${recordId}`,
        }).catch(() => null)
      } else if (action === 'decline') {
        await createNotification(fastify, {
          userId: owner.id,
          type:   kind === 'doctor' ? 'doctor-declined' : 'hospital-declined',
          title:  `Your ${kind} verification was declined`,
          body:   opts.reason
            ? `Reason: ${opts.reason}. You can update your profile and re-submit.`
            : `Please update your profile with full credentials and re-submit. Contact info@ayurconnect.com if you need help.`,
          link:   baseLink,
        }).catch(() => null)
      } else if (action === 'request-info') {
        await createNotification(fastify, {
          userId: owner.id,
          type:   kind === 'doctor' ? 'doctor-needs-info' : 'hospital-needs-info',
          title:  `Verification needs more information about your ${display}`,
          body:   opts.reason
            ? `Admin asks: ${opts.reason}. Please update your profile or reply to info@ayurconnect.com.`
            : 'Please add more details to your profile (qualifications, CCIM number, photo).',
          link:   baseLink,
        }).catch(() => null)
      }
    }
  } catch (err) {
    fastify.log.warn({ err }, 'moderation notification failed')
  }

  // ─── Audit log ──
  void logAudit(fastify, {
    actorId:    admin.id,
    action:     action === 'approve' ? 'ccim-verify' : action === 'decline' || action === 'flag' || action === 'reset' || action === 'request-info' ? 'force-update' : 'force-update',
    targetType: kind === 'doctor' ? 'Doctor' : 'Hospital',
    targetId:   recordId,
    before:     { moderationStatus: (existing as { moderationStatus: string }).moderationStatus, ccimVerified: (existing as { ccimVerified: boolean }).ccimVerified },
    after:      { moderationStatus: newStatus, ccimVerified: data.ccimVerified ?? ccimVerified },
    reason:     opts.reason ?? opts.note ?? null,
    ip:         clientIp(opts.request),
  })

  return { ok: true, record: updated as Record<string, unknown> }
}

// Calculate a simple completeness score (0–10) for the queue UI. Helps the
// admin prioritise records that have enough info to actually approve.
export function completenessScoreDoctor(d: Record<string, unknown>): number {
  const fields: Array<string> = [
    'qualification', 'experienceYears', 'photoUrl', 'bio', 'profile',
    'contact', 'address', 'tcmcNumber', 'specialization',
  ]
  let score = 0
  for (const f of fields) {
    const v = d[f]
    if (v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)) score += 1
  }
  if (Array.isArray(d.languages) && (d.languages as unknown[]).length > 0) score += 1
  return score  // out of 10
}
export function completenessScoreHospital(h: Record<string, unknown>): number {
  const fields: Array<string> = [
    'profile', 'contact', 'address', 'establishedYear', 'type',
    'sourceUrl', 'latitude', 'longitude',
  ]
  let score = 0
  for (const f of fields) {
    const v = h[f]
    if (v !== null && v !== undefined && v !== '') score += 1
  }
  if (Array.isArray(h.services) && (h.services as unknown[]).length > 0) score += 1
  // Flag bonuses
  if (h.ayushCertified) score += 1
  return score  // out of 10
}
