'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { signUp } from '../../../../lib/auth-client'

const TYPES = [
  { v: 'hospital', l: 'Hospital' },
  { v: 'clinic', l: 'Clinic' },
  { v: 'wellness_centre', l: 'Wellness Centre' },
  { v: 'resort', l: 'Resort' },
  { v: 'pharma', l: 'Pharma' },
  { v: 'recruiter', l: 'Recruiter' },
  { v: 'telemedicine', l: 'Telemedicine' },
  { v: 'college', l: 'College' },
  { v: 'corporate', l: 'Corporate Wellness' },
  { v: 'government', l: 'Govt / AYUSH' },
]

export function EmployerRegisterClient() {
  const router = useRouter()
  const [form, setForm] = useState({
    companyName: '', companyType: 'hospital', country: 'IN', city: '', state: '',
    website: '', email: '', phone: '', whatsapp: '', description: '',
    adminName: '', adminEmail: '', adminPassword: '',
  })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  function set<K extends keyof typeof form>(k: K, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      const sr = await signUp.email({ name: form.adminName || form.companyName, email: form.adminEmail, password: form.adminPassword })
      const sErr = (sr as { error?: { message?: string } }).error
      if (sErr) throw new Error(sErr.message ?? 'Signup failed')
      const r = await fetch('/api/jobs-portal/employers/register', {
        method: 'POST', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      router.push('/jobs/employers/dashboard?welcome=1')
      router.refresh()
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} className="bg-white border border-gray-100 rounded-card shadow-card p-6 space-y-3">
      <h2 className="font-serif text-xl text-ink">Company info</h2>
      <L l="Company name *"><input required className="input" value={form.companyName} onChange={(e) => set('companyName', e.target.value)} /></L>
      <div className="grid grid-cols-2 gap-3">
        <L l="Company type *">
          <select required className="input" value={form.companyType} onChange={(e) => set('companyType', e.target.value)}>
            {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
          </select>
        </L>
        <L l="Country (ISO-2)"><input className="input" maxLength={2} value={form.country} onChange={(e) => set('country', e.target.value.toUpperCase())} /></L>
        <L l="City"><input className="input" value={form.city} onChange={(e) => set('city', e.target.value)} /></L>
        <L l="State"><input className="input" value={form.state} onChange={(e) => set('state', e.target.value)} /></L>
      </div>
      <L l="Description"><textarea rows={3} className="input" value={form.description} onChange={(e) => set('description', e.target.value)} /></L>

      <h2 className="font-serif text-xl text-ink pt-3 border-t">Contact</h2>
      <div className="grid grid-cols-2 gap-3">
        <L l="Phone"><input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></L>
        <L l="WhatsApp"><input className="input" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} /></L>
        <L l="Email"><input type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} /></L>
        <L l="Website"><input className="input" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://" /></L>
      </div>

      <h2 className="font-serif text-xl text-ink pt-3 border-t">Admin user</h2>
      <div className="grid grid-cols-2 gap-3">
        <L l="Your name *"><input required className="input" value={form.adminName} onChange={(e) => set('adminName', e.target.value)} /></L>
        <L l="Your email *"><input required type="email" className="input" value={form.adminEmail} onChange={(e) => set('adminEmail', e.target.value)} /></L>
        <L l="Password (min 8) *" full><input required type="password" minLength={8} className="input" value={form.adminPassword} onChange={(e) => set('adminPassword', e.target.value)} /></L>
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}
      <button type="submit" disabled={busy} className="w-full inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold disabled:opacity-50">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        {busy ? 'Creating…' : 'Register employer'}
      </button>
      <style jsx global>{`.input{width:100%;border:1px solid #e5e7eb;border-radius:0.375rem;padding:0.5rem 0.75rem;font-size:14px;background:white}.input:focus{outline:none;box-shadow:0 0 0 1px #155228;border-color:#155228}`}</style>
    </form>
  )
}

function L({ l, full = false, children }: { l: string; full?: boolean; children: React.ReactNode }) {
  return <label className={'block ' + (full ? 'col-span-2' : '')}><span className="block text-xs font-medium text-gray-700 mb-1">{l}</span>{children}</label>
}
