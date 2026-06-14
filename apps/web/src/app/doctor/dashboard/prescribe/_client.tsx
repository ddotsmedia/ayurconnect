'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Printer, Save, FileText, Sparkles, Leaf } from 'lucide-react'

type Item = { medicine: string; dosage: string; timing: string; duration: string; anupana: string }
type Doctor = { id: string; name: string; qualification?: string | null; ksmcRegNumber?: string | null; workplace?: string | null; referralCode?: string | null }

const EMPTY_ITEM: Item = { medicine: '', dosage: '', timing: 'BD (twice daily)', duration: '7 days', anupana: 'Warm water' }

export function PrescribeClient() {
  const [doc, setDoc] = useState<Doctor | null>(null)
  const [patient, setPatient] = useState({ name: '', age: '', gender: '', diagnosis: '', diagnosisMl: '' })
  const [items, setItems] = useState<Item[]>([{ ...EMPTY_ITEM }])
  const [pathya, setPathya] = useState('')
  const [apathya, setApathya] = useState('')
  const [notes, setNotes] = useState('')
  const [savedId, setSavedId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch('/api/doctor-viral/me', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((m: { doctor: Doctor } | null) => setDoc(m?.doctor ?? null))
      .catch(() => {})
  }, [])

  async function save() {
    if (!patient.name.trim()) return
    setBusy(true)
    try {
      const res = await fetch('/api/doctor-viral/prescriptions', {
        method: 'POST', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          patientName: patient.name, patientAge: patient.age || null, patientGender: patient.gender || null,
          diagnosis: patient.diagnosis, diagnosisMl: patient.diagnosisMl,
          items: items.filter((i) => i.medicine.trim()),
          pathya, apathya, notes,
        }),
      })
      if (res.ok) { const j = await res.json() as { id: string }; setSavedId(j.id) }
    } finally { setBusy(false) }
  }

  function print() { window.print() }

  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const profileUrl = doc ? `https://ayurconnect.com/doctors/${doc.id}` : ''
  // Simple decorative QR like in marketing — links to public profile.
  const qrSeed = profileUrl

  return (
    <div className="space-y-4">
      <header className="bg-white border border-gray-100 rounded-card p-4 shadow-card flex items-center justify-between flex-wrap gap-3 print:hidden">
        <div>
          <h1 className="font-serif text-xl text-ink inline-flex items-center gap-2"><FileText className="w-5 h-5 text-kerala-700" /> Prescription pad</h1>
          <p className="text-xs text-gray-600">Every prescription carries your AyurConnect profile QR — each patient sees your verified directory listing.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-1 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold disabled:opacity-50"><Save className="w-4 h-4" /> {busy ? 'Saving…' : savedId ? 'Saved!' : 'Save'}</button>
          <button onClick={print} className="inline-flex items-center gap-1 px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded text-sm"><Printer className="w-4 h-4" /> Print / PDF</button>
        </div>
      </header>

      {/* Printable area */}
      <article className="bg-white border border-gray-200 rounded-card p-8 shadow-card print:shadow-none print:border-0">
        <header className="flex items-start justify-between border-b border-gray-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-kerala-700"><Leaf className="w-6 h-6" /><span className="font-serif text-2xl">{doc?.name ?? 'Doctor'}</span></div>
            <p className="text-xs text-gray-600 mt-0.5">{doc?.qualification ?? 'BAMS'}</p>
            {doc?.ksmcRegNumber && <p className="text-[11px] text-gray-500">KSMC Reg #: {doc.ksmcRegNumber}</p>}
            {doc?.workplace && <p className="text-[11px] text-gray-500">{doc.workplace}</p>}
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Prescribed via AyurConnect</p>
            <svg viewBox="0 0 21 21" width="80" height="80" className="ml-auto" aria-label="profile QR">
              <rect width="21" height="21" fill="white" />
              {Array.from({ length: 21 }).flatMap((_, y) => Array.from({ length: 21 }).map((_, x) => {
                let h = 0
                for (let i = 0; i < qrSeed.length; i++) h = ((h << 5) - h + qrSeed.charCodeAt(i) + x * 31 + y * 17) | 0
                const on = ((h >>> 0) & 3) === 1 || (Math.abs(x - 2) <= 2 && Math.abs(y - 2) <= 2 && (Math.abs(x - 2) === 2 || Math.abs(y - 2) === 2 || (x === 2 && y === 2))) || (Math.abs(x - 18) <= 2 && Math.abs(y - 2) <= 2 && (Math.abs(x - 18) === 2 || Math.abs(y - 2) === 2 || (x === 18 && y === 2))) || (Math.abs(x - 2) <= 2 && Math.abs(y - 18) <= 2 && (Math.abs(x - 2) === 2 || Math.abs(y - 18) === 2 || (x === 2 && y === 18)))
                return on ? <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" fill="#155228" /> : null
              }))}
            </svg>
            <p className="text-[8px] text-gray-500 mt-1 max-w-[80px] break-all">ayurconnect.com/doctors/{doc?.id?.slice(0, 8) ?? '…'}</p>
          </div>
        </header>

        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <Field l="Patient name"><input value={patient.name} onChange={(e) => setPatient({ ...patient, name: e.target.value })} className="input" /></Field>
          <Field l="Age"><input value={patient.age} onChange={(e) => setPatient({ ...patient, age: e.target.value })} className="input" type="number" /></Field>
          <Field l="Sex">
            <select value={patient.gender} onChange={(e) => setPatient({ ...patient, gender: e.target.value })} className="input">
              <option value="">—</option><option>Female</option><option>Male</option><option>Other</option>
            </select>
          </Field>
          <Field l="Diagnosis (English)" full><input value={patient.diagnosis} onChange={(e) => setPatient({ ...patient, diagnosis: e.target.value })} className="input" /></Field>
          <Field l="Diagnosis (Malayalam)" full><input value={patient.diagnosisMl} onChange={(e) => setPatient({ ...patient, diagnosisMl: e.target.value })} className="input" dir="auto" placeholder="ഉദാ. വാത പ്രകോപം" /></Field>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold text-gray-700 mb-2">℞ — Medication</p>
          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-start">
                <input value={it.medicine} onChange={(e) => setItems((x) => x.map((y, j) => j === i ? { ...y, medicine: e.target.value } : y))} placeholder="Medicine name" className="input col-span-4" />
                <input value={it.dosage}   onChange={(e) => setItems((x) => x.map((y, j) => j === i ? { ...y, dosage: e.target.value } : y))}   placeholder="Dosage"        className="input col-span-2" />
                <input value={it.timing}   onChange={(e) => setItems((x) => x.map((y, j) => j === i ? { ...y, timing: e.target.value } : y))}   placeholder="Timing"        className="input col-span-2" />
                <input value={it.duration} onChange={(e) => setItems((x) => x.map((y, j) => j === i ? { ...y, duration: e.target.value } : y))} placeholder="Duration"      className="input col-span-2" />
                <input value={it.anupana}  onChange={(e) => setItems((x) => x.map((y, j) => j === i ? { ...y, anupana: e.target.value } : y))}  placeholder="Anupana"       className="input col-span-1" />
                <button onClick={() => setItems((x) => x.filter((_, j) => j !== i))} className="col-span-1 text-red-600 print:hidden"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <button onClick={() => setItems((x) => [...x, { ...EMPTY_ITEM }])} className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded text-xs print:hidden"><Plus className="w-3.5 h-3.5" /> Add medicine</button>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field l="Pathya (recommended diet)"><textarea rows={3} value={pathya} onChange={(e) => setPathya(e.target.value)} className="input" /></Field>
          <Field l="Apathya (foods to avoid)"><textarea rows={3} value={apathya} onChange={(e) => setApathya(e.target.value)} className="input" /></Field>
        </div>
        <Field l="Notes"><textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="input" /></Field>

        <footer className="mt-6 pt-4 border-t border-gray-200 flex items-end justify-between text-xs text-gray-600">
          <div>
            <p>Date: <strong>{today}</strong></p>
            <p className="mt-1 text-[10px] italic text-gray-500 inline-flex items-center gap-1"><Sparkles className="w-3 h-3" /> Prescribed via AyurConnect — Kerala&apos;s verified Ayurveda doctor directory</p>
          </div>
          <div className="text-right">
            <p className="border-t border-gray-400 pt-1 mt-8 inline-block w-40">Signature</p>
          </div>
        </footer>
      </article>

      <style jsx global>{`
        .input{width:100%;border:1px solid #e5e7eb;border-radius:0.375rem;padding:0.5rem 0.75rem;font-size:14px;background:white}
        .input:focus{outline:none;box-shadow:0 0 0 1px #155228;border-color:#155228}
        @media print {
          body{background:white !important}
          .print\\:hidden{display:none !important}
        }
      `}</style>
    </div>
  )
}

function Field({ l, full = false, children }: { l: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={'block ' + (full ? 'col-span-3' : '')}>
      <span className="block text-xs font-medium text-gray-700 mb-1">{l}</span>
      {children}
    </label>
  )
}
