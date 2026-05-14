'use client'

// Drug interaction checker — Ayurveda-allopathic + Ayurveda-Ayurveda.
// Two modes: search by single component (browse), or check a specific pair.

import { useEffect, useState } from 'react'
import { Pill, AlertTriangle, Search, Zap } from 'lucide-react'

type Interaction = {
  id: string; componentA: string; componentB: string; componentBKind: string
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated'
  mechanism: string | null; clinicalEffect: string; recommendation: string
  evidenceLevel: string | null
}

const SEVERITY_TONE: Record<string, string> = {
  minor:           'bg-blue-50 text-blue-800 border-blue-200',
  moderate:        'bg-amber-50 text-amber-900 border-amber-200',
  major:           'bg-red-50 text-red-900 border-red-200',
  contraindicated: 'bg-red-100 text-red-900 border-red-400',
}

export default function InteractionsPage() {
  const [items, setItems]   = useState<Interaction[]>([])
  const [q, setQ]           = useState('')
  const [a, setA]           = useState('')
  const [b, setB]           = useState('')
  const [checkResult, setCheckResult] = useState<{ a: string; b: string; matches: Interaction[]; found: boolean } | null>(null)
  const [loading, setLoading] = useState(true)

  async function browse() {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    const res = await fetch(`/api/dr/interactions?${params}`, { credentials: 'include' })
    if (res.ok) setItems((await res.json() as { interactions: Interaction[] }).interactions)
    setLoading(false)
  }
  useEffect(() => { void browse() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [])

  async function check(e: React.FormEvent) {
    e.preventDefault()
    if (!a.trim() || !b.trim()) return
    const params = new URLSearchParams({ a, b })
    const res = await fetch(`/api/dr/interactions/check?${params}`, { credentials: 'include' })
    if (res.ok) setCheckResult(await res.json())
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-kerala-700 inline-flex items-center gap-2"><Pill className="w-7 h-7" /> Drug interactions</h1>
        <p className="text-sm text-muted mt-1">Ayurveda-allopathic + Ayurveda-Ayurveda interaction checker. ~30 entries; growing.</p>
      </header>

      {/* Quick pair-check */}
      <section className="bg-kerala-50 border border-kerala-100 rounded-card p-5">
        <h2 className="font-serif text-lg text-kerala-900 mb-3 inline-flex items-center gap-2"><Zap className="w-5 h-5" /> Check a pair</h2>
        <form onSubmit={check} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
          <input value={a} onChange={(e) => setA(e.target.value)} placeholder="e.g. Yogaraj Guggulu" className="border border-gray-200 rounded px-3 py-2 text-sm" />
          <input value={b} onChange={(e) => setB(e.target.value)} placeholder="e.g. Warfarin" className="border border-gray-200 rounded px-3 py-2 text-sm" />
          <button type="submit" disabled={!a.trim() || !b.trim()} className="px-4 py-2 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 text-white rounded text-sm font-semibold">Check</button>
        </form>
        {checkResult && (
          <div className="mt-3">
            {checkResult.found ? (
              <div className="space-y-2">
                {checkResult.matches.map((m) => <InteractionCard key={m.id} item={m} />)}
              </div>
            ) : (
              <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded p-3">
                No known interaction recorded between <strong>{checkResult.a}</strong> and <strong>{checkResult.b}</strong>. Absence of evidence ≠ evidence of absence — exercise normal clinical judgement.
              </p>
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3 inline-flex items-center gap-1.5"><Search className="w-3 h-3" /> Browse all</h2>
        <form onSubmit={(e) => { e.preventDefault(); void browse() }} className="mb-4 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by either component…" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm" />
        </form>
        {loading ? <p className="text-muted">Loading…</p>
          : items.length === 0 ? <p className="text-muted">No interactions match.</p>
          : <div className="space-y-2">{items.map((it) => <InteractionCard key={it.id} item={it} />)}</div>}
      </section>

      <p className="text-[10px] text-gray-400">
        Reference only. Always confirm critical decisions against primary sources + your patient&apos;s full medication review.
      </p>
    </div>
  )
}

function InteractionCard({ item }: { item: Interaction }) {
  const tone = SEVERITY_TONE[item.severity] ?? 'bg-gray-50 border-gray-200'
  return (
    <article className={`p-4 rounded-card border ${tone}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-sm">
          {item.componentA} <span className="text-gray-500">×</span> {item.componentB}
        </h3>
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-white inline-flex items-center gap-1">
          {item.severity === 'major' || item.severity === 'contraindicated' ? <AlertTriangle className="w-3 h-3" /> : null}
          {item.severity}
        </span>
      </div>
      <p className="text-xs"><strong>Effect:</strong> {item.clinicalEffect}</p>
      {item.mechanism && <p className="text-xs mt-1"><strong>Mechanism:</strong> {item.mechanism}</p>}
      <p className="text-xs mt-1 font-semibold"><strong>Recommendation:</strong> {item.recommendation}</p>
      {item.evidenceLevel && <p className="text-[10px] text-gray-500 mt-1">Evidence: {item.evidenceLevel}</p>}
    </article>
  )
}
