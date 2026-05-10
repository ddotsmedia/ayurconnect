import type { FastifyPluginAsync } from 'fastify'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'

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
    const id  = randomUUID()
    const key = `users/${userId}/${id}.${ext}`

    // ─── Generate optimised WebP variant + EXIF-strip the original ─────
    // sharp also handles auto-rotate based on EXIF orientation, which fixes
    // sideways photos from phones. Original kept for fidelity; webp served
    // by default to <img>/picture tags for smaller bandwidth.
    let optimised: Buffer = buf
    let webp: Buffer | null = null
    try {
      // Re-encode (and strip metadata) the original at its native format
      const pipeline = sharp(buf, { failOn: 'none' }).rotate()
      optimised = await pipeline.clone()
        .resize({ width: 1600, withoutEnlargement: true })
        .toFormat(part.mimetype.includes('png') ? 'png' : 'jpeg', { quality: 85 })
        .toBuffer()
      webp = await pipeline.clone()
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer()
    } catch (err) {
      fastify.log.warn({ err }, 'sharp re-encode failed, uploading original as-is')
    }

    try {
      await fastify.s3.putObject(bucket, key, optimised, optimised.byteLength, { 'Content-Type': part.mimetype })
      if (webp) {
        const webpKey = `users/${userId}/${id}.webp`
        await fastify.s3.putObject(bucket, webpKey, webp, webp.byteLength, { 'Content-Type': 'image/webp' })
      }
    } catch (err) {
      fastify.log.error({ err }, 'minio upload failed')
      return reply.code(502).send({ error: 'storage unavailable' })
    }

    return {
      url:     `/api/uploads/${bucket}/${key}`,
      webpUrl: webp ? `/api/uploads/${bucket}/users/${userId}/${id}.webp` : null,
      bucket,
      key,
      size:  optimised.byteLength,
      mime:  part.mimetype,
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
