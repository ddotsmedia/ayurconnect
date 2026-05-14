import fp from 'fastify-plugin'
import { Client as MinioClient } from 'minio'

declare module 'fastify' {
  interface FastifyInstance {
    s3: MinioClient
  }
}

const REQUIRED_BUCKETS = [
  'ayurconnect-prescriptions',
  'ayurconnect-profile',
  'ayurconnect-tourism',
] as const

// Dev fallback so `pnpm dev` works against the local docker MinIO without
// extra env. In production (NODE_ENV=production) we refuse to start with the
// fallback to avoid silently using a known-public credential.
const DEV_SECRET_KEY = 'ayurconnect-dev-secret'
const DEV_ACCESS_KEY = 'ayurconnect'

export default fp(async (fastify) => {
  const isProd = process.env.NODE_ENV === 'production'
  const accessKey = process.env.S3_ACCESS_KEY ?? (isProd ? null : DEV_ACCESS_KEY)
  const secretKey = process.env.S3_SECRET_KEY ?? (isProd ? null : DEV_SECRET_KEY)
  if (!accessKey || !secretKey) {
    throw new Error('S3_ACCESS_KEY and S3_SECRET_KEY must be set in production')
  }

  const s3 = new MinioClient({
    endPoint: process.env.S3_ENDPOINT ?? 'localhost',
    port: Number(process.env.S3_PORT ?? 9000),
    useSSL: (process.env.S3_USE_SSL ?? 'false') === 'true',
    accessKey,
    secretKey,
  })

  for (const bucket of REQUIRED_BUCKETS) {
    try {
      const exists = await s3.bucketExists(bucket)
      if (!exists) {
        await s3.makeBucket(bucket)
        fastify.log.info({ bucket }, 'created MinIO bucket')
      }
    } catch (err) {
      fastify.log.warn({ err, bucket }, 'minio bucket check failed (skipping)')
    }
  }

  fastify.decorate('s3', s3)
}, { name: 'minio' })
