'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { Calculator, IndianRupee, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { CountrySelect } from '../../components/country-select'
import { PhoneInput } from '../../components/phone-input'
import { detectCountry } from '../../lib/detect-country'
import { useEffect } from 'react'

// Cost estimator is intentionally indicative, not contractual. Real quotes
// must come from a specific centre after consultation. The estimator gives
// patients a *range* — useful for budget planning, especially for diaspora
// patients planning a Kerala medical-tourism visit.

type Tier = 'budget' | 'mid' | 'premium'

const CONDITIONS = [
  { value: 'panchakarma',       label: 'Panchakarma (general)',           base: { budget: 50000, mid: 90000,  premium: 220000 } },
  { value: 'pcos',              label: 'PCOS / PCOD',                     base: { budget: 70000, mid: 130000, premium: 240000 } },
  { value: 'arthritis',         label: 'Arthritis / joint disease',        base: { budget: 85000, mid: 150000, premium: 280000 } },
  { value: 'stress-anxiety',    label: 'Stress, anxiety, insomnia',        base: { budget: 55000, mid: 100000, premium: 180000 } },
  { value: 'diabetes',          label: 'Diabetes management',              base: { budget: 65000, mid: 110000, premium: 200000 } },
  { value: 'weight-management', label: 'Weight management',                base: { budget: 60000, mid: 110000, premium: 220000 } },
  { value: 'skin-care',         label: 'Skin / dermatology (psoriasis…)', base: { budget: 50000, mid: 95000,  premium: 180000 } },
  { value: 'rejuvenation',      label: 'Rejuvenation / wellness retreat',  base: { budget: 45000, mid: 85000,  premium: 200000 } },
  { value: 'other',             label: 'Other / I\'m not sure',           base: { budget: 50000, mid: 90000,  premium: 180000 } },
] as const

const TIERS: Array<{ value: Tier; label: string; desc: string }> = [
  { value: 'budget',  label: 'Budget',        desc: 'AYUSH-grade govt / charitable centres. Shared room. Classical care.' },
  { value: 'mid',     label: 'Mid-range',     desc: 'Private clinic / NABH-accredited mid-tier. Private room. Senior consultant.' },
  { value: 'premium', label: 'Premium',       desc: 'Luxury resort + classical pharmacy. Villa accommodation. International-grade.' },
]

const DURATION_WEEKS = [1, 2, 3, 4, 6]

const COMPANION_PER_WEEK = 8000 // companion accommodation + meals, per week
const TRANSPORT_BASE = 5000     // airport-pickup + local transport

type FormState = {
  condition: typeof CONDITIONS[number]['value']
  tier: Tier
  weeks: number
  companion: boolean
  transport: boolean
}

function inr(n: number): string {
  return '₹' + n.toLocaleString('en-IN')
}

export default function CostEstimatorPage() {
  const [form, setForm] = useState<FormState>({
    condition: 'panchakarma',
    tier: 'mid',
    weeks: 3,
    companion: false,
    transport: false,
  })

  const { low, high, breakdown } = useMemo(() => {
    const cond = CONDITIONS.find((c) => c.value === form.condition)!
    // Base cost is for a "typical 3-week residential". Scale linearly within bounds.
    const weekFactor = Math.max(0.45, Math.min(1.8, form.weeks / 3))
    const base = cond.base[form.tier] * weekFactor
    const companion = form.companion ? COMPANION_PER_WEEK * form.weeks : 0
    const transport = form.transport ? TRANSPORT_BASE : 0
    const subtotal  = base + companion + transport
    // 25% range around midpoint
    const lo = Math.round(subtotal * 0.85)
    const hi = Math.round(subtotal * 1.20)
    return {
      low:  lo,
      high: hi,
      breakdown: [
        { label: `${TIERS.find((t) => t.value === form.tier)!.label} package, ${form.weeks} week${form.weeks === 1 ? '' : 's'}`, amount: Math.round(base) },
        ...(form.companion ? [{ label: `Companion accommodation (${form.weeks} wk)`, amount: companion }] : []),
        ...(form.transport ? [{ label: 'Airport transfer + local transport', amount: transport }] : []),
      ],
    }
  }, [form])

  // Lead capture form (after estimate computed)
  const [lead, setLead] = useState({ name: '', email: '', phone: '', country: 'IN', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    setLead((l) => ({ ...l, country: detectCountry() }))
  }, [])

  async function submitLead(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true); setErr(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: 'cost_estimator',
          name: lead.name,
          email: lead.email,
          phone: lead.phone || null,
          country: lead.country,
          subject: `${CONDITIONS.find((c) => c.value === form.condition)?.label} — ${form.tier} ${form.weeks}wk`,
          message: lead.notes || `Cost estimate request. Estimated range: ${inr(low)} – ${inr(high)}.`,
          meta: { ...form, estimateLow: low, estimateHigh: high },
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `request failed (${res.status})`)
      }
      setSubmitted(true)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally { setSubmitting(false) }
  }

  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Calculator className="w-3 h-3" /> Transparent pricing
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">
            Treatment <span className="text-gold-400">Cost Estimator</span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-white/80">
            An indicative price range for a Kerala Ayurvedic residential programme.
            Real quotes come from your chosen centre after consultation.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: inputs */}
          <div className="bg-white rounded-card border border-gray-100 shadow-card p-6 space-y-5">
            <h2 className="font-serif text-xl text-kerala-700">Tell us about your treatment</h2>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Primary condition</label>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value as FormState['condition'] })}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
              >
                {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Tier</label>
              <div className="grid grid-cols-3 gap-2">
                {TIERS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm({ ...form, tier: t.value })}
                    className={`p-2.5 text-sm rounded-md border-2 transition-all ${
                      form.tier === t.value
                        ? 'border-kerala-600 bg-kerala-50 text-kerala-700 font-semibold'
                        : 'border-gray-200 text-gray-600 hover:border-kerala-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">{TIERS.find((t) => t.value === form.tier)?.desc}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Duration</label>
              <div className="grid grid-cols-5 gap-2">
                {DURATION_WEEKS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setForm({ ...form, weeks: w })}
                    className={`p-2 text-sm rounded-md border-2 transition-all ${
                      form.weeks === w
                        ? 'border-kerala-600 bg-kerala-50 text-kerala-700 font-semibold'
                        : 'border-gray-200 text-gray-600 hover:border-kerala-300'
                    }`}
                  >
                    {w} wk
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                <input type="checkbox" checked={form.companion} onChange={(e) => setForm({ ...form, companion: e.target.checked })} />
                <span className="text-sm text-gray-800">Companion accommodation (+₹{COMPANION_PER_WEEK.toLocaleString('en-IN')}/wk)</span>
              </label>
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                <input type="checkbox" checked={form.transport} onChange={(e) => setForm({ ...form, transport: e.target.checked })} />
                <span className="text-sm text-gray-800">Airport transfer + local transport (+₹{TRANSPORT_BASE.toLocaleString('en-IN')})</span>
              </label>
            </div>
          </div>

          {/* Right: estimate */}
          <div className="bg-gradient-to-br from-kerala-700 to-kerala-800 text-white rounded-card shadow-cardLg p-6 flex flex-col">
            <div className="text-xs uppercase tracking-wider text-gold-300">Indicative cost range</div>
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-3xl md:text-5xl font-serif">{inr(low)}</span>
              <span className="text-white/60">–</span>
              <span className="text-3xl md:text-5xl font-serif">{inr(high)}</span>
            </div>
            <div className="mt-2 text-sm text-white/70">≈ ${Math.round(low / 83).toLocaleString()} – ${Math.round(high / 83).toLocaleString()} USD · €{Math.round(low / 90).toLocaleString()} – €{Math.round(high / 90).toLocaleString()} EUR</div>

            <div className="mt-6 space-y-2 text-sm border-t border-white/10 pt-4">
              {breakdown.map((b) => (
                <div key={b.label} className="flex justify-between gap-3">
                  <span className="text-white/80">{b.label}</span>
                  <span className="text-white font-medium">{inr(b.amount)}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-6 text-xs text-white/60 leading-relaxed">
              <AlertCircle className="w-3.5 h-3.5 inline mr-1 text-gold-300" />
              These are typical ranges only. Final quote depends on doctor consultation, room class,
              specific protocol, additional medicines, and any complications. Always get a written
              quote from your chosen centre.
            </div>
          </div>
        </div>
      </section>

      {/* Lead capture */}
      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-2xl">
          {submitted ? (
            <div className="text-center bg-white rounded-card border border-kerala-100 shadow-card p-10">
              <CheckCircle2 className="w-16 h-16 text-kerala-600 mx-auto mb-4" />
              <h2 className="font-serif text-2xl text-kerala-700">Request received</h2>
              <p className="text-gray-700 mt-3 leading-relaxed">
                We&apos;ll send you 3 matched centre quotes within 24 hours. Meanwhile you can browse
                pre-vetted centres directly.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/hospitals" className="inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-600 hover:bg-kerala-700 text-white rounded-md font-semibold">
                  Browse centres <ChevronRight className="w-4 h-4" />
                </Link>
                <Link href="/doctors" className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-kerala-600 text-kerala-700 hover:bg-kerala-50 rounded-md font-semibold">
                  Find a doctor
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-2 text-center">Get 3 matched centre quotes</h2>
              <p className="text-center text-gray-600 mb-6">Free, no obligation, no commission. We&apos;ll email you 3 CCIM-verified centres matching your estimate.</p>
              <form onSubmit={submitLead} className="bg-white rounded-card border border-gray-100 shadow-card p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Full name</label>
                    <input value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} required className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
                    <input type="email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} required autoComplete="email" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Country</label>
                    <CountrySelect value={lead.country} onChange={(c) => setLead({ ...lead, country: c })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">WhatsApp (optional)</label>
                    <PhoneInput value={lead.phone} onChange={(e164) => setLead({ ...lead, phone: e164 })} defaultCountry={lead.country} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Anything specific? (optional)</label>
                  <textarea value={lead.notes} onChange={(e) => setLead({ ...lead, notes: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" placeholder="Diabetic, vegetarian, accompanied by elderly parent — anything that helps us match the right centre…" />
                </div>
                {err && <p className="text-sm text-red-600">{err}</p>}
                <button type="submit" disabled={submitting} className="w-full py-2.5 bg-kerala-600 hover:bg-kerala-700 disabled:opacity-50 text-white rounded-md font-semibold">
                  {submitting ? 'Sending…' : 'Get 3 matched quotes'}
                </button>
                <p className="text-xs text-center text-gray-500">No spam. We&apos;ll match you with 3 vetted centres and you reply only to those you want to speak to.</p>
              </form>
            </>
          )}
        </div>
      </section>
    </>
  )
}
