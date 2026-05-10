'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, AlertTriangle } from 'lucide-react'

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
    ownedDoctor: {
      id: string; name: string; specialization: string; district: string;
      qualification: string | null; experienceYears: number | null;
      ccimVerified: boolean; consultationFee: number | null;
    } | null
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

  const isDoctor = me.role === 'DOCTOR' || me.doctorId != null

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

      {isDoctor && me.ownedDoctor && (
        <section className="bg-white rounded-card border border-gray-100 shadow-card p-6">
          <h2 className="text-xl text-kerala-700 mb-3 flex items-center gap-2">
            Your doctor profile {me.ownedDoctor.ccimVerified && <span className="inline-flex items-center gap-1 text-xs font-semibold text-kerala-700 bg-kerala-50 px-2 py-1 rounded-full"><ShieldCheck className="w-3 h-3" /> CCIM</span>}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong className="text-ink">Name:</strong> {me.ownedDoctor.name}</div>
            <div><strong className="text-ink">Specialization:</strong> {me.ownedDoctor.specialization}</div>
            <div><strong className="text-ink">District:</strong> {me.ownedDoctor.district}</div>
            <div><strong className="text-ink">Qualification:</strong> {me.ownedDoctor.qualification ?? '—'}</div>
            <div><strong className="text-ink">Experience:</strong> {me.ownedDoctor.experienceYears != null ? `${me.ownedDoctor.experienceYears} yrs` : '—'}</div>
            <div><strong className="text-ink">Consultation fee:</strong> {me.ownedDoctor.consultationFee ? `₹${me.ownedDoctor.consultationFee}` : '—'}</div>
          </div>
          <p className="text-xs text-muted mt-4">
            To edit doctor details, go to the <Link href="/admin/doctors" className="text-kerala-700 hover:underline">Admin Doctors</Link> page (admin role required) — or ask an admin to update on your behalf. A self-edit page will be added in a future update.
          </p>
        </section>
      )}
    </div>
  )
}
