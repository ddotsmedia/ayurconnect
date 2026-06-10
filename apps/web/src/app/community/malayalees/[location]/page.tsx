import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Users, MessageCircle, ChevronRight, ArrowLeft, Stethoscope, BookOpen, Plane } from 'lucide-react'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../../../lib/seo'

type Loc = {
  slug:       string
  name:       string
  flag:       string
  enHeading:  string
  mlHeading:  string
  intro:      string
  doctorPath?: string  // /ayurveda-doctors/<slug> if exists, else /doctors/in/<countrySlug>
  healInKeralaSlug?: string  // /heal-in-kerala/<slug> if exists
  countryCode: string  // for /api/doctors filter
}

const LOCATIONS: Loc[] = [
  { slug: 'uae',        name: 'UAE',         flag: '🇦🇪', enHeading: 'Kerala Ayurveda for UAE Malayalees', mlHeading: 'യു.എ.ഇ. മലയാളികൾക്ക് കേരള ആയുർവേദം', intro: 'Across the 7 Emirates, Kerala-trained BAMS doctors with DHA / MOH / DOH licenses serve the Malayali diaspora. Teleconsult option to connect with doctors back in Kerala. Authentic Heal-in-Kerala packages.', doctorPath: '/ayurveda-doctors/dubai', healInKeralaSlug: 'uae', countryCode: 'AE' },
  { slug: 'dubai',      name: 'Dubai',       flag: '🇦🇪', enHeading: 'Kerala Ayurveda for Dubai Malayalees', mlHeading: 'ദുബായ് മലയാളികൾക്ക് കേരള ആയുർവേദം',     intro: 'Dubai\'s 200,000+ Malayali community is served by DHA-licensed Kerala-trained Ayurveda doctors at multiple clinics — Karama, Al Nahda, Jumeirah, DSO and more. Malayalam-speaking reception, classical Panchakarma protocols, teleconsult to your Kerala doctor.', doctorPath: '/ayurveda-doctors/dubai', healInKeralaSlug: 'uae', countryCode: 'AE' },
  { slug: 'abu-dhabi',  name: 'Abu Dhabi',   flag: '🇦🇪', enHeading: 'Kerala Ayurveda for Abu Dhabi Malayalees', mlHeading: 'അബുദാബി മലയാളികൾക്ക് കേരള ആയുർവേദം', intro: 'Abu Dhabi\'s Malayalam-speaking BAMS doctors with DOH licenses offer authentic Kerala Ayurveda. Direct flights to Trivandrum + Kochi for residential courses.', doctorPath: '/ayurveda-doctors/abu-dhabi', healInKeralaSlug: 'uae', countryCode: 'AE' },
  { slug: 'qatar',      name: 'Qatar',       flag: '🇶🇦', enHeading: 'Kerala Ayurveda for Qatar Malayalees', mlHeading: 'ഖത്തർ മലയാളികൾക്ക് കേരള ആയുർവേദം',     intro: 'Qatar\'s Malayali community of 600,000+ has access to MOPH-licensed Kerala Ayurveda doctors in Doha. Teleconsult support + direct Doha–Trivandrum / Kochi flights for residential treatment.', doctorPath: '/doctors/in/qatar', healInKeralaSlug: 'qatar', countryCode: 'QA' },
  { slug: 'kuwait',     name: 'Kuwait',      flag: '🇰🇼', enHeading: 'Kerala Ayurveda for Kuwait Malayalees', mlHeading: 'കുവൈറ്റ് മലയാളികൾക്ക് കേരള ആയുർവേദം',  intro: 'Kuwait\'s ~700,000 Malayalis are served by Kerala-trained Ayurveda doctors with MOH licenses. Direct Kuwait City – Trivandrum / Kochi flights for Heal-in-Kerala courses.', doctorPath: '/doctors/in/kuwait', healInKeralaSlug: 'kuwait', countryCode: 'KW' },
  { slug: 'uk',         name: 'UK',          flag: '🇬🇧', enHeading: 'Kerala Ayurveda for UK Malayalees', mlHeading: 'യു.കെ. മലയാളികൾക്ക് കേരള ആയുർവേദം',         intro: 'UK\'s 1,00,000+ Malayali community can access verified Kerala-trained Ayurveda doctors for teleconsultation, classical guidance, and Heal-in-Kerala packages designed for winter-escape Panchakarma.', doctorPath: '/doctors/in/uk', healInKeralaSlug: 'uk', countryCode: 'GB' },
  { slug: 'canada',     name: 'Canada',      flag: '🇨🇦', enHeading: 'Kerala Ayurveda for Canada Malayalees', mlHeading: 'കാനഡ മലയാളികൾക്ക് കേരള ആയുർവേദം',  intro: 'Canada\'s Malayali community — Toronto, Montreal, Vancouver — has teleconsult + Heal-in-Kerala options with verified Kerala-trained Ayurveda doctors. Winter Panchakarma trips are increasingly popular.', doctorPath: '/doctors/in/canada', healInKeralaSlug: 'canada', countryCode: 'CA' },
]

const BY_SLUG = new Map(LOCATIONS.map((l) => [l.slug, l]))

export function generateStaticParams() {
  return LOCATIONS.map((l) => ({ location: l.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ location: string }> }): Promise<Metadata> {
  const { location } = await params
  const loc = BY_SLUG.get(location)
  if (!loc) return { title: 'Not found', robots: { index: false, follow: false } }
  return pageMetadata({
    path:        `/community/malayalees/${loc.slug}`,
    title:       `${loc.enHeading} | AyurConnect`,
    description: `${loc.intro.slice(0, 145)}…`,
    keywords:    ['kerala ayurveda', 'malayali ayurveda', `${loc.name.toLowerCase()} malayalees`, 'malayalam ayurveda doctor', 'teleconsult kerala'],
  })
}

export default async function MalayaleeCommunity({ params }: { params: Promise<{ location: string }> }) {
  const { location } = await params
  const loc = BY_SLUG.get(location)
  if (!loc) notFound()

  const ld = ldGraph(breadcrumbLd([
    { name: 'Home',         url: '/' },
    { name: 'Community',    url: '/community' },
    { name: 'Malayalees',   url: '/community/malayalees' },
    { name: loc.name,       url: `/community/malayalees/${loc.slug}` },
  ]))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Users className="w-3 h-3" /> Malayali community
          </span>
          <div className="text-5xl mb-3">{loc.flag}</div>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">{loc.enHeading}</h1>
          <p className="text-white/85 font-serif text-base md:text-lg mt-1">{loc.mlHeading}</p>
          <p className="text-white/85 mt-5">{loc.intro}</p>
          <p className="text-white/75 text-sm mt-2 italic">Your trusted bridge to authentic Kerala Ayurveda from {loc.name}.</p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10 max-w-4xl space-y-6">
        <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
          <h2 className="font-serif text-xl text-ink inline-flex items-center gap-2 mb-3">
            <Stethoscope className="w-5 h-5 text-kerala-700" /> Malayalam-speaking Ayurveda doctors in {loc.name}
          </h2>
          <p className="text-sm text-gray-700">Browse verified BAMS / MD-Ayurveda doctors in {loc.name} who can consult in Malayalam.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {loc.doctorPath && (
              <Link href={loc.doctorPath} className="inline-flex items-center gap-1 px-4 py-2 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-sm font-semibold">
                ആയുർവേദ ഡോക്ടറെ കണ്ടെത്തുക <ChevronRight className="w-4 h-4" />
              </Link>
            )}
            <Link href={`/doctors?country=${loc.countryCode}&language=Malayalam`} className="inline-flex items-center gap-1 px-4 py-2 border border-gray-200 text-gray-700 rounded text-sm hover:bg-gray-50">
              Filter by Malayalam-speaking <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </article>

        <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
          <h2 className="font-serif text-xl text-ink inline-flex items-center gap-2 mb-3">
            <MessageCircle className="w-5 h-5 text-kerala-700" /> Teleconsult with Kerala doctors
          </h2>
          <p className="text-sm text-gray-700">Some conditions need the verified Vaidya you grew up with. Teleconsult lets you book directly with senior doctors back in Kerala — including Malayalam-only practitioners.</p>
          <Link href="/online-consultation" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-kerala-700 hover:underline">
            Book online consultation <ChevronRight className="w-4 h-4" />
          </Link>
        </article>

        {loc.healInKeralaSlug && (
          <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
            <h2 className="font-serif text-xl text-ink inline-flex items-center gap-2 mb-3">
              <Plane className="w-5 h-5 text-kerala-700" /> Heal in Kerala — packages for {loc.name} visitors
            </h2>
            <p className="text-sm text-gray-700">Residential Panchakarma + Karkidaka Chikitsa packages designed for {loc.name} visitors. Visa guidance, local-currency cost, and direct flights.</p>
            <Link href={`/heal-in-kerala/${loc.healInKeralaSlug}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-kerala-700 hover:underline">
              See {loc.name} Heal-in-Kerala guide <ChevronRight className="w-4 h-4" />
            </Link>
          </article>
        )}

        <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
          <h2 className="font-serif text-xl text-ink inline-flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-kerala-700" /> Articles in മലയാളം
          </h2>
          <p className="text-sm text-gray-700">Authoritative classical-tradition Ayurveda content in Malayalam — diet, daily routine, condition-specific guidance.</p>
          <Link href="/articles?language=ml" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-kerala-700 hover:underline">
            Browse Malayalam articles <ChevronRight className="w-4 h-4" />
          </Link>
        </article>

        <article className="bg-[#25d366]/10 border border-[#25d366]/30 rounded-card p-5 shadow-card text-center">
          <MessageCircle className="w-10 h-10 text-[#25d366] mx-auto mb-2" />
          <h2 className="font-serif text-xl text-ink">Join the WhatsApp community</h2>
          <p className="text-sm text-gray-700 mt-2">Profession-specific WhatsApp groups — nurses, engineers, IT, drivers, professionals. Verified Kerala Ayurveda content, no spam.</p>
          <Link href="/whatsapp-groups" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#25d366] hover:opacity-90 text-white rounded text-sm font-semibold">
            Join your group <ChevronRight className="w-4 h-4" />
          </Link>
        </article>

        <nav className="text-center text-xs text-gray-500 pt-4">
          <Link href="/community/malayalees" className="inline-flex items-center gap-1 hover:text-kerala-700">
            <ArrowLeft className="w-3 h-3" /> All Malayali community pages
          </Link>
        </nav>
      </section>
    </>
  )
}
