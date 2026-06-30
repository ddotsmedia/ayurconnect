'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { Mcq } from '../../learn/mcq/_data'

export function TodayClient({ mcq, initialStreak }: { mcq: Mcq; initialStreak: { totalPoints: number } | null }) {
  const [pick, setPick] = useState<'A' | 'B' | 'C' | 'D' | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [awarded, setAwarded] = useState(false)

  async function reveal() {
    setRevealed(true)
    if (pick === mcq.correct && !awarded) {
      setAwarded(true)
      void fetch('/api/streak/award', {
        method: 'POST', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'daily_mcq', description: 'MCQ of the day' }),
      }).catch(() => {})
    }
  }

  return (
    <section className="bg-white border border-gray-100 rounded-card p-4">
      <p className="text-[10px] uppercase tracking-wider text-kerala-700">MCQ of the Day</p>
      <p className="font-semibold text-ink mt-1">{mcq.question}</p>
      <div className="mt-3 grid gap-2">
        {(['A', 'B', 'C', 'D'] as const).map((opt) => {
          const isPicked = pick === opt
          const isCorrect = revealed && opt === mcq.correct
          const isWrong = revealed && isPicked && opt !== mcq.correct
          return (
            <button key={opt} disabled={revealed}
                    onClick={() => setPick(opt)}
                    className={`text-left px-3 py-2 rounded border text-sm ${
                      isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : isWrong ? 'bg-rose-50 border-rose-300 text-rose-900'
                      : isPicked ? 'bg-kerala-50 border-kerala-300'
                      : 'bg-white border-gray-200 hover:border-kerala-300'
                    }`}>
              <span className="font-semibold mr-2">{opt}.</span>{mcq.options[opt]}
              {isCorrect && <CheckCircle2 className="w-4 h-4 inline ml-2" />}
              {isWrong && <XCircle className="w-4 h-4 inline ml-2" />}
            </button>
          )
        })}
      </div>
      {!revealed && (
        <button onClick={reveal} disabled={!pick} className="mt-3 px-4 py-1.5 bg-kerala-700 text-white text-sm font-semibold rounded disabled:opacity-50">Reveal answer</button>
      )}
      {revealed && (
        <div className="mt-3 p-3 bg-cream/60 border border-gray-100 rounded text-sm text-gray-700">
          <strong className="text-kerala-800">Explanation:</strong> {mcq.explanation}
          {mcq.reference && <p className="mt-1 text-xs text-gray-500">Reference: {mcq.reference}</p>}
          {awarded && <p className="mt-2 text-xs text-emerald-700 font-semibold">+10 points awarded.</p>}
        </div>
      )}
    </section>
  )
}
