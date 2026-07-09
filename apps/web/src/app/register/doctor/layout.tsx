import type { Metadata } from 'next'
import type { ReactNode } from 'react'

// Server-side metadata for the client-component page.tsx below.
// Canonical strips query params (?ref=ambassador, ?country=DE, etc.)
// so Google doesn't index every referral or geo variant separately.
export const metadata: Metadata = {
  title: 'Register as Ayurveda Doctor — Free Profile',
  description: 'Create your verified professional profile on AyurConnect — free forever. BAMS, MD Ayurveda, and Panchakarma specialists welcome.',
  alternates: { canonical: '/register/doctor' },
}

export default function DoctorRegisterLayout({ children }: { children: ReactNode }) {
  return children
}
