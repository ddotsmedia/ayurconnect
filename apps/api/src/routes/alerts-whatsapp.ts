import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/alerts/whatsapp'

// Public WhatsApp alert subscription. Anonymous form — keeps the friction low.
// E.164 phone normalisation: strip non-digits, prepend +91 if it looks like
// a 10-digit Indian number with no country code.
function normalisePhone(raw: string): string | null {
  const digits = (raw ?? '').replace(/[^\d+]/g, '')
  if (!digits) return null
  if (digits.startsWith('+')) return digits.length >= 11 && digits.length <= 16 ? digits : null
  // 10-digit Indian mobile → +91 prefix
  if (/^\d{10}$/.test(digits)) return `+91${digits}`
  if (/^91\d{10}$/.test(digits)) return `+${digits}`
  return null
}

const route: FastifyPluginAsync = async (fastify) => {
  // POST /alerts/whatsapp/subscribe
  // Body: { phone, consent, specialization?, district?, source? }
  // P2-H3 (2026-05-18 healthcare audit): require an explicit `consent: true`
  // flag from the client (UI shows a labelled checkbox), and don't silently
  // re-activate previously-unsubscribed phones — that user opted out
  // specifically. They must re-opt-in via a fresh subscription. DPDP Act §6
  // requires informed, specific consent — auto-reactivation would violate it.
  fastify.post('/subscribe', async (request, reply) => {
    const body = request.body as { phone?: string; consent?: boolean; specialization?: string; district?: string; source?: string }
    const phone = normalisePhone(body.phone ?? '')
    if (!phone) return reply.code(400).send({ error: 'invalid phone — please use E.164 (+91…) or 10-digit Indian mobile' })
    if (body.consent !== true) {
      return reply.code(400).send({
        error: 'explicit consent required — please tick the checkbox to receive WhatsApp alerts',
        code:  'consent-required',
      })
    }

    // Block re-activation for previously-unsubscribed numbers — they must
    // re-opt-in via a fresh subscription record (DPDP §6).
    const existing = await fastify.prisma.whatsAppAlertSubscription.findUnique({ where: { phone } })
    if (existing && existing.unsubscribedAt !== null) {
      return reply.code(409).send({
        error: 'this phone previously unsubscribed — to re-enable alerts, contact privacy@ayurconnect.com or use a different phone',
        code:  'previously-unsubscribed',
      })
    }

    const xff = (request.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim()
    const ip  = xff || request.ip || null
    const ua  = (request.headers['user-agent'] as string | undefined)?.slice(0, 200) || null

    const data = {
      phone,
      specialization: typeof body.specialization === 'string' && body.specialization.trim() ? body.specialization.trim().slice(0, 100) : null,
      district:       typeof body.district === 'string' && body.district.trim() ? body.district.trim().slice(0, 100) : null,
      source:         typeof body.source === 'string' && body.source.trim() ? body.source.trim().slice(0, 60) : null,
    }

    const sub = await fastify.prisma.whatsAppAlertSubscription.upsert({
      where:  { phone },
      create: { ...data, isActive: true, consentAt: new Date() },
      update: { ...data, isActive: true },  // unsubscribed branch above; here it's an idempotent re-submit
    })

    // Audit-log the consent capture with IP + UA for the regulator-facing record.
    void fastify.prisma.auditLog.create({
      data: {
        actorId:    sub.id,  // sub id stands in as actor for anonymous opt-in
        action:     'force-update',
        targetType: 'Lead',
        targetId:   sub.id,
        ip,
        reason:     `whatsapp-alert consent (ua=${ua ?? 'unknown'})`,
      },
    }).catch(() => null)

    return { ok: true, subscription: { id: sub.id, phone: sub.phone, specialization: sub.specialization, district: sub.district } }
  })

  // DELETE /alerts/whatsapp/unsubscribe?phone=+91...
  fastify.delete('/unsubscribe', async (request, reply) => {
    const phone = normalisePhone(((request.query as { phone?: string }).phone) ?? '')
    if (!phone) return reply.code(400).send({ error: 'invalid phone' })

    const existing = await fastify.prisma.whatsAppAlertSubscription.findUnique({ where: { phone } })
    if (!existing) return reply.code(404).send({ error: 'no subscription found for that phone' })

    await fastify.prisma.whatsAppAlertSubscription.update({
      where: { phone },
      data:  { isActive: false, unsubscribedAt: new Date() },
    })
    return { ok: true }
  })
}

export default route
