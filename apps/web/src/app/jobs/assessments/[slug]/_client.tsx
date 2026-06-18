'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Award, Clock, ArrowRight, CheckCircle2, XCircle, Sparkles, Printer } from 'lucide-react'
import type { Assessment } from '../_data'

export function AssessmentClient({ assessment }: { assessment: Assessment }) {
  const [started, setStarted] = useState(false)
  const [cur, setCur] = useState(0)
  const [answers, setAnswers] = useState<Record<number, 'A'|'B'|'C'|'D'>>({})
  const [submitted, setSubmitted] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(assessment.durationMin * 60)
  const [name, setName] = useState('')

  useEffect(() => {
    if (!started || submitted) return
    const t = window.setInterval(() => setSecondsLeft((s) => { if (s <= 1) { setSubmitted(true); return 0 } return s - 1 }), 1000)
    return () => window.clearInterval(t)
  }, [started, submitted])

  function score() {
    let s = 0
    for (let i = 0; i < assessment.questions.length; i++) if (answers[i] === assessment.questions[i].correct) s++
    return s
  }
  function pct() { return Math.round((score() / assessment.questions.length) * 100) }
  const passed = pct() >= assessment.passingScore

  if (!started) {
    return (
      <article className="bg-white border border-gray-100 rounded-card p-6 shadow-card space-y-4">
        <p className="text-gray-800">{assessment.description}</p>
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1">Rules</p>
          <ul className="space-y-1 text-sm text-gray-700">{assessment.rules.map((r, i) => <li key={i}>• {r}</li>)}</ul>
        </div>
        <label className="block">
          <span className="block text-xs font-medium text-gray-700 mb-1">Your name (will appear on certificate)</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Your Name" className="w-full border border-gray-200 rounded px-3 py-2 text-sm" />
        </label>
        <button onClick={() => setStarted(true)} disabled={!name.trim()} className="w-full inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold disabled:opacity-50">Start assessment <ArrowRight className="w-4 h-4" /></button>
      </article>
    )
  }

  if (submitted) {
    const total = assessment.questions.length
    const correctCount = score()
    return (
      <div className="space-y-5">
        <article className={'rounded-card p-6 shadow-card text-center border ' + (passed ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200')}>
          {passed ? <Sparkles className="w-12 h-12 text-amber-500 mx-auto" /> : <XCircle className="w-12 h-12 text-rose-600 mx-auto" />}
          <h2 className="font-serif text-2xl text-ink mt-2">{passed ? 'Congratulations — you passed!' : 'Did not pass this time'}</h2>
          <p className="text-3xl font-bold text-kerala-700 mt-2">{correctCount} / {total}</p>
          <p className="text-sm text-gray-700 mt-1">{pct()}% · Pass mark: {assessment.passingScore}%</p>
          {passed && (
            <a href={`#certificate`} className="mt-4 inline-flex items-center gap-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm font-semibold"><Award className="w-4 h-4" /> View certificate</a>
          )}
        </article>

        {passed && (
          <article id="certificate" className="bg-white border-4 border-amber-300 rounded-card p-8 shadow-cardLg text-center print:shadow-none">
            <p className="text-[10px] uppercase tracking-[0.3em] text-amber-700 font-bold">AyurConnect Certified</p>
            <Award className="w-14 h-14 text-amber-500 mx-auto mt-3" />
            <p className="text-sm text-gray-700 mt-4">This certificate is awarded to</p>
            <p className="font-serif text-3xl text-kerala-800 mt-2">{name}</p>
            <p className="text-sm text-gray-700 mt-4">for successfully completing</p>
            <p className="font-serif text-xl text-ink mt-1">{assessment.name}</p>
            <p className="text-xs text-gray-600 mt-3">Score: {pct()}% · {assessment.specialization} · {assessment.difficulty}</p>
            <p className="text-[10px] text-gray-500 mt-6">AyurConnect · Kerala&apos;s Ayurveda Platform · ayurconnect.com</p>
            <button onClick={() => window.print()} className="mt-4 print:hidden inline-flex items-center gap-1 px-4 py-2 bg-kerala-700 text-white rounded text-xs"><Printer className="w-3.5 h-3.5" /> Print / Save PDF</button>
          </article>
        )}

        <details className="text-sm">
          <summary className="cursor-pointer text-kerala-700 font-semibold">Review answers</summary>
          <ul className="mt-3 space-y-2">
            {assessment.questions.map((q, i) => {
              const a = answers[i]; const correct = a === q.correct
              return (
                <li key={i} className={'border rounded p-3 ' + (a == null ? 'bg-gray-50 border-gray-200' : correct ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200')}>
                  <p className="font-semibold text-ink">Q{i + 1}. {q.q}</p>
                  <p className="text-xs mt-1">Your answer: <strong>{a ?? '—'}</strong> · Correct: <strong>{q.correct}</strong> — {q.options[q.correct]}</p>
                  <p className="text-xs text-gray-700 mt-1">{q.explanation}</p>
                </li>
              )
            })}
          </ul>
        </details>

        {!passed && <Link href={`/jobs/assessments/${assessment.slug}`} className="inline-block text-sm text-kerala-700 hover:underline">Retake assessment →</Link>}
      </div>
    )
  }

  const q = assessment.questions[cur]
  const min = Math.floor(secondsLeft / 60); const sec = secondsLeft % 60
  return (
    <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card space-y-4">
      <header className="flex items-center justify-between text-xs">
        <span className="text-gray-600">Q <strong>{cur + 1}</strong> / {assessment.questions.length}</span>
        <span className={'font-mono px-2 py-0.5 rounded ' + (secondsLeft < 60 ? 'bg-rose-50 text-rose-800' : 'bg-gray-100 text-gray-700')}><Clock className="w-3 h-3 inline mr-1" /> {min}:{String(sec).padStart(2, '0')}</span>
      </header>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-kerala-700" style={{ width: `${((cur + 1) / assessment.questions.length) * 100}%` }} /></div>
      <p className="font-serif text-lg text-ink">{q.q}</p>
      <div className="space-y-2">
        {(['A','B','C','D'] as const).map((opt) => {
          const picked = answers[cur] === opt
          return (
            <button key={opt} onClick={() => setAnswers((a) => ({ ...a, [cur]: opt }))} className={'w-full text-left px-3 py-2.5 border rounded text-sm flex items-center gap-2 ' + (picked ? 'bg-kerala-50 border-kerala-300' : 'bg-white border-gray-200 hover:border-kerala-300')}>
              <span className={'w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 ' + (picked ? 'bg-kerala-700 text-white border-kerala-700' : 'border-current')}>{opt}</span>
              <span className="flex-1">{q.options[opt]}</span>
            </button>
          )
        })}
      </div>
      <div className="flex items-center justify-end gap-2">
        {cur + 1 < assessment.questions.length
          ? <button onClick={() => setCur((c) => c + 1)} disabled={!answers[cur]} className="px-4 py-2 bg-kerala-700 text-white rounded text-sm font-semibold disabled:opacity-50">Next →</button>
          : <button onClick={() => { if (confirm('Submit assessment?')) setSubmitted(true) }} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm font-semibold">Submit</button>}
      </div>
    </article>
  )
}
