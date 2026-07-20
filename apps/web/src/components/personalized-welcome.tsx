'use client'

// Personalized strip shown above the homepage hero when the visitor is
// signed in. Pulls Prakriti + a 4-card quick-access grid (Dashboard,
// Symptom check, Today's journal, Events). Falls open (renders nothing) on
// any error or for anonymous visitors — homepage stays clean.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, Stethoscope, Activity, BookHeart } from 'lucide-react'

type Me = {
  user: { id: string; name: string | null; prakriti: string | null } | null
  unreadPrescriptions?: number
  openAlerts?: number
}

type EventPreview = {
  id: string
  title: string
  eventDate: string
  location: string | null
}

const DOSHA_HINT: Record<string, { title: string; line: string; chip: string }> = {
  vata:        { title: 'Vata-dominant',  line: 'Warming, grounding, and oily foods help balance you.', chip: 'bg-blue-100 text-blue-800' },
  pitta:       { title: 'Pitta-dominant', line: 'Cooling, sweet, and calming foods help balance you.',  chip: 'bg-orange-100 text-orange-800' },
  kapha:       { title: 'Kapha-dominant', line: 'Light, warming, and stimulating foods help balance you.', chip: 'bg-emerald-100 text-emerald-800' },
  'vata-pitta':  { title: 'Vata-Pitta',  line: 'Balance with cooling but grounding foods. Avoid extremes.', chip: 'bg-indigo-100 text-indigo-800' },
  'pitta-kapha': { title: 'Pitta-Kapha', line: 'Avoid heavy, oily, and overly sweet. Favor light + bitter.', chip: 'bg-purple-100 text-purple-800' },
  'vata-kapha':  { title: 'Vata-Kapha',  line: 'Warming + light foods. Skip cold and heavy meals.',          chip: 'bg-teal-100 text-teal-800' },
  tridosha:    { title: 'Tridoshic',  line: 'Eat by season — adjust as Vata, Pitta, or Kapha rises.', chip: 'bg-amber-100 text-amber-800' },
}

// Shared card shell — matches the visual rhythm across all 4 tiles. The
// Events card overrides gradient/border/hover for the orange theme.
const CARD_BASE =
  'group flex flex-col justify-between h-full min-h-[112px] p-4 rounded-card shadow-card ' +
  'transition-colors bg-white border border-gray-100'

export function PersonalizedWelcome() {
  const [me,     setMe]     = useState<Me | null>(null)
  const [events, setEvents] = useState<EventPreview[]>([])

  useEffect(() => {
    let cancelled = false
    // Only bother fetching events once we know we're rendering (signed-in).
    // But /api/me runs regardless — do both in parallel to save latency.
    void Promise.all([
      fetch('/api/me',                                                { credentials: 'include' })
        .then(async (r) => r.ok ? (await r.json()) as Me                                : null)
        .catch(() => null),
      fetch('/api/event-listings?upcoming=true&limit=3',              { credentials: 'omit' })
        .then(async (r) => r.ok ? (await r.json()) as { items?: EventPreview[] }       : null)
        .catch(() => null),
    ]).then(([meRes, evRes]) => {
      if (cancelled) return
      setMe(meRes)
      setEvents(evRes?.items ?? [])
    })
    return () => { cancelled = true }
  }, [])

  if (!me?.user) return null
  const u = me.user
  const dosha = u.prakriti ?? null
  const hint = dosha ? DOSHA_HINT[dosha] : null
  const firstName = u.name?.split(/\s+/)[0] ?? 'there'

  return (
    <section className="bg-gradient-to-r from-kerala-50 via-cream to-gold-50 border-b border-kerala-100">
      <div className="container mx-auto px-4 py-5">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wider text-kerala-700 font-semibold inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Welcome back, {firstName}
          </p>
          {hint ? (
            <p className="text-sm text-ink mt-1">
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mr-2 ${hint.chip}`}>{hint.title}</span>
              {hint.line}
            </p>
          ) : (
            <p className="text-sm text-ink mt-1">
              <Link href="/prakriti-quiz" className="text-kerala-700 hover:underline">Take the 2-minute Prakriti quiz</Link> to unlock personalized recommendations.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/dashboard" className={`${CARD_BASE} hover:border-kerala-300 hover:shadow-cardLg`}>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-kerala-700" />
              <h3 className="text-sm font-semibold text-ink">Dashboard</h3>
            </div>
            <p className="text-xs text-gray-600 mt-2">Prescriptions, appointments, streaks.</p>
            <span className="text-xs text-kerala-700 font-semibold mt-2 inline-flex items-center gap-1">Open <ArrowRight className="w-3 h-3" /></span>
          </Link>

          <Link href="/triage" className={`${CARD_BASE} hover:border-kerala-300 hover:shadow-cardLg`}>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-kerala-700" />
              <h3 className="text-sm font-semibold text-ink">Symptom check</h3>
            </div>
            <p className="text-xs text-gray-600 mt-2">Get a 2-min triage + doctor suggestion.</p>
            <span className="text-xs text-kerala-700 font-semibold mt-2 inline-flex items-center gap-1">Start <ArrowRight className="w-3 h-3" /></span>
          </Link>

          <Link href="/dashboard/journal" className={`${CARD_BASE} hover:border-kerala-300 hover:shadow-cardLg`}>
            <div className="flex items-center gap-2">
              <BookHeart className="w-4 h-4 text-kerala-700" />
              <h3 className="text-sm font-semibold text-ink">Today&apos;s journal</h3>
            </div>
            <p className="text-xs text-gray-600 mt-2">Log sleep, digestion, energy in 30 seconds.</p>
            <span className="text-xs text-kerala-700 font-semibold mt-2 inline-flex items-center gap-1">Log <ArrowRight className="w-3 h-3" /></span>
          </Link>

          {/* Events — orange theme per spec. Renders 2-3 upcoming events with title+date,
              or a fallback message if none are approved+published yet. */}
          <div className="flex flex-col justify-between h-full min-h-[112px] p-4 rounded-card shadow-card transition-colors bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 border-l-4 border-l-orange-500 hover:from-orange-100 hover:to-orange-200 hover:shadow-cardLg">
            <div>
              <h3 className="text-sm font-bold text-orange-900 inline-flex items-center gap-1.5">
                <span aria-hidden className="text-base leading-none">📅</span> Upcoming Events
              </h3>
              {events.length > 0 ? (
                <ul className="mt-2 space-y-1.5">
                  {events.slice(0, 3).map((e) => {
                    const d = new Date(e.eventDate)
                    return (
                      <li key={e.id} className="text-[11px] text-orange-900 leading-tight">
                        <Link href={`/events/${e.id}`} className="hover:underline block truncate font-medium">{e.title}</Link>
                        <span className="text-orange-700 text-[10px]">{d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-xs text-orange-800 mt-2">No approved events yet. Check back soon.</p>
              )}
            </div>
            <Link href="/events" className="text-xs font-semibold text-orange-700 hover:text-orange-900 mt-2 inline-flex items-center gap-1">
              View all events <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Prescriptions kept as a small trailing link — no longer in the 4-card grid but still 1-click accessible. */}
        <div className="mt-3 text-right">
          <Link href="/dashboard/prescriptions" className="text-xs text-gray-600 hover:text-kerala-700 inline-flex items-center gap-1">
            Prescriptions <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  )
}
