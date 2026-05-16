import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { Calendar, ChevronRight, Sparkles, Clock } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'

type Program = {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  durationDays: number
  category: string
  dosha: string | null
  difficulty: string
  priceInr: number
  heroEmoji: string | null
  heroColor: string | null
  _count: { days: number; enrollments: number }
}

const CATEGORY_LABEL: Record<string, string> = {
  stress: 'Stress & sleep', pcos: "Women's health", diabetes: 'Diabetes', detox: 'Detox',
  arthritis: 'Joint pain', sleep: 'Sleep', weight: 'Weight management', karkidaka: 'Karkidaka Chikitsa',
  general: 'General wellness',
}

async function fetchPrograms(): Promise<Program[]> {
  try {
    const res = await fetch(`${API}/programs`, { next: { revalidate: 600 } })
    if (!res.ok) return []
    const data = await res.json() as { programs: Program[] }
    return data.programs ?? []
  } catch { return [] }
}

export const metadata = {
  title: 'Wellness Programs — Structured Ayurveda Journeys | AyurConnect',
  description: '21-day stress reset, 6-week PCOS protocol, 14-day Karkidaka Chikitsa, 90-day diabetes companion. Daily Ayurvedic check-ins with classical formulations + lifestyle protocols.',
  alternates: { canonical: '/programs' },
}

export default async function ProgramsIndexPage() {
  const programs = await fetchPrograms()

  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Sparkles className="w-3 h-3" /> Wellness Programs
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Structured Ayurveda journeys</h1>
          <p className="mt-4 text-white/80">
            Guided multi-week programs with daily check-ins, classical medication protocols, and lifestyle frameworks.
            Designed in partnership with verified doctors. Free.
          </p>
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {programs.map((p) => (
            <Link
              key={p.id}
              href={`/programs/${p.slug}`}
              className="group bg-white rounded-card border border-gray-100 shadow-card hover:shadow-cardLg transition-all p-6 flex flex-col"
              style={p.heroColor ? { borderTop: `4px solid ${p.heroColor}` } : undefined}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-3xl">{p.heroEmoji ?? '🌿'}</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-kerala-50 text-kerala-700 font-medium">
                  {CATEGORY_LABEL[p.category] ?? p.category}
                </span>
              </div>
              <h2 className="font-serif text-xl text-ink leading-snug mb-2 group-hover:text-kerala-700">{p.name}</h2>
              <p className="text-sm text-muted mb-3">{p.tagline}</p>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 flex-1">{p.description}</p>
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1.5"><Clock className="w-3 h-3" /> {p.durationDays} days</span>
                <span className="inline-flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {p._count.days} day plans</span>
                {p.dosha && <span className="inline-flex items-center gap-1.5 text-kerala-700">{p.dosha}-focused</span>}
                {p._count.enrollments > 0 && <span className="text-gray-400">{p._count.enrollments} enrolled</span>}
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-xs text-kerala-700 font-semibold">
                View program <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>

        {programs.length === 0 && (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-card">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted">No programs published yet — check back soon.</p>
          </div>
        )}

        <div className="mt-12 p-6 rounded-card bg-kerala-50 border border-kerala-100 text-center">
          <h3 className="font-serif text-xl text-kerala-800">Want a custom protocol?</h3>
          <p className="text-sm text-kerala-900/80 mt-2 max-w-xl mx-auto">
            These programs are educational frameworks. For a doctor-prescribed personalized protocol matched to your Prakriti and history, book a video consultation.
          </p>
          <Link href="/online-consultation" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded-md text-sm font-semibold">
            Book a consultation <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  )
}
