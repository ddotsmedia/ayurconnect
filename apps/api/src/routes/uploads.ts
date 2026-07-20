import type { FastifyPluginAsync } from 'fastify'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'

export const autoPrefix = '/uploads'

const ALLOWED_BUCKETS = new Set(['ayurconnect-profile', 'ayurconnect-tourism', 'ayurconnect-prescriptions'])
// P2-1/P2-2/P2-4 audit fixes (2026-05-18):
//   - PUBLIC_BUCKETS can be streamed via the unauthenticated /:bucket/* route.
//     The prescriptions bucket is NOT public — protected by /prescriptions/:id
//     ownership checks instead.
//   - DOCTOR_OR_ADMIN_BUCKETS restricts the prescriptions write path to
//     verified doctors and admins. Patients should never upload prescriptions
//     themselves.
//   - ADMIN_ONLY_BUCKETS gates tourism uploads to admin (admin curates
//     marketing imagery).
const PUBLIC_BUCKETS         = new Set(['ayurconnect-profile', 'ayurconnect-tourism'])
const DOCTOR_OR_ADMIN_BUCKETS = new Set(['ayurconnect-prescriptions'])
const ADMIN_ONLY_BUCKETS     = new Set(['ayurconnect-tourism'])
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

// Magic-byte sniffing — claim from `mimetype` is client-controlled. We reject
// uploads whose first 4 bytes don't match a known image header.
function detectMimeFromMagic(buf: Buffer): string | null {
  if (buf.length < 4) return null
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png'
  // GIF
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return 'image/gif'
  // WebP (RIFF....WEBP)
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return 'image/webp'
  return null
}

const uploads: FastifyPluginAsync = async (fastify) => {
  // POST /uploads — authenticated. multipart/form-data with `file` and optional `bucket`.
  // Returns { url } pointing at /api/uploads/<bucket>/<key> which streams from MinIO.
  fastify.post('/', { preHandler: fastify.requireSession }, async (request, reply) => {
    const sess = request.session!
    const userId = sess.user.id
    const part = await request.file()
    if (!part) return reply.code(400).send({ error: 'no file uploaded' })
    if (!ALLOWED_MIME.has(part.mimetype)) {
      return reply.code(400).send({ error: `unsupported mime type: ${part.mimetype}. Allowed: jpeg, png, webp, gif.` })
    }

    // Read into memory — we already capped fileSize at 5MB in the multipart plugin.
    const buf = await part.toBuffer()
    if (buf.byteLength === 0) return reply.code(400).send({ error: 'empty file' })

    // P2-2: magic-byte sniff — reject uploads whose actual bytes don't match
    // an image header even if the client claims image/jpeg. Prevents HTML/SVG
    // smuggling for stored XSS via the public CDN-style /uploads/* route.
    const sniffed = detectMimeFromMagic(buf)
    if (!sniffed || !ALLOWED_MIME.has(sniffed)) {
      return reply.code(400).send({ error: 'file content does not match an allowed image type' })
    }

    // Bucket is fixed by purpose to avoid users picking arbitrary buckets.
    // ?bucket=tourism / prescriptions only respected if explicitly allowed.
    const requested = (request.query as { bucket?: string }).bucket
    const bucket = requested && ALLOWED_BUCKETS.has(`ayurconnect-${requested}`) ? `ayurconnect-${requested}` : 'ayurconnect-profile'

    // P2-4: role-gate sensitive buckets. Anyone can post a profile photo
    // (own avatar) but only DOCTOR/ADMIN can upload prescriptions, and only
    // ADMIN can upload tourism imagery.
    if (DOCTOR_OR_ADMIN_BUCKETS.has(bucket) && sess.user.role !== 'DOCTOR' && sess.user.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'prescription uploads require doctor or admin role' })
    }
    if (ADMIN_ONLY_BUCKETS.has(bucket) && sess.user.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'tourism uploads require admin role' })
    }

    const ext = sniffed.split('/')[1]?.replace('jpeg', 'jpg') ?? 'bin'
    const id  = randomUUID()
    const key = `users/${userId}/${id}.${ext}`

    // ─── Generate optimised WebP variant + EXIF-strip the original ─────
    // P2-2: the old code had a "sharp re-encode failed, uploading original
    // as-is" fallback. That meant a malformed file could be stored with the
    // attacker-claimed content-type. Now sharp failure is a hard rejection.
    let optimised: Buffer
    let webp: Buffer
    try {
      const pipeline = sharp(buf, { failOn: 'truncated' }).rotate()
      optimised = await pipeline.clone()
        .resize({ width: 1600, withoutEnlargement: true })
        .toFormat(sniffed === 'image/png' ? 'png' : 'jpeg', { quality: 85 })
        .toBuffer()
      webp = await pipeline.clone()
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer()
    } catch (err) {
      fastify.log.warn({ err }, 'sharp re-encode failed — rejecting upload')
      return reply.code(400).send({ error: 'image could not be processed (corrupted or unsupported)' })
    }

    try {
      // Always force the content-type to what sharp produced — never trust
      // client-supplied mimetype on the served object.
      const outputMime = sniffed === 'image/png' ? 'image/png' : 'image/jpeg'
      await fastify.s3.putObject(bucket, key, optimised, optimised.byteLength, { 'Content-Type': outputMime })
      const webpKey = `users/${userId}/${id}.webp`
      await fastify.s3.putObject(bucket, webpKey, webp, webp.byteLength, { 'Content-Type': 'image/webp' })
      return {
        url:     `/api/uploads/${bucket}/${key}`,
        webpUrl: `/api/uploads/${bucket}/${webpKey}`,
        bucket,
        key,
        size:    optimised.byteLength,
        mime:    outputMime,
      }
    } catch (err) {
      fastify.log.error({ err }, 'minio upload failed')
      return reply.code(502).send({ error: 'storage unavailable' })
    }
  })

  // POST /uploads/avatar — dedicated small-avatar path. Distinct from the
  // generic /uploads/ (which targets 1600px hero images) because avatars
  // have stricter rules: 500 KB max, 400×400 cover-crop, WebP-only output.
  // Task 2026-07-20 — used by doctor registration + profile edit.
  const AVATAR_BYTES = 500 * 1024              // 500 KB task cap
  const AVATAR_MIME  = new Set(['image/jpeg', 'image/png', 'image/webp'])   // no GIF for avatars
  fastify.post('/avatar', { preHandler: fastify.requireSession }, async (request, reply) => {
    const sess   = request.session!
    const userId = sess.user.id
    const part   = await request.file()
    if (!part) return reply.code(400).send({ error: 'no file uploaded' })
    if (!AVATAR_MIME.has(part.mimetype)) {
      return reply.code(400).send({ error: `unsupported mime type: ${part.mimetype}. Allowed: jpeg, png, webp.` })
    }
    const buf = await part.toBuffer()
    if (buf.byteLength === 0)          return reply.code(400).send({ error: 'empty file' })
    if (buf.byteLength > AVATAR_BYTES) return reply.code(413).send({ error: `file too large (${(buf.byteLength / 1024).toFixed(0)} KB) — max 500 KB` })
    const sniffed = detectMimeFromMagic(buf)
    if (!sniffed || !AVATAR_MIME.has(sniffed)) {
      return reply.code(400).send({ error: 'file content does not match an allowed image type' })
    }

    // 400×400 cover-crop, WebP quality 80. Deterministic key so re-upload
    // replaces the previous avatar cleanly.
    let out: Buffer
    try {
      out = await sharp(buf, { failOn: 'truncated' })
        .rotate()
        .resize({ width: 400, height: 400, fit: 'cover', position: 'attention' })
        .webp({ quality: 80 })
        .toBuffer()
    } catch (err) {
      fastify.log.warn({ err }, 'avatar sharp failed')
      return reply.code(400).send({ error: 'image could not be processed (corrupted or unsupported)' })
    }

    const key    = `avatars/${userId}.webp`
    const bucket = 'ayurconnect-profile'
    try {
      await fastify.s3.putObject(bucket, key, out, out.byteLength, { 'Content-Type': 'image/webp' })
      return { url: `/api/uploads/${bucket}/${key}?v=${Date.now()}`, bucket, key, size: out.byteLength }
    } catch (err) {
      fastify.log.error({ err }, 'avatar minio put failed')
      return reply.code(502).send({ error: 'storage unavailable' })
    }
  })

  // GET /uploads/:bucket/:key+   — public stream for non-sensitive buckets only.
  // P2-1: the prescriptions bucket is no longer publicly readable via this
  // route. Prescriptions are streamed by /prescriptions/:id/image after the
  // ownership check; we don't expose the bucket here.
  fastify.get('/:bucket/*', async (request, reply) => {
    const { bucket } = request.params as { bucket: string }
    const key = (request.params as { '*': string })['*']
    if (!PUBLIC_BUCKETS.has(bucket) || !key) return reply.code(404).send({ error: 'not found' })

    try {
      const stat = await fastify.s3.statObject(bucket, key)
      const stream = await fastify.s3.getObject(bucket, key)
      // Restrict content-type to image/* to defend against any historical
      // non-image objects served from these buckets.
      const ct = stat.metaData?.['content-type'] ?? 'application/octet-stream'
      const safeCt = ct.startsWith('image/') ? ct : 'application/octet-stream'
      reply
        .header('content-type',     safeCt)
        .header('content-length',   stat.size)
        .header('cache-control',    'public, max-age=86400, immutable')
        .header('x-content-type-options', 'nosniff')
      return reply.send(stream)
    } catch (err) {
      fastify.log.warn({ err, bucket, key }, 'minio object not found')
      return reply.code(404).send({ error: 'not found' })
    }
  })
}

export default uploads
