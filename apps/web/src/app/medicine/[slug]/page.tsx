import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ChevronRight, Stethoscope, AlertTriangle, Check, BookOpen, ArrowRight } from 'lucide-react'
import { CATEGORIES, MEDICINES, type Medicine } from '../../learn/medicines/_data'
import { breadcrumbLd, ldGraph } from '@/lib/seo'

export function generateStaticParams() {
  return MEDICINES.map((m) => ({ slug: m.id }))
}

// Best-effort mapping from free-text indication → existing /conditions/[slug].
// Keys are lower-cased substrings tested against each indication string.
const CONDITION_MAP: Array<{ needles: string[]; slug: string }> = [
  { needles: ['pcos'], slug: 'pcos' },
  { needles: ['arthritis', 'amavata', 'sandhivata', 'rheumatoid'], slug: 'arthritis' },
  { needles: ['diabetes', 'prameha', 'madhumeha'], slug: 'diabetes' },
  { needles: ['back pain', 'sciatica', 'gridhrasi', 'low back'], slug: 'back-pain' },
  { needles: ['ibs', 'grahani', 'malabsorption', 'irritable bowel'], slug: 'ibs' },
  { needles: ['anxiety', 'stress'], slug: 'anxiety' },
  { needles: ['psoriasis'], slug: 'psoriasis' },
  { needles: ['migraine', 'shirashula'], slug: 'migraine' },
  { needles: ['obesity', 'medoroga', 'weight', 'weight loss'], slug: 'weight-loss' },
  { needles: ['thyroid', 'hypothyroid'], slug: 'thyroid' },
  { needles: ['hair fall', 'hair loss', 'greying', 'khalitya'], slug: 'hair-fall' },
  { needles: ['insomnia', 'anidra', 'sleep'], slug: 'insomnia' },
  { needles: ['skin disease', 'kushtha', 'dermatitis', 'eczema', 'urticaria', 'kandu', 'itching'], slug: 'skin-diseases' },
  { needles: ['fatty liver', 'liver'], slug: 'fatty-liver' },
  { needles: ['infertility'], slug: 'infertility' },
  { needles: ['asthma', 'shwasa', 'kasa-shwasa', 'bronchial'], slug: 'asthma' },
]

function indicationToConditionSlug(indication: string): string | null {
  const s = indication.toLowerCase()
  for (const { needles, slug } of CONDITION_MAP) {
    if (needles.some((n) => s.includes(n))) return slug
  }
  return null
}

function findMedicine(slug: string): Medicine | null {
  return MEDICINES.find((m) => m.id === slug) ?? null
}

function categoryFor(catSlug: string) {
  return CATEGORIES.find((c) => c.slug === catSlug)
}

const CATEGORY_TONE: Record<string, string> = {
  kashayam:         'bg-kerala-100 text-kerala-800 border-kerala-200',
  'arishtam-asavam':'bg-amber-100 text-amber-800 border-amber-200',
  churnam:          'bg-emerald-100 text-emerald-800 border-emerald-200',
  'gulika-vati':    'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  lehyam:           'bg-rose-100 text-rose-800 border-rose-200',
  tailam:           'bg-blue-100 text-blue-800 border-blue-200',
  ghritam:          'bg-yellow-100 text-yellow-800 border-yellow-200',
  guggulu:          'bg-slate-200 text-slate-800 border-slate-300',
  bhasmam:          'bg-purple-100 text-purple-800 border-purple-200',
  rasaushadhi:      'bg-teal-100 text-teal-800 border-teal-200',
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const m = findMedicine(slug)
  if (!m) return { title: 'Medicine not found' }
  const topIndications = m.indications.slice(0, 3).join(', ')
  return {
    title: `${m.name} (${m.nameMl}) — Uses, Dosage, Ingredients`,
    description: `${m.name} — ${topIndications}. Ingredients, dosage, contraindications. Classical Ayurvedic medicine reference.`,
    alternates: {
      canonical: `/medicine/${m.id}`,
      languages: { 'en-IN': `/medicine/${m.id}`, 'ml-IN': `/medicine/${m.id}` },
    },
    keywords: [m.name, m.nameMl, ...m.indications.slice(0, 3), 'Ayurvedic medicine', 'classical formulation'],
    openGraph: {
      title: `${m.name} — ${m.nameMl}`,
      description: `${m.name} — ${topIndications}. Uses, dosage, ingredients from classical Ayurveda.`,
      url: `/medicine/${m.id}`,
      type: 'article',
    },
    other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
  }
}

export default async function MedicinePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const m = findMedicine(slug)
  if (!m) notFound()
  const cat = categoryFor(m.category)
  if (!cat) notFound()

  // Related — up to 4 from same category, excluding self.
  const related = MEDICINES.filter((x) => x.category === m.category && x.id !== m.id).slice(0, 4)
  const tone = CATEGORY_TONE[m.category] ?? CATEGORY_TONE.churnam

  const faqs = [
    { q: `What is ${m.name} used for?`, a: `${m.name} is used for ${m.indications.join(', ')}. It is a ${cat.name} classical Ayurvedic formulation.` },
    { q: `What is the dosage of ${m.name}?`, a: `${m.dosage}. Take with ${m.anupana}.` },
    { q: `Who should avoid ${m.name}?`, a: m.contraindications },
  ]

  const jsonLd = ldGraph(
    breadcrumbLd([
      { name: 'Home',       url: 'https://ayurconnect.com' },
      { name: 'Learn',      url: 'https://ayurconnect.com/learn' },
      { name: 'Medicines',  url: 'https://ayurconnect.com/learn/medicines' },
      { name: cat.name,     url: `https://ayurconnect.com/learn/medicines/${cat.slug}` },
      { name: m.name,       url: `https://ayurconnect.com/medicine/${m.id}` },
    ]),
    {
      '@type': 'MedicalWebPage',
      name: m.name,
      description: m.description,
      inLanguage: ['en', 'ml'],
      url: `https://ayurconnect.com/medicine/${m.id}`,
      about: {
        '@type': 'Drug',
        name: m.name,
        alternateName: [m.nameMl, m.nameSanskrit].filter(Boolean),
        activeIngredient: m.ingredients.join(', '),
        administrationRoute: 'oral',
        dosageForm: cat.name,
        indication: m.indications.join('; '),
      },
      audience: { '@type': 'MedicalAudience', audienceType: 'Patient' },
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '[data-speakable]'] },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header */}
      <section className="bg-hero-green text-white py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <nav className="text-xs text-white/70 mb-3 flex flex-wrap items-center gap-1">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3 h-3 opacity-60" />
            <Link href="/learn" className="hover:text-white">Learn</Link>
            <ChevronRight className="w-3 h-3 opacity-60" />
            <Link href="/learn/medicines" className="hover:text-white">Medicines</Link>
            <ChevronRight className="w-3 h-3 opacity-60" />
            <Link href={`/learn/medicines/${cat.slug}`} className="hover:text-white">{cat.name}</Link>
            <ChevronRight className="w-3 h-3 opacity-60" />
            <span className="text-white">{m.name}</span>
          </nav>

          <Link
            href={`/learn/medicines/${cat.slug}`}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded border ${tone} hover:opacity-90`}
          >
            <span aria-hidden>{cat.icon}</span> {cat.name}
          </Link>

          <h1 className="mt-3 font-serif text-3xl md:text-5xl text-white leading-tight">{m.name}</h1>
          <h2 className="mt-1 font-serif text-lg md:text-xl text-gold-200">
            <span lang="ml">{m.nameMl}</span>
            {m.nameSanskrit && m.nameSanskrit !== m.name && (
              <span className="text-white/70"> · {m.nameSanskrit}</span>
            )}
          </h2>

          <p className="mt-4 text-white/90 max-w-2xl leading-relaxed" data-speakable>{m.description}</p>
        </div>
      </section>

      <article className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Card 1 — Ingredients */}
        <section className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
          <h3 className="font-serif text-xl text-kerala-800 flex items-baseline gap-2">
            Key Ingredients
            <span className="text-sm text-gray-500" lang="ml">ചേരുവകൾ</span>
          </h3>
          <div className="flex flex-wrap gap-2 mt-3">
            {m.ingredients.map((i, idx) => (
              <span
                key={idx}
                className="text-sm px-3 py-1 rounded-full border bg-kerala-50 text-kerala-800 border-kerala-200"
              >
                {i}
              </span>
            ))}
          </div>
        </section>

        {/* Card 2 — Indications */}
        <section className="mt-4 bg-white border border-gray-100 rounded-card p-5 shadow-card">
          <h3 className="font-serif text-xl text-kerala-800 flex items-baseline gap-2">
            Indications
            <span className="text-sm text-gray-500" lang="ml">ചികിത്സാ സൂചനകൾ</span>
          </h3>
          <ul className="mt-3 space-y-2">
            {m.indications.map((ind, idx) => {
              const cond = indicationToConditionSlug(ind)
              const inner = (
                <span className="inline-flex items-start gap-2 text-gray-800">
                  <Check className="w-4 h-4 text-kerala-700 mt-0.5 flex-shrink-0" />
                  <span>{ind}</span>
                </span>
              )
              return (
                <li key={idx}>
                  {cond ? (
                    <Link href={`/conditions/${cond}`} className="hover:text-kerala-700 underline decoration-dotted underline-offset-2">
                      {inner}
                    </Link>
                  ) : inner}
                </li>
              )
            })}
          </ul>
        </section>

        {/* Card 3 — Dosage & Administration */}
        <section className="mt-4 bg-white border border-gray-100 rounded-card p-5 shadow-card">
          <h3 className="font-serif text-xl text-kerala-800 flex items-baseline gap-2">
            Dosage &amp; Administration
            <span className="text-sm text-gray-500" lang="ml">അളവും സേവനവും</span>
          </h3>
          <dl className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="bg-cream/60 border border-gray-100 rounded p-3">
              <dt className="text-[10px] uppercase tracking-wider text-kerala-700 font-semibold">Dosage</dt>
              <dd className="text-gray-800 mt-1">{m.dosage}</dd>
            </div>
            <div className="bg-cream/60 border border-gray-100 rounded p-3">
              <dt className="text-[10px] uppercase tracking-wider text-kerala-700 font-semibold">Anupana (vehicle)</dt>
              <dd className="text-gray-800 mt-1">{m.anupana}</dd>
            </div>
            <div className="bg-cream/60 border border-gray-100 rounded p-3">
              <dt className="text-[10px] uppercase tracking-wider text-kerala-700 font-semibold">Dosage form</dt>
              <dd className="text-gray-800 mt-1">{cat.name}</dd>
            </div>
            <div className="bg-cream/60 border border-gray-100 rounded p-3">
              <dt className="text-[10px] uppercase tracking-wider text-kerala-700 font-semibold">Duration</dt>
              <dd className="text-gray-800 mt-1">As directed by a qualified Ayurveda physician</dd>
            </div>
          </dl>
        </section>

        {/* Card 4 — Contraindications */}
        <section className="mt-4 bg-amber-50 border border-amber-200 rounded-card p-5 shadow-card">
          <h3 className="font-serif text-xl text-amber-900 flex items-baseline gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-800 self-center" />
            Contraindications &amp; Precautions
            <span className="text-sm text-amber-800" lang="ml">മുന്നറിയിപ്പുകൾ</span>
          </h3>
          <p className="mt-3 text-sm text-amber-950 leading-relaxed">{m.contraindications}</p>
          <p className="mt-3 text-sm text-amber-950 leading-relaxed">
            <strong>Always consult a qualified Ayurveda doctor before use.</strong> Self-medication is not recommended.
          </p>
        </section>

        {/* Card 5 — Classical Reference */}
        <section className="mt-4 bg-white border border-gray-100 rounded-card p-5 shadow-card">
          <h3 className="font-serif text-xl text-kerala-800 flex items-baseline gap-2">
            <BookOpen className="w-5 h-5 text-kerala-700 self-center" />
            Classical Reference
            <span className="text-sm text-gray-500" lang="ml">ഗ്രന്ഥ സൂചന</span>
          </h3>
          <p className="mt-3 text-gray-800">{m.reference}</p>
          <p className="mt-3">
            <Link href="/learn/ebooks" className="text-sm text-kerala-700 hover:underline inline-flex items-center gap-1">
              Explore classical text PDFs in the e-books library <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-10">
            <h3 className="font-serif text-xl text-kerala-800 mb-3">Related medicines in {cat.name}</h3>
            <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 md:mx-0 md:px-0">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/medicine/${r.id}`}
                  className="flex-shrink-0 w-64 bg-white border border-gray-100 rounded-card p-4 shadow-card hover:border-kerala-300"
                >
                  <span className={`text-[10px] px-2 py-0.5 border rounded ${tone}`}>{cat.name}</span>
                  <p className="font-serif text-base text-kerala-800 mt-2 leading-tight">{r.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate" lang="ml">{r.nameMl}</p>
                  <p className="text-xs text-gray-700 mt-2 line-clamp-2">{r.indications.slice(0, 2).join(' · ')}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-kerala-700">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Doctor CTA */}
        <section className="mt-10 bg-gradient-to-r from-kerala-50 via-cream to-amber-50 border border-kerala-100 rounded-card p-6 text-center">
          <p className="font-serif text-lg text-ink">Consult a verified Ayurveda doctor about <strong>{m.name}</strong></p>
          <p className="text-sm text-gray-600 mt-1">Verified BAMS practitioners across Kerala &amp; UAE</p>
          <Link
            href="/doctors"
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold rounded"
          >
            <Stethoscope className="w-4 h-4" /> Find a Doctor <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        {/* Disclaimer */}
        <div className="mt-8 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-6">
          <p lang="ml">ഈ വിവരങ്ങൾ വിദ്യാഭ്യാസ ആവശ്യങ്ങൾക്ക് മാത്രം. സ്വയം ചികിത്സ ചെയ്യരുത്. ഡോക്ടറുടെ നിർദ്ദേശ പ്രകാരം മാത്രം മരുന്ന് കഴിക്കുക.</p>
          <p className="mt-2">
            This information is for educational purposes only. Do not self-medicate. Use medicines only as prescribed by a qualified Ayurveda physician.
          </p>
        </div>

        <div className="mt-6">
          <Link href={`/learn/medicines/${cat.slug}`} className="text-sm text-kerala-700 hover:underline inline-flex items-center gap-1">
            ← All {cat.name} medicines
          </Link>
        </div>
      </article>
    </>
  )
}
