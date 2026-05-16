import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { Droplets, Wind, Flame, Leaf, Heart, ShieldCheck, MapPin } from 'lucide-react'
import { AYURVEDA_KEYWORDS } from '../../lib/seo'

const PROCEDURES = [
  {
    id: 'vamana',
    name: 'Vamana',
    sanskrit: 'वमन',
    icon: Wind,
    accent: 'text-orange-700 bg-orange-50',
    duration: '1 day (after 5-7 days prep)',
    summary: 'Therapeutic emesis — eliminates accumulated Kapha from the upper digestive tract.',
    indication: 'Asthma, chronic skin disorders, bronchitis, obesity, insulin resistance, depression with hypersomnia.',
    contraindication: 'Pregnancy, very young or very elderly, severe debility, diabetes, hypertension on multiple drugs.',
  },
  {
    id: 'virechana',
    name: 'Virechana',
    sanskrit: 'विरेचन',
    icon: Droplets,
    accent: 'text-amber-700 bg-amber-50',
    duration: '1 day (after 5-7 days prep)',
    summary: 'Therapeutic purgation — eliminates excess Pitta via the lower GI tract. The most flexibly applicable Panchakarma procedure.',
    indication: 'Psoriasis, chronic urticaria, jaundice, hepatitis, hyperacidity, gout, migraine.',
    contraindication: 'Acute fever, severe diarrhea, post-partum, post-major-surgery.',
  },
  {
    id: 'basti',
    name: 'Basti',
    sanskrit: 'बस्ति',
    icon: Heart,
    accent: 'text-emerald-700 bg-emerald-50',
    duration: '8, 16 or 30 days (Karma / Yoga / Kala basti)',
    summary: 'Medicated enema — the most powerful Vata-pacifying treatment. Two types: Niruha (decoction) and Anuvasana (oil).',
    indication: 'Sciatica, arthritis, paralysis, infertility, chronic constipation, neurological disorders, lower-back pain, ADHD.',
    contraindication: 'Acute fever, severe diarrhea, anal fissures (relative).',
  },
  {
    id: 'nasya',
    name: 'Nasya',
    sanskrit: 'नस्य',
    icon: Leaf,
    accent: 'text-teal-700 bg-teal-50',
    duration: '7-21 days (a few drops daily)',
    summary: 'Nasal administration of medicated oils or powders — clears the head, neck and shoulders region.',
    indication: 'Chronic sinusitis, migraine, frozen shoulder, hair fall, premature greying, mental fog, voice disorders.',
    contraindication: 'Pregnancy, very full or empty stomach, immediately after bath.',
  },
  {
    id: 'raktamokshana',
    name: 'Raktamokshana',
    sanskrit: 'रक्तमोक्षण',
    icon: Flame,
    accent: 'text-rose-700 bg-rose-50',
    duration: 'Single sitting, repeatable as needed',
    summary: 'Therapeutic bloodletting using leeches (Jalauka) or specialised vessels (Siravyadha). Reserved for stubborn vitiated-blood disorders.',
    indication: 'Severe psoriasis, chronic eczema, gout, varicose veins, abscesses, heel pain.',
    contraindication: 'Anaemia, pregnancy, bleeding disorders, very young or very elderly.',
  },
] as const

const PHASES = [
  { n: '1', t: 'Purvakarma (preparation)', d: '5-14 days. Snehana (oleation with medicated ghee internally + abhyanga externally) loosens vitiated doshas; Swedana (steam) liquefies them.' },
  { n: '2', t: 'Pradhanakarma (main procedure)', d: 'One of the five — Vamana, Virechana, Basti, Nasya, or Raktamokshana — chosen based on dosha imbalance and patient state.' },
  { n: '3', t: 'Paschatkarma (post-care)', d: 'Samsarjana Krama: graduated diet (Peya → Vilepi → Krita → Akrita Yusha) for 7-14 days to rebuild Agni. Lifestyle restrictions on activity, sleep, exposure.' },
] as const

export const metadata = {
  title: 'Panchakarma Treatment — Vamana, Virechana, Basti, Nasya | Kerala + UAE | AyurConnect',
  description: 'Authentic Panchakarma treatment guide — the 5 classical Ayurveda detox procedures (Vamana, Virechana, Basti, Nasya, Raktamokshana). Find verified Kerala Panchakarma centres and book panchakarma therapy online from UAE.',
  alternates: { canonical: '/panchakarma' },
  keywords: Array.from(new Set([
    'panchakarma', 'panchakarma treatment', 'panchakarma uae',
    'panchakarma in kerala', 'authentic kerala panchakarma',
    'panchakarma consultation online', 'book panchakarma therapy online',
    'classical panchakarma', 'panchakarma packages in kerala for foreigners',
    'panchakarma detox', 'ayurvedic detox', 'natural detox',
    'kerala ayurveda detox', 'panchakarma rejuvenation',
    'AyurConnect Panchakarma', 'AyurConnect Kerala', 'AyurConnect UAE',
    ...AYURVEDA_KEYWORDS.treatments,
    ...AYURVEDA_KEYWORDS.concepts,
    ...AYURVEDA_KEYWORDS.geographic.slice(0, 30),
    ...AYURVEDA_KEYWORDS.wellness.slice(0, 12),
    ...AYURVEDA_KEYWORDS.signals,
  ])),
}

export default function PanchakarmaPage() {
  return (
    <>
      <GradientHero variant="green" size="lg">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-5">
            🌿 Pancha karma — &ldquo;five actions&rdquo;
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Panchakarma <span className="text-gold-400">Treatment Guide</span>
          </h1>
          <p className="mt-5 text-lg text-white/80">
            The pinnacle of Ayurvedic detoxification — five classical procedures that
            eliminate vitiated doshas at the root, not just symptoms.
            Practised in Kerala for over 5,000 years; medicalised, supervised, and safe.
          </p>
        </div>
      </GradientHero>

      {/* What it is */}
      <section className="container mx-auto px-4 py-14 max-w-3xl">
        <h2 className="text-2xl md:text-3xl text-kerala-700 mb-4">What Panchakarma actually is</h2>
        <p className="text-gray-700 leading-relaxed">
          Panchakarma is not a wellness spa programme. It is a medical procedure described in
          <em> Charaka Samhita</em> and <em>Ashtanga Hridayam</em> for removing accumulated, vitiated
          doshas (metabolic toxins) from the body. The five actions — <em>vamana</em> (therapeutic
          emesis), <em>virechana</em> (purgation), <em>basti</em> (medicated enema), <em>nasya</em>
          (nasal administration), and <em>raktamokshana</em> (therapeutic bloodletting) — each target
          a specific tissue layer and dosha pattern.
        </p>
        <p className="text-gray-700 leading-relaxed mt-3">
          Done correctly, Panchakarma achieves what no symptomatic treatment can: it removes
          the underlying <em>nidana</em> (causative factor) of chronic disease. Done incorrectly
          — wrong patient, wrong season, untrained centre — it can cause significant harm.
          Always under supervision of a BAMS / MD doctor with hands-on Panchakarma training.
        </p>
      </section>

      {/* The 3 phases */}
      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl text-kerala-700 mb-2 text-center">The 3 phases of treatment</h2>
          <p className="text-center text-muted mb-10">Every Panchakarma protocol follows this sequence — never skip the prep or the post-care.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PHASES.map((p) => (
              <div key={p.n} className="p-6 bg-white rounded-card border border-gray-100 shadow-card">
                <div className="w-10 h-10 rounded-full bg-kerala-600 text-white font-serif text-xl flex items-center justify-center mb-3">{p.n}</div>
                <h3 className="font-semibold text-ink">{p.t}</h3>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The 5 procedures */}
      <section className="container mx-auto px-4 py-14">
        <h2 className="text-2xl md:text-3xl text-kerala-700 mb-2 text-center">The five procedures</h2>
        <p className="text-center text-muted mb-10">Click through to each — never self-prescribe; always under a doctor.</p>
        <div className="space-y-5">
          {PROCEDURES.map((p) => {
            const Icon = p.icon
            return (
              <article key={p.id} id={p.id} className="bg-white rounded-card border border-gray-100 shadow-card overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-0">
                  <div className={`flex items-center justify-center p-6 ${p.accent}`}>
                    <Icon className="w-10 h-10" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <div>
                        <h3 className="font-serif text-2xl text-kerala-700">{p.name}</h3>
                        <p className="text-sm text-gold-600 italic">{p.sanskrit}</p>
                      </div>
                      <span className="text-xs text-muted">Duration: {p.duration}</span>
                    </div>
                    <p className="text-gray-800 leading-relaxed">{p.summary}</p>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="p-3 bg-kerala-50 border border-kerala-100 rounded">
                        <div className="text-[11px] uppercase text-kerala-700 font-semibold mb-1">Indications</div>
                        <p className="text-gray-700">{p.indication}</p>
                      </div>
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded">
                        <div className="text-[11px] uppercase text-rose-700 font-semibold mb-1">Contraindications</div>
                        <p className="text-gray-700">{p.contraindication}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Choosing a centre */}
      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl text-kerala-700 mb-4 text-center">Choosing a Panchakarma centre</h2>
          <p className="text-gray-700 leading-relaxed text-center mb-8">
            Look for these three things — the rest is comfort.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-card border border-gray-100">
              <ShieldCheck className="w-6 h-6 text-kerala-700 mb-2" />
              <h3 className="font-semibold text-ink">verified consulting doctor</h3>
              <p className="text-sm text-gray-600 mt-1.5">Not just a therapist. A doctor with Panchakarma training (MD Panchakarma is the gold standard) must supervise every protocol.</p>
            </div>
            <div className="p-5 bg-white rounded-card border border-gray-100">
              <Leaf className="w-6 h-6 text-kerala-700 mb-2" />
              <h3 className="font-semibold text-ink">In-house pharmacy or vetted source</h3>
              <p className="text-sm text-gray-600 mt-1.5">The medicated oils and ghees are 70% of the treatment. Tourist spas use generic oils; classical centres make their own under GMP.</p>
            </div>
            <div className="p-5 bg-white rounded-card border border-gray-100">
              <MapPin className="w-6 h-6 text-kerala-700 mb-2" />
              <h3 className="font-semibold text-ink">AYUSH certification</h3>
              <p className="text-sm text-gray-600 mt-1.5">India&apos;s Ministry of AYUSH grades centres (Silver, Gold, Diamond). Look for at least Silver. NABH accreditation is even better.</p>
            </div>
          </div>
          <div className="mt-10 text-center space-x-3">
            <Link href="/hospitals?type=panchakarma" className="inline-block px-5 py-2 bg-kerala-600 text-white rounded-md font-semibold hover:bg-kerala-700">
              Browse Kerala Panchakarma centres →
            </Link>
            <Link href="/tourism" className="inline-block px-5 py-2 border-2 border-kerala-600 text-kerala-700 rounded-md font-semibold hover:bg-kerala-50">
              Tourism packages
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto p-5 rounded-card bg-amber-50 border border-amber-100 text-sm text-amber-900 leading-relaxed">
          <strong>Medical disclaimer:</strong> This page is educational. Panchakarma is a medical
          procedure with real contraindications. Always consult a qualified BAMS / MD Ayurveda
          doctor before starting any protocol. AyurConnect verifies CCIM registration of every
          listed practitioner — start with a video consult before booking a residential program.
        </div>
      </section>
    </>
  )
}
