import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Sun, Wind, AlertCircle } from 'lucide-react'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../lib/seo'
import { RitucharyaForm } from './_form'

export const metadata: Metadata = pageMetadata({
  path:  '/ritucharya',
  title: 'Ritucharya — Personalized Seasonal Regimen',
  description: 'Your seasonal Ayurvedic regimen, tuned to your prakriti AND your local climate. Built for diaspora patients: Gulf, UK, US, Australia climates supported, not just Kerala. Ahara, Vihara, Dinacharya, herbs.',
  keywords: ['ritucharya', 'seasonal regimen', 'dinacharya', 'ayurveda gulf summer', 'ayurveda winter regimen', 'panchakarma season'],
})

export default function RitucharyaPage() {
  const ld = ldGraph(breadcrumbLd([
    { name: 'Home',          url: '/' },
    { name: 'Ritucharya',    url: '/ritucharya' },
  ]))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Sun className="w-3 h-3" /> Personalized seasonal regimen
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Ritucharya</h1>
          <p className="mt-5 text-lg text-white/80">
            Your prakriti × the current Ritu × your local climate. Built for diaspora patients —
            Gulf summer, UK winter, US east-coast autumn handled, not just Kerala monsoon.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 p-4 rounded-card bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold mb-1">Educational only — not a prescription.</p>
            <p className="leading-relaxed">
              Ritucharya is daily-living guidance from classical Ayurveda. It is not a substitute for clinical care.
              If you have chronic conditions or take prescription medications, discuss any major dietary or herb change
              with a verified Ayurveda doctor first.
            </p>
          </div>
        </div>

        <RitucharyaForm />

        <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
            <Sun className="w-6 h-6 text-kerala-700 mb-2" />
            <h2 className="font-serif text-lg text-ink">Why climate matters</h2>
            <p className="text-sm text-gray-700 mt-1 leading-relaxed">
              The classical 6-Ritu Indian calendar assumes monsoon timing that Dubai, London, or Sydney don&apos;t share.
              Without the climate override, a UAE-resident&apos;s &quot;Varsha&quot; protocol misfires because there&apos;s no monsoon.
              We map your city to the right climate profile and adjust the regimen accordingly.
            </p>
          </article>
          <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
            <Wind className="w-6 h-6 text-kerala-700 mb-2" />
            <h2 className="font-serif text-lg text-ink">Re-run when the season changes</h2>
            <p className="text-sm text-gray-700 mt-1 leading-relaxed">
              Every Ritu has its own dosha pattern. Your regimen for Hemanta (early winter) looks nothing like Grishma (summer).
              Bookmark this page and come back at season change — or opt in to be notified.
            </p>
          </article>
        </section>
      </section>
    </>
  )
}
