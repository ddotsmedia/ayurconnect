import type { Metadata } from 'next'
import { LandingPage } from '../_gsc/LandingPage'
import { LANDINGS } from '../_gsc/_content'

const CONTENT = LANDINGS['ayurveda-hospitals-kerala']

export const metadata: Metadata = {
  title: CONTENT.metaTitle,
  description: CONTENT.metaDescription,
  alternates: { canonical: '/ayurveda-hospitals-kerala' },
  keywords: CONTENT.keywords,
  openGraph: { title: CONTENT.metaTitle, description: CONTENT.metaDescription, url: '/ayurveda-hospitals-kerala', type: 'article' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function Page() {
  return (
    <LandingPage
      content={CONTENT}
      breadcrumb={[
        { name: 'Home', url: 'https://ayurconnect.com' },
        { name: 'Kerala Ayurveda Hospitals', url: 'https://ayurconnect.com/ayurveda-hospitals-kerala' },
      ]}
      aboutName={'Kerala Ayurveda Hospitals'}
      ctaHref={'/hospitals?country=IN&state=Kerala'}
      ctaLabel={'View Kerala hospitals →'}
    />
  )
}
