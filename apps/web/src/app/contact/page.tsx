'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { Mail, MessageCircle, CheckCircle2, ChevronRight, Phone } from 'lucide-react'
import { CountrySelect } from '../../components/country-select'
import { PhoneInput } from '../../components/phone-input'
import { detectCountry } from '../../lib/detect-country'

const TOPICS = [
  { value: 'general',      label: 'General question' },
  { value: 'list-doctor',  label: 'List my doctor profile' },
  { value: 'list-clinic',  label: 'List my hospital / clinic' },
  { value: 'tourism',      label: 'Medical tourism enquiry' },
  { value: 'press',        label: 'Press / media' },
  { value: 'partnership',  label: 'Partnership (see /partnership)' },
  { value: 'report',       label: 'Report inaccuracy / bad practitioner' },
  { value: 'other',        label: 'Something else' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', country: 'IN', topic: 'general', message: '' })
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
          kind: 'contact',
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          country: form.country,
          subject: TOPICS.find((t) => t.value === form.topic)?.label ?? form.topic,
          message: form.message,
          meta: { topic: form.topic },
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
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">
            Contact <span className="text-gold-400">AyurConnect</span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-white/80">
            Listings, press, feedback, partnership, reporting a bad practitioner — we read every message.
            Typical reply: 1–2 business days.
          </p>
        </div>
      </GradientHero>

      {/* Direct contact channels — visible above the form so users with simple
          enquiries don't have to scroll/fill the form. */}
      <section className="container mx-auto px-4 pt-10 max-w-3xl">
        <div className="grid sm:grid-cols-2 gap-3">
          <a
            href="tel:+971509379212"
            className="flex items-center gap-3 p-4 bg-white rounded-card border border-gray-100 hover:border-kerala-300 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-kerala-50 text-kerala-700 flex items-center justify-center flex-shrink-0 group-hover:bg-kerala-100">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-gold-600 font-semibold">Call us</div>
              <div className="text-base font-semibold text-ink mt-0.5 tabular-nums">+971 50 937 9212</div>
            </div>
          </a>
          <a
            href="mailto:info@ayurconnect.com"
            className="flex items-center gap-3 p-4 bg-white rounded-card border border-gray-100 hover:border-kerala-300 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-kerala-50 text-kerala-700 flex items-center justify-center flex-shrink-0 group-hover:bg-kerala-100">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-gold-600 font-semibold">Email us</div>
              <div className="text-base font-semibold text-ink mt-0.5">info@ayurconnect.com</div>
            </div>
          </a>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 max-w-3xl">
        {sent ? (
          <div className="text-center bg-white rounded-card border border-kerala-100 shadow-card p-10">
            <CheckCircle2 className="w-16 h-16 text-kerala-600 mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-kerala-700">Message sent</h2>
            <p className="text-gray-700 mt-3 leading-relaxed">
              We&apos;ll get back to you on <strong>{form.email}</strong> within 1–2 business days. Reports of
              bad practitioners are reviewed within 24h.
            </p>
            <Link href="/" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-600 hover:bg-kerala-700 text-white rounded-md font-semibold">
              Back to home <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-white rounded-card border border-gray-100 shadow-card p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Full name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Country</label>
                <CountrySelect value={form.country} onChange={(c) => setForm({ ...form, country: c })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone (optional)</label>
                <PhoneInput value={form.phone} onChange={(e164) => setForm({ ...form, phone: e164 })} defaultCountry={form.country} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Topic</label>
              <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white">
                {TOPICS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Message</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={6} minLength={20} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" placeholder="Please share the details — name of the practitioner, the question, or what you&apos;d like to do…" />
            </div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button type="submit" disabled={busy} className="w-full py-2.5 bg-kerala-600 hover:bg-kerala-700 disabled:opacity-50 text-white rounded-md font-semibold">
              {busy ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}
      </section>

      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-serif text-2xl text-kerala-700 text-center mb-6">Faster routes</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-card border border-gray-100 flex items-start gap-3">
              <Mail className="w-5 h-5 text-kerala-700 mt-0.5" />
              <div>
                <h3 className="font-semibold text-ink">Looking for a doctor?</h3>
                <p className="text-sm text-gray-600 mt-1">Browse the CCIM-verified directory directly — filter by district, specialisation, fee.</p>
                <Link href="/doctors" className="inline-flex items-center gap-1 text-sm text-kerala-700 font-semibold mt-2 hover:underline">Browse doctors <ChevronRight className="w-3 h-3" /></Link>
              </div>
            </div>
            <div className="p-5 bg-white rounded-card border border-gray-100 flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-kerala-700 mt-0.5" />
              <div>
                <h3 className="font-semibold text-ink">Health question?</h3>
                <p className="text-sm text-gray-600 mt-1">AyurBot is our AI assistant for dosha, herb, and symptom questions. Floating widget bottom-right.</p>
                <Link href="/ayurbot" className="inline-flex items-center gap-1 text-sm text-kerala-700 font-semibold mt-2 hover:underline">Open AyurBot <ChevronRight className="w-3 h-3" /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
