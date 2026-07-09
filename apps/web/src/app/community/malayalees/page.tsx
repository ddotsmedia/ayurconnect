import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { Users, ChevronRight } from 'lucide-react'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../../lib/seo'

const LOCATIONS = [
  { slug: 'uae',        name: 'UAE',         flag: '🇦🇪' },
  { slug: 'dubai',      name: 'Dubai',       flag: '🇦🇪' },
  { slug: 'abu-dhabi',  name: 'Abu Dhabi',   flag: '🇦🇪' },
  { slug: 'qatar',      name: 'Qatar',       flag: '🇶🇦' },
  { slug: 'kuwait',     name: 'Kuwait',      flag: '🇰🇼' },
  { slug: 'uk',         name: 'UK',          flag: '🇬🇧' },
  { slug: 'canada',     name: 'Canada',      flag: '🇨🇦' },
]

export const metadata = pageMetadata({
  path:        '/community/malayalees',
  title:       'Kerala Ayurveda for Malayalees Abroad',
  description: 'Kerala Ayurveda for the Malayali diaspora — UAE, Dubai, Abu Dhabi, Qatar, Kuwait, UK, Canada. Malayalam-speaking doctors, teleconsult, Heal-in-Kerala packages.',
  keywords:    ['kerala ayurveda diaspora', 'malayali ayurveda', 'malayalam ayurveda doctor', 'teleconsult kerala diaspora'],
})

export default function MalayaleeHub() {
  const ld = ldGraph(breadcrumbLd([
    { name: 'Home',         url: '/' },
    { name: 'Community',    url: '/community' },
    { name: 'Malayalees',   url: '/community/malayalees' },
  ]))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Users className="w-3 h-3" /> Malayali diaspora
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Kerala Ayurveda for Malayalees Abroad</h1>
          <p className="text-white/85 font-serif text-lg mt-2">പ്രവാസി മലയാളികൾക്ക് കേരള ആയുർവേദം</p>
          <p className="text-white/85 mt-5">Your bridge to authentic Kerala Ayurveda — wherever you are.</p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {LOCATIONS.map((l) => (
            <Link key={l.slug} href={`/community/malayalees/${l.slug}`} className="bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg transition-shadow text-center">
              <div className="text-3xl">{l.flag}</div>
              <p className="text-sm font-semibold text-ink mt-2">{l.name}</p>
              <p className="text-[10px] text-kerala-700 mt-1 inline-flex items-center gap-0.5">Explore <ChevronRight className="w-3 h-3" /></p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
