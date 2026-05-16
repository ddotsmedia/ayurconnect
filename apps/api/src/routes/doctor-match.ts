// AI doctor match — HealthTap-style. Takes a quiz payload (concern + language
// + country + budget + dosha) and returns ranked doctors. Scoring is rule-
// based (not LLM) so it's fast, deterministic, and free.
//
// Inputs:
//   { concerns: string[]   — e.g. ['stress','sleep']
//     language: string?    — e.g. 'Malayalam'
//     country:  string?    — ISO-2; doctor's country preferred if patient's
//     dosha:    string?    — 'vata' | 'pitta' | 'kapha'
//     mode:     'video' | 'audio' | 'in-person'
//     budget:   number?    — max acceptable consultation fee in INR
//   }
//
// Scoring (simple, transparent):
//   +30 if doctor's specialization matches any concern (mapped via CONCERN_TO_SPEC)
//   +20 if doctor offers online consult (when mode != in-person)
//   +15 if language match
//   +10 if country match
//   +10 if verified
//   +5  per year of experience (capped at +25)
//   +avg rating * 4 (max 20)
//   -10 if fee > budget (or 0 if no budget given)

import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/doctor-match'

const CONCERN_TO_SPEC: Record<string, string[]> = {
  stress:        ['Manasika'],
  sleep:         ['Manasika', 'Kayachikitsa'],
  anxiety:       ['Manasika'],
  diabetes:      ['Kayachikitsa'],
  hypertension:  ['Kayachikitsa'],
  pcos:          ['Prasuti Tantra'],
  fertility:     ['Prasuti Tantra'],
  menopause:     ['Prasuti Tantra'],
  pediatric:     ['Kaumarbhritya'],
  child:         ['Kaumarbhritya'],
  skin:          ['Shalakya', 'Kayachikitsa'],
  hair:          ['Shalakya'],
  joint:         ['Panchakarma'],
  arthritis:     ['Panchakarma'],
  back:          ['Panchakarma'],
  digestion:     ['Kayachikitsa'],
  migraine:      ['Manasika'],
  weight:        ['Kayachikitsa'],
  panchakarma:   ['Panchakarma'],
  detox:         ['Panchakarma'],
  respiratory:   ['Kayachikitsa'],
  asthma:        ['Kayachikitsa'],
}

const route: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', async (request) => {
    const body = request.body as {
      concerns?: string[]; language?: string; country?: string; mode?: string; budget?: number; dosha?: string
    }
    const concerns = Array.isArray(body.concerns) ? body.concerns.map((c) => String(c).toLowerCase()) : []
    const mode = ['video', 'audio', 'in-person'].includes(String(body.mode)) ? String(body.mode) : 'video'
    const wantsOnline = mode !== 'in-person'
    const requestedCountry = typeof body.country === 'string' && /^[A-Z]{2}$/.test(body.country) ? body.country : null
    const requestedLanguage = typeof body.language === 'string' ? body.language.trim() : null
    const budget = typeof body.budget === 'number' && body.budget > 0 ? body.budget : null

    // Specs implied by the concerns.
    const targetSpecs = new Set<string>()
    for (const c of concerns) {
      for (const [k, v] of Object.entries(CONCERN_TO_SPEC)) {
        if (c.includes(k)) v.forEach((s) => targetSpecs.add(s))
      }
    }

    // Pull a broad candidate pool, filtered minimally so scoring sees them.
    const candidates = await fastify.prisma.doctor.findMany({
      where: wantsOnline ? { availableForOnline: true } : {},
      include: { reviews: { select: { rating: true } } },
      take: 100,
    })

    const scored = candidates.map((d) => {
      let score = 0
      const reasons: string[] = []

      // Specialization match — best signal we have.
      const specsOfDoctor = (d.specialization ?? '').split(/[,/|]/).map((s) => s.trim())
      const specHit = specsOfDoctor.some((s) => targetSpecs.has(s))
      if (specHit) { score += 30; reasons.push(`specialises in ${specsOfDoctor.find((s) => targetSpecs.has(s))}`) }

      if (wantsOnline && d.availableForOnline) { score += 20; reasons.push('available online') }

      if (requestedLanguage && d.languages.some((l) => l.toLowerCase().includes(requestedLanguage.toLowerCase()))) {
        score += 15; reasons.push(`speaks ${requestedLanguage}`)
      }

      if (requestedCountry && d.country === requestedCountry) {
        score += 10; reasons.push(`based in your country`)
      }

      if (d.ccimVerified) { score += 10; reasons.push('verified') }

      if (typeof d.experienceYears === 'number') {
        const xp = Math.min(d.experienceYears, 5) * 5 + Math.max(0, Math.min(d.experienceYears - 5, 4)) * 1
        score += xp
        if (d.experienceYears >= 10) reasons.push(`${d.experienceYears}+ years experience`)
      }

      // Reviews average rating.
      const ratings = d.reviews.map((r) => r.rating)
      const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
      if (avg > 0) {
        score += Math.round(avg * 4)
        if (avg >= 4.5) reasons.push(`${Math.round(avg * 10) / 10}★ rated`)
      }

      // Budget — only penalise if budget is set AND fee exceeds it.
      if (budget && typeof d.consultationFee === 'number' && d.consultationFee > budget) {
        score -= 10
      }

      // Strip the fee field from response — it's the deprecated DB column.
      const { consultationFee: _fee, reviews: _r, ...rest } = d
      return {
        doctor: { ...rest, reviewsCount: ratings.length, averageRating: avg > 0 ? Math.round(avg * 10) / 10 : null },
        score,
        reasons,
      }
    })

    scored.sort((a, b) => b.score - a.score)
    const top = scored.slice(0, 9)
    return {
      matches: top,
      criteria: { concerns, mode, country: requestedCountry, language: requestedLanguage, dosha: body.dosha ?? null, budget },
    }
  })
}

export default route
