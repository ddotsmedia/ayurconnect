'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronRight, ChevronLeft, Activity, AlertCircle, Heart, Brain, TrendingUp, Moon } from 'lucide-react'
import { QUESTIONS, AXES, type Axis } from './_data/questions'
import { classifyTier, generateReport, TIER_META, type AxisScore } from './_data/report'

type Answers = Record<string, number>  // question id -> score

const AXIS_ICONS: Record<Axis, typeof Brain> = {
  stress:    Brain,
  burnout:   TrendingUp,
  metabolic: Heart,
  sleep:     Moon,
}

export default function WellnessCheckPage() {
  const [intro, setIntro] = useState(true)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [submitted, setSubmitted] = useState(false)

  const current = QUESTIONS[step]
  const progress = (Object.keys(answers).length / QUESTIONS.length) * 100

  const axisScores: AxisScore[] = useMemo(() => {
    return AXES.map(({ key }) => {
      const items = QUESTIONS.filter((q) => q.axis === key)
      let raw = 0
      let max = 0
      for (const q of items) {
        const ans = answers[q.id]
        const optMax = Math.max(...q.options.map((o) => o.score))
        max += optMax
        if (typeof ans === 'number') raw += ans
      }
      const pct = max > 0 ? Math.round((raw / max) * 100) : 0
      return { axis: key, raw, max, pct, tier: classifyTier(pct) }
    })
  }, [answers])

  function pick(score: number) {
    const next = { ...answers, [current.id]: score }
    setAnswers(next)
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      setSubmitted(true)
    }
  }

  function restart() {
    setAnswers({})
    setStep(0)
    setSubmitted(false)
    setIntro(true)
  }

  // ─── Result page ──────────────────────────────────────────────────
  if (submitted) {
    const reports = generateReport(axisScores)
    return (
      <>
        <GradientHero variant="green" size="lg">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
              <Activity className="w-3 h-3" /> Your Wellness Report
            </span>
            <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
              Your <span className="text-gold-400">Wellness</span> Snapshot
            </h1>
            <p className="mt-5 text-white/85 max-w-2xl mx-auto">
              Four axes — stress, burnout, metabolic, sleep — scored from your responses.
              Lower is healthier. Tap any card for tailored Ayurvedic recommendations.
            </p>
          </div>
        </GradientHero>

        <section className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {axisScores.map((s) => {
              const meta = TIER_META[s.tier]
              const Icon = AXIS_ICONS[s.axis]
              const axisLabel = AXES.find((a) => a.key === s.axis)?.label ?? s.axis
              const bgColors: Record<string, string> = {
                emerald: 'bg-emerald-50 border-emerald-200',
                amber:   'bg-amber-50 border-amber-200',
                orange:  'bg-orange-50 border-orange-200',
                rose:    'bg-rose-50 border-rose-200',
              }
              const txtColors: Record<string, string> = {
                emerald: 'text-emerald-700',
                amber:   'text-amber-700',
                orange:  'text-orange-700',
                rose:    'text-rose-700',
              }
              return (
                <div key={s.axis} className={`p-5 rounded-card border ${bgColors[meta.color]}`}>
                  <Icon className={`w-6 h-6 ${txtColors[meta.color]} mb-2`} />
                  <h3 className="font-serif text-lg text-gray-800">{axisLabel}</h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className={`text-3xl font-serif ${txtColors[meta.color]}`}>{s.pct}</span>
                    <span className="text-sm text-gray-500">/ 100 risk</span>
                  </div>
                  <div className={`text-xs uppercase tracking-wider mt-2 font-semibold ${txtColors[meta.color]}`}>{meta.label}</div>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">{meta.description}</p>
                </div>
              )
            })}
          </div>

          <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-6">Detailed recommendations</h2>
          <div className="space-y-5">
            {reports.map((r) => {
              const score = axisScores.find((s) => s.axis === r.axis)!
              const meta = TIER_META[score.tier]
              // Tailwind safelist — these must be literal strings (not template
              // interpolation) so Tailwind's tree-shaker picks them up.
              const badgeCls: Record<string, string> = {
                emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                amber:   'text-amber-700 bg-amber-50 border-amber-200',
                orange:  'text-orange-700 bg-orange-50 border-orange-200',
                rose:    'text-rose-700 bg-rose-50 border-rose-200',
              }
              const helpCls: Record<string, string> = {
                emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
                amber:   'bg-amber-50 border-amber-200 text-amber-900',
                orange:  'bg-orange-50 border-orange-200 text-orange-900',
                rose:    'bg-rose-50 border-rose-200 text-rose-900',
              }
              return (
                <article key={r.axis} className="p-6 bg-white rounded-card border border-gray-100 shadow-card">
                  <header className="mb-4">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <h3 className="font-serif text-xl md:text-2xl text-kerala-700">{r.label}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full border uppercase font-semibold ${badgeCls[meta.color]}`}>
                        {meta.label} · {score.pct}/100
                      </span>
                    </div>
                    <p className="text-sm text-gold-600 italic">{r.tagline}</p>
                  </header>

                  <p className="text-gray-700 leading-relaxed mb-3">{r.summary}</p>
                  <div className="p-4 rounded-md bg-kerala-50 border border-kerala-100 mb-5">
                    <div className="text-xs uppercase tracking-wider text-kerala-700 font-semibold mb-1">Ayurvedic lens</div>
                    <p className="text-sm text-gray-800 italic">{r.ayurvedicLens}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-gold-600 font-semibold mb-2">Lifestyle</h4>
                      <ul className="space-y-1.5 text-sm text-gray-700">
                        {r.recommendations.lifestyle.map((l, i) => <li key={i} className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-kerala-600 mt-0.5 flex-shrink-0" />{l}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-gold-600 font-semibold mb-2">Ayurvedic protocols</h4>
                      <ul className="space-y-1.5 text-sm text-gray-700">
                        {r.recommendations.ayurvedic.map((l, i) => <li key={i} className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-kerala-600 mt-0.5 flex-shrink-0" />{l}</li>)}
                      </ul>
                    </div>
                    <div className="md:col-span-2">
                      <h4 className="text-xs uppercase tracking-wider text-gold-600 font-semibold mb-2">Supportive herbs</h4>
                      <div className="flex flex-wrap gap-2">
                        {r.recommendations.herbs.map((h, i) => <span key={i} className="px-2 py-1 bg-gold-50 border border-gold-200 rounded-full text-xs text-gray-700">{h}</span>)}
                      </div>
                    </div>
                  </div>

                  <div className={`mt-4 p-3 rounded-md text-sm border ${helpCls[meta.color]}`}>
                    <strong>When to seek help:</strong> {r.recommendations.whenToSeekHelp}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="bg-kerala-700 py-14 text-white">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="font-serif text-3xl">Next steps</h2>
            <p className="mt-3 text-white/85">Combine this snapshot with a Prakriti analysis and an AI-personalised diet plan, or speak to a verified Vaidya for a full assessment.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/prakriti-quiz" className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-md font-semibold">Take the Prakriti quiz</Link>
              <Link href="/diet-planner" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/40 text-white hover:bg-white/10 rounded-md font-semibold">Get a diet plan</Link>
              <Link href="/doctors" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/40 text-white hover:bg-white/10 rounded-md font-semibold">Find a Vaidya</Link>
              <button onClick={restart} className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/40 text-white hover:bg-white/10 rounded-md font-semibold">Retake</button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 max-w-3xl">
          <div className="p-5 rounded-card bg-amber-50 border border-amber-100 text-sm text-amber-900 leading-relaxed flex gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Important:</strong> This is a self-screening tool inspired by validated instruments
              (PSS-10, MBI, FINDRISC, PSQI) but is not itself a validated diagnostic. Scores in the orange
              or red ranges warrant professional evaluation. If you have thoughts of self-harm, contact a
              mental-health line immediately — in India, iCall is at +91 9152987821.
            </p>
          </div>
        </section>
      </>
    )
  }

  // ─── Intro screen ─────────────────────────────────────────────────
  if (intro) {
    return (
      <>
        <GradientHero variant="green" size="lg">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-5">
              <Activity className="w-3 h-3" /> Wellness Risk Assessment
            </span>
            <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
              Where are you on the <span className="text-gold-400">wellness</span> spectrum?
            </h1>
            <p className="mt-5 text-lg text-white/85">
              {QUESTIONS.length} questions across four axes — chronic stress, burnout, metabolic risk,
              and sleep quality. Get a detailed Ayurvedic + lifestyle plan in 5 minutes.
            </p>
            <button onClick={() => setIntro(false)} className="mt-7 inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-md font-semibold text-lg">
              Start the check <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </GradientHero>

        <section className="container mx-auto px-4 py-14 max-w-4xl">
          <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-6 text-center">The four axes</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {AXES.map((a) => {
              const Icon = AXIS_ICONS[a.key]
              return (
                <div key={a.key} className="p-5 bg-white rounded-card border border-gray-100 shadow-card flex gap-4">
                  <Icon className="w-8 h-8 text-kerala-700 flex-shrink-0" />
                  <div>
                    <h3 className="font-serif text-lg text-kerala-700">{a.label}</h3>
                    <p className="text-sm text-gray-700 mt-1">{a.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </>
    )
  }

  // ─── Question screen ──────────────────────────────────────────────
  const axisLabel = AXES.find((a) => a.key === current.axis)?.label ?? current.axis

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Question {step + 1} of {QUESTIONS.length}</span>
            <span className="uppercase tracking-wider text-kerala-700 font-semibold">{axisLabel}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-kerala-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-card border border-gray-100 shadow-card p-7">
          <h2 className="font-serif text-2xl text-kerala-700 mb-6 leading-snug">{current.prompt}</h2>
          <div className="space-y-2">
            {current.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => pick(opt.score)}
                className="w-full text-left p-4 rounded-md border-2 border-gray-200 hover:border-kerala-600 hover:bg-kerala-50 transition-all flex items-center gap-3"
              >
                <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  opt.score === 0 ? 'bg-emerald-100 text-emerald-700' :
                  opt.score === 1 ? 'bg-amber-100 text-amber-700' :
                  opt.score === 2 ? 'bg-orange-100 text-orange-700' :
                                     'bg-rose-100 text-rose-700'
                }`}>{opt.score}</span>
                <span className="text-gray-800 leading-snug">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button onClick={() => { if (step > 0) setStep(step - 1); else setIntro(true) }} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-kerala-700">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button onClick={restart} className="text-xs text-gray-500 hover:text-gray-800 underline">Restart</button>
        </div>
      </div>
    </div>
  )
}
