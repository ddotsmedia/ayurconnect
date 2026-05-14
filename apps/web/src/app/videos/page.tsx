import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { Play, Clock, User, Filter } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'
import { AYURVEDA_KEYWORDS } from '../../lib/seo'

type Video = {
  id: string
  title: string
  description: string | null
  youtubeId: string
  thumbnailUrl: string | null
  category: string | null
  speaker: string | null
  duration: string | null
  language: string
  viewCount: number
  featured: boolean
  createdAt: string
  speakerDoctor: { id: string; name: string; specialization: string | null; photoUrl: string | null } | null
}

export const metadata = {
  title: 'Ayurveda Health Videos — Curated YouTube Library | AyurConnect',
  description: 'Curated YouTube videos on Panchakarma, yoga, herbs, lifestyle, and classical Ayurveda — vetted for accuracy by CCIM-verified doctors. Free, ad-supported on YouTube.',
  alternates: { canonical: '/videos' },
  keywords: [
    ...AYURVEDA_KEYWORDS.primary,
    ...AYURVEDA_KEYWORDS.treatments,
    ...AYURVEDA_KEYWORDS.concepts,
    'ayurveda youtube', 'ayurveda video', 'ayurveda video library',
    'panchakarma video', 'yoga video', 'ayurvedic cooking video',
  ],
}

const CATEGORY_LABEL: Record<string, string> = {
  panchakarma:    'Panchakarma',
  yoga:           'Yoga & Pranayama',
  herbs:          'Herbs & Formulations',
  lifestyle:      'Lifestyle & Dinacharya',
  qa:             'Doctor Q&A',
  research:       'Research & Evidence',
  recipes:        'Ayurvedic Recipes',
  kids:           'Children\'s Health',
  'womens-health': 'Women\'s Health',
  'mens-health':   'Men\'s Health',
}

const CATEGORY_TONE: Record<string, string> = {
  panchakarma:    'bg-rose-100 text-rose-800',
  yoga:           'bg-purple-100 text-purple-800',
  herbs:          'bg-emerald-100 text-emerald-800',
  lifestyle:      'bg-blue-100 text-blue-800',
  qa:             'bg-amber-100 text-amber-800',
  research:       'bg-indigo-100 text-indigo-800',
  recipes:        'bg-orange-100 text-orange-800',
  kids:           'bg-pink-100 text-pink-800',
  'womens-health': 'bg-fuchsia-100 text-fuchsia-800',
  'mens-health':   'bg-sky-100 text-sky-800',
}

async function fetchVideos(params: URLSearchParams): Promise<{ videos: Video[]; total: number }> {
  try {
    const res = await fetch(`${API}/videos?${params.toString()}`, { next: { revalidate: 60 } })
    if (!res.ok) return { videos: [], total: 0 }
    const data = await res.json() as { videos: Video[]; pagination: { total: number } }
    return { videos: data.videos ?? [], total: data.pagination?.total ?? 0 }
  } catch { return { videos: [], total: 0 } }
}

type SP = { category?: string; language?: string; q?: string }

export default async function VideosListPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const qs = new URLSearchParams()
  if (sp.category) qs.set('category', sp.category)
  if (sp.language) qs.set('language', sp.language)
  if (sp.q)        qs.set('search',   sp.q)
  qs.set('limit', '48')
  const { videos, total } = await fetchVideos(qs)

  return (
    <>
      <GradientHero variant="green" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <Play className="w-3 h-3" /> Curated YouTube library
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white">Ayurveda Health Videos</h1>
          <p className="mt-4 text-lg text-white/85">
            Panchakarma demonstrations, doctor Q&amp;A, classical recipes, yoga sequences — hand-picked by CCIM-verified doctors and grouped by topic.
          </p>
        </div>
      </GradientHero>

      <section className="container mx-auto px-4 py-10 max-w-6xl">
        {/* Category filter chips */}
        <form action="/videos" className="flex flex-wrap items-center gap-2 mb-6">
          <Link href="/videos" className={`px-3 py-1.5 rounded-full text-sm border ${!sp.category ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-300'}`}>
            All ({total})
          </Link>
          {Object.entries(CATEGORY_LABEL).map(([slug, label]) => (
            <Link
              key={slug}
              href={`/videos?category=${slug}`}
              className={`px-3 py-1.5 rounded-full text-sm border ${sp.category === slug ? 'bg-kerala-700 text-white border-kerala-700' : 'bg-white text-gray-700 border-gray-200 hover:border-kerala-300'}`}
            >
              {label}
            </Link>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <input
              name="q"
              defaultValue={sp.q ?? ''}
              placeholder="Search videos…"
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-md w-44 focus:outline-none focus:ring-1 focus:ring-kerala-700"
            />
            {sp.category && <input type="hidden" name="category" value={sp.category} />}
            <button className="px-4 py-1.5 text-sm bg-kerala-700 text-white rounded-md hover:bg-kerala-800">Search</button>
          </div>
        </form>

        {videos.length === 0 ? (
          <div className="bg-white rounded-card border border-gray-100 p-10 text-center text-gray-600">
            <Filter className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>No videos found{sp.category ? ` in ${CATEGORY_LABEL[sp.category] ?? sp.category}` : ''}{sp.q ? ` for &ldquo;${sp.q}&rdquo;` : ''}.</p>
            <Link href="/videos" className="text-kerala-700 hover:underline text-sm mt-3 inline-block">Browse all videos</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map((v) => <VideoCard key={v.id} v={v} />)}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-10 leading-relaxed text-center max-w-2xl mx-auto">
          Videos are hosted on YouTube and embedded with privacy-enhanced mode — cookies are only set when you press play.
          AyurConnect does not own this content; we curate links that align with classical, evidence-aware Ayurveda.
        </p>
      </section>
    </>
  )
}

function VideoCard({ v }: { v: Video }) {
  const thumb = v.thumbnailUrl || `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`
  return (
    <Link href={`/videos/${v.id}`} className="group bg-white rounded-card border border-gray-100 shadow-card hover:shadow-cardLg transition-shadow overflow-hidden flex flex-col">
      <div className="relative aspect-video bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumb} alt={v.title} loading="lazy" className="w-full h-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-kerala-700 ml-1" fill="currentColor" />
          </span>
        </span>
        {v.duration && (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/75 text-white text-[11px] rounded">{v.duration}</span>
        )}
        {v.featured && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-gold-500 text-white text-[10px] font-semibold rounded uppercase tracking-wider">Featured</span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-serif text-base text-gray-900 leading-snug line-clamp-2 group-hover:text-kerala-700 transition-colors">
          {v.title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
          {v.category && (
            <span className={`px-2 py-0.5 rounded-full ${CATEGORY_TONE[v.category] ?? 'bg-gray-100 text-gray-700'}`}>
              {CATEGORY_LABEL[v.category] ?? v.category}
            </span>
          )}
          {(v.speakerDoctor?.name || v.speaker) && (
            <span className="inline-flex items-center gap-1">
              <User className="w-3 h-3" /> {v.speakerDoctor?.name ?? v.speaker}
            </span>
          )}
        </div>
        <div className="mt-auto pt-3 text-[11px] text-gray-400 flex items-center gap-3">
          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(v.createdAt).toLocaleDateString()}</span>
          {v.viewCount > 0 && <span>· {v.viewCount.toLocaleString()} plays</span>}
        </div>
      </div>
    </Link>
  )
}
