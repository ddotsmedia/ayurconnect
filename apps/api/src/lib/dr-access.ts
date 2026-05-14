// Reusable role gates for the Doctor Knowledge Hub. Pulled out so all 8
// `/api/dr/*` routes use the same definition — keeps role tweaks centralised.
//
// Convention:
//   READ_ROLES = doctors browsing the hub
//   WRITE_ROLES = doctors contributing (cases, comments, protocols, etc.)
//   MODERATE_ROLES = admin moderation

import type { FastifyRequest, FastifyReply } from 'fastify'

// Session attachment is centralized: the auth plugin registers a global
// onRequest hook that soft-attaches req.session whenever a cookie is present.
// Per-route guards below do the actual 401/403.

export const READ_ROLES     = ['DOCTOR', 'DOCTOR_PENDING', 'ADMIN'] as const
export const WRITE_ROLES    = ['DOCTOR', 'ADMIN'] as const
export const MODERATE_ROLES = ['ADMIN'] as const

export function canRead(role: string | undefined | null): boolean {
  return !!role && (READ_ROLES as readonly string[]).includes(role)
}
export function canWrite(role: string | undefined | null): boolean {
  return !!role && (WRITE_ROLES as readonly string[]).includes(role)
}
export function canModerate(role: string | undefined | null): boolean {
  return !!role && (MODERATE_ROLES as readonly string[]).includes(role)
}

export function requireDrRead(req: FastifyRequest, reply: FastifyReply): boolean {
  if (!req.session) { reply.code(401).send({ error: 'sign in required' }); return false }
  if (!canRead(req.session.user.role)) { reply.code(403).send({ error: 'doctor role required' }); return false }
  return true
}
export function requireDrWrite(req: FastifyRequest, reply: FastifyReply): boolean {
  if (!req.session) { reply.code(401).send({ error: 'sign in required' }); return false }
  if (!canWrite(req.session.user.role)) { reply.code(403).send({ error: 'verified doctor role required' }); return false }
  return true
}
