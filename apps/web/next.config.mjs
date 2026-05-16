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
      // ── Canonical host: 301 www → apex ──
      // SEO duplicate-content fix. www.ayurconnect.com and ayurconnect.com
      // were both serving 200 (nginx forwards both to Next.js without a
      // redirect; Cloudflare isn't redirecting either). With this rule,
      // every www request 301s to the apex.
      //
      // The nginx layer is also updated in /nginx.conf for future deploys,
      // but the Next.js redirect ensures the canonical-host policy ships
      // automatically via the standard pnpm deploy pipeline regardless of
      // whether nginx.conf has been manually copied to the VPS.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.ayurconnect.com' }],
        destination: 'https://ayurconnect.com/:path*',
        permanent: true,
      },
      // SEO referenced /blog throughout the strategy doc; we shipped /articles
      // earlier as the public knowledge route. Permanent redirect so any
      // backlink to /blog or /blog/<slug> lands on the live page.
      { source: '/blog',          destination: '/articles',       permanent: true },
      { source: '/blog/:slug',    destination: '/articles/:slug', permanent: true },
    ]
  },
}
