import type { Metadata } from 'next'
import { SalaryCalcClient } from './_client'

export const metadata: Metadata = {
  title: 'Ayurveda Doctor Salary Calculator',
  description: 'What should an Ayurveda doctor earn? Estimate salary range by specialization, experience, location, and licenses. Based on real Ayurveda job postings.',
  alternates: { canonical: '/jobs/salary-calculator' },
  keywords: ['ayurveda doctor salary', 'BAMS salary calculator', 'panchakarma doctor salary', 'ayurveda doctor salary dubai', 'ayurveda doctor salary kerala', 'MD ayurveda salary'],
}

export default function SalaryCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <p className="text-xs uppercase tracking-wider text-kerala-700">Salary Calculator</p>
      <h1 className="font-serif text-3xl text-kerala-800">What Should an Ayurveda Doctor Earn?</h1>
      <p className="text-sm text-gray-600 mt-1">Estimate by specialization, experience, location, and licenses. Benchmarks pulled from real AyurConnect job postings plus market data.</p>
      <SalaryCalcClient />
    </div>
  )
}
