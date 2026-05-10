'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, AlertTriangle } from 'lucide-react'
import { ImageUpload } from '../../../components/image-upload'

type DoctorOwned = {
  id: string; name: string; specialization: string; district: string;
  qualification: string | null; experienceYears: number | null;
  ccimVerified: boolean; consultationFee: number | null;
  languages: string[] | null; availableDays: string[] | null;
  availableForOnline: boolean | null; profile: string | null;
  bio: string | null; photoUrl: string | null;
}
type HospitalOwned = {
  id: string; name: string; type: string; district: string;
  ccimVerified: boolean; ayushCertified: boolean; panchakarma: boolean; nabh: boolean;
  establishedYear: number | null; services: string[] | null;
  profile: string | null; contact: string | null; address: string | null;
  latitude: number | null; longitude: number | null;
}
type Me = {
  user: {
    id: string
    email: string
    name: string | null
    role: string
    prakriti: string | null
    phone: string | null
    emailVerified: boolean
    doctorId: string | null
    hospitalId: string | null
    ownedDoctor: DoctorOwned | null
    ownedHospital: HospitalOwned | null
  } | null
}

const PRAKRITIS = [
  { id: '',         label: '— not set —' },
  { id: 'vata',     label: 'Vata' },
  { id: 'pitta',    label: 'Pitta' },
  { id: 'kapha',    label: 'Kapha' },
  { id: 'vata-pitta',  label: 'Vata-Pitta' },
  { id: 'pitta-kapha', label: 'Pitta-Kapha' },
  { id: 'vata-kapha',  label: 'Vata-Kapha' },
  { id: 'tridosha',    label: 'Tridosha (balanced)' },
]

export default function ProfilePage() {
  const [me, setMe] = useState<Me['user']>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', prakriti: '' })

  async function load() {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/me', { credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as Me
      setMe(data.user)
      if (data.user) {
        setForm({
          name: data.user.name ?? '',
          phone: data.user.phone ?? '',
          prakriti: data.user.prakriti ?? '',
        })
      }
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null); setOk(false)
    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setOk(true)
      await load()
    } catch (e) { setError(String(e)) } finally { setSaving(false) }
  }

  if (loading) return <p className="text-muted">Loading…</p>
  if (!me) return <p className="text-muted">Sign in to view your profile.</p>

  const isDoctor   = me.role === 'DOCTOR'   || me.role === 'DOCTOR_PENDING'   || me.doctorId   != null
  const isHospital = me.role === 'HOSPITAL' || me.role === 'HOSPITAL_PENDING' || me.hospitalId != null

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-kerala-700">My profile</h1>
        <p className="text-muted mt-1">Update your name, phone, and prakriti.</p>
      </header>

      {!me.emailVerified && (
        <div className="p-3 rounded bg-amber-50 border border-amber-100 text-sm text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            Your email <strong>{me.email}</strong> isn&apos;t verified yet. Verification will be sent automatically once Resend is wired in.
          </div>
        </div>
      )}

      <form onSubmit={save} className="bg-white rounded-card border border-gray-100 shadow-card p-6 space-y-4">
        <label className="block">
          <span className="block text-xs font-medium text-gray-700 mb-1.5">Name</span>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-kerala-600"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-gray-700 mb-1.5">Email</span>
          <input value={me.email} disabled className="w-full border rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500" />
          <span className="text-[11px] text-muted">Email is fixed. Contact support to change it.</span>
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-gray-700 mb-1.5">Phone (WhatsApp / SMS)</span>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91-..."
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-kerala-600"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-gray-700 mb-1.5">Prakriti (Ayurvedic body type)</span>
          <select
            value={form.prakriti}
            onChange={(e) => setForm({ ...form, prakriti: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-kerala-600"
          >
            {PRAKRITIS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <span className="text-[11px] text-muted">Not sure? <Link href="/ayurbot" className="text-kerala-700 hover:underline">Ask AyurBot</Link>.</span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {ok    && <p className="text-sm text-kerala-700">Saved ✓</p>}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-kerala-600 text-white rounded-md font-semibold hover:bg-kerala-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      {isDoctor   && me.ownedDoctor   && <DoctorEditForm   doctor={me.ownedDoctor}     onSaved={load} />}
      {isHospital && me.ownedHospital && <HospitalEditForm hospital={me.ownedHospital} onSaved={load} />}
    </div>
  )
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function DoctorEditForm({ doctor, onSaved }: { doctor: DoctorOwned; onSaved: () => void | Promise<void> }) {
  const [d, setD] = useState({
    name: doctor.name,
    specialization: doctor.specialization,
    district: doctor.district,
    qualification: doctor.qualification ?? '',
    experienceYears: doctor.experienceYears ?? 0,
    consultationFee: doctor.consultationFee ?? 0,
    languages: (doctor.languages ?? []).join(', '),
    availableDays: new Set(doctor.availableDays ?? []),
    availableForOnline: doctor.availableForOnline ?? true,
    profile: doctor.profile ?? '',
    bio: doctor.bio ?? '',
    photoUrl: doctor.photoUrl ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  function toggleDay(day: string) {
    const next = new Set(d.availableDays)
    if (next.has(day)) next.delete(day); else next.add(day)
    setD({ ...d, availableDays: next })
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr(null); setOk(false)
    try {
      const body = {
        name: d.name,
        specialization: d.specialization,
        district: d.district,
        qualification: d.qualification,
        experienceYears: Number(d.experienceYears) || 0,
        consultationFee: Number(d.consultationFee) || 0,
        languages: d.languages.split(',').map((s) => s.trim()).filter(Boolean),
        availableDays: Array.from(d.availableDays),
        availableForOnline: d.availableForOnline,
        profile: d.profile,
        bio: d.bio,
        photoUrl: d.photoUrl,
      }
      const res = await fetch('/api/me/doctor', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setOk(true)
      await onSaved()
    } catch (e) { setErr(String(e)) } finally { setSaving(false) }
  }

  return (
    <form onSubmit={save} className="bg-white rounded-card border border-gray-100 shadow-card p-6 space-y-4">
      <h2 className="text-xl text-kerala-700 flex items-center gap-2">
        Doctor profile
        {doctor.ccimVerified
          ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-kerala-700 bg-kerala-50 px-2 py-1 rounded-full"><ShieldCheck className="w-3 h-3" /> CCIM Verified</span>
          : <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">Awaiting CCIM verification</span>}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Display name"><input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" /></Field>
        <Field label="Specialization"><input value={d.specialization} onChange={(e) => setD({ ...d, specialization: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" /></Field>
        <Field label="District"><input value={d.district} onChange={(e) => setD({ ...d, district: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" /></Field>
        <Field label="Qualification"><input value={d.qualification} onChange={(e) => setD({ ...d, qualification: e.target.value })} placeholder="BAMS, MD (Panchakarma)" className="w-full border rounded-md px-3 py-2 text-sm" /></Field>
        <Field label="Experience (years)"><input type="number" min={0} value={d.experienceYears} onChange={(e) => setD({ ...d, experienceYears: Number(e.target.value) })} className="w-full border rounded-md px-3 py-2 text-sm" /></Field>
        <Field label="Consultation fee (₹)"><input type="number" min={0} value={d.consultationFee} onChange={(e) => setD({ ...d, consultationFee: Number(e.target.value) })} className="w-full border rounded-md px-3 py-2 text-sm" /></Field>
        <Field label="Languages (comma-separated)" full><input value={d.languages} onChange={(e) => setD({ ...d, languages: e.target.value })} placeholder="Malayalam, English, Hindi" className="w-full border rounded-md px-3 py-2 text-sm" /></Field>
        <Field label="Profile photo" full>
          <ImageUpload value={d.photoUrl || null} onChange={(url) => setD({ ...d, photoUrl: url ?? '' })} bucket="profile" shape="square" />
        </Field>
        <Field label="Short profile (1–2 lines)" full><input value={d.profile} onChange={(e) => setD({ ...d, profile: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" /></Field>
        <Field label="Detailed bio" full><textarea value={d.bio} onChange={(e) => setD({ ...d, bio: e.target.value })} rows={4} className="w-full border rounded-md px-3 py-2 text-sm" /></Field>
      </div>

      <div>
        <span className="block text-xs font-medium text-gray-700 mb-2">Available days</span>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <button type="button" key={day} onClick={() => toggleDay(day)}
              className={d.availableDays.has(day) ? 'px-3 py-1.5 text-sm rounded-full bg-kerala-700 text-white' : 'px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-700'}>
              {day}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={d.availableForOnline} onChange={(e) => setD({ ...d, availableForOnline: e.target.checked })} />
        Available for online consultations
      </label>

      {err && <p className="text-sm text-red-600">{err}</p>}
      {ok  && <p className="text-sm text-kerala-700">Doctor profile saved ✓</p>}

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={saving} className="px-5 py-2 bg-kerala-600 text-white rounded-md font-semibold hover:bg-kerala-700 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save doctor profile'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, full = false, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={full ? 'md:col-span-2 block' : 'block'}>
      <span className="block text-xs font-medium text-gray-700 mb-1.5">{label}</span>
      {children}
    </label>
  )
}

function HospitalEditForm({ hospital, onSaved }: { hospital: HospitalOwned; onSaved: () => void | Promise<void> }) {
  const [h, setH] = useState({
    name: hospital.name,
    type: hospital.type,
    district: hospital.district,
    establishedYear: hospital.establishedYear ?? 0,
    services: (hospital.services ?? []).join(', '),
    profile: hospital.profile ?? '',
    contact: hospital.contact ?? '',
    address: hospital.address ?? '',
    ayushCertified: hospital.ayushCertified,
    panchakarma: hospital.panchakarma,
    nabh: hospital.nabh,
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr(null); setOk(false)
    try {
      const body = {
        name: h.name, type: h.type, district: h.district,
        establishedYear: Number(h.establishedYear) || null,
        services: h.services.split(',').map((s) => s.trim()).filter(Boolean),
        profile: h.profile, contact: h.contact, address: h.address,
        ayushCertified: h.ayushCertified, panchakarma: h.panchakarma, nabh: h.nabh,
      }
      const res = await fetch('/api/me/hospital', {
        method: 'PATCH', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setOk(true)
      await onSaved()
    } catch (e) { setErr(String(e)) } finally { setSaving(false) }
  }

  return (
    <form onSubmit={save} className="bg-white rounded-card border border-gray-100 shadow-card p-6 space-y-4">
      <h2 className="text-xl text-kerala-700 flex items-center gap-2">
        Hospital profile
        {hospital.ccimVerified
          ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-kerala-700 bg-kerala-50 px-2 py-1 rounded-full"><ShieldCheck className="w-3 h-3" /> Verified</span>
          : <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">Awaiting verification</span>}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Hospital / centre name"><input value={h.name} onChange={(e) => setH({ ...h, name: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" /></Field>
        <Field label="Type">
          <select value={h.type} onChange={(e) => setH({ ...h, type: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
            {['hospital', 'panchakarma', 'wellness', 'clinic'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="District"><input value={h.district} onChange={(e) => setH({ ...h, district: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" /></Field>
        <Field label="Established year"><input type="number" min={1800} max={2030} value={h.establishedYear} onChange={(e) => setH({ ...h, establishedYear: Number(e.target.value) })} className="w-full border rounded-md px-3 py-2 text-sm" /></Field>
        <Field label="Phone"><input value={h.contact} onChange={(e) => setH({ ...h, contact: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" /></Field>
        <Field label="Address"><input value={h.address} onChange={(e) => setH({ ...h, address: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" /></Field>
        <Field label="Services (comma-separated)" full><input value={h.services} onChange={(e) => setH({ ...h, services: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" /></Field>
        <Field label="Public profile / tagline" full><textarea value={h.profile} onChange={(e) => setH({ ...h, profile: e.target.value })} rows={3} className="w-full border rounded-md px-3 py-2 text-sm" /></Field>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <label className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm cursor-pointer hover:bg-gray-50">
          <input type="checkbox" checked={h.ayushCertified} onChange={(e) => setH({ ...h, ayushCertified: e.target.checked })} /> AYUSH
        </label>
        <label className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm cursor-pointer hover:bg-gray-50">
          <input type="checkbox" checked={h.panchakarma} onChange={(e) => setH({ ...h, panchakarma: e.target.checked })} /> Panchakarma
        </label>
        <label className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm cursor-pointer hover:bg-gray-50">
          <input type="checkbox" checked={h.nabh} onChange={(e) => setH({ ...h, nabh: e.target.checked })} /> NABH
        </label>
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}
      {ok  && <p className="text-sm text-kerala-700">Hospital profile saved ✓</p>}

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={saving} className="px-5 py-2 bg-kerala-600 text-white rounded-md font-semibold hover:bg-kerala-700 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save hospital profile'}
        </button>
      </div>
    </form>
  )
}
