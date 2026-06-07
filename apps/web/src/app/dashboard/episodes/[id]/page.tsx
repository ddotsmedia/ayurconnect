'use client'

import { useEffect, useState, use as usePromise } from 'react'
import Link from 'next/link'
import { Loader2, ArrowLeft, Save, AlertCircle, ShieldCheck, ShieldOff, Pause, Play, CheckCircle2 } from 'lucide-react'

type Log = { id: string; date: string; severity: number; energy: number | null; sleepQuality: number | null; mood: number | null; note: string | null }
type Episode = {
  id: string; condition: string; conditionSlug: string | null
  status: 'active' | 'completed' | 'paused' | 'abandoned'
  startDate: string; endDate: string | null; protocolNotes: string | null
  consentForResearch: boolean
  logs: Log[]
}

export default function EpisodeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params)
  const [ep, setEp]         = useState<Episode | null>(null)
  const [err, setErr]       = useState<string | null>(null)
  const [busy, setBusy]     = useState(false)
  const [draft, setDraft]   = useState({ severity: 5, energy: 5, sleepQuality: 5, mood: 5, note: '' })
  const [saved, setSaved]   = useState(false)

  async function load() {
    setErr(null)
    try {
      const r = await fetch(`/api/episodes/${id}`)
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `HTTP ${r.status}`)
      const j = await r.json() as { episode: Episode }
      setEp(j.episode)
      const today = j.episode.logs.find((l) => isSameDay(l.date, new Date()))
      if (today) {
        setDraft({
          severity:     today.severity,
          energy:       today.energy       ?? 5,
          sleepQuality: today.sleepQuality ?? 5,
          mood:         today.mood         ?? 5,
          note:         today.note         ?? '',
        })
      }
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) }
  }
  useEffect(() => { void load() }, [id])

  async function saveLog() {
    setBusy(true); setErr(null); setSaved(false)
    try {
      const r = await fetch(`/api/episodes/${id}/logs`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...draft, date: new Date().toISOString() }),
      })
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `HTTP ${r.status}`)
      setSaved(true)
      void load()
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  async function patchEpisode(body: Record<string, unknown>) {
    try {
      const r = await fetch(`/api/episodes/${id}`, {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `HTTP ${r.status}`)
      void load()
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) }
  }

  if (!ep && !err) return <Loader2 className="w-5 h-5 animate-spin text-kerala-700" />
  if (!ep) return <p className="text-sm text-red-700">{err}</p>

  return (
    <main className="space-y-6">
      <Link href="/dashboard/episodes" className="inline-flex items-center gap-1 text-sm text-kerala-700 hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" /> All episodes
      </Link>

      <header className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <p className="text-xs text-muted">
              Started {new Date(ep.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              {ep.endDate && ` · Ended ${new Date(ep.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
            </p>
            <h1 className="font-serif text-2xl text-ink">{ep.condition}</h1>
            <p className="text-xs text-muted mt-1 capitalize">Status: <strong>{ep.status}</strong></p>
            {ep.protocolNotes && <p className="text-sm text-gray-700 mt-2 leading-relaxed">{ep.protocolNotes}</p>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ep.status === 'active' && (
              <>
                <button onClick={() => patchEpisode({ status: 'paused' })} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded text-xs hover:bg-gray-50">
                  <Pause className="w-3.5 h-3.5" /> Pause
                </button>
                <button onClick={() => patchEpisode({ status: 'completed', endDate: new Date().toISOString() })} className="inline-flex items-center gap-1 px-3 py-1.5 border border-emerald-200 text-emerald-800 rounded text-xs hover:bg-emerald-50">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                </button>
              </>
            )}
            {ep.status === 'paused' && (
              <button onClick={() => patchEpisode({ status: 'active' })} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded text-xs hover:bg-gray-50">
                <Play className="w-3.5 h-3.5" /> Resume
              </button>
            )}
            <button
              onClick={() => patchEpisode({ consentForResearch: !ep.consentForResearch })}
              className={'inline-flex items-center gap-1 px-3 py-1.5 border rounded text-xs ' + (ep.consentForResearch ? 'border-emerald-200 text-emerald-800 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50')}
            >
              {ep.consentForResearch ? <><ShieldCheck className="w-3.5 h-3.5" /> Sharing anonymously</> : <><ShieldOff className="w-3.5 h-3.5" /> Not contributing to research</>}
            </button>
          </div>
        </div>
      </header>

      {/* Today's check-in */}
      {ep.status === 'active' && (
        <section className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
          <h2 className="font-serif text-lg text-ink mb-3">Today&apos;s check-in</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Slider label="Primary symptom severity" hint="0 = no symptom · 10 = worst imaginable" v={draft.severity}     onChange={(v) => setDraft({ ...draft, severity: v })} red />
            <Slider label="Energy"                   hint="0 = exhausted · 10 = energetic"        v={draft.energy}       onChange={(v) => setDraft({ ...draft, energy: v })} />
            <Slider label="Sleep quality"            hint="0 = terrible · 10 = restful"           v={draft.sleepQuality} onChange={(v) => setDraft({ ...draft, sleepQuality: v })} />
            <Slider label="Mood"                     hint="0 = very low · 10 = excellent"         v={draft.mood}         onChange={(v) => setDraft({ ...draft, mood: v })} />
          </div>
          <textarea
            className="w-full mt-3 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700 min-h-[70px]"
            placeholder="Anything else? (optional — max 1000 chars)"
            maxLength={1000}
            value={draft.note}
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
          />
          {err && (
            <div className="mt-3 p-3 rounded bg-red-50 border border-red-100 text-sm text-red-800 inline-flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5" /> {err}
            </div>
          )}
          {saved && <p className="mt-3 text-sm text-emerald-700 inline-flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Saved today&apos;s log.</p>}
          <div className="mt-4 flex justify-end">
            <button onClick={saveLog} disabled={busy} className="inline-flex items-center gap-1 px-5 py-2 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 text-white rounded text-sm font-semibold">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save check-in
            </button>
          </div>
        </section>
      )}

      <TrendChart logs={ep.logs} />
    </main>
  )
}

function Slider({ label, hint, v, onChange, red }: { label: string; hint: string; v: number; onChange: (v: number) => void; red?: boolean }) {
  const colour = red ? 'accent-red-600' : 'accent-kerala-700'
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-xs uppercase tracking-wider font-semibold text-gray-600">{label}</label>
        <span className={'text-sm font-bold ' + (red ? 'text-red-700' : 'text-kerala-700')}>{v}</span>
      </div>
      <p className="text-[10px] text-gray-400 mb-1">{hint}</p>
      <input type="range" min={0} max={10} value={v} onChange={(e) => onChange(parseInt(e.target.value, 10))} className={'w-full ' + colour} />
    </div>
  )
}

function TrendChart({ logs }: { logs: Log[] }) {
  if (logs.length === 0) {
    return (
      <section className="bg-white border border-gray-100 rounded-card p-10 text-center shadow-card">
        <p className="text-gray-700">No logs yet — your trend chart appears after the first check-in.</p>
      </section>
    )
  }
  // Always show last 30 logs (most recent rightmost).
  const recent = logs.slice(-30)
  const W = 720
  const H = 220
  const padX = 30
  const padY = 18
  const step = recent.length > 1 ? (W - 2 * padX) / (recent.length - 1) : 0
  const yOf = (v: number | null) => v == null ? null : padY + (H - 2 * padY) * (1 - v / 10)

  const seriesDef: Array<{ key: keyof Log; label: string; colour: string }> = [
    { key: 'severity',     label: 'Severity',      colour: '#dc2626' }, // red-600
    { key: 'energy',       label: 'Energy',        colour: '#0891b2' }, // cyan-600
    { key: 'sleepQuality', label: 'Sleep quality', colour: '#7c3aed' }, // violet-600
    { key: 'mood',         label: 'Mood',          colour: '#15803d' }, // green-700
  ]

  function pathFor(key: keyof Log): string {
    const pts: string[] = []
    recent.forEach((l, i) => {
      const v = l[key] as number | null
      const y = yOf(v)
      if (y === null) return
      const x = padX + step * i
      pts.push((pts.length === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1))
    })
    return pts.join(' ')
  }

  return (
    <section className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
      <header className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <h2 className="font-serif text-lg text-ink">Trend ({recent.length} log{recent.length === 1 ? '' : 's'})</h2>
        <div className="flex flex-wrap gap-3 text-[11px] text-gray-700">
          {seriesDef.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-0.5" style={{ backgroundColor: s.colour }} /> {s.label}
            </span>
          ))}
        </div>
      </header>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {[0, 5, 10].map((y) => {
          const yy = yOf(y)!
          return <line key={y} x1={padX} x2={W - padX} y1={yy} y2={yy} stroke="#e5e7eb" strokeWidth={1} strokeDasharray="2 3" />
        })}
        <text x={4}      y={yOf(0)!  + 4} fontSize={9} fill="#9ca3af">0</text>
        <text x={4}      y={yOf(5)!  + 4} fontSize={9} fill="#9ca3af">5</text>
        <text x={4}      y={yOf(10)! + 4} fontSize={9} fill="#9ca3af">10</text>
        {seriesDef.map((s) => (
          <path key={s.key} d={pathFor(s.key)} fill="none" stroke={s.colour} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
      <p className="text-[11px] text-gray-500 mt-2">
        First → last: {new Date(recent[0]!.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} → {new Date(recent[recent.length - 1]!.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
      </p>
    </section>
  )
}

function isSameDay(iso: string, d: Date): boolean {
  const a = new Date(iso); a.setUTCHours(0, 0, 0, 0)
  const b = new Date(d);   b.setUTCHours(0, 0, 0, 0)
  return a.getTime() === b.getTime()
}
