// Shared role-type + specialization catalogues for the job posting +
// browsing surfaces. Doctor jobs continue to use the classical BAMS/MD
// specialty list; therapist jobs use the hands-on Panchakarma-therapy
// specialty list; consultant jobs cover wellness / lifestyle roles.

export type RoleType = 'doctor' | 'therapist' | 'consultant'

export const ROLE_TYPES: Array<{ value: RoleType; label: string; emoji: string; blurb: string }> = [
  { value: 'doctor',     label: 'Doctor',     emoji: '👨‍⚕️', blurb: 'BAMS / MD Ayurveda physicians (Kayachikitsa, Panchakarma, Prasuti, etc.)' },
  { value: 'therapist',  label: 'Therapist',  emoji: '💆',   blurb: 'Panchakarma, Abhyanga, Shirodhara, Kizhi therapists — certified operators' },
  { value: 'consultant', label: 'Consultant', emoji: '🌿',   blurb: 'Wellness / lifestyle / dietary consultants (BNYS, nutrition, yoga)' },
]

export const DOCTOR_SPECIALIZATIONS = [
  'General BAMS', 'Kayachikitsa', 'Panchakarma', 'Prasuti & Stree Roga',
  'Kaumarabhritya', 'Shalya Tantra', 'Shalakya Tantra', 'Rasashastra',
  'Manasika', 'Roganidana', 'Dravyaguna', 'Locum',
]

export const THERAPIST_SPECIALIZATIONS = [
  'Panchakarma Therapist',
  'Abhyanga Therapist',
  'Shirodhara Therapist',
  'Nasya Therapist',
  'Swedana Therapist',
  'Vazhichil / Pizhichil Therapist',
  'Njavarakizhi / Kizhi Therapist',
  'Marma Therapist',
  'General Ayurveda Therapist',
]

export const CONSULTANT_SPECIALIZATIONS = [
  'Wellness Consultant',
  'Nutrition / Diet Consultant',
  'Yoga Instructor',
  'Naturopathy (BNYS)',
  'Spa Manager',
]

export function specializationsFor(role: RoleType): string[] {
  switch (role) {
    case 'therapist':  return THERAPIST_SPECIALIZATIONS
    case 'consultant': return CONSULTANT_SPECIALIZATIONS
    default:           return DOCTOR_SPECIALIZATIONS
  }
}
