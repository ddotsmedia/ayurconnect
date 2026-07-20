import Link from 'next/link'
import { CalendarDays, MapPin, ArrowRight } from 'lucide-react'
import { API_INTERNAL, logServerFetchError } from '../../lib/server-fetch'
import { EventShareBar } from './EventShareBar'

// Top-3 upcoming events preview rendered on the homepage. Fetches the same
// public /event-listings API as /events, so admin-created events flow through
// without any coupling. Renders nothing when no upcoming events exist — the
// section shouldn't be a placeholder box.

type DbEvent = {
  id: string; title: string; description: string; imageUrl: string; imageAlt: string | null
  eventDate: string; eventEndDate: string | null; location: string | null
  category: string; organizer: string | null; registrationLink: string | null
}

async function fetchTopUpcoming(): Promise<DbEvent[]> {
  try {
    const r = await fetch(`${API_INTERNAL}/event-listings?upcoming=true&limit=3`, { next: { revalidate: 300 } })
    if (!r.ok) return []
    const j = await r.json() as { items?: DbEvent[] }
    return j.items ?? []
  } catch (e) { logServerFetchError('home:upcoming-events', e); return [] }
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export async function HomeEventsPreview() {
  const events = await fetchTopUpcoming()
  if (events.length === 0) return null

  return (
    <section className="bg-white py-8 md:py-16 border-t border-gray-100">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4 md:mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest mb-2 md:mb-3 bg-kerala-50 text-kerala-700 border border-kerala-100">
              <CalendarDays className="w-3 h-3" /> Events
            </span>
            <h2 className="font-serif text-xl md:text-4xl leading-tight tracking-tight text-kerala-700">
              Upcoming Ayurveda Events
            </h2>
            {/* Subtitle hidden on mobile — cards themselves communicate scope. */}
            <p className="hidden md:block text-muted mt-2 text-sm md:text-base">Conferences · CME workshops · retreats · webinars · job fairs.</p>
          </div>
          <Link href="/events" className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-kerala-700 hover:text-kerala-800">
            View all <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </Link>
        </div>

        {/* Mobile: 1 event card visible (2nd+3rd CSS-hidden). Tablet: 2. Desktop: 3. */}
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          {events.map((e, i) => {
            const dateStr = fmtDate(e.eventDate)
            return (
              <li key={e.id} className={`bg-white border border-gray-100 rounded-card shadow-card hover:shadow-cardLg transition-shadow overflow-hidden flex flex-col ${i === 0 ? '' : 'hidden md:flex'}`}>
                <Link href={`/events/${e.id}`} className="block group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.imageUrl} alt={e.imageAlt ?? e.title} className="w-full h-32 md:h-44 object-cover" loading="lazy" />
                  <div className="p-3 md:p-4">
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">{e.category}</span>
                    <h3 className="font-serif text-base md:text-lg text-ink leading-snug mt-1.5 group-hover:text-kerala-700 line-clamp-2">{e.title}</h3>
                    <p className="text-xs text-gray-500 mt-1.5 md:mt-2 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {dateStr}</p>
                    {e.location && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.location}</p>}
                  </div>
                </Link>
                <div className="px-3 md:px-4 pb-3 md:pb-4 mt-auto">
                  <EventShareBar
                    id={e.id}
                    title={e.title}
                    date={dateStr}
                    location={e.location}
                    registrationLink={e.registrationLink}
                    variant="card"
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
