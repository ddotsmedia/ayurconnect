'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, MessageCircle } from 'lucide-react'

const DIAL_CODES = [
  { code: '+971', label: '🇦🇪 UAE'    },
  { code: '+91',  label: '🇮🇳 India'  },
  { code: '+966', label: '🇸🇦 Saudi'  },
  { code: '+974', label: '🇶🇦 Qatar'  },
  { code: '+968', label: '🇴🇲 Oman'   },
  { code: '+965', label: '🇰🇼 Kuwait' },
  { code: '+973', label: '🇧🇭 Bahrain'},
  { code: '+44',  label: '🇬🇧 UK'     },
  { code: '+1',   label: '🇺🇸 US/CA'  },
  { code: '+61',  label: '🇦🇺 AU'     },
  { code: '+65',  label: '🇸🇬 SG'     },
  { code: '+',    label: 'Other'      },
]

const LANGS = ['Malayalam', 'English', 'Hindi', 'Arabic', 'Tamil', 'Other']
const TIMES = ['Morning', 'Afternoon', 'Evening', 'Any']

export function ConsultationRequestForm() {
  const [dial, setDial]      = useState('+971')
  const [name, setName]      = useState('')
  const [phone, setPhone]    = useState('')
  const [email, setEmail]    = useState('')
  const [concern, setConcern] = useState('')
  const [lang, setLang]      = useState('Malayalam')
  const [time, setTime]      = useState('Any')
  const [busy, setBusy]      = useState(false)
  const [ok, setOk]          = useState(false)
  const [err, setErr]        = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setBusy(true)
    try {
      const fullPhone = dial === '+' ? phone : `${dial} ${phone}`.trim()
      const r = await fetch('/api/consultation/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name, phone: fullPhone, email: email || undefined,
          concern, preferredLanguage: lang, preferredTime: time,
          country: dial === '+971' ? 'AE' : dial === '+91' ? 'IN' : undefined,
        }),
      })
      if (r.status === 429) throw new Error('You have submitted several requests already — please wait a bit and try again.')
      if (!r.ok) {
        const j = await r.json().catch(() => ({})) as { error?: string }
        throw new Error(j.error ?? `Submission failed (${r.status})`)
      }
      setOk(true)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  if (ok) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-card p-6 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
        <h3 className="font-serif text-xl text-emerald-900">Request received</h3>
        <p className="text-sm text-emerald-800 mt-2">
          We&apos;ll WhatsApp you within a few hours (IST 9 AM – 9 PM business hours) to match you with a verified Ayurveda doctor.
        </p>
        <p className="text-xs text-emerald-700/80 mt-3">
          In a rush? Message our concierge directly:{' '}
          <a className="underline font-semibold" href="https://wa.me/971554485169" target="_blank" rel="noopener noreferrer">
            +971 55 448 5169
          </a>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="bg-white border border-gray-100 rounded-card shadow-card p-5 md:p-6 space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Your name *</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-kerala-600" placeholder="e.g. Reshma Nair" />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp number *</label>
        <div className="flex gap-2">
          <select value={dial} onChange={(e) => setDial(e.target.value)} className="border border-gray-200 rounded-md px-2 py-2 text-sm bg-white focus:outline-none focus:border-kerala-600">
            {DIAL_CODES.map((c) => <option key={c.code + c.label} value={c.code}>{c.label} {c.code}</option>)}
          </select>
          <input required inputMode="tel" pattern="[0-9 ]{6,}" value={phone} onChange={(e) => setPhone(e.target.value)} className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-kerala-600" placeholder="55 123 4567" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Email (optional)</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-kerala-600" placeholder="you@example.com" />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">What can we help with? *</label>
        <textarea required rows={3} value={concern} onChange={(e) => setConcern(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-kerala-600" placeholder="e.g. Chronic knee pain for 6 months, prefer Panchakarma; or PCOS follow-up in Malayalam." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Preferred language *</label>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:border-kerala-600">
            {LANGS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Preferred time</label>
          <div className="flex flex-wrap gap-1.5">
            {TIMES.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setTime(t)}
                className={`px-3 py-1.5 rounded-full text-xs border ${time === t ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-300'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {err && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-2">{err}</p>}

      <button type="submit" disabled={busy} className="w-full inline-flex justify-center items-center gap-2 px-5 py-3 bg-kerala-700 hover:bg-kerala-800 text-white rounded-md text-sm font-semibold disabled:opacity-50">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
        {busy ? 'Sending…' : 'Request a callback'}
      </button>

      <p className="text-[11px] text-gray-500 text-center">
        No spam. We use your number only to match you with a doctor. Read our <a href="/privacy" className="underline">privacy policy</a>.
      </p>
    </form>
  )
}
