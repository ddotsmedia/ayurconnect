import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Calculator, AlertCircle } from 'lucide-react'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../../lib/seo'
import { BmiClient } from './_client'

export const metadata: Metadata = pageMetadata({
  path:        '/tools/bmi-calculator',
  title:       'BMI Calculator with Ayurvedic Perspective',
  description: 'Free BMI calculator + Ayurvedic interpretation. Maps BMI category to dosha tendency, diet, and Kerala therapies. Educational, not diagnostic.',
  keywords:    ['bmi calculator', 'ayurvedic bmi', 'dosha bmi', 'kerala ayurveda weight'],
})

export default function BmiPage() {
  const ld = ldGraph(
    { '@context': 'https://schema.org', '@type': 'MedicalWebPage', name: 'BMI Calculator with Ayurvedic Perspective', url: 'https://ayurconnect.com/tools/bmi-calculator', about: { '@type': 'MedicalSpecialty', name: 'Ayurveda' } },
    breadcrumbLd([
      { name: 'Home',  url: '/' },
      { name: 'Tools', url: '/tools' },
      { name: 'BMI Calculator', url: '/tools/bmi-calculator' },
    ]),
  )
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Calculator className="w-3 h-3" /> Free tool
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">BMI Calculator</h1>
          <p className="text-white/85 mt-5">With an Ayurvedic interpretation — dosha tendencies, diet, and Kerala therapies for your BMI band.</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="mb-6 p-4 rounded-card bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold mb-1">Educational only — not a diagnosis.</p>
            <p>BMI is one of many health markers. The Ayurvedic guidance below is general; a verified BAMS / MD-Ayurveda doctor will tailor it to your prakriti, conditions, and goals.</p>
          </div>
        </div>
        <BmiClient />
      </section>
    </>
  )
}
