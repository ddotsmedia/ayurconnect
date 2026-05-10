import type { FastifyPluginAsync } from 'fastify'
import Razorpay from 'razorpay'
import crypto from 'node:crypto'

export const autoPrefix = '/payments'

const KEY_ID         = process.env.RAZORPAY_KEY_ID
const KEY_SECRET     = process.env.RAZORPAY_KEY_SECRET
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET

let rz: Razorpay | null = null
function getRz(): Razorpay | null {
  if (!KEY_ID || !KEY_SECRET) return null
  if (!rz) rz = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET })
  return rz
}

const route: FastifyPluginAsync = async (fastify) => {
  // Tells the frontend whether Razorpay is configured (so it can hide/show payment UI).
  fastify.get('/config', async () => ({
    enabled:  !!(KEY_ID && KEY_SECRET),
    currency: 'INR',
    keyId:    KEY_ID ?? null,
  }))

  // Create a Razorpay order tied to an appointment. The frontend then opens
  // Razorpay Checkout with this order_id; on success, frontend POSTs /verify.
  fastify.post('/order', { preHandler: fastify.requireSession }, async (request, reply) => {
    const r = getRz()
    if (!r) return reply.code(503).send({ error: 'razorpay not configured (missing RAZORPAY_KEY_ID/SECRET)' })
    const { appointmentId } = request.body as { appointmentId?: string }
    if (!appointmentId) return reply.code(400).send({ error: 'appointmentId required' })

    const appt = await fastify.prisma.appointment.findUnique({ where: { id: appointmentId } })
    if (!appt)                            return reply.code(404).send({ error: 'appointment not found' })
    if (appt.userId !== request.session!.user.id) return reply.code(403).send({ error: 'forbidden' })
    if (!appt.fee)                        return reply.code(400).send({ error: 'appointment has no fee' })

    const order = await r.orders.create({
      amount: appt.fee * 100, // Razorpay expects paise
      currency: 'INR',
      receipt: `ap_${appt.id.slice(0, 24)}`,
      notes: { appointmentId, userId: appt.userId },
    })

    await fastify.prisma.appointment.update({
      where: { id: appointmentId },
      data: { paymentRef: order.id, paymentProvider: 'razorpay', paymentStatus: 'pending' },
    })

    return { orderId: order.id, amount: order.amount, currency: order.currency, keyId: KEY_ID }
  })

  // Verify Razorpay's signature after a successful checkout.
  fastify.post('/verify', { preHandler: fastify.requireSession }, async (request, reply) => {
    if (!KEY_SECRET) return reply.code(503).send({ error: 'razorpay not configured' })
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = request.body as {
      razorpay_order_id?: string
      razorpay_payment_id?: string
      razorpay_signature?: string
      appointmentId?: string
    }
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !appointmentId) {
      return reply.code(400).send({ error: 'missing fields' })
    }
    const expected = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')
    if (expected !== razorpay_signature) {
      await fastify.prisma.appointment.update({
        where: { id: appointmentId },
        data: { paymentStatus: 'failed' },
      })
      return reply.code(400).send({ error: 'signature mismatch' })
    }
    const appt = await fastify.prisma.appointment.update({
      where: { id: appointmentId },
      data: { paymentStatus: 'paid', paymentRef: razorpay_payment_id, status: 'confirmed' },
    })
    return { ok: true, appointment: appt }
  })

  // ─── Razorpay webhook ──────────────────────────────────────────────
  // Razorpay → POST /payments/webhook with X-Razorpay-Signature header.
  // We verify HMAC-SHA256 of the *raw* request body against the header,
  // then handle payment.captured / payment.failed and ack everything else.
  // Razorpay retries on non-2xx, so we always 200 after acknowledging an
  // event we've recorded. /order initially sets paymentRef = order.id;
  // we look up the appointment by that.
  fastify.post('/webhook', async (request, reply) => {
    if (!WEBHOOK_SECRET) {
      fastify.log.warn('razorpay webhook hit but RAZORPAY_WEBHOOK_SECRET not set')
      return reply.code(503).send({ error: 'webhook not configured' })
    }

    const sig = request.headers['x-razorpay-signature']
    const signature = Array.isArray(sig) ? sig[0] : sig
    if (!signature) return reply.code(400).send({ error: 'missing X-Razorpay-Signature' })

    const raw = request.rawBody ?? ''
    if (!raw) return reply.code(400).send({ error: 'empty body' })

    const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(raw).digest('hex')

    // Constant-time compare to avoid timing side-channels
    let match = false
    try {
      const a = Buffer.from(expected, 'hex')
      const b = Buffer.from(signature, 'hex')
      match = a.length === b.length && crypto.timingSafeEqual(a, b)
    } catch { match = false }
    if (!match) {
      fastify.log.warn({ signature }, 'razorpay webhook signature mismatch')
      return reply.code(400).send({ error: 'invalid signature' })
    }

    let event: { event?: string; payload?: { payment?: { entity?: { order_id?: string; id?: string; status?: string } } } } = {}
    try { event = request.body as typeof event ?? JSON.parse(raw) }
    catch { return reply.code(400).send({ error: 'invalid JSON' }) }

    const paymentEntity = event.payload?.payment?.entity
    const orderId   = paymentEntity?.order_id
    const paymentId = paymentEntity?.id

    try {
      if (event.event === 'payment.captured' && orderId) {
        // We stamped paymentRef = order.id during /order; that's our lookup.
        const appt = await fastify.prisma.appointment.findFirst({ where: { paymentRef: orderId } })
        if (appt) {
          await fastify.prisma.appointment.update({
            where: { id: appt.id },
            data: { paymentStatus: 'paid', status: 'confirmed', paymentRef: paymentId ?? orderId },
          })
          fastify.log.info({ appointmentId: appt.id, paymentId }, 'razorpay webhook: payment captured')
        } else {
          fastify.log.warn({ orderId }, 'razorpay webhook: no matching appointment for order_id')
        }
      } else if (event.event === 'payment.failed' && orderId) {
        const appt = await fastify.prisma.appointment.findFirst({ where: { paymentRef: orderId } })
        if (appt) {
          await fastify.prisma.appointment.update({
            where: { id: appt.id },
            data: { paymentStatus: 'failed', status: 'payment_failed' },
          })
          fastify.log.info({ appointmentId: appt.id }, 'razorpay webhook: payment failed')
        }
      } else {
        // Other events (refund.created, order.paid, subscription.*, etc.)
        // — record receipt, return 200 so Razorpay doesn't retry.
        fastify.log.info({ event: event.event }, 'razorpay webhook: ack-only event')
      }
    } catch (err) {
      // Even if our DB op fails, return 200 to prevent Razorpay's retry storm —
      // we already verified the event is genuine; we'll reconcile via /order/sync.
      fastify.log.error({ err, event: event.event }, 'razorpay webhook handler error (acknowledging anyway)')
    }

    return reply.code(200).send({ ok: true })
  })
}

export default route
