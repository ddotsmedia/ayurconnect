import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, User, Play, Calendar, ExternalLink } from 'lucide-react'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
import { breadcrumbLd, ldGraph, SITE_URL, clip } from '../../../lib/seo'
import { VideoViewBeacon } from './_view-beacon'

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
  tags: string[]
  viewCount: number
  createdAt: string
  updatedAt: string
  speakerDoctor: { id: string; name: string; specialization: string | null; photoUrl: string | null; district: string | null } | null
}

async function fetchVideo(id: string): Promise<Video | null> {
  try {
    const res = await fetch(`${API}/videos/${id}`, { next: { revalidate: 120 } })
    if (!res.ok) return null
    return await res.json() as Video
  } catch { return null }
}

async function fetchRelated(category: string | null, excludeId: string): Promise<Video[]> {
  if (!category) return []
  try {
    const res = await fetch(`${API}/videos?category=${category}&limit=4`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data = await res.json() as { videos: Video[] }
    return (data.videos ?? []).filter((v) => v.id !== excludeId).slice(0, 3)
  } catch { return [] }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const v = await fetchVideo(id)
  if (!v) return { title: 'Video not found | AyurConnect' }
  return {
    title:       `${v.title} | AyurConnect Videos`,
    description: clip(v.description ?? `Watch ${v.title} — curated Ayurveda video on AyurConnect.`, 160),
    alternates:  { canonical: `/videos/${v.id}` },
    openGraph: {
      title:       v.title,
      description: clip(v.description ?? '', 160),
      images:      [v.thumbnailUrl || `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`],
      videos:      [{ url: `https://www.youtube.com/embed/${v.youtubeId}`, type: 'text/html' }],
      type:        'video.other',
    },
  }
}

export default async function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const v = await fetchVideo(id)
  if (!v) notFound()
  const related = await fetchRelated(v.category, v.id)

  // Schema.org VideoObject — the same fields Google needs to index the video
  // and (potentially) show it in the Videos tab of SERPs with timestamps.
  const jsonLd = ldGraph(
    {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      '@id': `${SITE_URL}/videos/${v.id}`,
      name: v.title,
      description: v.description ?? v.title,
      thumbnailUrl: [v.thumbnailUrl || `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`],
      uploadDate: v.createdAt,
      contentUrl: `https://www.youtube.com/watch?v=${v.youtubeId}`,
      embedUrl:   `https://www.youtube-nocookie.com/embed/${v.youtubeId}`,
      duration:   v.duration ?? undefined,
      inLanguage: v.language,
      interactionStatistic: v.viewCount > 0 ? {
        '@type': 'InteractionCounter',
        interactionType: { '@type': 'WatchAction' },
        userInteractionCount: v.viewCount,
      } : undefined,
      author: v.speakerDoctor
        ? { '@type': 'Person', name: v.speakerDoctor.name, url: `${SITE_URL}/doctors/${v.speakerDoctor.id}` }
        : v.speaker
        ? { '@type': 'Person', name: v.speaker }
        : undefined,
      publisher: { '@id': `${SITE_URL}#org` },
      keywords: v.tags.join(', '),
    },
    breadcrumbLd([
      { name: 'Home',   url: '/' },
      { name: 'Videos', url: '/videos' },
      { name: v.title,  url: `/videos/${v.id}` },
    ]),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <VideoViewBeacon id={v.id} />

      <div className="bg-cream min-h-screen pb-16">
        <div className="container mx-auto px-4 max-w-5xl py-6">
          <Link href="/videos" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-kerala-700">
            <ChevronLeft className="w-4 h-4" /> All videos
          </Link>
        </div>

        <div className="container mx-auto px-4 max-w-5xl">
          {/* Embed */}
          <div className="relative aspect-video bg-black rounded-card overflow-hidden shadow-cardLg">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?rel=0&modestbranding=1`}
              title={v.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {/* Title + meta */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-kerala-700 leading-tight">{v.title}</h1>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                {v.category && <span className="px-2 py-0.5 rounded-full bg-gray-100 capitalize">{v.category.replace('-', ' ')}</span>}
                <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(v.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                {v.viewCount > 0 && <span className="inline-flex items-center gap-1"><Play className="w-3 h-3" /> {v.viewCount.toLocaleString()} plays</span>}
                {v.duration && <span>· {v.duration}</span>}
              </div>

              {v.description && (
                <div className="mt-6 prose prose-sm max-w-none">
                  {v.description.split(/\n\n+/).map((p, i) => <p key={i} className="text-gray-700 leading-relaxed mb-3">{p}</p>)}
                </div>
              )}

              {v.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {v.tags.map((t) => (
                    <Link key={t} href={`/videos?q=${encodeURIComponent(t)}`} className="px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-700 hover:border-kerala-300">
                      #{t}
                    </Link>
                  ))}
                </div>
              )}

              <a
                href={`https://www.youtube.com/watch?v=${v.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-6 text-sm text-kerala-700 hover:underline"
              >
                Watch on YouTube <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Speaker card */}
            <aside className="space-y-4">
              {v.speakerDoctor ? (
                <Link href={`/doctors/${v.speakerDoctor.id}`} className="block bg-white rounded-card border border-gray-100 shadow-card p-5 hover:shadow-cardLg transition-shadow">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">Featured doctor</p>
                  <div className="flex items-center gap-3">
                    {v.speakerDoctor.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.speakerDoctor.photoUrl} alt={v.speakerDoctor.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <span className="w-12 h-12 rounded-full bg-kerala-700 text-white flex items-center justify-center font-semibold">
                        {v.speakerDoctor.name.split(/\s+/).slice(0, 2).map((s) => s.charAt(0).toUpperCase()).join('')}
                      </span>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{v.speakerDoctor.name}</p>
                      {v.speakerDoctor.specialization && <p className="text-xs text-gray-500">{v.speakerDoctor.specialization}</p>}
                      {v.speakerDoctor.district && <p className="text-xs text-gray-500">{v.speakerDoctor.district}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-kerala-700 mt-3 font-medium">View profile →</p>
                </Link>
              ) : v.speaker ? (
                <div className="bg-white rounded-card border border-gray-100 shadow-card p-5">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Speaker</p>
                  <p className="text-sm font-medium text-gray-900 inline-flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /> {v.speaker}</p>
                </div>
              ) : null}

              <div className="bg-white rounded-card border border-gray-100 shadow-card p-5 text-xs text-gray-600 leading-relaxed">
                <p className="font-semibold text-gray-900 mb-1">About this video</p>
                <p>This YouTube video is curated by AyurConnect for educational value. We embed via youtube-nocookie.com — no cookies until you press play.</p>
              </div>
            </aside>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-14">
              <h2 className="font-serif text-2xl text-kerala-700 mb-5">More on this topic</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {related.map((r) => (
                  <Link key={r.id} href={`/videos/${r.id}`} className="bg-white rounded-card border border-gray-100 overflow-hidden shadow-card hover:shadow-cardLg transition-shadow">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.thumbnailUrl || `https://i.ytimg.com/vi/${r.youtubeId}/hqdefault.jpg`} alt={r.title} loading="lazy" className="w-full aspect-video object-cover" />
                    <p className="p-3 text-sm text-gray-800 line-clamp-2">{r.title}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
