'use client'

// Remote Patient Monitoring — doctor-facing page. Lists active threshold
// rules and unacknowledged alerts. New rules can be added by patient email
// (matching to an existing user record).

import { useEffect, useState } from 'react'
import { Activity, Bell, Plus, Loader2, X, Check, Trash2, AlertCircle } from 'lucide-react'

type Rule = {
  id: string
  patientId: string
  doctorId: string
  kind: string
  operator: string
  threshold: number
  threshold2: number | null
  active: boolean
  label: string | null
  createdAt: string
  patient: { id: string; name: string | null; email: string }
}

type Alert = {
  id: string
  ruleId: string
  patientId: string
  kind: string
  value: number
  acknowledged: boolean
  acknowledgedAt: string | null
  createdAt: string
  rule: { id: string; doctorId: string; patientId: string; kind: string; label: string | null; patient: { id: string; name: string | null; email: string } }
}

const KIND_LABELS: Record<string, string> = {
  bp_systolic: 'BP systolic', bp_diastolic: 'BP diastolic', hr: 'Heart rate', spo2: 'SpO₂',
  hrv_ms: 'HRV', temp_c: 'Temperature', glucose_mg_dl: 'Glucose', weight_kg: 'Weight',
  sleep_hours: 'Sleep', steps: 'Steps',
}
const OPERATORS: Array<{ id: string; label: string }> = [
  { id: 'gt',      label: 'greater than (>)' },
  { id: 'gte',     label: '≥' },
  { id: 'lt',      label: 'less than (<)' },
  { id: 'lte',     label: '≤' },
  { id: 'between', label: 'outside range' },
]

export default function RpmPage() {
  const [rules, setRules] = useState<Rule[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ patientEmail: '', kind: 'bp_systolic', operator: 'gt', threshold: '', threshold2: '', label: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [r, a] = await Promise.all([
        fetch('/api/rpm/rules',                       { credentials: 'include' }),
        fetch('/api/rpm/alerts?acknowledged=false',   { credentials: 'include' }),
      ])
      if (r.ok) setRules(((await r.json()) as { rules: Rule[] }).rules ?? [])
      if (a.ok) setAlerts(((await a.json()) as { alerts: Alert[] }).alerts ?? [])
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [])

  async function addRule(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    try {
      // Resolve patient by email — we expose this on the admin user list,
      // for doctor convenience just submit email and the API errors clearly.
      const lookup = await fetch(`/api/admin/users?q=${encodeURIComponent(form.patientEmail)}`, { credentials: 'include' })
      if (!lookup.ok) throw new Error('Patient lookup requires admin role. Ask admin to add this rule, or enter patient ID directly.')
      const data = await lookup.json() as { users: Array<{ id: string; email: string }> }
      const patient = data.users.find((u) => u.email.toLowerCase() === form.patientEmail.toLowerCase())
      if (!patient) throw new Error('No user with that email.')

      const res = await fetch('/api/rpm/rules', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          kind:       form.kind,
          operator:   form.operator,
          threshold:  Number(form.threshold),
          threshold2: form.operator === 'between' ? Number(form.threshold2) : undefined,
          label:      form.label || undefined,
        }),
        credentials: 'include',
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(e.error ?? `HTTP ${res.status}`)
      }
      setShowForm(false)
      setForm({ patientEmail: '', kind: 'bp_systolic', operator: 'gt', threshold: '', threshold2: '', label: '' })
      await load()
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) } finally { setSaving(false) }
  }

  async function deleteRule(id: string) {
    if (!confirm('Delete this rule? Alerts already raised will remain.')) return
    await fetch(`/api/rpm/rules/${id}`, { method: 'DELETE', credentials: 'include' })
    await load()
  }
  async function ackAlert(id: string) {
    await fetch(`/api/rpm/alerts/${id}/ack`, { method: 'POST', credentials: 'include' })
    await load()
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl text-ink">Patient Monitoring</h1>
          <p className="text-sm text-muted mt-1">Get notified when a patient&apos;s vitals cross thresholds you set.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-kerala-700 text-white rounded-md text-sm hover:bg-kerala-800">
            <Plus className="w-4 h-4" /> New rule
          </button>
        )}
      </header>

      {error && <div className="p-3 rounded bg-red-50 border border-red-100 text-red-800 text-sm">{error}</div>}

      {/* Alerts */}
      <section>
        <h2 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3 inline-flex items-center gap-1.5">
          <Bell className="w-3 h-3" /> Open alerts ({alerts.length})
        </h2>
        {loading ? (
          <div className="text-center py-6 text-gray-500 text-sm">Loading…</div>
        ) : alerts.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No open alerts. Patients are within thresholds.</p>
        ) : (
          <div className="space-y-2">
            {alerts.map((a) => (
              <div key={a.id} className="bg-white border border-amber-200 rounded-card p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">
                    {a.rule.patient.name ?? a.rule.patient.email}: <span className="text-amber-700">{KIND_LABELS[a.kind] ?? a.kind} = {a.value}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {a.rule.label ?? 'Threshold rule'} · {new Date(a.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button onClick={() => ackAlert(a.id)} className="text-xs px-3 py-1.5 bg-kerala-700 text-white rounded hover:bg-kerala-800 inline-flex items-center gap-1.5">
                  <Check className="w-3 h-3" /> Acknowledge
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* New rule form */}
      {showForm && (
        <form onSubmit={addRule} className="bg-white border border-gray-100 rounded-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-ink">New threshold rule</h2>
            <button type="button" onClick={() => setShowForm(false)} className="p-1.5 rounded hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <label className="block">
            <span className="text-xs font-medium text-gray-700 mb-1 block">Patient email *</span>
            <input required type="email" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={form.patientEmail} onChange={(e) => setForm({ ...form, patientEmail: e.target.value })} placeholder="patient@example.com" />
            <p className="text-[10px] text-gray-400 mt-1">Patient must already have an account.</p>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-gray-700 mb-1 block">Vital</span>
              <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                {Object.entries(KIND_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700 mb-1 block">When value is</span>
              <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })}>
                {OPERATORS.map((op) => <option key={op.id} value={op.id}>{op.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700 mb-1 block">{form.operator === 'between' ? 'Min' : 'Threshold'}</span>
              <input required type="number" step="0.1" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} />
            </label>
            {form.operator === 'between' && (
              <label className="block">
                <span className="text-xs font-medium text-gray-700 mb-1 block">Max</span>
                <input required type="number" step="0.1" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={form.threshold2} onChange={(e) => setForm({ ...form, threshold2: e.target.value })} />
              </label>
            )}
          </div>
          <label className="block">
            <span className="text-xs font-medium text-gray-700 mb-1 block">Label <span className="text-gray-400">(optional)</span></span>
            <input className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="High BP — alert me" />
          </label>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-kerala-700 text-white text-sm rounded-md hover:bg-kerala-800 disabled:opacity-60">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}Add rule
            </button>
          </div>
        </form>
      )}

      {/* Rules */}
      <section>
        <h2 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3 inline-flex items-center gap-1.5">
          <Activity className="w-3 h-3" /> Active rules ({rules.length})
        </h2>
        {rules.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No rules yet. Add one above to start monitoring a patient.</p>
        ) : (
          <div className="bg-white border border-gray-100 rounded-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-2.5">Patient</th>
                  <th className="px-4 py-2.5">Vital</th>
                  <th className="px-4 py-2.5">Threshold</th>
                  <th className="px-4 py-2.5">Label</th>
                  <th className="px-4 py-2.5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rules.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2.5">{r.patient.name ?? r.patient.email}</td>
                    <td className="px-4 py-2.5">{KIND_LABELS[r.kind] ?? r.kind}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{r.operator} {r.threshold}{r.operator === 'between' && r.threshold2 != null ? `–${r.threshold2}` : ''}</td>
                    <td className="px-4 py-2.5 text-gray-600">{r.label ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button onClick={() => deleteRule(r.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600" aria-label="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
