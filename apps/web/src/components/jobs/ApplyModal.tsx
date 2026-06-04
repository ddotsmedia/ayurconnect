'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle2, Loader2, AlertCircle, ArrowLeft, ArrowRight, Send } from 'lucide-react'
import { QUALIFICATIONS } from '../../lib/data/jobs'

const EXPERIENCE_RANGES = ['0-2 years', '2-5 years', '5-10 years', '10-15 years', '15+ years']
const STORAGE_KEY = 'ayur_applications'

type LocalEntry = { jobId: string; email: string; appliedAt: string }

function readLocal(): LocalEntry[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as LocalEntry[] }
  catch { return [] }
}
function writeLocal(arr: LocalEntry[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)) } catch { /* quota */ }
}

export function ApplyModal({
  jobId, jobTitle, clinic, onClose,
}: {
  jobId: string
  jobTitle: string
  clinic: string
  onClose: () => void
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 'done' | 'already'>(1)
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    qualification: '', experience: '', coverNote: '',
  })
  const [busy, setBusy] = useState(false)
  const [err, setErr]   = useState<string | null>(null)

  useEffect(() => {
    const local = readLocal()
    if (form.email && local.some((a) => a.jobId === jobId && a.email === form.email.trim().toLowerCase())) {
      setStep('already')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.email])

  function next() {
    setErr(null)
    if (step === 1) {
      if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
        setErr('Please fill name, email and phone.'); return
      }
      setStep(2)
    } else if (step === 2) {
      if (!form.qualification || !form.experience) { setErr('Pick a qualification and experience range.'); return }
      setStep(3)
    }
  }

  async function submit() {
    setBusy(true); setErr(null)
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim(),
          qualification: form.qualification, experience: form.experience, coverNote: form.coverNote.trim(),
        }),
        credentials: 'include',
      })
      if (res.status === 409) { setStep('already'); return }
      if (!res.ok) {
        const j = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      const local = readLocal()
      local.push({ jobId, email: form.email.trim().toLowerCase(), appliedAt: new Date().toISOString() })
      writeLocal(local)
      setStep('done')
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally { setBusy(false) }
  }

  const ic = 'w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700'

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-card max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-lg text-ink">Apply: {jobTitle}</h2>
            <p className="text-xs text-muted">{clinic}</p>
          </div>
          <button onClick={onClose} aria-label="Close"><X className="w-5 h-5" /></button>
        </header>

        {step !== 'done' && step !== 'already' && (
          <div className="px-5 pt-4 flex items-center gap-1 text-[10px] uppercase tracking-wider text-gray-400">
            <span className={step === 1 ? 'text-kerala-700 font-semibold' : ''}>1. Contact</span>
            <span>·</span>
            <span className={step === 2 ? 'text-kerala-700 font-semibold' : ''}>2. Qualifications</span>
            <span>·</span>
            <span className={step === 3 ? 'text-kerala-700 font-semibold' : ''}>3. Review</span>
          </div>
        )}

        <div className="p-5 space-y-3">
          {err && (
            <div className="p-3 rounded bg-red-50 border border-red-100 text-sm text-red-800 inline-flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5" /> {err}
            </div>
          )}

          {step === 1 && (
            <>
              <input className={ic} placeholder="Full name *"     value={form.name}  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={ic} placeholder="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className={ic} placeholder="Phone (with country code) *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </>
          )}

          {step === 2 && (
            <>
              <select className={ic} value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })}>
                <option value="">Qualification *</option>
                {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q}</option>)}
              </select>
              <select className={ic} value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })}>
                <option value="">Experience *</option>
                {EXPERIENCE_RANGES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
              <div>
                <textarea
                  className={ic + ' min-h-[100px]'}
                  rows={4}
                  maxLength={500}
                  placeholder="Cover note — why you're a fit (optional)"
                  value={form.coverNote}
                  onChange={(e) => setForm({ ...form, coverNote: e.target.value })}
                />
                <p className="text-[10px] text-right text-gray-400">{form.coverNote.length} / 500</p>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="bg-gray-50 rounded p-3 space-y-1.5 text-sm">
              <div><strong>{form.name}</strong> · {form.email} · {form.phone}</div>
              <div className="text-xs text-gray-600">{form.qualification} · {form.experience}</div>
              {form.coverNote && <p className="text-sm text-gray-800 whitespace-pre-line mt-2">{form.coverNote}</p>}
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-serif text-lg text-ink">Application submitted</h3>
              <p className="text-sm text-gray-700 mt-1">We sent your details to <strong>{clinic}</strong> for <strong>{jobTitle}</strong>. You&apos;ll hear back via email or phone.</p>
            </div>
          )}

          {step === 'already' && (
            <div className="text-center py-4">
              <CheckCircle2 className="w-10 h-10 text-amber-600 mx-auto mb-3" />
              <h3 className="font-serif text-lg text-ink">Already applied</h3>
              <p className="text-sm text-gray-700 mt-1">An application with this email already exists for this job.</p>
            </div>
          )}
        </div>

        {step === 1 || step === 2 || step === 3 ? (
          <footer className="flex items-center justify-between p-5 border-t border-gray-100">
            {step > 1 ? (
              <button onClick={() => setStep((step - 1) as 1 | 2)} className="inline-flex items-center gap-1 text-sm text-gray-700">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <span />}
            {step < 3 ? (
              <button onClick={next} className="inline-flex items-center gap-1 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded-md text-sm font-semibold">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={submit} disabled={busy} className="inline-flex items-center gap-1 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 text-white rounded-md text-sm font-semibold">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit application
              </button>
            )}
          </footer>
        ) : (
          <footer className="p-5 border-t border-gray-100">
            <button onClick={onClose} className="w-full px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded-md text-sm font-semibold">Close</button>
          </footer>
        )}
      </div>
    </div>
  )
}

export default ApplyModal
