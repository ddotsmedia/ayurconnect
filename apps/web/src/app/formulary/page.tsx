import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { Pill, ChevronRight, Search } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'

type Formulation = {
  id: string; slug: string; name: string; sanskritName: string | null
  category: string; classicalText: string | null
  primaryUses: string[]; doshaImpact: string | null; availability: string | null
}

const CATEGORY_LABEL: Record<string, string> = {
  guggulu: 'Guggulu', choornam: 'Choornam (powder)', kashaya: 'Kashayam (decoction)',
  arishtam: 'Arishtam (fermented)', asava: 'Asavam', taila: 'Taila (oil)',
  ghritam: 'Ghritam (ghee)', lehyam: 'Lehyam (paste)', vati: 'Vati (tablet)', rasa: 'Rasa (mineral)',
}

async function fetchList(params: Record<string, string>): Promise<{ formulations: Formulation[]; pagination: { total: number } }> {
  const qs = new URLSearchParams(params)
  if (!qs.has('limit')) qs.set('limit', '60')
  try {
    const res = await fetch(`${API}/formulations?${qs.toString()}`, { next: { revalidate: 600 } })
    if (!res.ok) return { formulations: [], pagination: { total: 0 } }
    return await res.json()
  } catch { return { formulations: [], pagination: { total: 0 } } }
}

async function fetchCategories(): Promise<Array<{ id: string; count: number }>> {
  try {
    const res = await fetch(`${API}/formulations/categories`, { next: { revalidate: 600 } })
    if (!res.ok) return []
    return await res.json()
  } catch { return [] }
}

export const metadata = {
  title: 'Ayurveda Formulary — Classical Medicines & Their Uses | AyurConnect',
  description: 'Searchable catalogue of classical Ayurvedic compound medicines: Yogaraj Guggulu, Triphala Choornam, Mahanarayan Taila, Chyavanaprasha, Ashwagandharishta and 25+ more. Indications, dosage, and contraindications.',
  alternates: { canonical: '/formulary' },
}

export default async function FormularyIndex({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const sp = await searchParams
  const [{ formulations, pagination }, cats] = await Promise.all([fetchList(sp), fetchCategories()])

  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Pill className="w-3 h-3" /> Classical Ayurveda formulary
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Ayurveda medicines reference</h1>
          <p className="mt-4 text-white/80">
            Classical compound formulations doctors commonly prescribe — indications, typical dosage, contraindications, common manufacturers.
            Not for self-prescription; always consult a CCIM-verified doctor before starting any medicine.
          </p>
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        {/* Categories */}
        <nav aria-label="Filter by formulation type" className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            <Link href="/formulary" className={
              'shrink-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm border whitespace-nowrap ' +
              (!sp.category ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-200 hover:bg-kerala-50')
            }>All types</Link>
            {cats.map((c) => {
              const active = sp.category === c.id
              return (
                <Link key={c.id} href={`/formulary?category=${c.id}`} className={
                  'shrink-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm border whitespace-nowrap ' +
                  (active ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-200 hover:bg-kerala-50')
                }>
                  {CATEGORY_LABEL[c.id] ?? c.id}
                  <span className={'text-xs ' + (active ? 'text-white/80' : 'text-gray-400')}>{c.count}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        <form className="mb-5 flex gap-2" action="/formulary">
          {sp.category && <input type="hidden" name="category" value={sp.category} />}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              name="q" defaultValue={sp.q ?? ''}
              placeholder="Search by name, condition or use — e.g. 'arthritis', 'cough'"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700"
            />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-kerala-700 text-white rounded-md text-sm font-semibold hover:bg-kerala-800">Search</button>
        </form>

        <p className="text-sm text-muted mb-5">
          <strong className="text-ink">{pagination.total}</strong> formulation{pagination.total === 1 ? '' : 's'}
        </p>

        {formulations.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-card">
            <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted">No matches — try widening your filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formulations.map((f) => (
              <Link
                key={f.id}
                href={`/formulary/${f.slug}`}
                className="group bg-white rounded-card border border-gray-100 shadow-card hover:shadow-cardLg transition-all p-5 flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-serif text-lg text-ink leading-snug group-hover:text-kerala-700">{f.name}</h2>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-kerala-50 text-kerala-700 font-medium whitespace-nowrap">
                    {CATEGORY_LABEL[f.category] ?? f.category}
                  </span>
                </div>
                {f.sanskritName && <p className="text-xs text-gray-500 italic mb-2">{f.sanskritName}</p>}
                <div className="flex flex-wrap gap-1 mt-2 flex-1">
                  {f.primaryUses.slice(0, 3).map((u) => (
                    <span key={u} className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded-full border border-amber-200">{u}</span>
                  ))}
                  {f.primaryUses.length > 3 && <span className="text-[10px] text-gray-400 px-1">+{f.primaryUses.length - 3}</span>}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
                  {f.classicalText && <span>From: {f.classicalText}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 p-6 rounded-card bg-amber-50 border border-amber-100">
          <p className="text-sm text-amber-900 leading-relaxed">
            <strong>Educational reference only.</strong> Classical formulations have specific indications, dosages, and contraindications.
            Self-medication can be harmful, especially with Rasa (mineral) preparations. Always consult a CCIM-verified Ayurvedic doctor
            before starting any of these medicines. <Link href="/online-consultation" className="text-amber-700 hover:underline">Book a video consultation →</Link>
          </p>
        </div>
      </div>
    </>
  )
}
