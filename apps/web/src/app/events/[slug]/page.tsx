import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, MapPin, Globe, Calendar as CalIcon, Clock, ExternalLink } from 'lucide-react'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../../lib/seo'
import { EVENT_SLUGS, getEvent } from '../../../lib/data/events-seed'
import { EventDetailClient } from './_client'
import { API_INTERNAL } from '../../../lib/server-fetch'
import { headers as nextHeaders } from 'next/headers'
import { EventShareBar } from '../../../components/events/EventShareBar'

type DbEvent = {
  id: string; title: string; description: string; imageUrl: string; imageAlt: string | null
  eventDate: string; eventEndDate: string | null; location: string | null
  category: string; organizer: string | null; registrationLink: string | null
}

async function fetchDbEvent(id: string): Promise<DbEvent | null> {
  try {
    const h = await nextHeaders(); const cookie = h.get('cookie') ?? ''
    const r = await fetch(`${API_INTERNAL}/event-listings/${id}`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return null
    return await r.json() as DbEvent
  } catch { return null }
}

export function generateStaticParams() { return EVENT_SLUGS.map((slug) => ({ slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const e = getEvent(slug)
  if (e) {
    return pageMetadata({
      path:        `/events/${slug}`,
      title:       `${e.title} | ${e.city} | AyurConnect Events`,
      description: e.description.slice(0, 160),
      keywords:    e.tags,
    })
  }
  // DB fallback — admin-created events use cuid ids, not seed slugs.
  const db = await fetchDbEvent(slug)
  if (db) {
    return pageMetadata({
      path:        `/events/${slug}`,
      title:       `${db.title} | AyurConnect Events`,
      description: db.description.slice(0, 160),
      image:       db.imageUrl,
      type:        'article',
    })
  }
  return { title: 'Not found', robots: { index: false, follow: false } }
}

const CAT_BORDER: Record<string, string> = {
  Conference: 'border-t-blue-600', Workshop: 'border-t-amber-600', Seminar: 'border-t-violet-600',
  Retreat: 'border-t-emerald-600', CME: 'border-t-kerala-700', Exhibition: 'border-t-rose-600', Webinar: 'border-t-cyan-600',
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const e = getEvent(slug)
  if (!e) {
    // DB fallback for admin-created events (cuid ids). Render a lean detail
    // view since the DB shape has fewer fields than the seed AyurEvent type.
    const db = await fetchDbEvent(slug)
    if (!db) notFound()
    return <DbEventDetail event={db} />
  }
  const ld = ldGraph(
    {
      '@context': 'https://schema.org', '@type': 'Event',
      name: e.title, description: e.description,
      startDate: `${e.startDate}T${e.startTime}:00`,
      endDate:   `${e.endDate}T${e.endTime}:00`,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: e.online ? 'https://schema.org/OnlineEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
      location: e.online
        ? { '@type': 'VirtualLocation', url: `https://ayurconnect.com/events/${slug}` }
        : { '@type': 'Place', name: e.venue, address: { '@type': 'PostalAddress', streetAddress: e.address, addressLocality: e.city, addressCountry: e.country } },
      organizer: { '@type': 'Organization', name: e.organizer },
      offers: { '@type': 'Offer', price: e.price, priceCurrency: e.currency, availability: e.registered >= e.capacity ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock' },
      performer: e.speakers.map((s) => ({ '@type': 'Person', name: s.name, jobTitle: s.title, worksFor: s.org })),
    },
    breadcrumbLd([
      { name: 'Home', url: '/' }, { name: 'Events', url: '/events' },
      { name: e.category, url: `/events?category=${e.category}` }, { name: e.title, url: `/events/${slug}` },
    ]),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <header className={'bg-gradient-to-br from-kerala-700 via-kerala-800 to-amber-700 text-white py-12 border-t-4 ' + (CAT_BORDER[e.category] ?? 'border-t-gray-400')}>
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/events" className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white mb-3"><ArrowLeft className="w-3.5 h-3.5" /> All events</Link>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-white/10 rounded">{e.category}</span>
            {e.online ? <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-emerald-500 text-white rounded inline-flex items-center gap-1"><Globe className="w-2.5 h-2.5" /> Online</span>
                      : <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-white/10 rounded inline-flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {e.city}, {e.country}</span>}
            {e.isFree ? <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-amber-300 text-kerala-900 rounded font-bold">Free</span>
                      : <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-white/10 rounded font-semibold">{e.currency} {e.price.toLocaleString()}</span>}
          </div>
          <h1 className="font-serif text-3xl md:text-5xl leading-tight">{e.title}</h1>
          <p className="text-white/85 mt-3 max-w-2xl">{e.description}</p>
          <p className="text-sm text-white/75 mt-3 inline-flex items-center gap-1.5 flex-wrap">
            <CalIcon className="w-3.5 h-3.5" />
            {new Date(e.startDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {e.startDate !== e.endDate && <> – {new Date(e.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</>}
            <span className="opacity-60">·</span>
            <Clock className="w-3.5 h-3.5" /> {e.startTime} – {e.endTime}
          </p>
        </div>
      </header>

      <section className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
        <EventDetailClient event={e} />

        {e.capacity > 0 && (
          <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
            <p className="text-sm text-gray-700"><strong>{e.registered.toLocaleString()}</strong> of <strong>{e.capacity.toLocaleString()}</strong> registered</p>
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={'h-full ' + (e.registered / e.capacity > 0.8 ? 'bg-red-500' : 'bg-emerald-600')} style={{ width: `${Math.min(100, (e.registered / e.capacity) * 100)}%` }} />
            </div>
          </article>
        )}

        {e.agenda.length > 0 && (
          <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
            <h2 className="font-serif text-xl text-ink mb-4">Agenda</h2>
            <ol className="border-l-2 border-kerala-200 ml-3 space-y-3">
              {e.agenda.map((a, i) => (
                <li key={i} className="relative pl-5">
                  <span className="absolute -left-[7px] top-1.5 w-3 h-3 bg-kerala-700 rounded-full" />
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{a.time}</p>
                  <p className="text-sm text-ink mt-0.5">{a.title}</p>
                  {a.speaker && <p className="text-[11px] text-gray-600 mt-0.5">— {a.speaker}</p>}
                </li>
              ))}
            </ol>
          </article>
        )}

        {e.speakers.length > 0 && (
          <article>
            <h2 className="font-serif text-xl text-ink mb-4">Speakers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {e.speakers.map((s) => (
                <div key={s.name} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
                  <p className="font-semibold text-ink">{s.name}</p>
                  <p className="text-xs text-gray-600">{s.title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{s.org}</p>
                </div>
              ))}
            </div>
          </article>
        )}

        {!e.online && (
          <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
            <h2 className="font-serif text-xl text-ink mb-3 inline-flex items-center gap-2"><MapPin className="w-5 h-5 text-kerala-700" /> Venue</h2>
            <p className="font-semibold text-ink">{e.venue}</p>
            <p className="text-sm text-gray-700">{e.address}, {e.city}, {e.country}</p>
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(`${e.venue}, ${e.address}, ${e.city}`)}&output=embed`}
              title={`Map of ${e.venue}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-72 mt-3 rounded border border-gray-100"
            />
          </article>
        )}

        <EventShareBar
          id={slug}
          title={e.title}
          date={`${new Date(e.startDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}, ${e.startTime}`}
          location={e.online ? 'Online' : `${e.venue}, ${e.city}`}
          registrationLink={e.registrationUrl ?? null}
          variant="detail"
        />
      </section>
    </>
  )
}

// Lean detail view for admin-created (DB) events. Fewer fields than the
// seed AyurEvent shape, so we don't reuse the elaborate speakers/agenda UI.
function DbEventDetail({ event: e }: { event: DbEvent }) {
  const start = new Date(e.eventDate)
  const end   = e.eventEndDate ? new Date(e.eventEndDate) : null
  const ld = ldGraph(
    {
      '@context': 'https://schema.org', '@type': 'Event',
      name: e.title, description: e.description, image: [e.imageUrl],
      startDate: start.toISOString(),
      endDate:   end?.toISOString() ?? undefined,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: e.location
        ? { '@type': 'Place', name: e.location }
        : { '@type': 'VirtualLocation', url: `https://ayurconnect.com/events/${e.id}` },
      organizer: e.organizer ? { '@type': 'Organization', name: e.organizer } : undefined,
    },
    breadcrumbLd([
      { name: 'Home', url: '/' }, { name: 'Events', url: '/events' },
      { name: e.title, url: `/events/${e.id}` },
    ]),
  )
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <header className="bg-gradient-to-br from-kerala-700 via-kerala-800 to-amber-700 text-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/events" className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white mb-3"><ArrowLeft className="w-3.5 h-3.5" /> All events</Link>
          <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 bg-white/10 rounded-full mb-3">{e.category}</span>
          <h1 className="font-serif text-3xl md:text-4xl leading-tight">{e.title}</h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/90">
            <span className="inline-flex items-center gap-1.5"><CalIcon className="w-4 h-4" /> {start.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" /> {start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}{end ? ` – ${end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
            {e.location && <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {e.location}</span>}
            {e.organizer && <span className="inline-flex items-center gap-1.5"><Globe className="w-4 h-4" /> {e.organizer}</span>}
          </div>
        </div>
      </header>
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={e.imageUrl} alt={e.imageAlt ?? e.title} className="w-full rounded-card mb-6 max-h-96 object-cover" />
        <div className="prose prose-kerala max-w-none text-gray-800 whitespace-pre-line">{e.description}</div>
        {e.registrationLink && (
          <a href={e.registrationLink} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold text-sm">
            Register <ExternalLink className="w-4 h-4" />
          </a>
        )}
        <EventShareBar
          id={e.id}
          title={e.title}
          date={start.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          location={e.location}
          registrationLink={e.registrationLink}
          variant="detail"
        />
      </article>
    </>
  )
}
