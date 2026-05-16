import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, Pill, AlertTriangle, Stethoscope, Factory, ChevronRight } from 'lucide-react'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
import { ldGraph, breadcrumbLd, SITE_URL, clip } from '../../../lib/seo'

type Formulation = {
  id: string; slug: string; name: string; sanskritName: string | null; malayalamName: string | null
  classicalText: string | null; category: string
  ingredients: string[]; primaryUses: string[]; doshaImpact: string | null
  typicalDose: string | null; anupanaCommon: string | null
  contraindications: string | null; sideEffects: string | null; availability: string | null
  manufacturers: string[]; description: string | null
}

async function fetchFormulation(slug: string): Promise<Formulation | null> {
  try {
    const res = await fetch(`${API}/formulations/${slug}`, { next: { revalidate: 600 } })
    if (!res.ok) return null
    return await res.json() as Formulation
  } catch { return null }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const f = await fetchFormulation(slug)
  if (!f) return { title: 'Formulation not found' }
  const otherNames = [f.sanskritName, f.malayalamName].filter(Boolean).join(' / ')
  const title = `${f.name}${otherNames ? ` (${otherNames})` : ''} — Uses, Dosage & Side Effects | AyurConnect`
  const description = clip(f.description ?? `${f.name} — classical Ayurvedic ${f.category}. Uses: ${f.primaryUses.slice(0, 3).join(', ')}. Typical dose: ${f.typicalDose ?? '—'}`, 160)
  return {
    title, description,
    alternates: { canonical: `/formulary/${f.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/formulary/${f.slug}`, type: 'article' },
  }
}

export default async function FormulationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const f = await fetchFormulation(slug)
  if (!f) notFound()

  const jsonLd = ldGraph(
    breadcrumbLd([
      { name: 'Home',       url: '/' },
      { name: 'Formulary',  url: '/formulary' },
      { name: f.name,       url: `/formulary/${f.slug}` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'Drug',
      name: f.name,
      alternateName: [f.sanskritName, f.malayalamName].filter(Boolean),
      activeIngredient: f.ingredients.map((i) => ({ '@type': 'DrugIngredient', name: i })),
      description: f.description ?? undefined,
      drugClass: f.category,
      dosageForm: f.category,
      url: `${SITE_URL}/formulary/${f.slug}`,
      mechanismOfAction: f.doshaImpact ?? undefined,
      proprietaryName: f.manufacturers.length ? f.manufacturers : undefined,
    },
  )

  const factRow = (label: string, value: string | null | undefined) => value ? (
    <tr className="border-b border-gray-100 last:border-0 align-top">
      <td className="py-2.5 pr-3 text-xs text-gray-500 uppercase tracking-wider font-semibold whitespace-nowrap">{label}</td>
      <td className="py-2.5 text-sm text-gray-800">{value}</td>
    </tr>
  ) : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-kerala-50 border-b border-kerala-100">
        <div className="container mx-auto px-4 py-3 text-sm">
          <Link href="/formulary" className="inline-flex items-center gap-1.5 text-kerala-700 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> All formulations
          </Link>
        </div>
      </div>

      <article className="container mx-auto px-4 py-10 max-w-4xl">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <Pill className="w-4 h-4 text-kerala-700" />
            <span className="uppercase tracking-wider font-semibold">{f.category}</span>
            {f.classicalText && <span>· {f.classicalText}</span>}
          </div>
          <h1 className="font-serif text-3xl md:text-5xl text-ink leading-tight">{f.name}</h1>
          {(f.sanskritName || f.malayalamName) && (
            <p className="text-base text-muted mt-2 italic">
              {[f.sanskritName, f.malayalamName].filter(Boolean).join(' · ')}
            </p>
          )}
        </header>

        {f.description && (
          <section className="mb-8">
            <p className="text-gray-800 leading-relaxed text-[15px]">{f.description}</p>
          </section>
        )}

        {/* Fact table */}
        <section className="bg-white rounded-card border border-gray-100 shadow-card overflow-hidden mb-8">
          <table className="w-full">
            <tbody>
              {factRow('Ingredients', f.ingredients.join(', '))}
              {factRow('Primary uses', f.primaryUses.join(' · '))}
              {factRow('Dosha impact', f.doshaImpact)}
              {factRow('Typical dose', f.typicalDose)}
              {factRow('Anupana (vehicle)', f.anupanaCommon)}
              {factRow('Contraindications', f.contraindications)}
              {factRow('Side effects', f.sideEffects)}
              {factRow('Availability', f.availability)}
            </tbody>
          </table>
        </section>

        {/* Manufacturers */}
        {f.manufacturers.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3 inline-flex items-center gap-1.5">
              <Factory className="w-3 h-3" /> Common manufacturers (Kerala-trusted)
            </h2>
            <div className="flex flex-wrap gap-2">
              {f.manufacturers.map((m) => (
                <span key={m} className="px-3 py-1 bg-kerala-50 text-kerala-700 rounded-full text-xs border border-kerala-100">{m}</span>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              Listed for reference. AyurConnect does not endorse specific brands. Quality varies even within a single manufacturer\&apos;s product line — buy from authorised outlets only.
            </p>
          </section>
        )}

        {/* Safety callout */}
        <section className="p-5 rounded-card bg-amber-50 border border-amber-100 mb-8">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">Don\&apos;t self-prescribe</h3>
              <p className="text-sm text-amber-900/85 leading-relaxed">
                Classical formulations interact with each other and with allopathic medicines. Dose adjustments depend on age, weight, Prakriti, current medications, and pregnancy/lactation status. Always consult a verified doctor before starting.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-kerala-50 border border-kerala-100 rounded-card p-6 text-center">
          <Stethoscope className="w-10 h-10 text-kerala-700 mx-auto mb-2" />
          <h3 className="font-serif text-xl text-kerala-800">Want to know if {f.name.split(' ')[0]} is right for you?</h3>
          <p className="text-sm text-kerala-900/80 mt-2 max-w-xl mx-auto">
            Book a 30-minute video consultation with a verified doctor. They\&apos;ll check your Prakriti, current medications, and prescribe the right protocol.
          </p>
          <Link href="/online-consultation" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded-md text-sm font-semibold">
            Book a consultation <ChevronRight className="w-4 h-4" />
          </Link>
        </section>
      </article>
    </>
  )
}
