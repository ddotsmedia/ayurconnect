'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, Loader2, CheckCircle2 } from 'lucide-react'

export type CandidateData = {
  id: string; fullName: string; headline: string | null; phone: string | null; whatsapp: string | null
  email: string | null; currentLocation: string | null; availability: string; profileVisibility: string
  specializations: string[]; skills: string[]; languages: string[]; totalExperience: number
  willingToRelocate: boolean; openToTelemedicine: boolean; openToLocum: boolean
  expectedSalary: number | null; salaryCurrency: string; profileCompleteness: number
  resumeUrl: string | null; highestQualification: string | null
}

const EMPTY = {
  fullName: '', headline: '', phone: '', whatsapp: '', email: '', currentLocation: '',
  availability: 'open_to_offers', profileVisibility: 'public',
  specializations: [] as string[], skills: [] as string[], languages: [] as string[],
  totalExperience: 0, willingToRelocate: false, openToTelemedicine: false, openToLocum: false,
  expectedSalary: 0, salaryCurrency: 'INR', resumeUrl: '', highestQualification: 'BAMS',
}

const SPECS = ['Panchakarma','Kayachikitsa','Shalya','Shalakya','Prasuti Tantra','Kaumarbhritya','Manasika','Rasashastra','Dravyaguna','Roganidana','General']

export function ProfileClient({ initial }: { initial: CandidateData | null }) {
  const router = useRouter()
  const [exists] = useState(Boolean(initial))
  const [f, setF] = useState(() => initial ? {
    fullName: initial.fullName, headline: initial.headline ?? '', phone: initial.phone ?? '',
    whatsapp: initial.whatsapp ?? '', email: initial.email ?? '', currentLocation: initial.currentLocation ?? '',
    availability: initial.availability, profileVisibility: initial.profileVisibility,
    specializations: initial.specializations, skills: initial.skills, languages: initial.languages,
    totalExperience: initial.totalExperience, willingToRelocate: initial.willingToRelocate,
    openToTelemedicine: initial.openToTelemedicine, openToLocum: initial.openToLocum,
    expectedSalary: initial.expectedSalary ?? 0, salaryCurrency: initial.salaryCurrency,
    resumeUrl: initial.resumeUrl ?? '', highestQualification: initial.highestQualification ?? 'BAMS',
  } : { ...EMPTY })
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setSaved(false)
    try {
      if (!exists) {
        const r1 = await fetch('/api/jobs-portal/candidates/register', {
          method: 'POST', credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ fullName: f.fullName, email: f.email, phone: f.phone, whatsapp: f.whatsapp }),
        })
        if (!r1.ok && r1.status !== 409) throw new Error(`HTTP ${r1.status}`)
      }
      const r2 = await fetch('/api/jobs-portal/candidates/me', {
        method: 'PATCH', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...f, skills: f.skills, languages: f.languages, specializations: f.specializations }),
      })
      if (!r2.ok) throw new Error(`HTTP ${r2.status}`)
      setSaved(true); window.setTimeout(() => router.refresh(), 600)
    } finally { setBusy(false) }
  }

  function toggle(field: 'specializations' | 'skills' | 'languages', v: string) {
    setF((x) => ({ ...x, [field]: x[field].includes(v) ? x[field].filter((y) => y !== v) : [...x[field], v] }))
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {!exists && (
        <div className="bg-amber-50 border border-amber-200 rounded-card p-3 text-sm text-amber-900">
          Create your candidate profile to apply for jobs.
        </div>
      )}
      <header className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
        <p className="text-xs uppercase tracking-wider text-gray-500">Candidate profile</p>
        <h1 className="font-serif text-2xl text-ink">{f.fullName || 'New profile'}</h1>
        {exists && initial && (
          <>
            <p className="text-xs text-gray-600">Completeness <strong>{initial.profileCompleteness}%</strong></p>
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-amber-400" style={{ width: `${initial.profileCompleteness}%` }} /></div>
          </>
        )}
      </header>

      <section className="bg-white border border-gray-100 rounded-card p-4 shadow-card space-y-2">
        <h2 className="font-serif text-lg text-ink">Basics</h2>
        <L l="Full name *"><input required className="input" value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} /></L>
        <L l="Headline"><input className="input" value={f.headline} onChange={(e) => setF({ ...f, headline: e.target.value })} placeholder="e.g. BAMS, MD Panchakarma · 8 years" /></L>
        <div className="grid grid-cols-2 gap-3">
          <L l="Email *"><input required type="email" className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></L>
          <L l="Phone"><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></L>
          <L l="WhatsApp"><input className="input" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} /></L>
          <L l="Current location"><input className="input" value={f.currentLocation} onChange={(e) => setF({ ...f, currentLocation: e.target.value })} /></L>
          <L l="Total experience (yrs)"><input type="number" min={0} className="input" value={f.totalExperience} onChange={(e) => setF({ ...f, totalExperience: Number(e.target.value) })} /></L>
          <L l="Highest qualification"><select className="input" value={f.highestQualification} onChange={(e) => setF({ ...f, highestQualification: e.target.value })}><option>BAMS</option><option>MD_Ayurveda</option><option>MS_Ayurveda</option><option>PhD</option><option>Diploma</option><option>Certificate</option></select></L>
        </div>
      </section>

      <Chips title="Specializations" options={SPECS} selected={f.specializations} onToggle={(v) => toggle('specializations', v)} />
      <Chips title="Languages" options={['English','Malayalam','Hindi','Tamil','Arabic','Sanskrit']} selected={f.languages} onToggle={(v) => toggle('languages', v)} />

      <section className="bg-white border border-gray-100 rounded-card p-4 shadow-card space-y-2">
        <h2 className="font-serif text-lg text-ink">Job preferences</h2>
        <div className="grid grid-cols-2 gap-3">
          <L l="Availability"><select className="input" value={f.availability} onChange={(e) => setF({ ...f, availability: e.target.value })}><option value="actively_looking">Actively looking</option><option value="open_to_offers">Open to offers</option><option value="not_looking">Not looking</option></select></L>
          <L l="Visibility"><select className="input" value={f.profileVisibility} onChange={(e) => setF({ ...f, profileVisibility: e.target.value })}><option value="public">Public</option><option value="recruiters_only">Recruiters only</option><option value="hidden">Hidden</option></select></L>
          <L l="Expected salary"><input type="number" className="input" value={f.expectedSalary} onChange={(e) => setF({ ...f, expectedSalary: Number(e.target.value) })} /></L>
          <L l="Currency"><select className="input" value={f.salaryCurrency} onChange={(e) => setF({ ...f, salaryCurrency: e.target.value })}><option>INR</option><option>AED</option><option>USD</option><option>GBP</option><option>EUR</option><option>QAR</option></select></L>
        </div>
        <L l="Resume URL"><input className="input" value={f.resumeUrl} onChange={(e) => setF({ ...f, resumeUrl: e.target.value })} placeholder="https://…/resume.pdf" /></L>
        <div className="grid grid-cols-3 gap-2 text-sm pt-2">
          <Tog l="Willing to relocate"  v={f.willingToRelocate}  on={(b) => setF({ ...f, willingToRelocate: b })} />
          <Tog l="Open to telemedicine" v={f.openToTelemedicine} on={(b) => setF({ ...f, openToTelemedicine: b })} />
          <Tog l="Open to locum"        v={f.openToLocum}        on={(b) => setF({ ...f, openToLocum: b })} />
        </div>
      </section>

      <Link href="/jobs/resume-builder" className="block text-xs text-kerala-700 hover:underline">→ Open AI Resume Builder</Link>
      <Link href="/jobs/alerts" className="block text-xs text-kerala-700 hover:underline">→ Manage job alerts</Link>

      <button type="submit" disabled={busy} className="w-full inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold disabled:opacity-50">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {busy ? 'Saving…' : saved ? 'Saved!' : exists ? 'Save changes' : 'Create profile'}
      </button>
      <style jsx global>{`.input{width:100%;border:1px solid #e5e7eb;border-radius:0.375rem;padding:0.5rem 0.75rem;font-size:14px;background:white}.input:focus{outline:none;box-shadow:0 0 0 1px #155228;border-color:#155228}`}</style>
    </form>
  )
}

function L({ l, children }: { l: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-medium text-gray-700 mb-1">{l}</span>{children}</label>
}
function Tog({ l, v, on }: { l: string; v: boolean; on: (b: boolean) => void }) {
  return <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded text-sm cursor-pointer hover:bg-gray-50"><input type="checkbox" checked={v} onChange={(e) => on(e.target.checked)} />{l}</label>
}
function Chips({ title, options, selected, onToggle }: { title: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <section className="bg-white border border-gray-100 rounded-card p-4 shadow-card space-y-2">
      <h2 className="font-serif text-lg text-ink">{title}</h2>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = selected.includes(o)
          return <button type="button" key={o} onClick={() => onToggle(o)} className={'px-2.5 py-1 rounded-full text-xs border ' + (on ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-300')}>{on && '✓ '}{o}</button>
        })}
      </div>
    </section>
  )
}
