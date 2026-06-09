'use client'

// Consult Co-Pilot (Phase 7) — doctor strictly in the loop.
// 1. Paste raw pre-consult intake → AI structures a classical case sheet.
// 2. Generate a DRAFT prescription scaffold from the (editable) case summary.
// 3. Edit the draft into a final, then record the draft→final audit trail.

import { useState } from 'react'
import { Loader2, Sparkles, AlertCircle, Stethoscope, FileText, ClipboardCheck, ShieldCheck } from 'lucide-react'

type CaseSheet = Record<string, unknown>
type Draft = {
  draftLabel: string
  items: Array<{ dravya: string; form: string; matra: string; anupana: string; kala: string; duration: string; rationale: string }>
  pathyaApathya?: { pathya?: string[]; apathya?: string[] }
  lifestyle?: string[]
  followUp?: string
  cautions?: string[]
  disclaimer?: string
}

export default function CoPilotPage() {
  const [intake, setIntake] = useState('')
  const [caseSheet, setCaseSheet] = useState<CaseSheet | null>(null)
  const [caseSummary, setCaseSummary] = useState('')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [finalRx, setFinalRx] = useState('')
  const [patientRef, setPatientRef] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [savedAudit, setSavedAudit] = useState<string | null>(null)

  async function structureIntake() {
    if (intake.trim().length < 10) { setErr('Paste the intake (min 10 chars).'); return }
    setBusy('intake'); setErr(null)
    try {
      const r = await fetch('/api/dr/copilot/intake', {
        method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ intake: intake.trim() }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`)
      setCaseSheet(j.caseSheet)
      setCaseSummary(JSON.stringify(j.caseSheet, null, 2))
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy(null) }
  }

  async function generateDraft() {
    if (caseSummary.trim().length < 10) { setErr('Provide a case summary first.'); return }
    setBusy('draft'); setErr(null)
    try {
      const r = await fetch('/api/dr/copilot/prescription', {
        method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ caseSummary: caseSummary.trim() }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`)
      setDraft(j.draft)
      setFinalRx(JSON.stringify(j.draft, null, 2))
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy(null) }
  }

  async function finalize() {
    if (!draft) { setErr('Generate a draft first.'); return }
    setBusy('finalize'); setErr(null); setSavedAudit(null)
    try {
      let finalParsed: unknown = finalRx
      try { finalParsed = JSON.parse(finalRx) } catch { /* keep as text */ }
      const r = await fetch('/api/dr/copilot/finalize', {
        method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ draft, final: finalParsed, patientRef: patientRef.trim() || undefined }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`)
      setSavedAudit(j.auditId)
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setBusy(null) }
  }

  const ta = 'w-full rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-kerala-300'

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-1">
        <Stethoscope className="w-6 h-6 text-kerala-700" />
        <h1 className="font-serif text-2xl text-kerala-800">Consult Co-Pilot</h1>
      </div>
      <p className="text-gray-600 mb-6 text-sm">
        AI assistance with you in the loop. The AI structures intake and drafts a prescription
        scaffold; <strong>you review, edit and issue the final prescription</strong>. Every draft→final
        is logged for audit. Do not paste patient-identifying details.
      </p>

      {err && <p className="mb-4 text-sm text-red-600 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {err}</p>}

      {/* Step 1 — intake */}
      <section className="rounded-2xl border border-kerala-100 bg-white p-5 shadow-card mb-6">
        <h2 className="font-semibold flex items-center gap-2 mb-3"><FileText className="w-5 h-5 text-kerala-600" /> 1. Structure intake</h2>
        <textarea value={intake} onChange={(e) => setIntake(e.target.value)} rows={5} className={ta}
          placeholder="Paste the patient's pre-consult intake: chief complaint, history, current meds, Ashtavidha-pariksha notes…" />
        <button onClick={structureIntake} disabled={busy === 'intake'}
          className="mt-3 inline-flex items-center gap-2 bg-kerala-700 text-white font-semibold px-4 py-2 rounded-xl hover:bg-kerala-800 disabled:opacity-60">
          {busy === 'intake' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Structure case sheet
        </button>
        {caseSheet && (
          <div className="mt-4">
            <label className="text-xs uppercase tracking-wide text-gray-500">Case sheet (editable)</label>
            <textarea value={caseSummary} onChange={(e) => setCaseSummary(e.target.value)} rows={10} className={`${ta} mt-1`} />
          </div>
        )}
      </section>

      {/* Step 2 — draft prescription */}
      <section className="rounded-2xl border border-kerala-100 bg-white p-5 shadow-card mb-6">
        <h2 className="font-semibold flex items-center gap-2 mb-3"><ClipboardCheck className="w-5 h-5 text-kerala-600" /> 2. Draft prescription</h2>
        <button onClick={generateDraft} disabled={busy === 'draft' || !caseSummary}
          className="inline-flex items-center gap-2 bg-kerala-700 text-white font-semibold px-4 py-2 rounded-xl hover:bg-kerala-800 disabled:opacity-60">
          {busy === 'draft' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate draft scaffold
        </button>
        {draft && (
          <>
            <p className="mt-3 inline-block rounded-full bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1">
              {draft.draftLabel ?? 'DRAFT — review required'}
            </p>
            <div className="mt-3 space-y-2">
              {draft.items?.map((it, i) => (
                <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm">
                  <p className="font-medium text-gray-900">{it.dravya} <span className="text-gray-500">({it.form})</span></p>
                  <p className="text-gray-600">{it.matra} · anupana: {it.anupana} · {it.kala} · {it.duration}</p>
                  {it.rationale && <p className="text-gray-500 italic mt-0.5">{it.rationale}</p>}
                </div>
              ))}
            </div>
            {draft.cautions && draft.cautions.length > 0 && (
              <p className="mt-2 text-sm text-red-700">Cautions to verify: {draft.cautions.join('; ')}</p>
            )}
            <label className="block text-xs uppercase tracking-wide text-gray-500 mt-4">Edit into final prescription</label>
            <textarea value={finalRx} onChange={(e) => setFinalRx(e.target.value)} rows={10} className={`${ta} mt-1`} />
          </>
        )}
      </section>

      {/* Step 3 — finalize + audit */}
      <section className="rounded-2xl border border-kerala-100 bg-white p-5 shadow-card">
        <h2 className="font-semibold flex items-center gap-2 mb-3"><ShieldCheck className="w-5 h-5 text-kerala-600" /> 3. Finalize &amp; record audit</h2>
        <input value={patientRef} onChange={(e) => setPatientRef(e.target.value)}
          placeholder="Internal patient reference (non-identifying, e.g. case #)" className="w-full rounded-xl border border-gray-200 px-4 py-2 mb-3 text-sm" />
        <button onClick={finalize} disabled={busy === 'finalize' || !draft}
          className="inline-flex items-center gap-2 bg-kerala-800 text-white font-semibold px-4 py-2 rounded-xl hover:bg-kerala-900 disabled:opacity-60">
          {busy === 'finalize' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Record draft → final
        </button>
        {savedAudit && (
          <p className="mt-3 text-sm text-emerald-700">Audit recorded (id: {savedAudit}). The AI draft and your final version are now on the audit trail.</p>
        )}
        <p className="mt-3 text-xs text-gray-500">
          The prescribing doctor is solely responsible for the final prescription. AI output is a draft aid only.
        </p>
      </section>
    </div>
  )
}
