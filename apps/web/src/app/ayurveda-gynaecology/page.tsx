import type { Metadata } from 'next'
import { LandingPage } from '../_gsc/LandingPage'
import { TOPIC_PAGES } from '../_gsc/_topics'

const CONTENT = TOPIC_PAGES['ayurveda-gynaecology']

export const metadata: Metadata = {
  title: CONTENT.metaTitle,
  description: CONTENT.metaDescription,
  alternates: { canonical: '/ayurveda-gynaecology' },
  keywords: CONTENT.keywords,
  openGraph: { title: CONTENT.metaTitle, description: CONTENT.metaDescription, url: '/ayurveda-gynaecology', type: 'article' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function Page() {
  return (
    <LandingPage
      content={CONTENT}
      breadcrumb={[
        { name: 'Home', url: 'https://ayurconnect.com' },
        { name: 'Ayurveda Gynaecology', url: 'https://ayurconnect.com/ayurveda-gynaecology' },
      ]}
      aboutName={'Ayurveda Gynaecology'}
      ctaHref={'/doctors/specialization/prasuti-tantra'}
      ctaLabel={'Find gynaecology specialists →'}
    />
  )
}
