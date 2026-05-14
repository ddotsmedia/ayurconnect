'use client'

// Vitals dashboard — manual entry today; future-ready for wearable push
// via the same /api/me/vitals POST endpoint (source='apple_health' etc.).
// Includes simple inline SVG sparkline (no chart library needed).

import { useEffect, useState } from 'react'
import { Activity, Plus, Loader2, Heart, Thermometer, Droplet, Scale, Wind, Moon, Footprints, Zap, X } from 'lucide-react'

type Metric = {
  id: string
  kind: string
  value: number
  unit: string | null
  recordedAt: string
  source: string
  notes: string | null
}
type KindBound = { min: number; max: number; unit: string }
type LatestMap = Record<string, { value: number; recordedAt: string; source: string }>

const KIND_META: Record<string, { label: string; icon: typeof Activity; group: 'cardio' | 'metabolic' | 'sleep' }> = {
  bp_systolic:   { label: 'BP (systolic)',  icon: Heart,       group: 'cardio' },
  bp_diastolic:  { label: 'BP (diastolic)', icon: Heart,       group: 'cardio' },
  hr:            { label: 'Heart rate',     icon: Activity,    group: 'cardio' },
  spo2:          { label: 'SpO₂',           icon: Wind,        group: 'cardio' },
  hrv_ms:        { label: 'HRV',            icon: Activity,    group: 'cardio' },
  temp_c:        { label: 'Temperature',    icon: Thermometer, group: 'metabolic' },
  glucose_mg_dl: { label: 'Blood glucose',  icon: Droplet,     group: 'metabolic' },
  weight_kg:     { label: 'Weight',         icon: Scale,       group: 'metabolic' },
  sleep_hours:   { label: 'Sleep',          icon: Moon,        group: 'sleep' },
  steps:         { label: 'Steps',          icon: Footprints,  group: 'sleep' },
}

function Sparkline({ values, color = '#155228' }: { values: number[]; color?: string }) {
  if (values.length < 2) return <div className="h-10 flex items-center justify-center text-[10px] text-gray-300">Need more readings</div>
  const w = 200, h = 40, pad = 4
  const min = Math.min(...values), max = Math.max(...values)
  const range = max - min || 1
  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - 2 * pad)
    const y = h - pad - ((v - min) / range) * (h - 2 * pad)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10">
      <polyline fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" points={points.join(' ')} />
    </svg>
  )
}

export default function VitalsPage() {
  const [latest, setLatest] = useState<LatestMap>({})
  const [history, setHistory] = useState<Record<string, Metric[]>>({})
  const [kinds, setKinds] = useState<Record<string, KindBound>>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ kind: 'bp_systolic', value: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const [lRes, hRes] = await Promise.all([
        fetch('/api/me/vitals/latest', { credentials: 'include' }),
        fetch('/api/me/vitals?days=30', { credentials: 'include' }),
      ])
      if (lRes.ok) {
        const d = await lRes.json() as { latest: LatestMap; kinds: Record<string, KindBound> }
        setLatest(d.latest)
        setKinds(d.kinds)
      }
      if (hRes.ok) {
        const d = await hRes.json() as { items: Metric[] }
        const byKind: Record<string, Metric[]> = {}
        for (const m of d.items) {
          if (!byKind[m.kind]) byKind[m.kind] = []
          byKind[m.kind].push(m)
        }
        // Reverse for left-to-right time order in sparklines.
        for (const k of Object.keys(byKind)) byKind[k].reverse()
        setHistory(byKind)
      }
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    try {
      const res = await fetch('/api/me/vitals', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind: form.kind, value: Number(form.value), notes: form.notes || undefined }),
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      setShowForm(false)
      setForm({ kind: 'bp_systolic', value: '', notes: '' })
      await load()
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) } finally { setSaving(false) }
  }

  const allKinds = Object.keys(KIND_META)
  const groups: Array<{ id: string; label: string }> = [
    { id: 'cardio',    label: 'Cardiovascular' },
    { id: 'metabolic', label: 'Metabolic' },
    { id: 'sleep',     label: 'Sleep & activity' },
  ]

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl text-ink">Vitals</h1>
          <p className="text-sm text-muted mt-1">Track your blood pressure, glucose, weight, sleep and more. Manual entry today; wearable sync coming.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-kerala-700 text-white rounded-md text-sm hover:bg-kerala-800">
            <Plus className="w-4 h-4" /> Record vital
          </button>
        )}
      </header>

      {error && <div className="p-3 rounded bg-red-50 border border-red-100 text-red-800 text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={save} className="bg-white border border-gray-100 rounded-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-ink">Record a vital</h2>
            <button type="button" onClick={() => setShowForm(false)} className="p-1.5 rounded hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-gray-700 mb-1 block">Type</span>
              <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                {allKinds.map((k) => <option key={k} value={k}>{KIND_META[k].label} {kinds[k] ? `(${kinds[k].unit})` : ''}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700 mb-1 block">Value {kinds[form.kind] ? `(${kinds[form.kind].min}–${kinds[form.kind].max} ${kinds[form.kind].unit})` : ''}</span>
              <input required type="number" step="0.1" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-medium text-gray-700 mb-1 block">Notes <span className="text-gray-400">(optional)</span></span>
            <input className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="After exercise, fasting, etc." />
          </label>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-kerala-700 text-white text-sm rounded-md hover:bg-kerala-800 disabled:opacity-60">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}Save
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading…</div>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => {
            const groupKinds = allKinds.filter((k) => KIND_META[k].group === g.id)
            const hasAny = groupKinds.some((k) => latest[k])
            if (!hasAny) return null
            return (
              <section key={g.id}>
                <h2 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3">{g.label}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupKinds.map((k) => {
                    const m = latest[k]
                    if (!m) return null
                    const meta = KIND_META[k]
                    const Icon = meta.icon
                    const series = history[k]?.map((x) => x.value) ?? []
                    const bound = kinds[k]
                    const recorded = new Date(m.recordedAt)
                    return (
                      <div key={k} className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-500 inline-flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-kerala-600" /> {meta.label}
                          </span>
                          {m.source !== 'manual' && (
                            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full">{m.source}</span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-1.5 mb-2">
                          <span className="font-serif text-3xl text-kerala-800">{m.value}</span>
                          <span className="text-xs text-gray-500">{bound?.unit ?? ''}</span>
                        </div>
                        <Sparkline values={series} />
                        <div className="mt-2 text-[10px] text-gray-400">
                          {recorded.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {series.length} reading{series.length === 1 ? '' : 's'} / 30d
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}

          {Object.keys(latest).length === 0 && (
            <div className="text-center py-16 bg-white border border-gray-100 rounded-card">
              <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted">No vitals recorded yet.</p>
              <button onClick={() => setShowForm(true)} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-kerala-700 text-white rounded-md text-sm hover:bg-kerala-800">
                <Plus className="w-4 h-4" /> Record your first
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
