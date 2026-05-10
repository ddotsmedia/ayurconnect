'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

type Hit = { id: string; name: string; sanskrit: string | null; english: string | null; uses: string | null; score: number }

export function SemanticHerbSearch() {
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<Hit[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const ctrl = useRef<AbortController | null>(null)

  // Debounce 300ms
  useEffect(() => {
    const term = q.trim()
    if (term.length < 4) { setHits(null); setErr(null); return }
    ctrl.current?.abort()
    const c = new AbortController()
    ctrl.current = c
    setBusy(true); setErr(null)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/herbs/semantic?q=${encodeURIComponent(term)}&limit=8`, { signal: c.signal })
        if (!res.ok) {
          if (res.status === 503) setErr('AI search not configured (admin needs to embed herbs).')
          else setErr(`HTTP ${res.status}`)
          setHits(null)
          return
        }
        const data = (await res.json()) as { herbs: Hit[] }
        setHits(data.herbs ?? [])
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setErr(String(e))
      } finally { setBusy(false) }
    }, 300)
    return () => { clearTimeout(t); c.abort() }
  }, [q])

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-kerala-50 border border-purple-100 rounded-card p-5 mb-8 shadow-card">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-purple-700" />
        <h3 className="text-sm font-semibold text-purple-900">AI semantic search</h3>
        <span className="text-[10px] uppercase tracking-wider text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full">beta</span>
      </div>
      <p className="text-xs text-gray-600 mb-3">
        Describe a symptom or goal in your own words — Gemini matches herbs by meaning, not just keywords.
      </p>
      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Try "chronic fatigue and stress" or "burning urination" or "hair fall after pregnancy"'
          className="w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-700 text-sm"
        />
        {busy && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-purple-700" />}
      </div>

      {err && <p className="mt-2 text-xs text-red-600">{err}</p>}

      {hits !== null && hits.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {hits.map((h) => (
            <Link key={h.id} href={`/herbs/${h.id}`} className="block bg-white border border-gray-100 rounded-md p-2.5 hover:border-purple-300 hover:shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 text-sm truncate">
                    {h.name}
                    {h.sanskrit && <span className="ml-2 text-xs text-gray-500 italic">{h.sanskrit}</span>}
                  </div>
                  {h.uses && <div className="text-xs text-gray-600 mt-0.5 line-clamp-1">{h.uses}</div>}
                </div>
                <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded flex-shrink-0">
                  {(h.score * 100).toFixed(0)}% match
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {hits !== null && hits.length === 0 && !busy && (
        <p className="mt-3 text-xs text-gray-500">No matches — try a different phrase.</p>
      )}
    </div>
  )
}
