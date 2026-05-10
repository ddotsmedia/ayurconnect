'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Search, Loader2, Stethoscope, Building2, Leaf, BookOpen } from 'lucide-react'

type Hit = { id: string; name?: string; title?: string; specialization?: string; district?: string; type?: string; sanskrit?: string; category?: string }
type Results = { doctors: Hit[]; hospitals: Hit[]; herbs: Hit[]; articles: Hit[] }

export function NavSearch({ compact = false }: { compact?: boolean }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<Results | null>(null)
  const [busy, setBusy] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  // Click outside to close
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  // Debounced fetch
  useEffect(() => {
    const term = q.trim()
    if (!term) { setResults(null); return }
    let cancelled = false
    setBusy(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&limit=4`)
        if (!res.ok) throw new Error()
        const data = (await res.json()) as { results: Results }
        if (!cancelled) { setResults(data.results); setOpen(true) }
      } catch {
        if (!cancelled) setResults(null)
      } finally { if (!cancelled) setBusy(false) }
    }, 200)
    return () => { cancelled = true; clearTimeout(t) }
  }, [q])

  const total = results ? (results.doctors.length + results.hospitals.length + results.herbs.length + results.articles.length) : 0
  const showDropdown = open && q.trim() && (busy || results !== null)

  return (
    <div ref={ref} className={`relative ${compact ? 'w-full' : 'w-72'}`}>
      <form action="/search" onSubmit={() => setOpen(false)}>
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => q && setOpen(true)}
          placeholder="Search doctors, herbs, conditions…"
          aria-label="Site search"
          className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-kerala-700 focus:border-kerala-300"
        />
      </form>

      {showDropdown && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-100 rounded-card shadow-cardLg overflow-hidden z-50 max-h-[480px] overflow-y-auto">
          {busy && (
            <div className="px-3 py-3 text-xs text-gray-500 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching…
            </div>
          )}
          {!busy && total === 0 && results && (
            <div className="px-3 py-3 text-xs text-gray-500">No matches for &ldquo;{q}&rdquo;</div>
          )}
          {!busy && results && total > 0 && (
            <>
              <Group title="Doctors"   icon={Stethoscope} hits={results.doctors}   render={(h) => ({ href: `/doctors/${h.id}`,   primary: h.name ?? '',  secondary: [h.specialization, h.district].filter(Boolean).join(' · ') })} />
              <Group title="Hospitals" icon={Building2}   hits={results.hospitals} render={(h) => ({ href: `/hospitals/${h.id}`, primary: h.name ?? '',  secondary: [h.type, h.district].filter(Boolean).join(' · ') })} />
              <Group title="Herbs"     icon={Leaf}        hits={results.herbs}     render={(h) => ({ href: `/herbs/${h.id}`,     primary: h.name ?? '',  secondary: h.sanskrit ?? '' })} />
              <Group title="Articles"  icon={BookOpen}    hits={results.articles}  render={(h) => ({ href: `/articles/${h.id}`,  primary: h.title ?? '', secondary: h.category ?? '' })} />
              <Link href={`/search?q=${encodeURIComponent(q)}`} onClick={() => setOpen(false)} className="block px-3 py-2 text-xs font-medium text-kerala-700 hover:bg-kerala-50 border-t border-gray-100">
                View all results for &ldquo;{q}&rdquo; →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function Group({ title, icon: Icon, hits, render }: {
  title: string
  icon: typeof Search
  hits: Hit[]
  render: (h: Hit) => { href: string; primary: string; secondary: string }
}) {
  if (hits.length === 0) return null
  return (
    <div>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-t border-gray-100 first:border-t-0">
        <Icon className="w-3 h-3" /> {title}
      </div>
      {hits.map((h) => {
        const r = render(h)
        return (
          <Link key={h.id} href={r.href} className="block px-3 py-2 hover:bg-kerala-50">
            <div className="text-sm text-gray-900 font-medium truncate">{r.primary}</div>
            {r.secondary && <div className="text-[11px] text-gray-500 truncate">{r.secondary}</div>}
          </Link>
        )
      })}
    </div>
  )
}
