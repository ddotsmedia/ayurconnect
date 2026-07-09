import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Plane, ChevronRight } from 'lucide-react'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../../lib/seo'
import { PlannerForm } from './_form'

export const metadata: Metadata = pageMetadata({
  title: 'AI Ayurveda Trip Planner — Plan Your Kerala Treatment',
  description:
    'Tell us your condition, dates, budget and origin city and get a structured Kerala Ayurveda treatment package — recommended therapy, duration, accredited-centre guidance, stay, visa and indicative cost. A reviewable plan, not a payment.',
  path: '/heal-in-kerala/plan',
})

export default function PlanPage() {
  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home', url: '/' },
      { name: 'Heal in Kerala', url: '/heal-in-kerala' },
      { name: 'Trip Planner', url: '/heal-in-kerala/plan' },
    ]),
  )
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="tourism">
        <nav className="text-sm text-white/70 mb-3">
          <Link href="/heal-in-kerala" className="hover:text-white">Heal in Kerala</Link> <span className="mx-1">/</span> Trip Planner
        </nav>
        <p className="text-gold-200 font-medium mb-2 flex items-center gap-2">
          <Plane className="w-4 h-4" /> AI Trip Planner
        </p>
        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4 max-w-3xl">
          Plan your Kerala Ayurveda treatment
        </h1>
        <p className="text-white/90 max-w-2xl text-lg">
          Get a structured, indicative package — therapy, duration, the kind of accredited centre to
          choose, stay, visa guidance and an estimated cost. Review it, then submit as an enquiry.
        </p>
      </GradientHero>

      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <PlannerForm />
        <div className="mt-10 rounded-2xl bg-kerala-50 p-5 text-sm text-gray-600">
          This planner produces an indicative plan only — not a diagnosis, prescription, or confirmed
          booking. Treatment, centre and cost are finalised after a consultation with a verified
          doctor. Ready to proceed?{' '}
          <Link href="/heal-in-kerala#enquiry" className="text-kerala-700 font-medium hover:underline inline-flex items-center gap-1">
            Submit an enquiry <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}
