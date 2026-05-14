'use client'

// Compact health-trends panel for the patient dashboard overview. Pulls
// vitals + journal data and renders 30-day mini summaries: latest reading,
// 30-day average, simple direction arrow. Tap any card for the full page.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, Heart, Moon, TrendingUp, TrendingDown, Minus, BookHeart, ArrowRight } from 'lucide-react'

type LatestMap = Record<string, { value: number; recordedAt: string; source: string }>
type JournalEntry = { date: string; mood: number | null; sleepHours: number | null; energy: number | null; symptoms: string[]; doshaFeel: string | null }

const KIND_LABELS: Record<string, string> = {
  bp_systolic:   'BP (sys)',
  hr:            'Heart rate',
  weight_kg:     'Weight',
  glucose_mg_dl: 'Glucose',
  sleep_hours:   'Sleep',
  spo2:          'SpO₂',
}

function direction(values: number[]): 'up' | 'down' | 'flat' {
  if (values.length < 3) return 'flat'
  const first = values.slice(0, Math.ceil(values.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(values.length / 2)
  const last  = values.slice(Math.floor(values.length / 2)).reduce((a, b) => a + b, 0) / (values.length - Math.floor(values.length / 2))
  const diff = last - first
  if (Math.abs(diff) / Math.max(Math.abs(first), 1) < 0.05) return 'flat'
  return diff > 0 ? 'up' : 'down'
}

export function HealthTrends() {
  const [latest, setLatest] = useState<LatestMap>({})
  const [series, setSeries] = useState<Record<string, number[]>>({})
  const [journal, setJournal] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [lRes, vRes, jRes] = await Promise.all([
          fetch('/api/me/vitals/latest', { credentials: 'include' }),
          fetch('/api/me/vitals?days=30',  { credentials: 'include' }),
          fetch('/api/me/journal?days=30', { credentials: 'include' }),
        ])
        if (cancelled) return
        if (lRes.ok) setLatest(((await lRes.json()) as { latest: LatestMap }).latest ?? {})
        if (vRes.ok) {
          const d = await vRes.json() as { items: Array<{ kind: string; value: number; recordedAt: string }> }
          const byKind: Record<string, number[]> = {}
          for (const m of d.items) (byKind[m.kind] ??= []).push(m.value)
          for (const k of Object.keys(byKind)) byKind[k].reverse()
          setSeries(byKind)
        }
        if (jRes.ok) {
          const d = await jRes.json() as { entries: JournalEntry[] }
          setJournal(d.entries ?? [])
        }
      } finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) return null

  const hasVitals  = Object.keys(latest).length > 0
  const hasJournal = journal.length > 0
  if (!hasVitals && !hasJournal) return null

  // Top 3 vital trends.
  const trendCards = Object.entries(latest).slice(0, 3).map(([kind, m]) => {
    const s = series[kind] ?? []
    const dir = direction(s)
    return { kind, label: KIND_LABELS[kind] ?? kind, value: m.value, dir, count: s.length }
  })

  // Journal — 30-day mood avg.
  const moods = journal.map((j) => j.mood).filter((m): m is number => typeof m === 'number')
  const avgMood = moods.length > 0 ? Math.round((moods.reduce((a, b) => a + b, 0) / moods.length) * 10) / 10 : null
  const symptomTally: Record<string, number> = {}
  for (const j of journal) for (const s of j.symptoms) symptomTally[s] = (symptomTally[s] ?? 0) + 1
  const topSymptoms = Object.entries(symptomTally).sort((a, b) => b[1] - a[1]).slice(0, 3)

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl text-kerala-700 inline-flex items-center gap-2">
          <Activity className="w-5 h-5" /> Your 30-day health trends
        </h2>
        <Link href="/dashboard/vitals" className="text-xs text-kerala-700 hover:underline inline-flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {trendCards.map((t) => (
          <Link key={t.kind} href="/dashboard/vitals" className="bg-white rounded-card border border-gray-100 shadow-card p-4 hover:shadow-cardLg transition-shadow">
            <div className="text-[10px] uppercase tracking-wider text-gray-400 inline-flex items-center gap-1">
              <Heart className="w-3 h-3" /> {t.label}
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-serif text-2xl text-kerala-800">{t.value}</span>
              {t.dir === 'up'   && <TrendingUp   className="w-4 h-4 text-amber-600" />}
              {t.dir === 'down' && <TrendingDown className="w-4 h-4 text-emerald-600" />}
              {t.dir === 'flat' && <Minus         className="w-4 h-4 text-gray-400" />}
            </div>
            <div className="text-[10px] text-gray-400 mt-1">{t.count} readings / 30d</div>
          </Link>
        ))}
        {avgMood != null && (
          <Link href="/dashboard/journal" className="bg-white rounded-card border border-gray-100 shadow-card p-4 hover:shadow-cardLg transition-shadow">
            <div className="text-[10px] uppercase tracking-wider text-gray-400 inline-flex items-center gap-1">
              <BookHeart className="w-3 h-3" /> Avg mood
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-serif text-2xl text-kerala-800">{avgMood}</span>
              <span className="text-xs text-gray-400">/ 5</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-1">{journal.length} journal day{journal.length === 1 ? '' : 's'}</div>
          </Link>
        )}
        {topSymptoms.length > 0 && (
          <Link href="/dashboard/journal" className="bg-white rounded-card border border-gray-100 shadow-card p-4 hover:shadow-cardLg transition-shadow">
            <div className="text-[10px] uppercase tracking-wider text-gray-400 inline-flex items-center gap-1">
              <Moon className="w-3 h-3" /> Top symptoms
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {topSymptoms.map(([s, n]) => (
                <span key={s} className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded-full">{s} · {n}</span>
              ))}
            </div>
          </Link>
        )}
      </div>
    </section>
  )
}
