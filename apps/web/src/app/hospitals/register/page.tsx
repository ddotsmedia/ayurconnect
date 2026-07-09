import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { ShieldCheck, Building2 } from 'lucide-react'
import { pageMetadata } from '../../../lib/seo'
import { RegisterClient } from './_client'

export const metadata: Metadata = pageMetadata({
  path:        '/hospitals/register',
  title:       'List Your Ayurveda Hospital — Free Registration',
  description: 'Register your Ayurveda hospital, clinic, Panchakarma centre, or wellness resort on AyurConnect. Free professional profile, patient inquiries, verification badges.',
  keywords:    ['list ayurveda hospital', 'register ayurveda clinic', 'panchakarma centre registration', 'kerala hospital directory'],
})

export default function HospitalRegisterMultiStep() {
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Building2 className="w-3 h-3" /> Hospital / Clinic registration · Free
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">List Your Hospital on Kerala&apos;s Most Trusted Ayurveda Directory</h1>
          <p className="text-white/85 mt-3 max-w-2xl mx-auto">Free professional profile. Patient inquiries delivered to your dashboard. WhatsApp integration. Verification badges that build patient trust.</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-6 text-sm text-amber-900 flex gap-2">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>Listings start in <strong>pending</strong> state. An admin verifies AYUSH/CCIM credentials before they appear publicly. You can edit anytime.</div>
        </div>
        <RegisterClient />
      </section>
    </>
  )
}
