'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const CATS = ['All', 'Conference', 'Workshop', 'Seminar', 'Retreat', 'CME', 'Webinar', 'Exhibition'] as const
const LOCS = [
  { v: 'All',           l: 'All locations' },
  { v: 'Online',        l: 'Online' },
  { v: 'Kerala',        l: 'Kerala' },
  { v: 'UAE',           l: 'UAE' },
  { v: 'International', l: 'International' },
]
const DATES = [
  { v: 'all',     l: 'All time' },
  { v: 'week',    l: 'This week' },
  { v: 'month',   l: 'This month' },
  { v: '3months', l: 'Next 3 months' },
]
const PRICES = [{ v: 'all', l: 'All' }, { v: 'free', l: 'Free only' }, { v: 'paid', l: 'Paid' }]

export function EventFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const cat   = params.get('category') ?? 'All'
  const loc   = params.get('location') ?? 'All'
  const date  = params.get('date')     ?? 'all'
  const price = params.get('price')    ?? 'all'

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value === 'All' || value === 'all') next.delete(key); else next.set(key, value)
    router.push(`/events?${next.toString()}`, { scroll: false })
  }

  return (
    <section className="bg-white border border-gray-100 rounded-card p-4 shadow-card my-6 space-y-3" aria-label="Event filters">
      <div className="flex flex-wrap gap-1.5">
        {CATS.map((c) => (
          <button key={c} onClick={() => update('category', c)} className={'px-3 py-1 text-xs rounded-full border ' + (cat === c ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-300')}>
            {c}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        <select value={loc}   onChange={(e) => update('location', e.target.value)} className="px-2 py-1.5 border border-gray-200 rounded text-xs">{LOCS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
        <select value={date}  onChange={(e) => update('date',     e.target.value)} className="px-2 py-1.5 border border-gray-200 rounded text-xs">{DATES.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
        <select value={price} onChange={(e) => update('price',    e.target.value)} className="px-2 py-1.5 border border-gray-200 rounded text-xs">{PRICES.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
      </div>
    </section>
  )
}
