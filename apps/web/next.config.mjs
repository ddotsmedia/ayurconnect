import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  outputFileTracingRoot: resolve(__dirname, '../..'),
  transpilePackages: ['@ayurconnect/ui'],
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://localhost:4100/:path*' },
    ]
  },
}
