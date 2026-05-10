// Lightweight, deterministic match-score for Ayurveda jobs against a user's
// profile. No AI call — pure scoring keeps latency <1ms per job and saves
// LLM quota. Tuned for the imported Kerala Ayurveda job dataset.
//
// Score = sum of weighted matches, capped at 100:
//   specialisation match  +40
//   district match        +20
//   qualification (BAMS / MD / etc.)  +20
//   experience tier match +10
//   language match        +10
//
// Returns { score, label } where label is one of:
//   'Excellent match' (>= 70)  | 'Good match' (40-69)  | 'Partial match' (< 40)

export type JobLike = {
  title?:          string | null
  organization?:   string | null
  location?:       string | null
  description?:    string | null
  qualifications?: string | null
  category?:       string | null
}

export type UserProfileLike = {
  specialization?:  string | null
  district?:        string | null
  qualification?:   string | null
  experienceYears?: number | null
  languages?:       string[] | null
}

export type MatchResult = { score: number; label: 'Excellent match' | 'Good match' | 'Partial match' }

const SPECIALISATIONS = [
  'panchakarma', 'kayachikitsa', 'prasuti', 'kaumarbhritya', 'shalya',
  'shalakya', 'manasika', 'rasashastra', 'dravyaguna', 'roganidana',
]

function normaliseText(...parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join(' ').toLowerCase()
}

export function scoreJobMatch(job: JobLike, profile: UserProfileLike): MatchResult {
  const jobBlob  = normaliseText(job.title, job.organization, job.description, job.qualifications, job.category, job.location)
  let score = 0

  // Specialisation match (+40). Doctor's specialisation appears in the job text.
  const userSpec = (profile.specialization ?? '').toLowerCase()
  if (userSpec) {
    const tokens = userSpec.split(/[,/|\s-]+/).filter(Boolean)
    if (tokens.some((t) => t.length > 3 && jobBlob.includes(t))) {
      score += 40
    } else if (SPECIALISATIONS.some((s) => userSpec.includes(s) && jobBlob.includes(s))) {
      score += 40
    }
  }

  // District match (+20)
  const district = (profile.district ?? '').toLowerCase()
  if (district && jobBlob.includes(district)) score += 20

  // Qualification match (+20). BAMS / MD (Ayurveda) / PhD etc.
  const userQual = (profile.qualification ?? '').toLowerCase()
  if (userQual) {
    const matched = userQual.match(/\b(bams|md|ms|phd|bsc|msc|diploma|aiim)\b/gi)
    const qualTokens: string[] = matched ? Array.from(matched) : []
    if (qualTokens.some((q) => jobBlob.includes(q.toLowerCase()))) score += 20
  }

  // Experience tier match (+10)
  const yrs = profile.experienceYears ?? 0
  if (yrs > 0) {
    // Pull years-required hints from job text — patterns like "5+ years" / "minimum 3 years"
    const m = jobBlob.match(/(\d+)\s*\+?\s*(?:to\s*\d+\s*)?(?:years?|yrs?)/)
    if (m) {
      const required = Number(m[1])
      if (yrs >= required) score += 10
      else if (yrs + 1 >= required) score += 5 // close-enough partial credit
    } else {
      // No explicit requirement — give partial credit if we have any experience
      score += 5
    }
  }

  // Language match (+10)
  const langs = (profile.languages ?? []).map((l) => l.toLowerCase())
  if (langs.length && langs.some((l) => l.length > 2 && jobBlob.includes(l))) score += 10

  if (score > 100) score = 100

  const label: MatchResult['label'] =
    score >= 70 ? 'Excellent match' :
    score >= 40 ? 'Good match' :
                  'Partial match'

  return { score, label }
}
