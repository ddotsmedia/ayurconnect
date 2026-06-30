import type { Metadata } from 'next'
import { AUDIENCE_PAGES } from '../../_audience/_content'
import { AudienceLandingPage } from '../../_audience/AudienceLandingPage'

const page = AUDIENCE_PAGES['for-students/aiapget']

export const metadata: Metadata = {
  title: page.title,
  description: page.metaDescription,
  alternates: { canonical: '/for-students/aiapget' },
  keywords: page.keywords,
  openGraph: { title: page.title, description: page.ogSummary, url: '/for-students/aiapget', type: 'website' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function Page() {
  return <AudienceLandingPage page={page} path="/for-students/aiapget" breadcrumb={[{"name":"Home","url":"https://ayurconnect.com"},{"name":"For Students","url":"https://ayurconnect.com/for-students"},{"name":"aiapget","url":"https://ayurconnect.com/for-students/aiapget"}]} variant='tourism' />
}
