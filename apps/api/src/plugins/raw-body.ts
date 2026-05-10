import fp from 'fastify-plugin'

// Replaces Fastify's default JSON content-type parser with one that ALSO
// stashes the raw bytes on `request.rawBody`. Required for HMAC-signed
// webhooks (Razorpay, GitHub, Stripe, etc.) where verification must run
// against the byte-for-byte original payload — JSON.stringify(json) is not
// equivalent because of whitespace/key-order normalisation.
//
// Cost: one extra Buffer reference per JSON request. Trivial.

declare module 'fastify' {
  interface FastifyRequest {
    rawBody?: string
  }
}

export default fp(async (fastify) => {
  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (request, body, done) => {
      const text = typeof body === 'string' ? body : ''
      request.rawBody = text
      if (!text) return done(null, null)
      try { done(null, JSON.parse(text)) }
      catch (err) { done(err as Error, undefined) }
    },
  )
}, { name: 'raw-body' })
