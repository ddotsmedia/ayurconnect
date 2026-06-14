'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, Plus, X } from 'lucide-react'
import { signUp } from '../../../lib/auth-client'
import {
  HOSPITAL_TYPES, KERALA_DISTRICTS, UAE_CITIES, SPECIALIZATIONS,
  TREATMENTS, FACILITIES, PAYMENT_METHODS, LANGUAGES, TOURISM_CLASS,
} from './_data'

type Form = {
  // a) info
  name: string; nameMl: string; type: string; establishedYear: string
  // b) location
  address: string; district: string; pincode: string; state: string; country: string
  latitude: string; longitude: string
  // c) contact
  phone: string; whatsapp: string; email: string; website: string
  // d-g) arrays
  services: string[]; treatments: string[]; facilities: string[]
  languages: string[]; paymentMethods: string[]
  // accreditation booleans
  ayushCertified: boolean; nabh: boolean; panchakarma: boolean
  tourismClass: string; iso: string
  // h-i) media + about
  photos: string[]; profile: string; profileMl: string
  // j) admin
  adminName: string; adminEmail: string; adminPhone: string; adminPassword: string; adminRole: string
}

const EMPTY: Form = {
  name: '', nameMl: '', type: 'hospital', establishedYear: '',
  address: '', district: '', pincode: '', state: 'Kerala', country: 'IN',
  latitude: '', longitude: '',
  phone: '', whatsapp: '', email: '', website: '',
  services: [], treatments: [], facilities: [],
  languages: ['English', 'Malayalam'], paymentMethods: ['Cash', 'Card'],
  ayushCertified: false, nabh: false, panchakarma: false,
  tourismClass: '', iso: '',
  photos: [], profile: '', profileMl: '',
  adminName: '', adminEmail: '', adminPhone: '', adminPassword: '', adminRole: 'Owner',
}

const STEPS = ['Hospital', 'Location', 'Contact', 'Specializations', 'Treatments', 'Facilities', 'Accreditation', 'Photos', 'About', 'Admin'] as const

export function RegisterClient() {
  const router = useRouter()
  const [form, setForm] = useState<Form>(EMPTY)
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [err,  setErr]  = useState<string | null>(null)
  const [newPhoto, setNewPhoto] = useState('')

  function set<K extends keyof Form>(k: K, v: Form[K]) { setForm((f) => ({ ...f, [k]: v })) }
  function toggle(field: 'services' | 'treatments' | 'facilities' | 'languages' | 'paymentMethods', v: string) {
    setForm((f) => ({ ...f, [field]: f[field].includes(v) ? f[field].filter((x) => x !== v) : [...f[field], v] }))
  }
  function valid(s: number): boolean {
    if (s === 0) return !!form.name.trim() && !!form.type
    if (s === 1) return !!form.address.trim() && !!form.district.trim() && !!form.country
    if (s === 2) return !!form.phone.trim() && !!form.email.trim() && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)
    if (s === 8) return form.profile.trim().length >= 200
    if (s === 9) return !!form.adminName.trim() && !!form.adminEmail.trim() && form.adminPassword.length >= 8
    return true
  }

  async function submit() {
    setBusy(true); setErr(null)
    try {
      const signResp = await signUp.email({
        name: form.adminName || form.email.split('@')[0],
        email: form.adminEmail,
        password: form.adminPassword,
      })
      const sErr = (signResp as { error?: { message?: string } }).error
      if (sErr) throw new Error(sErr.message ?? 'Could not create account')
      const res = await fetch('/api/me/promote-to-hospital', {
        method: 'POST', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          type: form.type,
          country: form.country,
          state:    form.state || null,
          district: form.district,
          establishedYear: form.establishedYear ? Number(form.establishedYear) : null,
          services: form.services,
          profile:  form.profile.trim(),
          contact:  form.phone || null,
          address:  form.address || null,
          ayushCertified: form.ayushCertified,
          panchakarma:    form.panchakarma,
          nabh:           form.nabh,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      // Patch the richer fields via hospital portal (after promote).
      await fetch('/api/hospital/profile', {
        method: 'PATCH', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          nameMl: form.nameMl || null,
          pincode: form.pincode || null,
          whatsapp: form.whatsapp || null,
          email: form.email || null,
          profileMl: form.profileMl || null,
          treatments: form.treatments,
          facilities: form.facilities,
          languages: form.languages,
          paymentMethods: form.paymentMethods,
          photos: form.photos,
          tourismClass: form.tourismClass || null,
          iso: form.iso || null,
          latitude:  form.latitude  ? Number(form.latitude)  : null,
          longitude: form.longitude ? Number(form.longitude) : null,
        }),
      })
      router.push('/hospital/dashboard?welcome=1')
      router.refresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally { setBusy(false) }
  }

  const districtOptions = form.country === 'IN' ? KERALA_DISTRICTS : form.country === 'AE' ? UAE_CITIES : []

  return (
    <div className="bg-white border border-gray-100 rounded-card shadow-card p-6">
      <ol className="flex gap-1 overflow-x-auto mb-6 text-[11px]">
        {STEPS.map((label, i) => (
          <li key={label} className={'flex-shrink-0 px-2.5 py-1 rounded ' + (i === step ? 'bg-kerala-700 text-white font-semibold' : i < step ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500')}>
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="space-y-3">
          <h2 className="font-serif text-xl text-ink">Hospital information</h2>
          <Field label="Hospital / Centre name *"><input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
          <Field label="Name (Malayalam)"><input className="input" value={form.nameMl} onChange={(e) => set('nameMl', e.target.value)} dir="auto" placeholder="ഉദാ. ആര്യ വൈദ്യ ശാല" /></Field>
          <Field label="Type *">
            <select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
              {HOSPITAL_TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
            </select>
          </Field>
          <Field label="Established year"><input type="number" min={1800} max={2030} className="input" value={form.establishedYear} onChange={(e) => set('establishedYear', e.target.value)} /></Field>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <h2 className="font-serif text-xl text-ink">Location</h2>
          <Field label="Address *"><input className="input" value={form.address} onChange={(e) => set('address', e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Country">
              <select className="input" value={form.country} onChange={(e) => set('country', e.target.value)}>
                <option value="IN">India</option><option value="AE">UAE</option>
                <option value="QA">Qatar</option><option value="OM">Oman</option><option value="KW">Kuwait</option><option value="BH">Bahrain</option><option value="SA">Saudi Arabia</option>
                <option value="GB">UK</option><option value="DE">Germany</option><option value="US">USA</option><option value="OTHER">Other</option>
              </select>
            </Field>
            <Field label="State"><input className="input" value={form.state} onChange={(e) => set('state', e.target.value)} /></Field>
          </div>
          <Field label="District / City *">
            {districtOptions.length > 0 ? (
              <select className="input" value={form.district} onChange={(e) => set('district', e.target.value)}>
                <option value="">— select —</option>{districtOptions.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            ) : (
              <input className="input" value={form.district} onChange={(e) => set('district', e.target.value)} placeholder="City / district name" />
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pincode"><input className="input" value={form.pincode} onChange={(e) => set('pincode', e.target.value)} /></Field>
            <Field label="ISO certifications"><input className="input" value={form.iso} onChange={(e) => set('iso', e.target.value)} placeholder="e.g. ISO 9001:2015" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude (optional)"><input className="input" type="number" step="0.000001" value={form.latitude} onChange={(e) => set('latitude', e.target.value)} placeholder="10.0269" /></Field>
            <Field label="Longitude (optional)"><input className="input" type="number" step="0.000001" value={form.longitude} onChange={(e) => set('longitude', e.target.value)} placeholder="76.3081" /></Field>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <h2 className="font-serif text-xl text-ink">Contact</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone *"><input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91…" /></Field>
            <Field label="WhatsApp"><input className="input" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="+91…" /></Field>
            <Field label="Email *"><input type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} /></Field>
            <Field label="Website"><input type="url" className="input" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://" /></Field>
          </div>
        </div>
      )}

      {step === 3 && (
        <ChipPicker title="Specializations" options={SPECIALIZATIONS} selected={form.services} onToggle={(v) => toggle('services', v)} />
      )}
      {step === 4 && (
        <ChipPicker title="Treatments offered" options={TREATMENTS} selected={form.treatments} onToggle={(v) => toggle('treatments', v)} />
      )}
      {step === 5 && (
        <ChipPicker title="Facilities" options={FACILITIES} selected={form.facilities} onToggle={(v) => toggle('facilities', v)} />
      )}

      {step === 6 && (
        <div className="space-y-3">
          <h2 className="font-serif text-xl text-ink">Accreditation</h2>
          <Tog label="AYUSH Certified"      v={form.ayushCertified} onChange={(b) => set('ayushCertified', b)} />
          <Tog label="NABH Accredited"      v={form.nabh}            onChange={(b) => set('nabh', b)} />
          <Tog label="Panchakarma facility" v={form.panchakarma}     onChange={(b) => set('panchakarma', b)} />
          <Field label="Tourism Classification (Kerala Tourism)">
            <select className="input" value={form.tourismClass} onChange={(e) => set('tourismClass', e.target.value)}>
              {TOURISM_CLASS.map((c) => <option key={c} value={c}>{c || '— none —'}</option>)}
            </select>
          </Field>
        </div>
      )}

      {step === 7 && (
        <div className="space-y-3">
          <h2 className="font-serif text-xl text-ink">Photos (up to 10 URLs)</h2>
          <p className="text-xs text-gray-500">Add image URLs from your website, social media, or any public image host. Cover photos appear in the directory.</p>
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="https://…/photo.jpg" value={newPhoto} onChange={(e) => setNewPhoto(e.target.value)} />
            <button type="button" disabled={!newPhoto.trim() || form.photos.length >= 10} onClick={() => { set('photos', [...form.photos, newPhoto.trim()]); setNewPhoto('') }} className="inline-flex items-center gap-1 px-3 py-2 bg-kerala-700 text-white rounded text-sm font-semibold disabled:opacity-50">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <ul className="space-y-1">
            {form.photos.map((p, i) => (
              <li key={i} className="flex items-center gap-2 text-xs bg-gray-50 border border-gray-100 rounded px-2 py-1.5">
                <span className="flex-1 truncate text-gray-700">{p}</span>
                <button onClick={() => set('photos', form.photos.filter((_, j) => j !== i))} className="text-red-600"><X className="w-4 h-4" /></button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {step === 8 && (
        <div className="space-y-3">
          <h2 className="font-serif text-xl text-ink">About your hospital</h2>
          <Field label="Description (English, 200+ chars) *">
            <textarea rows={6} className="input" value={form.profile} onChange={(e) => set('profile', e.target.value)} />
            <span className="block text-[11px] text-gray-500 mt-1">{form.profile.length} / 200+ chars</span>
          </Field>
          <Field label="Description (Malayalam)">
            <textarea rows={6} className="input" dir="auto" value={form.profileMl} onChange={(e) => set('profileMl', e.target.value)} placeholder="ഹോസ്പിറ്റലിനെപ്പറ്റി കൂടുതൽ വിവരങ്ങൾ…" />
          </Field>
          <ChipPicker title="Languages spoken" options={LANGUAGES} selected={form.languages} onToggle={(v) => toggle('languages', v)} />
          <ChipPicker title="Payment methods accepted" options={PAYMENT_METHODS} selected={form.paymentMethods} onToggle={(v) => toggle('paymentMethods', v)} />
        </div>
      )}

      {step === 9 && (
        <div className="space-y-3">
          <h2 className="font-serif text-xl text-ink">Admin user (creates your AyurConnect account)</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Your full name *"><input className="input" value={form.adminName} onChange={(e) => set('adminName', e.target.value)} /></Field>
            <Field label="Your role at the hospital">
              <select className="input" value={form.adminRole} onChange={(e) => set('adminRole', e.target.value)}>
                <option>Owner</option><option>Director</option><option>Manager</option><option>Doctor</option><option>Other</option>
              </select>
            </Field>
            <Field label="Email *"><input type="email" className="input" value={form.adminEmail} onChange={(e) => set('adminEmail', e.target.value)} /></Field>
            <Field label="Phone"><input className="input" value={form.adminPhone} onChange={(e) => set('adminPhone', e.target.value)} /></Field>
            <Field label="Password (min 8) *" full><input type="password" className="input" minLength={8} value={form.adminPassword} onChange={(e) => set('adminPassword', e.target.value)} /></Field>
          </div>
        </div>
      )}

      {err && <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded p-2">{err}</p>}

      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="inline-flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-40">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button disabled={!valid(step)} onClick={() => setStep(step + 1)} className="inline-flex items-center gap-1 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold disabled:opacity-50">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button disabled={!valid(step) || busy} onClick={submit} className="inline-flex items-center gap-1 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {busy ? 'Submitting…' : 'Submit registration'}
          </button>
        )}
      </div>

      <style jsx global>{`.input{width:100%;border:1px solid #e5e7eb;border-radius:0.375rem;padding:0.625rem 0.75rem;font-size:14px;background:white}.input:focus{outline:none;box-shadow:0 0 0 1px #155228;border-color:#155228}`}</style>
    </div>
  )
}

function Field({ label, full = false, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={(full ? 'col-span-2 ' : '') + 'block'}>
      <span className="block text-xs font-medium text-gray-700 mb-1.5">{label}</span>
      {children}
    </label>
  )
}

function Tog({ label, v, onChange }: { label: string; v: boolean; onChange: (b: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded text-sm cursor-pointer hover:bg-gray-50">
      <input type="checkbox" checked={v} onChange={(e) => onChange(e.target.checked)} />{label}
    </label>
  )
}

function ChipPicker({ title, options, selected, onToggle }: { title: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <h2 className="font-serif text-xl text-ink">{title}</h2>
      <p className="text-xs text-gray-500">Tap to select. <strong>{selected.length}</strong> selected.</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = selected.includes(o)
          return (
            <button key={o} type="button" onClick={() => onToggle(o)} className={'px-2.5 py-1 rounded-full text-xs border transition-colors ' + (on ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-300')}>
              {on && '✓ '}{o}
            </button>
          )
        })}
      </div>
    </div>
  )
}
