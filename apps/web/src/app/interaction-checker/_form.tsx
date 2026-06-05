'use client'

import { useEffect, useRef, useState } from 'react'
import { Leaf, Pill, X, Loader2, ChevronRight, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import Link from 'next/link'

type Sev = 'avoid' | 'caution' | 'info'
type Verified = { herb: string; drug: string; severityClinical: string; severity: Sev; mechanism: string | null; clinicalEffect: string; recommendation: string; evidenceLevel: string | null; source: 'verified' }
type AiResult = { herb: string; drug: string; severity: 'caution' | 'info'; mechanism: string; clinicalEffect: string; recommendation: string; source: 'ai-fallback'; provider?: string | null }
type Unknown  = { herb: string; drug: string; source: 'unknown'; reason: string }

type Suggest = { herbs: { name: string; sanskrit?: string }[]; drugs: string[] }
type CheckRes = {
  results: { verified: Verified[]; aiFallback: AiResult[]; unknown: Unknown[] }
  counts: { verified: number; aiFallback: number; unknown: number; avoid: number; caution: number; info: number }
}

export function InteractionCheckerForm() {
  const [herbs, setHerbs] = useState<string[]>([])
  const [drugs, setDrugs] = useState<string[]>([])
  const [busy, setBusy]   = useState(false)
  const [data, setData]   = useState<CheckRes | null>(null)
  const [err, setErr]     = useState<string | null>(null)

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const h = sp.get('herb'); if (h) setHerbs((prev) => prev.includes(h) ? prev : [...prev, h])
    const d = sp.get('drug'); if (d) setDrugs((prev) => prev.includes(d) ? prev : [...prev, d])
  }, [])

  function addHerb(v: string) { const t = v.trim(); if (!t || herbs.includes(t)) return; setHerbs([...herbs, t]) }
  function addDrug(v: string) { const t = v.trim(); if (!t || drugs.includes(t)) return; setDrugs([...drugs, t]) }
  function removeHerb(v: string) { setHerbs(herbs.filter((x) => x !== v)) }
  function removeDrug(v: string) { setDrugs(drugs.filter((x) => x !== v)) }

  async function check() {
    if (herbs.length === 0 || drugs.length === 0) { setErr('Add at least one herb and one medication.'); return }
    setBusy(true); setErr(null); setData(null)
    try {
      const r = await fetch('/api/interactions/check', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ herbs, drugs }),
      })
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `HTTP ${r.status}`)
      setData(await r.json() as CheckRes)
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  return (
    <div className="space-y-6">
      <section className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
        <h2 className="font-serif text-xl text-ink mb-4">Your current regimen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2 inline-flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-kerala-700" /> Ayurvedic herbs / formulations
            </label>
            <Autocomplete kind="herb" onPick={addHerb} placeholder="Type a herb name (e.g. Ashwagandha)" />
            <Chips items={herbs} onRemove={removeHerb} empty="No herbs added yet" tone="kerala" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2 inline-flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-amber-700" /> Allopathic medications
            </label>
            <Autocomplete kind="drug" onPick={addDrug} placeholder="Type a medication (e.g. Levothyroxine)" />
            <Chips items={drugs} onRemove={removeDrug} empty="No medications added yet" tone="amber" />
          </div>
        </div>

        {err && (
          <div className="mt-4 p-3 rounded bg-red-50 border border-red-100 text-sm text-red-800 inline-flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5" /> {err}
          </div>
        )}

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={check}
            disabled={busy || herbs.length === 0 || drugs.length === 0}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 text-white rounded text-sm font-semibold"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {busy ? 'Checking…' : 'Check interactions'}
          </button>
        </div>
      </section>

      {data && <Results data={data} />}
    </div>
  )
}

function Autocomplete({ kind, onPick, placeholder }: { kind: 'herb' | 'drug'; onPick: (v: string) => void; placeholder: string }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [sugg, setSugg] = useState<Suggest>({ herbs: [], drugs: [] })
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current)
    if (q.trim().length < 2) { setSugg({ herbs: [], drugs: [] }); return }
    timer.current = window.setTimeout(async () => {
      try {
        const r = await fetch(`/api/interactions/suggest?kind=${kind}&q=${encodeURIComponent(q)}`)
        if (r.ok) setSugg(await r.json() as Suggest)
      } catch { /* ignore */ }
    }, 220)
    return () => { if (timer.current) window.clearTimeout(timer.current) }
  }, [q, kind])

  const items: string[] = kind === 'herb' ? sugg.herbs.map((h) => h.name) : sugg.drugs

  return (
    <div className="relative">
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (q.trim()) { onPick(q.trim()); setQ('') } } }}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700"
      />
      {open && items.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-100 rounded shadow-cardLg max-h-56 overflow-y-auto">
          {items.map((it) => (
            <li key={it}>
              <button
                onMouseDown={(e) => { e.preventDefault(); onPick(it); setQ(''); setOpen(false) }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-kerala-50"
              >
                {it}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Chips({ items, onRemove, empty, tone }: { items: string[]; onRemove: (v: string) => void; empty: string; tone: 'kerala' | 'amber' }) {
  if (items.length === 0) return <p className="mt-2 text-xs text-gray-400">{empty}</p>
  const cls = tone === 'kerala' ? 'bg-kerala-50 text-kerala-800 border-kerala-200' : 'bg-amber-50 text-amber-800 border-amber-200'
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5">
      {items.map((it) => (
        <li key={it} className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${cls}`}>
          {it}
          <button onClick={() => onRemove(it)} aria-label={`remove ${it}`} className="ml-0.5 opacity-60 hover:opacity-100"><X className="w-3 h-3" /></button>
        </li>
      ))}
    </ul>
  )
}

function Results({ data }: { data: CheckRes }) {
  const { verified, aiFallback, unknown } = data.results
  const avoid   = verified.filter((v) => v.severity === 'avoid')
  const caution = [...verified.filter((v) => v.severity === 'caution'), ...aiFallback.filter((a) => a.severity === 'caution')]
  const info    = [...verified.filter((v) => v.severity === 'info'),    ...aiFallback.filter((a) => a.severity === 'info')]

  return (
    <section aria-live="polite" className="space-y-4">
      <header className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-serif text-xl text-ink">Results</h2>
        <p className="text-xs text-gray-500">
          {data.counts.verified} verified · {data.counts.aiFallback} AI fallback · {data.counts.unknown} unknown
        </p>
      </header>

      {avoid.length > 0 && (
        <SeverityGroup tone="red" icon={AlertTriangle} title={`Avoid · ${avoid.length}`}>
          {avoid.map((r) => <VerifiedCard key={`${r.herb}|${r.drug}|${r.severity}`} r={r} />)}
        </SeverityGroup>
      )}

      {caution.length > 0 && (
        <SeverityGroup tone="amber" icon={AlertCircle} title={`Use with caution · ${caution.length}`}>
          {caution.map((r) =>
            r.source === 'verified'
              ? <VerifiedCard key={`v|${r.herb}|${r.drug}`} r={r} />
              : <AiCard       key={`a|${r.herb}|${r.drug}`} r={r as AiResult} />,
          )}
        </SeverityGroup>
      )}

      {info.length > 0 && (
        <SeverityGroup tone="gray" icon={Info} title={`General information · ${info.length}`}>
          {info.map((r) =>
            r.source === 'verified'
              ? <VerifiedCard key={`v|${r.herb}|${r.drug}`} r={r} />
              : <AiCard       key={`a|${r.herb}|${r.drug}`} r={r as AiResult} />,
          )}
        </SeverityGroup>
      )}

      {unknown.length > 0 && (
        <SeverityGroup tone="gray" icon={Info} title={`Not in our database · ${unknown.length}`}>
          <p className="text-sm text-gray-700">
            We don&apos;t yet have verified data on the following pair{unknown.length === 1 ? '' : 's'}:
          </p>
          <ul className="mt-2 text-sm text-gray-700 list-disc pl-5">
            {unknown.map((u) => <li key={`${u.herb}|${u.drug}`}><strong>{u.herb}</strong> + <strong>{u.drug}</strong></li>)}
          </ul>
          <p className="mt-3 text-sm text-gray-700">
            Please confirm with a verified Ayurveda doctor before combining.
          </p>
        </SeverityGroup>
      )}

      <DoctorCta />
    </section>
  )
}

function SeverityGroup({ tone, icon: Icon, title, children }: { tone: 'red' | 'amber' | 'gray'; icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  const banner =
    tone === 'red'   ? 'bg-red-50 border-red-200 text-red-900'
    : tone === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-900'
    :                    'bg-gray-50 border-gray-200 text-gray-800'
  return (
    <section className={`border rounded-card p-4 ${banner}`}>
      <h3 className="inline-flex items-center gap-2 font-semibold mb-2"><Icon className="w-4 h-4" /> {title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function VerifiedCard({ r }: { r: Verified }) {
  return (
    <article className="bg-white border border-gray-100 rounded p-4">
      <p className="font-semibold text-ink">
        <span className="text-kerala-800">{r.herb}</span> + <span className="text-amber-800">{r.drug}</span>
        <span className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 align-middle">Verified</span>
        {r.evidenceLevel && <span className="ml-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 align-middle">{r.evidenceLevel}</span>}
      </p>
      {r.mechanism      && <p className="text-xs text-gray-600 mt-2"><span className="font-semibold text-gray-700">Mechanism:</span> {r.mechanism}</p>}
      <p className="text-xs text-gray-700 mt-2"><span className="font-semibold text-gray-800">Clinical effect:</span> {r.clinicalEffect}</p>
      <p className="text-xs text-gray-700 mt-2"><span className="font-semibold text-gray-800">Recommendation:</span> {r.recommendation}</p>
    </article>
  )
}

function AiCard({ r }: { r: AiResult }) {
  return (
    <article className="bg-white border border-gray-100 rounded p-4">
      <p className="font-semibold text-ink">
        <span className="text-kerala-800">{r.herb}</span> + <span className="text-amber-800">{r.drug}</span>
        <span className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 align-middle">AI fallback</span>
      </p>
      {r.mechanism      && <p className="text-xs text-gray-600 mt-2"><span className="font-semibold text-gray-700">Mechanism:</span> {r.mechanism}</p>}
      <p className="text-xs text-gray-700 mt-2"><span className="font-semibold text-gray-800">Clinical effect:</span> {r.clinicalEffect}</p>
      <p className="text-xs text-gray-700 mt-2"><span className="font-semibold text-gray-800">Recommendation:</span> {r.recommendation}</p>
      <p className="mt-2 text-[10px] text-gray-500 italic">
        Not in our verified database — confirm with your doctor. AI-generated assessments are capped at &quot;caution&quot; severity.
      </p>
    </article>
  )
}

function DoctorCta() {
  return (
    <section className="mt-2 bg-cream border border-gray-100 rounded-card p-5 text-center">
      <p className="text-sm text-gray-800">
        Found a flag you&apos;re unsure about? Book a consultation with a verified Ayurveda doctor.
      </p>
      <Link href="/doctors" className="mt-3 inline-flex items-center gap-1 px-5 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">
        Browse verified doctors <ChevronRight className="w-4 h-4" />
      </Link>
    </section>
  )
}
