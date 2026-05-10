'use client'

import { useEffect, useState } from 'react'
import { Loader2, IndianRupee, BarChart3, Calculator } from 'lucide-react'

type GovtScale = { role: string; min: number; max: number; scale?: string; source: string }
type Insights = {
  live: {
    records: number
    withSalary: number
    min: number | null
    avg: number | null
    max: number | null
    byCategory: Array<{ category: string; count: number; avg: number }>
    bySource:   Array<{ source: string;   count: number; avg: number }>
  }
  govtScales: GovtScale[]
}

const DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode',
  'Wayanad', 'Kannur', 'Kasaragod',
]
const SPECS = ['Panchakarma', 'Kayachikitsa', 'Prasuti Tantra', 'Kaumarbhritya', 'Shalya', 'Manasika', 'Rasashastra']

function inr(n: number | null | undefined): string {
  if (n == null) return '—'
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

export default function SalaryInsightsPage() {
  const [specialization, setSpec] = useState('')
  const [district, setDistrict]   = useState('')
  const [insights, setInsights]   = useState<Insights | null>(null)
  const [loading, setLoading]     = useState(true)
  const [err, setErr]             = useState<string | null>(null)

  // Estimator state
  const [estQual, setEstQual]   = useState('BAMS')
  const [estYears, setEstYears] = useState(2)
  const [estDist, setEstDist]   = useState('')
  const [estimate, setEstimate] = useState<{ low: number; mid: number; high: number; reasoning: string[] } | null>(null)
  const [estBusy, setEstBusy]   = useState(false)

  async function load() {
    setLoading(true); setErr(null)
    try {
      const params = new URLSearchParams()
      if (specialization) params.set('specialization', specialization)
      if (district)       params.set('district', district)
      const res = await fetch(`/api/salary/insights?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setInsights(await res.json() as Insights)
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [specialization, district]) // eslint-disable-line react-hooks/exhaustive-deps

  async function runEstimate() {
    setEstBusy(true)
    try {
      const params = new URLSearchParams({
        qualification:   estQual,
        experienceYears: String(estYears),
        district:        estDist,
      })
      const res = await fetch(`/api/salary/estimate?${params}`)
      if (res.ok) setEstimate(await res.json())
    } catch { /* ignore */ } finally { setEstBusy(false) }
  }
  useEffect(() => { runEstimate() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <header className="text-center mb-8">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-700">
            <IndianRupee className="w-6 h-6" />
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-kerala-700 mt-3">Kerala Ayurveda salary insights</h1>
          <p className="text-sm text-muted mt-1 max-w-xl mx-auto">
            Live data from imported job listings (last 6 months) plus reference Kerala govt pay scales.
          </p>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-card border border-gray-100 shadow-card p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <label>
            <span className="block text-xs font-medium text-gray-700 mb-1.5">Specialisation</span>
            <select value={specialization} onChange={(e) => setSpec(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
              <option value="">All specialisations</option>
              {SPECS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>
            <span className="block text-xs font-medium text-gray-700 mb-1.5">District</span>
            <select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
              <option value="">All districts</option>
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
        </div>

        {loading && <div className="text-center text-sm text-gray-500"><Loader2 className="w-4 h-4 inline animate-spin mr-2" /> Loading…</div>}
        {err && <p className="text-sm text-red-600">{err}</p>}

        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Live aggregates */}
            <article className="bg-white rounded-card border border-gray-100 shadow-card p-5 md:col-span-2">
              <h2 className="font-semibold text-gray-900 inline-flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-kerala-700" /> Live data — last 6 months
              </h2>
              {insights.live.withSalary === 0 ? (
                <p className="text-sm text-muted italic">No salary-tagged listings yet for this filter. Check back as more jobs are scraped.</p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <Pill label="Min"     value={inr(insights.live.min)} tone="emerald" />
                    <Pill label="Average" value={inr(insights.live.avg)} tone="amber" />
                    <Pill label="Max"     value={inr(insights.live.max)} tone="kerala" />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">Based on {insights.live.withSalary} of {insights.live.records} matching listings (others had non-numeric salary like &ldquo;negotiable&rdquo;).</p>
                  {insights.live.byCategory.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs font-medium text-gray-700 mb-2">Average by category</div>
                      <BarList items={insights.live.byCategory.map((c) => ({ label: c.category, value: c.avg, count: c.count }))} fmt={inr} />
                    </div>
                  )}
                </>
              )}
            </article>

            {/* Govt reference scales */}
            <article className="bg-white rounded-card border border-gray-100 shadow-card p-5 md:col-span-2">
              <h2 className="font-semibold text-gray-900 mb-3">Reference Kerala govt + private pay scales</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="text-left p-2">Role</th>
                      <th className="text-right p-2">Min</th>
                      <th className="text-right p-2">Max</th>
                      <th className="text-left p-2">Scale</th>
                      <th className="text-left p-2">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {insights.govtScales.map((g) => (
                      <tr key={g.role}>
                        <td className="p-2 text-gray-900">{g.role}</td>
                        <td className="p-2 text-right tabular-nums">{inr(g.min)}</td>
                        <td className="p-2 text-right tabular-nums">{inr(g.max)}</td>
                        <td className="p-2 text-xs text-gray-500">{g.scale ?? '—'}</td>
                        <td className="p-2 text-xs">
                          <span className={
                            g.source === 'kerala-psc' ? 'px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px]' :
                            g.source === 'nhm-kerala' ? 'px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px]' :
                                                        'px-1.5 py-0.5 bg-gray-50 text-gray-600 rounded text-[10px]'
                          }>{g.source}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            {/* Personal estimator */}
            <article className="bg-purple-50 border border-purple-200 rounded-card p-5 md:col-span-2">
              <h2 className="font-semibold text-purple-900 inline-flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4" /> Estimate your expected salary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label>
                  <span className="block text-xs font-medium text-purple-900 mb-1.5">Qualification</span>
                  <select value={estQual} onChange={(e) => setEstQual(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                    <option>BAMS</option>
                    <option>BAMS + MD</option>
                    <option>BAMS + MS</option>
                    <option>PhD Ayurveda</option>
                  </select>
                </label>
                <label>
                  <span className="block text-xs font-medium text-purple-900 mb-1.5">Experience (years)</span>
                  <input type="number" min={0} max={50} value={estYears} onChange={(e) => setEstYears(Number(e.target.value) || 0)} className="w-full border rounded-md px-3 py-2 text-sm" />
                </label>
                <label>
                  <span className="block text-xs font-medium text-purple-900 mb-1.5">District</span>
                  <select value={estDist} onChange={(e) => setEstDist(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                    <option value="">Any</option>
                    {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>
              </div>
              <button
                onClick={runEstimate}
                disabled={estBusy}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 text-white text-sm font-semibold rounded-md hover:bg-purple-800 disabled:opacity-50"
              >
                {estBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                Recalculate
              </button>

              {estimate && (
                <div className="mt-4 bg-white rounded-md p-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <Pill label="Low end"  value={inr(estimate.low)}  tone="gray"   />
                    <Pill label="Likely"   value={inr(estimate.mid)}  tone="purple" />
                    <Pill label="High end" value={inr(estimate.high)} tone="kerala" />
                  </div>
                  {estimate.reasoning.length > 0 && (
                    <ul className="mt-3 text-xs text-gray-700 list-disc list-inside space-y-0.5">
                      {estimate.reasoning.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </article>
          </div>
        )}
      </div>
    </div>
  )
}

function Pill({ label, value, tone }: { label: string; value: string; tone: 'emerald' | 'amber' | 'kerala' | 'purple' | 'gray' }) {
  const TONE = {
    emerald: 'bg-emerald-50 text-emerald-800',
    amber:   'bg-amber-50 text-amber-800',
    kerala:  'bg-kerala-50 text-kerala-800',
    purple:  'bg-purple-100 text-purple-900',
    gray:    'bg-gray-100 text-gray-700',
  } as const
  return (
    <div className={`rounded-md p-3 text-center ${TONE[tone]}`}>
      <div className="text-2xl font-serif tabular-nums">{value}</div>
      <div className="text-[11px] opacity-80 mt-0.5">{label}</div>
    </div>
  )
}

function BarList({ items, fmt }: { items: Array<{ label: string; value: number; count: number }>; fmt: (n: number) => string }) {
  const peak = Math.max(...items.map((i) => i.value), 1)
  return (
    <div className="space-y-1.5">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2 text-xs">
          <span className="w-32 capitalize text-gray-700 truncate" title={it.label}>{it.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="bg-kerala-500 h-full rounded-full" style={{ width: `${(it.value / peak) * 100}%` }} />
          </div>
          <span className="w-20 text-right text-gray-900 tabular-nums">{fmt(it.value)}</span>
          <span className="w-10 text-right text-gray-400 tabular-nums">×{it.count}</span>
        </div>
      ))}
    </div>
  )
}
