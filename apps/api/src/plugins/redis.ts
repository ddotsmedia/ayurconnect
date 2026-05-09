import fp from 'fastify-plugin'
import { Redis } from 'ioredis'

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis
  }
}

export default fp(async (fastify) => {
  const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    lazyConnect: false,
    maxRetriesPerRequest: 3,
  })

  redis.on('error', (err) => fastify.log.error({ err }, 'redis error'))

  fastify.decorate('redis', redis)
  fastify.addHook('onClose', async () => {
    await redis.quit()
  })
}, { name: 'redis' })
