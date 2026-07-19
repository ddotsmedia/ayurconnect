'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, CheckCircle2, Loader2, AlertCircle, Send, MessageCircle } from 'lucide-react'

// One-click quick apply modal. Signed-in users see name + WhatsApp
// pre-filled from their profile and an optional 200-char message. Submit
// is one POST, no wizard. Anonymous users get a sign-in prompt (no more
// email-typing form — public apply is deferred to encourage account
// creation, which then gives us a real user record for the application).

const STORAGE_KEY = 'ayur_applications'
const MESSAGE_MAX = 200

type LocalEntry = { jobId: string; email: string; appliedAt: string }

function readLocal(): LocalEntry[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as LocalEntry[] }
  catch { return [] }
}
function writeLocal(arr: LocalEntry[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)) } catch { /* quota */ }
}

type Me = { user: { id: string; email: string; name: string | null; phone: string | null } | null }

export function ApplyModal({
  jobId, jobTitle, clinic, onClose,
}: {
  jobId: string
  jobTitle: string
  clinic: string
  onClose: () => void
}) {
  const [state, setState] = useState<'loading' | 'form' | 'submitting' | 'done' | 'already' | 'signin-needed'>('loading')
  const [name,    setName]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [email,   setEmail]   = useState('')
  const [message, setMessage] = useState('')
  const [err, setErr] = useState<string | null>(null)

  // Pre-fill from /api/me on open. If no session → prompt sign-in instead
  // of dumping a form on them.
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/me', { credentials: 'include' })
        if (!r.ok) { setState('signin-needed'); return }
        const j = await r.json() as Me
        if (!j.user) { setState('signin-needed'); return }
        setName(j.user.name ?? '')
        setPhone(j.user.phone ?? '')
        setEmail(j.user.email)
        // Local dedup: if we already applied to this job with this email in
        // a previous session, skip straight to the "already" branch — the
        // server will 409 anyway but this saves a round-trip.
        const local = readLocal()
        if (local.some((a) => a.jobId === jobId && a.email === j.user!.email.toLowerCase())) {
          setState('already'); return
        }
        setState('form')
      } catch {
        setState('signin-needed')
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function submit() {
    if (!name.trim() || !phone.trim()) { setErr('Please add your name and WhatsApp number.'); return }
    setState('submitting'); setErr(null)
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name:      name.trim(),
          phone:     phone.trim(),
          coverNote: message.trim() || undefined,
          // email omitted — server derives it from session.
        }),
      })
      if (res.status === 409) { setState('already'); return }
      if (!res.ok) {
        const j = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      const local = readLocal()
      local.push({ jobId, email: email.toLowerCase(), appliedAt: new Date().toISOString() })
      writeLocal(local)
      setState('done')
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
      setState('form')
    }
  }

  const ic = 'w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700'

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-card max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-lg text-ink">Apply for {jobTitle}</h2>
            {clinic && <p className="text-xs text-gray-500 mt-0.5">{clinic}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-800"><X className="w-5 h-5" /></button>
        </header>

        <div className="p-5 space-y-3">
          {state === 'loading' && (
            <div className="py-6 text-center text-sm text-gray-500 inline-flex items-center gap-2 mx-auto">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading your profile…
            </div>
          )}

          {state === 'signin-needed' && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-700">One-click apply needs a signed-in account so the employer can reach you.</p>
              <Link
                href={`/sign-in?next=/jobs/${jobId}`}
                className="mt-4 inline-flex items-center gap-1 px-5 py-2 bg-kerala-700 hover:bg-kerala-800 text-white text-sm font-semibold rounded"
              >
                Sign in to apply
              </Link>
              <p className="text-[11px] text-gray-500 mt-3">Don&apos;t have an account? <Link href={`/register?next=/jobs/${jobId}`} className="text-kerala-700 hover:underline">Register free</Link>.</p>
            </div>
          )}

          {(state === 'form' || state === 'submitting') && (
            <>
              {err && (
                <div className="p-3 rounded bg-red-50 border border-red-100 text-sm text-red-800 inline-flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {err}
                </div>
              )}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-kerala-700 font-semibold mb-1">Name *</label>
                <input className={ic} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" maxLength={120} />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-kerala-700 font-semibold mb-1">WhatsApp *</label>
                <input className={ic} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="+91 98765 43210" maxLength={40} />
                <p className="text-[11px] text-gray-500 mt-1">Employer will contact you on this number.</p>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-kerala-700 font-semibold mb-1">Message <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
                <textarea
                  className={ic + ' min-h-[70px]'}
                  rows={3}
                  maxLength={MESSAGE_MAX}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell the employer why you're interested…"
                />
                <p className="text-[10px] text-right text-gray-400 tabular-nums">{message.length} / {MESSAGE_MAX}</p>
              </div>
              <p className="text-[11px] text-gray-500 pt-1">Applying as <strong className="text-gray-700">{email}</strong>.</p>
            </>
          )}

          {state === 'done' && (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-serif text-lg text-ink">Applied!</h3>
              <p className="text-sm text-gray-700 mt-1">
                <MessageCircle className="w-4 h-4 inline text-emerald-600 mr-1" />
                Employer will contact you on WhatsApp.
              </p>
              <Link href="/jobs/applications" className="mt-4 inline-block text-xs text-kerala-700 hover:underline font-semibold">
                Track this application →
              </Link>
            </div>
          )}

          {state === 'already' && (
            <div className="text-center py-4">
              <CheckCircle2 className="w-10 h-10 text-amber-600 mx-auto mb-3" />
              <h3 className="font-serif text-lg text-ink">Already applied</h3>
              <p className="text-sm text-gray-700 mt-1">You&apos;ve applied to this job before with this account.</p>
              <Link href="/jobs/applications" className="mt-4 inline-block text-xs text-kerala-700 hover:underline font-semibold">View my applications →</Link>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 p-5 border-t border-gray-100">
          {state === 'form' && (
            <button
              onClick={submit}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded-md text-sm font-semibold"
            >
              <Send className="w-4 h-4" /> Send Application
            </button>
          )}
          {state === 'submitting' && (
            <button disabled className="inline-flex items-center gap-1.5 px-5 py-2 bg-kerala-700/60 text-white rounded-md text-sm font-semibold cursor-wait">
              <Loader2 className="w-4 h-4 animate-spin" /> Sending…
            </button>
          )}
          {(state === 'done' || state === 'already' || state === 'signin-needed') && (
            <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-200 hover:border-kerala-300 text-gray-700 rounded-md text-sm font-semibold">Close</button>
          )}
        </footer>
      </div>
    </div>
  )
}

export default ApplyModal
