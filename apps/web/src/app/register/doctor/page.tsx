'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Stethoscope, ShieldCheck } from 'lucide-react'
import { signUpUser, postJson, SPECIALIZATIONS } from '../_lib'
import { CountrySelect } from '../../../components/country-select'
import { StateSelect } from '../../../components/state-select'
import { PhoneInput } from '../../../components/phone-input'
import { detectCountry, rememberCountry } from '../../../lib/detect-country'

export default function DoctorRegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    qualification: '', specialization: '',
    country: 'IN', state: '', district: '',
    experienceYears: '', contact: '', languages: 'Malayalam, English',
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
      await signUpUser({ name: form.name, email: form.email, password: form.password })
      await postJson('/me/promote-to-doctor', {
        name: form.name,
        specialization: form.specialization || null,
        country: form.country,
        state: form.state || null,
        district: form.district,
        qualification: form.qualification || null,
        experienceYears: form.experienceYears ? Number(form.experienceYears) : null,
        contact: form.contact || null,
        languages: form.languages.split(',').map((s) => s.trim()).filter(Boolean),
      })
      rememberCountry(form.country)
      router.push('/dashboard?welcome=doctor')
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
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-amber-700 ring-4 ring-amber-100">
            <Stethoscope className="w-6 h-6" />
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-kerala-700 mt-3">Sign up — Doctor</h1>
          <p className="text-sm text-muted mt-1 px-2">Get a public profile after CCIM verification.</p>
        </header>

        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 sm:mb-5 text-xs sm:text-sm text-amber-900 flex gap-2">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            Your profile starts in <strong>pending</strong> state. An admin cross-checks the details against the CCIM register before it goes live in the public directory. You can edit fields any time from your dashboard.
          </div>
        </div>

        <form onSubmit={submit} className="bg-white rounded-card border border-gray-100 shadow-card p-4 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Account</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label="Full name (Dr. ...)"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input" placeholder="Dr. Anjali Menon" /></Field>
            <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" className="input" /></Field>
            <Field label="Password (min 8)"><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} autoComplete="new-password" className="input" /></Field>
            <Field label="Phone / WhatsApp">
              <PhoneInput value={form.contact} onChange={(e164) => setForm({ ...form, contact: e164 })} defaultCountry={form.country} />
            </Field>
          </div>

          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider pt-3 border-t">Practice</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label="Qualification">
              <input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} required className="input" placeholder="BAMS, MD (Panchakarma)" />
            </Field>
            <Field label="Specialization (optional)">
              <select value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="input">
                <option value="">Not sure yet / General Ayurveda</option>
                {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="block text-[11px] text-gray-500 mt-1">You can change this any time from your dashboard.</span>
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
            <Field label="Experience (years)">
              <input type="number" min={0} value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} className="input" />
            </Field>
            <Field label="Languages (comma-separated)">
              <input value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} className="input" />
            </Field>
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button type="submit" disabled={busy} className="w-full py-3 sm:py-2.5 bg-kerala-600 text-white rounded-md font-semibold hover:bg-kerala-700 disabled:opacity-50 text-base">
            {busy ? 'Creating account + profile…' : 'Create doctor account'}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-700 mb-1.5">{label}</span>
      {children}
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
