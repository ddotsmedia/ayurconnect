import { headers as nextHeaders } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Briefcase, Calendar, MapPin, Star, AlertCircle, Globe, MessageCircle, Flag } from 'lucide-react'
import { API_INTERNAL as API } from '../../../lib/server-fetch'
import { ApplyTrigger } from './_apply-trigger'
import { deriveLogoColor, deriveLogoInitials, formatSalary } from '../../../lib/data/jobs'
import type { JobListing } from '../../../lib/types/jobs'
import type { Metadata } from 'next'
import { pageMetadata } from '../../../lib/seo'

async function fetchJob(id: string): Promise<JobListing | null> {
  const cookie = (await nextHeaders()).get('cookie') ?? ''
  try {
    const res = await fetch(`${API}/jobs/${id}`, { headers: { cookie }, cache: 'no-store' })
    if (!res.ok) return null
    return await res.json() as JobListing
  } catch { return null }
}

async function fetchSimilar(job: JobListing): Promise<JobListing[]> {
  try {
    const url = new URL(`${API}/jobs`)
    url.searchParams.set('limit', '12')
    if (job.specialty) url.searchParams.set('specialty', job.specialty)
    else if (job.type) url.searchParams.set('type', job.type)
    const r = await fetch(url.toString(), { cache: 'no-store' })
    if (!r.ok) return []
    const d = await r.json() as { jobs?: JobListing[] }
    return (d.jobs ?? []).filter((j) => j.id !== job.id).slice(0, 4)
  } catch { return [] }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const job = await fetchJob(id)
  if (!job) return { title: 'Job not found', robots: { index: false, follow: false } }
  const company  = job.clinic?.trim() || 'AyurConnect Jobs'
  const location = job.location?.trim() || job.district?.trim() || (job.remote ? 'Remote' : 'Kerala, India')
  // Spec description shape: "{title} at {company} — {location}". Append a short
  // slice of the job description (up to 160 chars total) so the preview card
  // has useful context — Facebook truncates at ~160 anyway.
  const heading  = `${job.title} at ${company} — ${location}`
  const extra    = (job.description ?? '').replace(/\s+/g, ' ').trim().slice(0, Math.max(0, 160 - heading.length - 3))
  const description = extra ? `${heading}. ${extra}`.slice(0, 160) : heading.slice(0, 160)
  return pageMetadata({
    path:        `/jobs/${job.id}`,
    title:       `${job.title}${job.clinic ? ` at ${job.clinic}` : ''} — AyurConnect`,
    description,
    keywords:    [job.title, job.clinic, job.specialty, job.type, location].filter((v): v is string => Boolean(v)),
    type:        'article',
  })
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await fetchJob(id)
  if (!job) notFound()

  const initials = job.logoInitials ?? deriveLogoInitials(job.clinic ?? job.title)
  const color    = job.logoColor    ?? deriveLogoColor(job.id)
  const salary   = job.salaryDisplay ?? job.salary ?? formatSalary(job.salaryMin, job.salaryMax, job.currency)
  const location = job.location ?? job.district ?? (job.remote ? 'Remote' : '')
  const similar  = await fetchSimilar(job)
  const shareUrl  = `https://ayurconnect.com/jobs/${job.id}`
  const shareText = `Check out this Ayurveda job: ${job.title}${job.clinic ? ` at ${job.clinic}` : ''}${location ? ` in ${location}` : ''}. Apply: ${shareUrl}`

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/jobs" className="inline-flex items-center gap-1 text-sm text-kerala-700 hover:underline mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> All jobs
      </Link>

      <article className="bg-white border border-gray-100 rounded-card p-7 shadow-card">
        <div className="flex items-start gap-4 flex-wrap">
          <div className={`w-16 h-16 ${color} text-white rounded-md flex items-center justify-center font-semibold text-xl flex-shrink-0`}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {job.featured && <span className="inline-flex items-center gap-0.5 text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold"><Star className="w-3 h-3 fill-current" /> Featured</span>}
              {job.urgent && <span className="inline-flex items-center gap-0.5 text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-bold"><AlertCircle className="w-3 h-3" /> Urgent</span>}
              {job.remote && <span className="inline-flex items-center gap-0.5 text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded"><Globe className="w-3 h-3" /> Remote</span>}
              {job.kind === 'availability' && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-semibold">Doctor available</span>}
            </div>
            <h1 className="font-serif text-2xl text-ink">{job.title}</h1>
            <p className="text-sm text-muted mt-1">{job.clinic ?? '—'}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
              {location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {location}</span>}
              {job.type && <span className="inline-flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.type}</span>}
              {job.deadline && <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> Apply by {new Date(job.deadline).toLocaleDateString()}</span>}
              {job.specialty && <span>· {job.specialty}</span>}
            </div>
            {salary && <p className="mt-3 text-lg font-semibold text-kerala-700">{salary}</p>}
          </div>
        </div>

        <section className="mt-7">
          <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Description</h2>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{job.description}</p>
        </section>

        {(job.requirements?.length ?? 0) > 0 && (
          <section className="mt-6">
            <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Requirements</h2>
            <ul className="text-sm text-gray-800 space-y-1 list-disc pl-5">
              {job.requirements!.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </section>
        )}

        {(job.benefits?.length ?? 0) > 0 && (
          <section className="mt-6">
            <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Benefits</h2>
            <div className="flex flex-wrap gap-1.5">
              {job.benefits!.map((b) => (
                <span key={b} className="text-xs px-2 py-0.5 bg-kerala-50 text-kerala-700 rounded-full">{b}</span>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100">
          <ApplyTrigger jobId={job.id} jobTitle={job.title} clinic={job.clinic ?? ''} />
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Share this job</p>
          <div className="flex flex-wrap gap-2">
            <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#25D366] text-white text-xs font-semibold rounded">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0A66C2] text-white text-xs font-semibold rounded">LinkedIn</a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-black text-white text-xs font-semibold rounded">X / Twitter</a>
            <a href={`mailto:?subject=${encodeURIComponent('Ayurveda job: ' + job.title)}&body=${encodeURIComponent(shareText)}`} className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-700 text-xs font-semibold rounded">Email</a>
            <a href={`https://wa.me/971509379212?text=${encodeURIComponent('Report job ' + shareUrl + ' — reason: ')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 rounded ml-auto">
              <Flag className="w-3 h-3" /> Report
            </a>
          </div>
        </div>
      </article>

      {similar.length > 0 && (
        <section className="mt-8">
          <h2 className="font-serif text-xl text-kerala-700 mb-3">Similar jobs</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {similar.map((s) => (
              <li key={s.id}>
                <Link href={`/jobs/${s.id}`} className="block bg-white border border-gray-100 hover:border-kerala-300 rounded-card p-4 transition-colors">
                  <p className="font-semibold text-ink leading-snug">{s.title}</p>
                  {s.clinic && <p className="text-xs text-gray-600 mt-0.5">{s.clinic}</p>}
                  <p className="text-xs text-gray-500 mt-1">{s.location ?? s.district ?? (s.remote ? 'Remote' : '')}{s.specialty ? ` · ${s.specialty}` : ''}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
