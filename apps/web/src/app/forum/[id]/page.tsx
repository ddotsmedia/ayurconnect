import Link from 'next/link'
import { notFound } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import type { Metadata } from 'next'
import { GradientHero } from '@ayurconnect/ui'
import { ChevronLeft, ShieldCheck } from 'lucide-react'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
import { articleLd, breadcrumbLd, ldGraph, clip, SITE_URL } from '../../../lib/seo'
import { UpvoteButton } from './upvote-button'
import { ReplyForm } from './reply-form'

type Comment = { id: string; content: string; createdAt: string; user: { id: string; name: string | null } | null }
type Post = {
  id: string
  title: string
  content: string
  category: string
  language: string
  createdAt: string
  user: { id: string; name: string | null; email: string }
  comments: Comment[]
  upvoteCount: number
}

const CATEGORY: Record<string, { label: string; bg: string; text: string }> = {
  'doctor-discussion': { label: 'Doctors',   bg: 'bg-kerala-50',  text: 'text-kerala-700'  },
  'patient-forum':     { label: 'Patients',  bg: 'bg-blue-50',    text: 'text-blue-700'    },
  'webinar':           { label: 'Webinar',   bg: 'bg-purple-50',  text: 'text-purple-700'  },
  'research':          { label: 'Research',  bg: 'bg-amber-50',   text: 'text-amber-700'   },
}

async function fetchPost(id: string): Promise<Post | null> {
  try {
    const cookie = (await nextHeaders()).get('cookie') ?? ''
    const res = await fetch(`${API}/forum/posts/${id}`, { headers: { cookie }, cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as Post
  } catch { return null }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const post = await fetchPost(id)
  if (!post) return { title: 'Post not found' }
  const description = clip(post.content, 200)
  return {
    title: post.title,
    description,
    alternates: { canonical: `/forum/${post.id}` },
    openGraph: {
      title: post.title, description,
      url: `${SITE_URL}/forum/${post.id}`,
      type: 'article',
      publishedTime: post.createdAt,
      authors: [post.user?.name ?? 'AyurConnect'],
    },
    twitter: { card: 'summary_large_image', title: post.title, description },
  }
}

export default async function ForumPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await fetchPost(id)
  if (!post) notFound()
  const cat = CATEGORY[post.category] ?? { label: post.category, bg: 'bg-gray-100', text: 'text-gray-700' }

  const jsonLd = ldGraph(
    articleLd({
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category,
      language: post.language,
      createdAt: post.createdAt,
      authorName: post.user?.name,
      type: 'DiscussionForumPosting',
      urlPath: `/forum/${post.id}`,
    }),
    breadcrumbLd([
      { name: 'Home', url: '/' },
      { name: 'Forum', url: '/forum' },
      { name: cat.label, url: `/forum?category=${post.category}` },
      { name: post.title, url: `/forum/${post.id}` },
    ]),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GradientHero variant="forum" size="md">
        <div className="max-w-3xl">
          <Link href="/forum" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white mb-3">
            <ChevronLeft className="w-4 h-4" /> Back to forum
          </Link>
          <div className="flex items-center gap-2 text-[11px] mb-3">
            <span className={`bg-white/10 backdrop-blur px-2 py-0.5 rounded-full font-medium text-white border border-white/20`}>{cat.label}</span>
            <span className="uppercase text-white/60">{post.language}</span>
          </div>
          <h1 className="text-2xl md:text-4xl text-white leading-snug">{post.title}</h1>
          <div className="mt-4 text-sm text-white/70">
            By <strong className="text-white">{post.user?.name ?? 'Anonymous'}</strong>
            {' · '}{new Date(post.createdAt).toLocaleString()}
          </div>
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <article className="bg-white rounded-card border border-gray-100 shadow-card p-6">
          <p className="text-gray-800 leading-relaxed whitespace-pre-line">{post.content}</p>
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3">
            <UpvoteButton postId={post.id} initialCount={post.upvoteCount} />
            <span className="text-sm text-muted">{post.comments.length} {post.comments.length === 1 ? 'reply' : 'replies'}</span>
          </div>
        </article>

        <section className="mt-10">
          <h2 className="text-2xl text-kerala-700 mb-4">Replies</h2>
          {post.comments.length === 0 ? (
            <p className="text-muted italic mb-4">No replies yet — be the first.</p>
          ) : (
            <div className="space-y-3">
              {post.comments.map((c) => {
                const isStaff = (c.user?.name ?? '').toLowerCase().includes('admin')
                return (
                  <article key={c.id} className="bg-white rounded-card border border-gray-100 shadow-card p-4">
                    <div className="flex items-center gap-2 text-xs text-muted mb-2">
                      <span className="font-medium text-gray-800">{c.user?.name ?? 'Anonymous'}</span>
                      {isStaff && <span className="inline-flex items-center gap-0.5 text-kerala-700"><ShieldCheck className="w-3 h-3" /> staff</span>}
                      <span>·</span>
                      <span>{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{c.content}</p>
                  </article>
                )
              })}
            </div>
          )}
          <ReplyForm postId={post.id} />
        </section>

        <div className="mt-10 p-4 rounded-card bg-amber-50 border border-amber-100 text-xs text-amber-900">
          <strong>Disclaimer:</strong> Forum discussions are educational only and not medical advice. For diagnosis or treatment, consult a qualified BAMS / MD Ayurveda practitioner.
        </div>
      </div>
    </>
  )
}
