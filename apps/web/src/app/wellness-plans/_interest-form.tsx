'use client'

// Wellness-plan interest capture. Hits POST /api/leads with kind='academy'-like
// (we reuse the existing Lead pipeline rather than building a new model;
// real subscription flow comes later with Razorpay). The admin's leads CRM
// kanban already handles this kind.

import { useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'

const PLAN_OPTIONS = [
  { id: 'wellness',  label: 'Wellness — ₹299/mo' },
  { id: 'family',    label: 'Family Care — ₹599/mo' },
  { id: 'concierge', label: 'Concierge — ₹2,499/mo' },
  { id: 'undecided', label: 'Not sure yet — keep me posted' },
]

export function WellnessInterestForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [plan, setPlan]   = useState('wellness')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind:    'wellness_plan',
          name,
          email,
          phone:   phone || undefined,
          subject: plan,
          message: message || `Interested in the ${plan} plan.`,
          meta:    { plan, page: '/wellness-plans' },
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally { setLoading(false) }
  }

  if (done) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
        <p className="font-serif text-xl text-emerald-900 mt-2">You&apos;re on the founding-member list</p>
        <p className="text-sm text-emerald-800 mt-2">We&apos;ll email you the moment paid plans go live with your 50% discount code.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-medium text-kerala-900 mb-1 block">Name *</span>
          <input required className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-kerala-900 mb-1 block">Email *</span>
          <input required type="email" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-medium text-kerala-900 mb-1 block">Phone <span className="text-gray-400">(optional)</span></span>
          <input type="tel" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-kerala-900 mb-1 block">Plan</span>
          <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white" value={plan} onChange={(e) => setPlan(e.target.value)}>
            {PLAN_OPTIONS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-medium text-kerala-900 mb-1 block">Anything else? <span className="text-gray-400">(optional)</span></span>
        <textarea rows={2} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Specific feature you want, family size, etc." />
      </label>
      {error && <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2" role="alert">{error}</p>}
      <button
        type="submit"
        disabled={loading || !name || !email}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 text-white text-sm font-semibold rounded-md"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Join the founding-member list
      </button>
      <p className="text-[10px] text-kerala-700 text-center">We&apos;ll only email about plan launches. No marketing spam.</p>
    </form>
  )
}
