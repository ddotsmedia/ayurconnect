import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Search, AlertCircle } from 'lucide-react'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../../lib/seo'
import { SymptomClient } from './_client'

export const metadata: Metadata = pageMetadata({
  path:        '/tools/symptom-checker',
  title:       'Ayurvedic Symptom Checker | AyurConnect',
  description: 'Free Ayurvedic symptom checker. Maps your symptoms to possible classical conditions with verified Kerala doctors to consult. Educational — not a diagnosis.',
  keywords:    ['ayurvedic symptom checker', 'symptom analyzer', 'dosha symptoms', 'kerala ayurveda symptoms'],
})

export default function SymptomPage() {
  const ld = ldGraph(
    { '@context': 'https://schema.org', '@type': 'MedicalWebPage', name: 'Ayurvedic Symptom Checker', url: 'https://ayurconnect.com/tools/symptom-checker', about: { '@type': 'MedicalSpecialty', name: 'Ayurveda' } },
    breadcrumbLd([
      { name: 'Home',  url: '/' },
      { name: 'Tools', url: '/tools' },
      { name: 'Symptom Checker', url: '/tools/symptom-checker' },
    ]),
  )
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Search className="w-3 h-3" /> Free tool
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Ayurvedic Symptom Checker</h1>
          <p className="text-white/85 mt-5">Match your symptoms to possible classical Ayurvedic conditions — then consult a verified Kerala doctor.</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="mb-6 p-4 rounded-card bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold mb-1">This is not a diagnosis.</p>
            <p>The checker suggests <em>possible</em> condition matches based on a symptom-keyword overlap, to help you find the right doctor. Always consult a qualified BAMS / MD-Ayurveda doctor for an actual diagnosis and personalised treatment.</p>
          </div>
        </div>
        <SymptomClient />
      </section>
    </>
  )
}
