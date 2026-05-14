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
  async redirects() {
    return [
      // SEO referenced /blog throughout the strategy doc; we shipped /articles
      // earlier as the public knowledge route. Permanent redirect so any
      // backlink to /blog or /blog/<slug> lands on the live page.
      { source: '/blog',          destination: '/articles',       permanent: true },
      { source: '/blog/:slug',    destination: '/articles/:slug', permanent: true },
    ]
  },
}
