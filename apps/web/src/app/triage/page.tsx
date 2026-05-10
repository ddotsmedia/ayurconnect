'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Stethoscope, Loader2, AlertTriangle, ArrowRight, Sparkles, Leaf } from 'lucide-react'
import { track } from '../../lib/track'

type Result = {
  specialization: string
  doshaImbalance: string
  summary: string
  lifestyleTips: string[]
  herbsToConsider: Array<{ name: string; why: string }>
  urgency: 'self-care' | 'see-vaidya-soon' | 'see-allopathic-emergency'
  redFlags: string[]
  provider?: string
}

const URGENCY_TONE: Record<Result['urgency'], { bg: string; ring: string; label: string; icon: string }> = {
  'self-care':                { bg: 'bg-emerald-50',  ring: 'ring-emerald-300', label: 'Self-care is OK',           icon: '🌿' },
  'see-vaidya-soon':          { bg: 'bg-amber-50',    ring: 'ring-amber-300',   label: 'See a Vaidya soon',         icon: '🩺' },
  'see-allopathic-emergency': { bg: 'bg-red-50',      ring: 'ring-red-300',     label: 'Seek immediate care',        icon: '🚑' },
}

export default function TriagePage() {
  const [symptoms, setSymptoms] = useState('')
  const [age, setAge]           = useState('')
  const [sex, setSex]           = useState('')
  const [duration, setDuration] = useState('')
  const [busy, setBusy]         = useState(false)
  const [err, setErr]           = useState<string | null>(null)
  const [result, setResult]     = useState<Result | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null); setResult(null)
    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          symptoms,
          age: age ? Number(age) : undefined,
          sex: sex || undefined,
          duration: duration || undefined,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      setResult(json as Result)
      track('triage_query', { specialization: json.specialization, urgency: json.urgency })
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <header className="text-center mb-8">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-700">
            <Stethoscope className="w-6 h-6" />
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-kerala-700 mt-3">AI symptom triage</h1>
          <p className="text-sm text-muted mt-1 max-w-xl mx-auto">
            Describe what&apos;s going on and our AI will suggest the right specialization,
            possible dosha imbalance, and classical herbs to discuss with your Vaidya.
          </p>
          <p className="mt-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 inline-block px-2 py-0.5 rounded-full">
            ⚠ Not a diagnosis. Always consult a qualified practitioner.
          </p>
        </header>

        <form onSubmit={submit} className="bg-white rounded-card border border-gray-100 shadow-card p-6 space-y-4">
          <label className="block">
            <span className="block text-xs font-medium text-gray-700 mb-1.5">Describe your concerns *</span>
            <textarea
              required
              minLength={15}
              rows={4}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. I've had chronic acidity after meals for the last 3 months, especially in summer. Sometimes I feel a burning sensation in my chest…"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-700"
            />
            <span className="text-[11px] text-muted">{symptoms.length}/2000 chars · be specific for better suggestions</span>
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label>
              <span className="block text-xs font-medium text-gray-700 mb-1.5">Age</span>
              <input type="number" min="0" max="120" value={age} onChange={(e) => setAge(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
            </label>
            <label>
              <span className="block text-xs font-medium text-gray-700 mb-1.5">Sex</span>
              <select value={sex} onChange={(e) => setSex(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                <option value="">—</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </label>
            <label>
              <span className="block text-xs font-medium text-gray-700 mb-1.5">Duration</span>
              <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                <option value="">—</option>
                <option value="less than a week">&lt; 1 week</option>
                <option value="1-4 weeks">1-4 weeks</option>
                <option value="1-6 months">1-6 months</option>
                <option value="more than 6 months">&gt; 6 months</option>
              </select>
            </label>
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button type="submit" disabled={busy || symptoms.length < 15} className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-700 text-white rounded-md font-semibold hover:bg-purple-800 disabled:opacity-50 text-sm">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Get triage suggestion
          </button>
        </form>

        {result && (
          <article className="mt-6 space-y-4">
            {/* Urgency banner */}
            <div className={`rounded-card p-5 ring-2 ${URGENCY_TONE[result.urgency].bg} ${URGENCY_TONE[result.urgency].ring}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{URGENCY_TONE[result.urgency].icon}</span>
                <strong className="text-gray-900">{URGENCY_TONE[result.urgency].label}</strong>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{result.summary}</p>
              {result.urgency === 'see-allopathic-emergency' && result.redFlags.length > 0 && (
                <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded text-sm text-red-900">
                  <strong className="inline-flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Red flags:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {result.redFlags.map((rf, i) => <li key={i}>{rf}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Specialization + dosha */}
            <div className="bg-white rounded-card border border-gray-100 shadow-card p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-muted">Suggested specialization</span>
                <div className="font-serif text-2xl text-kerala-700 mt-1">{result.specialization}</div>
                <Link href={`/doctors?specialization=${encodeURIComponent(result.specialization)}`} className="mt-2 inline-flex items-center gap-1 text-xs text-kerala-700 font-medium hover:underline">
                  Find {result.specialization} doctors <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-muted">Likely dosha pattern</span>
                <div className="font-serif text-2xl text-kerala-700 mt-1 capitalize">{result.doshaImbalance}</div>
              </div>
            </div>

            {/* Lifestyle tips */}
            {result.lifestyleTips.length > 0 && (
              <div className="bg-white rounded-card border border-gray-100 shadow-card p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Lifestyle suggestions</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {result.lifestyleTips.map((tip, i) => (
                    <li key={i} className="flex gap-2"><span className="text-kerala-700 flex-shrink-0">✓</span><span>{tip}</span></li>
                  ))}
                </ul>
              </div>
            )}

            {/* Herbs */}
            {result.herbsToConsider.length > 0 && (
              <div className="bg-white rounded-card border border-gray-100 shadow-card p-5">
                <h3 className="font-semibold text-gray-900 mb-3 inline-flex items-center gap-1"><Leaf className="w-4 h-4 text-kerala-700" /> Herbs to discuss with your Vaidya</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.herbsToConsider.map((h, i) => (
                    <div key={i} className="border border-gray-100 rounded-md p-3 hover:border-kerala-300">
                      <div className="font-semibold text-gray-900 text-sm">{h.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{h.why}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[11px] text-muted text-center">
              Generated by {result.provider ?? 'AI'} · Always verify with a qualified Ayurvedic practitioner.
              {result.provider && <> Switch model with <code>AYURBOT_PROVIDER</code> env.</>}
            </p>
          </article>
        )}
      </div>
    </div>
  )
}
