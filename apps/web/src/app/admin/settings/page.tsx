'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save, Facebook, Instagram, Youtube, Linkedin, MessageCircle, Send, Mail, Phone, MapPin, Sparkles } from 'lucide-react'

type SettingDef = {
  key: string
  label: string
  placeholder: string
  icon?: typeof Facebook
}

const GROUPS: Array<{ title: string; description: string; settings: SettingDef[] }> = [
  {
    title: 'Social media links',
    description: 'These appear in the site footer. Leave blank to hide a platform.',
    settings: [
      { key: 'social.facebook',  label: 'Facebook',  placeholder: 'https://www.facebook.com/ayurconnect',  icon: Facebook  },
      { key: 'social.instagram', label: 'Instagram', placeholder: 'https://www.instagram.com/ayurconnect', icon: Instagram },
      { key: 'social.youtube',   label: 'YouTube',   placeholder: 'https://www.youtube.com/@ayurconnect',  icon: Youtube   },
      { key: 'social.linkedin',  label: 'LinkedIn',  placeholder: 'https://www.linkedin.com/company/ayurconnect', icon: Linkedin },
      { key: 'social.twitter',   label: 'Twitter / X', placeholder: 'https://twitter.com/ayurconnect' },
      { key: 'social.whatsapp',  label: 'WhatsApp',  placeholder: 'https://wa.me/919447000000', icon: MessageCircle },
      { key: 'social.telegram',  label: 'Telegram',  placeholder: 'https://t.me/ayurconnect',   icon: Send },
    ],
  },
  {
    title: 'Contact details',
    description: 'Public contact info — appears in the footer and Contact pages.',
    settings: [
      { key: 'contact.email',   label: 'Email',   placeholder: 'hello@ayurconnect.com',     icon: Mail   },
      { key: 'contact.phone',   label: 'Phone',   placeholder: '+91-94470-00000',           icon: Phone  },
      { key: 'contact.address', label: 'Address', placeholder: 'Kochi, Kerala, India',      icon: MapPin },
    ],
  },
  {
    title: 'Brand text',
    description: 'Tagline and copyright shown around the site.',
    settings: [
      { key: 'brand.tagline',   label: 'Tagline',   placeholder: "Kerala's #1 Ayurveda Platform" },
      { key: 'brand.copyright', label: 'Copyright (optional)', placeholder: '© AyurConnect — leave blank to use default' },
    ],
  },
]

const ALL_KEYS = GROUPS.flatMap((g) => g.settings).map((s) => s.key)

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function load() {
    setLoading(true); setErrors({})
    try {
      const res = await fetch('/api/site-settings', { credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as Record<string, string>
      const filtered: Record<string, string> = {}
      for (const k of ALL_KEYS) filtered[k] = data[k] ?? ''
      setValues(filtered)
    } catch (e) {
      setErrors({ _global: e instanceof Error ? e.message : String(e) })
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setErrors({}); setSavedAt(null)
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ values }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const errMap: Record<string, string> = {}
        if (Array.isArray(json.errors)) for (const e of json.errors) errMap[e.key] = e.reason
        setErrors({ ...errMap, _global: json.error ?? `HTTP ${res.status}` })
        return
      }
      // Display per-key validation errors even on partial success
      if (Array.isArray(json.errors) && json.errors.length > 0) {
        const errMap: Record<string, string> = {}
        for (const e of json.errors) errMap[e.key] = e.reason
        setErrors(errMap)
      }
      setSavedAt(new Date().toLocaleTimeString())
    } catch (e) {
      setErrors({ _global: e instanceof Error ? e.message : String(e) })
    } finally { setSaving(false) }
  }

  if (loading) return <p className="text-gray-500">Loading…</p>

  return (
    <form onSubmit={save} className="space-y-8 max-w-2xl">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Site settings</h1>
        <p className="text-sm text-gray-500 mt-1">Edit publicly visible site config — social media links, contact info, brand text.</p>
      </header>

      {errors._global && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-sm text-red-800">{errors._global}</div>
      )}

      {GROUPS.map((g) => (
        <section key={g.title} className="bg-white rounded-md border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900">{g.title}</h2>
          <p className="text-xs text-gray-500 mt-0.5 mb-4">{g.description}</p>
          <div className="space-y-3">
            {g.settings.map((s) => {
              const Icon = s.icon
              return (
                <label key={s.key} className="block">
                  <span className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    {Icon ? <Icon className="w-3.5 h-3.5 text-gray-500" /> : null}
                    {s.label}
                  </span>
                  <input
                    type="text"
                    value={values[s.key] ?? ''}
                    onChange={(e) => setValues({ ...values, [s.key]: e.target.value })}
                    placeholder={s.placeholder}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                      errors[s.key] ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-green-700'
                    }`}
                  />
                  {errors[s.key] && <p className="text-[11px] text-red-600 mt-1">{errors[s.key]}</p>}
                </label>
              )
            })}
          </div>
        </section>
      ))}

      <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-cream/80 backdrop-blur py-3">
        {savedAt && <span className="text-xs text-green-700 inline-flex items-center gap-1"><Sparkles className="w-3 h-3" /> Saved at {savedAt} — changes are live within a minute (cache TTL).</span>}
        <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 px-5 py-2 bg-green-700 text-white rounded-md font-semibold hover:bg-green-800 disabled:opacity-50 text-sm">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save settings
        </button>
      </div>
    </form>
  )
}
