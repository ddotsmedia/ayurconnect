'use client'

// Prescriptions index — different view for patients vs doctors. Both call
// /api/prescriptions/me and /api/prescriptions/by-me; whichever returns rows
// wins. Doctors also get a "Write new prescription" CTA pointing into the
// per-appointment screen (where patient context is already loaded).

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Calendar, User as UserIcon, Eye, Pill, Loader2 } from 'lucide-react'

type Item = { id: string; medication: string; dose: string; frequency: string; duration: string | null }
type Prescription = {
  id: string
  patientId: string
  doctorId: string
  appointmentId: string | null
  issuedAt: string
  status: 'active' | 'completed' | 'cancelled'
  diagnosis: string | null
  followUpAfterWeeks: number | null
  items: Item[]
  patient?: { id: string; name: string | null; email: string }
  doctor?: { id: string; name: string | null; email: string; ownedDoctor?: { specialization: string; qualification: string | null } | null }
}

const STATUS_TONE: Record<string, string> = {
  active:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-gray-100 text-gray-700 border-gray-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}

export default function PrescriptionsPage() {
  const [asPatient, setAsPatient] = useState<Prescription[]>([])
  const [asDoctor, setAsDoctor] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [pRes, dRes] = await Promise.all([
          fetch('/api/prescriptions/me',    { credentials: 'include' }),
          fetch('/api/prescriptions/by-me', { credentials: 'include' }),
        ])
        if (!cancelled) {
          if (pRes.ok) setAsPatient(((await pRes.json()) as { prescriptions: Prescription[] }).prescriptions ?? [])
          if (dRes.ok) setAsDoctor(((await dRes.json()) as { prescriptions: Prescription[] }).prescriptions ?? [])
        }
      } catch (e) { if (!cancelled) setError(String(e)) }
      finally    { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-500">Loading…</div>

  const renderList = (label: string, list: Prescription[], side: 'patient' | 'doctor') => {
    if (list.length === 0) return null
    return (
      <section>
        <h2 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3">{label}</h2>
        <div className="space-y-3">
          {list.map((rx) => {
            const other = side === 'patient'
              ? `Dr ${rx.doctor?.name ?? '—'}${rx.doctor?.ownedDoctor?.specialization ? ` · ${rx.doctor.ownedDoctor.specialization}` : ''}`
              : (rx.patient?.name ?? rx.patient?.email ?? '—')
            return (
              <Link
                key={rx.id}
                href={`/dashboard/prescriptions/${rx.id}`}
                className="block bg-white border border-gray-100 rounded-card p-4 shadow-card hover:shadow-cardLg transition-shadow"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5"><UserIcon className="w-3 h-3" /> {other}</p>
                    <h3 className="font-semibold text-ink mt-1">{rx.diagnosis ?? 'Prescription'}</h3>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_TONE[rx.status] ?? 'bg-gray-50 text-gray-600'}`}>{rx.status}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {rx.items.slice(0, 4).map((it) => (
                    <span key={it.id} className="px-2 py-0.5 text-[10px] bg-kerala-50 text-kerala-700 rounded-full">
                      <Pill className="w-2.5 h-2.5 inline mr-0.5" /> {it.medication}
                    </span>
                  ))}
                  {rx.items.length > 4 && <span className="text-[10px] text-gray-400 px-1">+{rx.items.length - 4} more</span>}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(rx.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="inline-flex items-center gap-1.5 text-kerala-700"><Eye className="w-3 h-3" /> View</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-ink">Prescriptions</h1>
        <p className="text-sm text-muted mt-1">Active and past prescriptions. Tap one for the full Rx and print option.</p>
      </header>

      {error && <div className="p-3 rounded bg-red-50 border border-red-100 text-red-800 text-sm">{error}</div>}

      {asPatient.length === 0 && asDoctor.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-card">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-muted">No prescriptions yet.</p>
          <p className="text-xs text-gray-400 mt-2">After your next consultation, your doctor will share the Rx here.</p>
        </div>
      ) : (
        <>
          {renderList('Issued to you', asPatient, 'patient')}
          {renderList('Authored by you', asDoctor, 'doctor')}
        </>
      )}
    </div>
  )
}
