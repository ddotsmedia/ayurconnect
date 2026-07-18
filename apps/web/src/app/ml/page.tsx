import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight, MessageCircle, Stethoscope } from 'lucide-react'
import { ML_PAGES } from './_data'
import { breadcrumbLd, ldGraph } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'ആയുർവേദം — മലയാളത്തിൽ',
  description: 'ആയുർവേദ ചികിത്സ, ഔഷധങ്ങൾ, ആരോഗ്യ ടിപ്പുകൾ — എല്ലാം മലയാളത്തിൽ. പ്രമേഹം, PCOS, തൈറോയ്ഡ്, ആസ്ത്മ, മലബന്ധം, ശിരോധാര, അശ്വഗന്ധ തുടങ്ങി 29 ആരോഗ്യ വിഷയങ്ങൾ.',
  alternates: { canonical: '/ml', languages: { 'ml-IN': '/ml', 'en-IN': '/', 'x-default': '/ml' } },
  keywords: ['ആയുർവേദം മലയാളം', 'ayurveda malayalam', 'ayurveda kerala malayalam', 'ആരോഗ്യം മലയാളം'],
  openGraph: {
    title: 'ആയുർവേദം — മലയാളത്തിൽ',
    description: 'ആയുർവേദ ചികിത്സ, ഔഷധങ്ങൾ, ആരോഗ്യ ടിപ്പുകൾ — എല്ലാം മലയാളത്തിൽ.',
    locale: 'ml_IN',
    url: '/ml',
  },
}

export default function MlHubPage() {
  const jsonLd = ldGraph(
    breadcrumbLd([
      { name: 'Home', url: 'https://ayurconnect.com' },
      { name: 'മലയാളം', url: 'https://ayurconnect.com/ml' },
    ]),
    {
      '@type': 'CollectionPage',
      name: 'ആയുർവേദം — മലയാളത്തിൽ',
      inLanguage: 'ml',
      url: 'https://ayurconnect.com/ml',
      description: 'Malayalam Ayurveda articles covering classical conditions and treatments.',
    },
  )

  return (
    <div lang="ml">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-hero-green text-white py-14">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="font-serif text-3xl md:text-5xl text-white leading-tight">ആയുർവേദം — മലയാളത്തിൽ</h1>
          <p className="mt-3 text-white/85 text-sm md:text-base" lang="en">Authentic Kerala Ayurveda — articles, treatments, and FAQs in Malayalam.</p>
          <p className="mt-4 text-white/90 max-w-2xl mx-auto" data-speakable>
            പ്രമേഹം, PCOS, തൈറോയ്ഡ്, ആസ്ത്മ, മലബന്ധം, ആർത്തവ പ്രശ്നങ്ങൾ, ശിരോധാര, അശ്വഗന്ധ തുടങ്ങി 28 ആരോഗ്യ വിഷയങ്ങളിൽ ക്ലാസിക്കൽ ആയുർവേദ ചികിത്സയുടെ പൂർണ്ണ വിവരണം.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link href="/doctors" className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-md">
              <Stethoscope className="w-4 h-4" /> ഡോക്ടറെ കണ്ടെത്തുക
            </Link>
            <a href="https://wa.me/971509379212?text=Hi%20AyurConnect%2C%20I%20want%20to%20consult%20an%20Ayurveda%20doctor" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:opacity-95 text-white font-semibold rounded-md">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ML_PAGES.map((p) => (
            <Link key={p.slug} href={`/ml/${p.slug}`} className="group bg-white rounded-card border border-gray-100 p-6 hover:border-kerala-300 transition-colors">
              <h2 className="font-serif text-lg text-kerala-700 leading-snug">{p.titleMl}</h2>
              <p className="text-xs text-gray-500 mt-1" lang="en">{p.titleEn}</p>
              <p className="text-sm text-gray-700 mt-3 line-clamp-3">{p.metaDescMl}</p>
              <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-kerala-700">
                വായിക്കുക <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
