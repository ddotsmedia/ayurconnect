import Link from 'next/link'
import { MapPin, Globe, Users, Calendar as CalIcon } from 'lucide-react'
import type { AyurEvent } from '../../lib/types/platform'

const CAT_BORDER: Record<string, string> = {
  Conference: 'border-l-blue-600', Workshop: 'border-l-amber-600', Seminar: 'border-l-violet-600',
  Retreat: 'border-l-emerald-600', CME: 'border-l-kerala-700', Exhibition: 'border-l-rose-600',
  Webinar: 'border-l-cyan-600',
}

function initials(name: string): string { return name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() }

export function EventCard({ event: e }: { event: AyurEvent }) {
  const d = new Date(e.startDate)
  const pct = e.capacity > 0 ? Math.round((e.registered / e.capacity) * 100) : 0
  return (
    <Link href={`/events/${e.slug}`} className={'group block bg-white border border-l-4 border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg transition-shadow ' + (CAT_BORDER[e.category] ?? 'border-l-gray-400')}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-center bg-cream rounded p-2 min-w-[60px]">
          <p className="text-2xl font-bold text-kerala-800 leading-none">{d.getDate()}</p>
          <p className="text-[10px] uppercase text-gray-500 mt-0.5">{d.toLocaleDateString('en-GB', { month: 'short' })}</p>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">{e.category}</span>
            {e.online && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded inline-flex items-center gap-1"><Globe className="w-2.5 h-2.5" /> Online</span>}
            {!e.online && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-blue-50 text-blue-800 rounded inline-flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {e.city}</span>}
            {e.isFree ? <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">Free</span>
                      : <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded font-semibold">{e.currency} {e.price.toLocaleString()}</span>}
          </div>
          <h3 className="font-serif text-base text-ink leading-tight group-hover:text-kerala-700">{e.title}</h3>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{e.description}</p>
          {e.speakers.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex -space-x-2">
                {e.speakers.slice(0, 4).map((s) => (
                  <span key={s.name} className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-kerala-100 text-kerala-800 text-[10px] font-bold border-2 border-white" title={`${s.name} — ${s.title}, ${s.org}`}>
                    {initials(s.name)}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-gray-500">{e.speakers.length} speaker{e.speakers.length === 1 ? '' : 's'}</span>
            </div>
          )}
          {e.capacity > 0 && (
            <div className="mt-3">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={'h-full ' + (pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-amber-500' : 'bg-emerald-600')} style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              <p className="text-[10px] text-gray-500 mt-1 inline-flex items-center gap-1">
                <Users className="w-2.5 h-2.5" /> {e.registered.toLocaleString()} of {e.capacity.toLocaleString()} registered
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
