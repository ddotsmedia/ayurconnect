'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, AlertCircle, Printer, Share2, Bell, BellOff, Salad, Activity, Leaf, Clock, Sparkles } from 'lucide-react'
import { CLIMATES, RITU_INFO, detectClimate, currentRitu, type Climate, type Ritu } from '../../lib/data/climate-seasons'

type Regimen = {
  summary: string
  ahara:      { favor: string[]; reduce: string[] }
  vihara:     { favor: string[]; reduce: string[] }
  dinacharya: string[]
  herbs:      { favor: string[]; reduce: string[] }
  redFlags?:  string[]
}
type GenRes = { regimen: Regimen; dosha: string; ritu: Ritu; climate: Climate; cached: boolean; generatedAt: string; provider?: string }

const DOSHAS = [
  { v: 'vata',           label: 'Vata' },
  { v: 'pitta',          label: 'Pitta' },
  { v: 'kapha',          label: 'Kapha' },
  { v: 'vata-pitta',     label: 'Vata–Pitta' },
  { v: 'pitta-kapha',    label: 'Pitta–Kapha' },
  { v: 'vata-kapha',     label: 'Vata–Kapha' },
  { v: 'tridoshic',      label: 'Tridoshic (balanced)' },
] as const

const NOTIFY_KEY = 'ayur_ritucharya_notify'

export function RitucharyaForm() {
  const [dosha, setDosha]     = useState<string>('')
  const [city, setCity]       = useState<string>('')
  const [climate, setClimate] = useState<Climate | ''>('')
  const [busy, setBusy]       = useState(false)
  const [data, setData]       = useState<GenRes | null>(null)
  const [err, setErr]         = useState<string | null>(null)
  const [notify, setNotify]   = useState<boolean>(false)
  const printRef              = useRef<HTMLDivElement>(null)

  // Try to prefill dosha from API (signed-in user) → fall back to localStorage from /prakriti-quiz
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/prakriti/me')
        if (r.ok) {
          const j = await r.json() as { assessment?: { dominant?: string } | null }
          if (j.assessment?.dominant) { setDosha(j.assessment.dominant); return }
        }
      } catch { /* 401/network: fall through */ }
      try {
        const local = localStorage.getItem('ayur-prakriti-result')
        if (local && DOSHAS.find((d) => d.v === local)) setDosha(local)
      } catch { /* ignore */ }
    })()
    try { setNotify(localStorage.getItem(NOTIFY_KEY) === '1') } catch { /* ignore */ }
  }, [])

  // Auto-detect climate from city (no network — local map)
  useEffect(() => {
    if (!city) return
    const detected = detectClimate(city)
    if (detected) setClimate(detected)
  }, [city])

  async function generate() {
    if (!dosha) { setErr('Please choose your prakriti (or take the Prakriti Quiz first).'); return }
    if (!climate && !city) { setErr('Please enter your city or pick a climate.'); return }
    setBusy(true); setErr(null); setData(null)
    try {
      const r = await fetch('/api/ritucharya/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ dosha, city: city || undefined, climate: climate || undefined }),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({})) as { error?: string; reason?: string }
        const friendly =
          j.reason === 'no-credits' || j.reason === 'not-configured' || j.reason === 'AI not configured'
            ? 'The seasonal-regimen generator is temporarily offline. Please try again in a few minutes.'
            : j.reason === 'rate-limited'
              ? 'We\'re generating a lot of regimens right now — please try again in a minute.'
              : (j.error ?? `HTTP ${r.status}`)
        throw new Error(friendly)
      }
      setData(await r.json() as GenRes)
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  function toggleNotify() {
    const next = !notify; setNotify(next)
    try { localStorage.setItem(NOTIFY_KEY, next ? '1' : '0') } catch { /* ignore */ }
  }

  function share() {
    if (!data) return
    const txt = formatPlainText(data)
    if (navigator.share) {
      navigator.share({ title: 'My Ritucharya regimen', text: txt }).catch(() => { void copyText(txt) })
    } else {
      void copyText(txt)
    }
  }

  // Show a preview of detected/upcoming ritu in the picker UI
  const previewRitu: Ritu | null = climate ? currentRitu(new Date(), climate).ritu : null

  const ic = 'w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700'

  return (
    <div className="space-y-6">
      <section className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
        <h2 className="font-serif text-xl text-ink mb-4">Your inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5 block">Prakriti</label>
            <select className={ic} value={dosha} onChange={(e) => setDosha(e.target.value)}>
              <option value="">— select —</option>
              {DOSHAS.map((d) => <option key={d.v} value={d.v}>{d.label}</option>)}
            </select>
            <p className="text-[11px] text-gray-500 mt-1">
              Not sure? <a href="/prakriti-quiz" className="text-kerala-700 hover:underline">Take the Prakriti Quiz</a>.
            </p>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5 block">City (auto-detects climate)</label>
            <input className={ic} value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Dubai, Kochi, London, Riyadh" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5 block">Climate (override)</label>
            <select className={ic} value={climate} onChange={(e) => setClimate(e.target.value as Climate | '')}>
              <option value="">— auto from city —</option>
              {CLIMATES.map((c) => <option key={c.climate} value={c.climate}>{c.label}</option>)}
            </select>
          </div>
        </div>

        {previewRitu && (
          <p className="mt-3 text-sm text-gray-700">
            Today maps to <strong>{RITU_INFO[previewRitu].label}</strong> {RITU_INFO[previewRitu].sanskrit !== '—' && <span className="text-gray-400">({RITU_INFO[previewRitu].sanskrit})</span>}
            — dominant dosha: <span className="capitalize">{RITU_INFO[previewRitu].dominantDosha}</span>.
          </p>
        )}

        {err && (
          <div className="mt-4 p-3 rounded bg-red-50 border border-red-100 text-sm text-red-800 inline-flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5" /> {err}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
          <button onClick={generate} disabled={busy || !dosha} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 text-white rounded text-sm font-semibold">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {busy ? 'Generating…' : 'Generate regimen'}
          </button>
        </div>
      </section>

      {data && (
        <div ref={printRef} className="space-y-4 print:space-y-3">
          <header className="bg-white border border-gray-100 rounded-card p-5 shadow-card flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-gray-500">
                {RITU_INFO[data.ritu].label} · {CLIMATES.find((c) => c.climate === data.climate)?.label ?? data.climate}
              </p>
              <h2 className="font-serif text-2xl text-ink mt-1">
                Regimen for <span className="capitalize">{data.dosha.replace('-', '–')}</span>
              </h2>
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">{data.regimen.summary}</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button onClick={() => window.print()} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded text-xs hover:bg-gray-50" title="Print or save as PDF">
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button onClick={share} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded text-xs hover:bg-gray-50" title="Share or copy to clipboard">
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
              <button onClick={toggleNotify} className={'inline-flex items-center gap-1 px-3 py-1.5 border rounded text-xs ' + (notify ? 'border-kerala-700 text-kerala-700 bg-kerala-50' : 'border-gray-200 hover:bg-gray-50')} title="Notify me when the season changes">
                {notify ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                {notify ? 'Notify on' : 'Notify'}
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DualList icon={Salad}    title="Ahara (diet)"      favorTitle="Favor"   reduceTitle="Reduce" favor={data.regimen.ahara.favor}      reduce={data.regimen.ahara.reduce} />
            <DualList icon={Activity} title="Vihara (lifestyle)" favorTitle="Favor"   reduceTitle="Reduce" favor={data.regimen.vihara.favor}     reduce={data.regimen.vihara.reduce} />
            <SingleList icon={Clock}  title="Dinacharya (daily routine)" items={data.regimen.dinacharya} />
            <DualList icon={Leaf}     title="Herbs"             favorTitle="Favor"   reduceTitle="Reduce" favor={data.regimen.herbs.favor}      reduce={data.regimen.herbs.reduce} />
          </div>

          {data.regimen.redFlags && data.regimen.redFlags.length > 0 && (
            <section className="border border-amber-200 bg-amber-50 rounded-card p-5 text-amber-900 print:bg-white print:border-amber-300">
              <h3 className="font-serif text-lg inline-flex items-center gap-2 mb-2"><AlertCircle className="w-5 h-5" /> Consult a doctor if you notice</h3>
              <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
                {data.regimen.redFlags.map((rf) => <li key={rf}>{rf}</li>)}
              </ul>
            </section>
          )}

          <p className="text-center text-xs text-gray-500 print:text-[10px]">
            Generated {new Date(data.generatedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
            {data.cached && ' (cached this session)'}
            {data.provider && ` · ${data.provider}`}
          </p>
        </div>
      )}

      {data && (
        <style>{`
          @media print {
            body * { visibility: hidden !important; }
            section[aria-live], main, header, footer, nav, aside { display: none !important; }
            div[ref] *, [data-print-root] * { visibility: visible !important; }
          }
        `}</style>
      )}
    </div>
  )
}

function SingleList({ icon: Icon, title, items }: { icon: React.ComponentType<{ className?: string }>; title: string; items: string[] }) {
  return (
    <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
      <h3 className="font-serif text-lg text-ink inline-flex items-center gap-2 mb-3"><Icon className="w-5 h-5 text-kerala-700" /> {title}</h3>
      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1.5">{items.map((it) => <li key={it}>{it}</li>)}</ul>
    </article>
  )
}

function DualList({ icon: Icon, title, favorTitle, reduceTitle, favor, reduce }: { icon: React.ComponentType<{ className?: string }>; title: string; favorTitle: string; reduceTitle: string; favor: string[]; reduce: string[] }) {
  return (
    <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
      <h3 className="font-serif text-lg text-ink inline-flex items-center gap-2 mb-3"><Icon className="w-5 h-5 text-kerala-700" /> {title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold mb-1">{favorTitle}</p>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">{favor.map((it) => <li key={it}>{it}</li>)}</ul>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-red-700 font-semibold mb-1">{reduceTitle}</p>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">{reduce.map((it) => <li key={it}>{it}</li>)}</ul>
        </div>
      </div>
    </article>
  )
}

function formatPlainText(d: GenRes): string {
  const lines = [
    `Ritucharya — ${d.dosha} in ${d.climate}`,
    d.regimen.summary,
    '',
    'AHARA (diet)',
    '  Favor:  ' + d.regimen.ahara.favor.join(', '),
    '  Reduce: ' + d.regimen.ahara.reduce.join(', '),
    '',
    'VIHARA (lifestyle)',
    '  Favor:  ' + d.regimen.vihara.favor.join(', '),
    '  Reduce: ' + d.regimen.vihara.reduce.join(', '),
    '',
    'DINACHARYA',
    ...d.regimen.dinacharya.map((s) => '  • ' + s),
    '',
    'HERBS',
    '  Favor:  ' + d.regimen.herbs.favor.join(', '),
    '  Reduce: ' + d.regimen.herbs.reduce.join(', '),
  ]
  if (d.regimen.redFlags?.length) {
    lines.push('', 'CONSULT A DOCTOR IF:', ...d.regimen.redFlags.map((s) => '  • ' + s))
  }
  lines.push('', 'Generated by AyurConnect · https://ayurconnect.com/ritucharya')
  return lines.join('\n')
}

async function copyText(text: string): Promise<void> {
  try { await navigator.clipboard.writeText(text) } catch { /* ignore */ }
}
