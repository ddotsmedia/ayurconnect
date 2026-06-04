'use client'

import { useEffect, useState } from 'react'
import { Users, Calendar, ClipboardList, Plus, Trash2 } from 'lucide-react'

type Intake = {
  id: string; name: string; age: string; sex: string; prakriti: string; vikriti: string;
  chiefComplaint: string; nadi: string; ashtavidha: string; treatmentPlan: string; createdAt: string
}
type ScheduleSlot = { day: string; time: string; patientName: string; treatment: string }
type Admission   = { id: string; name: string; status: 'OPD' | 'IPD' | 'Discharged'; admittedAt: string; treatment: string }

const INTAKE_KEY     = 'ayur_clinic_intake'
const SCHEDULE_KEY   = 'ayur_clinic_schedule'
const ADMISSION_KEY  = 'ayur_clinic_admissions'

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try { return JSON.parse(localStorage.getItem(key) ?? '') as T } catch { return fallback }
}
function save<T>(key: string, v: T): void {
  try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* quota */ }
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']

export function DemoTabs() {
  const [tab, setTab] = useState<'intake' | 'schedule' | 'opd'>('intake')

  return (
    <div className="max-w-5xl mx-auto">
      <nav className="inline-flex bg-gray-100 rounded-md p-1 text-sm mb-6">
        {([
          { k: 'intake',   label: 'Patient intake',     icon: Users },
          { k: 'schedule', label: 'Treatment scheduler', icon: Calendar },
          { k: 'opd',      label: 'OPD / IPD tracker',  icon: ClipboardList },
        ] as const).map(({ k, label, icon: Icon }) => (
          <button key={k} onClick={() => setTab(k)} className={'inline-flex items-center gap-1.5 px-3 py-1.5 rounded ' + (tab === k ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </nav>

      {tab === 'intake'   && <IntakeForm />}
      {tab === 'schedule' && <Scheduler />}
      {tab === 'opd'      && <OpdTracker />}
    </div>
  )
}

function IntakeForm() {
  const [items, setItems] = useState<Intake[]>([])
  const [form, setForm] = useState<Intake>({
    id: '', name: '', age: '', sex: 'F', prakriti: 'Vata-Pitta', vikriti: '',
    chiefComplaint: '', nadi: '', ashtavidha: '', treatmentPlan: '', createdAt: '',
  })
  useEffect(() => setItems(load<Intake[]>(INTAKE_KEY, [])), [])

  function add() {
    if (!form.name.trim() || !form.chiefComplaint.trim()) return
    const next: Intake[] = [{
      ...form,
      id: 'pt_' + (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().slice(0, 8) : (items.length + 1).toString(36)),
      createdAt: new Date().toISOString(),
    }, ...items]
    setItems(next); save(INTAKE_KEY, next)
    setForm({ ...form, name: '', age: '', vikriti: '', chiefComplaint: '', nadi: '', ashtavidha: '', treatmentPlan: '' })
  }
  function remove(id: string) {
    const next = items.filter((p) => p.id !== id)
    setItems(next); save(INTAKE_KEY, next)
  }

  const ic = 'w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
        <h3 className="font-serif text-lg text-ink mb-3">New patient intake</h3>
        <div className="space-y-2">
          <input className={ic} placeholder="Patient name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input className={ic} placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            <select className={ic} value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}>
              <option>F</option><option>M</option><option>Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select className={ic} value={form.prakriti} onChange={(e) => setForm({ ...form, prakriti: e.target.value })}>
              <option>Vata</option><option>Pitta</option><option>Kapha</option>
              <option>Vata-Pitta</option><option>Pitta-Kapha</option><option>Vata-Kapha</option>
              <option>Tridosha</option>
            </select>
            <input className={ic} placeholder="Vikriti (current imbalance)" value={form.vikriti} onChange={(e) => setForm({ ...form, vikriti: e.target.value })} />
          </div>
          <textarea className={ic} rows={2} placeholder="Chief complaint *" value={form.chiefComplaint} onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })} />
          <textarea className={ic} rows={2} placeholder="Nadi pariksha notes" value={form.nadi} onChange={(e) => setForm({ ...form, nadi: e.target.value })} />
          <textarea className={ic} rows={2} placeholder="Ashtavidha pariksha (Nadi · Mutra · Mala · Jihva · Shabda · Sparsha · Drik · Akriti)" value={form.ashtavidha} onChange={(e) => setForm({ ...form, ashtavidha: e.target.value })} />
          <textarea className={ic} rows={3} placeholder="Treatment plan" value={form.treatmentPlan} onChange={(e) => setForm({ ...form, treatmentPlan: e.target.value })} />
          <button onClick={add} className="w-full inline-flex justify-center items-center gap-1 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">
            <Plus className="w-4 h-4" /> Save intake
          </button>
        </div>
      </section>

      <section>
        <h3 className="font-serif text-lg text-ink mb-3">Recent intakes ({items.length})</h3>
        {items.length === 0 ? (
          <p className="text-sm text-muted bg-white border border-gray-100 rounded-card p-5">No intakes yet. The form on the left writes to your local browser storage.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((p) => (
              <li key={p.id} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-ink">{p.name}{p.age ? `, ${p.age}` : ''} · {p.sex}</p>
                    <p className="text-[11px] text-gray-500">Prakriti {p.prakriti}{p.vikriti ? ` · Vikriti ${p.vikriti}` : ''}</p>
                  </div>
                  <button onClick={() => remove(p.id)} className="text-red-600 hover:text-red-800" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
                <p className="text-xs text-gray-700 mt-2 line-clamp-2">{p.chiefComplaint}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Scheduler() {
  const [slots, setSlots] = useState<Record<string, ScheduleSlot>>({})
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState({ patientName: '', treatment: '' })
  useEffect(() => setSlots(load<Record<string, ScheduleSlot>>(SCHEDULE_KEY, {})), [])

  function open(key: string) {
    setEditing(key)
    setDraft({ patientName: slots[key]?.patientName ?? '', treatment: slots[key]?.treatment ?? '' })
  }
  function commit() {
    if (!editing) return
    const next = { ...slots }
    if (!draft.patientName.trim()) delete next[editing]
    else next[editing] = { day: editing.split('|')[0], time: editing.split('|')[1], patientName: draft.patientName.trim(), treatment: draft.treatment.trim() }
    setSlots(next); save(SCHEDULE_KEY, next); setEditing(null)
  }

  return (
    <section className="bg-white border border-gray-100 rounded-card p-5 shadow-card overflow-x-auto">
      <h3 className="font-serif text-lg text-ink mb-3">Weekly treatment grid</h3>
      <table className="min-w-full text-sm">
        <thead>
          <tr><th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-500"></th>{DAYS.map((d) => <th key={d} className="px-2 py-1.5 text-left text-xs font-semibold text-gray-500">{d}</th>)}</tr>
        </thead>
        <tbody>
          {SLOTS.map((t) => (
            <tr key={t}>
              <td className="px-2 py-1.5 text-xs text-gray-500 font-semibold tabular-nums">{t}</td>
              {DAYS.map((d) => {
                const key = `${d}|${t}`
                const slot = slots[key]
                return (
                  <td key={key} className="px-1 py-1">
                    <button onClick={() => open(key)} className={'w-full min-h-[44px] rounded text-left p-1 text-xs ' + (slot ? 'bg-kerala-50 border border-kerala-200 hover:border-kerala-400' : 'border border-dashed border-gray-200 hover:border-kerala-300 text-gray-400')}>
                      {slot ? <><strong className="block text-kerala-800">{slot.patientName}</strong><span className="text-[10px] text-gray-600">{slot.treatment}</span></> : '+'}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-card max-w-sm w-full p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-semibold">Slot · {editing.replace('|', ' ')}</h4>
            <input className="w-full px-3 py-2 border border-gray-200 rounded text-sm" placeholder="Patient name (blank to clear)" value={draft.patientName} onChange={(e) => setDraft({ ...draft, patientName: e.target.value })} />
            <input className="w-full px-3 py-2 border border-gray-200 rounded text-sm" placeholder="Treatment (e.g. Abhyanga + Nasya)" value={draft.treatment} onChange={(e) => setDraft({ ...draft, treatment: e.target.value })} />
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-xs text-gray-700">Cancel</button>
              <button onClick={commit} className="px-4 py-1.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-xs font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function OpdTracker() {
  const [rows, setRows] = useState<Admission[]>([])
  const [form, setForm] = useState({ name: '', status: 'OPD' as 'OPD' | 'IPD' | 'Discharged', treatment: '' })
  useEffect(() => setRows(load<Admission[]>(ADMISSION_KEY, [])), [])

  function add() {
    if (!form.name.trim()) return
    const next: Admission[] = [{
      id: 'adm_' + (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().slice(0, 8) : (rows.length + 1).toString(36)),
      name: form.name.trim(), status: form.status, treatment: form.treatment.trim(),
      admittedAt: new Date().toISOString(),
    }, ...rows]
    setRows(next); save(ADMISSION_KEY, next); setForm({ name: '', status: 'OPD', treatment: '' })
  }
  function cycleStatus(id: string) {
    const next = rows.map((r) => r.id === id ? { ...r, status: r.status === 'OPD' ? 'IPD' as const : r.status === 'IPD' ? 'Discharged' as const : 'OPD' as const } : r)
    setRows(next); save(ADMISSION_KEY, next)
  }
  function remove(id: string) {
    const next = rows.filter((r) => r.id !== id)
    setRows(next); save(ADMISSION_KEY, next)
  }

  const tone: Record<Admission['status'], string> = {
    OPD:        'bg-blue-50 text-blue-700',
    IPD:        'bg-amber-50 text-amber-800',
    Discharged: 'bg-gray-100 text-gray-600',
  }
  const ic = 'px-3 py-2 border border-gray-200 rounded text-sm'

  return (
    <section className="space-y-4">
      <div className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
        <h3 className="font-serif text-lg text-ink mb-3">Admit patient</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input className={ic} placeholder="Patient name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className={ic} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'OPD' | 'IPD' | 'Discharged' })}>
            <option>OPD</option><option>IPD</option><option>Discharged</option>
          </select>
          <input className={ic + ' sm:col-span-2'} placeholder="Treatment assigned" value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} />
        </div>
        <button onClick={add} className="mt-3 inline-flex items-center gap-1 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">
          <Plus className="w-4 h-4" /> Admit
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-card overflow-x-auto shadow-card">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2.5">Patient</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Treatment</th>
              <th className="px-4 py-2.5">Admitted</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No admissions yet.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2.5 font-medium">{r.name}</td>
                <td className="px-4 py-2.5">
                  <button onClick={() => cycleStatus(r.id)} className={'inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold ' + tone[r.status]}>{r.status}</button>
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-700">{r.treatment || '—'}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{new Date(r.admittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => remove(r.id)} className="text-red-600 hover:underline text-xs">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
