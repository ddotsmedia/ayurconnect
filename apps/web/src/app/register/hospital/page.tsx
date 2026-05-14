'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, ShieldCheck } from 'lucide-react'
import { signUpUser, postJson, HOSPITAL_TYPES } from '../_lib'
import { CountrySelect } from '../../../components/country-select'
import { StateSelect } from '../../../components/state-select'
import { PhoneInput } from '../../../components/phone-input'
import { detectCountry, rememberCountry } from '../../../lib/detect-country'

export default function HospitalRegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    contactName: '', email: '', password: '',
    hospitalName: '', type: 'hospital',
    country: 'IN', state: '', district: '',
    establishedYear: '', services: '', contact: '', address: '',
    ayushCertified: false, panchakarma: false, nabh: false,
  })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    setForm((f) => ({ ...f, country: detectCountry() }))
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      await signUpUser({ name: form.contactName, email: form.email, password: form.password })
      await postJson('/me/promote-to-hospital', {
        name: form.hospitalName,
        type: form.type,
        country: form.country,
        state: form.state || null,
        district: form.district,
        establishedYear: form.establishedYear ? Number(form.establishedYear) : null,
        services: form.services.split(',').map((s) => s.trim()).filter(Boolean),
        contact: form.contact || null,
        address: form.address || null,
        ayushCertified: form.ayushCertified,
        panchakarma:    form.panchakarma,
        nabh:           form.nabh,
      })
      rememberCountry(form.country)
      router.push('/dashboard?welcome=hospital')
      router.refresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen bg-cream py-8 sm:py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link href="/register" className="inline-block py-1 text-sm text-gray-500 hover:underline">← all roles</Link>
        <header className="mt-2 sm:mt-3 text-center mb-5 sm:mb-6">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-700 ring-4 ring-blue-100">
            <Building2 className="w-6 h-6" />
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-kerala-700 mt-3">Register a Hospital / Centre</h1>
          <p className="text-sm text-muted mt-1 px-2">For hospitals, Panchakarma resorts, wellness centres, and clinics.</p>
        </header>

        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 sm:mb-5 text-xs sm:text-sm text-amber-900 flex gap-2">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            Listing starts in <strong>pending</strong> state. An admin verifies AYUSH/CCIM credentials before it appears in the public hospital directory. You can edit details any time.
          </div>
        </div>

        <form onSubmit={submit} className="bg-white rounded-card border border-gray-100 shadow-card p-4 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Account (admin contact)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label="Your full name"><input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} required className="input" /></Field>
            <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" className="input" /></Field>
            <Field label="Password (min 8)"><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} autoComplete="new-password" className="input" /></Field>
            <Field label="Phone / WhatsApp">
              <PhoneInput value={form.contact} onChange={(e164) => setForm({ ...form, contact: e164 })} defaultCountry={form.country} />
            </Field>
          </div>

          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider pt-3 border-t">Hospital details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label="Hospital / centre name">
              <input value={form.hospitalName} onChange={(e) => setForm({ ...form, hospitalName: e.target.value })} required className="input" />
            </Field>
            <Field label="Type">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required className="input">
                {HOSPITAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Country">
              <CountrySelect value={form.country} onChange={(c) => setForm({ ...form, country: c, state: '' })} />
            </Field>
            <Field label="State / region">
              <StateSelect country={form.country} value={form.state} onChange={(s) => setForm({ ...form, state: s })} />
            </Field>
            <Field label="City / district *">
              <input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required placeholder="e.g. Ernakulam, Mumbai, Dubai" className="input" />
            </Field>
            <Field label="Established year">
              <input type="number" min={1800} max={2030} value={form.establishedYear} onChange={(e) => setForm({ ...form, establishedYear: e.target.value })} className="input" />
            </Field>
            <Field label="Address" full>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" />
            </Field>
            <Field label="Services offered (comma-separated)" full>
              <input value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} className="input" placeholder="Panchakarma, Kayachikitsa, Yoga, In-patient Care" />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Toggle label="AYUSH certified" v={form.ayushCertified} onChange={(b) => setForm({ ...form, ayushCertified: b })} />
            <Toggle label="Panchakarma facility" v={form.panchakarma} onChange={(b) => setForm({ ...form, panchakarma: b })} />
            <Toggle label="NABH accredited" v={form.nabh} onChange={(b) => setForm({ ...form, nabh: b })} />
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button type="submit" disabled={busy} className="w-full py-3 sm:py-2.5 bg-kerala-600 text-white rounded-md font-semibold hover:bg-kerala-700 disabled:opacity-50 text-base">
            {busy ? 'Creating account + listing…' : 'Register hospital'}
          </button>
          <p className="text-xs text-center text-gray-500">
            Already registered? <Link href="/sign-in" className="text-kerala-700 hover:underline">Sign in</Link>
          </p>
        </form>

        <Style />
      </div>
    </div>
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

function Toggle({ label, v, onChange }: { label: string; v: boolean; onChange: (b: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm cursor-pointer hover:bg-gray-50">
      <input type="checkbox" checked={v} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

function Style() {
  return (
    <style jsx global>{`
      /* Mobile uses 16px to suppress iOS Safari auto-zoom on focus; desktop reverts to 14px. */
      .input { width:100%; border:1px solid #e5e7eb; border-radius:0.375rem; padding:0.625rem 0.75rem; font-size:16px; background:white; }
      .input:focus { outline:none; box-shadow:0 0 0 1px #1b5e20; border-color:#1b5e20; }
      @media (min-width: 640px) {
        .input { padding:0.5rem 0.75rem; font-size:0.875rem; }
      }
    `}</style>
  )
}
