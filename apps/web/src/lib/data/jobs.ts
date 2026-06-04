import type { Specialty, Currency, EmploymentType } from '../types/jobs'

export const SPECIALTIES: Specialty[] = [
  'Kayachikitsa', 'Panchakarma', 'Prasuti Tantra', 'Kaumarbhritya', 'Shalya',
  'Shalakya', 'Manasika', 'Rasashastra', 'General Practice', 'Research',
  'Online Consultation',
]

export const EMPLOYMENT_TYPES: EmploymentType[] = ['Full-time', 'Part-time', 'Contract', 'Locum']

export const QUALIFICATIONS = ['BAMS', 'BAMS + MD', 'BAMS + MS', 'BAMS + PhD']

export const BENEFITS = [
  'Housing', 'Visa', 'Insurance', 'Relocation', 'Malpractice Cover', 'CME Allowance',
]

export const CURRENCIES: Currency[] = ['INR', 'AED', 'USD']

export const DOCTOR_LOOKING_FOR = [
  'Locum Cover', 'Part-time', 'Collaboration', 'Research Partner',
] as const

export const KERALA_DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode',
  'Wayanad', 'Kannur', 'Kasaragod',
]

export const UAE_CITIES = ['Dubai', 'Abu Dhabi', 'Sharjah']

export const ALL_LOCATIONS = [...KERALA_DISTRICTS, ...UAE_CITIES, 'Remote']

export const LOGO_COLORS = [
  'bg-kerala-700', 'bg-amber-600', 'bg-blue-600', 'bg-rose-600',
  'bg-purple-600', 'bg-teal-600', 'bg-emerald-600', 'bg-indigo-600',
]

export function deriveLogoInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('') || '??'
}

export function deriveLogoColor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return LOGO_COLORS[Math.abs(h) % LOGO_COLORS.length]
}

export function formatSalary(min?: number | null, max?: number | null, currency?: string | null): string | null {
  if (!min && !max) return null
  const sym = currency === 'AED' ? 'AED ' : currency === 'USD' ? '$' : '₹'
  if (min && max && min !== max) return `${sym}${min.toLocaleString()} – ${sym}${max.toLocaleString()}`
  return `${sym}${(min ?? max ?? 0).toLocaleString()}`
}
