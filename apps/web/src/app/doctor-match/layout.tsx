import type { Metadata } from 'next'
import type { ReactNode } from 'react'

// Server-side metadata for the client-component page.tsx below.
// Canonical strips query params (specialty, condition, etc.) so
// filtered variants don't get indexed as duplicates in GSC.
export const metadata: Metadata = {
  title: 'AI Doctor Match — 30-Second Quiz | AyurConnect',
  description: 'AI-powered Ayurveda doctor match — 30-second quiz ranks verified BAMS + MD specialists by your condition, language, and budget.',
  alternates: { canonical: '/doctor-match' },
}

export default function DoctorMatchLayout({ children }: { children: ReactNode }) {
  return children
}
