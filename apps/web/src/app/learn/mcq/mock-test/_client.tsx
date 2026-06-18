'use client'

import { useEffect, useState } from 'react'
import { Clock, CheckCircle2, XCircle, Flag } from 'lucide-react'
import type { Mcq } from '../_data'

export function MockTestClient({ questions }: { questions: Mcq[] }) {
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState<Record<number, 'A'|'B'|'C'|'D'>>({})
  const [marked, setMarked] = useState<Set<number>>(new Set())
  const [cur, setCur] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(120 * 60)

  useEffect(() => {
    if (!started || submitted) return
    const t = window.setInterval(() => setSecondsLeft((s) => {
      if (s <= 1) { setSubmitted(true); return 0 }
      return s - 1
    }), 1000)
    return () => window.clearInterval(t)
  }, [started, submitted])

  function pick(i: number, opt: 'A'|'B'|'C'|'D') { setAnswers((a) => ({ ...a, [i]: opt })) }
  function toggleMark(i: number) { setMarked((m) => { const n = new Set(m); if (n.has(i)) n.delete(i); else n.add(i); return n }) }
  function score() {
    let s = 0
    for (let i = 0; i < questions.length; i++) if (answers[i] === questions[i].correct) s++
    return s
  }

  if (!started) {
    return (
      <div className="bg-white border border-gray-100 rounded-card p-6 shadow-card text-center space-y-3">
        <Clock className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="font-serif text-2xl text-ink">Ready to start?</h2>
        <ul className="text-sm text-gray-700 text-left max-w-md mx-auto space-y-1">
          <li>• {questions.length} questions, 120-minute timer</li>
          <li>• Navigate freely between questions</li>
          <li>• Flag for review with the marker icon</li>
          <li>• Submit anytime to see your score</li>
          <li>• No internet required once started (cached)</li>
        </ul>
        <button onClick={() => setStarted(true)} className="mt-4 px-6 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold">Start mock test</button>
      </div>
    )
  }

  if (submitted) {
    const s = score()
    const pct = Math.round((s / questions.length) * 100)
    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-100 rounded-card p-6 shadow-card text-center">
          <h2 className="font-serif text-2xl text-ink">Test complete</h2>
          <p className="text-4xl font-bold text-kerala-700 mt-3">{s} / {questions.length}</p>
          <p className="text-sm text-gray-700 mt-1">{pct}% accuracy</p>
          <p className="text-xs text-gray-500 mt-2">Time taken: {120 - Math.floor(secondsLeft / 60)} min {Math.floor(secondsLeft / 60) > 0 ? `(${Math.floor(secondsLeft / 60)} min remaining unused)` : ''}</p>
        </div>
        <details>
          <summary className="text-sm text-kerala-700 cursor-pointer font-semibold">Review all questions →</summary>
          <ul className="mt-3 space-y-2">
            {questions.map((q, i) => {
              const a = answers[i]
              const correct = a === q.correct
              return (
                <li key={i} className={'border rounded p-3 text-sm ' + (a == null ? 'bg-gray-50 border-gray-200' : correct ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200')}>
                  <p className="font-semibold text-ink">Q{i + 1}. {q.question}</p>
                  <p className="text-xs mt-1">Your answer: <strong>{a ?? '—'}</strong> · Correct: <strong>{q.correct}</strong> — {q.options[q.correct]}</p>
                  <p className="text-xs text-gray-700 mt-1.5">{q.explanation}</p>
                </li>
              )
            })}
          </ul>
        </details>
      </div>
    )
  }

  const q = questions[cur]
  const min = Math.floor(secondsLeft / 60)
  const sec = secondsLeft % 60

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-5">
      <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="text-gray-600">Question <strong>{cur + 1}</strong> of {questions.length}</span>
          <span className={'font-mono px-2 py-0.5 rounded ' + (secondsLeft < 600 ? 'bg-rose-50 text-rose-800' : 'bg-gray-100 text-gray-700')}>
            <Clock className="w-3 h-3 inline mr-1" /> {min}:{String(sec).padStart(2, '0')}
          </span>
        </div>
        <p className="font-serif text-lg text-ink">{q.question}</p>
        <div className="mt-4 space-y-2">
          {(['A','B','C','D'] as const).map((opt) => {
            const picked = answers[cur] === opt
            return (
              <button key={opt} onClick={() => pick(cur, opt)} className={'w-full text-left px-3 py-2.5 border rounded text-sm flex items-center gap-2 ' + (picked ? 'bg-kerala-50 border-kerala-300 text-kerala-900' : 'bg-white border-gray-200 hover:border-kerala-300')}>
                <span className={'w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 ' + (picked ? 'bg-kerala-700 text-white border-kerala-700' : 'border-current')}>{opt}</span>
                <span className="flex-1">{q.options[opt]}</span>
              </button>
            )
          })}
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button onClick={() => toggleMark(cur)} className={'inline-flex items-center gap-1 px-3 py-1.5 border rounded text-xs ' + (marked.has(cur) ? 'bg-amber-100 border-amber-300 text-amber-900' : 'border-gray-200')}>
            <Flag className="w-3 h-3" /> {marked.has(cur) ? 'Marked' : 'Mark for review'}
          </button>
          <div className="flex gap-2">
            <button onClick={() => setCur((c) => Math.max(0, c - 1))} disabled={cur === 0} className="px-3 py-1.5 border border-gray-200 rounded text-xs disabled:opacity-40">Prev</button>
            <button onClick={() => setCur((c) => Math.min(questions.length - 1, c + 1))} disabled={cur === questions.length - 1} className="px-3 py-1.5 bg-kerala-700 text-white rounded text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      </article>

      <aside className="bg-white border border-gray-100 rounded-card p-4 shadow-card lg:sticky lg:top-20 self-start">
        <h3 className="font-serif text-base text-ink mb-2">Navigator</h3>
        <div className="grid grid-cols-5 gap-1.5">
          {questions.map((_, i) => {
            const answered = answers[i] != null
            const isMarked = marked.has(i)
            return (
              <button key={i} onClick={() => setCur(i)} className={'aspect-square text-[10px] rounded font-bold flex items-center justify-center ' + (
                i === cur ? 'bg-kerala-700 text-white' :
                isMarked ? 'bg-amber-200 text-amber-900' :
                answered ? 'bg-emerald-100 text-emerald-800' :
                'bg-gray-100 text-gray-600'
              )}>{i + 1}</button>
            )
          })}
        </div>
        <p className="text-[10px] text-gray-600 mt-3">Answered: <strong>{Object.keys(answers).length}</strong> · Marked: <strong>{marked.size}</strong></p>
        <button onClick={() => { if (confirm('Submit test now?')) setSubmitted(true) }} className="mt-3 w-full inline-flex justify-center items-center gap-1 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-sm font-semibold">Submit test</button>
      </aside>
    </div>
  )
}
