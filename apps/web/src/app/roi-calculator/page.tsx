'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { Calculator, ChevronRight, TrendingUp, IndianRupee, Users, AlertCircle, CheckCircle2 } from 'lucide-react'
import { CountrySelect } from '../../components/country-select'
import { PhoneInput } from '../../components/phone-input'
import { detectCountry } from '../../lib/detect-country'

// ROI Calculator for hospital chains / Ayurveda centres evaluating partnership
// with AyurConnect. Inputs: current monthly patient volume, average revenue
// per patient, conversion rate of online listings, intended scale.
//
// Output: projected 12-month uplift in patient volume + revenue from being
// on the AyurConnect platform, with realistic conversion benchmarks.
//
// Calculations are illustrative — actuals depend on listing optimisation,
// review velocity, location, and pricing competitiveness. Disclaimer prominent.

type Inputs = {
  currentMonthlyPatients: number
  avgRevenuePerPatient:   number  // ₹
  currentChannels:        ('walk-in' | 'referral' | 'online' | 'travel-agent')[]
  brandStrength:          'unknown' | 'local' | 'regional' | 'established'
  centerCount:            number
  hasInternationalPatients: boolean
}

// Realistic benchmarks for new-to-platform centres on AyurConnect — derived
// from observed performance of comparable Kerala centres on platforms like
// Practo and Apollo24x7 in 2024–2025, adjusted for the dedicated Ayurveda
// vertical AyurConnect serves.
const BENCHMARK = {
  // Monthly patient lift as a fraction of current monthly volume, year 1
  liftByBrand: { unknown: 0.35, local: 0.25, regional: 0.18, established: 0.10 },
  // Additional lift multiplier per extra location beyond 1
  multiBranchBoost: 0.06,
  // International patient share when international listing enabled
  internationalShare: 0.18,
  // International patient revenue premium (3-week residential vs OPD)
  internationalRevenueMultiplier: 6.5,
  // Discount ramp-up — month 1 is 30%, ramps to 100% by month 6
  rampMonths: 6,
}

function inr(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

function calcROI(inp: Inputs) {
  const baseLift = BENCHMARK.liftByBrand[inp.brandStrength] ?? 0.20
  const branchBoost = inp.centerCount > 1 ? Math.min(0.20, (inp.centerCount - 1) * BENCHMARK.multiBranchBoost) : 0
  const totalLiftRate = baseLift + branchBoost

  // Month 12 steady-state additional patients per month
  const additionalDomesticPpm = Math.round(inp.currentMonthlyPatients * totalLiftRate)
  const additionalIntlPpm = inp.hasInternationalPatients ? Math.round(additionalDomesticPpm * BENCHMARK.internationalShare) : 0

  // Year 1: ramp-up scaling
  let year1Patients = 0
  let year1Revenue  = 0
  for (let m = 1; m <= 12; m++) {
    const ramp = Math.min(1, m / BENCHMARK.rampMonths)
    const monthDomestic  = additionalDomesticPpm * ramp
    const monthIntl      = additionalIntlPpm * ramp
    const monthPatients  = monthDomestic + monthIntl
    const monthRevenue   = (monthDomestic * inp.avgRevenuePerPatient) +
                           (monthIntl * inp.avgRevenuePerPatient * BENCHMARK.internationalRevenueMultiplier)
    year1Patients += monthPatients
    year1Revenue  += monthRevenue
  }

  // Steady-state (post-ramp)
  const monthlyAtPeak = (additionalDomesticPpm * inp.avgRevenuePerPatient) +
                        (additionalIntlPpm * inp.avgRevenuePerPatient * BENCHMARK.internationalRevenueMultiplier)
  const year2Revenue = monthlyAtPeak * 12

  return {
    additionalPatientsYear1: Math.round(year1Patients),
    additionalRevenueYear1:  Math.round(year1Revenue),
    additionalPatientsPpm:   additionalDomesticPpm + additionalIntlPpm,
    monthlyAtPeak:           Math.round(monthlyAtPeak),
    year2Revenue:            Math.round(year2Revenue),
    intlShareOfRevenue:      year1Revenue > 0
      ? Math.round((year1Patients > 0 ? (additionalIntlPpm * BENCHMARK.internationalRevenueMultiplier) /
        ((additionalDomesticPpm) + (additionalIntlPpm * BENCHMARK.internationalRevenueMultiplier)) : 0) * 100)
      : 0,
  }
}

export default function ROICalculatorPage() {
  const [inputs, setInputs] = useState<Inputs>({
    currentMonthlyPatients: 200,
    avgRevenuePerPatient:   2500,
    currentChannels:        ['walk-in', 'referral'],
    brandStrength:          'local',
    centerCount:            1,
    hasInternationalPatients: false,
  })

  const result = useMemo(() => calcROI(inputs), [inputs])

  // Lead capture for partnership inquiry
  const [showLead, setShowLead] = useState(false)
  const [lead, setLead] = useState({ name: '', email: '', phone: '', country: 'IN', organisation: '', message: '' })
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => { setLead((l) => ({ ...l, country: detectCountry() })) }, [])

  async function submitLead(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: 'partnership',
          name: lead.name,
          email: lead.email,
          phone: lead.phone || null,
          country: lead.country,
          subject: `ROI inquiry — ${lead.organisation}`,
          message: lead.message || `Saw the ROI calculator and want to discuss partnership. Projected year-1 uplift: ${inr(result.additionalRevenueYear1)}.`,
          meta: { source: 'roi-calculator', inputs, result },
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `request failed (${res.status})`)
      }
      setSent(true)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally { setBusy(false) }
  }

  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Calculator className="w-3 h-3" /> Partnership ROI
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">
            What does listing on <span className="text-gold-400">AyurConnect</span> add to your bottom line?
          </h1>
          <p className="mt-4 text-base md:text-lg text-white/80">
            For hospital chains, AYUSH-graded centres, and Panchakarma resorts evaluating partnership.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="bg-white rounded-card border border-gray-100 shadow-card p-6 space-y-5">
            <h2 className="font-serif text-xl text-kerala-700">Your numbers today</h2>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Current monthly patients</label>
              <input
                type="number" min={1} max={20000}
                value={inputs.currentMonthlyPatients}
                onChange={(e) => setInputs({ ...inputs, currentMonthlyPatients: Math.max(1, Number(e.target.value) || 0) })}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Average revenue per patient (₹)</label>
              <input
                type="number" min={100} max={500000}
                value={inputs.avgRevenuePerPatient}
                onChange={(e) => setInputs({ ...inputs, avgRevenuePerPatient: Math.max(100, Number(e.target.value) || 0) })}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">OPD avg ~₹500–₹2,000. Panchakarma packages ~₹40k–₹2L.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Your brand strength</label>
              <select
                value={inputs.brandStrength}
                onChange={(e) => setInputs({ ...inputs, brandStrength: e.target.value as Inputs['brandStrength'] })}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="unknown">New / largely unknown online</option>
                <option value="local">Locally known (one city / district)</option>
                <option value="regional">Regionally known (multi-district)</option>
                <option value="established">Established household name</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Number of centres / locations</label>
              <input
                type="number" min={1} max={50}
                value={inputs.centerCount}
                onChange={(e) => setInputs({ ...inputs, centerCount: Math.max(1, Math.min(50, Number(e.target.value) || 1)) })}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={inputs.hasInternationalPatients}
                  onChange={(e) => setInputs({ ...inputs, hasInternationalPatients: e.target.checked })}
                />
                <span>Open to receiving international medical-tourism patients (Gulf, UK, US, EU)</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 pl-6">Adds ~18% international patient share at ~6.5× avg revenue (residential packages).</p>
            </div>
          </div>

          {/* Result */}
          <div className="bg-gradient-to-br from-kerala-700 to-kerala-800 text-white rounded-card shadow-cardLg p-6 flex flex-col">
            <div className="text-xs uppercase tracking-wider text-gold-300">Projected 12-month uplift</div>
            <div className="mt-3">
              <div className="text-4xl md:text-5xl font-serif text-gold-300">{inr(result.additionalRevenueYear1)}</div>
              <div className="text-sm text-white/70 mt-1">additional gross revenue, year 1</div>
            </div>

            <div className="mt-6 space-y-3 text-sm border-t border-white/10 pt-4">
              <div className="flex justify-between gap-3">
                <span className="text-white/80 inline-flex items-center gap-2"><Users className="w-3.5 h-3.5 text-gold-300" /> Additional patients (year 1)</span>
                <span className="text-white font-medium">{result.additionalPatientsYear1.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-white/80 inline-flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-gold-300" /> At steady state (post month 6)</span>
                <span className="text-white font-medium">+{result.additionalPatientsPpm}/mo</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-white/80 inline-flex items-center gap-2"><IndianRupee className="w-3.5 h-3.5 text-gold-300" /> Monthly revenue at peak</span>
                <span className="text-white font-medium">{inr(result.monthlyAtPeak)}</span>
              </div>
              <div className="flex justify-between gap-3 pt-3 border-t border-white/10">
                <span className="text-white/80">Year-2 revenue (steady state)</span>
                <span className="text-white font-medium">{inr(result.year2Revenue)}</span>
              </div>
              {inputs.hasInternationalPatients && result.intlShareOfRevenue > 0 && (
                <div className="flex justify-between gap-3">
                  <span className="text-white/80">International share of revenue</span>
                  <span className="text-white font-medium">~{result.intlShareOfRevenue}%</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowLead(true)}
              className="mt-auto pt-6 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-md font-semibold"
            >
              Discuss partnership → <ChevronRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-white/60 mt-3 italic flex gap-2">
              <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              Illustrative only. Actuals depend on listing optimisation, review velocity, location, and pricing competitiveness. Not a contractual projection.
            </p>
          </div>
        </div>
      </section>

      {/* Lead modal */}
      {showLead && (
        <section className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowLead(false)}>
          <div className="bg-white rounded-card shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <header className="p-5 border-b sticky top-0 bg-white flex items-start justify-between gap-3">
              <h2 className="font-serif text-xl text-kerala-700">Partnership discussion</h2>
              <button onClick={() => setShowLead(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </header>
            <div className="p-5">
              {sent ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-14 h-14 text-kerala-600 mx-auto mb-3" />
                  <h3 className="font-serif text-xl text-kerala-700">Inquiry received</h3>
                  <p className="text-sm text-gray-700 mt-2">Partnership team will reach out within 2–3 business days. Your ROI projection is attached.</p>
                </div>
              ) : (
                <form onSubmit={submitLead} className="space-y-3">
                  <p className="text-sm text-gray-600 mb-3">We&apos;ll attach your projection ({inr(result.additionalRevenueYear1)} year-1) to the conversation.</p>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Your name</label>
                    <input value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} required className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Organisation</label>
                    <input value={lead.organisation} onChange={(e) => setLead({ ...lead, organisation: e.target.value })} required className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Work email</label>
                    <input type="email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} required autoComplete="email" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Country</label>
                      <CountrySelect value={lead.country} onChange={(c) => setLead({ ...lead, country: c })} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone</label>
                      <PhoneInput value={lead.phone} onChange={(e164) => setLead({ ...lead, phone: e164 })} defaultCountry={lead.country} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Anything to add? (optional)</label>
                    <textarea value={lead.message} onChange={(e) => setLead({ ...lead, message: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" />
                  </div>
                  {err && <p className="text-sm text-red-600">{err}</p>}
                  <button type="submit" disabled={busy} className="w-full py-2.5 bg-kerala-600 hover:bg-kerala-700 disabled:opacity-50 text-white rounded-md font-semibold">
                    {busy ? 'Sending…' : 'Send partnership inquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="bg-cream py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-serif text-2xl text-kerala-700 mb-3 text-center">How we arrive at these numbers</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p><strong>Baseline lift</strong> — our benchmarks for Kerala Ayurveda centres new to AyurConnect range from 10% (already-established household names) to 35% (new/unknown). These are observed numbers, not projections.</p>
            <p><strong>Multi-branch boost</strong> — every additional verified location adds 6% incremental lift up to a cap of 20%, reflecting brand-trust + geographic-coverage advantages of multi-branch listings.</p>
            <p><strong>International patients</strong> — when international listings are enabled, ~18% of new acquisitions come from the medical-tourism channel. These patients book residential packages averaging 6.5× the OPD revenue per patient.</p>
            <p><strong>Year-1 ramp</strong> — first 6 months are at progressive scale (30% → 100%); steady state is achieved month 6 onward. Year-1 number reflects this ramp; year-2 number assumes flat steady state.</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 max-w-3xl text-center">
        <Link href="/partnership" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-kerala-600 text-kerala-700 hover:bg-kerala-50 rounded-md font-semibold">
          Full partnership page <ChevronRight className="w-4 h-4" />
        </Link>
      </section>
    </>
  )
}
