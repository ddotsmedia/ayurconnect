import type { Metadata } from 'next'
import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { CalendarDays, Sparkles, MapPin, ExternalLink } from 'lucide-react'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../lib/seo'
import { EVENTS } from '../../lib/data/events-seed'
import { EventCard } from '../../components/events/EventCard'
import { EventFilters } from '../../components/events/EventFilters'
import { EventsClient } from './_client'
import { API_INTERNAL } from '../../lib/server-fetch'

type DbEvent = {
  id: string; title: string; description: string; imageUrl: string; imageAlt: string | null
  eventDate: string; eventEndDate: string | null; location: string | null
  category: string; organizer: string | null; registrationLink: string | null
}

async function fetchDbEvents(past: boolean = false): Promise<DbEvent[]> {
  try {
    const qs = past ? '?past=1' : ''
    const r = await fetch(`${API_INTERNAL}/event-listings${qs}`, { next: { revalidate: 300 } })
    if (!r.ok) return []
    const j = await r.json() as { items?: DbEvent[] }
    return j.items ?? []
  } catch { return [] }
}

export const metadata: Metadata = pageMetadata({
  path:        '/events',
  title:       'Ayurveda Events — Conferences, Workshops, Retreats',
  description: 'Upcoming Ayurveda conferences, CME workshops, Panchakarma retreats, online webinars + community health camps. Kerala + UAE + international.',
  keywords:    ['ayurveda events', 'panchakarma retreat', 'CME workshop', 'kerala conference', 'webinar'],
})

function within(e: typeof EVENTS[number], range: string): boolean {
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const start = new Date(e.startDate)
  if (range === 'week')    return start.getTime() <= now.getTime() + 7  * 86_400_000 && start.getTime() >= now.getTime()
  if (range === 'month')   return start.getTime() <= now.getTime() + 31 * 86_400_000 && start.getTime() >= now.getTime()
  if (range === '3months') return start.getTime() <= now.getTime() + 93 * 86_400_000 && start.getTime() >= now.getTime()
  return true
}
function locationMatch(e: typeof EVENTS[number], loc: string): boolean {
  if (loc === 'All')           return true
  if (loc === 'Online')        return e.online
  if (loc === 'Kerala')        return !e.online && e.country === 'India'
  if (loc === 'UAE')           return !e.online && e.country === 'UAE'
  if (loc === 'International') return !e.online && e.country !== 'India' && e.country !== 'UAE'
  return true
}

export default async function EventsListPage({ searchParams }: { searchParams: Promise<{ category?: string; location?: string; date?: string; price?: string; past?: string }> }) {
  const sp = await searchParams
  const past = sp.past === '1' || sp.past === 'true'
  let items = [...EVENTS].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  if (sp.category && sp.category !== 'All') items = items.filter((e) => e.category === sp.category)
  if (sp.location) items = items.filter((e) => locationMatch(e, sp.location!))
  if (sp.date)     items = items.filter((e) => within(e, sp.date!))
  if (sp.price === 'free') items = items.filter((e) => e.isFree)
  if (sp.price === 'paid') items = items.filter((e) => !e.isFree)
  const dbEvents = await fetchDbEvents(past)
  const ld = ldGraph(breadcrumbLd([{ name: 'Home', url: '/' }, { name: 'Events', url: '/events' }]))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <CalendarDays className="w-3 h-3" /> Upcoming Ayurveda events
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Ayurveda Events</h1>
          <p className="text-white/85 mt-3">Conferences · CME workshops · Panchakarma retreats · webinars · community camps.</p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10 max-w-6xl">
        {dbEvents.length > 0 && (
          <div className="mb-10">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-serif text-2xl text-kerala-800">{past ? 'Past events' : 'New listings'}</h2>
              <Link href={past ? '/events' : '/events?past=1'} className="text-xs text-kerala-700 hover:underline">
                {past ? '← Upcoming' : 'View past events →'}
              </Link>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dbEvents.map((e) => {
                const d = new Date(e.eventDate)
                return (
                  <li key={e.id}>
                    <Link href={`/events/${e.id}`} className="group block bg-white border border-gray-100 rounded-card shadow-card hover:shadow-cardLg transition-shadow overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={e.imageUrl} alt={e.imageAlt ?? e.title} className="w-full h-40 object-cover" />
                      <div className="p-4">
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">{e.category}</span>
                        <h3 className="font-serif text-lg text-ink leading-snug mt-1.5 group-hover:text-kerala-700">{e.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        {e.location && <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.location}</p>}
                        <p className="text-xs text-gray-700 mt-2 line-clamp-2">{e.description}</p>
                        {e.registrationLink && (
                          <p className="mt-2 text-[11px] text-kerala-700 inline-flex items-center gap-0.5"><ExternalLink className="w-3 h-3" /> Registration link on detail page</p>
                        )}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
        <EventFilters />
        <EventsClient allEvents={EVENTS} filteredEvents={items} />
        {items.length === 0 && dbEvents.length === 0 && (
          <p className="text-sm text-muted text-center bg-white border border-gray-100 rounded-card p-8">No events match your filters.</p>
        )}
        <section className="mt-10 bg-gradient-to-br from-kerala-50 via-white to-amber-50 border border-kerala-100 rounded-card p-6 text-center">
          <Sparkles className="w-9 h-9 text-kerala-700 mx-auto mb-2" />
          <h2 className="font-serif text-xl text-ink">Hosting your own Ayurveda event?</h2>
          <p className="text-sm text-gray-700 mt-2">List it on AyurConnect — verified directory for Kerala-tradition CME, retreats, conferences, webinars.</p>
          <p className="text-xs text-gray-500 mt-3">Email <a href="mailto:events@ayurconnect.com" className="text-kerala-700 hover:underline">events@ayurconnect.com</a> with details.</p>
        </section>
      </section>
    </>
  )
}
