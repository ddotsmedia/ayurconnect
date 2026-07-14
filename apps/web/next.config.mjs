import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: resolve(__dirname, '../..'),
  transpilePackages: ['@ayurconnect/ui'],
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://localhost:4100/:path*' },
      // Single-segment rewrite for the legacy SEO pattern. Multi-segment
      // /jobs/:slug-jobs/:location would over-match /jobs/ayurveda-jobs/[country],
      // so we only rewrite the single-segment form here and ship canonical
      // /jobs/specialization/[slug]/[location] URLs everywhere else.
      { source: '/jobs/:slug-jobs', destination: '/jobs/specialization/:slug' },
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
      // Backlink/alias slugs that 404'd in production.
      { source: '/conditions/pcos-pcod', destination: '/conditions/pcos',          permanent: true },
      { source: '/jobs/licensing/dha',   destination: '/jobs/licensing/dha-dubai', permanent: true },
      // 2026-07-07 — malformed URLs Google Search Console has crawled where
      // the anchor text got concatenated onto the href. No source in the
      // current codebase; likely from an old backlink or a 3rd-party scraper.
      // Defensive 301 to the correct destinations.
      { source: '/eventsEvents',             destination: '/events',      permanent: true },
      { source: '/leaderboardLeaderboard',   destination: '/leaderboard', permanent: true },
      // Old `art-*` article slugs from a previous CMS schema. The current
      // /articles/[id] page also self-heals unknown ids by redirecting to
      // /articles — this pattern short-circuits the DB round-trip.
      { source: '/articles/:slug(art-.*)',   destination: '/articles',    permanent: true },
      // 2026-07-07 pt.2 — additional legacy-URL cleanup found in GSC.
      // Old /book/* CMS: none of the current app uses this prefix; funnel
      // to the closest current surface (/learn/ebooks).
      { source: '/book',                     destination: '/learn/ebooks', permanent: true },
      { source: '/book/:path*',              destination: '/learn/ebooks', permanent: true },
      // Old /news/* CMS: current news lives under /articles + /articles/[id].
      { source: '/news',                     destination: '/articles',    permanent: true },
      { source: '/news/:path*',              destination: '/articles',    permanent: true },
      // Old doctor CUIDs starting with 'cmp' (from a previous DB) — safe to
      // blackhole because current live doctors use 'cmq' and 'cmr' prefixes.
      // Verified before adding to avoid killing live profiles.
      { source: '/doctors/:id(cmp.*)',       destination: '/doctors',     permanent: true },
      // 2026-07-08 — Screaming Frog audit 404s. Treatment slugs never had
      // dedicated pages; funnel to /panchakarma (the closest current surface).
      { source: '/treatments/pizhichil',     destination: '/panchakarma', permanent: true },
      { source: '/treatments/panchakarma',   destination: '/panchakarma', permanent: true },
      { source: '/treatments/sirodhara',     destination: '/panchakarma', permanent: true },
      { source: '/treatments/njavarakizhi',  destination: '/panchakarma', permanent: true },
      { source: '/treatments/rasayana',      destination: '/panchakarma', permanent: true },
      { source: '/consult',                  destination: '/online-consultation', permanent: true },
    ]
  },
  async headers() {
    // Security headers from Next.js — nginx also sets the static ones; this
    // covers any path served directly by Next (e.g. if nginx is bypassed in
    // a dev/staging env) and adds the dynamic CSP that nginx can't easily
    // express. Keep these in sync with nginx.conf.
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control',    value: 'on' },
          {
            key: 'Permissions-Policy',
            value:
              'geolocation=(), microphone=(self), camera=(self), payment=(self), fullscreen=(self), ' +
              'accelerometer=(), gyroscope=(), magnetometer=(), interest-cohort=()',
          },
          {
            // Content Security Policy — locked-down baseline. Inline scripts
            // and styles are allowed because Next.js' streaming SSR and
            // JSON-LD <script> blocks need them. unsafe-eval is required by
            // some Next.js client bundles in development; production builds
            // can usually remove it but Next 15 RSC still emits some.
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.daily.co https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https: wss:",
              "frame-src https://*.daily.co https://checkout.razorpay.com https://api.razorpay.com",
              "media-src 'self' blob: https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://checkout.razorpay.com",
              "frame-ancestors 'self'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
        ],
      },
    ]
  },
}
