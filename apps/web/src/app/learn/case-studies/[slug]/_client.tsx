'use client'

import { useState } from 'react'
import { Eye, EyeOff, Stethoscope } from 'lucide-react'
import type { CaseStudy } from '../_data'

const SECTIONS = [
  { key: 'examination',       label: 'Examination Findings' },
  { key: 'guess',             label: 'Your Assessment (self-test)' },
  { key: 'ayurvedicAssessment', label: 'Ayurvedic Assessment' },
  { key: 'diagnosis',         label: 'Diagnosis' },
  { key: 'treatmentPlan',     label: 'Treatment Plan' },
  { key: 'outcome',           label: 'Outcome' },
  { key: 'discussion',        label: 'Discussion + Learning Points' },
] as const

export function ProgressiveClient({ caseStudy }: { caseStudy: CaseStudy }) {
  const [open, setOpen] = useState<Set<string>>(new Set())
  const [guess, setGuess] = useState('')
  function toggle(k: string) { setOpen((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n }) }
  return (
    <article className="space-y-4">
      {/* Always visible: patient presentation */}
      <section className="bg-white border border-kerala-200 rounded-card p-5 shadow-card">
        <h2 className="font-serif text-xl text-ink inline-flex items-center gap-2"><Stethoscope className="w-5 h-5 text-kerala-700" /> Patient presentation</h2>
        <p className="text-sm text-gray-800 mt-2"><strong>Chief complaint:</strong> {caseStudy.chiefComplaint}</p>
        <p className="text-sm text-gray-800 mt-3"><strong>History:</strong> {caseStudy.history}</p>
      </section>

      {SECTIONS.map((s) => {
        const isOpen = open.has(s.key)
        if (s.key === 'guess') {
          return (
            <section key={s.key} className="bg-amber-50 border border-amber-200 rounded-card p-5">
              <h2 className="font-serif text-lg text-amber-900">{s.label}</h2>
              <p className="text-xs text-amber-800 mt-1">Before revealing the answer, write what you think the diagnosis + treatment approach is. Optional but helpful for self-testing.</p>
              <textarea value={guess} onChange={(e) => setGuess(e.target.value)} rows={3} placeholder="Your diagnosis and treatment approach…" className="mt-2 w-full border border-amber-300 rounded p-2 text-sm" />
            </section>
          )
        }
        const content = (caseStudy as unknown as Record<string, string>)[s.key]
        if (!content) return null
        return (
          <section key={s.key} className="bg-white border border-gray-100 rounded-card shadow-card">
            <button onClick={() => toggle(s.key)} className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-cream">
              <h2 className="font-serif text-lg text-ink">{s.label}</h2>
              <span className="text-xs text-kerala-700 inline-flex items-center gap-1">{isOpen ? <><EyeOff className="w-3.5 h-3.5" /> Hide</> : <><Eye className="w-3.5 h-3.5" /> Reveal</>}</span>
            </button>
            {isOpen && <div className="px-5 pb-5 text-sm text-gray-800 whitespace-pre-line border-t border-gray-100 pt-3">{content}</div>}
          </section>
        )
      })}
    </article>
  )
}
