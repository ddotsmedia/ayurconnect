import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { ShieldCheck, ChevronRight, FileSearch, Eye, RefreshCw, AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Our Methodology — How AyurConnect Verifies Doctors & Sources Content',
  description: 'How we verify CCIM registration, source content from classical texts, handle medical claims, and accept (or reject) doctor / hospital listings.',
  alternates: { canonical: '/about/methodology' },
}

const STEPS = [
  {
    n: '1',
    icon: FileSearch,
    title: 'Identity & registration',
    detail: 'Every practitioner who applies provides CCIM registration number, BAMS / MD certificate, and a government ID. We cross-check the registration against the public Central Council of Indian Medicine register at ccim.gov.in. No registration → no listing. No exceptions.',
  },
  {
    n: '2',
    icon: Eye,
    title: 'Manual review',
    detail: 'An advisory clinician reviews the doctor\'s qualification claims, specialisation, and (where applicable) hospital affiliation. Pending profiles sit in a private queue — patients see "pending verification" status until cleared.',
  },
  {
    n: '3',
    icon: ShieldCheck,
    title: 'Public listing',
    detail: 'Approved profiles get a CCIM-verified badge with the registration number visible on the public profile. Patients can independently re-verify on ccim.gov.in via a deep link.',
  },
  {
    n: '4',
    icon: RefreshCw,
    title: 'Annual re-verification',
    detail: 'Every CCIM registration is re-checked annually. Practitioners whose registration lapses or who face disciplinary action are de-listed within 48h of detection. Re-instatement requires fresh documentation.',
  },
]

const CONTENT_PRINCIPLES = [
  {
    title: 'Classical first',
    body: 'Every treatment, herb, and procedure page cites the original Sanskrit source — Charaka Samhita (CS), Sushruta Samhita (SS), Ashtanga Hridayam (AH), Bhavaprakasha (BP). Inline citations look like (CS Sutra 14.4).',
  },
  {
    title: 'Modern evidence cross-check',
    body: 'Where peer-reviewed RCT or systematic-review data exists (e.g. curcumin in OA, Shirodhara on cortisol, ashwagandha on stress markers), we cite PubMed / JAMA / BMJ. Where it doesn\'t, we say so honestly.',
  },
  {
    title: 'No miracle claims',
    body: 'We will not publish "cure for diabetes" / "alternative to chemo" / "reverses autism" / "Ayurveda for cancer cure" content. The Drugs & Magic Remedies Act exists for good reason and we apply it strictly.',
  },
  {
    title: 'No paid placements',
    body: 'Doctors and hospitals cannot pay to be listed higher, featured on the homepage, or appear in "top doctor" rankings. Rankings come from CCIM seniority, patient reviews, and update frequency only.',
  },
  {
    title: 'Reader-flagged corrections',
    body: 'Every page has a "report inaccuracy" link. Reports go to the clinical advisory queue — corrections typically ship within 7 days, with a public changelog at /about/methodology#changelog.',
  },
]

export default function MethodologyPage() {
  return (
    <>
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/about" className="text-sm text-white/70 hover:text-white inline-flex items-center gap-1 mb-4">
            <ChevronRight className="w-3 h-3 rotate-180" /> About
          </Link>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Our <span className="text-gold-400">Methodology</span>
          </h1>
          <p className="mt-5 text-lg text-white/80">
            How we verify practitioners, source content, and handle medical claims.
            Transparency is the only competitive moat that matters in healthcare directories.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-14 max-w-4xl">
        <h2 className="text-2xl md:text-3xl text-kerala-700 mb-6 text-center">Doctor & hospital verification</h2>
        <div className="space-y-4">
          {STEPS.map((s) => (
            <article key={s.n} className="p-6 bg-white rounded-card border border-gray-100 shadow-card flex gap-5">
              <div className="w-12 h-12 rounded-full bg-kerala-600 text-white font-serif text-2xl flex items-center justify-center flex-shrink-0">{s.n}</div>
              <div>
                <div className="flex items-center gap-2">
                  <s.icon className="w-4 h-4 text-kerala-700" />
                  <h3 className="font-serif text-xl text-kerala-700">{s.title}</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mt-2">{s.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl text-kerala-700 mb-6 text-center">Content principles</h2>
          <div className="space-y-4">
            {CONTENT_PRINCIPLES.map((p) => (
              <div key={p.title} className="p-5 bg-white rounded-card border border-gray-100">
                <h3 className="font-serif text-lg text-kerala-700">{p.title}</h3>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 max-w-3xl">
        <div className="p-6 rounded-card bg-amber-50 border border-amber-100 text-sm text-amber-900 leading-relaxed flex gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong>What we don&apos;t do:</strong> AyurConnect is not a hospital, a clinic, or a prescribing
            service. We do not provide medical advice, dispense medicines, or take a cut of consultation
            fees. We are a verified directory + knowledge platform. If a listed doctor causes harm, the
            doctor — not AyurConnect — is liable under Indian medical negligence law. We do, however, take
            de-listing on credible complaint extremely seriously.
          </div>
        </div>
      </section>
    </>
  )
}
