import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { Crown, Check, Sparkles, Stethoscope, FileText, MessageCircle, Activity, Users, ShieldCheck } from 'lucide-react'
import { WellnessInterestForm } from './_interest-form'

export const metadata = {
  title: 'Wellness Subscription Plans — Premium AyurConnect',
  description: 'Continuous Ayurvedic care: unlimited AyurBot, monthly doctor consultations, personalized vitals monitoring, family plans. Early-bird pricing for founding members.',
  alternates: { canonical: '/wellness-plans' },
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    pitch: 'Browse, learn, and try AyurBot.',
    price: '₹0',
    period: 'forever',
    badge: null,
    cta: { label: 'Already on this plan', href: null },
    features: [
      'Doctor directory + reviews',
      'AyurBot — 10 messages/day',
      'Prakriti quiz + result',
      'Single health journal',
      'Forum read access',
    ],
    excluded: [
      'Family health profiles',
      'Vitals tracking',
      'Prescription history',
    ],
  },
  {
    id: 'wellness',
    name: 'Wellness',
    pitch: 'For ongoing self-care with Ayurveda.',
    price: '₹299',
    period: '/month',
    badge: 'Most popular',
    cta: { label: 'Express interest', href: '#interest' },
    features: [
      'Unlimited AyurBot conversations',
      'Personalized diet plans (4/month)',
      'Vitals tracking + 30-day analytics',
      'Health journal + AI weekly summary',
      'Priority support',
    ],
    excluded: [
      'Family member profiles',
      'Doctor consultations',
    ],
  },
  {
    id: 'family',
    name: 'Family Care',
    pitch: 'One subscription. Up to 6 family members.',
    price: '₹599',
    period: '/month',
    badge: null,
    cta: { label: 'Express interest', href: '#interest' },
    features: [
      'Everything in Wellness',
      'Up to 6 family member profiles',
      'Separate vitals + diet per member',
      'Coordinated AI insights across family',
      '1 free video consult / month',
      'WhatsApp health alerts',
    ],
    excluded: [],
  },
  {
    id: 'concierge',
    name: 'Concierge',
    pitch: 'Premium continuous care with a dedicated CCIM doctor.',
    price: '₹2,499',
    period: '/month',
    badge: 'White-glove',
    cta: { label: 'Express interest', href: '#interest' },
    features: [
      'Everything in Family Care',
      'Dedicated CCIM-verified doctor',
      '4 video consults / month',
      'Remote vitals monitoring',
      'Custom Panchakarma planning',
      'Annual deep-dive case review',
    ],
    excluded: [],
  },
]

export default function WellnessPlansPage() {
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Crown className="w-3 h-3" /> Continuous Ayurvedic care
          </span>
          <h1 className="text-3xl md:text-5xl text-white">Wellness Plans</h1>
          <p className="text-white/70 mt-3">
            Free plan is forever-free. Paid plans add unlimited AyurBot, vitals analytics,
            family profiles, and dedicated CCIM doctors.
          </p>
          <p className="text-white/60 text-sm mt-2 italic">
            Pricing is indicative — paid plans roll out after we gather enough interest.
            Founding members get 50% off the first year.
          </p>
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((p) => {
            const isHighlight = p.badge === 'Most popular'
            return (
              <div
                key={p.id}
                className={
                  'relative bg-white rounded-card border p-6 flex flex-col ' +
                  (isHighlight ? 'border-kerala-600 shadow-cardLg ring-2 ring-kerala-100' : 'border-gray-100 shadow-card')
                }
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-kerala-700 text-white text-[10px] font-semibold uppercase tracking-wider rounded-full">
                    {p.badge}
                  </span>
                )}
                <h2 className="font-serif text-2xl text-kerala-800">{p.name}</h2>
                <p className="text-sm text-muted mt-1 min-h-[2.5rem]">{p.pitch}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-serif text-4xl text-ink">{p.price}</span>
                  <span className="text-xs text-gray-500">{p.period}</span>
                </div>
                <ul className="mt-4 space-y-1.5 text-sm flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-kerala-700 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{f}</span>
                    </li>
                  ))}
                  {p.excluded.map((e) => (
                    <li key={e} className="flex items-start gap-2 text-gray-400">
                      <span className="w-4 h-4 flex-shrink-0 text-center text-xs leading-tight mt-0.5">—</span>
                      <span className="line-through">{e}</span>
                    </li>
                  ))}
                </ul>
                {p.cta.href ? (
                  <Link
                    href={p.cta.href}
                    className={
                      'mt-5 inline-flex items-center justify-center px-4 py-2.5 rounded-md text-sm font-semibold ' +
                      (isHighlight
                        ? 'bg-kerala-700 hover:bg-kerala-800 text-white'
                        : 'border border-kerala-600 text-kerala-700 hover:bg-kerala-50')
                    }
                  >
                    {p.cta.label}
                  </Link>
                ) : (
                  <button disabled className="mt-5 inline-flex items-center justify-center px-4 py-2.5 rounded-md text-sm bg-gray-100 text-gray-500 cursor-not-allowed">
                    {p.cta.label}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Why subscribe — feature spotlight strip */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: MessageCircle, title: 'Unlimited AyurBot', desc: 'Free tier is capped at 10 messages/day. Paid plans remove the limit and personalize answers to your Prakriti and recent journal.' },
            { icon: Activity,      title: 'Vitals + Analytics', desc: 'Track BP, glucose, sleep, weight, HRV. 30-day trends and AI weekly summaries delivered to your inbox.' },
            { icon: Users,         title: 'Family profiles',    desc: 'One subscription covers spouse, parents, kids. Each gets their own Prakriti, conditions, and recommendations.' },
            { icon: FileText,      title: 'Prescription history', desc: 'Every Rx from every doctor in one structured timeline. Print or save PDF anytime.' },
            { icon: Stethoscope,   title: 'Doctor consultations', desc: 'Concierge plan includes 4 video consults/month with a dedicated CCIM-verified doctor.' },
            { icon: ShieldCheck,   title: 'CCIM-verified network', desc: 'Every doctor on the paid plans is cross-checked against the Central Council of Indian Medicine register.' },
          ].map((f, i) => {
            const Icon = f.icon
            return (
              <div key={i} className="bg-white border border-gray-100 rounded-card p-5">
                <Icon className="w-6 h-6 text-kerala-700 mb-3" />
                <h3 className="font-serif text-lg text-ink mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </section>

        <section id="interest" className="mt-16 max-w-2xl mx-auto bg-kerala-50 border border-kerala-100 rounded-card p-6">
          <div className="text-center mb-4">
            <Sparkles className="w-8 h-8 text-kerala-700 mx-auto" />
            <h2 className="font-serif text-2xl text-kerala-900 mt-2">Founding-member interest</h2>
            <p className="text-sm text-kerala-800 mt-1">
              Drop your email and pick the plan you&apos;d like. Founding members get 50% off the first year when paid plans launch.
            </p>
          </div>
          <WellnessInterestForm />
        </section>
      </div>
    </>
  )
}
