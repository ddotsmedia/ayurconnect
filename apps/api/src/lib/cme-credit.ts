// CME credit ledger — one entry per credit-earning event.
//
// Sources:
//   - 'webinar'             when a doctor's WebinarRegistration.attended flips true
//   - 'case-published'      when admin moderates a ClinicalCase → 'published'
//   - 'protocol-published'  when admin moderates a ClinicalProtocol → 'published'
//   - 'manual'              admin-issued credits (e.g. external CCIM event)
//
// Idempotency: certificateId is unique; we generate one per (source, sourceRefId)
// so re-running the action doesn't double-credit.

import type { FastifyInstance } from 'fastify'

export type CmeSource = 'webinar' | 'case-published' | 'protocol-published' | 'manual'

function makeCertId(source: CmeSource, refId: string | null): string {
  const base = source + '-' + (refId ?? 'manual') + '-' + Date.now().toString(36)
  return base.replace(/[^a-z0-9-]/gi, '').slice(0, 40)
}

export async function awardCmeCredit(
  fastify: FastifyInstance,
  input: {
    userId:      string
    source:      CmeSource
    sourceRefId: string | null
    credits:     number
    description: string
  },
): Promise<{ id: string; certificateId: string | null } | null> {
  try {
    // Idempotency check — for non-manual sources, refuse double-credit.
    if (input.source !== 'manual' && input.sourceRefId) {
      const existing = await fastify.prisma.cmeCredit.findFirst({
        where:  { userId: input.userId, source: input.source, sourceRefId: input.sourceRefId },
        select: { id: true, certificateId: true },
      })
      if (existing) return existing
    }
    const certificateId = makeCertId(input.source, input.sourceRefId)
    const row = await fastify.prisma.cmeCredit.create({
      data: { ...input, certificateId },
      select: { id: true, certificateId: true },
    })
    return row
  } catch (err) {
    fastify.log.warn({ err, input }, 'awardCmeCredit failed')
    return null
  }
}

export async function totalCreditsThisYear(fastify: FastifyInstance, userId: string): Promise<number> {
  const yearStart = new Date(new Date().getFullYear(), 0, 1)
  const rows = await fastify.prisma.cmeCredit.findMany({
    where:  { userId, earnedAt: { gte: yearStart } },
    select: { credits: true },
  })
  return rows.reduce((sum, r) => sum + r.credits, 0)
}
