import Link from 'next/link'
import type { Metadata } from 'next'
import { Stethoscope, BookOpen, Heart, ArrowRight } from 'lucide-react'
import { API_INTERNAL as API, logServerFetchError } from '@/lib/server-fetch'

export const metadata: Metadata = {
  title: 'Welcome to AyurConnect — Free Ayurveda Platform',
  description: "Kerala's free Ayurveda platform — for doctors, students, and patients. Verified doctors, BAMS study materials, jobs, herbs, and Malayalam articles.",
  robots: { index: false, follow: true },
}

async function counts(): Promise<{ herbs: number; doctors: number }> {
  async function n(path: string, key: string): Promise<number> {
    try {
      const r = await fetch(`${API}${path}`, { next: { revalidate: 3600 } })
      if (!r.ok) { logServerFetchError('welcome-counts', `HTTP ${r.status}`); return 0 }
      const d = await r.json() as Record<string, unknown>
      return typeof d.total === 'number' ? d.total : typeof d.count === 'number' ? d.count : Array.isArray(d[key]) ? (d[key] as unknown[]).length : 0
    } catch (e) { logServerFetchError('welcome-counts', e); return 0 }
  }
  const [herbs, doctors] = await Promise.all([n('/herbs?limit=1', 'herbs'), n('/doctors?limit=1', 'doctors')])
  return { herbs, doctors }
}

export default async function WelcomePage() {
  const c = await counts()
  return (
    <>
      <section className="bg-hero-green text-white py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="font-serif text-4xl md:text-6xl leading-tight">Welcome to AyurConnect <span aria-hidden>🌿</span></h1>
          <p className="mt-4 text-lg text-white/90">Kerala&rsquo;s free Ayurveda platform — for doctors, students, and patients.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <h2 className="font-serif text-2xl md:text-3xl text-kerala-800 text-center mb-8">What would you like to do?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Doctor column */}
          <article className="bg-white border border-gray-100 rounded-card p-6 flex flex-col">
            <span className="w-12 h-12 rounded-xl bg-kerala-50 text-kerala-700 flex items-center justify-center mb-3"><Stethoscope className="w-5 h-5" /></span>
            <h3 className="font-serif text-xl text-kerala-800">I&rsquo;m a Doctor</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-gray-700 flex-1">
              <li>• Create your verified professional profile</li>
              <li>• Find Ayurveda jobs worldwide</li>
              <li>• DHA / MOH / CNHC licensing guides</li>
              <li>• Publish articles with your name</li>
            </ul>
            <Link href="/doctors/register" className="mt-4 inline-flex items-center justify-center gap-1 px-4 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white text-sm font-semibold rounded">Register Free <ArrowRight className="w-4 h-4" /></Link>
          </article>

          {/* Student column */}
          <article className="bg-white border border-gray-100 rounded-card p-6 flex flex-col">
            <span className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3"><BookOpen className="w-5 h-5" /></span>
            <h3 className="font-serif text-xl text-kerala-800">I&rsquo;m a Student</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-gray-700 flex-1">
              <li>• 20 BAMS notes — all years</li>
              <li>• 100 AIAPGET MCQs + mock test</li>
              <li>• Solved question papers</li>
              <li>• Daily challenge with leaderboard</li>
            </ul>
            <Link href="/learn" className="mt-4 inline-flex items-center justify-center gap-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded">Start Learning <ArrowRight className="w-4 h-4" /></Link>
          </article>

          {/* Patient column */}
          <article className="bg-white border border-gray-100 rounded-card p-6 flex flex-col">
            <span className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-3"><Heart className="w-5 h-5" /></span>
            <h3 className="font-serif text-xl text-kerala-800">I Need Treatment</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-gray-700 flex-1">
              <li>• Find verified Ayurveda doctors</li>
              <li>• Kerala Panchakarma hospitals</li>
              <li>• Symptom checker + Prakriti quiz</li>
              <li>• Health guides in Malayalam</li>
            </ul>
            <Link href="/doctors" className="mt-4 inline-flex items-center justify-center gap-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded">Find a Doctor <ArrowRight className="w-4 h-4" /></Link>
          </article>
        </div>

        <p className="text-center text-lg text-kerala-800 font-serif mt-10">Everything is 100% free. No subscription. No paywall.</p>

        <section className="mt-10 bg-cream border border-kerala-100 rounded-card p-5 text-center">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Trusted by</p>
          <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center text-sm text-ink">
            {c.herbs > 0 && <span><strong className="text-kerala-700 text-lg">{c.herbs}+</strong> herbs catalogued</span>}
            <span><strong className="text-kerala-700 text-lg">155+</strong> study resources</span>
            <span><strong className="text-kerala-700 text-lg">10+</strong> licensing guides</span>
            {c.doctors > 0 && <span><strong className="text-kerala-700 text-lg">{c.doctors}+</strong> verified doctors</span>}
          </div>
        </section>
      </div>
    </>
  )
}
