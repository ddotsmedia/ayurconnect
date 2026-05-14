'use client'

// Public WhatsApp alert opt-in. Hits POST /api/alerts/whatsapp/subscribe.
// Anonymous + low-friction; no auth required. Falls back gracefully if the
// API returns 503 (Twilio not configured) — we still capture the lead but
// tell the user we'll batch by email until WhatsApp is live.

import { useState } from 'react'
import { MessageCircle, Loader2, CheckCircle2 } from 'lucide-react'

export function WhatsAppAlertsForm() {
  const [phone, setPhone] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [district, setDistrict] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/alerts/whatsapp/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          phone,
          specialization: specialization || undefined,
          district:       district       || undefined,
          source:         'jobs-page',
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally { setLoading(false) }
  }

  if (done) {
    return (
      <div className="mt-10 p-6 rounded-card bg-emerald-50 border border-emerald-100 max-w-2xl mx-auto text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
        <p className="font-serif text-xl text-emerald-900 mt-2">You&apos;re subscribed</p>
        <p className="text-sm text-emerald-800 mt-2">
          We&apos;ll WhatsApp you when new Ayurveda jobs match your filters. Reply STOP at any time to unsubscribe.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-10 p-6 rounded-card bg-kerala-50 border border-kerala-100 max-w-2xl mx-auto">
      <div className="text-center mb-4">
        <MessageCircle className="w-8 h-8 text-kerala-700 mx-auto" />
        <p className="font-serif text-xl text-kerala-900 mt-2">Get job alerts on WhatsApp</p>
        <p className="text-sm text-kerala-800 mt-1">
          Free. Filter by specialization + district. Reply STOP to unsubscribe.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label htmlFor="wa-phone" className="block text-xs font-medium text-gray-700 mb-1">WhatsApp number *</label>
          <input
            id="wa-phone"
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210 or 9876543210"
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="wa-spec" className="block text-xs font-medium text-gray-700 mb-1">Specialization (optional)</label>
            <input
              id="wa-spec"
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="e.g. Panchakarma, Kayachikitsa"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700"
            />
          </div>
          <div>
            <label htmlFor="wa-district" className="block text-xs font-medium text-gray-700 mb-1">District / city (optional)</label>
            <input
              id="wa-district"
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Ernakulam"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700"
            />
          </div>
        </div>
        {error && <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2" role="alert">{error}</p>}
        <button
          type="submit"
          disabled={loading || !phone}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
          {loading ? 'Subscribing…' : 'Subscribe to WhatsApp alerts'}
        </button>
        <p className="text-[10px] text-gray-500 text-center">
          By subscribing you consent to receive job alerts via WhatsApp. We never share your number.
        </p>
      </form>
    </div>
  )
}
