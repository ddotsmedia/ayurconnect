'use client'

// Personalized strip shown above the homepage hero when the visitor is
// signed in. Pulls Prakriti + a 4-card quick-access grid (Dashboard,
// Symptom check, Today's journal, Events). Falls open (renders nothing) on
// any error or for anonymous visitors — homepage stays clean.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, Stethoscope, Activity, BookHeart, Briefcase, UserRound, Eye } from 'lucide-react'

type Me = {
  user: { id: string; name: string | null; prakriti: string | null; role?: string | null } | null
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
// Events card overrides gradient/border/hover for the orange theme. Mobile
// uses a compressed variant (smaller padding + min-height) to keep all 4
// tiles above the fold on typical 375-414px viewports.
const CARD_BASE =
  'group flex flex-col justify-between h-full min-h-[64px] md:min-h-[112px] p-2.5 md:p-4 rounded-card shadow-card ' +
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
  // Role-branch surface (task 2026-07-20). Doctors get doctor-relevant tiles
  // (profile / post availability / visibility); everyone else keeps the
  // patient-oriented dashboard / triage / journal set.
  const isDoctor = u.role === 'DOCTOR' || u.role === 'DOCTOR_PENDING'

  return (
    <section className="bg-gradient-to-r from-kerala-50 via-cream to-gold-50 border-b border-kerala-100">
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-5">
        <div className="mb-3 md:mb-4">
          <p className="text-[11px] md:text-xs uppercase tracking-wider text-kerala-700 font-semibold inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Welcome back, {firstName}
          </p>
          {hint ? (
            <p className="text-xs md:text-sm text-ink mt-1 line-clamp-2 md:line-clamp-none">
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mr-2 ${hint.chip}`}>{hint.title}</span>
              {hint.line}
            </p>
          ) : (
            <p className="text-xs md:text-sm text-ink mt-1">
              <Link href="/prakriti-quiz" className="text-kerala-700 hover:underline">Take the 2-minute Prakriti quiz</Link> to unlock personalized recommendations.
            </p>
          )}
        </div>

        {/* 2-col on mobile (halves vertical footprint vs old 1-col stack), 4-col on desktop. */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
          {isDoctor ? (
            <>
              {/* DOCTOR surface — profile, availability posting, visibility. */}
              <Link href="/dashboard/profile" className={`${CARD_BASE} hover:border-kerala-300 hover:shadow-cardLg`}>
                <div className="flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-kerala-700 flex-shrink-0" />
                  <h3 className="text-sm font-semibold text-ink truncate">My profile</h3>
                </div>
                <p className="hidden md:block text-xs text-gray-600 mt-2">Photo, bio, availability, socials.</p>
                <span className="text-[11px] md:text-xs text-kerala-700 font-semibold mt-1 md:mt-2 inline-flex items-center gap-1">Edit <ArrowRight className="w-3 h-3" /></span>
              </Link>

              <Link href="/jobs/post" className={`${CARD_BASE} hover:border-kerala-300 hover:shadow-cardLg`}>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-kerala-700 flex-shrink-0" />
                  <h3 className="text-sm font-semibold text-ink truncate">Post availability</h3>
                </div>
                <p className="hidden md:block text-xs text-gray-600 mt-2">Locum · part-time · collaboration.</p>
                <span className="text-[11px] md:text-xs text-kerala-700 font-semibold mt-1 md:mt-2 inline-flex items-center gap-1">New post <ArrowRight className="w-3 h-3" /></span>
              </Link>

              <Link href="/doctor/dashboard/visibility" className={`${CARD_BASE} hover:border-kerala-300 hover:shadow-cardLg`}>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-kerala-700 flex-shrink-0" />
                  <h3 className="text-sm font-semibold text-ink truncate">Visibility</h3>
                </div>
                <p className="hidden md:block text-xs text-gray-600 mt-2">Search rank, referrals, share links.</p>
                <span className="text-[11px] md:text-xs text-kerala-700 font-semibold mt-1 md:mt-2 inline-flex items-center gap-1">Manage <ArrowRight className="w-3 h-3" /></span>
              </Link>
            </>
          ) : (
            <>
              {/* PATIENT/other surface — dashboard, triage, journal. */}
              <Link href="/dashboard" className={`${CARD_BASE} hover:border-kerala-300 hover:shadow-cardLg`}>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-kerala-700 flex-shrink-0" />
                  <h3 className="text-sm font-semibold text-ink truncate">Dashboard</h3>
                </div>
                {/* Description hidden on mobile to keep tile compact; CTA-only row. */}
                <p className="hidden md:block text-xs text-gray-600 mt-2">Prescriptions, appointments, streaks.</p>
                <span className="text-[11px] md:text-xs text-kerala-700 font-semibold mt-1 md:mt-2 inline-flex items-center gap-1">Open <ArrowRight className="w-3 h-3" /></span>
              </Link>

              <Link href="/triage" className={`${CARD_BASE} hover:border-kerala-300 hover:shadow-cardLg`}>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-kerala-700 flex-shrink-0" />
                  <h3 className="text-sm font-semibold text-ink truncate">Symptom check</h3>
                </div>
                <p className="hidden md:block text-xs text-gray-600 mt-2">Get a 2-min triage + doctor suggestion.</p>
                <span className="text-[11px] md:text-xs text-kerala-700 font-semibold mt-1 md:mt-2 inline-flex items-center gap-1">Start <ArrowRight className="w-3 h-3" /></span>
              </Link>

              <Link href="/dashboard/journal" className={`${CARD_BASE} hover:border-kerala-300 hover:shadow-cardLg`}>
                <div className="flex items-center gap-2">
                  <BookHeart className="w-4 h-4 text-kerala-700 flex-shrink-0" />
                  <h3 className="text-sm font-semibold text-ink truncate">Today&apos;s journal</h3>
                </div>
                <p className="hidden md:block text-xs text-gray-600 mt-2">Log sleep, digestion, energy in 30 seconds.</p>
                <span className="text-[11px] md:text-xs text-kerala-700 font-semibold mt-1 md:mt-2 inline-flex items-center gap-1">Log <ArrowRight className="w-3 h-3" /></span>
              </Link>
            </>
          )}

          {/* Events — orange theme. Mobile: 1 event visible, others CSS-hidden.
              Desktop: up to 3 events shown. */}
          <div className="flex flex-col justify-between h-full min-h-[64px] md:min-h-[112px] p-2.5 md:p-4 rounded-card shadow-card transition-colors bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 border-l-4 border-l-orange-500 hover:from-orange-100 hover:to-orange-200 hover:shadow-cardLg">
            <div>
              <h3 className="text-sm font-bold text-orange-900 inline-flex items-center gap-1.5 truncate">
                <span aria-hidden className="text-base leading-none">📅</span> Events
              </h3>
              {events.length > 0 ? (
                <ul className="mt-1.5 md:mt-2 space-y-1 md:space-y-1.5">
                  {events.slice(0, 3).map((e, i) => {
                    const d = new Date(e.eventDate)
                    return (
                      <li key={e.id} className={`text-[11px] text-orange-900 leading-tight ${i === 0 ? '' : 'hidden md:list-item'}`}>
                        <Link href={`/events/${e.id}`} className="hover:underline block truncate font-medium">{e.title}</Link>
                        <span className="text-orange-700 text-[10px]">{d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-[11px] md:text-xs text-orange-800 mt-1.5 md:mt-2">No approved events yet.</p>
              )}
            </div>
            <Link href="/events" className="text-xs font-semibold text-orange-700 hover:text-orange-900 mt-2 inline-flex items-center gap-1">
              View all events <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Trailing link — role-swapped. Doctors go to their prescribe page,
            patients to their prescriptions list. */}
        <div className="mt-2 md:mt-3 text-right">
          <Link
            href={isDoctor ? '/doctor/dashboard/prescribe' : '/dashboard/prescriptions'}
            className="text-[11px] md:text-xs text-gray-600 hover:text-kerala-700 inline-flex items-center gap-1"
          >
            {isDoctor ? 'Prescribe' : 'Prescriptions'} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  )
}
