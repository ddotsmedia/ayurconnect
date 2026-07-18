'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Upload, Sparkles, Check, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react'

type Parsed = {
  title?: string
  company?: string
  location?: string
  salary_min?: number | null
  salary_max?: number | null
  currency?: string | null
  job_type?: string | null
  role_type?: 'doctor' | 'therapist' | 'consultant' | null
  therapist_type?: string | null
  certifications?: string[]
  experience_required?: string | null
  experience_years?: number | null
  qualifications?: string[]
  specialization?: string | null
  description?: string
  contact_phone?: string | null
  contact_email?: string | null
  contact_whatsapp?: string | null
  walk_in_date?: string | null
  walk_in_time?: string | null
  walk_in_venue?: string | null
  required_documents?: string | null
  is_urgent?: boolean
  visa_sponsorship?: boolean
  confidence?: number
  confidence_by_field?: {
    title?:          number
    location?:       number
    salary?:         number
    role_type?:      number
    specialization?: number
    contact?:        number
  }
}

type ExtractError = { code: string; message: string; canRetry: boolean }

function ConfidenceBadge({ score }: { score: number }) {
  const label = score >= 80 ? 'High' : score >= 55 ? 'Medium' : 'Low'
  const tone = score >= 80 ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
              : score >= 55 ? 'bg-amber-100 text-amber-800 border-amber-200'
              : 'bg-rose-100 text-rose-800 border-rose-200'
  return <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${tone}`}>{label} confidence · {score}%</span>
}

// Small dot next to a field label showing 0-100 per-field confidence.
// Green ≥80, amber 55-79, rose <55. Omitted when we don't have a score.
function FieldConfidence({ score }: { score?: number }) {
  if (score === undefined || score === null) return null
  const tone = score >= 80 ? 'bg-emerald-500' : score >= 55 ? 'bg-amber-500' : 'bg-rose-500'
  return <span title={`AI confidence: ${score}%`} className={`inline-block w-1.5 h-1.5 rounded-full ${tone}`} />
}

function EditableField({
  label, value, onChange, placeholder, confidence, required,
}: {
  label:        string
  value:        string
  onChange:     (v: string) => void
  placeholder?: string
  confidence?:  number
  required?:    boolean
}) {
  const missing = required && !value.trim()
  return (
    <div className="border-b border-gray-100 py-2">
      <div className="flex items-center gap-1.5 mb-0.5">
        <p className="text-[10px] uppercase tracking-wider text-kerala-700 font-semibold">{label}{required ? ' *' : ''}</p>
        <FieldConfidence score={confidence} />
        {missing && <span className="text-[10px] text-rose-600 font-semibold">required</span>}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? '—'}
        className={`w-full text-sm px-2 py-1.5 border rounded bg-white ${missing ? 'border-rose-300' : 'border-gray-200 hover:border-kerala-300 focus:border-kerala-500'} focus:outline-none`}
      />
    </div>
  )
}

// Fields that must be present before the user can advance to /jobs/employers/post.
// AI can miss things; we won't let empty required values through.
const REQUIRED = ['title', 'location'] as const
const REQUIRED_CONTACT = ['contact_whatsapp', 'contact_phone', 'contact_email'] as const

export function PosterUploader() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing' | 'done' | 'error'>('idle')
  const [preview, setPreview] = useState<string | null>(null)
  const [parsed, setParsed]   = useState<Parsed | null>(null)
  const [edited, setEdited]   = useState<Parsed | null>(null)
  const [errorInfo, setErrorInfo] = useState<ExtractError | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(f: File) {
    setErrorInfo(null)
    setParsed(null); setEdited(null)
    setPreview(URL.createObjectURL(f))
    setStatus('uploading')
    const fd = new FormData()
    fd.append('file', f)
    try {
      setStatus('parsing')
      const rsp = await fetch('/api/jobs-portal/ai/parse-poster', { method: 'POST', body: fd })
      const j = await rsp.json() as { ok: boolean; parsed?: Parsed; code?: string; message?: string; canRetry?: boolean; error?: string }
      if (!rsp.ok || !j.ok) {
        // API now returns { ok:false, code, message, canRetry } — surface the
        // friendly message. Legacy error shape (older API) is caught too.
        throw { code: j.code ?? 'upstream-error', message: j.message ?? j.error ?? `HTTP ${rsp.status}`, canRetry: j.canRetry ?? true } as ExtractError
      }
      const p = j.parsed as Parsed
      setParsed(p)
      setEdited(p) // start editable state from AI output
      setStatus('done')
    } catch (e: unknown) {
      const info: ExtractError = (e && typeof e === 'object' && 'code' in e)
        ? e as ExtractError
        : { code: 'upstream-error', message: e instanceof Error ? e.message : String(e), canRetry: true }
      setErrorInfo(info)
      setStatus('error')
    }
  }

  function reset() {
    setStatus('idle')
    setParsed(null); setEdited(null)
    setPreview(null)
    setErrorInfo(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function patch(k: keyof Parsed, v: string) {
    setEdited((cur) => (cur ? { ...cur, [k]: v } : cur))
  }

  const missingRequired: string[] = !edited ? [] : [
    ...REQUIRED.filter((k) => !((edited[k] as string | null | undefined) ?? '').toString().trim()),
    ...(REQUIRED_CONTACT.every((k) => !((edited[k] as string | null | undefined) ?? '').toString().trim()) ? ['contact (WhatsApp / phone / email)'] : []),
  ]

  function buildPrefillUrl() {
    const src = edited ?? parsed
    if (!src) return '/jobs/employers/post'
    const q = new URLSearchParams()
    if (src.title)       q.set('title',       src.title)
    if (src.company)     q.set('clinic',      src.company)
    if (src.location)    q.set('location',    src.location)
    if (src.description) q.set('description', src.description)
    const spec = src.role_type === 'therapist' && src.therapist_type
      ? `${src.therapist_type} Therapist`
      : src.specialization
    if (spec) q.set('specialty', spec)
    if (src.role_type) q.set('roleType', src.role_type)
    if (src.certifications?.length) q.set('certifications', src.certifications.join(', '))
    if (src.experience_years != null) q.set('experienceMin', String(src.experience_years))
    if (src.salary_min != null) q.set('salaryMin', String(src.salary_min))
    if (src.salary_max != null) q.set('salaryMax', String(src.salary_max))
    if (src.currency)         q.set('currency', src.currency)
    if (src.contact_phone)    q.set('contactPhone', src.contact_phone)
    if (src.contact_email)    q.set('contactEmail', src.contact_email)
    if (src.contact_whatsapp) q.set('contactWhatsapp', src.contact_whatsapp)
    if (src.walk_in_date)     q.set('walkInDate', src.walk_in_date)
    if (src.walk_in_time)     q.set('walkInTime', src.walk_in_time)
    if (src.walk_in_venue)    q.set('walkInVenue', src.walk_in_venue)
    if (src.is_urgent)        q.set('urgent', '1')
    return `/jobs/employers/post?${q.toString()}`
  }

  return (
    <div>
      {status === 'idle' && (
        <label
          htmlFor="posterFile"
          className="block border-2 border-dashed border-kerala-300 rounded-card bg-white hover:bg-kerala-50/40 p-8 cursor-pointer text-center transition-colors"
        >
          <Upload className="w-10 h-10 text-kerala-700 mx-auto" />
          <p className="mt-3 font-serif text-lg text-ink">Drop a poster image here — or click to browse</p>
          <p className="text-xs text-gray-600 mt-1">JPG, PNG, WEBP · up to 8 MB · works with WhatsApp screenshots</p>
          <input
            id="posterFile"
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            capture="environment"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </label>
      )}

      {(status === 'uploading' || status === 'parsing') && (
        <div className="bg-white border border-gray-100 rounded-card p-8 text-center">
          {preview && <img src={preview} alt="Poster preview" className="max-h-48 mx-auto rounded" />}
          <div className="mt-4 inline-flex items-center gap-2 text-kerala-700">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="font-semibold">AI is reading your poster…</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Usually 3-8 seconds. Don&apos;t close this tab.</p>
        </div>
      )}

      {status === 'error' && errorInfo && (
        <div className="bg-rose-50 border border-rose-200 rounded-card p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-rose-700 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-rose-900">Couldn&apos;t read the poster</p>
              <p className="text-sm text-rose-800 mt-1">{errorInfo.message}</p>
              <p className="text-[10px] text-rose-700/70 mt-1 font-mono">code: {errorInfo.code}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {errorInfo.canRetry && (
                  <button onClick={reset} className="text-sm px-4 py-1.5 bg-white border border-rose-300 text-rose-900 rounded font-semibold hover:bg-rose-100">
                    Try another image
                  </button>
                )}
                <Link href="/jobs/employers/post" className="text-sm px-4 py-1.5 bg-kerala-700 text-white rounded font-semibold hover:bg-kerala-800">
                  Enter details manually →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {status === 'done' && edited && (
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
          <div>
            {preview && <img src={preview} alt="Poster" className="w-full rounded border border-gray-200" />}
            <div className="mt-3 flex flex-col gap-2">
              <ConfidenceBadge score={edited.confidence ?? 60} />
              {edited.is_urgent && <span className="text-[10px] px-2 py-0.5 rounded border font-semibold bg-rose-100 text-rose-800 border-rose-200 inline-block w-fit">Urgent hiring</span>}
              {edited.visa_sponsorship && <span className="text-[10px] px-2 py-0.5 rounded border font-semibold bg-blue-100 text-blue-800 border-blue-200 inline-block w-fit">Visa sponsored</span>}
            </div>
            <button onClick={reset} className="mt-3 text-xs text-kerala-700 underline">Upload a different image</button>
          </div>

          <div className="bg-white border border-gray-100 rounded-card p-5">
            <div className="flex items-baseline gap-2 mb-2">
              <Check className="w-5 h-5 text-emerald-600" />
              <h2 className="font-serif text-xl text-kerala-800">Review &amp; edit the extracted details</h2>
            </div>
            <p className="text-xs text-gray-600 mb-4">AI can miss things — edit any field below before continuing. Fields with * are required.</p>

            <EditableField label="Title"            value={edited.title ?? ''}               onChange={(v) => patch('title', v)}         required confidence={edited.confidence_by_field?.title} />
            <EditableField label="Location"         value={edited.location ?? ''}            onChange={(v) => patch('location', v)}      required confidence={edited.confidence_by_field?.location} />
            <EditableField label="Contact WhatsApp" value={edited.contact_whatsapp ?? ''}    onChange={(v) => patch('contact_whatsapp', v)} confidence={edited.confidence_by_field?.contact} placeholder="+91 98765 43210" />
            <EditableField label="Contact phone"    value={edited.contact_phone ?? ''}       onChange={(v) => patch('contact_phone', v)} />
            <EditableField label="Contact email"    value={edited.contact_email ?? ''}       onChange={(v) => patch('contact_email', v)} />
            <EditableField label="Role"             value={edited.role_type ?? ''}           onChange={(v) => patch('role_type', v)}     confidence={edited.confidence_by_field?.role_type} placeholder="doctor / therapist / consultant" />
            <EditableField label="Therapist type"   value={edited.therapist_type ?? ''}      onChange={(v) => patch('therapist_type', v)} />
            <EditableField label="Company / Clinic" value={edited.company ?? ''}             onChange={(v) => patch('company', v)} />
            <EditableField label="Specialization"   value={edited.specialization ?? ''}      onChange={(v) => patch('specialization', v)} confidence={edited.confidence_by_field?.specialization} />
            <EditableField label="Job type"         value={edited.job_type ?? ''}            onChange={(v) => patch('job_type', v)}      placeholder="full-time / part-time / locum / walk-in" />
            <EditableField label="Experience"       value={edited.experience_required ?? ''} onChange={(v) => patch('experience_required', v)} />
            <EditableField label="Certifications"   value={(edited.certifications ?? []).join(', ')} onChange={(v) => setEdited((c) => c ? { ...c, certifications: v.split(',').map((s) => s.trim()).filter(Boolean) } : c)} placeholder="AYTC, CPR, First Aid" />
            <EditableField label="Description"      value={edited.description ?? ''}         onChange={(v) => patch('description', v)} />

            {missingRequired.length > 0 && (
              <p className="mt-3 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded p-2">
                Fill in required fields before continuing: {missingRequired.join(', ')}.
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              {missingRequired.length === 0 ? (
                <Link href={buildPrefillUrl()} className="inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold text-sm">
                  <Sparkles className="w-4 h-4" /> Continue to full form <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button disabled className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-300 text-gray-500 rounded font-semibold text-sm cursor-not-allowed" title="Fill required fields first">
                  <Sparkles className="w-4 h-4" /> Continue to full form <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button onClick={reset} className="px-5 py-2.5 border-2 border-kerala-700 text-kerala-700 rounded font-semibold text-sm hover:bg-kerala-50">
                Upload another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
