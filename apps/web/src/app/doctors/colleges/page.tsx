import Link from 'next/link'
import type { Metadata } from 'next'
import { GraduationCap, ChevronRight, MapPin } from 'lucide-react'
import { COLLEGES } from './_data'

export const metadata: Metadata = {
  title: 'Ayurveda College Alumni — AyurConnect',
  description: 'Directory of Ayurveda college alumni on AyurConnect. Find verified BAMS/MD doctors from Kerala\'s top Ayurveda colleges + national institutions.',
  alternates: { canonical: '/doctors/colleges' },
}

export default function CollegesHubPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <nav className="text-xs text-gray-500 mb-2">
        <Link href="/doctors" className="hover:text-kerala-700">Doctors</Link>
        <ChevronRight className="inline w-3 h-3 mx-1" />
        <span className="text-gray-700">Colleges</span>
      </nav>
      <h1 className="font-serif text-3xl text-kerala-800 inline-flex items-center gap-2"><GraduationCap className="w-7 h-7" /> Ayurveda Colleges</h1>
      <p className="text-sm text-gray-600 mt-1">10 Ayurveda colleges across India. Click any college to view its verified alumni on AyurConnect.</p>

      <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        {COLLEGES.map((c) => (
          <li key={c.slug}>
            <Link href={`/doctors/colleges/${c.slug}`} className="block bg-white border border-gray-100 hover:border-kerala-300 rounded-card p-4 transition-colors">
              <p className="font-serif text-lg text-kerala-800 leading-snug">{c.name}</p>
              <p className="text-xs text-gray-600 mt-1 inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.location} · Est. {c.established}</p>
              <p className="text-sm text-gray-700 mt-2 line-clamp-2">{c.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
