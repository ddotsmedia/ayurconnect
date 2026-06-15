import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { Calculator, Search, Salad, Sun, ShieldAlert, Activity, ChevronRight } from 'lucide-react'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../lib/seo'
import { Breadcrumbs } from '../../components/Breadcrumbs'

export const metadata = pageMetadata({
  path:        '/tools',
  title:       'Free Ayurveda Tools | AyurConnect',
  description: 'Free Ayurveda tools — BMI calculator, symptom checker, prakriti quiz, interaction checker, seasonal regimen, diet planner, cost estimator. Educational, doctor-in-the-loop.',
})

const TOOLS = [
  { href: '/tools/bmi-calculator',    name: 'BMI Calculator',         icon: Calculator,   desc: 'With Ayurvedic dosha + therapy interpretation.' },
  { href: '/tools/symptom-checker',   name: 'Symptom Checker',        icon: Search,       desc: 'Map symptoms to possible Ayurvedic conditions.' },
  { href: '/prakriti-quiz',           name: 'Prakriti Quiz',          icon: Activity,     desc: 'Discover your dosha constitution.' },
  { href: '/interaction-checker',     name: 'Interaction Checker',    icon: ShieldAlert,  desc: 'Herb–drug safety pairs from clinical reviewers.' },
  { href: '/ritucharya',              name: 'Seasonal Regimen',       icon: Sun,          desc: 'Personalised regimen — prakriti × season × climate.' },
  { href: '/diet-planner',            name: 'Diet Planner',           icon: Salad,        desc: 'AI-tailored Ayurvedic meal plan.' },
]

export default function ToolsHub() {
  const ld = ldGraph(breadcrumbLd([{ name: 'Home', url: '/' }, { name: 'Tools', url: '/tools' }]))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-white">Free Ayurveda tools</h1>
          <p className="text-white/85 mt-5">Educational tools to help you understand your Ayurvedic profile — never a substitute for a verified doctor.</p>
        </div>
      </GradientHero>
      <Breadcrumbs items={[{ label: 'Tools' }]} />
      <section className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((t) => (
            <Link key={t.href} href={t.href} className="bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg transition-shadow">
              <t.icon className="w-6 h-6 text-kerala-700 mb-2" />
              <h2 className="font-serif text-lg text-ink">{t.name}</h2>
              <p className="text-sm text-gray-700 mt-1 leading-relaxed">{t.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs text-kerala-700">Open <ChevronRight className="w-3 h-3" /></span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
