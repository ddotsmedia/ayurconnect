// Tiny Redis-backed memoize helper.
//
// Usage in a route:
//   const data = await cached(fastify, `doctors:${qs}`, 300, () => fastify.prisma.doctor.findMany(...))
// Returns the live value on cache miss, sets it with a TTL, and serves it on
// subsequent reads. If Redis is unreachable the helper falls back to running
// the loader directly so the route never errors out.

import type { FastifyInstance } from 'fastify'

const PREFIX = 'ayur:'

export async function cached<T>(
  fastify: FastifyInstance,
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const fullKey = PREFIX + key
  try {
    const hit = await fastify.redis.get(fullKey)
    if (hit) return JSON.parse(hit) as T
  } catch (err) {
    fastify.log.warn({ err, key }, 'redis read failed')
  }

  const value = await loader()
  // Best-effort write — don't await so the response isn't blocked
  fastify.redis
    .set(fullKey, JSON.stringify(value), 'EX', Math.max(1, ttlSeconds))
    .catch((err) => fastify.log.warn({ err, key }, 'redis write failed'))
  return value
}

// Invalidate a key or pattern. Pattern uses Redis SCAN to avoid blocking.
export async function bust(fastify: FastifyInstance, pattern: string): Promise<number> {
  let count = 0
  const stream = fastify.redis.scanStream({ match: PREFIX + pattern, count: 100 })
  return new Promise<number>((resolve) => {
    stream.on('data', (keys: string[]) => {
      if (keys.length) {
        fastify.redis.del(...keys).catch(() => {})
        count += keys.length
      }
    })
    stream.on('end',   () => resolve(count))
    stream.on('error', () => resolve(count))
  })
}
