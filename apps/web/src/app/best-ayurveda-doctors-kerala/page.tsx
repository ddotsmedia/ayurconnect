import type { Metadata } from 'next'
import { LandingPage } from '../_gsc/LandingPage'
import { LANDINGS } from '../_gsc/_content'

const CONTENT = LANDINGS['best-ayurveda-doctors-kerala']

export const metadata: Metadata = {
  title: CONTENT.metaTitle,
  description: CONTENT.metaDescription,
  alternates: { canonical: '/best-ayurveda-doctors-kerala' },
  keywords: CONTENT.keywords,
  openGraph: { title: CONTENT.metaTitle, description: CONTENT.metaDescription, url: '/best-ayurveda-doctors-kerala', type: 'article' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function Page() {
  return (
    <LandingPage
      content={CONTENT}
      breadcrumb={[
        { name: 'Home', url: 'https://ayurconnect.com' },
        { name: 'Kerala Ayurveda Doctors', url: 'https://ayurconnect.com/best-ayurveda-doctors-kerala' },
      ]}
      aboutName={'Kerala Ayurveda Doctors'}
      ctaHref={'/doctors'}
      ctaLabel={'Search all doctors →'}
    />
  )
}
