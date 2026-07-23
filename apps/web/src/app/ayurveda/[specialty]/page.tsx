import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronRight, Stethoscope, BookOpen } from 'lucide-react'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../../lib/seo'

type SpecialtyEntry = { slug: string; name: string; sanskrit?: string; summary: string; treats: string[] }

const SPECIALTIES: SpecialtyEntry[] = [
  { slug: 'kayachikitsa',         name: 'Kayachikitsa',         sanskrit: 'कायचिकित्सा',
    summary: 'Internal medicine — the core branch of Ayurveda treating systemic disorders through diet, medication, and Panchakarma.',
    treats: ['Diabetes', 'Hypertension', 'IBS', 'Liver disorders', 'Anaemia', 'Chronic fevers'] },
  { slug: 'panchakarma',          name: 'Panchakarma',          sanskrit: 'पञ्चकर्म',
    summary: 'Five-action therapeutic purification — Vamana, Virechana, Basti, Nasya, Raktamokshana — for deep dosha removal.',
    treats: ['Arthritis', 'Psoriasis', 'Migraines', 'Chronic constipation', 'PCOS', 'Autoimmune disorders'] },
  { slug: 'prasuti-tantra',       name: 'Prasuti Tantra',       sanskrit: 'प्रसूति तंत्र',
    summary: 'Obstetrics + gynaecology — women\'s reproductive health from menarche through menopause, fertility, prenatal care.',
    treats: ['PCOS / PCOD', 'Infertility', 'Endometriosis', 'Menopause', 'Postnatal care', 'Menstrual disorders'] },
  { slug: 'kaumarbhritya',        name: 'Kaumarbhritya',        sanskrit: 'कौमारभृत्य',
    summary: 'Paediatrics — child health from birth through adolescence. Suvarna Prashana, growth, immunity, behaviour.',
    treats: ['Recurrent infections', 'Low immunity', 'Growth issues', 'ADHD', 'Autism support', 'Skin allergies'] },
  { slug: 'shalya',               name: 'Shalya Tantra',        sanskrit: 'शल्य तंत्र',
    summary: 'Surgical Ayurveda — Sushruta\'s lineage. Kshara Sutra for fistula, anorectal disorders, varicose veins.',
    treats: ['Fistula-in-ano', 'Piles / haemorrhoids', 'Pilonidal sinus', 'Varicose veins', 'Non-healing ulcers'] },
  { slug: 'shalakya',             name: 'Shalakya Tantra',      sanskrit: 'शालाक्य तंत्र',
    summary: 'Ophthalmology + ENT + dentistry. Netra Tarpana for eye disorders; Karna Purana for ear health.',
    treats: ['Cataract (early)', 'Dry eye', 'Glaucoma support', 'Sinusitis', 'Tinnitus', 'Dental sensitivity'] },
  { slug: 'manasika',             name: 'Manasika',             sanskrit: 'मानस रोग',
    summary: 'Mental health — Sattvavajaya counselling, Medhya Rasayanas, Shirodhara, Shirobasti for psychiatric disorders.',
    treats: ['Anxiety', 'Depression', 'Insomnia', 'PTSD', 'Burnout', 'Memory and concentration'] },
  { slug: 'rasashastra',          name: 'Rasashastra',          sanskrit: 'रस शास्त्र',
    summary: 'Classical pharmacy — purified mineral and metallic preparations (bhasmas), highly potent formulations.',
    treats: ['Treatment-resistant chronic disease', 'Specific anaemias', 'Bone disorders requiring mineral support'] },
  { slug: 'general-practice',     name: 'General Practice',
    summary: 'Family Ayurveda — first-line consultation, lifestyle correction, Prakriti analysis, preventive care.',
    treats: ['Lifestyle disorders', 'Fatigue', 'Sleep issues', 'Digestive complaints', 'Seasonal allergies', 'Preventive consultations'] },
  { slug: 'research',             name: 'Research',
    summary: 'Academic + clinical research vaidyas — CCRAS, NIA-aligned. Open to second-opinion + complex case consults.',
    treats: ['Treatment-resistant cases', 'Second opinions', 'Rare-disease consults', 'Integrative protocols'] },
  { slug: 'online-consultation',  name: 'Online Consultation',
    summary: 'Doctors offering tele-Ayurveda for diaspora patients. UAE / GCC / UK / US time-zone availability.',
    treats: ['Follow-up consultations', 'Initial assessment', 'Prescription continuity', 'Dietary + lifestyle guidance', 'Second opinions'] },
]

type DoctorBrief = { id: string; slug?: string | null; name: string; specialization?: string | null; district?: string | null; experienceYears?: number | null }

export const revalidate = 300 // Phase 4 (2026-07-23): reverted from force-dynamic per audit prompt

export async function generateStaticParams() {
  return SPECIALTIES.map(({ slug }) => ({ specialty: slug }))
}

async function fetchDoctorsBySpecialty(name: string): Promise<DoctorBrief[]> {
  try {
    const qp = new URLSearchParams({ specialization: name, limit: '24' })
    const r = await fetch(`${API}/doctors?${qp.toString()}`, { cache: 'no-store' })
    if (!r.ok) return []
    const data = (await r.json()) as { doctors?: DoctorBrief[]; items?: DoctorBrief[] }
    return data.doctors ?? data.items ?? []
  } catch { return [] }
}

export async function generateMetadata({ params }: { params: Promise<{ specialty: string }> }): Promise<Metadata> {
  const { specialty: slug } = await params
  const s = SPECIALTIES.find((x) => x.slug === slug)
  if (!s) return { title: 'Not found', robots: { index: false, follow: false } }
  // Programmatic data-gate: noindex when fewer than 3 doctors for this specialty.
  const doctors = await fetchDoctorsBySpecialty(s.name)
  const meta = pageMetadata({
    path: `/ayurveda/${slug}`,
    title:       `${s.name} Specialists in Kerala`,
    description: `Verified ${s.name} doctors across Kerala. ${s.summary} Filter by district, language, and availability.`,
    keywords:    ['ayurveda', s.name, 'Kerala', 'BAMS', s.sanskrit].filter(Boolean) as string[],
  })
  if (doctors.length < 3) meta.robots = { index: false, follow: true, googleBot: { index: false, follow: true } }
  return meta
}

export default async function SpecialtyPage({ params }: { params: Promise<{ specialty: string }> }) {
  const { specialty: slug } = await params
  const s = SPECIALTIES.find((x) => x.slug === slug)
  if (!s) notFound()
  const doctors = await fetchDoctorsBySpecialty(s.name)
  const ld = ldGraph(breadcrumbLd([
    { name: 'Home',     url: '/' },
    { name: 'Ayurveda', url: '/doctors' },
    { name: s.name,     url: `/ayurveda/${slug}` },
  ]))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <BookOpen className="w-3 h-3" /> Ayurveda specialty
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">{s.name} Specialists in Kerala</h1>
          {s.sanskrit && <p className="text-white/60 font-serif text-base mt-1">{s.sanskrit}</p>}
          <p className="mt-5 text-lg text-white/80">{s.summary}</p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10 max-w-5xl">
        <section className="bg-white border border-gray-100 rounded-card p-6 shadow-card mb-8">
          <h2 className="font-serif text-xl text-ink mb-3">Conditions commonly treated</h2>
          <div className="flex flex-wrap gap-2">
            {s.treats.map((t) => (
              <span key={t} className="text-xs px-2.5 py-1 bg-kerala-50 text-kerala-800 rounded-full">{t}</span>
            ))}
          </div>
        </section>

        <h2 className="font-serif text-xl text-ink mb-4">Verified {s.name} practitioners</h2>
        {doctors.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-card p-10 text-center shadow-card">
            <Stethoscope className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-700">No {s.name} specialists are currently listed.</p>
            <p className="text-xs text-gray-500 mt-1">Try AI Doctor Match or browse adjacent specialties.</p>
            <div className="mt-5 flex justify-center gap-2 flex-wrap">
              <Link href="/doctor-match" className="px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">AI Doctor Match</Link>
              <Link href="/doctors" className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded text-sm hover:bg-gray-50">All doctors</Link>
            </div>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((d) => (
              <li key={d.id}>
                <Link href={`/doctors/${d.slug ?? d.id}`} className="block bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg transition-shadow">
                  <h3 className="font-serif text-lg text-ink">{d.name}</h3>
                  <p className="text-xs text-muted mt-1">
                    {d.district ?? ''}{d.experienceYears ? ` · ${d.experienceYears} yrs` : ''}
                  </p>
                  <span className="mt-2 inline-flex items-center text-xs text-kerala-700">View profile <ChevronRight className="w-3 h-3" /></span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <nav className="mt-10 text-center text-xs text-gray-500">
          <p className="mb-2">Other specialties</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {SPECIALTIES.filter((x) => x.slug !== slug).map((x) => (
              <Link key={x.slug} href={`/ayurveda/${x.slug}`} className="px-2 py-0.5 bg-white border border-gray-200 rounded hover:border-kerala-300 hover:text-kerala-700">
                {x.name}
              </Link>
            ))}
          </div>
        </nav>
      </section>
    </>
  )
}
