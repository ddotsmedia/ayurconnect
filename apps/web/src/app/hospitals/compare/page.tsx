import type { Metadata } from 'next'
import { CompareClient } from './_client'
import { API_INTERNAL as API, logServerFetchError } from '@/lib/server-fetch'
import { breadcrumbLd, ldGraph } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Compare Ayurveda Hospitals in Kerala',
  description: 'Side-by-side comparison of Ayurveda hospitals — accreditations, doctors, treatments, ratings, locations. Pick 2 or 3 to compare.',
  alternates: { canonical: '/hospitals/compare' },
  keywords: ['compare ayurveda hospitals', 'ayurveda hospital comparison kerala', 'panchakarma centre comparison'],
}

type Hospital = {
  id: string
  name: string
  district?: string | null
  type?: string | null
  establishedYear?: number | null
  accreditations?: string[] | null
  treatments?: string[] | null
  doctorCount?: number | null
  averageRating?: number | null
  reviewsCount?: number | null
  contact?: string | null
}

async function fetchHospitals(): Promise<Hospital[]> {
  try {
    const res = await fetch(`${API}/hospitals?limit=200`, { next: { revalidate: 1800 } })
    if (!res.ok) { logServerFetchError('compare:fetchHospitals', `HTTP ${res.status}`); return [] }
    const data = await res.json() as Record<string, unknown>
    const list = (data.hospitals ?? data.items ?? (Array.isArray(data) ? data : [])) as Hospital[]
    return Array.isArray(list) ? list : []
  } catch (err) { logServerFetchError('compare:fetchHospitals', err); return [] }
}

export default async function CompareHospitalsPage() {
  const hospitals = await fetchHospitals()
  const ld = ldGraph(breadcrumbLd([
    { name: 'Home',      url: 'https://ayurconnect.com' },
    { name: 'Hospitals', url: 'https://ayurconnect.com/hospitals' },
    { name: 'Compare',   url: 'https://ayurconnect.com/hospitals/compare' },
  ]))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="font-serif text-3xl text-kerala-800">Compare Ayurveda Hospitals</h1>
        <p className="text-sm text-gray-600 mt-1">Pick 2 or 3 hospitals to view side-by-side accreditations, treatments, doctors, and contact.</p>
        <CompareClient hospitals={hospitals} />
      </div>
    </>
  )
}
