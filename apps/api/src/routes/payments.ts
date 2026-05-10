import type { FastifyPluginAsync } from 'fastify'
import Razorpay from 'razorpay'
import crypto from 'node:crypto'

export const autoPrefix = '/payments'

const KEY_ID     = process.env.RAZORPAY_KEY_ID
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

let rz: Razorpay | null = null
function getRz(): Razorpay | null {
  if (!KEY_ID || !KEY_SECRET) return null
  if (!rz) rz = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET })
  return rz
}

const route: FastifyPluginAsync = async (fastify) => {
  // Tells the frontend whether Razorpay is configured (so it can hide/show payment UI).
  fastify.get('/config', async () => ({
    enabled: !!(KEY_ID && KEY_SECRET),
    keyId: KEY_ID ?? null,
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
}

export default route
