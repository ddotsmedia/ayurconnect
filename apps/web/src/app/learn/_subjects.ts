export type BamsYear = '1st_year' | '2nd_year' | '3rd_year' | 'final_year' | 'pg'

export type Subject = { slug: string; name: string; nameMl?: string; year: BamsYear; sortOrder: number }

export const YEAR_LABEL: Record<BamsYear, string> = {
  '1st_year': '1st Year',
  '2nd_year': '2nd Year',
  '3rd_year': '3rd Year',
  'final_year': 'Final Year',
  'pg': 'PG',
}

export const SUBJECTS: Subject[] = [
  { slug: 'padartha-vigyana',          name: 'Padartha Vigyana',                year: '1st_year', sortOrder: 1, nameMl: 'പദാർത്ഥ വിജ്ഞാനം' },
  { slug: 'ayurveda-ithihasa',         name: 'Ayurveda Ithihasa',               year: '1st_year', sortOrder: 2 },
  { slug: 'sanskrit',                  name: 'Sanskrit',                        year: '1st_year', sortOrder: 3 },
  { slug: 'rachana-sharira',           name: 'Rachana Sharira',                 year: '1st_year', sortOrder: 4 },
  { slug: 'kriya-sharira',             name: 'Kriya Sharira',                   year: '1st_year', sortOrder: 5 },

  { slug: 'dravyaguna-vigyana',        name: 'Dravyaguna Vigyana',              year: '2nd_year', sortOrder: 1 },
  { slug: 'rasashastra',               name: 'Rasashastra & Bhaishajya Kalpana', year: '2nd_year', sortOrder: 2 },
  { slug: 'roga-nidana',               name: 'Roga Nidana',                     year: '2nd_year', sortOrder: 3 },
  { slug: 'swasthavritta',             name: 'Swasthavritta',                   year: '2nd_year', sortOrder: 4 },

  { slug: 'agada-tantra',              name: 'Agada Tantra',                    year: '3rd_year', sortOrder: 1 },
  { slug: 'prasuti-tantra',            name: 'Prasuti Tantra & Stree Roga',     year: '3rd_year', sortOrder: 2 },
  { slug: 'kaumarabhritya',            name: 'Kaumarabhritya',                  year: '3rd_year', sortOrder: 3 },
  { slug: 'charaka-samhita',           name: 'Charaka Samhita',                 year: '3rd_year', sortOrder: 4 },

  { slug: 'kayachikitsa',              name: 'Kayachikitsa',                    year: 'final_year', sortOrder: 1 },
  { slug: 'shalya-tantra',             name: 'Shalya Tantra',                   year: 'final_year', sortOrder: 2 },
  { slug: 'shalakya-tantra',           name: 'Shalakya Tantra',                 year: 'final_year', sortOrder: 3 },
  { slug: 'panchakarma',               name: 'Panchakarma',                     year: 'final_year', sortOrder: 4 },
  { slug: 'research-methodology',      name: 'Research Methodology',            year: 'final_year', sortOrder: 5 },
]

export const SUBJECT_BY_SLUG = Object.fromEntries(SUBJECTS.map((s) => [s.slug, s]))

export function subjectsByYear(year: BamsYear): Subject[] { return SUBJECTS.filter((s) => s.year === year).sort((a, b) => a.sortOrder - b.sortOrder) }
