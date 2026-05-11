import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronRight, AlertCircle, Building2, Server, Smartphone, ShieldCheck } from 'lucide-react'
import { PRODUCTS, PRODUCT_SLUGS } from '../_data/products'
import { WaitlistForm } from '../_waitlist-form'

export function generateStaticParams() {
  return PRODUCT_SLUGS.map((slug) => ({ slug }))
}

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params) {
  const { slug } = await params
  const p = PRODUCTS[slug]
  if (!p) return { title: 'Product not found' }
  return {
    title: p.metaTitle,
    description: p.metaDescription,
    alternates: { canonical: `/products/${p.slug}` },
  }
}

const ICONS = { hms: Building2, saas: Server, mobile: Smartphone } as const

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  concept:           { label: 'Concept',         color: 'bg-gray-100 text-gray-700' },
  design:            { label: 'In design',       color: 'bg-blue-100 text-blue-800' },
  'in-development':  { label: 'In development',  color: 'bg-amber-100 text-amber-800' },
  pilot:             { label: 'Pilot open',      color: 'bg-kerala-100 text-kerala-800' },
}

export default async function ProductWaitlistPage({ params }: Params) {
  const { slug } = await params
  const p = PRODUCTS[slug]
  if (!p) notFound()
  const Icon = ICONS[slug as keyof typeof ICONS] ?? Building2
  const status = STATUS_BADGE[p.status]

  return (
    <>
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/" className="text-sm text-white/70 hover:text-white inline-flex items-center gap-1 mb-4">
            <ChevronRight className="w-3 h-3 rotate-180" /> AyurConnect
          </Link>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <Icon className="w-6 h-6 text-gold-300" />
            </span>
            <span className={`text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${status.color}`}>{status.label}</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">{p.name}</h1>
          <p className="mt-5 text-lg text-white/85 max-w-2xl mx-auto">{p.tagline}</p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-14 max-w-4xl">
        <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-4">Why we&apos;re building this</h2>
        <p className="text-gray-700 leading-relaxed">{p.pitch}</p>

        <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-4 mt-12">Built for</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {p.audience.map((a) => (
            <div key={a} className="p-4 bg-white rounded-card border border-gray-100 flex gap-2 items-start">
              <ShieldCheck className="w-4 h-4 text-kerala-700 flex-shrink-0 mt-1" />
              <span className="text-sm text-gray-800">{a}</span>
            </div>
          ))}
        </div>

        <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-6 mt-12">Modules & capabilities</h2>
        <div className="space-y-4">
          {p.modules.map((m, i) => (
            <article key={m.title} className="p-6 bg-white rounded-card border border-gray-100 shadow-card flex gap-5">
              <div className="w-10 h-10 rounded-full bg-kerala-600 text-white font-serif text-lg flex items-center justify-center flex-shrink-0">{i + 1}</div>
              <div>
                <h3 className="font-serif text-xl text-kerala-700">{m.title}</h3>
                <p className="text-gray-700 mt-2 leading-relaxed">{m.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-cream py-14">
        <div className="container mx-auto px-4 max-w-4xl grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-card border border-kerala-100 shadow-card">
            <div className="text-xs uppercase tracking-wider text-gold-600 font-semibold">Pricing</div>
            <p className="text-gray-700 mt-2 leading-relaxed">{p.pricing}</p>
          </div>
          <div className="p-6 bg-white rounded-card border border-amber-100 shadow-card">
            <div className="text-xs uppercase tracking-wider text-gold-600 font-semibold">Rollout</div>
            <p className="text-gray-700 mt-2 leading-relaxed">{p.rolloutETA}</p>
          </div>
        </div>
      </section>

      <section id="waitlist" className="container mx-auto px-4 py-14 max-w-2xl">
        <header className="text-center mb-8">
          <h2 className="font-serif text-2xl md:text-3xl text-kerala-700">Join the early-access waitlist</h2>
          <p className="text-gray-700 mt-2">First cohort gets pilot pricing + direct line to our product team.</p>
        </header>
        <WaitlistForm productSlug={p.slug} productName={p.name} />
      </section>

      <section className="container mx-auto px-4 pb-12 max-w-3xl">
        <div className="p-5 rounded-card bg-amber-50 border border-amber-100 text-sm text-amber-900 leading-relaxed flex gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Status check:</strong> {p.name} is in <strong>{status.label.toLowerCase()}</strong>.
            Listing here captures interest only — we&apos;re building openly and will only invoice when the
            product is live and validated by pilot partners. Joining the waitlist is free and creates no obligation.
          </p>
        </div>
      </section>
    </>
  )
}
