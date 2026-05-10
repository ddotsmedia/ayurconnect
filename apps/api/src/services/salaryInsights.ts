// Salary insights for Kerala Ayurveda jobs.
//
// Two data sources:
//   1. Live aggregations from ImportedJob.salary (last 6 months)
//   2. Hardcoded reference Kerala govt pay scales (Kerala PSC + NHM)
//
// Salary strings in scraped data are messy: "₹40,000 - ₹60,000", "INR 25k-50k",
// "Negotiable", "as per Kerala PSC scale". parseSalary() extracts a numeric
// range when possible; rows that don't yield numbers are excluded from
// aggregation but still surface in the raw count.

import type { FastifyInstance } from 'fastify'

export type GovtScale = {
  role: string
  min: number
  max: number
  scale?: string
  source: 'kerala-psc' | 'nhm-kerala' | 'private'
}

export const KERALA_GOVT_SCALES: GovtScale[] = [
  { role: 'Medical Officer (Ayurveda) — Kerala PSC',  min: 41500, max: 93490, scale: 'Grade A Gazetted',     source: 'kerala-psc' },
  { role: 'BAMS Fresher — Private Clinic',            min: 15000, max: 25000,                                source: 'private'    },
  { role: 'Senior Ayurvedic Physician',               min: 40000, max: 80000,                                source: 'private'    },
  { role: 'Panchakarma Specialist',                   min: 25000, max: 50000,                                source: 'private'    },
  { role: 'NHM Ayurveda MO (contractual)',            min: 28000, max: 35000, scale: 'Contractual NHM',      source: 'nhm-kerala' },
  { role: 'AYUSH Mission Therapist',                  min: 18000, max: 28000, scale: 'Contractual',          source: 'nhm-kerala' },
  { role: 'Govt Ayurveda College Lecturer (Asst Prof)', min: 56100, max: 177500, scale: '7th Pay AGP 6000', source: 'kerala-psc' },
  { role: 'Pharmacist (Ayurveda) — Govt',             min: 25200, max: 64900, scale: 'Grade B',             source: 'kerala-psc' },
]

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6

// Try hard to extract two numbers (min + max) from a free-text salary string.
// Returns null if we can't get a sensible range.
function parseSalary(raw: string | null | undefined): { min: number; max: number } | null {
  if (!raw) return null
  const text = raw.replace(/[,_]/g, '')
  // Patterns: "40000 - 60000", "INR 25k - 50k", "₹40k-60k", "30,000/month"
  // Normalize "k" suffix
  const expand = (s: string): string => s.replace(/(\d+(?:\.\d+)?)\s*[kK]/g, (_, n) => String(Math.round(Number(n) * 1000)))
  const t = expand(text)
  const matches = [...t.matchAll(/(\d{4,7})/g)].map((m) => Number(m[1])).filter((n) => Number.isFinite(n) && n >= 5_000 && n <= 5_000_000)
  if (matches.length === 0) return null
  const min = Math.min(...matches)
  const max = Math.max(...matches)
  return { min, max }
}

export async function liveSalaryAggregates(
  fastify: FastifyInstance,
  filters: { specialization?: string; district?: string },
): Promise<{
  records: number
  withSalary: number
  min: number | null
  avg: number | null
  max: number | null
  byCategory: Array<{ category: string; count: number; avg: number }>
  bySource:   Array<{ source: string;   count: number; avg: number }>
}> {
  const since = new Date(Date.now() - SIX_MONTHS_MS)
  const where: Record<string, unknown> = { isActive: true, importedAt: { gte: since } }
  if (filters.specialization) {
    where.OR = [
      { title:        { contains: filters.specialization, mode: 'insensitive' } },
      { description:  { contains: filters.specialization, mode: 'insensitive' } },
      { qualifications: { contains: filters.specialization, mode: 'insensitive' } },
    ]
  }
  if (filters.district) where.location = { contains: filters.district, mode: 'insensitive' }

  const rows = await fastify.prisma.importedJob.findMany({
    where,
    select: { salary: true, category: true, source: true },
  })

  const allMins: number[] = []
  const allMaxs: number[] = []
  const byCat = new Map<string, number[]>()
  const bySrc = new Map<string, number[]>()

  let withSalary = 0
  for (const r of rows) {
    const parsed = parseSalary(r.salary)
    if (!parsed) continue
    withSalary++
    allMins.push(parsed.min)
    allMaxs.push(parsed.max)
    const mid = (parsed.min + parsed.max) / 2
    const cat = r.category ?? 'unknown'
    const src = r.source
    if (!byCat.has(cat)) byCat.set(cat, [])
    if (!bySrc.has(src)) bySrc.set(src, [])
    byCat.get(cat)!.push(mid)
    bySrc.get(src)!.push(mid)
  }

  const avg = (xs: number[]) => xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0

  return {
    records: rows.length,
    withSalary,
    min: allMins.length ? Math.min(...allMins) : null,
    avg: allMins.length ? avg([...allMins, ...allMaxs]) : null,
    max: allMaxs.length ? Math.max(...allMaxs) : null,
    byCategory: [...byCat.entries()].map(([category, xs]) => ({ category, count: xs.length, avg: avg(xs) })).sort((a, b) => b.count - a.count),
    bySource:   [...bySrc.entries()].map(([source, xs])   => ({ source,   count: xs.length, avg: avg(xs) })).sort((a, b) => b.count - a.count),
  }
}

export function estimateSalary(profile: {
  qualification?:  string | null
  experienceYears?: number | null
  district?:       string | null
}): { low: number; mid: number; high: number; reasoning: string[] } {
  const reasoning: string[] = []
  let low = 18_000, mid = 30_000, high = 50_000

  const qual = (profile.qualification ?? '').toLowerCase()
  const yrs  = profile.experienceYears ?? 0

  if (qual.includes('phd')) {
    low = 55_000; mid = 95_000; high = 175_000
    reasoning.push('PhD opens up associate / full prof tracks at govt Ayurveda colleges (7th-pay AGP 7000-9000).')
  } else if (qual.includes('md') || qual.includes('ms')) {
    low = 40_000; mid = 65_000; high = 95_000
    reasoning.push('MD/MS qualification places you in Grade-A Gazetted scales (KPSC) and senior private roles.')
  } else if (qual.includes('bams')) {
    low = 25_000; mid = 45_000; high = 70_000
    reasoning.push('BAMS is the standard Ayurveda qualification — Kerala PSC MO scale starts ~₹41,500.')
  }

  if (yrs >= 15)      { low *= 1.4; mid *= 1.5; high *= 1.6; reasoning.push(`${yrs} years of experience adds a 50-60% seniority premium.`) }
  else if (yrs >= 5)  { low *= 1.15; mid *= 1.25; high *= 1.35; reasoning.push(`${yrs} years adds a 25% experience premium.`) }
  else if (yrs >= 1)  { low *= 1.05; mid *= 1.10; high *= 1.20; reasoning.push(`${yrs} year(s) adds a small early-career bump.`) }
  else                { reasoning.push('Fresher rates assumed; first 1-2 years are usually private clinics or NHM contractual postings.') }

  // District tweak: Trivandrum + Ernakulam + Kozhikode pay slightly more.
  const tier1 = ['thiruvananthapuram', 'trivandrum', 'ernakulam', 'kochi', 'cochin', 'kozhikode']
  if (tier1.includes((profile.district ?? '').toLowerCase())) {
    low *= 1.05; mid *= 1.10; high *= 1.15
    reasoning.push('Tier-1 districts (Trivandrum / Kochi / Kozhikode) pay ~10% more.')
  }

  return {
    low: Math.round(low / 100) * 100,
    mid: Math.round(mid / 100) * 100,
    high: Math.round(high / 100) * 100,
    reasoning,
  }
}
