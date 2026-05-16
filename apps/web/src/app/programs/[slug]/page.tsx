import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, Clock, ChevronRight, Activity, Utensils, Pill, Sparkles, BookHeart } from 'lucide-react'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
import { ldGraph, breadcrumbLd, SITE_URL, clip } from '../../../lib/seo'
import { EnrollButton } from './_enroll-button'

type DayAction = { kind: string; text: string; durationMin?: number }
type Day = { id: string; dayNumber: number; title: string; actions: DayAction[]; notes: string | null }
type Program = {
  id: string; slug: string; name: string; tagline: string; description: string
  durationDays: number; category: string; dosha: string | null; difficulty: string
  priceInr: number; heroEmoji: string | null; heroColor: string | null
  days: Day[]
}

const ACTION_ICONS: Record<string, typeof Activity> = {
  diet: Utensils, meditation: Sparkles, medication: Pill, exercise: Activity, journal: BookHeart,
}

async function fetchProgram(slug: string): Promise<Program | null> {
  try {
    const res = await fetch(`${API}/programs/${slug}`, { next: { revalidate: 600 } })
    if (!res.ok) return null
    return await res.json() as Program
  } catch { return null }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await fetchProgram(slug)
  if (!p) return { title: 'Program not found' }
  return {
    title: `${p.name} — ${p.durationDays}-Day Ayurveda Program | AyurConnect`,
    description: clip(p.description, 160),
    alternates: { canonical: `/programs/${p.slug}` },
    openGraph: { title: p.name, description: p.tagline, url: `${SITE_URL}/programs/${p.slug}` },
  }
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const program = await fetchProgram(slug)
  if (!program) notFound()

  const jsonLd = ldGraph(
    breadcrumbLd([
      { name: 'Home', url: '/' },
      { name: 'Wellness Programs', url: '/programs' },
      { name: program.name, url: `/programs/${program.slug}` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: program.name,
      description: program.description,
      provider: { '@id': `${SITE_URL}#org` },
      educationalCredentialAwarded: 'Completion of structured Ayurveda wellness journey',
      inLanguage: 'en',
      timeRequired: `P${program.durationDays}D`,
      offers: { '@type': 'Offer', price: program.priceInr, priceCurrency: 'INR' },
    },
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-kerala-50 border-b border-kerala-100">
        <div className="container mx-auto px-4 py-3 text-sm">
          <Link href="/programs" className="inline-flex items-center gap-1.5 text-kerala-700 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> All programs
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header card */}
        <header className="bg-white rounded-card border border-gray-100 shadow-card p-6 md:p-8 mb-6" style={program.heroColor ? { borderTop: `6px solid ${program.heroColor}` } : undefined}>
          <div className="flex items-start gap-4 flex-wrap">
            <span className="text-5xl">{program.heroEmoji ?? '🌿'}</span>
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-3xl md:text-4xl text-ink">{program.name}</h1>
              <p className="text-base text-muted mt-2">{program.tagline}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-kerala-50 text-kerala-700 rounded-full font-medium">
                  <Clock className="w-3 h-3" /> {program.durationDays} days
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full">{program.difficulty}</span>
                {program.dosha && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full">{program.dosha}-focused</span>}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full font-medium">
                  {program.priceInr === 0 ? 'Free' : `₹${program.priceInr}`}
                </span>
              </div>
            </div>
            <EnrollButton slug={program.slug} />
          </div>
        </header>

        <section className="bg-white rounded-card border border-gray-100 p-6 mb-6">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">About this program</h2>
          <p className="text-gray-800 leading-relaxed">{program.description}</p>
        </section>

        {/* Daily schedule */}
        <section>
          <h2 className="font-serif text-2xl text-kerala-700 mb-4">Daily schedule</h2>
          <div className="space-y-3">
            {program.days.map((d) => (
              <details key={d.id} className="group bg-white rounded-card border border-gray-100 shadow-card">
                <summary className="cursor-pointer list-none p-4 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-kerala-100 text-kerala-800 text-sm font-semibold flex items-center justify-center flex-shrink-0">
                    {d.dayNumber}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink truncate">{d.title}</p>
                    <p className="text-[11px] text-gray-500">{d.actions.length} action{d.actions.length === 1 ? '' : 's'}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                  <ul className="space-y-2">
                    {d.actions.map((a, i) => {
                      const Icon = ACTION_ICONS[a.kind] ?? Activity
                      return (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <Icon className="w-4 h-4 text-kerala-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mr-2">{a.kind}</span>
                            <span className="text-gray-800">{a.text}</span>
                            {a.durationMin && <span className="text-xs text-gray-400 ml-1">· {a.durationMin}min</span>}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                  {d.notes && <p className="mt-3 text-xs text-gray-500 italic border-t border-gray-100 pt-3">{d.notes}</p>}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-10 p-6 rounded-card bg-amber-50 border border-amber-100">
          <p className="text-sm text-amber-900 leading-relaxed">
            <strong>Important:</strong> This program is an educational framework. Medications listed are common classical
            formulations — do not start them without consulting a verified Ayurvedic doctor first. The protocol works
            best when paired with a 1-on-1 consultation to confirm it fits your Prakriti and current medications.
            <Link href="/online-consultation" className="text-amber-700 hover:underline ml-1">Book a consultation →</Link>
          </p>
        </section>
      </div>
    </>
  )
}
