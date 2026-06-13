'use client'

import { useState } from 'react'
import { CalendarDays, Grid3X3 } from 'lucide-react'
import type { AyurEvent } from '../../lib/types/platform'
import { EventCard } from '../../components/events/EventCard'
import { EventCalendar } from '../../components/events/EventCalendar'
import { EventCountdown } from '../../components/events/EventCountdown'

export function EventsClient({ allEvents, filteredEvents }: { allEvents: AyurEvent[]; filteredEvents: AyurEvent[] }) {
  const [view, setView] = useState<'grid' | 'calendar'>('grid')
  const [calDate, setCalDate] = useState<string | null>(null)

  const upcomingFeatured = allEvents
    .filter((e) => e.featured && new Date(e.startDate).getTime() >= Date.now() - 86_400_000)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0]
  const items = calDate ? filteredEvents.filter((e) => e.startDate === calDate) : filteredEvents

  return (
    <>
      {upcomingFeatured && (
        <section className="bg-gradient-to-br from-kerala-700 via-kerala-800 to-amber-700 text-white rounded-card p-6 md:p-8 mb-6 shadow-cardLg">
          <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">Next featured</span>
          <h2 className="font-serif text-2xl md:text-3xl mt-1">{upcomingFeatured.title}</h2>
          <p className="text-sm text-white/85 mt-2 max-w-2xl">{upcomingFeatured.description.slice(0, 180)}…</p>
          <p className="text-xs text-white/80 mt-2">
            {new Date(upcomingFeatured.startDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {upcomingFeatured.online ? 'Online' : `${upcomingFeatured.venue}, ${upcomingFeatured.city}`}
          </p>
          <EventCountdown targetIso={`${upcomingFeatured.startDate}T${upcomingFeatured.startTime}:00`} />
          <a href={`/events/${upcomingFeatured.slug}`} className="mt-4 inline-flex items-center gap-1 px-4 py-2 bg-white text-kerala-800 hover:bg-white/90 rounded text-sm font-semibold">View details</a>
        </section>
      )}

      <nav className="inline-flex bg-gray-100 rounded-md p-1 text-sm mb-4" aria-label="View toggle">
        <button onClick={() => setView('grid')}     className={'inline-flex items-center gap-1 px-3 py-1.5 rounded ' + (view === 'grid'     ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}><Grid3X3   className="w-3.5 h-3.5" /> Grid</button>
        <button onClick={() => setView('calendar')} className={'inline-flex items-center gap-1 px-3 py-1.5 rounded ' + (view === 'calendar' ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}><CalendarDays className="w-3.5 h-3.5" /> Calendar</button>
      </nav>

      {view === 'calendar' && (
        <div className="mb-6">
          <EventCalendar events={filteredEvents} onSelectDate={setCalDate} />
          {calDate && <p className="text-xs text-gray-600 mt-2">Filtering to events on {new Date(calDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · <button onClick={() => setCalDate(null)} className="text-kerala-700 hover:underline">clear</button></p>}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((e) => <EventCard key={e.id} event={e} />)}
      </section>
    </>
  )
}
