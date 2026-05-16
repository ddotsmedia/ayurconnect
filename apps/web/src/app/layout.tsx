import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { Navbar, Footer, AyurBotWidget, MobileBottomNav, ServiceWorkerRegister, CookieConsent, TopContactBar, type NavbarSession, type FooterSettings } from '@ayurconnect/ui'
import { getServerSession } from '../lib/auth'
import { organizationLd, websiteLd, ldGraph, SITE_URL, AYURVEDA_KEYWORDS } from '../lib/seo'
import { API_INTERNAL as API } from '../lib/server-fetch'
import { PageViewTracker } from '../components/page-view-tracker'
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
    languages: { 'en-IN': '/', 'ml-IN': '/?lang=ml', 'x-default': '/' },
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

const ROOT_JSON_LD = ldGraph(organizationLd(), websiteLd())

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
      <body className="min-h-screen bg-cream font-sans text-ink">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ROOT_JSON_LD) }} />
        <TopContactBar settings={footerSettings} />
        <Navbar session={navSession} />
        <main className="pb-16 md:pb-0">{children}</main>
        <Footer settings={footerSettings} />
        <AyurBotWidget />
        <MobileBottomNav />
        <ServiceWorkerRegister />
        <CookieConsent />
        <Suspense fallback={null}><PageViewTracker /></Suspense>
      </body>
    </html>
  )
}
