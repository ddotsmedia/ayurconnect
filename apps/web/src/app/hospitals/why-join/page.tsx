import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Building2, ShieldCheck, MessageCircle, Globe2, Star, BarChart3, Megaphone, Stethoscope, Package, Search, Sparkles, ArrowRight, CheckCircle2, Plane } from 'lucide-react'
import { pageMetadata } from '../../../lib/seo'

export const metadata: Metadata = pageMetadata({
  path:        '/hospitals/why-join',
  title:       'List Your Ayurveda Hospital — Free Registration',
  description: 'Free professional profile, patient inquiries to your dashboard, WhatsApp integration, verification badges, analytics, marketing tools. Built for Kerala-tradition Ayurveda hospitals.',
  keywords:    ['list ayurveda hospital free', 'ayurveda hospital directory', 'register panchakarma centre', 'kerala ayurveda listing', 'attract international patients'],
})

const BENEFITS = [
  { icon: Building2,    title: 'Free professional profile page',          d: 'Your own webpage on AyurConnect — photos, doctors, packages, reviews. No setup fee.' },
  { icon: Search,       title: 'Google-indexed listing',                  d: 'Patients searching "ayurveda hospital in [district]" find you.' },
  { icon: MessageCircle, title: 'Patient inquiries to your dashboard',    d: 'Every interest form lands in your inbox + dashboard. Reply via WhatsApp or email in one click.' },
  { icon: ShieldCheck,  title: 'Verification badges',                     d: 'NABH, AYUSH, Tourism-Classified, CCIM — admin-verified badges build patient trust.' },
  { icon: Stethoscope,  title: 'Doctor team showcase',                    d: 'Link your physicians, designate the chief, display credentials.' },
  { icon: Package,      title: 'Treatment package listings',              d: 'Showcase Karkidaka, Panchakarma, rejuvenation packages with duration + pricing.' },
  { icon: Star,         title: 'Patient reviews + responses',             d: 'Display ratings, respond to feedback. Reply publicly to address concerns.' },
  { icon: BarChart3,    title: 'Profile analytics',                       d: 'See who is viewing your profile, where inquiries come from, conversion rates.' },
  { icon: Megaphone,    title: 'Marketing tools',                         d: 'QR code, embed widget, seasonal promotions, WhatsApp + social sharing.' },
  { icon: Plane,        title: 'International patient leads',             d: 'Heal-in-Kerala hub routes diaspora + medical-tourism leads to verified centres.' },
  { icon: Globe2,       title: 'AyurConnect WhatsApp community',          d: 'Featured listings reach our 120K+ Ayurveda-focused WhatsApp community.' },
  { icon: Sparkles,     title: 'No hidden fees',                          d: 'Free tier covers everything above. Premium placement available on request.' },
]

const STEPS = [
  { n: 1, title: 'Register free',         d: 'Multi-step onboarding (10 minutes). Add basic info + photos + treatments.' },
  { n: 2, title: 'Complete your profile', d: 'Packages, doctor team, operating hours, accreditation.' },
  { n: 3, title: 'Get verified',          d: 'Admin reviews submitted credentials (5–7 business days).' },
  { n: 4, title: 'Receive inquiries',     d: 'Patients find you, send inquiries, you reply via WhatsApp or email.' },
]

const FAQS = [
  { q: 'Is there a setup fee or contract?',
    a: 'No setup fee. No contract. The free tier covers profile + inquiries + reviews + analytics. Premium placement is opt-in.' },
  { q: 'What kinds of centres are eligible?',
    a: 'Any registered Ayurveda hospital, clinic, Panchakarma centre, wellness resort, or research institute with at least one BAMS-qualified physician.' },
  { q: 'How long does verification take?',
    a: '5–7 business days after submitting hospital registration, senior physician CCIM/AYUSH credentials, and at least one site photograph.' },
  { q: 'Where do the patient leads come from?',
    a: 'Organic search (we rank for "ayurveda hospital in [city]"), the /heal-in-kerala international hub, /panchakarma directory, AyurConnect AI doctor-match, and our 120K+ WhatsApp community.' },
  { q: 'Can we accept international / GCC patients?',
    a: 'Yes. Once verified, your packages list on /heal-in-kerala by country. Inquiries route to your dashboard with the patient&apos;s country + preferred dates.' },
  { q: 'Can we change to / from premium later?',
    a: 'Free → premium is instant. Premium → free is anytime, no penalty.' },
]

export default function WhyJoinPage() {
  return (
    <>
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Building2 className="w-3 h-3" /> Free registration · 5–7 day verification
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">List Your Hospital on Kerala&apos;s Most Trusted Ayurveda Directory</h1>
          <p className="text-white/85 mt-4 text-lg max-w-2xl mx-auto">Free professional profile, patient inquiries delivered directly to your dashboard, verification badges that build patient trust.</p>
          <Link href="/hospitals/register" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white text-kerala-800 font-bold rounded-md hover:bg-white/90">
            Register Your Hospital — Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </GradientHero>

      {/* Stats strip */}
      <section className="bg-gradient-to-r from-kerala-50 via-cream to-amber-50 border-y border-kerala-100">
        <div className="container mx-auto px-4 py-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-serif text-2xl md:text-3xl text-kerala-700">500+</p>
            <p className="text-xs text-gray-700">verified Kerala doctors</p>
          </div>
          <div>
            <p className="font-serif text-2xl md:text-3xl text-kerala-700">15+</p>
            <p className="text-xs text-gray-700">international markets</p>
          </div>
          <div>
            <p className="font-serif text-2xl md:text-3xl text-kerala-700">120K+</p>
            <p className="text-xs text-gray-700">WhatsApp community</p>
          </div>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-serif text-3xl text-ink text-center">Why hospitals choose AyurConnect</h2>
        <p className="text-sm text-gray-600 text-center mt-2 max-w-2xl mx-auto">Built specifically for Kerala-tradition Ayurveda hospitals — not a generic listing platform.</p>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENEFITS.map((b) => {
            const Icon = b.icon
            return (
              <article key={b.title} className="bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg transition-shadow">
                <Icon className="w-8 h-8 text-kerala-700" />
                <h3 className="font-semibold text-ink mt-3">{b.title}</h3>
                <p className="text-sm text-gray-700 mt-1">{b.d}</p>
              </article>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-kerala-50 border-y border-kerala-100">
        <div className="container mx-auto px-4 py-16">
          <h2 className="font-serif text-3xl text-ink text-center">How it works</h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-4">
            {STEPS.map((s) => (
              <article key={s.n} className="bg-white border border-kerala-200 rounded-card p-5 text-center shadow-card">
                <div className="w-10 h-10 mx-auto rounded-full bg-kerala-700 text-white font-bold flex items-center justify-center">{s.n}</div>
                <h3 className="font-semibold text-ink mt-3">{s.title}</h3>
                <p className="text-xs text-gray-700 mt-1">{s.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-serif text-3xl text-ink text-center">What hospital owners say</h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { q: 'Inquiries from Gulf-region patients tripled within 3 months of listing. The WhatsApp integration is what closes the loop.',  by: 'Director · 38-bed Panchakarma centre, Ernakulam' },
            { q: 'The verification badges actually mean something here. Patients trust AyurConnect — and that trust extends to listed hospitals.', by: 'Owner · classical Ayurveda clinic, Thrissur' },
            { q: 'We replaced our two listing-portal subscriptions with AyurConnect alone. Better profile, better leads, no monthly fee.',      by: 'Administrator · wellness resort, Kovalam' },
          ].map((t) => (
            <article key={t.by} className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <p className="text-sm text-gray-800 italic mt-2">&ldquo;{t.q}&rdquo;</p>
              <p className="text-xs text-gray-500 mt-3">— {t.by}</p>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-cream border-y border-gray-100">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <h2 className="font-serif text-3xl text-ink text-center">Frequently asked</h2>
          <div className="mt-8 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
                <summary className="font-semibold text-ink cursor-pointer">{f.q}</summary>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
        <h2 className="font-serif text-3xl text-ink mt-3">Ready to grow your hospital?</h2>
        <p className="text-sm text-gray-700 mt-2 max-w-xl mx-auto">Free registration. 5–7 day verification. No setup fee, no contract.</p>
        <Link href="/hospitals/register" className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-kerala-700 hover:bg-kerala-800 text-white font-bold rounded-md">
          Register Your Hospital — Free <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </>
  )
}
