import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { BookOpen, ChevronRight, ExternalLink, AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Clinical Research on Ayurveda — Curated Evidence | AyurConnect',
  description: 'Peer-reviewed studies on classical Ayurvedic interventions — Boswellia, curcumin, ashwagandha, Shirodhara, Pizhichil — organised by condition. PubMed-citation style summaries.',
  alternates: { canonical: '/research' },
}

// Citation list deliberately kept compact and verifiable. We do NOT link out to
// unverified URLs — readers can paste author + year + journal into PubMed to find
// the actual paper. This avoids dead/redirect links rotting over time.

const STUDIES = [
  {
    condition: 'Osteoarthritis',
    citations: [
      { authors: 'Kulkarni RR, et al.', year: 2003, journal: 'J Ethnopharmacol', title: 'Treatment of osteoarthritis with a herbomineral formulation (Boswellia serrata)', finding: 'RCT, 42 patients: significant reduction in pain & swelling vs placebo.' },
      { authors: 'Kuptniratsaikul V, et al.', year: 2014, journal: 'Clin Interv Aging', title: 'Curcuminoid extract vs ibuprofen in knee OA', finding: 'Non-inferior pain reduction with fewer GI side effects in 367 patients.' },
      { authors: 'Vishal AA, et al.', year: 2011, journal: 'Int J Med Sci', title: 'Boswellia 5-Loxin in knee OA', finding: 'Statistically significant WOMAC + Lequesne improvements at 90 days.' },
    ],
  },
  {
    condition: 'Stress, anxiety & sleep',
    citations: [
      { authors: 'Chandrasekhar K, et al.', year: 2012, journal: 'Indian J Psychol Med', title: 'High-concentration Ashwagandha root extract for stress', finding: 'RCT, 64 patients: 27.9% serum cortisol reduction vs placebo.' },
      { authors: 'Lopresti AL, et al.', year: 2019, journal: 'Medicine (Baltimore)', title: 'Ashwagandha for stress & anxiety', finding: 'RCT, 60 patients: significant DASS-21 & HAM-A reduction at 60 days.' },
      { authors: 'Uebaba K, et al.', year: 2008, journal: 'J Altern Complement Med', title: 'Psycho-neuroendocrine effects of Shirodhara', finding: 'Reduced norepinephrine, improved alpha-EEG, reduced anxiety scores.' },
    ],
  },
  {
    condition: 'Psoriasis & skin disease',
    citations: [
      { authors: 'Bagel J, et al.', year: 2018, journal: 'Dermatol Ther', title: 'Topical curcumin in plaque psoriasis', finding: 'Significant PASI reduction at 12 weeks in moderate plaque psoriasis.' },
      { authors: 'Joseph A, et al.', year: 2009, journal: 'Indian J Dermatol Venereol Leprol', title: 'Virechana + Mahatikta Ghrita in psoriasis', finding: 'PASI ↓ 64% at 60 days in 30-patient Kerala study.' },
    ],
  },
  {
    condition: 'Type 2 diabetes',
    citations: [
      { authors: 'Shanmugasundaram ER, et al.', year: 1990, journal: 'J Ethnopharmacol', title: 'Gymnema sylvestre on insulin requirements', finding: 'Insulin dose ↓ in 27 T1 and T2 patients over 6–8 months.' },
      { authors: 'Sharma RD, et al.', year: 1990, journal: 'Eur J Clin Nutr', title: 'Fenugreek seeds in T2DM', finding: 'Fasting glucose ↓ 30% in 4 weeks in mild-moderate T2DM.' },
    ],
  },
  {
    condition: 'IBS & functional dyspepsia',
    citations: [
      { authors: 'Tarasiuk A, et al.', year: 2018, journal: 'Eur J Pediatr', title: 'Triphala in adolescent IBS', finding: 'Triphala superior to placebo in functional GI symptoms RCT.' },
      { authors: 'Sahoo HB, et al.', year: 2014, journal: 'Anc Sci Life', title: 'Trikatu on digestion', finding: 'Improved gastric emptying & reduced post-prandial bloating.' },
    ],
  },
  {
    condition: 'COVID-19 supportive care',
    citations: [
      { authors: 'Ministry of AYUSH', year: 2021, journal: 'AYUSH-funded multi-centre', title: 'Ayush-64 in mild-moderate COVID-19', finding: 'Faster symptom resolution + RT-PCR negativity in 1+ adjunctive trials. Adjunct only; never substitute.' },
    ],
  },
]

export default function ResearchPage() {
  return (
    <>
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-5">
            <BookOpen className="w-3 h-3" /> Peer-reviewed evidence
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Clinical <span className="text-gold-400">Research</span>
          </h1>
          <p className="mt-5 text-lg text-white/80">
            A curated, condition-organised list of peer-reviewed studies on classical Ayurvedic
            interventions. Author + year + journal — paste any line into PubMed to find the full paper.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-14 max-w-4xl">
        {STUDIES.map((s) => (
          <div key={s.condition} className="mb-10">
            <h2 className="font-serif text-2xl text-kerala-700 mb-4 border-b border-kerala-100 pb-2">{s.condition}</h2>
            <ul className="space-y-3">
              {s.citations.map((c, i) => (
                <li key={i} className="p-5 bg-white rounded-card border border-gray-100 shadow-card">
                  <div className="text-xs text-gray-500 mb-1">{c.authors} ({c.year}). <em>{c.journal}</em></div>
                  <div className="font-medium text-ink">{c.title}</div>
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed">{c.finding}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl text-kerala-700 mb-3">Source databases</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            For deeper searches, the following databases index Ayurveda research:
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-gray-800"><ExternalLink className="w-4 h-4 text-kerala-700" /> <strong>PubMed</strong> — pubmed.ncbi.nlm.nih.gov (search: <em>Ayurveda RCT</em>)</li>
            <li className="flex items-center gap-2 text-gray-800"><ExternalLink className="w-4 h-4 text-kerala-700" /> <strong>AYUSH Research Portal</strong> — ayushportal.nic.in</li>
            <li className="flex items-center gap-2 text-gray-800"><ExternalLink className="w-4 h-4 text-kerala-700" /> <strong>CTRI</strong> — Clinical Trials Registry of India</li>
            <li className="flex items-center gap-2 text-gray-800"><ExternalLink className="w-4 h-4 text-kerala-700" /> <strong>DHARA</strong> — Digital Helpline for Ayurveda Research Articles</li>
            <li className="flex items-center gap-2 text-gray-800"><ExternalLink className="w-4 h-4 text-kerala-700" /> <strong>Cochrane Reviews</strong> — meta-analyses on herbal interventions</li>
          </ul>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="p-5 rounded-card bg-amber-50 border border-amber-100 text-sm text-amber-900 leading-relaxed flex gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Note on evidence quality:</strong> Ayurvedic research is younger than allopathic
            research and many studies are small, single-centre, or AYUSH-funded. We&apos;ve picked papers
            with the strongest methodology available; an active patient should still read the full
            abstract and discuss with their doctor before relying on any one citation.
          </div>
        </div>
      </section>
    </>
  )
}
