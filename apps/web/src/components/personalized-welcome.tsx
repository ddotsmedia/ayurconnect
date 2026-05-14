'use client'

// Personalized strip shown above the homepage hero when the visitor is
// signed in. Pulls Prakriti + suggested next actions. Falls open (renders
// nothing) on any error or for anonymous visitors — homepage stays clean.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, Stethoscope, FileText, Activity, BookHeart } from 'lucide-react'

type Me = {
  user: { id: string; name: string | null; prakriti: string | null } | null
  unreadPrescriptions?: number
  openAlerts?: number
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

export function PersonalizedWelcome() {
  const [me, setMe] = useState<Me | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/me', { credentials: 'include' })
      .then(async (r) => r.ok ? (await r.json()) as Me : null)
      .then((data) => { if (!cancelled) setMe(data) })
      .catch(() => null)
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
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
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
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs text-gray-700 hover:border-kerala-300">
              <Activity className="w-3.5 h-3.5 text-kerala-700" /> Dashboard
            </Link>
            <Link href="/triage" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs text-gray-700 hover:border-kerala-300">
              <Stethoscope className="w-3.5 h-3.5 text-kerala-700" /> Symptom check
            </Link>
            <Link href="/dashboard/journal" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs text-gray-700 hover:border-kerala-300">
              <BookHeart className="w-3.5 h-3.5 text-kerala-700" /> Today&apos;s journal
            </Link>
            <Link href="/dashboard/prescriptions" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs text-gray-700 hover:border-kerala-300">
              <FileText className="w-3.5 h-3.5 text-kerala-700" /> Prescriptions <ArrowRight className="w-3 h-3 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
