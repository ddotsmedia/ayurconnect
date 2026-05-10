import type { FastifyPluginAsync } from 'fastify'
import { randomUUID } from 'node:crypto'

export const autoPrefix = '/uploads'

const ALLOWED_BUCKETS = new Set(['ayurconnect-profile', 'ayurconnect-tourism', 'ayurconnect-prescriptions'])
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

const uploads: FastifyPluginAsync = async (fastify) => {
  // POST /uploads — authenticated. multipart/form-data with `file` and optional `bucket`.
  // Returns { url } pointing at /api/uploads/<bucket>/<key> which streams from MinIO.
  fastify.post('/', { preHandler: fastify.requireSession }, async (request, reply) => {
    const userId = request.session!.user.id
    const part = await request.file()
    if (!part) return reply.code(400).send({ error: 'no file uploaded' })
    if (!ALLOWED_MIME.has(part.mimetype)) {
      return reply.code(400).send({ error: `unsupported mime type: ${part.mimetype}. Allowed: jpeg, png, webp, gif.` })
    }

    // Read into memory — we already capped fileSize at 5MB in the multipart plugin.
    const buf = await part.toBuffer()
    if (buf.byteLength === 0) return reply.code(400).send({ error: 'empty file' })

    // Bucket is fixed by purpose to avoid users picking arbitrary buckets.
    // ?bucket=tourism / prescriptions only respected if explicitly allowed.
    const requested = (request.query as { bucket?: string }).bucket
    const bucket = requested && ALLOWED_BUCKETS.has(`ayurconnect-${requested}`) ? `ayurconnect-${requested}` : 'ayurconnect-profile'

    const ext = part.mimetype.split('/')[1]?.replace('jpeg', 'jpg') ?? 'bin'
    const key = `users/${userId}/${randomUUID()}.${ext}`

    try {
      await fastify.s3.putObject(bucket, key, buf, buf.byteLength, { 'Content-Type': part.mimetype })
    } catch (err) {
      fastify.log.error({ err }, 'minio upload failed')
      return reply.code(502).send({ error: 'storage unavailable' })
    }

    // The URL is served back through THIS API at /api/uploads/<bucket>/<key>,
    // which streams from MinIO with the right content-type. No CORS / no public
    // bucket policy needed; the URL works via Cloudflare directly.
    return {
      url: `/api/uploads/${bucket}/${key}`,
      bucket,
      key,
      size: buf.byteLength,
      mime: part.mimetype,
    }
  })

  // GET /uploads/:bucket/:key+   — public stream (lets <img> tags load directly)
  // Wildcard `*` captures the slash-bearing key.
  fastify.get('/:bucket/*', async (request, reply) => {
    const { bucket } = request.params as { bucket: string }
    const key = (request.params as { '*': string })['*']
    if (!ALLOWED_BUCKETS.has(bucket) || !key) return reply.code(404).send({ error: 'not found' })

    try {
      const stat = await fastify.s3.statObject(bucket, key)
      const stream = await fastify.s3.getObject(bucket, key)
      reply
        .header('content-type',  stat.metaData?.['content-type'] ?? 'application/octet-stream')
        .header('content-length', stat.size)
        .header('cache-control', 'public, max-age=86400, immutable')
      return reply.send(stream)
    } catch (err) {
      fastify.log.warn({ err, bucket, key }, 'minio object not found')
      return reply.code(404).send({ error: 'not found' })
    }
  })
}

export default uploads
