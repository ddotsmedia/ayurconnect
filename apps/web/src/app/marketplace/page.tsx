import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { ShoppingBag, ChevronRight, ShieldCheck, Store, AlertTriangle, FlaskConical, Droplets, Leaf, Package, Wrench, BookOpen } from 'lucide-react'
import { CATEGORIES, PRODUCTS } from './_data/products'
import { VendorInquiryForm } from './_vendor-form'

export const metadata = {
  title: 'Ayurvedic Marketplace — GMP-Certified Pharmacy Products | AyurConnect',
  description: 'Curated catalogue of classical formulations, medicated oils, herbs, and Panchakarma kits from Kottakkal, Vaidyaratnam, AVP, and other GMP-certified Kerala pharmacies.',
  alternates: { canonical: '/marketplace' },
}

const ICONS = { FlaskConical, Droplets, Leaf, Package, Wrench, BookOpen } as const
type IconKey = keyof typeof ICONS

export default function MarketplacePage() {
  return (
    <>
      <GradientHero variant="green" size="lg">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-5">
            <ShoppingBag className="w-3 h-3" /> Marketplace
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Verified <span className="text-gold-400">Ayurvedic</span> products
          </h1>
          <p className="mt-5 text-lg text-white/80">
            A curated catalogue of classical formulations, medicated oils, herbs, and tools sourced
            from GMP-certified Kerala pharmacies. We do not yet take payments through AyurConnect —
            each product links to the verified vendor directly.
          </p>
        </div>
      </GradientHero>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12 max-w-6xl">
        <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mb-6 text-center">Browse by category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {CATEGORIES.map((c) => {
            const Icon = ICONS[c.icon as IconKey] ?? Package
            const count = PRODUCTS.filter((p) => p.category === c.slug).length
            return (
              <a href={`#${c.slug}`} key={c.slug} className="group p-5 bg-white rounded-card border border-gray-100 shadow-card hover:shadow-cardLg transition-all">
                <div className="flex items-start gap-3">
                  <Icon className="w-6 h-6 text-kerala-700 flex-shrink-0" />
                  <div>
                    <h3 className="font-serif text-lg text-kerala-700 group-hover:text-kerala-600">{c.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{c.desc}</p>
                    <span className="text-xs text-gold-600 mt-2 inline-block">{count} item{count === 1 ? '' : 's'}</span>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </section>

      {/* Products by category */}
      {CATEGORIES.map((c) => {
        const items = PRODUCTS.filter((p) => p.category === c.slug)
        if (items.length === 0) return null
        const Icon = ICONS[c.icon as IconKey] ?? Package
        return (
          <section key={c.slug} id={c.slug} className="container mx-auto px-4 py-10 max-w-6xl">
            <header className="mb-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gold-600 font-semibold">
                <Icon className="w-4 h-4" /> Category
              </div>
              <h2 className="font-serif text-2xl md:text-3xl text-kerala-700 mt-1">{c.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{c.desc}</p>
            </header>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((p) => (
                <article key={p.id} className="p-5 bg-white rounded-card border border-gray-100 shadow-card flex flex-col">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="font-serif text-lg text-kerala-700 leading-tight">{p.name}</h3>
                    {p.vendorCertified && (
                      <span title="GMP-certified vendor" className="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 bg-kerala-50 border border-kerala-200 rounded text-[10px] text-kerala-700 font-semibold">
                        <ShieldCheck className="w-3 h-3" /> GMP
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">by {p.vendor}</p>
                  <p className="text-sm text-gray-700 leading-relaxed flex-1">{p.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.uses.slice(0, 3).map((u) => (
                      <span key={u} className="text-[11px] px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-full text-gray-600">{u}</span>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500">{p.size}</div>
                      <div className="font-semibold text-kerala-700">{p.priceRange}</div>
                    </div>
                    <Link href="/contact" className="inline-flex items-center gap-1 px-3 py-1.5 bg-kerala-600 hover:bg-kerala-700 text-white rounded text-xs font-semibold">
                      Inquire <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )
      })}

      {/* Vendor inquiry */}
      <section id="become-a-vendor" className="bg-cream py-14 mt-10">
        <div className="container mx-auto px-4 max-w-3xl">
          <header className="text-center mb-8">
            <Store className="w-10 h-10 text-gold-500 mx-auto mb-3" />
            <h2 className="font-serif text-2xl md:text-3xl text-kerala-700">List your products</h2>
            <p className="text-gray-700 mt-2">
              Are you a GMP-certified Ayurvedic pharmacy, herb cultivator, or wellness brand? We&apos;re
              building the marketplace and selecting initial vendor partners.
            </p>
          </header>
          <VendorInquiryForm />
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="p-5 rounded-card bg-amber-50 border border-amber-100 text-sm text-amber-900 leading-relaxed flex gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong>About this catalogue:</strong> AyurConnect curates this list based on vendor
            certifications and product reputation. We do not currently process payments — &ldquo;Inquire&rdquo;
            connects you to AyurConnect to discuss the product and recommend a verified vendor. Direct
            checkout, vendor portal, reviews, and shipping integration are coming in a later phase.
            Always consult a verified practitioner before starting internal classical medicine.
          </div>
        </div>
      </section>
    </>
  )
}
