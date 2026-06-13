'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { AyurEvent } from '../../lib/types/platform'

const CAT_DOT: Record<string, string> = {
  Conference: 'bg-blue-600', Workshop: 'bg-amber-600', Seminar: 'bg-violet-600',
  Retreat: 'bg-emerald-600', CME: 'bg-kerala-700', Exhibition: 'bg-rose-600', Webinar: 'bg-cyan-600',
}

function ymd(d: Date): string { return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0') }

export function EventCalendar({ events, onSelectDate }: { events: AyurEvent[]; onSelectDate?: (date: string | null) => void }) {
  const [month, setMonth] = useState(() => { const d = new Date(); d.setUTCDate(1); return d })
  const [selected, setSelected] = useState<string | null>(null)

  const byDay = useMemo(() => {
    const m = new Map<string, AyurEvent[]>()
    for (const e of events) (m.get(e.startDate) ?? m.set(e.startDate, []).get(e.startDate)!).push(e)
    return m
  }, [events])

  const year = month.getUTCFullYear(); const mIdx = month.getUTCMonth()
  const firstWd = new Date(Date.UTC(year, mIdx, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(year, mIdx + 1, 0)).getUTCDate()
  const cells: Array<{ day: number | null; iso: string | null }> = []
  for (let i = 0; i < firstWd; i++) cells.push({ day: null, iso: null })
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = ymd(new Date(Date.UTC(year, mIdx, d)))
    cells.push({ day: d, iso })
  }
  const todayIso = ymd(new Date())

  function pick(iso: string | null) {
    const next = iso === selected ? null : iso
    setSelected(next); onSelectDate?.(next)
  }

  return (
    <div className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
      <header className="flex items-center justify-between mb-3">
        <button onClick={() => { const d = new Date(month); d.setUTCMonth(d.getUTCMonth() - 1); setMonth(d) }} aria-label="previous month" className="p-1 hover:bg-gray-50 rounded">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="font-serif text-lg text-ink">{month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</h3>
        <button onClick={() => { const d = new Date(month); d.setUTCMonth(d.getUTCMonth() + 1); setMonth(d) }} aria-label="next month" className="p-1 hover:bg-gray-50 rounded">
          <ChevronRight className="w-4 h-4" />
        </button>
      </header>
      <div className="grid grid-cols-7 gap-1 text-[10px] text-gray-500 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <div key={d} className="text-center font-semibold uppercase tracking-wider">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          if (!c.iso) return <div key={i} />
          const evs = byDay.get(c.iso) ?? []
          const isToday = c.iso === todayIso
          const isSelected = c.iso === selected
          return (
            <button key={c.iso} onClick={() => pick(c.iso)} className={'aspect-square flex flex-col items-center justify-start pt-1 rounded text-xs ' + (isSelected ? 'bg-kerala-700 text-white' : isToday ? 'bg-amber-100 text-amber-900' : evs.length ? 'bg-cream hover:bg-kerala-50' : 'hover:bg-gray-50')}>
              <span className="font-semibold">{c.day}</span>
              <span className="flex gap-0.5 mt-0.5 h-1">
                {evs.slice(0, 3).map((e, k) => <span key={k} className={'w-1 h-1 rounded-full ' + (CAT_DOT[e.category] ?? 'bg-gray-400')} />)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
