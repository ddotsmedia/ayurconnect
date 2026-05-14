'use client'

// Single-prescription view. Lets the prescribing doctor edit; the patient
// gets a read-only view. Print button uses window.print() with a dedicated
// print-only style block — no PDF library needed.

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Printer, Edit3, Loader2, Pill, X, Plus, Trash2, Save } from 'lucide-react'

type Item = { id: string; medication: string; herbId: string | null; dose: string; frequency: string; duration: string | null; anupana: string | null; instructions: string | null; position: number }
type Prescription = {
  id: string
  patientId: string
  doctorId: string
  appointmentId: string | null
  issuedAt: string
  validUntil: string | null
  diagnosis: string | null
  advice: string | null
  followUpAfterWeeks: number | null
  status: 'active' | 'completed' | 'cancelled'
  items: Item[]
  patient: { id: string; name: string | null; email: string; phone: string | null }
  doctor:  { id: string; name: string | null; email: string; ownedDoctor: { id: string; specialization: string; qualification: string | null; ccimVerified: boolean } | null }
}

type ItemDraft = Omit<Item, 'id' | 'position'> & { id?: string }

export default function PrescriptionDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [rx, setRx] = useState<Prescription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [iAmDoctor, setIAmDoctor] = useState(false)

  // Edit mode (doctor only)
  const [editing, setEditing] = useState(false)
  const [diagnosis, setDiagnosis] = useState('')
  const [advice, setAdvice] = useState('')
  const [followUpAfterWeeks, setFollowUpAfterWeeks] = useState<string>('')
  const [items, setItems] = useState<ItemDraft[]>([])
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/prescriptions/${params.id}`, { credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as Prescription
      setRx(data)
      // Check whether the signed-in user is the prescribing doctor.
      const meRes = await fetch('/api/me', { credentials: 'include' })
      if (meRes.ok) {
        const me = await meRes.json() as { user?: { id: string } }
        setIAmDoctor(me.user?.id === data.doctorId)
      }
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) } finally { setLoading(false) }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [params.id])

  function startEdit() {
    if (!rx) return
    setDiagnosis(rx.diagnosis ?? '')
    setAdvice(rx.advice ?? '')
    setFollowUpAfterWeeks(rx.followUpAfterWeeks?.toString() ?? '')
    setItems(rx.items.map(({ id, position: _p, ...rest }) => ({ id, ...rest })))
    setEditing(true)
  }
  function addItem() {
    setItems((i) => [...i, { medication: '', herbId: null, dose: '', frequency: '', duration: null, anupana: null, instructions: null }])
  }
  function updateItem(idx: number, patch: Partial<ItemDraft>) {
    setItems((cur) => cur.map((it, i) => i === idx ? { ...it, ...patch } : it))
  }
  function removeItem(idx: number) {
    setItems((cur) => cur.filter((_, i) => i !== idx))
  }
  async function save() {
    if (!rx) return
    setSaving(true); setError(null)
    try {
      const res = await fetch(`/api/prescriptions/${rx.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          diagnosis: diagnosis || null,
          advice:    advice || null,
          followUpAfterWeeks: followUpAfterWeeks ? Number(followUpAfterWeeks) : null,
          items: items.map((it, idx) => ({ ...it, position: idx })),
        }),
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      setEditing(false)
      await load()
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) } finally { setSaving(false) }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading…</div>
  if (error)   return <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded">{error}</div>
  if (!rx)     return <div className="p-4">Prescription not found.</div>

  const doctorName = rx.doctor.name ? `Dr ${rx.doctor.name}` : 'Doctor'
  const issued = new Date(rx.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      {/* Print-only stylesheet — hides everything except the .rx-printable container. */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .rx-no-print { display: none !important; }
          .rx-printable { box-shadow: none !important; border: 0 !important; padding: 0 !important; }
        }
      `}</style>

      <div className="space-y-4">
        <div className="rx-no-print flex items-center justify-between gap-3 flex-wrap">
          <Link href="/dashboard/prescriptions" className="inline-flex items-center gap-1.5 text-sm text-kerala-700 hover:underline">
            <ArrowLeft className="w-4 h-4" /> All prescriptions
          </Link>
          <div className="flex gap-2">
            {iAmDoctor && !editing && (
              <button onClick={startEdit} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-kerala-600 text-kerala-700 rounded-md text-sm hover:bg-kerala-50">
                <Edit3 className="w-4 h-4" /> Edit
              </button>
            )}
            {!editing && (
              <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-kerala-700 text-white rounded-md text-sm hover:bg-kerala-800">
                <Printer className="w-4 h-4" /> Print / save PDF
              </button>
            )}
          </div>
        </div>

        <article className="rx-printable bg-white border border-gray-100 rounded-card p-8 shadow-card max-w-[800px] mx-auto">
          {/* Header — clinic letterhead style */}
          <header className="flex items-start justify-between border-b-2 border-kerala-700 pb-4 mb-5">
            <div>
              <h1 className="font-serif text-2xl text-kerala-800">{doctorName}</h1>
              {rx.doctor.ownedDoctor && (
                <p className="text-sm text-gray-700">
                  {rx.doctor.ownedDoctor.qualification ?? ''} {rx.doctor.ownedDoctor.qualification && '·'} {rx.doctor.ownedDoctor.specialization}
                </p>
              )}
              {rx.doctor.ownedDoctor?.ccimVerified && (
                <p className="text-xs text-kerala-700 mt-1">✓ CCIM Verified</p>
              )}
            </div>
            <div className="text-right text-xs text-gray-500">
              <p className="font-semibold text-gray-700">AyurConnect</p>
              <p>ayurconnect.com</p>
              <p className="mt-2">Date: <span className="text-gray-800">{issued}</span></p>
              {rx.followUpAfterWeeks && <p>Review after: <span className="text-gray-800">{rx.followUpAfterWeeks} weeks</span></p>}
            </div>
          </header>

          <section className="grid grid-cols-2 gap-6 mb-5 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Patient</p>
              <p className="text-gray-800">{rx.patient.name ?? rx.patient.email}</p>
              {rx.patient.phone && <p className="text-xs text-gray-500">{rx.patient.phone}</p>}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Status</p>
              <p className="text-gray-800">{rx.status}</p>
            </div>
          </section>

          {editing ? (
            <div className="space-y-4 mb-5">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1 block">Diagnosis</span>
                <input className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1 block">Advice (diet, lifestyle, dinacharya)</span>
                <textarea rows={3} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={advice} onChange={(e) => setAdvice(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1 block">Follow-up after (weeks)</span>
                <input type="number" min="0" max="104" className="w-32 border border-gray-200 rounded-md px-3 py-2 text-sm" value={followUpAfterWeeks} onChange={(e) => setFollowUpAfterWeeks(e.target.value)} />
              </label>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Medications</span>
                  <button type="button" onClick={addItem} className="inline-flex items-center gap-1 text-xs text-kerala-700 hover:underline">
                    <Plus className="w-3 h-3" /> Add item
                  </button>
                </div>
                <div className="space-y-3">
                  {items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 p-3 bg-gray-50 rounded-md border border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input placeholder="Medication (e.g. Yogaraj Guggulu)" className="border border-gray-200 rounded px-2 py-1.5 text-sm" value={it.medication} onChange={(e) => updateItem(idx, { medication: e.target.value })} />
                        <input placeholder="Dose (e.g. 1 tablet)"               className="border border-gray-200 rounded px-2 py-1.5 text-sm" value={it.dose} onChange={(e) => updateItem(idx, { dose: e.target.value })} />
                        <input placeholder="Frequency (e.g. twice daily)"        className="border border-gray-200 rounded px-2 py-1.5 text-sm" value={it.frequency} onChange={(e) => updateItem(idx, { frequency: e.target.value })} />
                        <input placeholder="Duration (e.g. for 30 days)"         className="border border-gray-200 rounded px-2 py-1.5 text-sm" value={it.duration ?? ''} onChange={(e) => updateItem(idx, { duration: e.target.value || null })} />
                        <input placeholder="Anupana (vehicle, e.g. warm water)"  className="border border-gray-200 rounded px-2 py-1.5 text-sm" value={it.anupana ?? ''} onChange={(e) => updateItem(idx, { anupana: e.target.value || null })} />
                        <input placeholder="Instructions / notes"                className="border border-gray-200 rounded px-2 py-1.5 text-sm" value={it.instructions ?? ''} onChange={(e) => updateItem(idx, { instructions: e.target.value || null })} />
                      </div>
                      <button type="button" onClick={() => removeItem(idx)} className="self-start p-1 text-red-500 hover:bg-red-50 rounded" aria-label="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {items.length === 0 && <p className="text-xs text-gray-400 italic">No items. Add at least one medication.</p>}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md inline-flex items-center gap-1.5">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button type="button" onClick={save} disabled={saving || items.length === 0} className="px-3 py-1.5 text-sm bg-kerala-700 text-white rounded-md hover:bg-kerala-800 disabled:opacity-60 inline-flex items-center gap-1.5">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                </button>
              </div>
            </div>
          ) : (
            <>
              {rx.diagnosis && (
                <section className="mb-5">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Diagnosis</p>
                  <p className="text-gray-800">{rx.diagnosis}</p>
                </section>
              )}

              <section className="mb-5">
                <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2 inline-flex items-center gap-1.5">
                  <Pill className="w-3 h-3" /> Rx
                </h2>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                      <th className="py-2 pr-2">#</th>
                      <th className="py-2 pr-2">Medication</th>
                      <th className="py-2 pr-2">Dose</th>
                      <th className="py-2 pr-2">Frequency</th>
                      <th className="py-2 pr-2">Duration</th>
                      <th className="py-2 pr-2">Anupana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rx.items.map((it, idx) => (
                      <tr key={it.id} className="border-b border-gray-100 align-top">
                        <td className="py-2 pr-2 text-gray-400">{idx + 1}</td>
                        <td className="py-2 pr-2 font-medium text-gray-800">{it.medication}{it.instructions && <span className="block text-xs text-gray-500 mt-0.5">{it.instructions}</span>}</td>
                        <td className="py-2 pr-2">{it.dose}</td>
                        <td className="py-2 pr-2">{it.frequency}</td>
                        <td className="py-2 pr-2">{it.duration ?? '—'}</td>
                        <td className="py-2 pr-2">{it.anupana ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {rx.advice && (
                <section className="mb-5">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Advice (diet, lifestyle, dinacharya)</p>
                  <p className="text-gray-800 whitespace-pre-line text-sm leading-relaxed">{rx.advice}</p>
                </section>
              )}
            </>
          )}

          <footer className="mt-8 pt-4 border-t border-gray-200 text-[10px] text-gray-500 text-center">
            This prescription is for educational/clinical use only. Always consult your Ayurvedic practitioner before changing dosage or stopping medication.
          </footer>
        </article>
      </div>
    </>
  )
}
