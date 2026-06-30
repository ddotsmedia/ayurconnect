import { notFound as nf } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import Link from 'next/link'
import type { Metadata } from 'next'
import { API_INTERNAL as API } from '../../../../lib/server-fetch'
import { CardClient } from './_client'

type Doctor = {
  id: string; name: string; specialization: string; qualification?: string | null
  district: string; country?: string | null; ccimVerified: boolean
  contact?: string | null; workplace?: string | null; photoUrl?: string | null
  experienceYears?: number | null
}

async function fetchDoctor(id: string): Promise<Doctor | null> {
  const cookie = (await nextHeaders()).get('cookie') ?? ''
  try {
    const r = await fetch(`${API}/doctors/${id}`, { headers: { cookie }, cache: 'no-store' })
    if (!r.ok) return null
    return await r.json() as Doctor
  } catch { return null }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const d = await fetchDoctor(id)
  if (!d) return { title: 'Doctor card — AyurConnect' }
  return {
    title: `Dr. ${d.name.replace(/^Dr\.?\s*/i, '')} — Digital Card | AyurConnect`,
    description: `Shareable digital visiting card for Dr. ${d.name}, ${d.specialization}, ${d.district}.`,
    alternates: { canonical: `/doctors/${d.id}/card` },
    robots: { index: false, follow: true },
  }
}

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const d = await fetchDoctor(id)
  if (!d) nf()
  const profileUrl = `https://ayurconnect.com/doctors/${d.id}`
  const cleanName = d.name.replace(/^Dr\.?\s*/i, '')
  const initials = cleanName.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase() ?? '').join('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-kerala-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-4 print:hidden">
          <p className="text-xs text-gray-600">Your shareable AyurConnect digital visiting card</p>
        </div>

        {/* Printable card — 3.5"x2" business-card aspect at print, larger on screen */}
        <article className="bg-white border border-kerala-200 rounded-card shadow-cardLg p-6 print:shadow-none print:border-gray-300 print:rounded-none">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              {d.photoUrl
                ? <img src={d.photoUrl} alt={cleanName} className="w-20 h-20 rounded-full object-cover ring-2 ring-kerala-200" />
                : <span className="w-20 h-20 rounded-full bg-kerala-700 text-white text-2xl font-semibold flex items-center justify-center">{initials}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-2xl text-kerala-800 leading-tight">Dr. {cleanName}</p>
              {d.qualification && <p className="text-xs text-gray-600">{d.qualification}</p>}
              <p className="text-sm font-semibold text-kerala-700 mt-1">{d.specialization}</p>
              <p className="text-xs text-gray-600 mt-0.5">📍 {d.district}{d.country && d.country !== 'IN' ? `, ${d.country}` : ', Kerala'}</p>
              {d.workplace && <p className="text-xs text-gray-700 mt-0.5">{d.workplace}</p>}
              {d.experienceYears != null && <p className="text-xs text-gray-500 mt-0.5">{d.experienceYears}+ years experience</p>}
              {d.ccimVerified && <p className="text-[10px] text-emerald-700 font-semibold mt-1">✅ Verified on AyurConnect</p>}
            </div>
            {/* QR for the profile URL */}
            <div className="flex-shrink-0 print:block">
              <CardClient profileUrl={profileUrl} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
            <p className="font-mono break-all">{profileUrl.replace('https://', '')}</p>
            <p className="font-semibold text-kerala-700">AyurConnect</p>
          </div>
        </article>

        {/* Toolbar — hidden in print */}
        <div className="mt-5 flex flex-wrap gap-2 justify-center print:hidden">
          <a href={`https://wa.me/?text=${encodeURIComponent(`Dr. ${cleanName} — ${d.specialization}, ${d.district}. View profile: ${profileUrl}`)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-4 py-2 bg-[#25D366] text-white text-sm font-semibold rounded">
            Share on WhatsApp
          </a>
          <a href={profileUrl} className="inline-flex items-center gap-1 px-4 py-2 border-2 border-kerala-700 text-kerala-700 text-sm font-semibold rounded">View profile</a>
          <Link href={`/doctors/${d.id}`} className="text-xs text-gray-500 hover:text-kerala-700 underline self-center">Back</Link>
        </div>

        <p className="text-center text-[10px] text-gray-500 mt-3 print:hidden">Use your browser&rsquo;s Print → Save as PDF for a print-quality copy.</p>
      </div>

      <style>{`@media print { body { background: white !important; } @page { size: 3.5in 2in; margin: 0.25in; } }`}</style>
    </div>
  )
}
