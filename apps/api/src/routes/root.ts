import { type FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get('/health', async () => ({ status: 'ok' }))
  fastify.get('/', async () => ({
    name: 'ayurconnect-api',
    version: '1.0.0',
    docs: 'GET /health, /doctors, /hospitals, /ayurbot/chat, /forum/posts, /jobs, /herbs, /tourism/packages, /colleges',
  }))
}

export default root
