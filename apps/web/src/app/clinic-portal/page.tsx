import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { CheckCircle2, Users, Calendar, ClipboardList, Stethoscope, TrendingUp, ChevronRight } from 'lucide-react'
import { DemoRequestForm } from './_demo-request-form'

export const metadata: Metadata = {
  title: 'AyurConnect Clinic Portal — Ayurveda clinic SaaS for Kerala + UAE',
  description: 'Patient intake, treatment scheduling, OPD/IPD tracking, prescription writer, payouts. Built for Ayurveda clinics: classical fields (Prakriti, Nadi pariksha), modern UX.',
  alternates: { canonical: '/clinic-portal' },
}

const FEATURE_SECTIONS = [
  { icon: Users,          title: 'Patient intake', body: 'Classical Ayurveda fields built in — Prakriti, Vikriti, Nadi pariksha notes, Ashtavidha pariksha, doshic signs. Plus modern demographics. Quick scribe-mode for OPD speed.' },
  { icon: Calendar,       title: 'Smart scheduling', body: 'Doctor-and-room allocation in one drag. Auto-blocks Karkidaka peak season. Patient waitlist with WhatsApp notification when a slot opens.' },
  { icon: ClipboardList,  title: 'OPD + IPD tracking', body: 'Single-screen view of all admitted patients, treatment status, follow-up flags. IPD bed dashboard with discharge timeline.' },
  { icon: Stethoscope,    title: 'Prescription writer', body: 'Search the 1,000+ classical formulation library + your house formulas. Auto-flag herb–drug interactions. Print-ready Rx with QR for pharmacy verification.' },
  { icon: TrendingUp,     title: 'Performance dashboard', body: 'Doctor consultations / week, no-show rate, average revenue per patient, patient-satisfaction trend, repeat-patient ratio.' },
]

export default function ClinicPortalLanding() {
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            B2B SaaS for Ayurveda clinics
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">
            Run your Ayurveda clinic like it&apos;s 2026
          </h1>
          <p className="mt-5 text-lg text-white/80">
            Patient intake, treatment scheduling, OPD/IPD tracking, prescription writer, payouts.
            Built specifically for Ayurveda — classical Prakriti fields, Nadi pariksha notes,
            herb interaction warnings. Modern UX. Same monthly cost as one EMR seat.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <h2 className="font-serif text-2xl text-ink mb-6 text-center">What you get</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {FEATURE_SECTIONS.map((f) => (
            <article key={f.title} className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
              <f.icon className="w-6 h-6 text-kerala-700 mb-2" />
              <h3 className="font-serif text-lg text-ink">{f.title}</h3>
              <p className="text-sm text-gray-700 mt-1 leading-relaxed">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="demo" className="container mx-auto px-4 py-14 max-w-2xl">
        <h2 className="font-serif text-2xl text-ink mb-2 text-center">Request a demo</h2>
        <p className="text-sm text-muted text-center mb-6">
          15-minute call. We&apos;ll walk you through the dashboard with your own clinic&apos;s likely workflow + answer migration questions if you&apos;re switching from an existing EMR.
        </p>
        <DemoRequestForm />
        <div className="mt-8 text-center">
          <Link href="/clinic-portal/dashboard" className="text-sm text-kerala-700 hover:underline inline-flex items-center gap-1">
            See the demo dashboard <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </>
  )
}
