import type { Metadata } from 'next'
import { AUDIENCE_PAGES } from '../_audience/_content'
import { AudienceLandingPage } from '../_audience/AudienceLandingPage'

const page = AUDIENCE_PAGES['for-doctors']

export const metadata: Metadata = {
  title: page.title,
  description: page.metaDescription,
  alternates: { canonical: '/for-doctors' },
  keywords: page.keywords,
  openGraph: { title: page.title, description: page.ogSummary, url: '/for-doctors', type: 'website' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function Page() {
  return <AudienceLandingPage page={page} path="/for-doctors" breadcrumb={[{"name":"Home","url":"https://ayurconnect.com"},{"name":"For Doctors","url":"https://ayurconnect.com/for-doctors"}]} variant='green' />
}
