import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { Leaf, BookOpen } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'
import { SemanticHerbSearch } from '../../components/semantic-herb-search'

type Herb = {
  id: string
  name: string
  sanskrit: string | null
  english: string | null
  malayalam: string | null
  rasa: string | null
  guna: string | null
  virya: string | null
  vipaka: string | null
  description: string | null
  uses: string | null
}

const VIRYA_TONE: Record<string, string> = {
  ushna: 'bg-orange-100 text-orange-800 border-orange-200',
  sheeta: 'bg-blue-100 text-blue-800 border-blue-200',
}

async function fetchHerbs(): Promise<Herb[]> {
  try {
    const res = await fetch(`${API}/herbs?limit=100`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = (await res.json()) as { herbs: Herb[] }
    return data.herbs ?? []
  } catch { return [] }
}

export const metadata = {
  title: 'Kerala Ayurvedic Herb Database — 1000+ Medicinal Plants | AyurConnect',
  description: 'Comprehensive Ayurvedic herb encyclopedia: Sanskrit, Malayalam, English names, Rasa-Guna-Virya-Vipaka properties, classical uses. Sourced from Charaka Samhita and the Western Ghats.',
}

export default async function HerbsPage() {
  const herbs = await fetchHerbs()

  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Leaf className="w-3 h-3" /> Western Ghats medicinal plants
          </span>
          <h1 className="text-3xl md:text-5xl text-white">Kerala Herb Database</h1>
          <p className="text-white/70 mt-3">
            Classical Ayurvedic herbs with Sanskrit, Malayalam, and English names.
            Each entry covers Rasa (taste), Guna (quality), Virya (potency),
            Vipaka (post-digestive effect), and traditional uses.
          </p>
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-12">
        <SemanticHerbSearch />

        <p className="text-sm text-muted mb-6">
          <strong className="text-ink">{herbs.length}</strong> herbs catalogued
          <span className="text-subtle"> · sourced from Charaka Samhita, Ashtanga Hridayam and Kerala practice traditions</span>
        </p>

        {herbs.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-card">
            <Leaf className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <p className="text-muted">No herbs catalogued yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {herbs.map((h) => (
              <article key={h.id} className="bg-white rounded-card border border-gray-100 shadow-card hover:shadow-cardLg transition-shadow p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-2xl text-kerala-700 leading-tight">{h.name}</h3>
                    {h.sanskrit && <p className="text-sm text-gold-600 italic">{h.sanskrit}</p>}
                  </div>
                  <span className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-5 h-5" />
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-gray-600">
                  {h.english   && <div><span className="text-subtle">EN:</span> {h.english}</div>}
                  {h.malayalam && <div><span className="text-subtle">ML:</span> {h.malayalam}</div>}
                </div>

                {h.description && (
                  <p className="text-sm text-gray-700 mt-3 line-clamp-3 leading-relaxed">{h.description}</p>
                )}

                <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
                  {h.rasa && (
                    <div className="px-2 py-1 bg-gray-50 border border-gray-100 rounded">
                      <div className="text-subtle text-[10px] uppercase tracking-wider">Rasa (taste)</div>
                      <div className="text-gray-800 truncate">{h.rasa}</div>
                    </div>
                  )}
                  {h.virya && (
                    <div className={`px-2 py-1 rounded border ${VIRYA_TONE[h.virya] ?? 'bg-gray-50 border-gray-100 text-gray-800'}`}>
                      <div className="text-[10px] uppercase tracking-wider opacity-70">Virya (potency)</div>
                      <div className="truncate">{h.virya}</div>
                    </div>
                  )}
                  {h.guna && (
                    <div className="px-2 py-1 bg-gray-50 border border-gray-100 rounded">
                      <div className="text-subtle text-[10px] uppercase tracking-wider">Guna (quality)</div>
                      <div className="text-gray-800 truncate">{h.guna}</div>
                    </div>
                  )}
                  {h.vipaka && (
                    <div className="px-2 py-1 bg-gray-50 border border-gray-100 rounded">
                      <div className="text-subtle text-[10px] uppercase tracking-wider">Vipaka</div>
                      <div className="text-gray-800 truncate">{h.vipaka}</div>
                    </div>
                  )}
                </div>

                {h.uses && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-[11px] text-gray-500 flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> Traditional uses</div>
                    <p className="text-sm text-kerala-800 mt-0.5 leading-relaxed line-clamp-2">{h.uses}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        <div className="mt-10 text-center text-sm text-muted">
          Want to ask about a specific herb? Try the <Link href="/ayurbot" className="text-kerala-700 hover:underline">AyurBot AI</Link> or
          <Link href="/doctors?specialization=Dravyaguna" className="text-kerala-700 hover:underline"> consult a Dravyaguna specialist</Link>.
        </div>
      </div>
    </>
  )
}
