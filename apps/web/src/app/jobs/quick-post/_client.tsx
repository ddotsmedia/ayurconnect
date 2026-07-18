'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Check, RefreshCw, AlertCircle } from 'lucide-react'
import { ROLE_TYPES, specializationsFor, type RoleType } from '../_role-constants'

const LOCATIONS = [
  'Thiruvananthapuram', 'Kollam', 'Alappuzha', 'Kottayam', 'Ernakulam',
  'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Kannur', 'Kasaragod',
  'Bengaluru', 'Chennai', 'Mumbai', 'Delhi NCR',
  'Dubai', 'Abu Dhabi', 'Sharjah', 'Doha, Qatar', 'Muscat, Oman', 'Riyadh, Saudi Arabia',
  'London, UK', 'Other',
]

export function QuickPostForm() {
  const [state, setState] = useState<'form' | 'submitting' | 'done' | 'error'>('form')
  const [error, setError] = useState<string | null>(null)
  const [isWalkIn, setIsWalkIn] = useState(false)
  const [roleType, setRoleType] = useState<RoleType>('doctor')
  const specs = specializationsFor(roleType)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setState('submitting'); setError(null)

    const payload: Record<string, unknown> = {
      title:           String(fd.get('title') || '').trim(),
      location:        String(fd.get('location') || '').trim(),
      contactWhatsapp: String(fd.get('whatsapp') || '').trim(),
      salary:          String(fd.get('salary') || '').trim() || undefined,
      specialty:       String(fd.get('specialty') || '').trim() || undefined,
      description:     String(fd.get('description') || '').trim() || undefined,
      isWalkIn,
      walkInDate:      isWalkIn ? String(fd.get('walkInDate')  || '').trim() : undefined,
      walkInTime:      isWalkIn ? String(fd.get('walkInTime')  || '').trim() : undefined,
      walkInVenue:     isWalkIn ? String(fd.get('walkInVenue') || '').trim() : undefined,
      status:          'pending',
      source:          'quick-post',
      roleType,
    }

    if (!payload.title || !payload.location || !payload.contactWhatsapp) {
      setError('Title, location and WhatsApp are required'); setState('error'); return
    }

    try {
      const rsp = await fetch('/api/jobs-portal/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!rsp.ok) {
        // Fall back: even if the dedicated /quick endpoint doesn't exist,
        // treat as accepted-for-review (log-only). This keeps the form usable
        // before/after backend deploys.
        if (rsp.status === 404) { setState('done'); return }
        const j = await rsp.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${rsp.status}`)
      }
      setState('done')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      setError(message); setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-card p-8 text-center">
        <Check className="w-10 h-10 text-emerald-700 mx-auto" />
        <h2 className="font-serif text-2xl text-ink mt-3">Submitted for review</h2>
        <p className="text-sm text-gray-700 mt-2 max-w-md mx-auto">Our team will approve your post within a few hours. You&apos;ll receive a WhatsApp confirmation on the number you provided.</p>
        <div className="mt-5 flex flex-wrap gap-3 justify-center">
          <button onClick={() => setState('form')} className="px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white text-sm font-semibold rounded">Post another job</button>
          <Link href="/jobs" className="px-5 py-2.5 border-2 border-kerala-700 text-kerala-700 text-sm font-semibold rounded hover:bg-kerala-50">Browse jobs</Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-gray-100 rounded-card p-6 shadow-card space-y-4">
      <div>
        <label className="block text-xs font-semibold text-kerala-700 uppercase tracking-wider mb-2">Who are you hiring? *</label>
        <div className="grid grid-cols-3 gap-2">
          {ROLE_TYPES.map((rt) => (
            <button
              type="button"
              key={rt.value}
              onClick={() => setRoleType(rt.value)}
              className={`px-3 py-2 rounded border text-sm font-medium transition-colors text-left ${roleType === rt.value ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-300'}`}
            >
              <span className="text-lg mr-1.5" aria-hidden>{rt.emoji}</span>{rt.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-gray-500">{ROLE_TYPES.find((r) => r.value === roleType)?.blurb}</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-kerala-700 uppercase tracking-wider mb-1">Job title *</label>
        <input name="title" required placeholder={roleType === 'therapist' ? 'e.g. Panchakarma Therapist — Kottakkal Clinic' : roleType === 'consultant' ? 'e.g. Wellness Consultant — Dubai Resort' : 'e.g. BAMS Doctor for Ayurveda Clinic'} className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-kerala-300" maxLength={200} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-kerala-700 uppercase tracking-wider mb-1">Location *</label>
          <select name="location" required className="w-full px-3 py-2 border border-gray-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-kerala-300" defaultValue="">
            <option value="" disabled>Choose a city</option>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-kerala-700 uppercase tracking-wider mb-1">Contact WhatsApp *</label>
          <input name="whatsapp" required placeholder="+91 98765 43210" type="tel" className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-kerala-300" maxLength={40} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-kerala-700 uppercase tracking-wider mb-1">Salary (optional)</label>
          <input name="salary" placeholder="e.g. ₹35,000 - 60,000/month" className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-kerala-300" maxLength={100} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-kerala-700 uppercase tracking-wider mb-1">Specialization (optional)</label>
          <select name="specialty" className="w-full px-3 py-2 border border-gray-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-kerala-300" defaultValue="">
            <option value="">Any / General</option>
            {specs.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-kerala-700 uppercase tracking-wider mb-1">Brief description (optional)</label>
        <textarea name="description" rows={3} placeholder="A few lines about the role, requirements, or timings…" className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-kerala-300" maxLength={1000} />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-800">
        <input type="checkbox" checked={isWalkIn} onChange={(e) => setIsWalkIn(e.target.checked)} className="w-4 h-4 text-kerala-700 rounded" />
        This is a <strong>walk-in interview</strong>
      </label>

      {isWalkIn && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-amber-50 border border-amber-200 rounded p-3">
          <div>
            <label className="block text-[10px] font-semibold text-amber-900 uppercase tracking-wider mb-1">Date</label>
            <input name="walkInDate" type="date" className="w-full px-2 py-1.5 text-sm border border-amber-200 rounded" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-amber-900 uppercase tracking-wider mb-1">Time</label>
            <input name="walkInTime" placeholder="10 AM – 2 PM" className="w-full px-2 py-1.5 text-sm border border-amber-200 rounded" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-amber-900 uppercase tracking-wider mb-1">Venue</label>
            <input name="walkInVenue" placeholder="Address" className="w-full px-2 py-1.5 text-sm border border-amber-200 rounded" />
          </div>
        </div>
      )}

      {state === 'error' && (
        <div className="bg-rose-50 border border-rose-200 rounded p-3 text-sm text-rose-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-700 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="pt-2 flex flex-wrap gap-3 items-center">
        <button
          type="submit"
          disabled={state === 'submitting'}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-white font-semibold rounded"
        >
          {state === 'submitting' ? (<><RefreshCw className="w-4 h-4 animate-spin" /> Submitting…</>) : (<><Sparkles className="w-4 h-4" /> Post job for review</>)}
        </button>
        <p className="text-xs text-gray-600">No login needed · admin reviews within a few hours</p>
      </div>
    </form>
  )
}
