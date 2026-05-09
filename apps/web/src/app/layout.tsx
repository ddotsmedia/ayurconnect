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
  title: "AyurConnect — Kerala's #1 Ayurveda Platform",
  description:
    "Find CCIM-verified Ayurveda doctors, classical Panchakarma centres, 1000+ medicinal herbs, and AI-assisted health insights — rooted in Kerala, God's Own Country.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://ayurconnect.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-cream font-sans text-ink">
        <Navbar />
        <main className="pb-16 md:pb-0">{children}</main>
        <Footer />
        <AyurBotWidget />
        <MobileBottomNav />
      </body>
    </html>
  )
}
