import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Building2 } from 'lucide-react'
import { pageMetadata } from '../../../../lib/seo'
import { EmployerRegisterClient } from './_client'

export const metadata: Metadata = pageMetadata({
  path: '/jobs/employers/register',
  title: 'Hire Ayurveda Talent — Register Your Hospital | AyurConnect Jobs',
  description: 'Register your Ayurveda hospital, clinic, or wellness centre on AyurConnect Jobs. Post jobs, search candidates, AI-matched hiring.',
  keywords: ['ayurveda employer registration', 'post ayurveda job', 'hire BAMS doctor', 'ayurveda recruiter'],
})

export default function EmployerRegisterPage() {
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4"><Building2 className="w-3 h-3" /> Employer registration · Free starter tier</span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Hire Ayurveda Talent Globally</h1>
          <p className="text-white/85 mt-3 max-w-2xl mx-auto">Post 1 active job free. Search verified Ayurveda doctors. AI-matched recommendations. Pay only when you upgrade.</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-2xl">
        <EmployerRegisterClient />
      </section>
    </>
  )
}
