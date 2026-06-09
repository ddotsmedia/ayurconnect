import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { ShieldCheck } from 'lucide-react'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../lib/seo'
import { VerifyForm } from './_form'

export const metadata: Metadata = pageMetadata({
  title: 'Verify Product Authenticity — Batch & QR Check | AyurConnect',
  description:
    'Check whether your Ayurvedic medicine is genuine. Enter the batch code printed on the pack (or scan the QR) to confirm the manufacturer, AYUSH licence and GMP certification.',
  path: '/verify',
})

export default function VerifyPage() {
  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home', url: '/' },
      { name: 'Verify Authenticity', url: '/verify' },
    ]),
  )
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="green" size="md">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <ShieldCheck className="w-3 h-3" /> Authenticity check
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-white">Verify Product Authenticity</h1>
          <p className="mt-4 text-white/85">
            Enter the batch code printed on your medicine pack to confirm it comes from a licensed,
            GMP-certified manufacturer.
          </p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-12 max-w-xl">
        <VerifyForm />
        <p className="mt-8 rounded-2xl bg-kerala-50 p-5 text-sm text-gray-600">
          The batch registry covers participating manufacturers. A "not found" result does not by
          itself prove a product is counterfeit — confirm with the manufacturer or your verified doctor.
        </p>
      </section>
    </main>
  )
}
