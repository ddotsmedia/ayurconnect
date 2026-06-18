'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, ArrowRight, Sparkles, RotateCcw } from 'lucide-react'
import type { Mcq } from '../_data'

export function PracticeClient({ questions }: { questions: Mcq[] }) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<'A'|'B'|'C'|'D'|null>(null)
  const [score, setScore] = useState(0)
  const [wrong, setWrong] = useState<number[]>([])
  const done = i >= questions.length

  function choose(opt: 'A'|'B'|'C'|'D') { if (picked) return; setPicked(opt); if (opt === questions[i].correct) setScore((s) => s + 1); else setWrong((w) => [...w, i]) }
  function next() { setPicked(null); setI((x) => x + 1) }
  function restart() { setI(0); setPicked(null); setScore(0); setWrong([]) }

  if (questions.length === 0) return <p className="text-sm text-gray-600 text-center">No questions match that filter.</p>

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="bg-white border border-gray-100 rounded-card p-6 shadow-card text-center">
        <Sparkles className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="font-serif text-2xl text-ink mt-3">Practice complete</h2>
        <p className="text-3xl font-bold text-kerala-700 mt-2">{score} / {questions.length}</p>
        <p className="text-sm text-gray-700 mt-1">{pct}% accuracy</p>
        <p className="text-xs text-gray-500 mt-2">{wrong.length} incorrect · review explanations below</p>
        <button onClick={restart} className="mt-5 inline-flex items-center gap-1 px-4 py-2 bg-kerala-700 text-white rounded text-sm font-semibold"><RotateCcw className="w-4 h-4" /> Practice again</button>
        {wrong.length > 0 && (
          <details className="mt-6 text-left">
            <summary className="text-sm cursor-pointer text-kerala-700">Review {wrong.length} incorrect answer{wrong.length === 1 ? '' : 's'}</summary>
            <ul className="mt-3 space-y-3 text-sm">
              {wrong.map((idx) => {
                const q = questions[idx]
                return (
                  <li key={idx} className="bg-rose-50 border border-rose-100 rounded p-3">
                    <p className="font-semibold text-rose-900">{q.question}</p>
                    <p className="text-xs text-rose-800 mt-1">Correct: <strong>{q.correct}</strong> — {q.options[q.correct]}</p>
                    <p className="text-xs text-gray-700 mt-2">{q.explanation}</p>
                  </li>
                )
              })}
            </ul>
          </details>
        )}
      </div>
    )
  }

  const q = questions[i]
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between text-xs">
        <span className="text-gray-600">Question <strong>{i + 1}</strong> of {questions.length}</span>
        <span className="text-gray-600">Score: <strong className="text-kerala-700">{score}</strong></span>
      </header>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-kerala-700 transition-all" style={{ width: `${((i + 1) / questions.length) * 100}%` }} /></div>

      <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{q.subjectSlug} · {q.difficulty}</p>
        <p className="font-serif text-lg text-ink mt-2">{q.question}</p>
        <div className="mt-4 space-y-2">
          {(['A','B','C','D'] as const).map((opt) => {
            const isCorrect = opt === q.correct
            const isPicked = picked === opt
            const showCorrectness = picked !== null
            return (
              <button
                key={opt}
                onClick={() => choose(opt)}
                disabled={picked !== null}
                className={'w-full text-left px-3 py-2.5 border rounded transition-colors text-sm flex items-center gap-2 ' + (
                  !showCorrectness ? 'bg-white border-gray-200 hover:border-kerala-300 hover:bg-kerala-50'
                  : isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : isPicked ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-white border-gray-100 text-gray-500'
                )}
              >
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold flex-shrink-0">{opt}</span>
                <span className="flex-1">{q.options[opt]}</span>
                {showCorrectness && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {showCorrectness && isPicked && !isCorrect && <XCircle className="w-4 h-4 text-rose-600" />}
              </button>
            )
          })}
        </div>
        {picked !== null && (
          <div className={'mt-4 p-3 rounded text-sm ' + (picked === q.correct ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-rose-50 border border-rose-200 text-rose-900')}>
            <p className="font-semibold mb-1">{picked === q.correct ? 'Correct ✓' : 'Incorrect ✗'}</p>
            <p className="text-xs">{q.explanation}</p>
            {q.reference && <p className="text-[10px] text-gray-600 mt-1">Reference: {q.reference}</p>}
          </div>
        )}
        {picked !== null && (
          <button onClick={next} className="mt-4 w-full inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold">
            {i + 1 < questions.length ? <>Next question <ArrowRight className="w-4 h-4" /></> : 'See results'}
          </button>
        )}
      </article>
    </div>
  )
}
