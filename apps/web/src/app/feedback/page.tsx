import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { MessageSquare } from 'lucide-react'
import { getServerSession } from '../../lib/auth'
import { pageMetadata } from '../../lib/seo'
import { FeedbackForm } from './_client'

export const metadata: Metadata = pageMetadata({
  path: '/feedback',
  title: 'Feedback & Suggestions',
  description: 'Share feedback, suggestions, bug reports, or feature requests. Help us improve AyurConnect.',
  keywords: ['ayurconnect feedback', 'feedback form', 'suggestions'],
})

export default async function FeedbackPage() {
  const sess = await getServerSession()
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <MessageSquare className="w-3 h-3" /> We read every message
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Feedback &amp; Suggestions</h1>
          <p className="text-white/85 mt-3">Help us improve AyurConnect — your feedback matters.</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-2xl">
        <FeedbackForm prefillName={sess?.user.name ?? ''} prefillEmail={sess?.user.email ?? ''} />
      </section>
    </>
  )
}
