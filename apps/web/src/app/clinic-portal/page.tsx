import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { CheckCircle2, Users, Calendar, ClipboardList, Stethoscope, TrendingUp, ChevronRight } from 'lucide-react'
import { DemoRequestForm } from './_demo-request-form'

export const metadata: Metadata = {
  title: 'AyurConnect Clinic Portal — Ayurveda clinic SaaS for Kerala + UAE',
  description: 'Patient intake, treatment scheduling, OPD/IPD tracking, prescription writer, payouts. Built for Ayurveda clinics: classical fields (Prakriti, Nadi pariksha), modern UX. AED 299/mo and up.',
  alternates: { canonical: '/clinic-portal' },
}

const TIERS = [
  {
    name: 'Basic',     price: 299, badge: null,
    summary: 'Solo doctor / small clinic up to 100 patients/mo.',
    features: [
      'Patient intake with Prakriti + Nadi fields', 'Treatment scheduling (single doctor)',
      'OPD tracker', 'Online prescription writer', 'Daily.co video consult (50min/day)',
      'WhatsApp appointment reminders', 'Razorpay payments',
    ],
  },
  {
    name: 'Pro',       price: 499, badge: 'Most popular',
    summary: '2–10 doctor clinic. Multi-doctor scheduling.',
    features: [
      'Everything in Basic',
      'Multi-doctor schedule + room allocation', 'OPD + IPD tracker', 'Bed allotment dashboard',
      'Inventory + classical pharmacy module', 'CME credit tracking for staff',
      'Custom reports + monthly performance reviews',
    ],
  },
  {
    name: 'Enterprise', price: 799, badge: 'Hospitals',
    summary: '10+ doctor hospital. Multi-branch, advanced reporting.',
    features: [
      'Everything in Pro',
      'Multi-branch / multi-city architecture', 'Insurance integration (Niva Bupa / Star + GCC)',
      'NABH-compliance reporting templates', 'Govt. AYUSH reporting templates',
      'Dedicated success manager', 'Priority support + SLA', '99.9% uptime guarantee',
    ],
  },
]

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

      <section id="pricing" className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-serif text-2xl text-ink mb-2 text-center">Pricing</h2>
          <p className="text-sm text-muted text-center mb-8">Billed monthly in AED. 30-day money-back if you don&apos;t love it. Indian rupee pricing on request.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TIERS.map((t) => (
              <article key={t.name} className={'bg-white border rounded-card p-6 shadow-card ' + (t.badge === 'Most popular' ? 'border-kerala-700 ring-1 ring-kerala-700/10' : 'border-gray-100')}>
                {t.badge && (
                  <span className={'text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold inline-block mb-2 ' + (t.badge === 'Most popular' ? 'bg-kerala-700 text-white' : 'bg-gray-100 text-gray-700')}>
                    {t.badge}
                  </span>
                )}
                <h3 className="font-serif text-2xl text-ink">{t.name}</h3>
                <p className="text-xs text-muted mt-1">{t.summary}</p>
                <p className="mt-4">
                  <span className="text-3xl font-serif text-kerala-700">AED {t.price}</span>
                  <span className="text-sm text-muted"> / month</span>
                </p>
                <ul className="mt-5 space-y-2 text-sm text-gray-700">
                  {t.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-kerala-700 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="#demo" className="mt-6 block w-full text-center px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">
                  Request demo
                </Link>
              </article>
            ))}
          </div>
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
