import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { MessageCircle, Sparkles } from 'lucide-react'
import { pageMetadata } from '../../../lib/seo'
import { QUESTIONS } from './_data'
import { InterviewPrepClient } from './_client'

export const metadata: Metadata = pageMetadata({
  path: '/jobs/interview-prep',
  title: 'Ayurveda Interview Preparation — 30 Q&A + AI Mock | AyurConnect',
  description: '30 real Ayurveda interview questions with model answers. Plus AI-powered mock interview. Free.',
  keywords: ['ayurveda interview prep', 'BAMS interview questions', 'DHA interview', 'GCC ayurveda interview'],
})

const TIPS = [
  { title: 'Dress code', body: 'Smart business attire. Female: formal kurti/saree or western business. Male: shirt + trousers + closed shoes. Avoid: bright colours, excessive jewellery, strong perfume. Lab coat ready in pocket but not worn unless asked.' },
  { title: 'Documents to carry', body: 'BAMS certificate + transcripts (originals + 2 copies), CCIM/KSMC registration, experience letters, indemnity insurance (if applicable), CV (3 printed copies), photo ID, recent photographs. Organise in a clean folder.' },
  { title: 'Body language', body: 'Firm handshake. Make eye contact. Sit upright, lean slightly forward when listening. Don\'t fidget. Smile when appropriate. Match their formality level — mirror their tone.' },
  { title: 'Salary negotiation', body: 'Let them state range first if possible. Give a range, not a number. Quantify market value: experience, license status, specialty. Negotiate non-cash: housing, transport, end-of-service, flights, CME budget. Don\'t accept first offer immediately.' },
  { title: 'Follow up', body: 'Send a thank-you email within 24 hours. Mention one specific thing from the conversation that resonated. Follow up at 7 + 14 days if no response. After 21 days, move on — they\'ve decided.' },
]

export default function InterviewPrepPage() {
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4"><Sparkles className="w-3 h-3" /> Free · {QUESTIONS.length} Q&A + AI mock</span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Interview Preparation</h1>
          <p className="text-white/85 mt-3">{QUESTIONS.length} real Ayurveda interview questions with model answers · AI mock interview · interview tips</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-4xl">
        <InterviewPrepClient questions={QUESTIONS} tips={TIPS} />
      </section>
    </>
  )
}
