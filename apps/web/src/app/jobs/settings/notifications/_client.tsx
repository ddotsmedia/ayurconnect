'use client'

import { useState } from 'react'
import { Save, CheckCircle2 } from 'lucide-react'

export type Prefs = { whatsapp: string | null; alert: boolean; status: boolean; reminder: boolean }

export function NotificationsClient({ initial }: { initial: Prefs }) {
  const [p, setP] = useState({ whatsapp: initial.whatsapp ?? '', alert: initial.alert, status: initial.status, reminder: initial.reminder })
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  async function save() {
    setBusy(true); setSaved(false)
    try {
      await fetch('/api/jobs-portal/candidates/me/notifications', {
        method: 'PATCH', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ whatsapp: p.whatsapp, whatsappAlertOptIn: p.alert, whatsappStatusOptIn: p.status, whatsappReminderOptIn: p.reminder }),
      })
      setSaved(true); window.setTimeout(() => setSaved(false), 2000)
    } finally { setBusy(false) }
  }
  return (
    <section className="mt-4 bg-white border border-gray-100 rounded-card p-5 shadow-card space-y-3">
      <label className="block text-sm"><span className="block font-medium text-gray-700 mb-1">WhatsApp number (E.164, e.g. +919447…)</span>
        <input className="w-full border border-gray-200 rounded px-3 py-2 text-sm" value={p.whatsapp} onChange={(e) => setP({ ...p, whatsapp: e.target.value })} placeholder="+91…" />
      </label>
      <Tog l="Receive job alerts via WhatsApp"          v={p.alert}    on={(b) => setP({ ...p, alert: b })} />
      <Tog l="Receive application updates via WhatsApp" v={p.status}   on={(b) => setP({ ...p, status: b })} />
      <Tog l="Receive interview reminders via WhatsApp" v={p.reminder} on={(b) => setP({ ...p, reminder: b })} />
      <button onClick={save} disabled={busy} className="inline-flex items-center gap-1 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold disabled:opacity-50">
        {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />} {busy ? 'Saving…' : saved ? 'Saved!' : 'Save preferences'}
      </button>
    </section>
  )
}
function Tog({ l, v, on }: { l: string; v: boolean; on: (b: boolean) => void }) {
  return <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={v} onChange={(e) => on(e.target.checked)} /> {l}</label>
}
