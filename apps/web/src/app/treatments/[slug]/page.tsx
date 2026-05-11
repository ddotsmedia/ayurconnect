import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GradientHero } from '@ayurconnect/ui'
import { ShieldCheck, Leaf, Clock, IndianRupee, ChevronRight, AlertTriangle } from 'lucide-react'
import { CONDITIONS, CONDITION_SLUGS, type Condition } from '../_data/conditions'

export function generateStaticParams() {
  return CONDITION_SLUGS.map((slug) => ({ slug }))
}

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params) {
  const { slug } = await params
  const c = CONDITIONS[slug]
  if (!c) return { title: 'Treatment not found' }
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical: `/treatments/${c.slug}` },
  }
}

export default async function TreatmentPage({ params }: Params) {
  const { slug } = await params
  const c = CONDITIONS[slug]
  if (!c) notFound()

  const doctorHref = `/doctors?specialization=${encodeURIComponent(c.specializations[0] ?? '')}`
  const hospitalHref = `/hospitals${c.hospitalServices?.length ? `?service=${encodeURIComponent(c.hospitalServices[0])}` : ''}`

  return (
    <>
      <GradientHero variant="green" size="lg">
        <div className="max-w-4xl mx-auto">
          <Link href="/treatments" className="text-sm text-white/70 hover:text-white inline-flex items-center gap-1 mb-4">
            <ChevronRight className="w-3 h-3 rotate-180" /> All specialised treatments
          </Link>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            🌿 {c.sanskrit}
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">{c.name}</h1>
          <p className="mt-5 text-lg text-white/85 max-w-2xl">{c.tagline}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={doctorHref} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-md font-semibold">
              Find a specialist <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/cost-estimator" className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-white/40 text-white hover:bg-white/10 rounded-md font-semibold">
              Estimate treatment cost
            </Link>
          </div>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-14 max-w-4xl">
        <h2 className="text-2xl md:text-3xl text-kerala-700 mb-4">Overview</h2>
        <p className="text-gray-700 leading-relaxed">{c.overview}</p>

        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="p-5 bg-kerala-50 border border-kerala-100 rounded-card">
            <Clock className="w-5 h-5 text-kerala-700 mb-2" />
            <div className="text-xs uppercase tracking-wider text-kerala-700 font-semibold">Typical duration</div>
            <div className="text-2xl font-serif text-kerala-700 mt-1">{c.durationWeeks.typical} weeks</div>
            <div className="text-xs text-gray-600 mt-1">OPD course; {c.durationWeeks.intensive}-week residential intensive option.</div>
          </div>
          <div className="p-5 bg-amber-50 border border-amber-100 rounded-card">
            <IndianRupee className="w-5 h-5 text-amber-700 mb-2" />
            <div className="text-xs uppercase tracking-wider text-amber-700 font-semibold">Estimated cost</div>
            <div className="text-sm text-gray-700 mt-2 leading-relaxed">
              <strong>Residential:</strong> {c.estimatedCost.residential}<br />
              <strong>OPD:</strong> {c.estimatedCost.opd}
            </div>
          </div>
          <div className="p-5 bg-rose-50 border border-rose-100 rounded-card">
            <ShieldCheck className="w-5 h-5 text-rose-700 mb-2" />
            <div className="text-xs uppercase tracking-wider text-rose-700 font-semibold">Find verified care</div>
            <p className="text-sm text-gray-700 mt-2">{c.specializations.length} matched specialisation{c.specializations.length !== 1 ? 's' : ''} — all listed doctors are CCIM-verified.</p>
            <Link href={doctorHref} className="inline-flex items-center gap-1 text-xs text-rose-700 font-semibold mt-2 hover:underline">
              Browse doctors <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl text-kerala-700 mb-2 text-center">Symptoms & presentation</h2>
          <p className="text-center text-muted mb-8">Common features — your doctor will assess your specific dosha pattern.</p>
          <ul className="grid md:grid-cols-2 gap-3">
            {c.symptoms.map((s) => (
              <li key={s} className="flex items-start gap-2 p-3 bg-white rounded-md border border-gray-100">
                <span className="w-1.5 h-1.5 rounded-full bg-kerala-600 mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 max-w-4xl">
        <h2 className="text-2xl md:text-3xl text-kerala-700 mb-4">The Ayurvedic view</h2>
        <div className="p-6 bg-white rounded-card border border-gray-100 shadow-card">
          <p className="text-gray-800 leading-relaxed italic">{c.ayurvedicView}</p>
        </div>

        <h2 className="text-2xl md:text-3xl text-kerala-700 mb-6 mt-12">Treatment pillars</h2>
        <div className="space-y-4">
          {c.treatmentPillars.map((p, i) => (
            <article key={p.title} className="p-6 bg-white rounded-card border border-gray-100 shadow-card flex gap-4">
              <div className="w-10 h-10 rounded-full bg-kerala-600 text-white font-serif text-lg flex items-center justify-center flex-shrink-0">{i + 1}</div>
              <div>
                <h3 className="font-serif text-xl text-kerala-700">{p.title}</h3>
                <p className="text-gray-700 mt-2 leading-relaxed">{p.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-5xl grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl text-kerala-700 mb-3">Key herbs</h2>
            <div className="flex flex-wrap gap-2">
              {c.herbs.map((h) => (
                <span key={h} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-kerala-100 rounded-full text-sm text-gray-700">
                  <Leaf className="w-3.5 h-3.5 text-kerala-700" /> {h}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl text-kerala-700 mb-3">Classical procedures used</h2>
            <ul className="space-y-1.5">
              {c.procedures.map((p) => (
                <li key={p} className="text-sm text-gray-700 flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-gold-600" /> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 max-w-4xl">
        <h2 className="text-2xl md:text-3xl text-kerala-700 mb-6">Frequently asked questions</h2>
        <div className="space-y-4">
          {c.faq.map((f) => (
            <details key={f.q} className="group p-5 bg-white rounded-card border border-gray-100 shadow-card">
              <summary className="cursor-pointer list-none flex items-start justify-between gap-3">
                <h3 className="font-semibold text-ink">{f.q}</h3>
                <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0 mt-1" />
              </summary>
              <p className="text-gray-700 leading-relaxed mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-kerala-700 py-14 text-white">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif">Ready to start?</h2>
          <p className="mt-3 text-white/85">Speak to a CCIM-verified specialist before committing to any protocol. AyurConnect connects you with vetted Kerala practitioners — never paid placements.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href={doctorHref} className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-md font-semibold">Find a specialist</Link>
            <Link href={hospitalHref} className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/40 text-white hover:bg-white/10 rounded-md font-semibold">Browse treatment centres</Link>
            <Link href="/cost-estimator" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/40 text-white hover:bg-white/10 rounded-md font-semibold">Cost estimate</Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="p-5 rounded-card bg-amber-50 border border-amber-100 text-sm text-amber-900 leading-relaxed flex gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Medical disclaimer:</strong> {c.name} requires individualised diagnosis. The protocols described are
            educational summaries of classical practice. Do not self-prescribe internal medication, never undertake
            Panchakarma without a qualified BAMS / MD practitioner&apos;s supervision, and integrate with your existing
            allopathic care rather than abruptly substituting it.
          </p>
        </div>
      </section>
    </>
  )
}
