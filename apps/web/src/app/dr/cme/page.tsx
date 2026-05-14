'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Video, Award, Calendar, CheckCircle2 } from 'lucide-react'

type Webinar = {
  id: string; slug: string; title: string; description: string
  speakerName: string; scheduledFor: string; durationMin: number; cmeCredits: number
  status: 'upcoming' | 'live' | 'completed' | 'cancelled'
  recordingUrl: string | null; specialty: string | null; topics: string[]
  registered: boolean; attended: boolean
  _count: { registrations: number }
}

export default function CmePage() {
  const [webinars, setWebinars] = useState<Webinar[]>([])
  const [totalCredits, setTotalCredits] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch('/api/dr/cme',     { credentials: 'include' }).then((r) => r.ok ? r.json() : null),
      fetch('/api/dr/cme/me',  { credentials: 'include' }).then((r) => r.ok ? r.json() : null),
    ]).then(([w, me]) => {
      if (cancelled) return
      if (w)  setWebinars(w.webinars ?? [])
      if (me) setTotalCredits(me.totalThisYear ?? 0)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  async function register(slug: string) {
    const res = await fetch(`/api/dr/cme/${slug}/register`, { method: 'POST', credentials: 'include' })
    if (res.ok) setWebinars((cur) => cur.map((w) => w.slug === slug ? { ...w, registered: true } : w))
  }
  async function markAttended(slug: string) {
    const res = await fetch(`/api/dr/cme/${slug}/attended`, { method: 'POST', credentials: 'include' })
    if (res.ok) {
      setWebinars((cur) => cur.map((w) => w.slug === slug ? { ...w, attended: true } : w))
      // Refresh total credits
      const me = await fetch('/api/dr/cme/me', { credentials: 'include' }).then((r) => r.ok ? r.json() : null)
      if (me) setTotalCredits(me.totalThisYear ?? 0)
    }
  }

  if (loading) return <p className="text-muted">Loading…</p>

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-kerala-700 inline-flex items-center gap-2"><Video className="w-7 h-7" /> CME webinars</h1>
          <p className="text-sm text-muted mt-1">Earn platform-issued participation certificates. Live sessions on Daily.co; recordings stored for replay.</p>
        </div>
        <div className="bg-white border border-amber-200 rounded p-3 inline-flex items-center gap-3">
          <Award className="w-5 h-5 text-amber-600" />
          <div>
            <div className="text-2xl font-serif text-kerala-700">{totalCredits.toFixed(1)}</div>
            <div className="text-[10px] uppercase tracking-wider text-amber-700">Credits this year</div>
          </div>
        </div>
      </header>

      <p className="text-xs text-amber-900 bg-amber-50 border border-amber-100 rounded p-3">
        <strong>Note:</strong> Certificates are platform-issued evidence of participation, not CCIM-accredited CME. Check with your local council on acceptance.
      </p>

      {webinars.length === 0 ? <p className="text-muted">No webinars scheduled.</p> : (
        <div className="space-y-3">
          {webinars.map((w) => (
            <article key={w.id} className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="font-serif text-lg text-ink">{w.title}</h2>
                <span className={
                  'text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ' +
                  (w.status === 'live' ? 'bg-red-100 text-red-800 animate-pulse' :
                   w.status === 'upcoming' ? 'bg-amber-100 text-amber-800' :
                   w.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600')
                }>{w.status}</span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">{w.description}</p>
              <p className="text-xs text-muted mt-2">
                <Calendar className="w-3 h-3 inline mr-0.5" /> {new Date(w.scheduledFor).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                · {w.durationMin}min · {w.speakerName}
                · <span className="text-kerala-700 font-semibold">{w.cmeCredits} credits</span>
              </p>
              <footer className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                <Link href={`/dr/cme/${w.slug}`} className="text-xs text-kerala-700 hover:underline">Details →</Link>
                {!w.registered && w.status !== 'cancelled' && (
                  <button onClick={() => register(w.slug)} className="ml-auto px-3 py-1.5 text-xs bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold">Register</button>
                )}
                {w.registered && !w.attended && w.status !== 'upcoming' && (
                  <button onClick={() => markAttended(w.slug)} className="ml-auto px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Mark attended + claim credit
                  </button>
                )}
                {w.attended && <span className="ml-auto text-[10px] text-emerald-700 inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Credit earned</span>}
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
