'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Loader2, Trash2, Save, BookOpen } from 'lucide-react'

type Entry = {
  id: string
  date: string
  mood: number | null
  sleepHours: number | null
  energy: number | null
  symptoms: string[]
  doshaFeel: string | null
  food: string | null
  notes: string | null
}

const SYMPTOMS = ['fatigue', 'headache', 'bloating', 'anxiety', 'insomnia', 'joint pain', 'acidity', 'skin itching', 'low appetite', 'constipation']
const DOSHA = [
  { id: '',          label: '— skip —' },
  { id: 'vata',      label: '🌬️ Vata-ish (anxious / dry / cold)' },
  { id: 'pitta',     label: '🔥 Pitta-ish (irritable / hot / acid)' },
  { id: 'kapha',     label: '🌊 Kapha-ish (sluggish / heavy)' },
  { id: 'balanced',  label: '☯️ Balanced' },
]

function todayStr() { return new Date().toISOString().slice(0, 10) }

function StarRow({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div>
      <span className="block text-xs font-medium text-gray-700 mb-1.5">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? 0 : n)}
            className={`flex-1 py-2 text-sm rounded border ${value >= n ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-400 border-gray-200 hover:border-kerala-300'}`}
          >{n}</button>
        ))}
      </div>
    </div>
  )
}

export default function JournalPage() {
  const [today, setToday] = useState({
    date: todayStr(),
    mood: 0,
    sleepHours: 0,
    energy: 0,
    symptoms: [] as string[],
    doshaFeel: '',
    food: '',
    notes: '',
  })
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  // Summary state
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryProvider, setSummaryProvider] = useState<string | null>(null)
  const [summaryBusy, setSummaryBusy] = useState(false)
  const [summaryDays, setSummaryDays] = useState(7)
  const [summaryErr, setSummaryErr] = useState<string | null>(null)

  async function load() {
    setLoading(true); setErr(null)
    try {
      const res = await fetch('/api/me/journal', { credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { items: Entry[] }
      setEntries(data.items)
      // Pre-fill today's form if entry exists
      const existing = data.items.find((e) => e.date.slice(0, 10) === todayStr())
      if (existing) {
        setToday({
          date:       existing.date.slice(0, 10),
          mood:       existing.mood ?? 0,
          sleepHours: existing.sleepHours ?? 0,
          energy:     existing.energy ?? 0,
          symptoms:   existing.symptoms ?? [],
          doshaFeel:  existing.doshaFeel ?? '',
          food:       existing.food ?? '',
          notes:      existing.notes ?? '',
        })
      }
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr(null); setSavedAt(null)
    try {
      const res = await fetch('/api/me/journal', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          date: today.date,
          mood: today.mood || null,
          sleepHours: today.sleepHours || null,
          energy: today.energy || null,
          symptoms: today.symptoms,
          doshaFeel: today.doshaFeel || null,
          food: today.food,
          notes: today.notes,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setSavedAt(new Date().toLocaleTimeString())
      await load()
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setSaving(false) }
  }

  async function deleteEntry(id: string) {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/me/journal/${id}`, { method: 'DELETE', credentials: 'include' })
    await load()
  }

  async function generateSummary() {
    setSummaryBusy(true); setSummaryErr(null); setSummary(null)
    try {
      const res = await fetch(`/api/me/journal/summary?days=${summaryDays}`, { credentials: 'include' })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      const data = (await res.json()) as { summary: string; provider: string }
      setSummary(data.summary)
      setSummaryProvider(data.provider)
    } catch (e) { setSummaryErr(e instanceof Error ? e.message : String(e)) } finally { setSummaryBusy(false) }
  }

  function toggleSymptom(s: string) {
    setToday({ ...today, symptoms: today.symptoms.includes(s) ? today.symptoms.filter((x) => x !== s) : [...today.symptoms, s] })
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-kerala-700">Health journal</h1>
        <p className="text-sm text-muted mt-1">Daily 30-second log. The AI summary turns weeks of dots into trends you can act on.</p>
      </header>

      {/* Today's entry */}
      <form onSubmit={save} className="bg-white rounded-card border border-gray-100 shadow-card p-6 space-y-5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="font-semibold text-gray-900">Today, {new Date(today.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
          <input type="date" value={today.date} onChange={(e) => setToday({ ...today, date: e.target.value })} className="text-sm border rounded-md px-2 py-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StarRow value={today.mood}   onChange={(n) => setToday({ ...today, mood: n })}   label="Mood (1=poor, 5=great)" />
          <StarRow value={today.energy} onChange={(n) => setToday({ ...today, energy: n })} label="Energy (1=low, 5=high)" />
          <label className="block">
            <span className="block text-xs font-medium text-gray-700 mb-1.5">Sleep (hours)</span>
            <input type="number" step="0.5" min={0} max={24} value={today.sleepHours || ''} onChange={(e) => setToday({ ...today, sleepHours: Number(e.target.value) || 0 })} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="e.g. 7.5" />
          </label>
        </div>

        <div>
          <span className="block text-xs font-medium text-gray-700 mb-1.5">Symptoms today</span>
          <div className="flex flex-wrap gap-2">
            {SYMPTOMS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSymptom(s)}
                className={today.symptoms.includes(s) ? 'px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-medium' : 'px-3 py-1 rounded-full bg-white text-gray-600 border border-gray-200 hover:border-amber-300 text-xs'}
              >{s}</button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="block text-xs font-medium text-gray-700 mb-1.5">How does your dosha feel?</span>
          <select value={today.doshaFeel} onChange={(e) => setToday({ ...today, doshaFeel: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
            {DOSHA.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-gray-700 mb-1.5">Food log (optional)</span>
          <textarea value={today.food} onChange={(e) => setToday({ ...today, food: e.target.value })} rows={2} placeholder="e.g. Idli + sambar; payasam at lunch; light dinner" className="w-full border rounded-md px-3 py-2 text-sm" />
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-gray-700 mb-1.5">Notes (optional)</span>
          <textarea value={today.notes} onChange={(e) => setToday({ ...today, notes: e.target.value })} rows={2} className="w-full border rounded-md px-3 py-2 text-sm" />
        </label>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <div className="flex justify-end items-center gap-3">
          {savedAt && <span className="text-xs text-kerala-700">Saved at {savedAt}</span>}
          <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 px-5 py-2 bg-kerala-700 text-white rounded-md font-semibold hover:bg-kerala-800 disabled:opacity-50 text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save entry
          </button>
        </div>
      </form>

      {/* AI summary */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-kerala-50 border border-purple-100 rounded-card shadow-card p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h2 className="font-semibold text-purple-900 inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> AI weekly summary
          </h2>
          <div className="flex items-center gap-2">
            <select value={summaryDays} onChange={(e) => setSummaryDays(Number(e.target.value))} className="text-xs border rounded-md px-2 py-1 bg-white">
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
            <button onClick={generateSummary} disabled={summaryBusy || entries.length === 0} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-purple-700 text-white text-xs font-semibold rounded-md hover:bg-purple-800 disabled:opacity-50">
              {summaryBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Generate
            </button>
          </div>
        </div>

        {entries.length === 0 && <p className="text-sm text-gray-600">Log a few daily entries first, then come back for a personalised summary.</p>}
        {summaryErr && <p className="text-sm text-red-600">{summaryErr}</p>}
        {summary && (
          <div className="bg-white rounded-md border border-purple-100 p-4 text-sm text-gray-800 whitespace-pre-line leading-relaxed">
            {summary}
            {summaryProvider && <p className="mt-3 text-[10px] text-gray-400 uppercase tracking-wider">Generated by {summaryProvider}</p>}
          </div>
        )}
      </section>

      {/* History */}
      <section>
        <h2 className="font-semibold text-gray-900 mb-3 inline-flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-kerala-700" /> Recent entries
        </h2>
        {loading && <p className="text-sm text-muted">Loading…</p>}
        {!loading && entries.length === 0 && <p className="text-sm text-muted italic">No entries yet — add today&apos;s above.</p>}
        <div className="space-y-2">
          {entries.map((e) => (
            <article key={e.id} className="bg-white rounded-card border border-gray-100 p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900">
                  {new Date(e.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  {e.mood       != null && <span>mood {e.mood}/5</span>}
                  {e.energy     != null && <span>energy {e.energy}/5</span>}
                  {e.sleepHours != null && <span>{e.sleepHours}h sleep</span>}
                  {e.doshaFeel          && <span className="capitalize">{e.doshaFeel}</span>}
                </div>
                {e.symptoms.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {e.symptoms.map((s) => <span key={s} className="px-2 py-0.5 text-[10px] bg-amber-50 text-amber-800 rounded-full">{s}</span>)}
                  </div>
                )}
                {e.notes && <p className="text-xs text-gray-700 mt-2 line-clamp-2">{e.notes}</p>}
              </div>
              <button onClick={() => deleteEntry(e.id)} className="text-red-600 hover:bg-red-50 p-1 rounded" aria-label="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
