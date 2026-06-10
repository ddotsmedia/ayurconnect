'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Sparkles } from 'lucide-react'

const BAND = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Underweight',     tone: 'amber',    dosha: 'Vata excess',                 dietHint: 'Heavy, sweet, oily — favor warm rice, ghee, milk, soaked nuts, dates.', therapy: 'Brimhana (nourishing) protocols — Abhyanga, Shirodhara, Snehapana.', riskNote: 'Asthi-Majja-Shukra-kshaya pattern.' }
  if (bmi < 25)   return { label: 'Healthy',         tone: 'emerald',  dosha: 'Balanced (Sama-dosha)',       dietHint: 'Continue Ritucharya — eat with the season; nourishing but not heavy.', therapy: 'Annual Karkidaka Chikitsa Panchakarma for maintenance + Rasayana.', riskNote: 'Maintenance phase.' }
  if (bmi < 30)   return { label: 'Overweight',      tone: 'amber',    dosha: 'Kapha-Medas accumulation',    dietHint: 'Light, warm, dry, spiced. Eliminate sugar, processed snacks, dairy after dusk.', therapy: 'Udvartana (medicated powder massage) + Virechana Panchakarma + graded Yoga.', riskNote: 'NAFLD + insulin-resistance risk.' }
  return            { label: 'Obese',            tone: 'red',      dosha: 'Heavy Kapha-Medas dushti',    dietHint: 'Strict Kapha-pacifying — favor fenugreek, ginger, turmeric, black pepper. No sweet/sour fruit.', therapy: 'Triphala Guggulu + Varanadi Kashayam + supervised Lekhana Panchakarma.', riskNote: 'High risk of Type-2 diabetes + cardiovascular disease.' }
}

export function BmiClient() {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric')
  const [hCm, setHCm]   = useState<number>(170)
  const [wKg, setWKg]   = useState<number>(70)
  const [hFt, setHFt]   = useState<number>(5)
  const [hIn, setHIn]   = useState<number>(7)
  const [wLb, setWLb]   = useState<number>(154)

  const bmi = useMemo(() => {
    if (unit === 'metric') {
      const m = hCm / 100
      return m > 0 ? wKg / (m * m) : 0
    }
    const totalIn = hFt * 12 + hIn
    const m = totalIn * 0.0254
    const kg = wLb * 0.4536
    return m > 0 ? kg / (m * m) : 0
  }, [unit, hCm, wKg, hFt, hIn, wLb])

  const b = bmi > 0 ? BAND(bmi) : null
  const ic = 'w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700'
  const toneCls: Record<string, string> = {
    amber:   'bg-amber-50 border-amber-200 text-amber-900',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    red:     'bg-red-50 border-red-200 text-red-900',
  }

  return (
    <div className="space-y-6">
      <section className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
        <nav className="inline-flex bg-gray-100 rounded-md p-1 text-sm mb-4">
          <button onClick={() => setUnit('metric')}   className={'px-3 py-1.5 rounded ' + (unit === 'metric'   ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}>Metric (cm, kg)</button>
          <button onClick={() => setUnit('imperial')} className={'px-3 py-1.5 rounded ' + (unit === 'imperial' ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}>Imperial (ft, in, lb)</button>
        </nav>

        {unit === 'metric' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5 block">Height (cm)</label>
              <input className={ic} type="number" value={hCm} onChange={(e) => setHCm(+e.target.value)} min={50} max={250} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5 block">Weight (kg)</label>
              <input className={ic} type="number" value={wKg} onChange={(e) => setWKg(+e.target.value)} min={10} max={300} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5 block">Height (ft)</label>
              <input className={ic} type="number" value={hFt} onChange={(e) => setHFt(+e.target.value)} min={1} max={8} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5 block">Height (in)</label>
              <input className={ic} type="number" value={hIn} onChange={(e) => setHIn(+e.target.value)} min={0} max={11} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5 block">Weight (lb)</label>
              <input className={ic} type="number" value={wLb} onChange={(e) => setWLb(+e.target.value)} min={20} max={660} />
            </div>
          </div>
        )}
      </section>

      {b && (
        <section className={'border rounded-card p-6 ' + (toneCls[b.tone] ?? toneCls.emerald)}>
          <p className="text-xs uppercase tracking-wider font-semibold">Your BMI</p>
          <p className="text-4xl font-bold mt-1">{bmi.toFixed(1)}</p>
          <p className="font-serif text-xl mt-1">{b.label}</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div><strong>Dosha pattern:</strong> {b.dosha}</div>
            <div><strong>Risk note:</strong> {b.riskNote}</div>
          </div>
          <div className="mt-4 text-sm space-y-2">
            <p><strong>Ayurvedic diet hint:</strong> {b.dietHint}</p>
            <p><strong>Kerala therapies:</strong> {b.therapy}</p>
          </div>
        </section>
      )}

      <section className="bg-cream border border-gray-100 rounded-card p-5">
        <h2 className="font-serif text-lg text-ink inline-flex items-center gap-2 mb-3"><Sparkles className="w-5 h-5 text-kerala-700" /> Next steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link href="/prakriti-quiz"   className="bg-white border border-gray-100 rounded p-3 hover:border-kerala-300 text-sm"><strong>Prakriti Quiz</strong><br /><span className="text-xs text-gray-600">Find your dosha</span></Link>
          <Link href="/diet-planner"    className="bg-white border border-gray-100 rounded p-3 hover:border-kerala-300 text-sm"><strong>Diet Planner</strong><br /><span className="text-xs text-gray-600">AI-tailored meal plan</span></Link>
          <Link href="/online-consultation" className="bg-white border border-gray-100 rounded p-3 hover:border-kerala-300 text-sm"><strong>Doctor consult</strong><br /><span className="text-xs text-gray-600">Personalised plan</span></Link>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          BMI is one of many health markers. Body composition (muscle vs. fat), waist-hip ratio, and metabolic markers (HbA1c, LFT, lipid profile) matter more for long-term health.
          <Link href="/doctors" className="text-kerala-700 hover:underline ml-1 inline-flex items-center gap-0.5">Find a verified doctor <ChevronRight className="w-3 h-3" /></Link>
        </p>
      </section>
    </div>
  )
}
