'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { MessageCircle, RotateCw, Flame, CheckCircle2, XCircle } from 'lucide-react'
import type { Mcq } from '../mcq/_data'

type Streak = { lastDate: string; current: number; longest: number }
const STREAK_KEY = 'dc-streak'
const ANSWERS_KEY_PREFIX = 'dc-answers-'

export function DailyChallengeClient({ set, dateStr }: { set: Mcq[]; dateStr: string }) {
  const [picks, setPicks] = useState<Array<'A' | 'B' | 'C' | 'D' | null>>(set.map(() => null))
  const [revealed, setRevealed] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(600)
  const [streak, setStreak] = useState<Streak>({ lastDate: '', current: 0, longest: 0 })

  // restore prior submission for today (so reloading the page shows the result)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ANSWERS_KEY_PREFIX + dateStr)
      if (raw) {
        const arr = JSON.parse(raw) as Array<'A' | 'B' | 'C' | 'D' | null>
        if (Array.isArray(arr) && arr.length === set.length) { setPicks(arr); setRevealed(true) }
      }
      const s = window.localStorage.getItem(STREAK_KEY)
      if (s) setStreak(JSON.parse(s))
    } catch {}
  }, [dateStr, set.length])

  // countdown — only when not revealed
  useEffect(() => {
    if (revealed) return
    const t = window.setInterval(() => setSecondsLeft((x) => Math.max(0, x - 1)), 1000)
    return () => window.clearInterval(t)
  }, [revealed])

  useEffect(() => { if (!revealed && secondsLeft === 0) submit() }, [secondsLeft, revealed])

  const score = useMemo(() => picks.reduce((a, p, i) => a + (p === set[i].correct ? 1 : 0), 0), [picks, set])

  function submit() {
    setRevealed(true)
    try {
      window.localStorage.setItem(ANSWERS_KEY_PREFIX + dateStr, JSON.stringify(picks))
      // streak: if lastDate was yesterday, +1; if today, no-op; else reset.
      const last = streak.lastDate ? new Date(streak.lastDate) : null
      const today = new Date(dateStr)
      let current = streak.current
      if (!last) current = 1
      else if (last.toISOString().slice(0, 10) === dateStr) current = streak.current || 1
      else {
        const diff = Math.round((today.getTime() - last.getTime()) / 86_400_000)
        current = diff === 1 ? streak.current + 1 : 1
      }
      const next: Streak = { lastDate: dateStr, current, longest: Math.max(streak.longest, current) }
      window.localStorage.setItem(STREAK_KEY, JSON.stringify(next))
      setStreak(next)
    } catch {}
  }

  function shareUrl(): string {
    const text = `I scored ${score}/${set.length} on today's AyurConnect AIAPGET Challenge! Try it: https://ayurconnect.com/learn/daily-challenge`
    return `https://wa.me/?text=${encodeURIComponent(text)}`
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between bg-white border border-gray-100 rounded-card p-3 mb-5">
        <div className="text-sm">
          {streak.current > 0 ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700"><Flame className="w-4 h-4" /> {streak.current}-day streak</span>
          ) : (
            <span className="text-gray-500">Start a streak today</span>
          )}
          {streak.longest > streak.current && <span className="ml-3 text-xs text-gray-500">Longest: {streak.longest}</span>}
        </div>
        {!revealed && <div className="text-sm font-mono text-kerala-700">{String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}</div>}
        {revealed && <div className="text-sm font-semibold text-kerala-800">Score: {score}/{set.length}</div>}
      </div>

      <ol className="space-y-5">
        {set.map((q, i) => {
          const picked = picks[i]
          const correct = q.correct
          return (
            <li key={q.id} className="bg-white border border-gray-100 rounded-card p-4">
              <p className="font-semibold text-ink"><span className="text-kerala-700 mr-2">{i + 1}.</span>{q.question}</p>
              <div className="mt-3 grid gap-2">
                {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                  const isPicked = picked === opt
                  const isCorrect = revealed && opt === correct
                  const isWrong = revealed && isPicked && opt !== correct
                  return (
                    <button
                      key={opt}
                      disabled={revealed}
                      onClick={() => setPicks((arr) => arr.map((v, idx) => idx === i ? opt : v))}
                      className={`text-left px-3 py-2 rounded border text-sm transition-colors ${
                        isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : isWrong ? 'bg-rose-50 border-rose-300 text-rose-900'
                        : isPicked ? 'bg-kerala-50 border-kerala-300'
                        : 'bg-white border-gray-200 hover:border-kerala-300'
                      }`}
                    >
                      <span className="font-semibold mr-2">{opt}.</span>{q.options[opt]}
                      {isCorrect && <CheckCircle2 className="w-4 h-4 inline ml-2" />}
                      {isWrong && <XCircle className="w-4 h-4 inline ml-2" />}
                    </button>
                  )
                })}
              </div>
              {revealed && (
                <div className="mt-3 p-3 bg-cream/60 border border-gray-100 rounded text-sm text-gray-700">
                  <strong className="text-kerala-800">Explanation:</strong> {q.explanation}
                  {q.reference && <p className="mt-1 text-xs text-gray-500">Reference: {q.reference}</p>}
                </div>
              )}
            </li>
          )
        })}
      </ol>

      <div className="mt-6 flex flex-wrap gap-2 items-center">
        {!revealed && (
          <button onClick={submit} disabled={picks.some((p) => !p)} className="px-5 py-2 bg-kerala-700 text-white text-sm font-semibold rounded disabled:opacity-50">
            Submit answers
          </button>
        )}
        {revealed && (
          <>
            <a href={shareUrl()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#25D366] text-white text-sm font-semibold rounded">
              <MessageCircle className="w-4 h-4" /> Share score on WhatsApp
            </a>
            <Link href="/learn/mcq/practice" className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-kerala-700 text-kerala-700 text-sm font-semibold rounded">
              More practice
            </Link>
            <button onClick={() => { setPicks(set.map(() => null)); setRevealed(false); setSecondsLeft(600); try { window.localStorage.removeItem(ANSWERS_KEY_PREFIX + dateStr) } catch {} }} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-kerala-700">
              <RotateCw className="w-4 h-4" /> Retry
            </button>
          </>
        )}
      </div>
    </div>
  )
}
