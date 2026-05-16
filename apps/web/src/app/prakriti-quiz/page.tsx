'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronRight, ChevronLeft, Sparkles, AlertCircle } from 'lucide-react'
import { QUESTIONS, CATEGORIES, type Dosha } from './_data/questions'
import { REPORTS, classify } from './_data/reports'

type Answers = Record<string, Dosha>

const STORAGE_KEY = 'ayur-prakriti-result'

export default function PrakritiQuizPage() {
  const [step, setStep] = useState(0)            // -1 = result, 0..N-1 = question, -2 = intro
  const [answers, setAnswers] = useState<Answers>({})
  const [resultKey, setResultKey] = useState<string | null>(null)
  const [intro, setIntro] = useState(true)

  const current = QUESTIONS[step]
  const progress = (Object.keys(answers).length / QUESTIONS.length) * 100

  const scores = useMemo(() => {
    let v = 0, p = 0, k = 0
    for (const dosha of Object.values(answers)) {
      if (dosha === 'V') v++
      else if (dosha === 'P') p++
      else if (dosha === 'K') k++
    }
    return { v, p, k }
  }, [answers])

  function pick(dosha: Dosha) {
    const newAnswers = { ...answers, [current.id]: dosha }
    setAnswers(newAnswers)
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      void finalise(newAnswers)
    }
  }

  async function finalise(final: Answers) {
    // Score locally for instant result
    let v = 0, p = 0, k = 0
    for (const d of Object.values(final)) {
      if (d === 'V') v++
      else if (d === 'P') p++
      else if (d === 'K') k++
    }
    const dominant = classify(v, p, k)
    setResultKey(dominant)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        at: new Date().toISOString(),
        vata: v, pitta: p, kapha: k, dominant, responses: final,
      }))
    } catch { /* private mode etc. */ }

    // Persist to server — best-effort
    try {
      await fetch('/api/prakriti', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ vata: v, pitta: p, kapha: k, dominant, responses: final }),
      })
    } catch { /* non-fatal */ }
  }

  function restart() {
    setAnswers({})
    setResultKey(null)
    setIntro(true)
    setStep(0)
  }

  // ─── Result screen ────────────────────────────────────────────────
  if (resultKey) {
    const report = REPORTS[resultKey] ?? REPORTS.tridoshic
    const total = scores.v + scores.p + scores.k || 1
    return (
      <>
        <GradientHero variant="green" size="lg">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
              <Sparkles className="w-3 h-3" /> Your result
            </span>
            <p className="text-sm text-gold-300 italic mt-2">{report.sanskrit}</p>
            <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight mt-3">
              {report.title}
            </h1>
            <p className="mt-5 text-lg text-white/85 max-w-2xl mx-auto">{report.tagline}</p>

            {/* Dosha bars */}
            <div className="mt-8 max-w-md mx-auto space-y-2">
              {[
                { label: 'Vata',  v: scores.v, color: 'bg-blue-400' },
                { label: 'Pitta', v: scores.p, color: 'bg-orange-400' },
                { label: 'Kapha', v: scores.k, color: 'bg-emerald-400' },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-3 text-sm">
                  <span className="text-white/80 w-14 text-right">{b.label}</span>
                  <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${b.color}`} style={{ width: `${(b.v / total) * 100}%` }} />
                  </div>
                  <span className="text-white/80 w-12">{Math.round((b.v / total) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </GradientHero>

        <section className="container mx-auto px-4 py-14 max-w-4xl">
          <h2 className="text-2xl md:text-3xl text-kerala-700 mb-4">What this means</h2>
          <p className="text-gray-700 leading-relaxed">{report.description}</p>

          <h2 className="text-2xl md:text-3xl text-kerala-700 mb-4 mt-12">Your typical traits</h2>
          <ul className="grid md:grid-cols-2 gap-3">
            {report.traits.map((t) => (
              <li key={t} className="flex items-start gap-2 p-3 bg-white rounded-md border border-gray-100">
                <span className="w-1.5 h-1.5 rounded-full bg-kerala-600 mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">{t}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-cream py-14">
          <div className="container mx-auto px-4 max-w-4xl grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-card border border-kerala-100 shadow-card">
              <h3 className="font-serif text-xl text-kerala-700 mb-3">Favour</h3>
              <h4 className="text-xs uppercase tracking-wider text-gold-600 font-semibold mt-3">Diet</h4>
              <ul className="mt-1.5 space-y-1.5 text-sm text-gray-700">
                {report.favor.diet.map((d) => <li key={d} className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-kerala-600 mt-0.5 flex-shrink-0" />{d}</li>)}
              </ul>
              <h4 className="text-xs uppercase tracking-wider text-gold-600 font-semibold mt-4">Lifestyle</h4>
              <ul className="mt-1.5 space-y-1.5 text-sm text-gray-700">
                {report.favor.lifestyle.map((d) => <li key={d} className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-kerala-600 mt-0.5 flex-shrink-0" />{d}</li>)}
              </ul>
              <h4 className="text-xs uppercase tracking-wider text-gold-600 font-semibold mt-4">Supportive herbs</h4>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {report.favor.herbs.map((h) => <span key={h} className="px-2 py-1 bg-kerala-50 border border-kerala-100 rounded-full text-xs text-gray-700">{h}</span>)}
              </div>
            </div>
            <div className="p-6 bg-white rounded-card border border-rose-100 shadow-card">
              <h3 className="font-serif text-xl text-rose-800 mb-3">Avoid / Minimise</h3>
              <ul className="space-y-1.5 text-sm text-gray-700">
                {report.avoid.map((d) => <li key={d} className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-rose-600 mt-0.5 flex-shrink-0" />{d}</li>)}
              </ul>
              <h4 className="text-xs uppercase tracking-wider text-rose-700 font-semibold mt-5">Tendency to watch out for</h4>
              <p className="text-sm text-gray-700 mt-1.5 leading-relaxed italic">{report.watchOut}</p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-14 max-w-3xl">
          <h2 className="text-2xl md:text-3xl text-kerala-700 mb-3 text-center">Best Panchakarma procedures for you</h2>
          <p className="text-center text-gray-600 mb-6">Each constitution responds best to specific classical procedures — under qualified BAMS / MD supervision only.</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {report.bestProcedures.map((p) => (
              <span key={p} className="px-4 py-2 bg-kerala-50 border border-kerala-200 rounded-full text-sm text-kerala-700 font-medium">{p}</span>
            ))}
          </div>
        </section>

        <section className="bg-kerala-700 py-14 text-white">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="font-serif text-3xl">Next steps</h2>
            <p className="mt-4 text-white/85">Want a personalised diet plan based on your dosha? Or speak to a verified Vaidya for a proper Nadi-Pariksha?</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href={`/diet-planner?dosha=${report.key}`} className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-md font-semibold">
                Get AI diet plan <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/doctors" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/40 text-white hover:bg-white/10 rounded-md font-semibold">
                Find a Vaidya
              </Link>
              <button onClick={restart} className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/40 text-white hover:bg-white/10 rounded-md font-semibold">
                Retake quiz
              </button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 max-w-3xl">
          <div className="p-5 rounded-card bg-amber-50 border border-amber-100 text-sm text-amber-900 leading-relaxed flex gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Important:</strong> This is a self-report screener, not a diagnostic instrument.
              Your true Prakriti requires examination by a qualified BAMS / MD Vaidya — Nadi-Pariksha
              (pulse diagnosis), Jihva-Pariksha (tongue), Drik-Pariksha (eye), and full clinical
              history. Use this result as a starting point for lifestyle reflection, not for
              self-prescribing medicines or treatments.
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
              <Sparkles className="w-3 h-3" /> Prakriti Analyzer
            </span>
            <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
              Discover your <span className="text-gold-400">Body Constitution</span>
            </h1>
            <p className="mt-5 text-lg text-white/85 max-w-2xl mx-auto">
              25 questions, 4 minutes. Find your dominant dosha — Vata, Pitta, or Kapha — and get
              tailored guidance on diet, lifestyle, and supportive herbs.
            </p>
            <button onClick={() => setIntro(false)} className="mt-7 inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-md font-semibold text-lg">
              Start the quiz <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </GradientHero>

        <section className="container mx-auto px-4 py-14 max-w-4xl">
          <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-6 text-center">What is Prakriti?</h2>
          <p className="text-gray-700 leading-relaxed text-center max-w-2xl mx-auto">
            Prakriti is your innate, unchanging body-mind constitution determined at conception. The
            three doshas — <strong>Vata</strong> (air + ether), <strong>Pitta</strong> (fire + water),
            and <strong>Kapha</strong> (earth + water) — combine in unique proportions to form your
            type. Knowing your Prakriti helps you eat, live, and heal in ways that suit your nature
            rather than work against it.
          </p>

          <div className="grid md:grid-cols-3 gap-5 mt-12">
            {[
              { key: 'vata',  color: 'bg-blue-50 border-blue-200', title: 'Vata',  sanskrit: 'वात',  desc: 'Air & ether. Movement, communication, creativity. Light, dry, cold, quick.' },
              { key: 'pitta', color: 'bg-orange-50 border-orange-200', title: 'Pitta', sanskrit: 'पित्त', desc: 'Fire & water. Transformation, metabolism, intensity. Hot, sharp, ambitious.' },
              { key: 'kapha', color: 'bg-emerald-50 border-emerald-200', title: 'Kapha', sanskrit: 'कफ',   desc: 'Earth & water. Structure, lubrication, stability. Heavy, smooth, slow, calm.' },
            ].map((d) => (
              <div key={d.key} className={`p-5 rounded-card border ${d.color}`}>
                <h3 className="font-serif text-xl text-kerala-700">{d.title}</h3>
                <p className="text-sm text-gold-600 italic">{d.sanskrit}</p>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </>
    )
  }

  // ─── Question screen ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Question {step + 1} of {QUESTIONS.length}</span>
            <span className="uppercase tracking-wider text-kerala-700 font-semibold">{CATEGORIES.find((c) => c.key === current?.category)?.label}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-kerala-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-card border border-gray-100 shadow-card p-7">
          <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-6">{current.prompt}</h2>
          <div className="space-y-3">
            {current.options.map((opt) => (
              <button
                key={opt.dosha}
                onClick={() => pick(opt.dosha)}
                className="w-full text-left p-4 rounded-md border-2 border-gray-200 hover:border-kerala-600 hover:bg-kerala-50 transition-all flex items-center gap-3"
              >
                <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  opt.dosha === 'V' ? 'bg-blue-100 text-blue-700' :
                  opt.dosha === 'P' ? 'bg-orange-100 text-orange-700' :
                                       'bg-emerald-100 text-emerald-700'
                }`}>{opt.dosha}</span>
                <span className="text-gray-800 leading-snug">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Back / restart */}
        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={() => { if (step > 0) setStep(step - 1); else setIntro(true) }}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-kerala-700"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={restart}
            className="text-xs text-gray-500 hover:text-gray-800 underline"
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  )
}
