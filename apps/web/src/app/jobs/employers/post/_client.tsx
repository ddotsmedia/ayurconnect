'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Loader2, Save } from 'lucide-react'
import { ROLE_TYPES, specializationsFor, type RoleType } from '../../_role-constants'
const JOB_TYPES = ['full_time','part_time','contract','locum','internship','telemedicine']
const WORK_MODES = ['onsite','remote','hybrid']

export function JobPostClient() {
  const router = useRouter()
  const [roleType, setRoleType] = useState<RoleType>('doctor')
  const specs = specializationsFor(roleType)
  const [f, setF] = useState({
    title: '', description: '', jobType: 'full_time', workMode: 'onsite',
    specialization: specs[0], companyName: '', location: '', district: '', country: 'IN',
    experienceMin: '0', experienceMax: '', salaryCurrency: 'INR', salaryMin: '', salaryMax: '',
    skills: '', requirements: '', benefits: '', contactEmail: '', applicationDeadline: '',
    isUrgent: false, isFeatured: false,
    certifications: '', // therapist-specific: e.g. "CPR, First Aid, AYTC certified"
  })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  function switchRole(next: RoleType) {
    setRoleType(next)
    // Reset specialization to the first of the new role's list so the select
    // never renders an option that's not in its own <option> list.
    const nextSpecs = specializationsFor(next)
    if (!nextSpecs.includes(f.specialization)) setF({ ...f, specialization: nextSpecs[0] })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      const r = await fetch('/api/jobs-portal/jobs', {
        method: 'POST', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...f,
          // Job.type is the doctor/therapist/consultant discriminator on the
          // main Job row (already accepted by the DB column since 2026-05-19).
          type: roleType,
          experienceMin: Number(f.experienceMin) || 0,
          experienceMax: f.experienceMax ? Number(f.experienceMax) : null,
          salaryMin: f.salaryMin ? Number(f.salaryMin) : null,
          salaryMax: f.salaryMax ? Number(f.salaryMax) : null,
          skills: f.skills.split(',').map((s) => s.trim()).filter(Boolean),
          // Therapist certifications get folded into requirements[] so the
          // Job model doesn't need a new column. Prefix each line so admins
          // can quickly filter cert-related requirements in the pipeline.
          requirements: [
            ...f.requirements.split('\n').map((s) => s.trim()).filter(Boolean),
            ...(roleType === 'therapist' && f.certifications.trim()
              ? f.certifications.split(',').map((s) => `Certification: ${s.trim()}`).filter((s) => s !== 'Certification: ')
              : []),
          ],
          benefits: f.benefits.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      router.push('/jobs/employers/dashboard?posted=1')
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  return (
    <>
      {/* 3-way method tabs — Manual is current page; other two are dedicated routes */}
      <div className="mt-5 flex flex-wrap gap-2 border-b border-gray-200">
        <span className="inline-flex items-center gap-1.5 px-4 py-2 border-b-2 border-kerala-700 text-kerala-800 font-semibold text-sm">
          📝 Manual form
        </span>
        <Link href="/jobs/upload-poster" className="inline-flex items-center gap-1.5 px-4 py-2 border-b-2 border-transparent text-gray-600 hover:text-kerala-700 hover:border-kerala-300 text-sm">
          📋 Upload poster <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-full leading-none">NEW</span>
        </Link>
        <Link href="/jobs/quick-post" className="inline-flex items-center gap-1.5 px-4 py-2 border-b-2 border-transparent text-gray-600 hover:text-kerala-700 hover:border-kerala-300 text-sm">
          ⚡ Paste text <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-full leading-none">NEW</span>
        </Link>
      </div>
    <form onSubmit={submit} className="mt-4 bg-white border border-gray-100 rounded-card shadow-card p-5 space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Hiring a</label>
        <div className="grid grid-cols-3 gap-2">
          {ROLE_TYPES.map((rt) => (
            <button
              type="button"
              key={rt.value}
              onClick={() => switchRole(rt.value)}
              className={`px-3 py-2 rounded border text-sm font-medium text-left transition-colors ${roleType === rt.value ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-300'}`}
            >
              <span className="text-lg mr-1.5" aria-hidden>{rt.emoji}</span>{rt.label}
            </button>
          ))}
        </div>
      </div>

      <L l="Job title *"><input required className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder={roleType === 'therapist' ? 'e.g. Senior Panchakarma Therapist' : roleType === 'consultant' ? 'e.g. Wellness Consultant' : 'e.g. Senior Panchakarma Physician'} /></L>
      <L l="Description *"><textarea required rows={4} className="input" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></L>
      <div className="grid grid-cols-2 gap-3">
        <L l="Specialization"><select className="input" value={f.specialization} onChange={(e) => setF({ ...f, specialization: e.target.value })}>{specs.map((s) => <option key={s}>{s}</option>)}</select></L>
        <L l="Job type"><select className="input" value={f.jobType} onChange={(e) => setF({ ...f, jobType: e.target.value })}>{JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></L>
        <L l="Work mode"><select className="input" value={f.workMode} onChange={(e) => setF({ ...f, workMode: e.target.value })}>{WORK_MODES.map((t) => <option key={t} value={t}>{t}</option>)}</select></L>
        <L l="Country (ISO-2)"><input className="input" maxLength={2} value={f.country} onChange={(e) => setF({ ...f, country: e.target.value.toUpperCase() })} /></L>
        <L l="Location / city"><input className="input" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></L>
        <L l="District"><input className="input" value={f.district} onChange={(e) => setF({ ...f, district: e.target.value })} /></L>
        <L l="Min experience (yrs)"><input type="number" min={0} className="input" value={f.experienceMin} onChange={(e) => setF({ ...f, experienceMin: e.target.value })} /></L>
        <L l="Max experience (yrs)"><input type="number" min={0} className="input" value={f.experienceMax} onChange={(e) => setF({ ...f, experienceMax: e.target.value })} /></L>
        <L l="Salary currency"><select className="input" value={f.salaryCurrency} onChange={(e) => setF({ ...f, salaryCurrency: e.target.value })}><option>INR</option><option>AED</option><option>USD</option><option>GBP</option><option>EUR</option><option>QAR</option><option>SAR</option></select></L>
        <L l="Application deadline"><input type="date" className="input" value={f.applicationDeadline} onChange={(e) => setF({ ...f, applicationDeadline: e.target.value })} /></L>
        <L l="Salary min"><input type="number" className="input" value={f.salaryMin} onChange={(e) => setF({ ...f, salaryMin: e.target.value })} /></L>
        <L l="Salary max"><input type="number" className="input" value={f.salaryMax} onChange={(e) => setF({ ...f, salaryMax: e.target.value })} /></L>
      </div>
      <L l="Skills (comma-separated)"><input className="input" value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} placeholder="Pizhichil, Nasya, Patient counseling" /></L>
      <L l="Requirements (one per line)"><textarea rows={3} className="input" value={f.requirements} onChange={(e) => setF({ ...f, requirements: e.target.value })} /></L>
      {roleType === 'therapist' && (
        <L l="Certifications (comma-separated) — for therapist roles">
          <input className="input" value={f.certifications} onChange={(e) => setF({ ...f, certifications: e.target.value })} placeholder="AYTC certified, CPR, First Aid, on-the-job trained" />
        </L>
      )}
      <L l="Benefits (comma-separated)"><input className="input" value={f.benefits} onChange={(e) => setF({ ...f, benefits: e.target.value })} placeholder="Accommodation, Meals, Visa sponsorship" /></L>
      <L l="Contact email"><input type="email" className="input" value={f.contactEmail} onChange={(e) => setF({ ...f, contactEmail: e.target.value })} /></L>
      <div className="flex gap-3">
        <label className="inline-flex items-center gap-1.5 text-sm"><input type="checkbox" checked={f.isUrgent} onChange={(e) => setF({ ...f, isUrgent: e.target.checked })} /> Urgent</label>
        <label className="inline-flex items-center gap-1.5 text-sm"><input type="checkbox" checked={f.isFeatured} onChange={(e) => setF({ ...f, isFeatured: e.target.checked })} /> Featured</label>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button type="submit" disabled={busy} className="w-full inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold disabled:opacity-50">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {busy ? 'Posting…' : 'Publish job'}
      </button>
      <style jsx global>{`.input{width:100%;border:1px solid #e5e7eb;border-radius:0.375rem;padding:0.5rem 0.75rem;font-size:14px;background:white}.input:focus{outline:none;box-shadow:0 0 0 1px #155228;border-color:#155228}`}</style>
    </form>
    </>
  )
}

function L({ l, children }: { l: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-medium text-gray-700 mb-1">{l}</span>{children}</label>
}
