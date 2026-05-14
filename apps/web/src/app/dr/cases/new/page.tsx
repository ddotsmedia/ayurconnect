'use client'

// Structured new-case form. The "protocol" field uses simple line-input
// per phase to keep submission UX manageable; v2 could add per-medication
// structured inputs.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react'

type Phase = { phase: string; items: string[] }

const SPECS = ['kayachikitsa', 'panchakarma', 'prasuti-tantra', 'kaumarbhritya', 'manasika', 'shalakya', 'shalya', 'rasashastra', 'dravyaguna']
const OUTCOMES = ['', 'remission', 'major-improvement', 'partial', 'no-change', 'worsened']

export default function NewCasePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '', specialty: 'kayachikitsa', condition: '',
    chiefComplaint: '', presentingHistory: '',
    prakriti: '', vikriti: '',
    ayurvedicDiagnosis: '', modernDiagnosis: '',
    outcomeAtFollowUp: '', outcomeDetail: '', durationMonths: '',
    doctorNotes: '',
  })
  const [phases, setPhases] = useState<Phase[]>([{ phase: 'Phase 1', items: [''] }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addPhase() { setPhases((p) => [...p, { phase: `Phase ${p.length + 1}`, items: [''] }]) }
  function removePhase(i: number) { setPhases((p) => p.filter((_, x) => x !== i)) }
  function setPhaseName(i: number, name: string) { setPhases((p) => p.map((ph, x) => x === i ? { ...ph, phase: name } : ph)) }
  function addItem(i: number) { setPhases((p) => p.map((ph, x) => x === i ? { ...ph, items: [...ph.items, ''] } : ph)) }
  function setItem(i: number, j: number, v: string) { setPhases((p) => p.map((ph, x) => x === i ? { ...ph, items: ph.items.map((it, y) => y === j ? v : it) } : ph)) }
  function removeItem(i: number, j: number) { setPhases((p) => p.map((ph, x) => x === i ? { ...ph, items: ph.items.filter((_, y) => y !== j) } : ph)) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      const protocolJson = phases.map((ph) => ({ phase: ph.phase, items: ph.items.filter((it) => it.trim()) })).filter((ph) => ph.items.length > 0)
      const res = await fetch('/api/dr/cases', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...form,
          durationMonths: form.durationMonths ? Number(form.durationMonths) : null,
          protocolJson,
        }),
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      const created = await res.json() as { id: string }
      router.push(`/dr/cases/${created.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <Link href="/dr/cases" className="inline-flex items-center gap-1 text-sm text-kerala-700 hover:underline"><ArrowLeft className="w-3.5 h-3.5" /> All cases</Link>

      <header>
        <h1 className="font-serif text-3xl text-kerala-700">Share a clinical case</h1>
        <p className="text-sm text-muted mt-1">Anonymise the patient — no names, no exact dates. Cases are reviewed by admin before publishing.</p>
      </header>

      <form onSubmit={submit} className="space-y-5">
        <Block title="Case title + tagging">
          <Field label="Title *">
            <input required minLength={10} maxLength={250} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Refractory chronic migraine resolved with Shirodhara + Brahmi Ghritam"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Specialty">
              <select value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white">
                {SPECS.map((s) => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
              </select>
            </Field>
            <Field label="Condition">
              <input value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} placeholder="e.g. chronic migraine"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
            </Field>
          </div>
        </Block>

        <Block title="Presentation">
          <Field label="Chief complaint *">
            <textarea required minLength={10} rows={2} value={form.chiefComplaint} onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
          </Field>
          <Field label="Presenting history *">
            <textarea required minLength={20} rows={4} value={form.presentingHistory} onChange={(e) => setForm({ ...form, presentingHistory: e.target.value })}
              placeholder="Onset, triggers, prior treatments, relevant family/social history. Keep anonymous."
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prakriti"><input value={form.prakriti} onChange={(e) => setForm({ ...form, prakriti: e.target.value })} placeholder="vata / vata-pitta / ..." className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" /></Field>
            <Field label="Vikriti"><input value={form.vikriti} onChange={(e) => setForm({ ...form, vikriti: e.target.value })} placeholder="vata-aggravated, etc." className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" /></Field>
          </div>
        </Block>

        <Block title="Diagnosis">
          <Field label="Ayurvedic diagnosis *">
            <input required value={form.ayurvedicDiagnosis} onChange={(e) => setForm({ ...form, ayurvedicDiagnosis: e.target.value })} placeholder="e.g. Shirashoola (Vata-Pitta type)"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
          </Field>
          <Field label="Modern diagnosis (if relevant)">
            <input value={form.modernDiagnosis} onChange={(e) => setForm({ ...form, modernDiagnosis: e.target.value })} placeholder="e.g. Chronic migraine, ICD-10 G43.3"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
          </Field>
        </Block>

        <Block title="Treatment protocol *">
          <p className="text-xs text-gray-500 mb-2">Add phases (Pradhana / Anuvartana / Sthapana, or Months 1-3 / 4-6, etc.). Each phase: list the medications + procedures + lifestyle items.</p>
          {phases.map((ph, i) => (
            <div key={i} className="mb-3 p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-2 mb-2">
                <input value={ph.phase} onChange={(e) => setPhaseName(i, e.target.value)} className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-sm" />
                {phases.length > 1 && <button type="button" onClick={() => removePhase(i)} className="text-red-600 p-1 hover:bg-red-50 rounded" aria-label="Remove phase"><X className="w-4 h-4" /></button>}
              </div>
              {ph.items.map((it, j) => (
                <div key={j} className="flex items-center gap-2 mt-1">
                  <input value={it} onChange={(e) => setItem(i, j, e.target.value)} placeholder="e.g. Yogaraj Guggulu 500mg BD" className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs" />
                  {ph.items.length > 1 && <button type="button" onClick={() => removeItem(i, j)} className="text-red-500 p-1" aria-label="Remove"><X className="w-3 h-3" /></button>}
                </div>
              ))}
              <button type="button" onClick={() => addItem(i)} className="text-xs text-kerala-700 hover:underline mt-2 inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add item</button>
            </div>
          ))}
          <button type="button" onClick={addPhase} className="text-sm text-kerala-700 hover:underline inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add phase</button>
        </Block>

        <Block title="Outcome">
          <div className="grid grid-cols-2 gap-3">
            <Field label="At follow-up">
              <select value={form.outcomeAtFollowUp} onChange={(e) => setForm({ ...form, outcomeAtFollowUp: e.target.value })}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white">
                {OUTCOMES.map((o) => <option key={o} value={o}>{o || '—'}</option>)}
              </select>
            </Field>
            <Field label="Duration (months)">
              <input type="number" min="0" max="240" value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: e.target.value })} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
            </Field>
          </div>
          <Field label="Outcome detail">
            <textarea rows={3} value={form.outcomeDetail} onChange={(e) => setForm({ ...form, outcomeDetail: e.target.value })} placeholder="Quantitative measures, follow-up duration, what changed."
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
          </Field>
          <Field label="Doctor's reflections">
            <textarea rows={3} value={form.doctorNotes} onChange={(e) => setForm({ ...form, doctorNotes: e.target.value })} placeholder="What worked, what didn't, what you'd do differently."
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
          </Field>
        </Block>

        {error && <div className="p-3 rounded bg-red-50 border border-red-100 text-red-800 text-sm" role="alert">{error}</div>}

        <div className="flex justify-end gap-2">
          <Link href="/dr/cases" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">Cancel</Link>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 px-5 py-2 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 text-white rounded text-sm font-semibold">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Submit for review
          </button>
        </div>
      </form>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-gray-100 rounded-card p-5 space-y-3">
      <h2 className="font-serif text-lg text-ink">{title}</h2>
      {children}
    </section>
  )
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-700 mb-1 block">{label}</span>
      {children}
    </label>
  )
}
