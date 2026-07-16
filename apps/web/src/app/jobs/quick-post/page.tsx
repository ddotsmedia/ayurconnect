import type { Metadata } from 'next'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { GradientHero } from '@ayurconnect/ui'
import { QuickPostForm } from './_client'
import { breadcrumbLd, ldGraph } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Quick Post Ayurveda Job — 30 Seconds',
  description: 'Post an Ayurveda job in 30 seconds. Just title, location, and WhatsApp number. No login required. Admin reviews and publishes within a few hours.',
  alternates: { canonical: '/jobs/quick-post' },
  keywords: ['post ayurveda job free', 'quick job post', 'walk-in ayurveda', 'BAMS job posting', 'ayurveda hiring'],
  openGraph: { title: 'Quick Post Ayurveda Job — 30 Seconds', description: 'Post a job in 30 seconds. No login.', url: '/jobs/quick-post', type: 'website' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function QuickPostPage() {
  const jsonLd = ldGraph(
    breadcrumbLd([
      { name: 'Home',       url: 'https://ayurconnect.com' },
      { name: 'Jobs',       url: 'https://ayurconnect.com/jobs' },
      { name: 'Quick Post', url: 'https://ayurconnect.com/jobs/quick-post' },
    ]),
    { '@type': 'WebPage', name: 'Quick Post — 30 second Ayurveda job', url: 'https://ayurconnect.com/jobs/quick-post' },
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Zap className="w-3 h-3" /> 30 seconds · no login
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight">Quick Post — 30 Seconds</h1>
          <p className="text-white/85 mt-3 text-sm md:text-base">Just title, location, and WhatsApp. That&apos;s it. Admin will review and publish.</p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-8 max-w-2xl">
        <QuickPostForm />
        <p className="mt-5 text-xs text-gray-600 text-center">
          Need more detail? <Link href="/jobs/employers/post" className="text-kerala-700 underline">Fill the full form</Link> · Have a poster? <Link href="/jobs/upload-poster" className="text-kerala-700 underline">Upload it and let AI do the work</Link>.
        </p>
      </section>
    </>
  )
}
