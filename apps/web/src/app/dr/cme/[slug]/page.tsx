'use client'

// Webinar detail + registration + attendance + certificate.
// Backed by GET /api/dr/cme/:slug and the register/attended POSTs.

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Video, Calendar, Clock, Award, ChevronLeft, CheckCircle2, ExternalLink, Loader2, BadgeCheck } from 'lucide-react'

type Webinar = {
  id: string; slug: string; title: string; description: string
  speakerName: string; scheduledFor: string; durationMin: number; cmeCredits: number
  status: 'upcoming' | 'live' | 'completed' | 'cancelled'
  videoRoomUrl: string | null
  recordingUrl: string | null
  thumbnailUrl: string | null
  slidesUrl: string | null
  specialty: string | null
  topics: string[]
  registered: boolean
  attended: boolean
  certificateId: string | null
  speaker: { id: string; name: string | null } | null
  _count: { registrations: number }
}

// Extract a YouTube id from a stored recording URL so we can embed it.
function ytEmbedId(url: string | null): string | null {
  if (!url) return null
  const re = /^[A-Za-z0-9_-]{11}$/
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    const host = u.hostname.replace(/^www\.|^m\./, '')
    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0]
      return re.test(id) ? id : null
    }
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      const v = u.searchParams.get('v')
      if (v && re.test(v)) return v
      const parts = u.pathname.split('/').filter(Boolean)
      const idx = parts.findIndex((p) => ['embed', 'shorts', 'v', 'live'].includes(p))
      if (idx >= 0 && parts[idx + 1] && re.test(parts[idx + 1])) return parts[idx + 1]
    }
  } catch { /* fall through */ }
  return null
}

export default function WebinarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [w, setW] = useState<Webinar | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/dr/cme/${slug}`, { credentials: 'include' })
    if (!res.ok) {
      setError(res.status === 404 ? 'Webinar not found.' : `Could not load (HTTP ${res.status})`)
      setW(null)
    } else {
      setW(await res.json() as Webinar)
      setError(null)
    }
    setLoading(false)
  }
  useEffect(() => { void load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [slug])

  async function register() {
    setBusy(true)
    try {
      const res = await fetch(`/api/dr/cme/${slug}/register`, { method: 'POST', credentials: 'include' })
      if (res.ok) await load()
      else alert(`Could not register (HTTP ${res.status})`)
    } finally { setBusy(false) }
  }
  async function markAttended() {
    setBusy(true)
    try {
      const res = await fetch(`/api/dr/cme/${slug}/attended`, { method: 'POST', credentials: 'include' })
      if (res.ok) await load()
      else {
        const e = await res.json().catch(() => ({})) as { error?: string }
        alert(e.error ?? `HTTP ${res.status}`)
      }
    } finally { setBusy(false) }
  }

  if (loading) return <div className="flex items-center gap-2 text-muted"><Loader2 className="w-4 h-4 animate-spin" /> Loading webinar…</div>
  if (error || !w) return (
    <div className="space-y-3">
      <Link href="/dr/cme" className="text-xs text-kerala-700 hover:underline inline-flex items-center gap-1"><ChevronLeft className="w-3 h-3" /> All webinars</Link>
      <p className="text-muted">{error ?? 'Not found.'}</p>
    </div>
  )

  const ytId = ytEmbedId(w.recordingUrl)

  return (
    <div className="space-y-6">
      <Link href="/dr/cme" className="text-xs text-kerala-700 hover:underline inline-flex items-center gap-1">
        <ChevronLeft className="w-3 h-3" /> All webinars
      </Link>

      <header className="bg-white rounded-card border border-gray-100 shadow-card p-5 md:p-7">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <h1 className="font-serif text-2xl md:text-3xl text-kerala-700 inline-flex items-center gap-2">
            <Video className="w-6 h-6 flex-shrink-0" /> {w.title}
          </h1>
          <span className={
            'text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ' +
            (w.status === 'live' ? 'bg-red-100 text-red-800 animate-pulse' :
             w.status === 'upcoming' ? 'bg-amber-100 text-amber-800' :
             w.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600')
          }>{w.status}</span>
        </div>
        <p className="text-sm text-muted mt-2 flex flex-wrap gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(w.scheduledFor).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {w.durationMin} min</span>
          <span className="inline-flex items-center gap-1"><Award className="w-3 h-3" /> {w.cmeCredits} CME credits</span>
          <span>· Speaker: <strong>{w.speakerName}</strong></span>
          <span>· {w._count.registrations} registered</span>
        </p>
      </header>

      {/* Recording or live join surface */}
      {w.status === 'completed' && ytId ? (
        <div className="aspect-video bg-black rounded-card overflow-hidden shadow-card">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1`}
            title={w.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="w-full h-full"
          />
        </div>
      ) : w.status === 'completed' && w.recordingUrl ? (
        <a href={w.recordingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-kerala-700 text-white rounded-md text-sm hover:bg-kerala-800">
          Watch recording <ExternalLink className="w-3.5 h-3.5" />
        </a>
      ) : w.status === 'live' && w.videoRoomUrl ? (
        <a href={w.videoRoomUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-red-600 text-white rounded-md text-sm font-semibold hover:bg-red-700 animate-pulse">
          🔴 Join live session <ExternalLink className="w-3.5 h-3.5" />
        </a>
      ) : null}

      {/* About */}
      <section className="bg-white rounded-card border border-gray-100 shadow-card p-5 md:p-7">
        <h2 className="font-serif text-lg text-ink mb-3">About this webinar</h2>
        <div className="prose prose-sm max-w-none">
          {w.description.split(/\n\n+/).map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-3">{p}</p>)}
        </div>
        {(w.specialty || w.topics.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {w.specialty && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-kerala-50 text-kerala-700 rounded-full">{w.specialty}</span>}
            {w.topics.map((t) => <span key={t} className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded">{t}</span>)}
          </div>
        )}
        {w.slidesUrl && (
          <a href={w.slidesUrl} target="_blank" rel="noreferrer" className="text-xs text-kerala-700 hover:underline mt-4 inline-flex items-center gap-1">
            Download slides <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </section>

      {/* Action surface */}
      <section className="bg-white rounded-card border border-gray-100 shadow-card p-5 md:p-7">
        {!w.registered ? (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-700">Register to reserve a seat and receive a reminder before the session.</p>
            <button
              onClick={register}
              disabled={busy || w.status === 'cancelled'}
              className="px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-50 text-white rounded-md text-sm font-semibold"
            >
              {busy ? 'Registering…' : w.status === 'cancelled' ? 'Cancelled' : 'Register'}
            </button>
          </div>
        ) : w.attended ? (
          <div>
            <p className="text-sm text-emerald-700 inline-flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Credit earned · {w.cmeCredits} CME
            </p>
            {w.certificateId && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded inline-flex items-center gap-2 text-sm">
                <BadgeCheck className="w-4 h-4 text-emerald-700" />
                <span>Certificate&nbsp;ID:&nbsp;<code className="text-xs">{w.certificateId}</code></span>
                <Link href={`/cme/verify/${w.certificateId}`} className="text-xs text-kerala-700 hover:underline ml-2">
                  Verify
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-700">
              You&apos;re registered. {w.status === 'upcoming'
                ? 'We\'ll remind you before the session starts.'
                : 'Mark attended once you\'ve watched the full session to claim your CME credit.'}
            </p>
            {w.status !== 'upcoming' && (
              <button
                onClick={markAttended}
                disabled={busy}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-md text-sm font-semibold inline-flex items-center gap-1.5"
              >
                {busy ? 'Submitting…' : <><CheckCircle2 className="w-4 h-4" /> Mark attended + claim credit</>}
              </button>
            )}
          </div>
        )}
        <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">
          Platform-issued certificate verifying participation. Not CCIM-accredited CME — check with your local council on acceptance.
        </p>
      </section>
    </div>
  )
}
