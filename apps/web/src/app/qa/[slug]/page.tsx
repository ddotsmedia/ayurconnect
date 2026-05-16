import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, ShieldCheck, MessageCircleQuestion, Stethoscope } from 'lucide-react'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
import { ldGraph, breadcrumbLd, articleLd, faqLd, SITE_URL, clip } from '../../../lib/seo'

type Doctor = { id: string; specialization: string | null; qualification: string | null; ccimVerified: boolean; photoUrl: string | null }
type Answer = { id: string; body: string; featured: boolean; helpfulCount: number; createdAt: string; doctor: { id: string; name: string | null; ownedDoctor: Doctor | null } }
type Question = {
  id: string; slug: string | null; title: string; body: string; category: string
  authorName: string | null; age: number | null; gender: string | null
  viewCount: number; createdAt: string; updatedAt: string
  answers: Answer[]
}

const CATEGORY_LABEL: Record<string, string> = {
  panchakarma:    'Panchakarma',
  'womens-health': "Women's health",
  stress:         'Stress & sleep',
  diabetes:       'Diabetes',
  skin:           'Skin & hair',
  pediatric:      'Pediatric',
  joint:          'Joint pain',
  digestion:      'Digestion',
  sleep:          'Sleep',
  general:        'General',
}

async function fetchQuestion(slug: string): Promise<Question | null> {
  try {
    const res = await fetch(`${API}/qa/${encodeURIComponent(slug)}`, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as Question
  } catch { return null }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const q = await fetchQuestion(slug)
  if (!q) return { title: 'Question not found' }
  const title = `${q.title} | AyurConnect Q&A`
  const description = clip(q.body, 160)
  return {
    title, description,
    alternates: { canonical: `/qa/${q.slug ?? q.id}` },
    openGraph: { title, description, url: `${SITE_URL}/qa/${q.slug ?? q.id}`, type: 'article' },
  }
}

function renderBody(text: string) {
  // Simple safe rendering — split paragraphs on blank lines. Bold the text
  // between **markers** as Q&A answers often use markdown-lite emphasis.
  const blocks = text.split(/\n\s*\n+/).map((b) => b.trim()).filter(Boolean)
  return blocks.map((b, i) => (
    <p key={i} className="leading-relaxed whitespace-pre-line">
      {b.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-semibold text-ink">{part.slice(2, -2)}</strong>
        }
        return <span key={j}>{part}</span>
      })}
    </p>
  ))
}

export default async function QADetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const q = await fetchQuestion(slug)
  if (!q) notFound()

  // JSON-LD: model the entire Q&A as a QAPage (specifically recommended by
  // Google for community-Q&A like this — different from FAQPage which is
  // for the same author asking + answering).
  const qaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: q.title,
      text: q.body,
      answerCount: q.answers.length,
      upvoteCount: 0,
      dateCreated: q.createdAt,
      author: { '@type': 'Person', name: q.authorName ?? 'Anonymous' },
      acceptedAnswer: q.answers[0]
        ? {
            '@type': 'Answer',
            text: q.answers[0].body,
            dateCreated: q.answers[0].createdAt,
            upvoteCount: q.answers[0].helpfulCount,
            author: { '@type': 'Physician', name: q.answers[0].doctor.name ?? 'AyurConnect Doctor' },
          }
        : undefined,
      suggestedAnswer: q.answers.slice(1).map((a) => ({
        '@type': 'Answer',
        text: a.body,
        dateCreated: a.createdAt,
        upvoteCount: a.helpfulCount,
        author: { '@type': 'Physician', name: a.doctor.name ?? 'AyurConnect Doctor' },
      })),
    },
  }

  const jsonLd = ldGraph(
    qaJsonLd,
    breadcrumbLd([
      { name: 'Home',                          url: '/' },
      { name: 'Ayurveda Q&A',                  url: '/qa' },
      { name: CATEGORY_LABEL[q.category] ?? q.category, url: `/qa?category=${q.category}` },
      { name: q.title,                         url: `/qa/${q.slug ?? q.id}` },
    ]),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-kerala-50 border-b border-kerala-100">
        <div className="container mx-auto px-4 py-3 text-sm">
          <Link href="/qa" className="inline-flex items-center gap-1.5 text-kerala-700 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> All questions
          </Link>
        </div>
      </div>

      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-6">
          <Link href={`/qa?category=${q.category}`} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-kerala-50 text-kerala-700 border border-kerala-100 hover:bg-kerala-100">
            {CATEGORY_LABEL[q.category] ?? q.category}
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl text-ink leading-tight mt-4">{q.title}</h1>
          <p className="text-xs text-gray-500 mt-3">
            Asked by {q.authorName ?? 'Anonymous'}{q.age ? `, ${q.age}` : ''}{q.gender ? `, ${q.gender}` : ''} · {new Date(q.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · {q.viewCount} views
          </p>
        </header>

        <section className="bg-white border border-gray-100 rounded-card p-5 mb-6">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3">The question</h2>
          <div className="text-gray-800 space-y-3 text-[15px]">
            {renderBody(q.body)}
          </div>
        </section>

        {q.answers.length === 0 ? (
          <section className="text-center py-12 bg-white border border-gray-100 rounded-card">
            <MessageCircleQuestion className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-muted">Awaiting answer from a verified doctor — typically within 48 hours.</p>
          </section>
        ) : (
          <section>
            <h2 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3">
              {q.answers.length} answer{q.answers.length === 1 ? '' : 's'} from verified doctors
            </h2>
            <div className="space-y-4">
              {q.answers.map((a, idx) => (
                <article key={a.id} className={
                  'bg-white border rounded-card p-5 shadow-card ' +
                  (a.featured || idx === 0 ? 'border-kerala-200 ring-1 ring-kerala-100' : 'border-gray-100')
                }>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-kerala-700 text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
                        {(a.doctor.name ?? '?').slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-ink inline-flex items-center gap-1.5">
                          Dr {a.doctor.name ?? 'AyurConnect Doctor'}
                          {a.doctor.ownedDoctor?.ccimVerified && <ShieldCheck className="w-3.5 h-3.5 text-kerala-700" />}
                        </p>
                        <p className="text-xs text-gray-500">
                          {a.doctor.ownedDoctor?.qualification ?? '—'} {a.doctor.ownedDoctor?.qualification && '·'} {a.doctor.ownedDoctor?.specialization ?? 'Ayurveda'}
                        </p>
                      </div>
                    </div>
                    {a.featured && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-gold-50 text-gold-800 border border-gold-200 rounded-full font-semibold">Featured</span>
                    )}
                  </div>
                  <div className="text-gray-800 space-y-3 text-[15px]">
                    {renderBody(a.body)}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-4 pt-4 border-t border-gray-100">
                    Answered {new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10 p-6 rounded-card bg-kerala-50 border border-kerala-100">
          <h3 className="font-serif text-xl text-kerala-800 mb-2">Want personalized guidance?</h3>
          <p className="text-sm text-kerala-900/80 mb-4">
            This Q&A is general guidance. For your specific case — Prakriti, history, current medications — book a 1-on-1 video consultation with the doctor.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/doctors?specialization=${encodeURIComponent(q.category)}&online=true`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-kerala-700 hover:bg-kerala-800 text-white rounded-md text-sm font-semibold">
              <Stethoscope className="w-4 h-4" /> Find a {CATEGORY_LABEL[q.category] ?? 'doctor'} specialist
            </Link>
            <Link href="/qa/ask" className="inline-flex items-center gap-2 px-5 py-2.5 border border-kerala-600 text-kerala-700 hover:bg-white rounded-md text-sm font-semibold">
              Ask your own question
            </Link>
          </div>
        </section>
      </article>
    </>
  )
}
