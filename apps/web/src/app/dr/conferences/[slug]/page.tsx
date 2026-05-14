'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, ExternalLink, Check, Users, Clock } from 'lucide-react'

type Peer = { status: string; user: { id: string; name: string | null } | null }
type Conference = {
  id: string; slug: string; title: string
  startDate: string; endDate: string | null
  location: string; mode: string; organizer: string
  description: string | null
  registrationUrl: string | null
  abstractDeadline: string | null
  topics: string[]
  status: string
  myRsvp: string | null
  rsvpCounts: { attending: number; interested: number }
  peers: Peer[]
  _count: { rsvps: number }
}

const dtFull = (s: string) =>
  new Date(s).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })

export default function ConferenceDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [c, setC] = useState<Conference | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/dr/conferences/${slug}`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (!cancelled && d) setC(d as Conference) })
    return () => { cancelled = true }
  }, [slug])

  async function rsvp(status: 'attending' | 'interested') {
    if (!c || busy) return
    setBusy(true)
    try {
      const res = await fetch(`/api/dr/conferences/${c.slug}/rsvp`, {
        method:      'POST',
        headers:     { 'content-type': 'application/json' },
        body:        JSON.stringify({ status }),
        credentials: 'include',
      })
      if (res.ok) {
        const fresh = await fetch(`/api/dr/conferences/${c.slug}`, { credentials: 'include' })
        if (fresh.ok) setC(await fresh.json() as Conference)
      }
    } finally {
      setBusy(false)
    }
  }

  if (!c) return <p className="text-muted">Loading…</p>

  const isCompleted = c.status === 'completed' || new Date(c.startDate) < new Date()
  const attending  = c.peers.filter((p) => p.status === 'attending')
  const interested = c.peers.filter((p) => p.status === 'interested')

  return (
    <div className="space-y-5 max-w-3xl">
      <Link href="/dr/conferences" className="inline-flex items-center gap-1 text-sm text-kerala-700 hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> All conferences
      </Link>

      <article className="bg-white border border-gray-100 rounded-card p-6 shadow-card">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-kerala-50 text-kerala-700 rounded-full">{c.mode}</span>
            <h1 className="font-serif text-2xl text-ink mt-2">{c.title}</h1>
            <p className="text-xs text-muted mt-1">Organised by {c.organizer}</p>
          </div>
          {isCompleted && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">Completed</span>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-kerala-700 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400">Dates</div>
              <div className="text-gray-800">
                {dtFull(c.startDate)}
                {c.endDate && <> – {dtFull(c.endDate)}</>}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-kerala-700 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400">Location</div>
              <div className="text-gray-800">{c.location}</div>
            </div>
          </div>
          {c.abstractDeadline && (
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-gray-400">Abstract deadline</div>
                <div className="text-gray-800">{dtFull(c.abstractDeadline)}</div>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-kerala-700 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400">Peer interest</div>
              <div className="text-gray-800">
                {c.rsvpCounts.attending} attending · {c.rsvpCounts.interested} interested
              </div>
            </div>
          </div>
        </div>

        {c.description && (
          <section className="mt-6">
            <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">About</h2>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{c.description}</p>
          </section>
        )}

        {c.topics.length > 0 && (
          <section className="mt-5">
            <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Topics</h2>
            <div className="flex flex-wrap gap-1.5">
              {c.topics.map((t) => <span key={t} className="text-[11px] px-2 py-0.5 bg-amber-50 text-amber-800 rounded">{t}</span>)}
            </div>
          </section>
        )}

        {!isCompleted && (
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => rsvp('attending')}
              disabled={busy}
              className={'text-sm px-4 py-2 rounded font-semibold inline-flex items-center gap-1.5 disabled:opacity-60 ' + (c.myRsvp === 'attending' ? 'bg-kerala-700 text-white' : 'border border-gray-200 hover:border-kerala-300')}
            >
              <Check className="w-4 h-4" /> {c.myRsvp === 'attending' ? "You're attending" : 'Attending'}
            </button>
            <button
              onClick={() => rsvp('interested')}
              disabled={busy}
              className={'text-sm px-4 py-2 rounded font-semibold disabled:opacity-60 ' + (c.myRsvp === 'interested' ? 'bg-amber-100 text-amber-800' : 'border border-gray-200 hover:border-amber-300')}
            >
              {c.myRsvp === 'interested' ? 'Marked interested' : 'Interested'}
            </button>
            {c.registrationUrl && (
              <a
                href={c.registrationUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-auto text-sm px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold inline-flex items-center gap-1.5"
              >
                Register <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </article>

      {(attending.length > 0 || interested.length > 0) && (
        <section>
          <h2 className="font-serif text-lg text-ink mb-3">Peers from AyurConnect</h2>
          {attending.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-card p-4">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Attending</p>
              <div className="flex flex-wrap gap-1.5">
                {attending.map((p, i) => (
                  <span key={p.user?.id ?? i} className="text-xs px-2 py-1 bg-kerala-50 text-kerala-800 rounded-full">
                    Dr {p.user?.name ?? 'AyurConnect'}
                  </span>
                ))}
              </div>
            </div>
          )}
          {interested.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-card p-4 mt-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Interested</p>
              <div className="flex flex-wrap gap-1.5">
                {interested.map((p, i) => (
                  <span key={p.user?.id ?? i} className="text-xs px-2 py-1 bg-amber-50 text-amber-800 rounded-full">
                    Dr {p.user?.name ?? 'AyurConnect'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
