import Link from 'next/link'
import { CalendarDays, ArrowRight } from 'lucide-react'
import { API_INTERNAL, logServerFetchError, srvFetch } from '../../lib/server-fetch'

// Compact single-line events strip on the homepage (task 2026-07-20 rework).
// Was a full-width card grid with images + share buttons; now a low-height
// pill row so events don't dominate the middle of the page. Renders nothing
// when no upcoming events exist — no placeholder box.

type DbEvent = {
  id: string; title: string; description: string; imageUrl: string; imageAlt: string | null
  eventDate: string; eventEndDate: string | null; location: string | null
  category: string; organizer: string | null; registrationLink: string | null
}

async function fetchTopUpcoming(): Promise<DbEvent[]> {
  // Phase 2 (2026-07-23): 5s timeout via srvFetch + content-type guard.
  try {
    const r = await srvFetch(
      `${API_INTERNAL}/event-listings?upcoming=true&limit=3`,
      { next: { revalidate: 300 }, timeoutMs: 5000 },
    )
    if (!r.ok || !r.headers.get('content-type')?.includes('json')) {
      if (!r.ok) logServerFetchError('home:upcoming-events', `HTTP ${r.status}`)
      return []
    }
    const j = await r.json() as { items?: DbEvent[] }
    return j.items ?? []
  } catch (e) { logServerFetchError('home:upcoming-events', e); return [] }
}

export async function HomeEventsPreview() {
  const events = await fetchTopUpcoming()
  if (events.length === 0) return null

  return (
    <section className="bg-cream/60 border-y border-orange-100">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl py-2 md:py-2.5">
        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto whitespace-nowrap">
          <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-semibold uppercase tracking-widest text-orange-800 flex-shrink-0">
            <CalendarDays className="w-3.5 h-3.5" /> Events
          </span>
          <ul className="flex items-center gap-1.5 md:gap-2 min-w-0">
            {events.slice(0, 3).map((e, i) => {
              const d = new Date(e.eventDate)
              const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
              return (
                <li key={e.id} className={i === 0 ? '' : 'hidden md:list-item'}>
                  <Link
                    href={`/events/${e.id}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 border-l-2 border-l-orange-500 rounded-full text-[11px] md:text-xs text-orange-900 hover:from-orange-100 hover:to-orange-200 transition-colors max-w-[240px] md:max-w-[320px]"
                  >
                    <span className="font-semibold truncate">{e.title}</span>
                    <span className="text-orange-700 flex-shrink-0">· {dateStr}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
          <Link href="/events" className="inline-flex items-center gap-1 text-[11px] md:text-xs font-semibold text-orange-700 hover:text-orange-900 ml-auto flex-shrink-0">
            All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  )
}
