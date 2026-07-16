'use client'

import { useState } from 'react'
import { Sparkles, ChevronDown, RefreshCw, AlertCircle, MessageSquare } from 'lucide-react'

const SPECS  = ['General BAMS', 'Kayachikitsa', 'Panchakarma', 'Prasuti & Stree Roga', 'Kaumarabhritya', 'Shalya Tantra', 'Shalakya Tantra', 'Rasashastra', 'Dravyaguna', 'Swasthavritta']
const LEVELS = [
  { v: 'fresher',    label: 'Fresher (0-2 years)' },
  { v: 'junior',     label: 'Junior (2-5 years)' },
  { v: 'senior',     label: 'Senior (5+ years)' },
]

const CAT_TONE: Record<string, string> = {
  clinical:   'bg-kerala-50 text-kerala-800 border-kerala-200',
  practical:  'bg-amber-50 text-amber-800 border-amber-200',
  philosophy: 'bg-purple-50 text-purple-800 border-purple-200',
  behavioral: 'bg-blue-50 text-blue-800 border-blue-200',
}

type Q = { category: string; question: string; modelAnswer: string }

export function InterviewGenerator() {
  const [specialization, setSpec] = useState(SPECS[0])
  const [level, setLevel]         = useState(LEVELS[0].v)
  const [state, setState]         = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [questions, setQuestions] = useState<Q[]>([])
  const [openIdx, setOpenIdx]     = useState<number | null>(0)
  const [error, setError]         = useState<string | null>(null)

  async function generate() {
    setState('loading'); setError(null); setQuestions([])
    try {
      const rsp = await fetch('/api/jobs-portal/ai/interview-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialization, level }),
      })
      const j = await rsp.json()
      if (!rsp.ok || !j.ok) throw new Error(j.error || `HTTP ${rsp.status}`)
      const list = Array.isArray(j.questions) ? j.questions.filter((x: unknown) => x && typeof (x as Q).question === 'string') : []
      setQuestions(list); setState('done'); setOpenIdx(0)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e)); setState('error')
    }
  }

  function whatsappShare() {
    if (!questions.length) return
    const text = questions.map((q, i) => `Q${i + 1} [${q.category}] ${q.question}\n→ ${q.modelAnswer}`).join('\n\n')
    const url = `https://wa.me/?text=${encodeURIComponent(`Ayurveda Interview Questions — ${specialization} (${level})\n\n${text}\n\nfrom ayurconnect.com/jobs/interview-questions`)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div>
      <div className="bg-white border border-gray-100 rounded-card p-5 shadow-card grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
        <div>
          <label className="block text-[10px] font-semibold text-kerala-700 uppercase tracking-wider mb-1">Specialization</label>
          <select value={specialization} onChange={(e) => setSpec(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-kerala-300">
            {SPECS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-kerala-700 uppercase tracking-wider mb-1">Experience level</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-kerala-300">
            {LEVELS.map((l) => <option key={l.v} value={l.v}>{l.label}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={generate}
            disabled={state === 'loading'}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 disabled:opacity-60 text-white text-sm font-semibold rounded"
          >
            {state === 'loading'
              ? (<><RefreshCw className="w-4 h-4 animate-spin" /> Generating…</>)
              : (<><Sparkles className="w-4 h-4" /> Generate 10 questions</>)}
          </button>
        </div>
      </div>

      {state === 'error' && (
        <div className="mt-4 bg-rose-50 border border-rose-200 rounded-card p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-700 flex-shrink-0" />
          <div className="text-sm text-rose-900">Failed to generate questions: {error}</div>
        </div>
      )}

      {state === 'done' && questions.length > 0 && (
        <>
          <div className="mt-5 flex flex-wrap gap-2 items-center">
            <p className="text-sm text-gray-700 flex-1">Generated <strong>{questions.length}</strong> questions for <strong>{specialization}</strong> · {level}</p>
            <button onClick={whatsappShare} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#25a75a] hover:bg-[#1f8f4a] text-white font-semibold rounded">
              <MessageSquare className="w-3.5 h-3.5" /> Share on WhatsApp
            </button>
            <button onClick={() => window.print()} className="text-xs px-3 py-1.5 border border-gray-200 text-gray-700 hover:border-kerala-300 font-semibold rounded">Print / Save PDF</button>
          </div>

          <ul className="mt-4 space-y-3">
            {questions.map((q, i) => {
              const open = openIdx === i
              const tone = CAT_TONE[q.category] ?? CAT_TONE.behavioral
              return (
                <li key={i}>
                  <div className="bg-white border border-gray-100 rounded-card overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenIdx(open ? null : i)}
                      aria-expanded={open}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-kerala-50/40"
                    >
                      <span className="w-7 h-7 rounded-full bg-kerala-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${tone}`}>{q.category}</span>
                        <p className="font-serif text-base text-ink mt-1 leading-snug">{q.question}</p>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-kerala-700 flex-shrink-0 mt-1 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {open && (
                      <div className="px-4 pb-4 pt-1 border-t border-gray-100">
                        <p className="text-[10px] uppercase tracking-wider text-kerala-700 font-semibold mt-2">Model answer</p>
                        <p className="text-sm text-gray-800 mt-1 leading-relaxed whitespace-pre-line">{q.modelAnswer}</p>
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}

      {state === 'idle' && (
        <p className="mt-5 text-xs text-gray-600 text-center">Choose a specialization and level, then click <strong>Generate 10 questions</strong>. Model answers cite classical texts (Charaka, Sushruta, Ashtanga Hridaya) where relevant.</p>
      )}
    </div>
  )
}
