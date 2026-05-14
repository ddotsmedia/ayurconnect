'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User } from 'lucide-react'
import { signUpUser, postJson } from '../_lib'
import { CountrySelect } from '../../../components/country-select'
import { StateSelect } from '../../../components/state-select'
import { PhoneInput } from '../../../components/phone-input'
import { detectCountry, rememberCountry } from '../../../lib/detect-country'

export default function PatientRegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    country: 'IN', state: '', phone: '',
  })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // Auto-detect country once on mount
  useEffect(() => {
    setForm((f) => ({ ...f, country: detectCountry() }))
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      await signUpUser({ name: form.name, email: form.email, password: form.password })
      // Save country/state/phone via PATCH /me — sign-up auto-signs-in so the cookie is set
      try {
        await postJson('/me', {})
      } catch { /* ignore — try/catch only because PATCH fails on empty body */ }
      try {
        await fetch('/api/me', {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            name:    form.name,
            country: form.country,
            state:   form.state || null,
            phone:   form.phone || null,
          }),
        })
      } catch { /* non-fatal */ }
      rememberCountry(form.country)
      router.push('/dashboard')
      router.refresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen bg-cream py-8 sm:py-16">
      <div className="container mx-auto px-4 max-w-md">
        <Link href="/register" className="inline-block py-1 text-sm text-gray-500 hover:underline">← all roles</Link>
        <header className="mt-2 sm:mt-3 text-center mb-5 sm:mb-6">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-kerala-50 text-kerala-700 ring-4 ring-kerala-100">
            <User className="w-6 h-6" />
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-kerala-700 mt-3">Sign up — Patient</h1>
          <p className="text-sm text-muted mt-1 px-2">Free forever. Book consultations, save favourites, ask AyurBot.</p>
        </header>

        <form onSubmit={submit} className="bg-white rounded-card border border-gray-100 shadow-card p-4 sm:p-6 space-y-4">
          <Field label="Full name">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input" />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" className="input" />
          </Field>
          <Field label="Password (min 8 characters)">
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} autoComplete="new-password" className="input" />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Country">
              <CountrySelect value={form.country} onChange={(c) => setForm({ ...form, country: c, state: '' })} />
            </Field>
            <Field label="State / region">
              <StateSelect country={form.country} value={form.state} onChange={(s) => setForm({ ...form, state: s })} />
            </Field>
          </div>

          <Field label="Phone (optional, for appointment reminders)">
            <PhoneInput value={form.phone} onChange={(e164) => setForm({ ...form, phone: e164 })} defaultCountry={form.country} />
          </Field>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button type="submit" disabled={busy} className="w-full py-3 sm:py-2.5 bg-kerala-600 text-white rounded-md font-semibold hover:bg-kerala-700 disabled:opacity-50 text-base">
            {busy ? 'Creating…' : 'Create patient account'}
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
