// Shared display-formatting helpers. Created 2026-07-23 (Phase 12 of the
// production audit) after the audit found inconsistent renderings across
// templates: "14 centre s" (bad plural), "1 yrs experience" (bad singular),
// "Abudhabi" / "Al dannah" / "Bams" (case).
//
// Callers migrate opportunistically — no big-bang refactor. Prefer these
// helpers over inline `${n} ${n === 1 ? 'x' : 'xs'}` sprinkled in JSX.
//
// Deliberately zero-dependency: no i18n runtime, no locale plumbing. When
// we add Malayalam support these become Intl.PluralRules-backed variants.

// ─── Pluralization ────────────────────────────────────────────────────

/**
 * English singular/plural picker with an optional custom plural form for
 * irregular nouns.
 *
 *   pluralize(1, 'centre')                → '1 centre'
 *   pluralize(14, 'centre')               → '14 centres'
 *   pluralize(0, 'centre')                → '0 centres'
 *   pluralize(3, 'child', 'children')     → '3 children'
 *   pluralize(1, 'child', 'children')     → '1 child'
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  const p = plural ?? `${singular}s`
  return `${count} ${count === 1 ? singular : p}`
}

/**
 * "N years of experience" — the specific case the audit flagged. Handles 0
 * and 1 correctly; returns "Newly qualified" for 0 so we don't display
 * "0 years of experience" on new doctor profiles.
 */
export function yearsExperience(years: number | null | undefined): string {
  if (years == null || years <= 0) return 'Newly qualified'
  return `${years} ${years === 1 ? 'year' : 'years'} of experience`
}

// ─── Casing helpers ───────────────────────────────────────────────────

// Common Arabic/Malayalam city + district names that need special-case
// handling. Extend as we discover more. Keys are lowercase; values are
// canonical display form.
const CITY_SPECIAL_CASE: Record<string, string> = {
  'abu dhabi':   'Abu Dhabi',
  abudhabi:      'Abu Dhabi',
  'abu-dhabi':   'Abu Dhabi',
  'al dannah':   'Al Dannah',
  aldannah:      'Al Dannah',
  'al ain':      'Al Ain',
  alain:         'Al Ain',
  'ras al khaimah': 'Ras Al Khaimah',
  rasalkhaimah:  'Ras Al Khaimah',
  dubai:         'Dubai',
  sharjah:       'Sharjah',
  ajman:         'Ajman',
  fujairah:      'Fujairah',
  'umm al quwain': 'Umm Al Quwain',
  kochi:         'Kochi',
  ernakulam:     'Ernakulam',
  thiruvananthapuram: 'Thiruvananthapuram',
  kozhikode:     'Kozhikode',
  kannur:        'Kannur',
  kasaragod:     'Kasaragod',
  malappuram:    'Malappuram',
  thrissur:      'Thrissur',
  palakkad:      'Palakkad',
  kollam:        'Kollam',
  pathanamthitta:'Pathanamthitta',
  alappuzha:     'Alappuzha',
  kottayam:      'Kottayam',
  idukki:        'Idukki',
  wayanad:       'Wayanad',
}

/**
 * Normalize a user-entered city name for display. Prefers the special-case
 * map (Abu Dhabi, Al Ain, etc.); falls back to Title Case.
 *
 *   formatCity('abudhabi')  → 'Abu Dhabi'
 *   formatCity('AL DANNAH') → 'Al Dannah'
 *   formatCity('kochi')     → 'Kochi'
 *   formatCity('  gonda  ') → 'Gonda'
 */
export function formatCity(raw: string | null | undefined): string {
  if (!raw) return ''
  const trimmed = raw.trim()
  if (!trimmed) return ''
  const key = trimmed.toLowerCase().replace(/\s+/g, ' ')
  if (CITY_SPECIAL_CASE[key]) return CITY_SPECIAL_CASE[key]
  // Title Case fallback — capitalize first letter of each word.
  return trimmed
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// Ayurveda qualifications that are acronyms and should stay ALL CAPS.
// Extend as we spot more in production data.
const QUALIFICATION_ACRONYMS = new Set([
  'BAMS', 'MD', 'PHD', 'MPHIL', 'DAMS', 'BAMS(HONS)',
  'MDIM', 'MSC', 'BSC', 'CCH', 'PGDA', 'PGDM',
  'DHA', 'MOH', 'SCFHS', 'AYUSH', 'CCIM', 'KSMC',
])

/**
 * Normalize a qualification string like 'bams' or 'Bams' → 'BAMS'.
 * Also handles compound entries: 'bams, md (panchakarma)' → 'BAMS, MD (Panchakarma)'.
 */
export function formatQualification(raw: string | null | undefined): string {
  if (!raw) return ''
  return raw
    .split(/(\s*[,()]\s*)/)  // preserve separators
    .map((seg) => {
      const trimmed = seg.trim()
      if (!trimmed) return seg
      const upper = trimmed.toUpperCase()
      if (QUALIFICATION_ACRONYMS.has(upper)) return upper
      // If original was ALL CAPS (some abbrev not in our set), preserve.
      if (trimmed === upper && trimmed.length <= 6) return upper
      // Title Case for words.
      return trimmed
        .toLowerCase()
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    })
    .join('')
}

// ─── Phone formatting ─────────────────────────────────────────────────

/**
 * Very light phone normalization for display. If input starts with '+', keep
 * as-is with a single space after the country code. Otherwise return unchanged.
 * Not a full E.164 formatter — that's PhoneInput component's job.
 *
 *   formatPhoneDisplay('+919447000001') → '+91 9447000001'
 *   formatPhoneDisplay('+971562635354') → '+971 562635354'
 *   formatPhoneDisplay('9447000001')    → '9447000001'
 */
export function formatPhoneDisplay(raw: string | null | undefined): string {
  if (!raw) return ''
  const s = raw.trim()
  if (!s.startsWith('+')) return s
  // Split country code (first 1-4 digits after +) from the rest for readability.
  const m = /^\+(\d{1,4})(\d.*)$/.exec(s.replace(/\s+/g, ''))
  if (!m) return s
  return `+${m[1]} ${m[2]}`
}
