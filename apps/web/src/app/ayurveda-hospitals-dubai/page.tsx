import type { Metadata } from 'next'
import { LandingPage } from '../_gsc/LandingPage'
import { LANDINGS } from '../_gsc/_content'

const CONTENT = LANDINGS['ayurveda-hospitals-dubai']

export const metadata: Metadata = {
  title: CONTENT.metaTitle,
  description: CONTENT.metaDescription,
  alternates: { canonical: '/ayurveda-hospitals-dubai' },
  keywords: CONTENT.keywords,
  openGraph: { title: CONTENT.metaTitle, description: CONTENT.metaDescription, url: '/ayurveda-hospitals-dubai', type: 'article' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function Page() {
  return (
    <LandingPage
      content={CONTENT}
      breadcrumb={[
        { name: 'Home', url: 'https://ayurconnect.com' },
        { name: 'Ayurveda Hospitals in Dubai', url: 'https://ayurconnect.com/ayurveda-hospitals-dubai' },
      ]}
      aboutName={'Dubai Ayurveda Hospitals'}
      ctaHref={'/hospitals'}
      ctaLabel={'View all hospitals →'}
    />
  )
}
