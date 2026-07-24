export function formatExperience(years: number | null | undefined): string {
  if (years == null) return ''
  return years === 1 ? '1 year of experience' : `${years} years of experience`
}

export function formatQualification(q: string | null | undefined): string {
  if (!q) return ''
  return q.replace(/\bbams\b/gi, 'BAMS').replace(/\bmd\b/gi, 'MD').replace(/\bphd\b/gi, 'PhD')
}

export function formatCity(city: string | null | undefined): string {
  if (!city) return ''
  const known: Record<string, string> = {
    'abudhabi': 'Abu Dhabi',
    'al dannah': 'Al Danah',
  }
  const lower = city.toLowerCase()
  return known[lower] ?? city
}

export function formatLanguage(lang: string | null | undefined): string {
  if (!lang) return ''
  return lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase()
}