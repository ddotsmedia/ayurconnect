import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronRight, Mail, TrendingUp, Globe2, Target, Shield, ShieldCheck, AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Investor Relations — AyurConnect',
  description: 'Why we exist, the market we serve, our position, and how serious investors can engage with AyurConnect.',
  alternates: { canonical: '/about/investors' },
}

const PILLARS = [
  {
    icon: Target,
    title: 'Verified directory + content moat',
    body: 'Every doctor cross-checked against CCIM register, every page reviewed by clinical advisors. We refuse paid placement. The result: the most trustworthy Ayurveda directory in India — a long-term moat that mass-market wellness platforms cannot replicate without rebuilding from scratch.',
  },
  {
    icon: Globe2,
    title: 'Two strong demand vectors',
    body: 'Domestic: 1.4 billion-strong market where Ayurveda is rapidly mainstreaming into preventive + chronic-disease care. International: $13B and growing global medical-tourism flow to India — Kerala is the gold-standard for classical Ayurvedic treatment, and AyurConnect is the trusted gateway.',
  },
  {
    icon: TrendingUp,
    title: 'Multi-product roadmap',
    body: 'Today: verified directory, AyurBot AI, Prakriti analyzer, treatment guides, lead pipeline. Next 18 months: full marketplace (vendor portal + e-commerce), white-label SaaS for hospital chains, Ayurveda-native HMS, Academy (BAMS + Panchakarma + CME courses). Each is a multi-year revenue line.',
  },
  {
    icon: Shield,
    title: 'Regulatory discipline',
    body: 'We engage proactively with AYUSH and CCIM. Compliance with Drugs & Magic Remedies Act, IT Rules 2021 intermediary safe-harbour, DPDP Act 2023 patient data protection. International expansion plan accounts for FDA / MHRA / Saudi FDA equivalents for any tools we ship into those markets.',
  },
]

const MARKET = [
  { label: 'Indian Ayurveda market (TAM)', value: '$10.2 B', note: '2024, growing 17% CAGR' },
  { label: 'Global medical tourism (India share)', value: '$13.4 B', note: 'Kerala captures ~30% of India-bound flows' },
  { label: 'Indian patients seeking AYUSH', value: '40%+', note: 'Of urban population, 2024 IBEF data' },
  { label: 'BAMS practitioners registered with CCIM', value: '500,000+', note: 'Across India' },
  { label: 'Kerala AYUSH-graded centres', value: '600+', note: 'AYUSH Premium/Silver/Gold/Diamond' },
]

export default function InvestorRelationsPage() {
  return (
    <>
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/about" className="text-sm text-white/70 hover:text-white inline-flex items-center gap-1 mb-4">
            <ChevronRight className="w-3 h-3 rotate-180" /> About
          </Link>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-5">
            <TrendingUp className="w-3 h-3" /> Investor Relations
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Building the trust layer for <span className="text-gold-400">Ayurveda</span>
          </h1>
          <p className="mt-5 text-lg text-white/80">
            For serious investors evaluating Indian healthcare-tech opportunities with international
            optionality. Below: our market read, position, and how to engage.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-14 max-w-4xl">
        <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-3">The investment thesis in one paragraph</h2>
        <p className="text-gray-700 leading-relaxed">
          Indian Ayurveda is mainstreaming — 40%+ of urban Indian patients now use AYUSH at least
          occasionally, the market grew at 17% CAGR through 2024, and international medical tourism
          to India is on track to cross $13B. Yet the consumer trust layer is broken: roadside
          &ldquo;Ayurveda spas&rdquo;, unverified practitioners, miracle-cure marketing, and zero
          accountability dominate the consumer-facing experience. AyurConnect is the verified
          directory + knowledge platform + AI tooling layer that solves this — and we are positioning
          to be the durable trust infrastructure on top of which marketplace, HMS, LMS, and
          white-label SaaS revenue lines scale.
        </p>
      </section>

      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-6 text-center">Market context</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MARKET.map((m) => (
              <div key={m.label} className="p-5 bg-white rounded-card border border-gray-100 shadow-sm">
                <div className="text-2xl md:text-3xl font-serif text-kerala-700">{m.value}</div>
                <div className="text-sm font-semibold text-gray-800 mt-1">{m.label}</div>
                <div className="text-xs text-gray-500 mt-1">{m.note}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 italic text-center mt-4">Source notes available on request. Market values referenced from IBEF, Ministry of AYUSH, and industry reports.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 max-w-4xl">
        <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-6">Our four moats</h2>
        <div className="space-y-4">
          {PILLARS.map((p) => (
            <article key={p.title} className="p-6 bg-white rounded-card border border-gray-100 shadow-card flex gap-5">
              <div className="w-12 h-12 rounded-full bg-kerala-50 text-kerala-700 ring-4 ring-kerala-100 flex items-center justify-center flex-shrink-0">
                <p.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-kerala-700">{p.title}</h3>
                <p className="text-gray-700 mt-2 leading-relaxed">{p.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-4">What we are NOT</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Investor due diligence is faster when expectations are set. AyurConnect is deliberately not:
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            {[
              { neg: 'A wellness-influencer content shop', why: 'We refuse paid placement and reject mass-market wellness positioning. The audience that comes to us comes for verification, not entertainment.' },
              { neg: 'An aggregator selling unverified practitioners', why: 'Every listed doctor\'s CCIM number is cross-checked annually. We de-list on disciplinary action within 48h.' },
              { neg: 'A pharma-distribution play', why: 'We connect patients to verified GMP-certified vendors but do not take title or inventory. Marketplace will operate on commission, not arbitrage.' },
              { neg: 'An IVF / chronic-care clinic', why: 'We are the trust + tooling + tooling-on-tooling layer. Hospitals deliver care; we route patients to them and equip them with software.' },
              { neg: 'A pure-marketing-channel play', why: 'Long-term value sits in tooling (HMS, SaaS, marketplace, Academy) where switching costs accrue. Directory + AI are the front door.' },
            ].map((s, i) => (
              <li key={i} className="p-3 bg-white rounded-md border border-gray-100">
                <div className="font-semibold text-rose-700">Not: {s.neg}</div>
                <div className="text-xs text-gray-600 mt-1">{s.why}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 max-w-3xl">
        <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-4">What we will + will not share at first contact</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-5 bg-white rounded-card border border-kerala-100">
            <div className="text-xs uppercase tracking-wider text-kerala-700 font-semibold flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Open</div>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <li>• Audited financials at appropriate stage</li>
              <li>• Verified-doctor + verified-hospital counts</li>
              <li>• Web platform metrics (sessions, conversion)</li>
              <li>• Regulatory positioning + compliance status</li>
              <li>• Product roadmap by quarter</li>
              <li>• Team CVs + advisory board details</li>
            </ul>
          </div>
          <div className="p-5 bg-white rounded-card border border-rose-100">
            <div className="text-xs uppercase tracking-wider text-rose-700 font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Held until NDA + due diligence</div>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <li>• Patient-level data (DPDP Act protected)</li>
              <li>• Doctor commercial agreements</li>
              <li>• Pilot-partner contractual specifics</li>
              <li>• Proprietary clinical advisory feedback loops</li>
              <li>• Engineering-architecture deep-dive</li>
              <li>• Acquisition target conversations</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-kerala-700 py-14 text-white">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Mail className="w-12 h-12 text-gold-400 mx-auto mb-4" />
          <h2 className="font-serif text-2xl md:text-3xl">Engage</h2>
          <p className="mt-3 text-white/85">
            Serious investor inquiries: <a href="mailto:investors@ayurconnect.com" className="text-gold-300 hover:text-white">investors@ayurconnect.com</a>. Please include your fund / family-office name, stage focus, cheque size band, and 1–2 portfolio comparables.
          </p>
          <Link href="/contact" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-md font-semibold">
            Contact form (general) <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="p-5 rounded-card bg-amber-50 border border-amber-100 text-sm text-amber-900 leading-relaxed flex gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Note:</strong> This page is a public investor primer, not an offering. AyurConnect
            is not currently soliciting general investment. Formal due diligence + offering materials
            (if and when issued) will be shared privately under NDA per SEBI / SEC equivalents in
            relevant jurisdictions.
          </p>
        </div>
      </section>
    </>
  )
}
