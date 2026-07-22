import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { Building2, ShieldCheck, MapPin } from 'lucide-react'
import { API_INTERNAL as API } from '../../../../lib/server-fetch'
import { pageMetadata } from '../../../../lib/seo'

import { TYPES, TYPE_SLUGS } from './_slugs'

type Hospital = { id: string; name: string; type: string; district: string; ccimVerified: boolean; ayushCertified: boolean; panchakarma: boolean; nabh: boolean; profile: string | null }

async function fetchByType(type: string): Promise<Hospital[]> {
  try {
    const res = await fetch(`${API}/hospitals?type=${encodeURIComponent(type)}&limit=200`, { cache: 'no-store' })
    if (!res.ok) return []
    return (await res.json()) as Hospital[]
  } catch { return [] }
}

export const dynamic = 'force-dynamic';

export function generateStaticParams() { return TYPE_SLUGS.map((type) => ({ type })) }

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params
  if (!TYPES[type]) return { title: 'Not found' }
  return pageMetadata({
    path:        `/hospitals/type/${type}`,
    title:       `Ayurveda ${TYPES[type]} in Kerala`,
    description: `Verified Ayurveda ${TYPES[type].toLowerCase()} across Kerala — NABH, AYUSH, Tourism-Classified options.`,
    keywords:    [`ayurveda ${type} kerala`, `${type} ayurveda`, `kerala ${type}`],
  })
}

export default async function HospitalsByTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  if (!TYPES[type]) notFound()
  const items = await fetchByType(type)
  const lowData = items.length < 3
  return (
    <>
      {lowData && <meta name="robots" content="noindex,follow" />}
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Ayurveda {TYPES[type]} in Kerala</h1>
          <p className="text-white/85 mt-3">{items.length} verified.</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-6xl">
        {items.length === 0 ? (
          <p className="text-sm text-gray-600 bg-white border border-gray-100 rounded-card p-8 text-center">None listed yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((h) => (
              <Link key={h.id} href={`/hospitals/${h.id}`} className="bg-white border border-gray-100 rounded-card p-4 shadow-card hover:shadow-cardLg">
                <div className="flex items-start gap-2">
                  <Building2 className="w-6 h-6 text-kerala-700" />
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-ink truncate">{h.name}{h.ccimVerified && <ShieldCheck className="inline w-3.5 h-3.5 ml-1 text-emerald-600" />}</h2>
                    <p className="text-xs text-gray-600 inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {h.district}</p>
                    {h.profile && <p className="text-xs text-gray-700 mt-1 line-clamp-2">{h.profile}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
