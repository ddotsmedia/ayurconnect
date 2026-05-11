import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronRight, Atom, Leaf, AlertCircle, ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Why Ayurveda Works (and Where It Doesn\'t) | AyurConnect',
  description: 'A rigorous, non-romantic look at what Ayurveda is, where the modern evidence supports it, and where it should never substitute conventional medicine.',
  alternates: { canonical: '/about/why-ayurveda-works' },
}

const STRONG_EVIDENCE = [
  {
    cond: 'Knee osteoarthritis',
    detail: 'Boswellia (Shallaki) extracts have RCT evidence comparable to celecoxib for pain reduction without GI side effects. Curcumin has multiple meta-analyses supporting NSAID-equivalent efficacy. Pizhichil + Janu-Basti show large clinical effect sizes in Kerala studies.',
  },
  {
    cond: 'Chronic stress & GAD',
    detail: 'Shirodhara has been shown to reduce serum cortisol, lower beat-to-beat heart rate variability indicators of stress, and improve PSQI sleep scores. Ashwagandha is among the most-studied adaptogens — multiple double-blind RCTs show reduced cortisol and improved DASS-21 anxiety scores.',
  },
  {
    cond: 'Plaque psoriasis',
    detail: 'Mahatikta Ghrita + Virechana protocol shows PASI score reductions of 60–80% in published Indian studies. Topical curcumin and neem also have modern RCT support. Useful as combined or stand-alone therapy in mild-to-moderate psoriasis.',
  },
  {
    cond: 'Functional dyspepsia / IBS',
    detail: 'Triphala, Trikatu, and bitter-aromatic herbs improve gastric motility and reduce visceral hypersensitivity. AYUSH-funded RCTs at AIIA show effect sizes comparable to first-line gastroenterology drugs in functional GI disorders.',
  },
  {
    cond: 'Type 2 diabetes (early)',
    detail: 'Lifestyle + Gymnema (Madhunashini), bitter gourd, and fenugreek show meaningful HbA1c reduction in early disease. Not a substitute for insulin in established T1DM. Strong synergy with metformin in T2DM.',
  },
  {
    cond: 'Mild-to-moderate depression',
    detail: 'Brahmi (Bacopa) and Ashwagandha have growing RCT evidence as adjuncts. Yoga + pranayama have stronger evidence than most supplements. Shirodhara shows promise in early-stage post-partum depression.',
  },
]

const WEAK_OR_NO_EVIDENCE = [
  {
    cond: 'Cancer (any stage)',
    detail: 'Ayurveda has supportive / palliative value (managing chemo side effects, fatigue, anorexia) but is NOT a substitute for surgery, radiation, or chemotherapy. Any practitioner claiming otherwise should be reported to AYUSH and CCIM.',
  },
  {
    cond: 'Autism, ADHD',
    detail: 'No replicable evidence for "Ayurvedic cure." Some adjunctive value of Brahmi / Saraswata Churna in concentration; not a therapy substitute. Ignore practitioners promising "reversal".',
  },
  {
    cond: 'Acute infections (severe)',
    detail: 'Sepsis, severe pneumonia, meningitis, severe COVID-19 — antibiotics / antivirals and conventional ICU care first. Ayurveda useful in post-recovery rehab.',
  },
  {
    cond: 'Type 1 diabetes',
    detail: 'Insulin-dependent. Lifelong. Ayurvedic complementary therapy can reduce insulin units modestly, but never replace.',
  },
  {
    cond: 'Genuine surgical emergencies',
    detail: 'Acute abdomen, fractures, ectopic pregnancy, MI, stroke — call 108. Sushruta was a surgeon; he would have called modern surgeons too.',
  },
]

const MECHANISMS = [
  {
    icon: Atom,
    title: 'Polyherbal pharmacology',
    body: 'Most classical formulations contain 4–30 herbs. Modern pharmacology now confirms multi-target action — anti-inflammatory + adaptogenic + microbiome-modulating + bioavailability-enhancing — that single-molecule drugs rarely match. The classical concept of Yogavahi (synergistic potentiation) has molecular correlates.',
  },
  {
    icon: Leaf,
    title: 'Lifestyle as primary intervention',
    body: 'Ayurveda treats Ahara (diet), Vihara (lifestyle), and Manasika (mental practice) as three of four therapeutic pillars — equal to Aushadhi (medicine). Modern evidence on diet, sleep, exercise, and stress mirrors this exactly. Most chronic disease responds disproportionately to lifestyle correction; Ayurveda has codified this for 2,000 years.',
  },
  {
    icon: ShieldCheck,
    title: 'Personalised dosha-based prescribing',
    body: 'Prakriti analysis — the classical Vata/Pitta/Kapha typing — has begun to find modern correlates in pharmacogenomics, gut microbiome composition, and circadian endocrine patterns. Whether or not the classical theory is "correct" in modern terms, the practice of individualising treatment routinely outperforms one-size-fits-all approaches.',
  },
]

export default function WhyItWorksPage() {
  return (
    <>
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/about" className="text-sm text-white/70 hover:text-white inline-flex items-center gap-1 mb-4">
            <ChevronRight className="w-3 h-3 rotate-180" /> About
          </Link>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Why Ayurveda <span className="text-gold-400">Works</span>
          </h1>
          <p className="mt-5 text-lg text-white/80">
            A non-romantic look at where the modern evidence backs classical practice — and where it
            doesn&apos;t. Read this before paying for any treatment, ours or anyone else&apos;s.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-14 max-w-4xl">
        <h2 className="text-2xl md:text-3xl text-kerala-700 mb-6">Three mechanisms that hold up under scrutiny</h2>
        <div className="space-y-4">
          {MECHANISMS.map((m) => (
            <article key={m.title} className="p-6 bg-white rounded-card border border-gray-100 shadow-card flex gap-5">
              <div className="w-12 h-12 rounded-full bg-kerala-50 text-kerala-700 ring-4 ring-kerala-100 flex items-center justify-center flex-shrink-0">
                <m.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-kerala-700">{m.title}</h3>
                <p className="text-gray-700 leading-relaxed mt-2">{m.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-kerala-50 py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl text-kerala-700 mb-3">Where evidence is strong</h2>
          <p className="text-gray-700 mb-6">Conditions where modern RCT data and classical practice converge.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {STRONG_EVIDENCE.map((e) => (
              <div key={e.cond} className="p-5 bg-white rounded-card border border-kerala-100 shadow-sm">
                <h3 className="font-serif text-lg text-kerala-700">{e.cond}</h3>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{e.detail}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/research" className="inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-600 hover:bg-kerala-700 text-white rounded-md font-semibold">
              Browse clinical research <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-rose-50 py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl text-rose-800 mb-3 flex items-center gap-2">
            <AlertCircle className="w-7 h-7" /> Where evidence is weak or absent
          </h2>
          <p className="text-gray-700 mb-6">Conditions where Ayurveda should NEVER be substituted for conventional medicine. Beware anyone selling otherwise.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {WEAK_OR_NO_EVIDENCE.map((e) => (
              <div key={e.cond} className="p-5 bg-white rounded-card border border-rose-200 shadow-sm">
                <h3 className="font-serif text-lg text-rose-800">{e.cond}</h3>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{e.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 max-w-3xl text-center">
        <h2 className="text-2xl md:text-3xl text-kerala-700 mb-3">The honest summary</h2>
        <p className="text-gray-700 leading-relaxed">
          Ayurveda, practised by a qualified BAMS / MD doctor in a regulated centre, is excellent at
          chronic disease, mental health, dermatology, and lifestyle-driven metabolic disorders.
          It is a complement to — not a replacement for — modern medicine in acute, infectious,
          oncological, and surgical care. AyurConnect&apos;s job is to help you find good practitioners
          for the first category and to keep you from being misled about the second.
        </p>
      </section>
    </>
  )
}
