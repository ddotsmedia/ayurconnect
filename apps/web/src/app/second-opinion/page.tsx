import { GradientHero } from '@ayurconnect/ui'
import { FileSearch, ShieldCheck, Clock, ChevronRight } from 'lucide-react'
import { SecondOpinionForm } from './_form'

export const metadata = {
  title: 'Ayurveda Second Opinion — From Verified Specialists | AyurConnect',
  description: 'Get an independent Ayurvedic second opinion on your diagnosis or treatment plan. Senior verified specialists review your case within 72 hours.',
  alternates: { canonical: '/second-opinion' },
}

export default function SecondOpinionPage() {
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <FileSearch className="w-3 h-3" /> Second Opinion Service
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Get an Ayurvedic second opinion</h1>
          <p className="mt-4 text-white/80">
            Already seeing a doctor? Get an independent review of your diagnosis or treatment plan from a senior verified
            Ayurvedic specialist. Useful before starting Panchakarma, surgery alternatives, or chronic disease protocols.
          </p>
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* How it works */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: FileSearch,  title: 'Submit your case', body: 'Share your symptoms, current diagnosis, treatment plan, and any reports. Takes 5 minutes.' },
            { icon: ShieldCheck, title: 'Senior review',    body: 'A senior verified specialist (15+ years experience) reviews independently — no commercial conflict.' },
            { icon: Clock,       title: 'Reply in 72h',     body: 'Written second-opinion summary delivered by email within 72 hours. Followed by optional video consult.' },
          ].map((s) => {
            const Icon = s.icon
            return (
              <article key={s.title} className="p-5 bg-white rounded-card border border-gray-100 shadow-card">
                <Icon className="w-6 h-6 text-kerala-700 mb-3" />
                <h3 className="font-serif text-lg text-kerala-700">{s.title}</h3>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{s.body}</p>
              </article>
            )
          })}
        </section>

        <SecondOpinionForm />

        <section className="mt-10 p-5 rounded-card bg-amber-50 border border-amber-100 text-sm text-amber-900 leading-relaxed">
          <strong>When a second opinion makes sense:</strong>
          <ul className="mt-2 space-y-1.5 ml-5 list-disc">
            <li>Before starting a residential Panchakarma program (₹50,000+ commitment)</li>
            <li>You&apos;ve been on Ayurvedic medication 3+ months with little improvement</li>
            <li>Doctor prescribed Rasashastra (mineral) preparations and you want to confirm safety</li>
            <li>Treatment plan conflicts with your existing allopathic medicines</li>
            <li>Considering Ayurvedic surgery alternatives (Ksharasutra for fistula, etc.)</li>
            <li>Pediatric care decisions for a child</li>
          </ul>
        </section>
      </div>
    </>
  )
}
