import fp from 'fastify-plugin'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'

export default fp(async (fastify) => {
  await fastify.register(cookie)
  await fastify.register(cors, {
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(','),
    credentials: true,
  })
}, { name: 'cors' })
