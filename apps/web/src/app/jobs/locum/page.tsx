import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { Calendar, MapPin, Briefcase } from 'lucide-react'
import { pageMetadata } from '../../../lib/seo'

export const metadata = pageMetadata({
  path: '/jobs/locum',
  title: 'Ayurveda Locum Doctor Jobs — Short-term Cover',
  description: 'Find locum Ayurveda doctor positions. Daily rate cover, weekend cover, leave cover at Kerala + UAE hospitals.',
  keywords: ['ayurveda locum', 'BAMS locum', 'locum doctor kerala', 'short term ayurveda job'],
})

const RATE_BENCHMARKS = [
  { spec: 'Panchakarma', location: 'Kerala',   range: '₹3,500 – ₹6,000 / day' },
  { spec: 'Panchakarma', location: 'UAE',      range: 'AED 800 – 1,500 / day' },
  { spec: 'Kayachikitsa', location: 'Kerala',  range: '₹3,000 – ₹5,500 / day' },
  { spec: 'Prasuti',     location: 'Kerala',   range: '₹3,500 – ₹6,000 / day' },
  { spec: 'General BAMS', location: 'Kerala',  range: '₹2,500 – ₹4,500 / day' },
  { spec: 'General BAMS', location: 'UAE',     range: 'AED 600 – 1,100 / day' },
]

export default function LocumPage() {
  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight">Ayurveda Locum Marketplace</h1>
          <p className="text-white/85 mt-3">Doctors post availability. Employers post short-term cover. Match by date + location + specialization.</p>
        </div>
      </GradientHero>
      <section className="container mx-auto px-4 py-10 max-w-5xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/jobs/profile" className="bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg">
            <Calendar className="w-8 h-8 text-kerala-700" />
            <h2 className="font-serif text-xl text-ink mt-2">I am a doctor</h2>
            <p className="text-sm text-gray-700 mt-1">Post your availability window — dates, locations, daily rate.</p>
            <span className="mt-3 inline-block text-xs text-kerala-700">Open my candidate profile →</span>
          </Link>
          <Link href="/jobs/employers/post" className="bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg">
            <Briefcase className="w-8 h-8 text-kerala-700" />
            <h2 className="font-serif text-xl text-ink mt-2">I am hiring</h2>
            <p className="text-sm text-gray-700 mt-1">Post a locum job — needs immediate cover badge boosts visibility.</p>
            <span className="mt-3 inline-block text-xs text-kerala-700">Post locum job →</span>
          </Link>
        </div>

        <article className="bg-white border border-gray-100 rounded-card p-5 shadow-card">
          <h2 className="font-serif text-lg text-ink">Locum rate benchmarks</h2>
          <p className="text-xs text-gray-600">Reference rates as of 2026. Adjust for experience + scope.</p>
          <table className="w-full text-sm mt-3">
            <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-100"><th className="py-2">Specialization</th><th>Location</th><th>Daily rate</th></tr></thead>
            <tbody>
              {RATE_BENCHMARKS.map((r) => (
                <tr key={`${r.spec}-${r.location}`} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 font-semibold text-ink"><MapPin className="inline w-3 h-3 mr-1 text-gray-400" />{r.spec}</td>
                  <td className="text-gray-700">{r.location}</td>
                  <td className="text-gray-800 font-mono">{r.range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </>
  )
}
