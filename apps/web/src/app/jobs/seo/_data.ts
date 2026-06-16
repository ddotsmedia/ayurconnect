export const SPECIALIZATIONS = [
  { slug: 'panchakarma',     label: 'Panchakarma' },
  { slug: 'kayachikitsa',    label: 'Kayachikitsa' },
  { slug: 'shalya',          label: 'Shalya' },
  { slug: 'shalakya',        label: 'Shalakya' },
  { slug: 'prasuti-tantra',  label: 'Prasuti Tantra' },
  { slug: 'kaumarabhritya',  label: 'Kaumarabhritya' },
  { slug: 'manasika',        label: 'Manasika' },
  { slug: 'rasashastra',     label: 'Rasashastra' },
  { slug: 'yoga-therapy',    label: 'Yoga Therapy' },
  { slug: 'wellness-consultant', label: 'Wellness Consultant' },
]

export const LOCATIONS = [
  { slug: 'dubai',         label: 'Dubai',         country: 'AE' },
  { slug: 'abu-dhabi',     label: 'Abu Dhabi',     country: 'AE' },
  { slug: 'sharjah',       label: 'Sharjah',       country: 'AE' },
  { slug: 'qatar',         label: 'Qatar',         country: 'QA' },
  { slug: 'saudi-arabia',  label: 'Saudi Arabia',  country: 'SA' },
  { slug: 'kerala',        label: 'Kerala',        country: 'IN' },
  { slug: 'india',         label: 'India',         country: 'IN' },
  { slug: 'uk',            label: 'United Kingdom',country: 'GB' },
  { slug: 'usa',           label: 'United States', country: 'US' },
]

export const COUNTRIES = [
  { slug: 'uae',           label: 'UAE',          iso: 'AE' },
  { slug: 'qatar',         label: 'Qatar',        iso: 'QA' },
  { slug: 'saudi-arabia',  label: 'Saudi Arabia', iso: 'SA' },
  { slug: 'india',         label: 'India',        iso: 'IN' },
  { slug: 'oman',          label: 'Oman',         iso: 'OM' },
  { slug: 'kuwait',        label: 'Kuwait',       iso: 'KW' },
  { slug: 'bahrain',       label: 'Bahrain',      iso: 'BH' },
  { slug: 'uk',            label: 'UK',           iso: 'GB' },
  { slug: 'germany',       label: 'Germany',      iso: 'DE' },
  { slug: 'usa',           label: 'USA',          iso: 'US' },
]

// Salary benchmarks per specialization × location (monthly, full-time).
// Sourced from market research as of 2026 — directional, not contractual.
export const SALARY_BENCHMARKS: Record<string, Record<string, { min: number; max: number; currency: string }>> = {
  panchakarma: {
    'kerala':       { min:  35000, max:   85000, currency: 'INR' },
    'dubai':        { min:   8000, max:   18000, currency: 'AED' },
    'abu-dhabi':    { min:   8500, max:   19000, currency: 'AED' },
    'qatar':        { min:   9000, max:   18000, currency: 'QAR' },
    'saudi-arabia': { min:   8000, max:   16000, currency: 'SAR' },
  },
  kayachikitsa: {
    'kerala':       { min:  30000, max:   75000, currency: 'INR' },
    'dubai':        { min:   7500, max:   16000, currency: 'AED' },
    'abu-dhabi':    { min:   8000, max:   17000, currency: 'AED' },
    'qatar':        { min:   8500, max:   17000, currency: 'QAR' },
  },
  shalya: {
    'kerala':       { min:  35000, max:   80000, currency: 'INR' },
    'dubai':        { min:   8000, max:   17000, currency: 'AED' },
  },
  'prasuti-tantra': {
    'kerala':       { min:  32000, max:   78000, currency: 'INR' },
    'dubai':        { min:   8000, max:   17000, currency: 'AED' },
  },
  'wellness-consultant': {
    'kerala':       { min:  25000, max:   60000, currency: 'INR' },
    'dubai':        { min:   7000, max:   14000, currency: 'AED' },
    'uk':           { min:   2200, max:    4500, currency: 'GBP' },
    'usa':          { min:   4000, max:    8500, currency: 'USD' },
  },
}
