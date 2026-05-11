import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronRight, BookOpen, Stethoscope, Code, Scale } from 'lucide-react'

export const metadata = {
  title: 'Leadership & Advisory — AyurConnect',
  description: 'The clinical, engineering, and policy advisors behind AyurConnect — the team that verifies practitioners and curates classical content.',
  alternates: { canonical: '/about/leadership' },
}

const TEAM = [
  {
    role: 'Founder & Platform Lead',
    name: 'AyurConnect Team',
    bio: 'Built the verification pipeline, content review process, and bilingual delivery. Background in healthcare technology with deep familial roots in Kerala\'s classical Ayurveda tradition.',
    icon: Code,
  },
  {
    role: 'Clinical Advisory Board',
    name: '12-member panel — BAMS, MD (Panchakarma), MD (Kayachikitsa)',
    bio: 'Practising senior consultants from Govt Ayurveda College Trivandrum, Kottakkal Arya Vaidya Sala, Vaidyaratnam, AVP Coimbatore, and AVT Kannur. Review every treatment landing page and flag content for accuracy.',
    icon: Stethoscope,
  },
  {
    role: 'Content & Sanskrit Editorial',
    name: 'Pandit-Vaidya editors',
    bio: 'Cross-check classical citations against Charaka Samhita, Sushruta Samhita, Ashtanga Hridayam, and Bhavaprakasha. Ensure Sanskrit terms are transliterated correctly and translated faithfully.',
    icon: BookOpen,
  },
  {
    role: 'Policy & Compliance',
    name: 'External advisors',
    bio: 'AYUSH ministry liaison for regulatory updates; legal counsel on the Drugs & Magic Remedies Act, IT Rules 2021 (intermediary liability), and DPDP Act 2023 (data protection).',
    icon: Scale,
  },
]

export default function LeadershipPage() {
  return (
    <>
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/about" className="text-sm text-white/70 hover:text-white inline-flex items-center gap-1 mb-4">
            <ChevronRight className="w-3 h-3 rotate-180" /> About
          </Link>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Leadership <span className="text-gold-400">& Advisory</span>
          </h1>
          <p className="mt-5 text-lg text-white/80">
            The team that vets practitioners, curates classical content, and keeps the platform
            accountable. Smaller than you&apos;d expect, more rigorous than you&apos;d hope.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-14 max-w-4xl">
        <div className="space-y-5">
          {TEAM.map((m) => (
            <article key={m.role} className="p-6 bg-white rounded-card border border-gray-100 shadow-card flex gap-5">
              <div className="w-14 h-14 rounded-full bg-kerala-50 text-kerala-700 ring-4 ring-kerala-100 flex items-center justify-center flex-shrink-0">
                <m.icon className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-gold-600 font-semibold">{m.role}</div>
                <h2 className="font-serif text-xl text-kerala-700 mt-1">{m.name}</h2>
                <p className="text-gray-700 leading-relaxed mt-2">{m.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl text-kerala-700 mb-3">Want to join the advisory?</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            We rotate clinical advisors annually. If you&apos;re a practising BAMS / MD (Panchakarma) /
            MD (Kayachikitsa) senior consultant in Kerala with 15+ years of clinical experience,
            we&apos;d love to hear from you.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-600 hover:bg-kerala-700 text-white rounded-md font-semibold">
            Contact us
          </Link>
        </div>
      </section>
    </>
  )
}
