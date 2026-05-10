import fp from 'fastify-plugin'
import multipart from '@fastify/multipart'

// 5 MB cap per upload, single file at a time. Generous enough for photos
// and small PDFs; rejects anything bigger so we don't fill the disk by mistake.
export default fp(async (fastify) => {
  await fastify.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 1,
      fields: 10,
    },
  })
}, { name: 'multipart' })
