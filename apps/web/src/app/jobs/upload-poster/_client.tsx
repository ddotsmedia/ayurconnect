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
  experience_required?: string | null
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
}

function ConfidenceBadge({ score }: { score: number }) {
  const label = score >= 80 ? 'High' : score >= 55 ? 'Medium' : 'Low'
  const tone = score >= 80 ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
              : score >= 55 ? 'bg-amber-100 text-amber-800 border-amber-200'
              : 'bg-rose-100 text-rose-800 border-rose-200'
  return <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${tone}`}>{label} confidence · {score}%</span>
}

function Field({ label, value, ml }: { label: string; value?: string | number | null; ml?: string }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="border-b border-gray-100 py-2">
      <p className="text-[10px] uppercase tracking-wider text-kerala-700 font-semibold">{label}{ml ? ` · ${ml}` : ''}</p>
      <p className="text-sm text-gray-800 mt-0.5 break-words">{String(value)}</p>
    </div>
  )
}

export function PosterUploader() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing' | 'done' | 'error'>('idle')
  const [preview, setPreview] = useState<string | null>(null)
  const [parsed, setParsed]   = useState<Parsed | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(f: File) {
    setError(null)
    setParsed(null)
    setPreview(URL.createObjectURL(f))
    setStatus('uploading')
    const fd = new FormData()
    fd.append('file', f)
    try {
      setStatus('parsing')
      const rsp = await fetch('/api/jobs-portal/ai/parse-poster', { method: 'POST', body: fd })
      const j = await rsp.json()
      if (!rsp.ok || !j.ok) throw new Error(j.error || `HTTP ${rsp.status}`)
      setParsed(j.parsed as Parsed)
      setStatus('done')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      setError(message)
      setStatus('error')
    }
  }

  function reset() {
    setStatus('idle')
    setParsed(null)
    setPreview(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function buildPrefillUrl() {
    if (!parsed) return '/jobs/employers/post'
    const q = new URLSearchParams()
    if (parsed.title) q.set('title', parsed.title)
    if (parsed.company) q.set('clinic', parsed.company)
    if (parsed.location) q.set('location', parsed.location)
    if (parsed.description) q.set('description', parsed.description)
    if (parsed.specialization) q.set('specialty', parsed.specialization)
    if (parsed.salary_min != null) q.set('salaryMin', String(parsed.salary_min))
    if (parsed.salary_max != null) q.set('salaryMax', String(parsed.salary_max))
    if (parsed.currency) q.set('currency', parsed.currency)
    if (parsed.contact_phone) q.set('contactPhone', parsed.contact_phone)
    if (parsed.contact_email) q.set('contactEmail', parsed.contact_email)
    if (parsed.contact_whatsapp) q.set('contactWhatsapp', parsed.contact_whatsapp)
    if (parsed.walk_in_date) q.set('walkInDate', parsed.walk_in_date)
    if (parsed.walk_in_time) q.set('walkInTime', parsed.walk_in_time)
    if (parsed.walk_in_venue) q.set('walkInVenue', parsed.walk_in_venue)
    if (parsed.is_urgent) q.set('urgent', '1')
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

      {status === 'error' && (
        <div className="bg-rose-50 border border-rose-200 rounded-card p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-rose-700 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-rose-900">Couldn&apos;t read the poster</p>
              <p className="text-sm text-rose-800 mt-1">{error}</p>
              <button onClick={reset} className="mt-3 text-sm text-rose-900 underline">Try another image</button>
            </div>
          </div>
        </div>
      )}

      {status === 'done' && parsed && (
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
          <div>
            {preview && <img src={preview} alt="Poster" className="w-full rounded border border-gray-200" />}
            <div className="mt-3 flex flex-col gap-2">
              <ConfidenceBadge score={parsed.confidence ?? 60} />
              {parsed.is_urgent && <span className="text-[10px] px-2 py-0.5 rounded border font-semibold bg-rose-100 text-rose-800 border-rose-200 inline-block w-fit">Urgent hiring</span>}
              {parsed.visa_sponsorship && <span className="text-[10px] px-2 py-0.5 rounded border font-semibold bg-blue-100 text-blue-800 border-blue-200 inline-block w-fit">Visa sponsored</span>}
            </div>
            <button onClick={reset} className="mt-3 text-xs text-kerala-700 underline">Upload a different image</button>
          </div>

          <div className="bg-white border border-gray-100 rounded-card p-5">
            <div className="flex items-baseline gap-2 mb-2">
              <Check className="w-5 h-5 text-emerald-600" />
              <h2 className="font-serif text-xl text-kerala-800">AI extracted these details</h2>
            </div>
            <p className="text-xs text-gray-600 mb-4">Review, edit, and submit on the next screen. AI can miss things — always double-check before publishing.</p>

            <Field label="Title"          value={parsed.title} />
            <Field label="Company / Clinic" value={parsed.company} />
            <Field label="Location"       value={parsed.location} />
            <Field label="Specialization" value={parsed.specialization} />
            <Field label="Job Type"       value={parsed.job_type} />
            <Field label="Experience"     value={parsed.experience_required} />
            <Field label="Salary"         value={parsed.salary_min || parsed.salary_max
              ? `${parsed.currency ?? ''} ${parsed.salary_min ?? '?'} – ${parsed.salary_max ?? '?'}`.trim()
              : null} />
            <Field label="Qualifications" value={parsed.qualifications?.length ? parsed.qualifications.join(', ') : null} />
            <Field label="Walk-in date"   value={parsed.walk_in_date} />
            <Field label="Walk-in time"   value={parsed.walk_in_time} />
            <Field label="Walk-in venue"  value={parsed.walk_in_venue} />
            <Field label="Required documents" value={parsed.required_documents} />
            <Field label="Contact phone"     value={parsed.contact_phone} />
            <Field label="Contact WhatsApp"  value={parsed.contact_whatsapp} />
            <Field label="Contact email"     value={parsed.contact_email} />
            <Field label="Description"    value={parsed.description} />

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={buildPrefillUrl()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold text-sm"
              >
                <Sparkles className="w-4 h-4" /> Edit &amp; Submit <ArrowRight className="w-4 h-4" />
              </Link>
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
