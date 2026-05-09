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

export default fp(async (fastify) => {
  const s3 = new MinioClient({
    endPoint: process.env.S3_ENDPOINT ?? 'localhost',
    port: Number(process.env.S3_PORT ?? 9000),
    useSSL: (process.env.S3_USE_SSL ?? 'false') === 'true',
    accessKey: process.env.S3_ACCESS_KEY ?? 'ayurconnect',
    secretKey: process.env.S3_SECRET_KEY ?? 'ayurconnect-dev-secret',
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
