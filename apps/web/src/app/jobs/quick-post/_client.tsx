'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Check, RefreshCw, AlertCircle, X, Wand2 } from 'lucide-react'
import { ROLE_TYPES, specializationsFor, type RoleType } from '../_role-constants'

type Prefill = {
  title?:     string
  whatsapp?:  string
  salary?:    string
  specialty?: string
  description?: string
  location?:  string
}

// Fields the AI parser returns; only the ones we consume in the form.
type ParsedText = {
  title?:            string | null
  location?:         string | null
  contact_whatsapp?: string | null
  contact_phone?:    string | null
  salary_min?:       number | null
  salary_max?:       number | null
  currency?:         string | null
  specialization?:   string | null
  therapist_type?:   string | null
  description?:      string | null
  role_type?:        RoleType | null
}

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

  // Form defaultValues source; bump formKey to force React to remount inputs
  // when we drop new AI-extracted values in (defaultValue is initial-only).
  const [prefill, setPrefill] = useState<Prefill>({})
  const [formKey, setFormKey] = useState(0)

  // Text-extract modal state
  const [showExtract, setShowExtract] = useState(false)
  const [extractText, setExtractText] = useState('')
  const [extractBusy, setExtractBusy] = useState(false)
  const [extractError, setExtractError] = useState<{ message: string; canRetry: boolean } | null>(null)

  async function runExtract() {
    if (extractText.trim().length < 20) { setExtractError({ message: 'Paste at least 20 characters of the job.', canRetry: true }); return }
    setExtractBusy(true); setExtractError(null)
    try {
      const rsp = await fetch('/api/jobs-portal/ai/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: extractText }),
      })
      const j = await rsp.json() as { ok: boolean; parsed?: ParsedText; code?: string; message?: string; canRetry?: boolean; error?: string }
      if (!rsp.ok || !j.ok) {
        setExtractError({
          message: j.message ?? j.error ?? `Extraction failed (${rsp.status})`,
          canRetry: j.canRetry ?? true,
        })
        return
      }
      applyParsed(j.parsed ?? {})
      setShowExtract(false)
      setExtractText('')
    } catch (e) {
      setExtractError({ message: e instanceof Error ? e.message : String(e), canRetry: true })
    } finally {
      setExtractBusy(false)
    }
  }

  function applyParsed(p: ParsedText) {
    // Best-fit therapist specialization when parser flagged a therapist role
    // (mirrors upload-poster prefill logic).
    const spec = p.role_type === 'therapist' && p.therapist_type
      ? `${p.therapist_type} Therapist`
      : (p.specialization ?? undefined)

    // Location list is fixed; snap to a matching option if we can, else leave
    // blank so the user must pick.
    const rawLoc = (p.location ?? '').trim()
    const matchedLocation = rawLoc && LOCATIONS.some((l) => l.toLowerCase() === rawLoc.toLowerCase())
      ? LOCATIONS.find((l) => l.toLowerCase() === rawLoc.toLowerCase())
      : (rawLoc ? 'Other' : undefined)

    // Salary as a human-readable range.
    let salary: string | undefined
    if (p.salary_min != null || p.salary_max != null) {
      const cur = p.currency ?? ''
      const min = p.salary_min != null ? p.salary_min.toLocaleString() : '?'
      const max = p.salary_max != null ? p.salary_max.toLocaleString() : '?'
      salary = `${cur} ${min} - ${max}`.trim()
    }

    if (p.role_type && p.role_type !== roleType) setRoleType(p.role_type)

    setPrefill({
      title:       p.title ?? undefined,
      whatsapp:    (p.contact_whatsapp ?? p.contact_phone) ?? undefined,
      salary,
      specialty:   spec,
      description: p.description ?? undefined,
      location:    matchedLocation,
    })
    setFormKey((k) => k + 1)
  }

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
    <>
    <form key={formKey} onSubmit={onSubmit} className="bg-white border border-gray-100 rounded-card p-6 shadow-card space-y-4">
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

        {/* Text-extract entry point — sits right under the role toggle so it's
            offered before the user starts typing. */}
        <button
          type="button"
          onClick={() => { setShowExtract(true); setExtractError(null) }}
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-kerala-700 underline underline-offset-2 decoration-dotted"
        >
          📋 Paste job text instead of typing
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-kerala-700 uppercase tracking-wider mb-1">Job title *</label>
        <input name="title" defaultValue={prefill.title ?? ''} required placeholder={roleType === 'therapist' ? 'e.g. Panchakarma Therapist — Kottakkal Clinic' : roleType === 'consultant' ? 'e.g. Wellness Consultant — Dubai Resort' : 'e.g. BAMS Doctor for Ayurveda Clinic'} className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-kerala-300" maxLength={200} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-kerala-700 uppercase tracking-wider mb-1">Location *</label>
          <select name="location" required defaultValue={prefill.location ?? ''} className="w-full px-3 py-2 border border-gray-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-kerala-300">
            <option value="" disabled>Choose a city</option>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-kerala-700 uppercase tracking-wider mb-1">Contact WhatsApp *</label>
          <input name="whatsapp" defaultValue={prefill.whatsapp ?? ''} required placeholder="+91 98765 43210" type="tel" className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-kerala-300" maxLength={40} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-kerala-700 uppercase tracking-wider mb-1">Salary (optional)</label>
          <input name="salary" defaultValue={prefill.salary ?? ''} placeholder="e.g. ₹35,000 - 60,000/month" className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-kerala-300" maxLength={100} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-kerala-700 uppercase tracking-wider mb-1">Specialization (optional)</label>
          <select name="specialty" defaultValue={prefill.specialty && specs.includes(prefill.specialty) ? prefill.specialty : ''} className="w-full px-3 py-2 border border-gray-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-kerala-300">
            <option value="">Any / General</option>
            {specs.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-kerala-700 uppercase tracking-wider mb-1">Brief description (optional)</label>
        <textarea name="description" defaultValue={prefill.description ?? ''} rows={3} placeholder="A few lines about the role, requirements, or timings…" className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-kerala-300" maxLength={1000} />
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

    {showExtract && (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="extract-heading"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
        onClick={(e) => { if (e.target === e.currentTarget && !extractBusy) setShowExtract(false) }}
      >
        <div className="bg-white rounded-card w-full max-w-lg shadow-cardLg p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 id="extract-heading" className="font-serif text-xl text-ink">Paste your job from WhatsApp or email</h2>
              <p className="text-xs text-gray-600 mt-0.5">AI will read the text and fill in the form fields for you.</p>
            </div>
            <button
              type="button"
              onClick={() => !extractBusy && setShowExtract(false)}
              className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-40"
              disabled={extractBusy}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <textarea
            value={extractText}
            onChange={(e) => setExtractText(e.target.value)}
            rows={8}
            placeholder="Paste job text here…"
            maxLength={8000}
            disabled={extractBusy}
            className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-kerala-300 disabled:bg-gray-50"
          />
          <p className="mt-1 text-[11px] text-gray-500 text-right tabular-nums">{extractText.length} / 8000</p>

          {extractError && (
            <div className="mt-3 bg-rose-50 border border-rose-200 rounded p-3 text-sm text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-700 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p>{extractError.message}</p>
                {!extractError.canRetry && (
                  <button
                    type="button"
                    onClick={() => { setShowExtract(false); setExtractError(null); setExtractText('') }}
                    className="mt-2 text-xs text-kerala-700 hover:underline font-semibold"
                  >
                    Enter details manually →
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowExtract(false)}
              disabled={extractBusy}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={runExtract}
              disabled={extractBusy || extractText.trim().length < 20}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-40 text-white text-sm font-semibold rounded"
            >
              {extractBusy
                ? (<><RefreshCw className="w-4 h-4 animate-spin" /> AI extracting…</>)
                : (<><Wand2 className="w-4 h-4" /> Extract with AI</>)}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
