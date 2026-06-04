'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Send, AlertCircle, CheckCircle2 } from 'lucide-react'
import { SPECIALTIES, EMPLOYMENT_TYPES, QUALIFICATIONS, BENEFITS, CURRENCIES, KERALA_DISTRICTS, UAE_CITIES, DOCTOR_LOOKING_FOR } from '../../lib/data/jobs'

type Role = 'public' | 'doctor' | 'hospital' | 'admin' | 'unsupported'

function classifyRole(role?: string | null): Role {
  if (!role) return 'public'
  if (role === 'ADMIN') return 'admin'
  if (role === 'DOCTOR' || role === 'DOCTOR_PENDING') return 'doctor'
  if (role === 'HOSPITAL' || role === 'HOSPITAL_PENDING') return 'hospital'
  return 'unsupported'
}

export function PostJobForm({ role: rawRole }: { role?: string | null }) {
  const role = classifyRole(rawRole)
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const ic = 'w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700'

  if (role === 'public') {
    return (
      <div className="bg-white rounded-card border border-gray-100 shadow-card p-8 text-center max-w-xl mx-auto">
        <h2 className="font-serif text-2xl text-ink">Sign in to post</h2>
        <p className="text-sm text-muted mt-2">Job posting is gated to verified doctors and clinics.</p>
        <div className="mt-5 flex justify-center gap-2 flex-wrap">
          <Link href="/sign-in?next=/jobs/post" className="px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded-md text-sm font-semibold">Sign in</Link>
          <Link href="/register/doctor" className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-50">Join as Doctor</Link>
          <Link href="/register/hospital" className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-50">Join as Hospital</Link>
        </div>
      </div>
    )
  }
  if (role === 'unsupported') {
    return (
      <div className="bg-white rounded-card border border-gray-100 shadow-card p-8 text-center max-w-xl mx-auto">
        <h2 className="font-serif text-2xl text-ink">Job posting is for doctors + clinics</h2>
        <p className="text-sm text-muted mt-2">Your account isn&apos;t set up to post jobs. Register as a doctor or hospital to continue.</p>
        <div className="mt-5 flex justify-center gap-2 flex-wrap">
          <Link href="/register/doctor" className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-50">Join as Doctor</Link>
          <Link href="/register/hospital" className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-50">Join as Hospital</Link>
        </div>
      </div>
    )
  }

  if (role === 'doctor') return <DoctorForm ic={ic} busy={busy} setBusy={setBusy} err={err} setErr={setErr} ok={ok} setOk={setOk} router={router} />
  return <HospitalForm ic={ic} busy={busy} setBusy={setBusy} err={err} setErr={setErr} ok={ok} setOk={setOk} router={router} isAdmin={role === 'admin'} />
}

type CommonProps = {
  ic: string
  busy: boolean; setBusy: (v: boolean) => void
  err: string | null; setErr: (v: string | null) => void
  ok: string | null; setOk: (v: string | null) => void
  router: ReturnType<typeof useRouter>
}

function DoctorForm({ ic, busy, setBusy, err, setErr, ok, setOk, router }: CommonProps) {
  const [form, setForm] = useState({
    lookingFor: 'Locum Cover' as typeof DOCTOR_LOOKING_FOR[number],
    specialty: 'Kayachikitsa',
    location: '',
    availFrom: '',
    availDurationDays: '14',
    description: '',
    contactKind: 'email' as 'email' | 'whatsapp' | 'phone',
    contactValue: '',
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null); setOk(null)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title:        `${form.lookingFor} — ${form.specialty}`,
          description:  form.description.trim(),
          type:         'doctor',
          specialty:    form.specialty,
          location:     form.location.trim(),
          availFrom:    form.availFrom || null,
          availDurationDays: form.availDurationDays ? Number(form.availDurationDays) : null,
          contactKind:  form.contactKind,
          contactValue: form.contactValue.trim(),
          tags:         [form.lookingFor],
        }),
        credentials: 'include',
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}`)
      setOk('Availability posted — verified clinics can now contact you.')
      setTimeout(() => router.push('/jobs'), 1500)
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-card border border-gray-100 shadow-card p-6 max-w-xl mx-auto space-y-4">
      <h2 className="font-serif text-xl text-ink">Post your availability</h2>
      <p className="text-xs text-muted">Free. Visible to verified clinics only.</p>

      {err && <FormErr err={err} />}
      {ok && <FormOk ok={ok} />}

      <Field label="Looking for *">
        <select className={ic} value={form.lookingFor} onChange={(e) => setForm({ ...form, lookingFor: e.target.value as typeof form.lookingFor })}>
          {DOCTOR_LOOKING_FOR.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
      </Field>
      <Field label="Specialty *">
        <select className={ic} value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })}>
          {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Preferred location">
        <input className={ic} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Kochi, Dubai, Remote" />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Available from *">
          <input type="date" className={ic} required value={form.availFrom} onChange={(e) => setForm({ ...form, availFrom: e.target.value })} />
        </Field>
        <Field label="Duration (days)">
          <input type="number" min={1} max={365} className={ic} value={form.availDurationDays} onChange={(e) => setForm({ ...form, availDurationDays: e.target.value })} />
        </Field>
      </div>
      <Field label="Description *">
        <textarea required maxLength={300} rows={4} className={ic} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What kind of role would you like — what's your experience, what days/hours, anything clinics should know" />
        <p className="text-[10px] text-right text-gray-400">{form.description.length} / 300</p>
      </Field>
      <Field label="Contact preference *">
        <div className="flex items-center gap-2 mb-2">
          {(['email', 'whatsapp', 'phone'] as const).map((k) => (
            <label key={k} className="inline-flex items-center gap-1 text-sm cursor-pointer">
              <input type="radio" name="contactKind" checked={form.contactKind === k} onChange={() => setForm({ ...form, contactKind: k })} />
              <span className="capitalize">{k}</span>
            </label>
          ))}
        </div>
        <input className={ic} required value={form.contactValue} onChange={(e) => setForm({ ...form, contactValue: e.target.value })} placeholder={form.contactKind === 'email' ? 'your@email.com' : '+91XXXXXXXXXX'} />
      </Field>

      <button type="submit" disabled={busy} className="w-full inline-flex justify-center items-center gap-1 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 text-white rounded-md text-sm font-semibold">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Post Availability
      </button>
    </form>
  )
}

const ALL_LOCATIONS = [...KERALA_DISTRICTS, ...UAE_CITIES, 'Remote']

function HospitalForm({ ic, busy, setBusy, err, setErr, ok, setOk, router, isAdmin }: CommonProps & { isAdmin: boolean }) {
  const [form, setForm] = useState({
    title: '', specialty: 'Kayachikitsa', type: 'Full-time',
    location: '', remote: false,
    qualifications: [] as string[],
    expMin: '0', expMax: '5',
    currency: 'INR', salaryMin: '', salaryMax: '',
    requirements: '', benefits: [] as string[],
    deadline: '',
    urgent: false,
    contactEmail: '',
    status: 'active', featured: false, publishImmediately: true, internalNotes: '',
  })

  function toggle(field: 'qualifications' | 'benefits', value: string) {
    setForm((f) => ({ ...f, [field]: f[field].includes(value) ? f[field].filter((x) => x !== value) : [...f[field], value] }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null); setOk(null)
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(), description: form.requirements.trim() || form.title,
        type: form.type, specialty: form.specialty,
        location: form.location.trim(), remote: form.remote,
        qualifications: form.qualifications,
        expMin: form.expMin ? Number(form.expMin) : null,
        expMax: form.expMax ? Number(form.expMax) : null,
        currency: form.currency,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
        deadline: form.deadline || null,
        urgent: form.urgent,
        benefits: form.benefits,
        requirements: form.requirements.split('\n').map((r) => r.trim()).filter(Boolean),
        contactEmail: form.contactEmail.trim() || null,
      }
      if (isAdmin) {
        payload.status = form.status
        payload.featured = form.featured
        payload.publishImmediately = form.publishImmediately
        payload.internalNotes = form.internalNotes.trim() || null
      }
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}`)
      const created = await res.json() as { id: string; status: string }
      setOk(isAdmin ? `Job published (status: ${created.status}).` : 'Submitted for review. Goes live within 24h after our team approves it.')
      setTimeout(() => router.push(`/jobs/${created.id}`), 1500)
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-card border border-gray-100 shadow-card p-6 max-w-2xl mx-auto space-y-4">
      <h2 className="font-serif text-xl text-ink">{isAdmin ? 'Publish job' : 'Post a job'}</h2>
      {!isAdmin && <p className="text-xs text-muted">Live within 24h after review.</p>}

      {err && <FormErr err={err} />}
      {ok && <FormOk ok={ok} />}

      <Field label="Title *">
        <input className={ic} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Panchakarma BAMS doctor for Dubai clinic" />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Specialty *">
          <select className={ic} value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })}>
            {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Employment type *">
          <div className="flex flex-wrap gap-1.5">
            {EMPLOYMENT_TYPES.map((t) => (
              <label key={t} className={'text-xs px-3 py-1.5 rounded-full border cursor-pointer ' + (form.type === t ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200')}>
                <input type="radio" name="type" className="sr-only" checked={form.type === t} onChange={() => setForm({ ...form, type: t })} />
                {t}
              </label>
            ))}
          </div>
        </Field>
      </div>

      <Field label="Location *">
        <select className={ic} required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
          <option value="">Choose…</option>
          {ALL_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <label className="inline-flex items-center gap-2 mt-1 text-sm">
          <input type="checkbox" checked={form.remote} onChange={(e) => setForm({ ...form, remote: e.target.checked })} /> Remote / telemedicine
        </label>
      </Field>

      <Field label="Required qualifications">
        <div className="flex flex-wrap gap-2">
          {QUALIFICATIONS.map((q) => (
            <label key={q} className={'text-xs px-3 py-1.5 rounded-full border cursor-pointer ' + (form.qualifications.includes(q) ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200')}>
              <input type="checkbox" className="sr-only" checked={form.qualifications.includes(q)} onChange={() => toggle('qualifications', q)} /> {q}
            </label>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Experience min (yrs)">
          <input type="range" min={0} max={20} value={form.expMin} onChange={(e) => setForm({ ...form, expMin: e.target.value })} className="w-full" />
          <p className="text-[10px] text-gray-500">{form.expMin}+</p>
        </Field>
        <Field label="Experience max (yrs)">
          <input type="range" min={0} max={20} value={form.expMax} onChange={(e) => setForm({ ...form, expMax: e.target.value })} className="w-full" />
          <p className="text-[10px] text-gray-500">up to {form.expMax}</p>
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Currency">
          <select className={ic} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Salary min">
          <input className={ic} type="number" min={0} value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
        </Field>
        <Field label="Salary max">
          <input className={ic} type="number" min={0} value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
        </Field>
      </div>

      <Field label="Requirements (one per line)">
        <textarea className={ic + ' min-h-[120px]'} rows={6} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="BAMS qualified&#10;3+ years Panchakarma experience&#10;Fluent Malayalam + English" />
      </Field>

      <Field label="Benefits">
        <div className="flex flex-wrap gap-2">
          {BENEFITS.map((b) => (
            <label key={b} className={'text-xs px-3 py-1.5 rounded-full border cursor-pointer ' + (form.benefits.includes(b) ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200')}>
              <input type="checkbox" className="sr-only" checked={form.benefits.includes(b)} onChange={() => toggle('benefits', b)} /> {b}
            </label>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Application deadline">
          <input type="date" className={ic} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        </Field>
        <Field label="Contact email *">
          <input type="email" className={ic} required value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
        </Field>
      </div>

      <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={form.urgent} onChange={(e) => setForm({ ...form, urgent: e.target.checked })} /> Mark as urgent (fills faster, slightly higher review priority)
      </label>

      {isAdmin && (
        <details open className="rounded border border-amber-200 bg-amber-50 p-3">
          <summary className="text-xs uppercase tracking-wider text-amber-800 font-semibold cursor-pointer">Admin controls</summary>
          <div className="mt-3 space-y-3">
            <Field label="Status">
              <select className={ic} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
              </select>
            </Field>
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured
            </label>
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.publishImmediately} onChange={(e) => setForm({ ...form, publishImmediately: e.target.checked })} /> Publish immediately (bypass review)
            </label>
            <Field label="Internal notes">
              <textarea className={ic} rows={3} value={form.internalNotes} onChange={(e) => setForm({ ...form, internalNotes: e.target.value })} />
            </Field>
          </div>
        </details>
      )}

      <button type="submit" disabled={busy} className="w-full inline-flex justify-center items-center gap-1 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 text-white rounded-md text-sm font-semibold">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} {isAdmin ? 'Publish Job' : 'Submit for Review'}
      </button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-1">{label}</label>
      {children}
    </div>
  )
}

function FormErr({ err }: { err: string }) {
  return (
    <div className="p-3 rounded bg-red-50 border border-red-100 text-sm text-red-800 inline-flex items-start gap-2">
      <AlertCircle className="w-4 h-4 mt-0.5" /> {err}
    </div>
  )
}
function FormOk({ ok }: { ok: string }) {
  return (
    <div className="p-3 rounded bg-emerald-50 border border-emerald-100 text-sm text-emerald-800 inline-flex items-start gap-2">
      <CheckCircle2 className="w-4 h-4 mt-0.5" /> {ok}
    </div>
  )
}

export default PostJobForm
