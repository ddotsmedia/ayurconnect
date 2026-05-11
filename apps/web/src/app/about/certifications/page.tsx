import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronRight, ShieldCheck, Award, Building2, Stethoscope, AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Certifications & Trust — CCIM, AYUSH, NABH | AyurConnect',
  description: 'How India regulates Ayurvedic doctors and hospitals — CCIM, AYUSH, NABH explained — and how AyurConnect verifies every listing against the public registers.',
  alternates: { canonical: '/about/certifications' },
}

const REGS = [
  {
    badge: 'CCIM',
    full: 'Central Council of Indian Medicine',
    icon: Stethoscope,
    accent: 'text-kerala-700 bg-kerala-50',
    summary: 'India\'s statutory body regulating individual Ayurvedic, Siddha, and Unani practitioners. Every BAMS / MD (Ayurveda) graduate must register with CCIM (or now NCISM — see below) to practise legally.',
    detail: [
      'Registration number prefixed by state (e.g. KER-AYU-12345 for Kerala) is mandatory.',
      'Public register: ccim.gov.in/registers — anyone can verify a practitioner.',
      'CCIM became NCISM (National Commission for Indian System of Medicine) in 2020 under NCISM Act 2020 — both names appear interchangeably; same statutory function.',
      'Disciplinary actions are also published — disbarred / suspended doctors are flagged here within 48h.',
    ],
  },
  {
    badge: 'AYUSH',
    full: 'Ministry of AYUSH, Government of India',
    icon: Award,
    accent: 'text-gold-700 bg-gold-50',
    summary: 'Central government ministry overseeing Ayurveda, Yoga, Unani, Siddha, and Homeopathy. Issues centre certifications, regulates medicines, and grades wellness facilities.',
    detail: [
      'AYUSH Premium / Silver / Gold / Diamond centre grading — voluntary but credible signal of quality.',
      'AYUSH Mark on classical medicines = GMP-compliant manufacturer (Kottakkal, Vaidyaratnam, AVP, AVT, Vasudeva Vilasam, Oushadhi, etc.).',
      'AYUSH Heal-in-India and Ayush Visa programmes for medical-tourism patients.',
      'AYUSH GRID — central digital health platform integrating practitioner registers, pharmacy registers, and patient records.',
    ],
  },
  {
    badge: 'NABH',
    full: 'National Accreditation Board for Hospitals',
    icon: Building2,
    accent: 'text-blue-700 bg-blue-50',
    summary: 'Independent quality accreditation body. NABH-AYUSH is the dedicated stream for Ayurvedic hospitals and Panchakarma centres. The most rigorous, voluntary certification a centre can pursue.',
    detail: [
      'NABH-AYUSH covers: clinical care, infection control, medication management, patient rights, infrastructure safety.',
      'Re-accreditation every 3 years — surprise audits between cycles.',
      'NABH-accredited centres feature on AyurConnect with a separate badge — fewer than 60 in all of Kerala have it.',
      'NABH ≠ legal requirement (CCIM registration is). NABH = quality signal above legal minimum.',
    ],
  },
]

const HOW_WE_VERIFY = [
  { step: 'Doctor sign-up provides CCIM / NCISM registration number + ID',     icon: ShieldCheck },
  { step: 'Manual cross-check against ccim.gov.in public register',             icon: ShieldCheck },
  { step: 'Profile flagged "pending" until cleared by clinical advisor',        icon: ShieldCheck },
  { step: 'CCIM badge + registration number publicly visible on profile',       icon: ShieldCheck },
  { step: 'Annual re-verification + 48h de-listing on disciplinary actions',    icon: ShieldCheck },
]

export default function CertificationsPage() {
  return (
    <>
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/about" className="text-sm text-white/70 hover:text-white inline-flex items-center gap-1 mb-4">
            <ChevronRight className="w-3 h-3 rotate-180" /> About
          </Link>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Certifications <span className="text-gold-400">& Trust</span>
          </h1>
          <p className="mt-5 text-lg text-white/80">
            How India regulates Ayurveda — and how AyurConnect verifies every listing against the
            public registers. If you don&apos;t recognise these three acronyms, this page is for you.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-14">
        <div className="max-w-5xl mx-auto space-y-6">
          {REGS.map((r) => (
            <article key={r.badge} className="bg-white rounded-card border border-gray-100 shadow-card overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-0">
                <div className={`flex flex-col items-center justify-center p-6 ${r.accent}`}>
                  <r.icon className="w-10 h-10" />
                  <span className="text-lg font-bold mt-2">{r.badge}</span>
                </div>
                <div className="p-6">
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">{r.full}</div>
                  <p className="text-gray-800 leading-relaxed">{r.summary}</p>
                  <ul className="mt-4 space-y-2">
                    {r.detail.map((d) => (
                      <li key={d} className="text-sm text-gray-700 flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-gold-600 mt-1 flex-shrink-0" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl text-kerala-700 mb-6 text-center">How we verify, in 5 steps</h2>
          <ol className="space-y-3">
            {HOW_WE_VERIFY.map((h, i) => (
              <li key={h.step} className="flex items-center gap-4 p-4 bg-white rounded-card border border-gray-100">
                <span className="w-9 h-9 rounded-full bg-kerala-600 text-white font-serif text-lg flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <span className="text-gray-800">{h.step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 max-w-3xl">
        <div className="p-6 rounded-card bg-amber-50 border border-amber-100 text-sm text-amber-900 leading-relaxed flex gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Beware these red flags:</strong> A practitioner who refuses to share their CCIM number;
            a centre with no AYUSH grading or visible certification; medicines without manufacturer name
            or batch number; &ldquo;100% cure guarantee&rdquo; claims; aggressive sales pressure; cash-only payment
            without invoice. Any of these → walk away.
          </div>
        </div>
      </section>
    </>
  )
}
