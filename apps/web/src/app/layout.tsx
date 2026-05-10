import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { Navbar, Footer, AyurBotWidget, MobileBottomNav } from '@ayurconnect/ui'
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://ayurconnect.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://ayurconnect.com',
    siteName: 'AyurConnect',
    title: "AyurConnect — Kerala's #1 Ayurveda Platform",
    description: 'CCIM-verified doctors, classical Panchakarma centres, herb encyclopedia, AyurBot AI.',
  },
  twitter: { card: 'summary_large_image', title: 'AyurConnect', description: "Kerala's Ayurveda platform" },
  alternates: { canonical: '/', languages: { 'en-IN': '/', 'ml-IN': '/?lang=ml' } },
  // icon, apple-icon, opengraph-image are picked up automatically from
  // app/icon.svg, app/apple-icon.png (if added), app/opengraph-image.tsx
}

const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'MedicalOrganization',
  name: 'AyurConnect',
  url: 'https://ayurconnect.com',
  logo: 'https://ayurconnect.com/logo.png',
  medicalSpecialty: ['Ayurveda', 'Panchakarma', 'Traditional Indian Medicine'],
  areaServed: { '@type': 'AdministrativeArea', name: 'Kerala, India' },
  description: "Kerala's #1 Ayurveda platform — CCIM-verified doctors, hospitals, herbs, and AI insights.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-cream font-sans text-ink">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }} />
        <Navbar />
        <main className="pb-16 md:pb-0">{children}</main>
        <Footer />
        <AyurBotWidget />
        <MobileBottomNav />
      </body>
    </html>
  )
}
