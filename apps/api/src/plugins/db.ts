import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'
import Anthropic from '@anthropic-ai/sdk'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
    anthropic: Anthropic
  }
}

export default fp(async (fastify) => {
  const prisma = new PrismaClient()
  await prisma.$connect()
  fastify.decorate('prisma', prisma)

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  fastify.decorate('anthropic', anthropic)

  fastify.addHook('onClose', async () => {
    await prisma.$disconnect()
  })
}, { name: 'db' })
