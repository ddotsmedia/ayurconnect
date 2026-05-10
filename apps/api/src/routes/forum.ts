import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/forum'

const forum: FastifyPluginAsync = async (fastify) => {
  fastify.get('/posts', async (request) => {
    const { page = '1', limit = '10', category, language } = request.query as Record<string, string>
    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 10
    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (language) where.language = language

    const [posts, total] = await Promise.all([
      fastify.prisma.post.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          comments: {
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      fastify.prisma.post.count({ where }),
    ])

    return {
      posts,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    }
  })

  fastify.get('/posts/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const post = await fastify.prisma.post.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        comments: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
        upvotes: { select: { userId: true } },
      },
    })
    if (!post) return reply.code(404).send({ error: 'Post not found' })
    return {
      ...post,
      upvoteCount: post.upvotes.length,
      upvotes: undefined,
    }
  })

  fastify.post('/posts/:id/upvote', { preHandler: fastify.requireSession }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.session!.user.id
    try {
      await fastify.prisma.upvote.create({ data: { userId, postId: id } })
      const count = await fastify.prisma.upvote.count({ where: { postId: id } })
      return reply.code(201).send({ upvoted: true, count })
    } catch {
      // already upvoted -> toggle off
      await fastify.prisma.upvote.deleteMany({ where: { userId, postId: id } })
      const count = await fastify.prisma.upvote.count({ where: { postId: id } })
      return { upvoted: false, count }
    }
  })

  fastify.post('/posts', { preHandler: fastify.requireSession }, async (request, reply) => {
    const { title, content, category, language = 'en' } = request.body as Record<string, string>
    if (!title || !content || !category) {
      return reply.code(400).send({ error: 'title, content, category required' })
    }
    const userId = request.session!.user.id
    const post = await fastify.prisma.post.create({
      data: { title, content, category, language, userId },
      include: { user: { select: { id: true, name: true } } },
    })
    return reply.code(201).send(post)
  })

  fastify.post('/posts/:id/comments', { preHandler: fastify.requireSession }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { content } = request.body as { content?: string }
    if (!content) return reply.code(400).send({ error: 'content required' })
    const userId = request.session!.user.id
    const comment = await fastify.prisma.comment.create({
      data: { content, postId: id, userId },
      include: { user: { select: { id: true, name: true } } },
    })
    return reply.code(201).send(comment)
  })

  fastify.delete('/posts/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.post.delete({ where: { id } })
    return reply.code(204).send()
  })

  fastify.delete('/comments/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.prisma.comment.delete({ where: { id } })
    return reply.code(204).send()
  })

  fastify.get('/categories', async () => [
    { id: 'doctor-discussion', name: 'Doctor Discussions', description: 'CCIM-verified doctors only' },
    { id: 'patient-forum', name: 'Patient Forum', description: 'Patient experiences and questions' },
    { id: 'webinar', name: 'Webinars & Events', description: 'Ayurveda webinars and events' },
    { id: 'research', name: 'Research & Studies', description: 'Latest Ayurveda research' },
  ])
}

export default forum
