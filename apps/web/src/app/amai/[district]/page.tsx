import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AMAI_DISTRICTS } from '../../_gsc/_amai'
import { DistrictAmaiPage } from '../../_gsc/DistrictAmaiPage'

export const revalidate = 300 // Phase 4 (2026-07-23): reverted from force-dynamic per audit prompt

export function generateStaticParams() {
  return Object.keys(AMAI_DISTRICTS).map((district) => ({ district }))
}

export async function generateMetadata({ params }: { params: Promise<{ district: string }> }): Promise<Metadata> {
  const { district } = await params
  const c = AMAI_DISTRICTS[district]
  if (!c) return { title: 'AMAI district not found' }
  return {
    title: c.title,
    description: c.metaDescription,
    alternates: { canonical: `/amai/${c.slug}` },
    keywords: c.keywords,
    openGraph: { title: c.title, description: c.metaDescription, url: `/amai/${c.slug}`, type: 'article' },
    other: { robots: 'max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
  }
}

export default async function Page({ params }: { params: Promise<{ district: string }> }) {
  const { district } = await params
  const c = AMAI_DISTRICTS[district]
  if (!c) notFound()
  return <DistrictAmaiPage content={c} />
}
