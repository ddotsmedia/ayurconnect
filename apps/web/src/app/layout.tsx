import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { Navbar, Footer, AyurBotWidget, MobileBottomNav, ServiceWorkerRegister, type NavbarSession } from '@ayurconnect/ui'
import { getServerSession } from '../lib/auth'
import { organizationLd, websiteLd, ldGraph, SITE_URL } from '../lib/seo'
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
    "Find CCIM-verified Ayurveda doctors, classical Panchakarma centres, 150+ medicinal herbs, and AI-assisted health insights — rooted in Kerala, God's Own Country.",
  applicationName: 'AyurConnect',
  authors: [{ name: 'AyurConnect', url: SITE_URL }],
  keywords: [
    'Ayurveda', 'Kerala Ayurveda', 'Panchakarma', 'Ayurvedic doctors',
    'CCIM verified', 'AYUSH', 'BAMS', 'Shirodhara', 'Kayachikitsa',
    'Ayurvedic herbs', 'Triphala', 'Ashwagandha', 'AyurBot', 'Ayurveda Kerala',
  ],
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
    description: 'CCIM-verified doctors, classical Panchakarma centres, herb encyclopedia, AyurBot AI.',
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
  // Site-verification placeholders — paste real codes once Search Console / Bing approve.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? undefined,
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ?? '',
    },
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sess = await getServerSession()
  const navSession: NavbarSession = sess
    ? { user: { id: sess.user.id, email: sess.user.email, name: sess.user.name, role: sess.user.role, image: sess.user.image ?? null } }
    : null

  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-cream font-sans text-ink">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ROOT_JSON_LD) }} />
        <Navbar session={navSession} />
        <main className="pb-16 md:pb-0">{children}</main>
        <Footer />
        <AyurBotWidget />
        <MobileBottomNav />
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
