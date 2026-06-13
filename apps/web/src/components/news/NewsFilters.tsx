'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Search } from 'lucide-react'

const CATS = ['All', 'Industry', 'Research', 'Government', 'Community', 'International'] as const

export function NewsFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const timer = useRef<number | undefined>(undefined)

  const cat  = params.get('category') ?? 'All'
  const sort = params.get('sort') ?? 'latest'

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString())
    if (value && value !== 'All' && value !== 'latest') next.set(key, value); else next.delete(key)
    router.push(`/news?${next.toString()}`, { scroll: false })
  }

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => update('q', q.trim() || null), 300)
    return () => { if (timer.current) window.clearTimeout(timer.current) }
  }, [q]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="bg-white border border-gray-100 rounded-card p-4 shadow-card my-6 space-y-3" aria-label="News filters">
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search news…" className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700" />
        <select value={sort} onChange={(e) => update('sort', e.target.value)} className="px-2 py-2 border border-gray-200 rounded text-sm">
          <option value="latest">Latest</option>
          <option value="views">Most read</option>
          <option value="featured">Featured first</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CATS.map((c) => (
          <button key={c} onClick={() => update('category', c)} className={'px-3 py-1 text-xs rounded-full border ' + (cat === c ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-300')}>
            {c}
          </button>
        ))}
      </div>
    </section>
  )
}
