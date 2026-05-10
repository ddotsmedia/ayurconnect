import Link from 'next/link'
import { GradientHero } from '@ayurconnect/ui'
import { MessageSquare, ShieldCheck } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'

type Comment = { id: string; user: { name: string | null } | null }
type Post = {
  id: string
  title: string
  content: string
  category: string
  language: string
  createdAt: string
  user: { id: string; name: string | null; email: string }
  comments: Comment[]
}

const CATEGORY: Record<string, { label: string; bg: string; text: string }> = {
  'doctor-discussion': { label: 'Doctors',   bg: 'bg-kerala-50',  text: 'text-kerala-700'  },
  'patient-forum':     { label: 'Patients',  bg: 'bg-blue-50',    text: 'text-blue-700'    },
  'webinar':           { label: 'Webinar',   bg: 'bg-purple-50',  text: 'text-purple-700'  },
  'research':          { label: 'Research',  bg: 'bg-amber-50',   text: 'text-amber-700'   },
}

async function fetchPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${API}/forum/posts?limit=50`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = (await res.json()) as { posts: Post[] }
    return data.posts ?? []
  } catch { return [] }
}

export const metadata = {
  title: 'AyurConnect Community Forum — Doctors & Patients',
  description: 'Discussions on classical Ayurveda cases, herbs, treatments, and patient questions. CCIM-verified doctors and patients from across Kerala.',
}

export default async function ForumPage() {
  const posts = await fetchPosts()

  return (
    <>
      <GradientHero variant="forum" size="md">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 border border-white/20 mb-4">
            <MessageSquare className="w-3 h-3" /> Open community
          </span>
          <h1 className="text-3xl md:text-5xl text-white">Community Forum</h1>
          <p className="text-white/70 mt-3">
            Case discussions, research notes, herb questions, patient stories.
            CCIM-verified doctors and patients, all on one platform.
          </p>
          <Link href="/sign-in" className="inline-block mt-5 px-5 py-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-md text-sm">
            Sign in to post
          </Link>
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
          <aside>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
            <ul className="space-y-1 text-sm">
              {Object.entries(CATEGORY).map(([k, v]) => {
                const count = posts.filter((p) => p.category === k).length
                return (
                  <li key={k} className="flex justify-between text-gray-700">
                    <span>{v.label}</span>
                    <span className="text-subtle">{count}</span>
                  </li>
                )
              })}
            </ul>
            <div className="mt-6 p-3 rounded-card bg-kerala-50 border border-kerala-100 text-xs text-kerala-800 leading-relaxed">
              <strong>Doctors only?</strong> CCIM-verified practitioners get a verified badge and access to the doctor-discussion channel.
            </div>
          </aside>

          <section>
            <p className="text-sm text-muted mb-4"><strong className="text-ink">{posts.length}</strong> posts loaded</p>
            {posts.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-100 rounded-card">
                <MessageSquare className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                <p className="text-muted">No posts yet — be the first.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((p) => {
                  const cat = CATEGORY[p.category] ?? { label: p.category, bg: 'bg-gray-100', text: 'text-gray-700' }
                  return (
                    <article key={p.id} className="bg-white rounded-card border border-gray-100 shadow-card hover:shadow-cardLg hover:-translate-y-0.5 transition-all p-5">
                      <div className="flex items-center gap-2 text-[11px] mb-2">
                        <span className={`${cat.bg} ${cat.text} px-2 py-0.5 rounded-full font-medium`}>{cat.label}</span>
                        <span className="text-subtle uppercase">{p.language}</span>
                        <span className="text-subtle">·</span>
                        <span className="text-gray-500">{p.user?.name ?? 'Anonymous'}</span>
                        {p.user?.email?.endsWith('@ayurconnect.com') && (
                          <span className="inline-flex items-center gap-0.5 text-kerala-700 text-[10px]"><ShieldCheck className="w-3 h-3" /> staff</span>
                        )}
                        <span className="text-subtle ml-auto">{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-ink leading-snug">{p.title}</h3>
                      <p className="text-sm text-gray-700 mt-1.5 line-clamp-3 leading-relaxed">{p.content}</p>
                      <div className="mt-3 text-xs text-gray-500">
                        {p.comments.length} {p.comments.length === 1 ? 'reply' : 'replies'}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
