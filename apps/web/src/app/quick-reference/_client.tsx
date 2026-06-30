'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Leaf, FlaskConical, Stethoscope, Clock } from 'lucide-react'

type Hit = {
  kind: 'herb' | 'formulation' | 'condition'
  name: string
  nameMl?: string
  href: string
  blurb: string
}

const ICON = { herb: Leaf, formulation: FlaskConical, condition: Stethoscope }
const COLOR = {
  herb: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  formulation: 'bg-amber-50 text-amber-700 border-amber-200',
  condition: 'bg-kerala-50 text-kerala-700 border-kerala-200',
}
const RECENT_KEY = 'qref-recent'

export function QuickRefClient() {
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<Hit[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    try { setRecent(JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? '[]')) } catch {}
  }, [])

  useEffect(() => {
    const t = q.trim()
    if (t.length < 2) { setHits([]); return }
    setBusy(true)
    const ctrl = new AbortController()
    const debounce = setTimeout(async () => {
      try {
        const [herbsRes, formulationsRes, conditionsRes] = await Promise.all([
          fetch(`/api/herbs?q=${encodeURIComponent(t)}&limit=10`, { signal: ctrl.signal }).then((r) => r.ok ? r.json() : null).catch(() => null),
          fetch(`/api/formulations?q=${encodeURIComponent(t)}&limit=10`, { signal: ctrl.signal }).then((r) => r.ok ? r.json() : null).catch(() => null),
          fetch(`/api/conditions?q=${encodeURIComponent(t)}&limit=10`, { signal: ctrl.signal }).then((r) => r.ok ? r.json() : null).catch(() => null),
        ])
        const out: Hit[] = []
        for (const h of (herbsRes?.herbs ?? []).slice(0, 8)) {
          out.push({ kind: 'herb', name: h.name, nameMl: h.malayalamName ?? h.malayalam ?? null, href: `/herbs/${h.id}`, blurb: h.scientificName ?? h.sanskritName ?? '' })
        }
        for (const f of (formulationsRes?.formulations ?? []).slice(0, 8)) {
          out.push({ kind: 'formulation', name: f.name, href: `/formulary/${f.slug ?? f.id}`, blurb: f.indication ?? f.classical_text ?? '' })
        }
        for (const c of (conditionsRes?.conditions ?? []).slice(0, 8)) {
          out.push({ kind: 'condition', name: c.title ?? c.name, href: `/conditions/${c.slug}`, blurb: c.summary ?? c.sanskrit ?? '' })
        }
        setHits(out)
      } finally { setBusy(false) }
    }, 250)
    return () => { clearTimeout(debounce); ctrl.abort() }
  }, [q])

  function remember(term: string) {
    try {
      const next = [term, ...recent.filter((x) => x !== term)].slice(0, 8)
      setRecent(next)
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    } catch {}
  }

  return (
    <div>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search medicines, herbs, formulations, conditions..."
          className="w-full pl-10 pr-3 py-3 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-kerala-300 bg-white"
        />
      </div>

      {q.trim().length >= 2 && (
        <div className="mt-4 space-y-1">
          {busy && hits.length === 0 && <p className="text-sm text-gray-500 px-1">Searching…</p>}
          {!busy && hits.length === 0 && <p className="text-sm text-gray-500 px-1">No results. Try a different term.</p>}
          {hits.map((h) => {
            const Icon = ICON[h.kind]
            return (
              <Link
                key={`${h.kind}-${h.href}`}
                href={h.href}
                onClick={() => remember(q.trim())}
                className="flex items-center gap-3 p-3 bg-white border border-gray-100 hover:border-kerala-300 rounded-lg transition-colors"
              >
                <span className={`text-[10px] px-1.5 py-0.5 border rounded ${COLOR[h.kind]}`}><Icon className="w-3 h-3 inline mr-1" />{h.kind}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink text-sm truncate">{h.name}{h.nameMl && <span className="ml-1 text-gray-500 font-normal">— {h.nameMl}</span>}</p>
                  {h.blurb && <p className="text-xs text-gray-500 truncate">{h.blurb}</p>}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {q.trim().length < 2 && recent.length > 0 && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Recent</p>
          <div className="flex flex-wrap gap-2">
            {recent.map((r) => (
              <button key={r} onClick={() => setQ(r)} className="text-xs px-3 py-1 bg-white border border-gray-200 hover:border-kerala-300 rounded-full">{r}</button>
            ))}
          </div>
        </div>
      )}

      {q.trim().length < 2 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {['ashwagandha', 'triphala', 'pcos', 'panchakarma', 'diabetes', 'migraine'].map((t) => (
            <button key={t} onClick={() => setQ(t)} className="px-3 py-2 bg-white border border-gray-100 hover:border-kerala-300 rounded text-left">{t}</button>
          ))}
        </div>
      )}
    </div>
  )
}
