import Link from 'next/link'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { ShieldCheck, ShieldX, ChevronRight } from 'lucide-react'
import { breadcrumbLd, ldGraph, pageMetadata } from '../../../lib/seo'
import { findBatch } from '../_batches'

export async function generateMetadata({ params }: { params: Promise<{ batch: string }> }): Promise<Metadata> {
  const { batch } = await params
  const rec = findBatch(decodeURIComponent(batch))
  return pageMetadata({
    title: rec
      ? `Verified: ${rec.productName} (batch ${rec.batch}) | AyurConnect`
      : `Batch ${decodeURIComponent(batch)} — not found | AyurConnect`,
    description: rec
      ? `Batch ${rec.batch} of ${rec.productName} is a genuine GMP-certified product from ${rec.manufacturer} (AYUSH licence ${rec.ayushLicenseRef}).`
      : 'This batch code was not found in the AyurConnect authenticity registry.',
    path: `/verify/${encodeURIComponent(decodeURIComponent(batch))}`,
    noindex: true, // per-batch result pages should not be indexed
  })
}

export default async function BatchResultPage({ params }: { params: Promise<{ batch: string }> }) {
  const { batch } = await params
  const code = decodeURIComponent(batch)
  const rec = findBatch(code)

  const ld = ldGraph(
    breadcrumbLd([
      { name: 'Home', url: '/' },
      { name: 'Verify', url: '/verify' },
      { name: code, url: `/verify/${encodeURIComponent(code)}` },
    ]),
  )

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <GradientHero variant={rec ? 'green' : 'hospital'} size="md">
        <nav className="text-sm text-white/70 mb-3">
          <Link href="/verify" className="hover:text-white">Verify</Link>
        </nav>
        <h1 className="font-serif text-2xl md:text-4xl font-bold flex items-center gap-3">
          {rec ? <ShieldCheck className="w-8 h-8" /> : <ShieldX className="w-8 h-8" />}
          {rec ? 'Genuine product' : 'Batch not found'}
        </h1>
        <p className="text-white/85 mt-2">Batch code: <span className="font-mono">{code}</span></p>
      </GradientHero>

      <section className="container mx-auto px-4 py-12 max-w-2xl">
        {rec ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <dl className="grid grid-cols-3 gap-y-3 text-sm">
              <dt className="text-gray-500">Product</dt>
              <dd className="col-span-2 font-semibold text-gray-900">{rec.productName}</dd>
              <dt className="text-gray-500">Manufacturer</dt>
              <dd className="col-span-2 text-gray-900">{rec.manufacturer}</dd>
              <dt className="text-gray-500">AYUSH licence</dt>
              <dd className="col-span-2 font-mono text-gray-900">{rec.ayushLicenseRef}</dd>
              <dt className="text-gray-500">GMP certified</dt>
              <dd className="col-span-2 text-gray-900">{rec.gmpCertified ? 'Yes' : 'No'}</dd>
              <dt className="text-gray-500">Manufactured</dt>
              <dd className="col-span-2 text-gray-900">{rec.mfgDate}</dd>
              <dt className="text-gray-500">Expires</dt>
              <dd className="col-span-2 text-gray-900">{rec.expDate}</dd>
            </dl>
            {rec.note && <p className="text-emerald-800 text-sm mt-4">{rec.note}</p>}
            <div className="mt-5 flex flex-wrap gap-4">
              <Link href="/marketplace" className="text-kerala-700 font-medium hover:underline inline-flex items-center gap-1">
                View in marketplace <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/doctors" className="text-kerala-700 font-medium hover:underline inline-flex items-center gap-1">
                Consult a doctor <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-gray-800">
            <p className="mb-3">
              We could not find batch <span className="font-mono">{code}</span> in the authenticity
              registry. This may mean:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>The code was mistyped — re-check the printed batch on the pack.</li>
              <li>The manufacturer does not yet participate in batch verification.</li>
              <li>The product may not be genuine — confirm directly with the manufacturer.</li>
            </ul>
            <Link href="/verify" className="inline-flex items-center gap-1 text-kerala-700 font-medium mt-4 hover:underline">
              Try another code <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
