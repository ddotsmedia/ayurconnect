import type { Metadata } from 'next'
import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { ShieldAlert, Leaf, Pill, ChevronRight } from 'lucide-react'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../lib/seo'
import { InteractionCheckerForm } from './_form'

export const metadata: Metadata = pageMetadata({
  path: '/interaction-checker',
  title:       'Herb–Drug Interaction Checker | Ayurvedic Safety | AyurConnect',
  description: 'Check whether your Ayurvedic herbs interact with allopathic medications. Curated clinical pairs (Ashwagandha + thyroxine, Guggulu + statins, turmeric + warfarin, more). Educational only — confirm with a verified doctor.',
  keywords:    ['herb drug interaction', 'ayurveda interactions', 'ashwagandha thyroxine', 'turmeric warfarin', 'safety checker'],
})

export default function InteractionCheckerPage() {
  const ld = ldGraph(breadcrumbLd([
    { name: 'Home',                  url: '/' },
    { name: 'Tools',                 url: '/doctor-match' },
    { name: 'Interaction Checker',   url: '/interaction-checker' },
  ]))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <ShieldAlert className="w-3 h-3" /> Clinical safety tool
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">
            Herb–Drug Interaction Checker
          </h1>
          <p className="mt-5 text-lg text-white/80">
            Check whether your Ayurvedic herbs interact with allopathic medications.
            Curated by clinical-pharmacology reviewers, with cautious AI fallback for uncommon pairs.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 p-4 rounded-card bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold mb-1">Educational only — not a diagnosis.</p>
            <p className="leading-relaxed">
              This tool is not a substitute for clinical judgement. Always discuss any
              combination of Ayurvedic herbs and prescription medications with a verified Ayurveda doctor + your prescribing physician
              before starting or stopping anything. <strong>Do not stop a prescribed medication based on this checker.</strong>
            </p>
          </div>
        </div>

        <InteractionCheckerForm />

        <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
            <Leaf className="w-6 h-6 text-kerala-700 mb-2" />
            <h3 className="font-serif text-lg text-ink">How the checker works</h3>
            <p className="text-sm text-gray-700 mt-1 leading-relaxed">
              Every red &quot;avoid&quot; or amber &quot;caution&quot; result with a clinical-effect note comes from our
              curated database, written by clinical-pharmacology reviewers with citations. For pairs not yet
              in the curated set, an AI-generated note is shown, capped at &quot;caution&quot; severity — those
              are explicitly marked.
            </p>
          </article>
          <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
            <Pill className="w-6 h-6 text-kerala-700 mb-2" />
            <h3 className="font-serif text-lg text-ink">Found a serious flag?</h3>
            <p className="text-sm text-gray-700 mt-1 leading-relaxed">
              Book a consult with a verified Ayurveda doctor + carry your prescription list to discuss.
              Doctors on AyurConnect have access to the full clinical-grade interaction database.
            </p>
            <Link href="/doctors" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-kerala-700 hover:underline">
              Browse verified doctors <ChevronRight className="w-4 h-4" />
            </Link>
          </article>
        </section>

        <p className="mt-10 text-center text-xs text-gray-500 leading-relaxed">
          Reviewed by clinical pharmacologists. This tool is for informational use only and does not constitute
          medical advice. AyurConnect is not a substitute for the prescribing physician–patient relationship.
        </p>
      </section>
    </>
  )
}
