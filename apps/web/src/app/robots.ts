import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ayurconnect.com'

// Path groups we don't want any bot crawling.
const DISALLOW_ALL = [
  '/admin/',
  '/dashboard/',
  '/api/',
  '/sign-in',
  '/dr/',          // private doctor surface
  '/_next/',
  '/static/',
  '/*.json$',
  '/checkout/',
  '/cart/',
  '/auth/',
  '/*?*utm_',      // dedupe tracking-parameter URLs
  '/*?*ref=',
  '/*?*fbclid=',
  '/*?*gclid=',
]

// Heavy/aggressive AI training crawlers — Allow only the ones we explicitly
// want to ingest our content. AI search assistants (Perplexity, ChatGPT
// Search, Claude Search) are kept on Allow because they drive referral
// traffic; AI training crawlers (CCBot, anthropic-ai, Bytespider, etc.) are
// blocked so our content isn't used to train models without attribution.
// Google-Extended is opt-out for Gemini training while keeping Google Search.
const AI_TRAINING_BLOCKED = [
  'CCBot',                 // CommonCrawl → training corpus for many LLMs
  'anthropic-ai',          // Anthropic training
  'Omgilibot', 'Omgili',   // Webz.io aggregator
  'FacebookBot',           // Meta AI training
  'Diffbot',
  'PerplexityBot-User',    // crawler used for indexing (distinct from on-demand)
  'Bytespider',            // ByteDance / TikTok training
  'ImagesiftBot',
  'Applebot-Extended',     // Apple AI training (Applebot itself stays)
  'Amazonbot',
  'cohere-ai',
  'YouBot',
  'AwarioRssBot', 'AwarioSmartBot',
  'magpie-crawler',
  'peer39_crawler', 'peer39_crawler/1.0',
  'TurnitinBot',
  'Timpibot',
]

// Bots we keep allowed but ask to slow down.
const POLITE_BOTS_DELAY = [
  { ua: 'AhrefsBot',     delay: 10 },
  { ua: 'SemrushBot',    delay: 10 },
  { ua: 'MJ12bot',       delay: 20 },
  { ua: 'DotBot',        delay: 20 },
  { ua: 'YandexBot',     delay: 5  },
  { ua: 'Baiduspider',   delay: 10 },
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default — every bot we don't explicitly handle.
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW_ALL,
      },
      // Google + Bing get explicit allow rules so they treat our content as
      // first-class even if the wildcard rule changes later. Both opt-in to
      // Search rich results via robots `Allow`.
      {
        userAgent: 'Googlebot',
        allow: ['/', '/api/og/'],
        disallow: DISALLOW_ALL.filter((p) => !p.startsWith('/api/')),
      },
      { userAgent: 'Googlebot-Image', allow: '/', disallow: ['/admin/', '/dashboard/'] },
      { userAgent: 'Googlebot-News',  allow: ['/articles/', '/health-tips/', '/news-sitemap.xml'], disallow: DISALLOW_ALL },
      { userAgent: 'Googlebot-Video', allow: '/videos/', disallow: DISALLOW_ALL },
      { userAgent: 'Bingbot',         allow: '/', disallow: DISALLOW_ALL },
      { userAgent: 'DuckDuckBot',     allow: '/', disallow: DISALLOW_ALL },

      // Opt OUT of Google Bard / Gemini training while staying in Google Search.
      // https://blog.google/technology/ai/an-update-on-web-publisher-controls/
      { userAgent: 'Google-Extended', disallow: '/' },

      // AI search assistants we WANT to drive referral traffic — these are
      // distinct from training crawlers. Explicit Allow signals consent.
      { userAgent: 'GPTBot',          allow: '/', disallow: ['/admin/', '/dashboard/', '/api/', '/dr/'] },
      { userAgent: 'ChatGPT-User',    allow: '/', disallow: ['/admin/', '/dashboard/', '/api/', '/dr/'] },
      { userAgent: 'OAI-SearchBot',   allow: '/', disallow: ['/admin/', '/dashboard/', '/api/', '/dr/'] },
      { userAgent: 'ClaudeBot',       allow: '/', disallow: ['/admin/', '/dashboard/', '/api/', '/dr/'] },
      { userAgent: 'Claude-Web',      allow: '/', disallow: ['/admin/', '/dashboard/', '/api/', '/dr/'] },
      { userAgent: 'PerplexityBot',   allow: '/', disallow: ['/admin/', '/dashboard/', '/api/', '/dr/'] },
      { userAgent: 'YouBot',          allow: '/', disallow: ['/admin/', '/dashboard/', '/api/', '/dr/'] },
      { userAgent: 'Applebot',        allow: '/', disallow: ['/admin/', '/dashboard/', '/api/'] },

      // Block AI training crawlers we don't want ingesting our doctor and
      // patient-facing content into model corpora.
      ...AI_TRAINING_BLOCKED.map((ua) => ({ userAgent: ua, disallow: '/' })),

      // Polite SEO research bots — allowed but rate-limited.
      ...POLITE_BOTS_DELAY.map(({ ua, delay }) => ({
        userAgent: ua,
        allow: '/',
        disallow: DISALLOW_ALL,
        crawlDelay: delay,
      })),
    ],
    sitemap: [
      `${BASE}/sitemap.xml`,
      `${BASE}/news-sitemap.xml`,
    ],
    host: BASE,
  }
}
