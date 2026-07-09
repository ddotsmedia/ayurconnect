import type { Metadata } from 'next'
import { QuickRefClient } from './_client'

export const metadata: Metadata = {
  title: 'Quick Reference — Herbs, Formulations, Conditions',
  description: 'Instant Ayurveda clinical reference: 145+ herbs, classical formulations, condition guides. Search by name, indication, dosha. Built for doctors.',
  alternates: { canonical: '/quick-reference' },
  keywords: ['ayurveda quick reference', 'ayurveda herb lookup', 'classical formulation dosage', 'ayurveda clinical reference'],
}

export default function QuickReferencePage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="font-serif text-2xl text-kerala-800 mb-1">Quick Reference</h1>
      <p className="text-sm text-gray-600 mb-5">Instant lookup for herbs, formulations, and conditions. <span className="text-gray-500">No login required.</span></p>
      <QuickRefClient />
    </div>
  )
}
