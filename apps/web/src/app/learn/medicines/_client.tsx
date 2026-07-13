'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, ChevronDown } from 'lucide-react'
import type { Medicine, MedicineCategory } from './_data'

const CATEGORY_TONE: Record<string, string> = {
  kashayam:         'bg-kerala-50 text-kerala-800 border-kerala-200',
  'arishtam-asavam':'bg-amber-50 text-amber-800 border-amber-200',
  churnam:          'bg-emerald-50 text-emerald-800 border-emerald-200',
  'gulika-vati':    'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200',
  lehyam:           'bg-rose-50 text-rose-800 border-rose-200',
  tailam:           'bg-blue-50 text-blue-800 border-blue-200',
  ghritam:          'bg-yellow-50 text-yellow-800 border-yellow-200',
  guggulu:          'bg-slate-100 text-slate-800 border-slate-200',
  bhasmam:          'bg-purple-50 text-purple-800 border-purple-200',
  rasaushadhi:      'bg-teal-50 text-teal-800 border-teal-200',
}

// Global hub search — matches across name/nameMl/ingredients/indications, jumps to category page anchor.
export function GlobalSearch({ all, categories }: { all: Medicine[]; categories: MedicineCategory[] }) {
  const [q, setQ] = useState('')
  const catName = useMemo(() => Object.fromEntries(categories.map((c) => [c.slug, c.name])), [categories])
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (needle.length < 2) return [] as Medicine[]
    return all
      .filter((m) => (
        m.name.toLowerCase().includes(needle) ||
        m.nameMl.includes(needle) ||
        m.nameSanskrit.toLowerCase().includes(needle) ||
        m.ingredients.some((i) => i.toLowerCase().includes(needle)) ||
        m.indications.some((i) => i.toLowerCase().includes(needle))
      ))
      .slice(0, 20)
  }, [all, q])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search 135 medicines by name, ingredient, or indication…"
          className="w-full pl-12 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-kerala-300 bg-white shadow-card"
        />
      </div>
      {results.length > 0 && (
        <ul className="mt-3 bg-white border border-gray-100 rounded-card shadow-card divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {results.map((m) => (
            <li key={m.id}>
              <Link href={`/learn/medicines/${m.category}#${m.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-kerala-50">
                <div className="min-w-0">
                  <p className="text-sm text-ink font-semibold truncate">{m.name}</p>
                  <p className="text-xs text-gray-500 truncate">{m.nameMl} · {m.indications.slice(0, 2).join(' · ')}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 border rounded ${CATEGORY_TONE[m.category] ?? CATEGORY_TONE.churnam}`}>
                  {catName[m.category] ?? m.category}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {q.trim().length >= 2 && results.length === 0 && (
        <p className="mt-3 text-center text-sm text-gray-500">No medicines match &ldquo;{q}&rdquo;. Try a shorter term or an indication.</p>
      )}
    </div>
  )
}

// Category page — filterable list of medicines, each expandable to show full details.
export function CategoryMedicineList({ medicines, categorySlug }: { medicines: Medicine[]; categorySlug: string }) {
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return medicines
    return medicines.filter((m) => (
      m.name.toLowerCase().includes(needle) ||
      m.nameMl.includes(needle) ||
      m.nameSanskrit.toLowerCase().includes(needle) ||
      m.ingredients.some((i) => i.toLowerCase().includes(needle)) ||
      m.indications.some((i) => i.toLowerCase().includes(needle))
    ))
  }, [medicines, q])

  const tone = CATEGORY_TONE[categorySlug] ?? CATEGORY_TONE.churnam

  return (
    <div>
      <div className="relative mb-5">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${medicines.length} ${categorySlug} medicines…`}
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-kerala-300 bg-white"
        />
      </div>

      <p className="text-xs text-gray-600 mb-3">
        Showing <strong className="text-ink">{filtered.length}</strong> of <strong className="text-ink">{medicines.length}</strong>
      </p>

      <ul className="space-y-3">
        {filtered.map((m) => {
          const isOpen = openId === m.id
          return (
            <li key={m.id} id={m.id} className="bg-white border border-gray-100 rounded-card overflow-hidden scroll-mt-24">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : m.id)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-kerala-50/40"
              >
                <div className="min-w-0">
                  <p className="font-serif text-lg text-kerala-800 leading-tight">{m.name}</p>
                  <p className="text-xs text-gray-600 truncate">{m.nameMl}{m.nameSanskrit && m.nameSanskrit !== m.name ? ` · ${m.nameSanskrit}` : ''}</p>
                </div>
                <ChevronDown className={`w-5 h-5 text-kerala-700 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-gray-100">
                  <p className="text-sm text-gray-800 leading-relaxed mt-3">{m.description}</p>

                  <p className="text-[10px] uppercase tracking-wider text-kerala-700 font-semibold mt-4">Key ingredients</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {m.ingredients.map((i, idx) => (
                      <span key={idx} className={`text-[11px] px-2 py-0.5 border rounded ${tone}`}>{i}</span>
                    ))}
                  </div>

                  <p className="text-[10px] uppercase tracking-wider text-kerala-700 font-semibold mt-4">Indications</p>
                  <ul className="mt-1.5 list-disc pl-5 text-sm text-gray-800 space-y-0.5">
                    {m.indications.map((i, idx) => <li key={idx}>{i}</li>)}
                  </ul>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-cream/60 border border-gray-100 rounded-card p-3">
                      <p className="text-[10px] uppercase tracking-wider text-kerala-700 font-semibold">Dosage</p>
                      <p className="text-sm text-gray-800 mt-1">{m.dosage}</p>
                    </div>
                    <div className="bg-cream/60 border border-gray-100 rounded-card p-3">
                      <p className="text-[10px] uppercase tracking-wider text-kerala-700 font-semibold">Anupana (vehicle)</p>
                      <p className="text-sm text-gray-800 mt-1">{m.anupana}</p>
                    </div>
                  </div>

                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-card p-3">
                    <p className="text-[10px] uppercase tracking-wider text-amber-900 font-semibold">⚠ Contraindications</p>
                    <p className="text-sm text-amber-950 mt-1 leading-relaxed">{m.contraindications}</p>
                  </div>

                  <p className="text-[10px] text-gray-500 mt-3">Reference: <span className="text-gray-700">{m.reference}</span></p>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {filtered.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-card p-6 text-center text-sm text-amber-900">
          No medicines match your search in this category.
        </div>
      )}
    </div>
  )
}
