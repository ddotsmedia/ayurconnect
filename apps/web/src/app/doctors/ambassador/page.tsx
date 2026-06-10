import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { Award, Sparkles, Users, BookOpen, ShieldCheck, ChevronRight, Gift } from 'lucide-react'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../../lib/seo'

export const metadata = pageMetadata({
  path:        '/doctors/ambassador',
  title:       'AyurConnect Doctor Ambassador Program — 12 Months Free Premium Profile',
  description: 'Become an AyurConnect Doctor Ambassador. Free 12-month premium profile, featured badge, referral rewards, published-author profile. For verified Kerala-trained doctors anywhere.',
})

const BENEFITS = [
  { icon: Award,       title: 'Free premium profile for 12 months',  body: 'Featured badge, priority listing in directory + location pages, top-of-search placement for your specialty.' },
  { icon: Sparkles,    title: 'Free profile setup assistance',       body: 'Our editorial team helps craft your bio (English + Malayalam), curates your treatments + lineage block, optimises photos.' },
  { icon: Users,       title: 'Online consultation platform access', body: 'Daily.co-backed video room, prescription writer with 1,000-formulation library, Razorpay payments. Zero setup cost.' },
  { icon: Gift,        title: 'Referral rewards',                    body: 'For every doctor you bring, BOTH get 3 months extra premium added to your subscription. Stackable.' },
  { icon: BookOpen,    title: 'Published-author profile',            body: 'Write reviewed articles under your byline. Builds authority + drives long-tail SEO to your profile.' },
  { icon: ShieldCheck, title: 'AMAI Member badge',                   body: 'Are you an AMAI member? Get the verified AMAI Member badge displayed on your profile + search cards.' },
]

const STEPS = [
  { n: 1, title: 'Register',          body: 'Fill the doctor self-registration form — Kerala roots, KSMC reg, specialties, languages. Takes 5 minutes.' },
  { n: 2, title: 'Get verified',      body: 'Our admin reviews your credentials against the KSMC register + uploaded certificates. Typically 48 hours.' },
  { n: 3, title: 'Invite colleagues', body: 'Share your invite link via WhatsApp or email — every doctor you bring earns you 3 months extra premium.' },
  { n: 4, title: 'Earn rewards',      body: 'Track referrals in your dashboard. Featured-listing credits, premium-listing extensions, published-author bylines accumulate.' },
]

export default function AmbassadorPage() {
  const ld = ldGraph(breadcrumbLd([
    { name: 'Home',                url: '/' },
    { name: 'Doctors',             url: '/doctors' },
    { name: 'Ambassador Program',  url: '/doctors/ambassador' },
  ]))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Award className="w-3 h-3" /> Ambassador program
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">Become an AyurConnect Doctor Ambassador</h1>
          <p className="text-white/85 mt-5">Help build Kerala&apos;s most comprehensive Ayurveda directory. 12 months free premium profile, referral rewards, published-author byline.</p>
          <Link href="/doctors/register?ref=ambassador" className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-white text-kerala-800 hover:bg-white/90 rounded text-base font-semibold">
            Apply now <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <h2 className="font-serif text-2xl md:text-3xl text-ink mb-6 text-center">What you get</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENEFITS.map((b) => (
            <article key={b.title} className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
              <b.icon className="w-6 h-6 text-kerala-700 mb-2" />
              <h3 className="font-serif text-lg text-ink">{b.title}</h3>
              <p className="text-sm text-gray-700 mt-1 leading-relaxed">{b.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-serif text-2xl md:text-3xl text-ink mb-8 text-center">How it works</h2>
          <ol className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {STEPS.map((s) => (
              <li key={s.n} className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
                <div className="w-9 h-9 bg-kerala-700 text-white rounded-full flex items-center justify-center font-bold mb-3">{s.n}</div>
                <h3 className="font-serif text-base text-ink leading-tight">{s.title}</h3>
                <p className="text-xs text-gray-700 mt-2 leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 max-w-2xl text-center">
        <div className="bg-gradient-to-br from-kerala-50 via-white to-amber-50 border border-kerala-100 rounded-card p-6 md:p-8 shadow-card">
          <h2 className="font-serif text-2xl text-ink">Ready to join?</h2>
          <p className="text-sm text-gray-700 mt-2">Verified Kerala-trained BAMS / MD-Ayurveda doctors, practising anywhere in the world — Kerala, Gulf, UK, US, Europe, APAC.</p>
          <Link href="/doctors/register?ref=ambassador" className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">
            Apply for Ambassador status <ChevronRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-xs text-gray-500">Free profile setup · 12-month premium credit on approval · referral rewards stack</p>
        </div>
      </section>
    </>
  )
}
