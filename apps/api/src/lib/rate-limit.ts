// Centralised Redis rate-limiter for hot endpoints (LLM-backed routes, lead
// capture, etc.). Originally an inline helper in ayurbot.ts — promoted here
// after the security audit flagged several LLM endpoints with no protection.
//
// Behaviour:
//   - Identifies the caller by signed-in userId if available, otherwise by
//     the trusted IP (x-forwarded-for first hop, fallback to req.ip).
//   - Uses Redis INCR + EXPIRE (1-RTT pattern); the first request seeds
//     the TTL so the bucket auto-clears.
//   - Falls open on Redis errors (logs a warning) so a Redis hiccup never
//     takes the route offline. This is the deliberate trade-off — service
//     availability > strict limit enforcement during incidents.
//   - Replies 429 with a clear message + Retry-After header when over.

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export type RateLimitConfig = {
  bucket:    string        // e.g. 'ayurbot.chat', 'leads.contact', 'llm.triage'
  windowSec: number        // window length in seconds (e.g. 60 for per-minute, 86400 for per-day)
  max:       number        // max requests per window
  by?:       'ip' | 'user' // identity strategy; default: prefers user, falls back to ip
  message?:  string        // custom 429 message
}

function identityOf(req: FastifyRequest, by: 'ip' | 'user' | undefined): string {
  if (by !== 'ip' && req.session?.user?.id) return `u:${req.session.user.id}`
  const xff = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim()
  return `ip:${xff || req.ip || 'unknown'}`
}

export async function rateLimitOk(
  fastify: FastifyInstance,
  req:     FastifyRequest,
  reply:   FastifyReply,
  cfg:     RateLimitConfig,
): Promise<boolean> {
  const id  = identityOf(req, cfg.by)
  const win = Math.floor(Date.now() / (cfg.windowSec * 1000))
  const key = `rl:${cfg.bucket}:${id}:${win}`
  try {
    const count = await fastify.redis.incr(key)
    if (count === 1) await fastify.redis.expire(key, cfg.windowSec)
    if (count > cfg.max) {
      reply.header('Retry-After', cfg.windowSec)
      reply.code(429).send({
        error: cfg.message ?? `Too many requests. Limit is ${cfg.max} per ${cfg.windowSec}s.`,
        code:  'rate-limited',
      })
      return false
    }
    return true
  } catch (err) {
    // Fail-open: Redis blip should not take the route offline.
    fastify.log.warn({ err, bucket: cfg.bucket }, 'rate-limit: Redis unavailable, falling open')
    return true
  }
}

// Convenience preset for typical LLM call: 20 / hour / user-or-ip.
export const llmHourlyLimit = (bucket: string): RateLimitConfig => ({
  bucket,
  windowSec: 3600,
  max:       20,
  message:   `AI rate limit reached — 20 requests/hour. Please wait or sign in to extend.`,
})
