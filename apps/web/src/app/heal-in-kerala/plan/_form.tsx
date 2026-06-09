'use client'

import { useState } from 'react'
import { Loader2, Sparkles, AlertCircle, MapPin, CalendarDays, Wallet, Building2, Plane, FileText } from 'lucide-react'
import { HEAL_COUNTRIES } from '../_countries'

type Plan = {
  summary: string
  recommendedTreatment: string
  durationDays: number
  phases: Array<{ title: string; days: string; detail: string }>
  centreGuidance: string
  stayGuidance: string
  visaGuidance: string
  estimatedCost: { currency: string; low: number; high: number; note: string }
  itinerary: Array<{ day: string; activity: string }>
  disclaimer: string
}

export function PlannerForm() {
  const [form, setForm] = useState({
    condition: '', originCity: '', country: '', startDate: '', durationDays: '', budget: '',
  })
  const [busy, setBusy] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [err, setErr] = useState<string | null>(null)

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (form.condition.trim().length < 3) { setErr('Please describe your condition or goal.'); return }
    setBusy(true); setErr(null); setPlan(null)
    try {
      const country = HEAL_COUNTRIES.find((c) => c.slug === form.country)?.name
      const r = await fetch('/api/tourism/plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          condition: form.condition.trim(),
          originCity: form.originCity.trim() || undefined,
          country,
          startDate: form.startDate || undefined,
          durationDays: form.durationDays ? Number(form.durationDays) : undefined,
          budget: form.budget.trim() || undefined,
        }),
      })
      const j = await r.json()
      if (!r.ok) {
        if (r.status === 429) throw new Error('Too many requests — try again in a few minutes.')
        throw new Error(j.error ?? `HTTP ${r.status}`)
      }
      setPlan(j.plan)
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : String(e2))
    } finally {
      setBusy(false)
    }
  }

  const field = 'rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kerala-300 w-full'

  return (
    <div>
      <form onSubmit={submit} className="rounded-2xl border border-kerala-100 bg-white p-5 shadow-card space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5 block">Condition or goal *</label>
          <textarea
            value={form.condition}
            onChange={(e) => set('condition', e.target.value)}
            placeholder="e.g. chronic lower-back pain and stress; or general rejuvenation"
            className={field}
            rows={2}
            maxLength={300}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5 block">Origin country</label>
            <select value={form.country} onChange={(e) => set('country', e.target.value)} className={field}>
              <option value="">Select…</option>
              {HEAL_COUNTRIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5 block">Origin city</label>
            <input value={form.originCity} onChange={(e) => set('originCity', e.target.value)} placeholder="e.g. Dubai" className={field} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5 block">Preferred start</label>
            <input type="month" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} className={field} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5 block">Available days</label>
            <input type="number" min={3} max={60} value={form.durationDays} onChange={(e) => set('durationDays', e.target.value)} placeholder="e.g. 21" className={field} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5 block">Budget (optional)</label>
            <input value={form.budget} onChange={(e) => set('budget', e.target.value)} placeholder="e.g. AED 8,000 – 12,000" className={field} />
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 bg-kerala-700 text-white font-semibold px-5 py-3 rounded-xl hover:bg-kerala-800 disabled:opacity-60 w-full sm:w-auto"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate my plan
        </button>
      </form>

      {err && (
        <p className="mt-4 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {err}
        </p>
      )}

      {plan && (
        <div className="mt-8 space-y-5">
          <div className="rounded-2xl bg-kerala-50 p-6">
            <h2 className="font-serif text-2xl text-kerala-800">{plan.recommendedTreatment}</h2>
            <p className="text-gray-700 mt-1">{plan.summary}</p>
            <p className="text-sm text-gold-700 mt-2">Suggested duration: {plan.durationDays} days</p>
          </div>

          {plan.phases?.length > 0 && (
            <div className="rounded-2xl border border-kerala-100 bg-white p-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-kerala-600" /> Treatment phases</h3>
              <div className="space-y-3">
                {plan.phases.map((p, i) => (
                  <div key={i} className="border-l-2 border-kerala-200 pl-4">
                    <p className="font-medium text-gray-900">{p.title} <span className="text-sm text-gray-500">· {p.days}</span></p>
                    <p className="text-gray-700 text-sm">{p.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Info icon={<Building2 className="w-5 h-5" />} title="Choosing a centre" body={plan.centreGuidance} />
            <Info icon={<MapPin className="w-5 h-5" />} title="Where to stay" body={plan.stayGuidance} />
            <Info icon={<Plane className="w-5 h-5" />} title="Visa guidance" body={plan.visaGuidance} />
            <Info
              icon={<Wallet className="w-5 h-5" />}
              title="Estimated cost"
              body={`${plan.estimatedCost?.currency ?? ''} ${plan.estimatedCost?.low?.toLocaleString?.() ?? ''} – ${plan.estimatedCost?.high?.toLocaleString?.() ?? ''}. ${plan.estimatedCost?.note ?? ''}`}
            />
          </div>

          {plan.itinerary?.length > 0 && (
            <div className="rounded-2xl border border-kerala-100 bg-white p-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-kerala-600" /> Sample itinerary</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                {plan.itinerary.map((it, i) => (
                  <li key={i}><span className="font-medium text-kerala-700">{it.day}:</span> {it.activity}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-gray-500">{plan.disclaimer}</p>
        </div>
      )}
    </div>
  )
}

function Info({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-kerala-100 bg-white p-5">
      <p className="font-semibold text-gray-900 flex items-center gap-2 mb-1 text-kerala-700">{icon} {title}</p>
      <p className="text-gray-700 text-sm">{body}</p>
    </div>
  )
}
