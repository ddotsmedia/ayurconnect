import Link from 'next/link'
import { Briefcase, MapPin, Calendar, Star, AlertCircle, Globe, Clock } from 'lucide-react'
import type { JobListing } from '../../lib/types/jobs'
import { deriveLogoInitials, deriveLogoColor, formatSalary } from '../../lib/data/jobs'

function fmt(d?: string | null): string {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function relAge(iso?: string | null): string {
  if (!iso) return ''
  const ms = Date.now() - new Date(iso).getTime()
  const d = Math.floor(ms / 86_400_000)
  if (d < 1) return 'today'
  if (d === 1) return '1 day ago'
  if (d < 30) return `${d} days ago`
  if (d < 365) return `${Math.floor(d / 30)} mo ago`
  return `${Math.floor(d / 365)}y ago`
}

// Returns null if not urgent, else { label, tone } for the deadline pill.
function deadlineBadge(iso?: string | null): { label: string; tone: string; pulse: boolean } | null {
  if (!iso) return null
  const ms = new Date(iso).getTime() - Date.now()
  if (ms < 0) return null
  const days = Math.floor(ms / 86_400_000)
  if (days >= 7) return null
  if (days <= 0)  return { label: 'Closes today',                    tone: 'bg-rose-100 text-rose-800',       pulse: true  }
  if (days === 1) return { label: 'Closes tomorrow',                 tone: 'bg-rose-100 text-rose-800',       pulse: true  }
  if (days <= 3)  return { label: `Closes in ${days} days`,          tone: 'bg-rose-100 text-rose-800',       pulse: false }
  return              { label: `Closes in ${days} days`,             tone: 'bg-amber-100 text-amber-800',     pulse: false }
}

export function JobCard({ job }: { job: JobListing }) {
  const initials = job.logoInitials ?? deriveLogoInitials(job.clinic ?? job.title)
  const color    = job.logoColor    ?? deriveLogoColor(job.id)
  const salary   = job.salaryDisplay ?? job.salary ?? formatSalary(job.salaryMin, job.salaryMax, job.currency)
  const location = job.location ?? job.district ?? (job.remote ? 'Remote' : '')
  const dl       = deadlineBadge(job.deadline)
  const age      = relAge(job.createdAt)

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block bg-white border border-gray-100 rounded-card p-5 shadow-card hover:shadow-cardLg transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 ${color} text-white rounded-md flex items-center justify-center font-semibold flex-shrink-0`}>
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            {job.featured && <span className="inline-flex items-center gap-0.5 text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold"><Star className="w-3 h-3 fill-current" /> Featured</span>}
            {job.urgent && <span className="inline-flex items-center gap-0.5 text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-bold"><AlertCircle className="w-3 h-3" /> Urgent</span>}
            {job.remote && <span className="inline-flex items-center gap-0.5 text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded"><Globe className="w-3 h-3" /> Remote</span>}
            {job.kind === 'availability' && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-semibold">Doctor available</span>}
            {dl && <span className={`inline-flex items-center gap-0.5 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold ${dl.tone} ${dl.pulse ? 'animate-pulse' : ''}`}><Clock className="w-3 h-3" /> {dl.label}</span>}
            {age && <span className="text-[10px] text-gray-500 ml-auto">{age}</span>}
          </div>
          <h3 className="font-serif text-lg text-ink leading-tight">{job.title}</h3>
          <p className="text-sm text-muted mt-0.5">{job.clinic ?? '—'}</p>
          <div className="mt-2 flex items-center gap-3 flex-wrap text-xs text-gray-600">
            {location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {location}</span>}
            {job.type && <span className="inline-flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.type}</span>}
            {job.deadline && <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> Apply by {fmt(job.deadline)}</span>}
          </div>
          {salary && <p className="mt-2 text-sm font-semibold text-kerala-700">{salary}</p>}
          {job.specialty && <p className="mt-1 text-xs text-gray-500">{job.specialty}</p>}
          {(job.tags?.length ?? 0) > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {job.tags!.slice(0, 4).map((t) => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 bg-kerala-50 text-kerala-700 rounded">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default JobCard
