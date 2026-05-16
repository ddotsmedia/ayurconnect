import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { ShieldCheck, Users, BookOpen, Stethoscope, Globe, Award, ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'About AyurConnect — Kerala\'s Verified Ayurveda Platform',
  description: 'Why AyurConnect exists, who we are, how we vet practitioners, and our position on what Ayurveda can and cannot do. Built in Kerala, trusted globally.',
  alternates: { canonical: '/about' },
}

const VALUES = [
  { icon: ShieldCheck, title: 'verification first', detail: 'Every listed doctor\'s CCIM registration is checked against the public Central Council of Indian Medicine register before listing — no exceptions, no paid promotions.' },
  { icon: BookOpen,    title: 'Classical, not commercial', detail: 'Our content cites Charaka, Sushruta, Ashtanga Hridayam — not unsourced wellness marketing. Where modern evidence supports or contradicts a claim, we say so.' },
  { icon: Stethoscope, title: 'Integrative, not isolationist', detail: 'Ayurveda complements modern medicine. We never recommend stopping prescription medication; our doctors coordinate with your existing care team.' },
  { icon: Globe,       title: 'Built for Kerala, written for the world', detail: 'Bilingual ML/EN content, international phone codes, ISO-2 country picker, cost transparency in INR for diaspora and medical-tourism patients.' },
]

const SUB_PAGES = [
  { href: '/about/leadership',         title: 'Leadership',           desc: 'The team behind AyurConnect — clinical, engineering, and policy advisors.' },
  { href: '/about/methodology',        title: 'Our Methodology',      desc: 'How we vet doctors, source content, and handle medical claims.' },
  { href: '/about/why-ayurveda-works', title: 'Why Ayurveda Works',   desc: 'The classical theory, the modern evidence, and our honest position on what it can and cannot do.' },
  { href: '/about/certifications',     title: 'Certifications & Trust', desc: 'CCIM, AYUSH, NABH — how India regulates Ayurveda and how we verify it.' },
  { href: '/research',                 title: 'Clinical Research',    desc: 'Peer-reviewed studies on classical Ayurvedic interventions, organised by condition.' },
]

export default function AboutPage() {
  return (
    <>
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-5">
            🌿 About AyurConnect
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Built in <span className="text-gold-400">Kerala</span>, trusted globally
          </h1>
          <p className="mt-5 text-lg text-white/80">
            AyurConnect is the verified directory + knowledge platform for Ayurvedic medicine in Kerala —
            connecting patients with verified doctors, classical Panchakarma centres, and
            evidence-informed treatment guidance. No paid placements, no health-influencer marketing.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-14 max-w-4xl">
        <h2 className="text-2xl md:text-3xl text-kerala-700 mb-5">Why this platform exists</h2>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Kerala has been the global home of classical Ayurveda for over 2,000 years. It also has more
            unverified roadside &ldquo;Ayurveda spas&rdquo; than any state in India. Foreign patients regularly land
            in Kochi expecting Vaidyaratnam Mooss-grade treatment and end up at a tourist massage parlour.
            Domestic patients waste months on social-media-recommended &ldquo;wellness coaches&rdquo; while their
            arthritis or PCOS worsens.
          </p>
          <p>
            AyurConnect was built to fix that — by giving patients a way to find practitioners who are
            verified, by publishing classical content cross-checked against modern evidence,
            and by being explicit about what Ayurveda is excellent at (chronic joint disease, Panchakarma,
            mental health, dermatology) and what it should not be substituted for (emergency surgery,
            insulin-dependent diabetes, late-stage cancer chemo).
          </p>
        </div>

        <h2 className="text-2xl md:text-3xl text-kerala-700 mb-5 mt-12">Our four working principles</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {VALUES.map((v) => (
            <div key={v.title} className="p-6 bg-white rounded-card border border-gray-100 shadow-card">
              <v.icon className="w-6 h-6 text-kerala-700 mb-3" />
              <h3 className="font-serif text-xl text-kerala-700">{v.title}</h3>
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">{v.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl text-kerala-700 mb-6 text-center">More about us</h2>
          <div className="space-y-3">
            {SUB_PAGES.map((p) => (
              <Link key={p.href} href={p.href} className="group flex items-center justify-between p-5 bg-white rounded-card border border-gray-100 hover:border-kerala-300 transition-colors">
                <div>
                  <h3 className="font-serif text-lg text-kerala-700">{p.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{p.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-kerala-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 max-w-3xl text-center">
        <Award className="w-12 h-12 text-gold-500 mx-auto mb-4" />
        <h2 className="text-2xl md:text-3xl text-kerala-700 mb-3">Talk to us</h2>
        <p className="text-gray-700 leading-relaxed mb-6">
          Partnership inquiries, doctor / hospital listings, press, investor relations, or feedback on
          the platform — we read every message.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-kerala-600 hover:bg-kerala-700 text-white rounded-md font-semibold">
            Contact us
          </Link>
          <Link href="/partnership" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-kerala-600 text-kerala-700 hover:bg-kerala-50 rounded-md font-semibold">
            <Users className="w-4 h-4" /> Partnership
          </Link>
        </div>
      </section>
    </>
  )
}
