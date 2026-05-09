import * as path from 'node:path'
import AutoLoad, { type AutoloadPluginOptions } from '@fastify/autoload'
import fp from 'fastify-plugin'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export type AppOptions = Partial<AutoloadPluginOptions>

const options: AppOptions = {}

// Wrapped in fp so plugin decorators (fastify.auth, fastify.prisma, ...)
// propagate to the root server instance.
const app = fp(async (fastify, opts: AppOptions) => {
  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: opts,
    forceESM: true,
  })

  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: opts,
    forceESM: true,
  })
}, { name: 'app' })

export default app
export { app, options }
