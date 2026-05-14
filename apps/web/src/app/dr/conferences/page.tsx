'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, ExternalLink, Check } from 'lucide-react'

type Conference = {
  id: string; slug: string; title: string; startDate: string; endDate: string | null
  location: string; mode: string; organizer: string; description: string | null
  registrationUrl: string | null; abstractDeadline: string | null
  topics: string[]; myRsvp: string | null
  _count: { rsvps: number }
}

export default function ConferencesPage() {
  const [items, setItems] = useState<Conference[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/dr/conferences', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (!cancelled && d) setItems(d.conferences) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  async function rsvp(slug: string, status: 'attending' | 'interested') {
    const res = await fetch(`/api/dr/conferences/${slug}/rsvp`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
      credentials: 'include',
    })
    if (res.ok) {
      const { rsvp: newRsvp } = await res.json() as { rsvp: string | null }
      setItems((cur) => cur.map((c) => c.slug === slug ? { ...c, myRsvp: newRsvp } : c))
    }
  }

  if (loading) return <p className="text-muted">Loading…</p>

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-kerala-700 inline-flex items-center gap-2"><Calendar className="w-7 h-7" /> Conferences</h1>
        <p className="text-sm text-muted mt-1">Upcoming Ayurveda conferences globally. RSVP signals visible to peers.</p>
      </header>

      {items.length === 0 ? (
        <div className="bg-white rounded-card border border-gray-100 p-10 text-center">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-700">No upcoming conferences listed.</p>
          <p className="text-xs text-gray-500 mt-1">Admin adds events as they&apos;re announced. Suggest a conference via the contact form.</p>
        </div>
      ) : (
      <div className="space-y-3">
        {items.map((c) => (
          <article key={c.id} className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
            <div className="flex items-start justify-between gap-3 mb-2">
              <Link href={`/dr/conferences/${c.slug}`} className="font-serif text-lg text-ink hover:text-kerala-700 hover:underline">
                {c.title}
              </Link>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-kerala-50 text-kerala-700 rounded-full flex-shrink-0">{c.mode}</span>
            </div>
            <p className="text-xs text-muted">
              <Calendar className="w-3 h-3 inline mr-0.5" />
              {new Date(c.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              {c.endDate && <> – {new Date(c.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</>}
              · <MapPin className="w-3 h-3 inline mr-0.5" /> {c.location}
              · {c.organizer}
            </p>
            {c.description && <p className="text-sm text-gray-700 mt-2 line-clamp-2">{c.description}</p>}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {c.topics.slice(0, 4).map((t) => <span key={t} className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded">{t}</span>)}
              <button onClick={() => rsvp(c.slug, 'attending')} className={'ml-auto text-xs px-3 py-1.5 rounded font-semibold inline-flex items-center gap-1 ' + (c.myRsvp === 'attending' ? 'bg-kerala-700 text-white' : 'border border-gray-200 hover:border-kerala-300')}>
                <Check className="w-3 h-3" /> Attending
              </button>
              <button onClick={() => rsvp(c.slug, 'interested')} className={'text-xs px-3 py-1.5 rounded font-semibold ' + (c.myRsvp === 'interested' ? 'bg-amber-100 text-amber-800' : 'border border-gray-200 hover:border-amber-300')}>
                Interested
              </button>
              {c.registrationUrl && <a href={c.registrationUrl} target="_blank" rel="noreferrer" className="text-xs text-kerala-700 hover:underline inline-flex items-center gap-0.5">Register <ExternalLink className="w-3 h-3" /></a>}
            </div>
          </article>
        ))}
      </div>
      )}
    </div>
  )
}
