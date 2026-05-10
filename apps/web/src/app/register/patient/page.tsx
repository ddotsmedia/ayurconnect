'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User } from 'lucide-react'
import { signUpUser } from '../_lib'

export default function PatientRegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      await signUpUser(form)
      router.push('/dashboard')
      router.refresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="container mx-auto px-4 max-w-md">
        <Link href="/register" className="text-sm text-gray-500 hover:underline">← all roles</Link>
        <header className="mt-3 text-center mb-6">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-kerala-50 text-kerala-700 ring-4 ring-kerala-100">
            <User className="w-6 h-6" />
          </span>
          <h1 className="font-serif text-3xl text-kerala-700 mt-3">Sign up — Patient</h1>
          <p className="text-sm text-muted mt-1">Free forever. Book consultations, save favourites, ask AyurBot.</p>
        </header>

        <form onSubmit={submit} className="bg-white rounded-card border border-gray-100 shadow-card p-6 space-y-4">
          <Field label="Full name">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input" />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" className="input" />
          </Field>
          <Field label="Password (min 8 characters)">
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} autoComplete="new-password" className="input" />
          </Field>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button type="submit" disabled={busy} className="w-full py-2 bg-kerala-600 text-white rounded-md font-semibold hover:bg-kerala-700 disabled:opacity-50">
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
      .input { width:100%; border:1px solid #e5e7eb; border-radius:0.375rem; padding:0.5rem 0.75rem; font-size:0.875rem; }
      .input:focus { outline:none; box-shadow:0 0 0 1px #1b5e20; border-color:#1b5e20; }
    `}</style>
  )
}
