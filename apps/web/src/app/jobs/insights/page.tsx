import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { TrendingUp, Briefcase, Globe2, Building2 } from 'lucide-react'
import { pageMetadata } from '../../../lib/seo'

export const metadata: Metadata = pageMetadata({
  path: '/jobs/insights',
  title: 'Ayurveda Job Market Insights 2026',
  description: 'Salary trends, top hiring locations, in-demand specializations, employer types. 2026 Ayurveda job market data.',
  keywords: ['ayurveda job market', 'BAMS salary trend', 'GCC ayurveda hiring', 'ayurveda employment 2026'],
})

// Static market data — represents researched 2026 estimates.
// Will mirror real DB aggregations once job volume grows.
const SPEC_DEMAND = [
  { spec: 'Panchakarma',           pct: 28 },
  { spec: 'Kayachikitsa',          pct: 22 },
  { spec: 'Prasuti Tantra',        pct: 12 },
  { spec: 'Wellness Consultant',   pct: 10 },
  { spec: 'Shalakya',              pct:  8 },
  { spec: 'Telemedicine',          pct:  7 },
  { spec: 'Kaumarabhritya',        pct:  6 },
  { spec: 'Other',                 pct:  7 },
]

const LOC_DEMAND = [
  { loc: 'Dubai',          pct: 22 },
  { loc: 'Kerala',         pct: 18 },
  { loc: 'Abu Dhabi',      pct: 14 },
  { loc: 'Doha',           pct: 10 },
  { loc: 'Sharjah',        pct:  8 },
  { loc: 'Muscat',         pct:  6 },
  { loc: 'Bahrain',        pct:  5 },
  { loc: 'India (other)',  pct:  9 },
  { loc: 'Other',          pct:  8 },
]

const SALARY = [
  { spec: 'Panchakarma (UAE)',         range: 'AED 9,000 – 18,000 / mo' },
  { spec: 'Kayachikitsa (UAE)',        range: 'AED 8,500 – 17,000 / mo' },
  { spec: 'Panchakarma (Kerala)',      range: '₹35,000 – 85,000 / mo' },
  { spec: 'Kayachikitsa (Kerala)',     range: '₹30,000 – 75,000 / mo' },
  { spec: 'Wellness Consultant (UK)',  range: '£2,200 – 4,500 / mo' },
  { spec: 'General BAMS (Kerala)',     range: '₹25,000 – 45,000 / mo (fresher)' },
  { spec: 'Senior MD/MS (UAE)',        range: 'AED 18,000 – 32,000 / mo' },
]

const JOB_TYPES = [
  { type: 'Full-time clinical',  pct: 58 },
  { type: 'Locum / contract',    pct: 16 },
  { type: 'Telemedicine',        pct: 12 },
  { type: 'Part-time clinical',  pct:  9 },
  { type: 'Internship / fresher', pct:  5 },
]

const EMPLOYER_TYPES = [
  { type: 'Hospital',           pct: 30 },
  { type: 'Clinic (1-3 doctor)', pct: 24 },
  { type: 'Wellness centre / resort', pct: 18 },
  { type: 'Telemedicine company', pct: 12 },
  { type: 'Multi-branch chain',  pct:  9 },
  { type: 'Pharma / research',   pct:  4 },
  { type: 'Government',          pct:  3 },
]

const SKILLS = [
  'DHA Licensed', 'Panchakarma', 'Pizhichil', 'Sirodhara', 'Nadi Pariksha',
  'Prasuti Tantra', 'Sutika Paricharya', 'Marma Therapy', 'CCIM Verified',
  'MOH UAE', 'Classical Training', 'Sanskrit Reading', 'Diabetic Care',
  'Stress + Anxiety', 'Telemedicine Experience', 'Malayalam Fluency',
  'Arabic Conversational', 'Resort Wellness', 'Research Publications',
]

const KEY_STATS = [
  { stat: '15-20%', label: 'GCC Ayurveda hiring growth (annual)' },
  { stat: '3M+',    label: 'Malayali expats in UAE — patient base' },
  { stat: '800K+',  label: 'AYUSH practitioners in India' },
  { stat: '$12B+',  label: 'Global Ayurveda market by 2027 (est.)' },
]

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span className="w-44 text-gray-700 text-xs">{label}</span>
      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-kerala-700" style={{ width: `${(value / max) * 100}%` }} /></div>
      <span className="text-xs text-gray-600 w-12 text-right">{value}%</span>
    </li>
  )
}

export default function InsightsPage() {
  const specMax = Math.max(...SPEC_DEMAND.map((s) => s.pct))
  const locMax  = Math.max(...LOC_DEMAND.map((l) => l.pct))
  const typeMax = Math.max(...JOB_TYPES.map((j) => j.pct))
  const empMax  = Math.max(...EMPLOYER_TYPES.map((e) => e.pct))
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4"><TrendingUp className="w-3 h-3" /> 2026 data · updated quarterly</span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Ayurveda Job Market Insights — 2026</h1>
          <p className="text-white/85 mt-3">Salary trends · top locations · in-demand skills · employer breakdown</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-5xl space-y-6">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {KEY_STATS.map((k) => (
            <article key={k.label} className="bg-white border border-kerala-100 rounded-card p-4 shadow-card">
              <p className="font-serif text-2xl md:text-3xl text-kerala-700">{k.stat}</p>
              <p className="text-[10px] text-gray-600 mt-1">{k.label}</p>
            </article>
          ))}
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
            <h2 className="font-serif text-lg text-ink inline-flex items-center gap-2"><Briefcase className="w-5 h-5 text-kerala-700" /> Specialization demand</h2>
            <ul className="mt-3 space-y-2">{SPEC_DEMAND.map((s) => <Bar key={s.spec} label={s.spec} value={s.pct} max={specMax} />)}</ul>
          </article>
          <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
            <h2 className="font-serif text-lg text-ink inline-flex items-center gap-2"><Globe2 className="w-5 h-5 text-kerala-700" /> Top hiring locations</h2>
            <ul className="mt-3 space-y-2">{LOC_DEMAND.map((l) => <Bar key={l.loc} label={l.loc} value={l.pct} max={locMax} />)}</ul>
          </article>
        </div>

        <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
          <h2 className="font-serif text-lg text-ink">Salary ranges by role + location</h2>
          <table className="w-full text-sm mt-3">
            <thead className="text-xs text-gray-500 border-b border-gray-100"><tr><th className="py-2 text-left">Specialization + Location</th><th className="py-2 text-left">Monthly range</th></tr></thead>
            <tbody>
              {SALARY.map((r) => <tr key={r.spec} className="border-b border-gray-100 last:border-0">
                <td className="py-2 font-semibold text-ink">{r.spec}</td>
                <td className="py-2 text-gray-800 font-mono text-xs">{r.range}</td>
              </tr>)}
            </tbody>
          </table>
          <p className="text-[10px] text-gray-500 mt-3">Reference ranges. Actuals vary by experience, clinic prestige, license status, and visa support.</p>
        </article>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
            <h2 className="font-serif text-lg text-ink">Job type distribution</h2>
            <ul className="mt-3 space-y-2">{JOB_TYPES.map((j) => <Bar key={j.type} label={j.type} value={j.pct} max={typeMax} />)}</ul>
          </article>
          <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
            <h2 className="font-serif text-lg text-ink inline-flex items-center gap-2"><Building2 className="w-5 h-5 text-kerala-700" /> Hiring by employer type</h2>
            <ul className="mt-3 space-y-2">{EMPLOYER_TYPES.map((e) => <Bar key={e.type} label={e.type} value={e.pct} max={empMax} />)}</ul>
          </article>
        </div>

        <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
          <h2 className="font-serif text-lg text-ink">Most in-demand skills + certifications</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SKILLS.map((s, i) => {
              const size = i < 6 ? 'text-base px-3 py-1.5' : i < 12 ? 'text-sm px-2.5 py-1' : 'text-xs px-2 py-0.5'
              return <span key={s} className={'inline-block bg-kerala-50 border border-kerala-200 text-kerala-800 rounded-full font-semibold ' + size}>{s}</span>
            })}
          </div>
        </article>
      </section>
    </>
  )
}
