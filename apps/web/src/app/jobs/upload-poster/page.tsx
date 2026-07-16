import Link from 'next/link'
import type { Metadata } from 'next'
import { Upload, Sparkles, Rocket } from 'lucide-react'
import { GradientHero } from '@ayurconnect/ui'
import { PosterUploader } from './_client'
import { breadcrumbLd, ldGraph } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Post Ayurveda Jobs from Poster Image — AI Reader',
  description: 'Upload any Ayurveda job poster or WhatsApp screenshot. Our AI extracts every detail automatically — title, salary, location, walk-in date, contact. Edit and post in seconds.',
  alternates: { canonical: '/jobs/upload-poster' },
  keywords: ['post ayurveda job', 'ayurveda job poster', 'AI job extractor', 'WhatsApp job post', 'ayurveda recruitment tool'],
  openGraph: { title: 'Post an Ayurveda job from a poster image', description: 'AI reads your poster and fills the form automatically.', url: '/jobs/upload-poster', type: 'website' },
  other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
}

export default function UploadPosterPage() {
  const jsonLd = ldGraph(
    breadcrumbLd([
      { name: 'Home',           url: 'https://ayurconnect.com' },
      { name: 'Jobs',           url: 'https://ayurconnect.com/jobs' },
      { name: 'Upload Poster',  url: 'https://ayurconnect.com/jobs/upload-poster' },
    ]),
    {
      '@type': 'WebPage',
      name: 'Post an Ayurveda job from a poster image',
      description: 'AI-powered poster reader that fills the job posting form automatically.',
      url: 'https://ayurconnect.com/jobs/upload-poster',
    },
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Sparkles className="w-3 h-3" /> AI-powered · Free
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight">Post a Job from a Poster</h1>
          <p className="text-white/85 mt-3 text-sm md:text-base">Upload any Ayurveda job poster — our AI reads it automatically and fills the posting form for you.</p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10 max-w-5xl">
        {/* 3-step visual */}
        <ol className="grid grid-cols-3 gap-3 mb-8">
          {[
            { n: 1, icon: Upload, label: 'Upload poster', sub: 'JPG · PNG · WhatsApp screenshot' },
            { n: 2, icon: Sparkles, label: 'AI reads it', sub: 'Extracts every detail' },
            { n: 3, icon: Rocket, label: 'Job goes live', sub: 'Edit &amp; submit in seconds' },
          ].map((s) => {
            const Icon = s.icon
            return (
              <li key={s.n} className="bg-white border border-gray-100 rounded-card p-4 text-center">
                <div className="w-9 h-9 rounded-full bg-kerala-700 text-white font-bold flex items-center justify-center mx-auto">{s.n}</div>
                <Icon className="w-5 h-5 text-kerala-700 mt-3 mx-auto" />
                <p className="font-semibold text-ink mt-2 text-sm" dangerouslySetInnerHTML={{ __html: s.label }} />
                <p className="text-[11px] text-gray-500 mt-0.5" dangerouslySetInnerHTML={{ __html: s.sub }} />
              </li>
            )
          })}
        </ol>

        <PosterUploader />

        <div className="mt-8 bg-cream border border-gray-100 rounded-card p-4 text-xs text-gray-700 leading-relaxed">
          <p><strong>Tips:</strong> Use clear photos with good lighting. Works well with WhatsApp screenshots, printed posters, and social media job cards. Malayalam + English text both supported.</p>
          <p className="mt-2">Prefer to type? <Link href="/jobs/employers/post" className="text-kerala-700 underline">Fill the full form manually</Link> · or use <Link href="/jobs/quick-post" className="text-kerala-700 underline">Quick Post (30 seconds)</Link>.</p>
        </div>
      </section>
    </>
  )
}
