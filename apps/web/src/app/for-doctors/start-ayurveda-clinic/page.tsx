import type { Metadata } from 'next'
import { LandingPage } from '../../_gsc/LandingPage'
import { TOPIC_PAGES } from '../../_gsc/_topics'

const CONTENT = TOPIC_PAGES['for-doctors/start-ayurveda-clinic']

export const metadata: Metadata = {
  title: CONTENT.metaTitle,
  description: CONTENT.metaDescription,
  alternates: { canonical: '/for-doctors/start-ayurveda-clinic' },
  keywords: CONTENT.keywords,
  openGraph: { title: CONTENT.metaTitle, description: CONTENT.metaDescription, url: '/for-doctors/start-ayurveda-clinic', type: 'article' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function Page() {
  return (
    <LandingPage
      content={CONTENT}
      breadcrumb={[
        { name: 'Home', url: 'https://ayurconnect.com' },
        { name: 'For Doctors', url: 'https://ayurconnect.com/for-doctors' },
        { name: 'Start Ayurveda Clinic', url: 'https://ayurconnect.com/for-doctors/start-ayurveda-clinic' },
      ]}
      aboutName={'Start Ayurveda Clinic'}
      ctaHref={'/for-hospitals'}
      ctaLabel={'List your clinic →'}
    />
  )
}
