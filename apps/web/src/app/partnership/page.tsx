'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { Building2, Users, Globe2, GraduationCap, Handshake, CheckCircle2, ChevronRight } from 'lucide-react'
import { CountrySelect } from '../../components/country-select'
import { PhoneInput } from '../../components/phone-input'
import { detectCountry } from '../../lib/detect-country'

const TYPES = [
  { value: 'hospital',          label: 'Hospital / chain partnership',     icon: Building2,    desc: 'Multi-location group, AYUSH-graded centre, NABH-accredited hospital — list with us, sponsor verification, or co-create patient pathways.' },
  { value: 'gulf-clinic',       label: 'Gulf / international clinic',      icon: Globe2,       desc: 'GCC, UK, US, Canada, AUS — refer your diaspora patients to vetted Kerala centres; we handle the verification + concierge.' },
  { value: 'travel-agency',     label: 'Travel agency / DMC',              icon: Handshake,    desc: 'Kerala medical-tourism DMC / inbound operator looking to package verified Ayurveda into wellness itineraries.' },
  { value: 'corporate-wellness', label: 'Corporate wellness',              icon: Users,        desc: 'Employer / HR — Ayurvedic preventive programmes for executive teams, burnout management, group retreats.' },
  { value: 'college',           label: 'Ayurveda college / institute',     icon: GraduationCap, desc: 'BAMS / MD institutions — placement collaboration, CME content, alumni directory partnership.' },
  { value: 'franchise',         label: 'Franchise / new centre',           icon: Building2,    desc: 'Opening a new Ayurveda centre and want to leverage AyurConnect verification + booking infrastructure.' },
  { value: 'other',             label: 'Other partnership',                icon: Handshake,    desc: 'Something we haven\'t listed — tell us in the message.' },
]

export default function PartnershipPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', country: 'IN',
    organisation: '', role: '',
    type: 'hospital',
    message: '',
  })
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => { setForm((f) => ({ ...f, country: detectCountry() })) }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: form.type === 'franchise' ? 'franchise' : 'partnership',
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          country: form.country,
          subject: `${TYPES.find((t) => t.value === form.type)?.label} — ${form.organisation}`,
          message: form.message,
          meta: { type: form.type, organisation: form.organisation, role: form.role },
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `request failed (${res.status})`)
      }
      setSent(true)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally { setBusy(false) }
  }

  return (
    <>
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-5">
            <Handshake className="w-3 h-3" /> Partner with AyurConnect
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Build with <span className="text-gold-400">Kerala&apos;s</span> verified network
          </h1>
          <p className="mt-5 text-lg text-white/80">
            Hospitals, Gulf clinics, DMCs, corporate-wellness teams, colleges, franchises — we partner
            with organisations that share our standard for verification and patient care.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-14 max-w-5xl">
        <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-6 text-center">Partnership types</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TYPES.filter((t) => t.value !== 'other').map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => { setForm({ ...form, type: t.value }); document.getElementById('partnership-form')?.scrollIntoView({ behavior: 'smooth' }) }}
              className={`text-left p-5 bg-white rounded-card border-2 transition-all ${
                form.type === t.value ? 'border-kerala-600 shadow-cardLg' : 'border-gray-100 hover:border-kerala-300'
              }`}
            >
              <t.icon className="w-6 h-6 text-kerala-700 mb-3" />
              <h3 className="font-serif text-lg text-kerala-700">{t.label}</h3>
              <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{t.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <section id="partnership-form" className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-2xl">
          {sent ? (
            <div className="text-center bg-white rounded-card border border-kerala-100 shadow-card p-10">
              <CheckCircle2 className="w-16 h-16 text-kerala-600 mx-auto mb-4" />
              <h2 className="font-serif text-2xl text-kerala-700">Enquiry received</h2>
              <p className="text-gray-700 mt-3 leading-relaxed">
                A partnership team member will reach out on <strong>{form.email}</strong> within 2–3
                business days to schedule a discovery call.
              </p>
              <Link href="/" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-600 hover:bg-kerala-700 text-white rounded-md font-semibold">
                Back to home <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-2 text-center">Tell us about your organisation</h2>
              <p className="text-center text-gray-600 mb-6">We respond to every serious partnership enquiry within 2–3 business days.</p>
              <form onSubmit={submit} className="bg-white rounded-card border border-gray-100 shadow-card p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Partnership type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white">
                    {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Your name</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Role / title</label>
                    <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" placeholder="CEO, Director, Founder…" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Organisation</label>
                    <input value={form.organisation} onChange={(e) => setForm({ ...form, organisation: e.target.value })} required className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" placeholder="Hospital / clinic / company name" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Work email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Country</label>
                    <CountrySelect value={form.country} onChange={(c) => setForm({ ...form, country: c })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone (with country code)</label>
                    <PhoneInput value={form.phone} onChange={(e164) => setForm({ ...form, phone: e164 })} defaultCountry={form.country} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Tell us more</label>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5} minLength={30} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" placeholder="What are you looking to achieve? Patient volume, geographies, timeline, existing partnerships…" />
                </div>
                {err && <p className="text-sm text-red-600">{err}</p>}
                <button type="submit" disabled={busy} className="w-full py-2.5 bg-kerala-600 hover:bg-kerala-700 disabled:opacity-50 text-white rounded-md font-semibold">
                  {busy ? 'Sending…' : 'Send partnership enquiry'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </>
  )
}
