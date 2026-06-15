import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { Navbar, Footer, AyurBotWidget, MobileBottomNav, ServiceWorkerRegister, CookieConsent, TopContactBar, type NavbarSession, type FooterSettings } from '@ayurconnect/ui'
import { getServerSession } from '../lib/auth'
import { organizationLd, websiteLd, speakableLd, siteNavigationLd, ldGraph, SITE_URL, AYURVEDA_KEYWORDS } from '../lib/seo'
import { API_INTERNAL as API } from '../lib/server-fetch'
import { PageViewTracker } from '../components/page-view-tracker'
import { WhatsAppButton } from '../components/WhatsAppButton'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: "AyurConnect — Kerala's #1 Ayurveda Platform",
    template: '%s | AyurConnect',
  },
  description:
    "Find verified Ayurveda doctors, classical Panchakarma centres, 150+ medicinal herbs, and AI-assisted health insights — rooted in Kerala, God's Own Country.",
  applicationName: 'AyurConnect',
  authors: [{ name: 'AyurConnect', url: SITE_URL }],
  // Centralised in lib/seo.ts → AYURVEDA_KEYWORDS so per-route metadata can
  // pull a category-specific subset rather than re-declaring strings.
  keywords: AYURVEDA_KEYWORDS.all,
  creator: 'AyurConnect',
  publisher: 'AyurConnect',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    alternateLocale: ['ml_IN'],
    url: SITE_URL,
    siteName: 'AyurConnect',
    title: "AyurConnect — Kerala's #1 Ayurveda Platform",
    description: 'verified doctors, classical Panchakarma centres, herb encyclopedia, AyurBot AI.',
  },
  twitter: { card: 'summary_large_image', title: 'AyurConnect', description: "Kerala's Ayurveda platform", site: '@ayurconnect' },
  alternates: {
    canonical: '/',
    languages: { 'en-IN': '/', 'x-default': '/' },
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'AyurConnect',
    statusBarStyle: 'default',
  },
  formatDetection: { telephone: true, email: true, address: true },
  // Site-verification — paste real codes via env vars (no rebuild needed for
  // a normal Next.js redeploy). NEXT_PUBLIC_* are inlined at build time, so
  // a deploy is required to pick up new values. Each value is omitted from
  // the rendered <head> when the env var is empty/unset so we don't emit
  // empty meta tags (which would fail the GSC check).
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    yandex: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION || undefined,
    other: Object.fromEntries(
      Object.entries({
        'msvalidate.01':                 process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
        'p:domain_verify':               process.env.NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION,
        'facebook-domain-verification':  process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION,
      }).filter((entry): entry is [string, string] => Boolean(entry[1])),
    ),
  },
  // ─── Robots — explicit max preview directives improve SERP appearance ──
  // Without these Google defaults to truncated snippets and small image
  // previews; the values below opt in to the largest preview Google allows.
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  // ─── Additional <meta> tags ───────────────────────────────────────────
  other: {
    // Geo — primary HQ is Kerala; UAE clinic info is per-page via geoMeta().
    'geo.region':    'IN-KL',
    'geo.placename': 'Kochi, Kerala, India',
    'geo.position':  '9.9312;76.2673',
    'ICBM':          '9.9312, 76.2673',
    // Dublin Core — picked up by academic and library crawlers.
    'DC.title':       "AyurConnect — Kerala's #1 Ayurveda Platform",
    'DC.subject':     'Ayurveda, Panchakarma, Traditional Indian Medicine, AYUSH',
    'DC.language':    'en-IN',
    'DC.publisher':   'AyurConnect',
    'DC.coverage':    'Kerala, India; UAE; GCC; Worldwide',
    'DC.type':        'Service',
    // Content rating & audience.
    'rating':         'general',
    'audience':       'all',
    'distribution':   'global',
    'revisit-after':  '1 days',
    // Browser address-bar coloration on Android Chrome — also set via Viewport.
    'msapplication-TileColor': '#155228',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    // Referrer policy — leak less when users click outbound links.
    'referrer':       'strict-origin-when-cross-origin',
    // PWA / web-app capability hints.
    'mobile-web-app-capable':         'yes',
    'apple-mobile-web-app-capable':   'yes',
    'application-name':               'AyurConnect',
    // Pinterest Rich Pin verification target (also tagged in verification.other).
    'pinterest-rich-pin':             'true',
  },
  // icon, apple-icon, opengraph-image are picked up automatically from
  // app/icon.svg, app/apple-icon.png (if added), app/opengraph-image.tsx
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#155228' },
  ],
  width: 'device-width',
  initialScale: 1,
}

// Primary nav links — emitted as SiteNavigationElement schema so Google can
// understand the site's information architecture for sitelinks rendering.
const PRIMARY_NAV = [
  { name: 'Doctors',              url: '/doctors' },
  { name: 'Hospitals',            url: '/hospitals' },
  { name: 'Treatments',           url: '/treatments' },
  { name: 'Conditions',           url: '/conditions' },
  { name: 'Herbs',                url: '/herbs' },
  { name: 'Panchakarma',          url: '/panchakarma' },
  { name: 'Online Consultation',  url: '/online-consultation' },
  { name: 'AyurBot AI',           url: '/ayurbot' },
  { name: 'Q&A',                  url: '/qa' },
  { name: 'Articles',             url: '/articles' },
  { name: 'Health Tips',          url: '/health-tips' },
  { name: 'Tourism',              url: '/tourism' },
]

const ROOT_JSON_LD = ldGraph(
  organizationLd(),
  websiteLd(),
  speakableLd(['h1', '.lede', '.faq-question', '.faq-answer', '[data-speakable]']),
  ...siteNavigationLd(PRIMARY_NAV),
)

async function fetchFooterSettings(): Promise<FooterSettings> {
  try {
    const res = await fetch(`${API}/site-settings`, { next: { revalidate: 60 } })
    if (!res.ok) return {}
    return (await res.json()) as FooterSettings
  } catch { return {} }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sess, footerSettings] = await Promise.all([getServerSession(), fetchFooterSettings()])
  const navSession: NavbarSession = sess
    ? { user: { id: sess.user.id, email: sess.user.email, name: sess.user.name, role: sess.user.role, image: sess.user.image ?? null } }
    : null

  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        {/* DNS hints — pre-resolve to API + CDN before first navigation. */}
        <link rel="dns-prefetch" href="https://api.ayurconnect.com" />
        <link rel="preconnect"   href="https://api.ayurconnect.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

        {/* Feed + search discovery. Browsers and feed readers auto-detect. */}
        <link rel="alternate" type="application/rss+xml"  title="AyurConnect — RSS"  href="/feed.xml" />
        <link rel="alternate" type="application/atom+xml" title="AyurConnect — Atom" href="/atom.xml" />
        <link rel="search"    type="application/opensearchdescription+xml" title="AyurConnect" href="/opensearch.xml" />

        {/* hreflang — emitted at root for the homepage; per-page metadata
            (pageMetadata helper) overrides with the correct canonical path. */}
        <link rel="alternate" hrefLang="en-IN" href={SITE_URL} />
        <link rel="alternate" hrefLang="x-default" href={SITE_URL} />

        {/* AI training opt-out hint mirrored in HTML (also enforced by robots.ts). */}
        <meta name="robots" content="max-image-preview:large" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      </head>
      <body className="min-h-screen bg-cream font-sans text-ink">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-kerala-700 focus:shadow-lg focus:rounded">Skip to content</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ROOT_JSON_LD) }} />
        <TopContactBar settings={footerSettings} />
        <Navbar session={navSession} />
        <main id="main-content" className="pb-16 md:pb-0">{children}</main>
        <Footer settings={footerSettings} />
        <AyurBotWidget />
        <WhatsAppButton />
        <MobileBottomNav />
        <ServiceWorkerRegister />
        <CookieConsent />
        <Suspense fallback={null}><PageViewTracker /></Suspense>
      </body>
    </html>
  )
}
