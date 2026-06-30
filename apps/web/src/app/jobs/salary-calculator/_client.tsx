'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Calculator, TrendingUp, Info } from 'lucide-react'

// Seeded market benchmarks. Adjusted by specialization / experience / location / license multipliers.
// Numbers are conservative monthly estimates in local currency, drawn from
// publicly listed Ayurveda role bands (DHA, MOH UAE, Kerala govt scales,
// private hospital ranges). Update from real DB aggregations later.
type Currency = 'INR' | 'AED' | 'USD' | 'GBP' | 'QAR' | 'SAR'
const LOCATIONS: Array<{ value: string; label: string; currency: Currency; baseMin: number; baseMax: number }> = [
  { value: 'kerala-private',   label: 'Kerala — private hospital',  currency: 'INR', baseMin:  25000, baseMax:  55000 },
  { value: 'kerala-govt',      label: 'Kerala — govt (MO/AMO)',     currency: 'INR', baseMin:  56000, baseMax:  95000 },
  { value: 'kerala-wellness',  label: 'Kerala — wellness resort',   currency: 'INR', baseMin:  35000, baseMax:  80000 },
  { value: 'india-metro',      label: 'India — metro (DEL/BOM/BLR)',currency: 'INR', baseMin:  40000, baseMax:  90000 },
  { value: 'uae-dubai',        label: 'UAE — Dubai',                currency: 'AED', baseMin:   8000, baseMax:  18000 },
  { value: 'uae-abu-dhabi',    label: 'UAE — Abu Dhabi',            currency: 'AED', baseMin:   8000, baseMax:  17000 },
  { value: 'qatar',            label: 'Qatar — Doha',               currency: 'QAR', baseMin:   9000, baseMax:  20000 },
  { value: 'saudi',            label: 'Saudi Arabia',               currency: 'SAR', baseMin:   8000, baseMax:  18000 },
  { value: 'uk',               label: 'UK (CNHC route)',            currency: 'GBP', baseMin:   2500, baseMax:   5000 },
  { value: 'usa',              label: 'USA (alt-medicine clinics)', currency: 'USD', baseMin:   4000, baseMax:   8000 },
]

const SPEC_MULT: Record<string, number> = {
  'panchakarma':     1.10,
  'kayachikitsa':    1.00,
  'shalya':          1.10,
  'prasuti-tantra':  1.05,
  'kaumarbhritya':   1.05,
  'shalakya':        1.00,
  'rasashastra':     0.95,
  'manasika':        0.95,
  'wellness':        1.00,
}

const QUAL_MULT: Record<string, number> = { 'BAMS': 1.0, 'BAMS+MD': 1.30, 'PhD': 1.45 }
const LIC_BONUS: Record<string, number>  = { 'DHA': 0.20, 'MOH-UAE': 0.18, 'QCHP': 0.15, 'SCFHS': 0.12, 'CNHC-UK': 0.10 }

function fmt(n: number, c: Currency): string {
  const sym = c === 'INR' ? '₹' : c === 'AED' ? 'AED ' : c === 'USD' ? '$' : c === 'GBP' ? '£' : c === 'QAR' ? 'QAR ' : 'SAR '
  return sym + Math.round(n).toLocaleString()
}

export function SalaryCalcClient() {
  const [spec, setSpec]   = useState('panchakarma')
  const [exp, setExp]     = useState(2)
  const [loc, setLoc]     = useState('kerala-private')
  const [qual, setQual]   = useState('BAMS')
  const [lics, setLics]   = useState<string[]>([])

  const result = useMemo(() => {
    const L = LOCATIONS.find((x) => x.value === loc) ?? LOCATIONS[0]
    const specMult = SPEC_MULT[spec] ?? 1
    const qualMult = QUAL_MULT[qual] ?? 1
    // Experience curve: +5% per year up to 10y, +2.5%/yr after
    const expMult = exp <= 10 ? 1 + (exp * 0.05) : 1 + (10 * 0.05) + ((exp - 10) * 0.025)
    const licBonus = lics.reduce((a, l) => a + (LIC_BONUS[l] ?? 0), 0)
    const factor = specMult * qualMult * expMult * (1 + licBonus)
    const min = L.baseMin * factor
    const max = L.baseMax * factor
    const med = (min + max) / 2
    return { min, max, med, currency: L.currency, locationLabel: L.label }
  }, [spec, exp, loc, qual, lics])

  function toggleLic(l: string) {
    setLics((arr) => arr.includes(l) ? arr.filter((x) => x !== l) : [...arr, l])
  }

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <section className="bg-white border border-gray-100 rounded-card p-5 space-y-4">
        <label className="block">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Specialization</p>
          <select value={spec} onChange={(e) => setSpec(e.target.value)} className="w-full border border-gray-200 rounded px-3 py-2 text-sm">
            {Object.keys(SPEC_MULT).map((s) => <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>)}
          </select>
        </label>
        <label className="block">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Experience: {exp} year{exp === 1 ? '' : 's'}</p>
          <input type="range" min={0} max={25} value={exp} onChange={(e) => setExp(parseInt(e.target.value, 10))} className="w-full" />
        </label>
        <label className="block">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Location</p>
          <select value={loc} onChange={(e) => setLoc(e.target.value)} className="w-full border border-gray-200 rounded px-3 py-2 text-sm">
            {LOCATIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </label>
        <label className="block">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Highest qualification</p>
          <select value={qual} onChange={(e) => setQual(e.target.value)} className="w-full border border-gray-200 rounded px-3 py-2 text-sm">
            {Object.keys(QUAL_MULT).map((q) => <option key={q} value={q}>{q}</option>)}
          </select>
        </label>
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Licenses held</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(LIC_BONUS).map((l) => {
              const on = lics.includes(l)
              return (
                <button key={l} type="button" onClick={() => toggleLic(l)} className={`text-xs px-2.5 py-1 rounded border ${on ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white border-gray-200 hover:border-kerala-300'}`}>{l}</button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-kerala-50 to-cream border border-kerala-200 rounded-card p-5">
        <p className="text-xs uppercase tracking-wider text-kerala-700"><Calculator className="w-3 h-3 inline mr-1" /> Estimated monthly salary</p>
        <p className="font-serif text-3xl text-kerala-800 mt-2 leading-tight">
          {fmt(result.min, result.currency)} <span className="text-gray-500 text-xl font-normal">to</span> {fmt(result.max, result.currency)}
        </p>
        <p className="text-sm text-gray-700 mt-1">Median: <strong>{fmt(result.med, result.currency)}</strong></p>
        <p className="text-xs text-gray-500 mt-2">{result.locationLabel} · {exp}y experience · {qual}{lics.length ? ' · ' + lics.join(', ') : ''}</p>

        <ul className="mt-4 space-y-1.5 text-xs text-gray-700">
          <li className="inline-flex items-start gap-1.5"><TrendingUp className="w-3 h-3 mt-0.5 flex-shrink-0 text-emerald-700" /> DHA-licensed doctors earn ~20% more in UAE.</li>
          <li className="inline-flex items-start gap-1.5"><TrendingUp className="w-3 h-3 mt-0.5 flex-shrink-0 text-emerald-700" /> MD holders earn ~30% more than BAMS at the same experience.</li>
          <li className="inline-flex items-start gap-1.5"><TrendingUp className="w-3 h-3 mt-0.5 flex-shrink-0 text-emerald-700" /> Govt jobs (Kerala MO/AMO) include pension + DA.</li>
        </ul>

        <p className="text-[10px] text-gray-500 mt-4 inline-flex items-start gap-1"><Info className="w-3 h-3 mt-0.5" /> Estimates based on public salary bands. Real offers vary by employer, package structure, and negotiation.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/jobs" className="text-xs px-3 py-1.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded font-semibold">Browse matching jobs</Link>
          <Link href="/jobs/career-advisor" className="text-xs px-3 py-1.5 border-2 border-kerala-700 text-kerala-700 hover:bg-kerala-50 rounded font-semibold">Talk to Career Advisor</Link>
        </div>
      </section>
    </div>
  )
}
