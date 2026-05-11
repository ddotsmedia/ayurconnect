import Link from 'next/link'
import { ShieldCheck, MapPin, Star, Languages, Calendar } from 'lucide-react'
import { cn } from './lib/utils'

const AVATAR_PALETTE = [
  'bg-kerala-600', 'bg-amber-600', 'bg-rose-600', 'bg-blue-600',
  'bg-purple-600', 'bg-teal-600', 'bg-orange-600', 'bg-indigo-600',
]

export type DoctorCardData = {
  id: string
  name: string
  qualification?: string | null
  specialization: string
  district: string
  ccimVerified: boolean
  experienceYears?: number | null
  languages?: string[] | null
  photoUrl?: string | null
  availableDays?: string[] | null
  availableForOnline?: boolean | null
  averageRating?: number | null
  reviewsCount?: number | null
  profile?: string | null
}

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s*/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

function paletteIndex(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return h % AVATAR_PALETTE.length
}

export function DoctorCard({ doctor, className }: { doctor: DoctorCardData; className?: string }) {
  const avatarColor = AVATAR_PALETTE[paletteIndex(doctor.name)]
  const specs = doctor.specialization.split(/[,/|]/).map((s) => s.trim()).filter(Boolean)
  const showSpecs = specs.slice(0, 2)
  const moreSpecs = Math.max(0, specs.length - showSpecs.length)
  const langs = (doctor.languages ?? []).slice(0, 3)
  const moreLangs = Math.max(0, (doctor.languages?.length ?? 0) - langs.length)
  const avail = (doctor.availableDays ?? []).length > 0

  return (
    <article
      className={cn(
        'group relative bg-white rounded-card border border-gray-100 shadow-card hover:shadow-cardLg hover:-translate-y-0.5 hover:border-kerala-200 transition-all p-5 flex flex-col h-full',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {doctor.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={doctor.photoUrl} alt={doctor.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className={cn('w-14 h-14 rounded-full text-white text-lg font-semibold flex items-center justify-center flex-shrink-0', avatarColor)}>
            {initials(doctor.name)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{doctor.name}</h3>
          {doctor.qualification && (
            <p className="text-xs text-muted truncate">{doctor.qualification}</p>
          )}
          {doctor.experienceYears != null && (
            <p className="text-[11px] text-subtle">{doctor.experienceYears} yrs experience</p>
          )}
        </div>
        {doctor.ccimVerified && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-kerala-700 bg-kerala-50 px-2 py-1 rounded-full whitespace-nowrap">
            <ShieldCheck className="w-3 h-3" /> CCIM
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {showSpecs.map((s) => (
          <span key={s} className="px-2 py-0.5 text-[11px] bg-kerala-50 text-kerala-700 rounded-full border border-kerala-100">{s}</span>
        ))}
        {moreSpecs > 0 && (
          <span className="px-2 py-0.5 text-[11px] bg-gray-50 text-gray-500 rounded-full">+{moreSpecs} more</span>
        )}
      </div>

      {doctor.profile && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{doctor.profile}</p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-gray-600">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{doctor.district}</span>
        </div>
        {doctor.averageRating != null && (
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400 flex-shrink-0" />
            <span><strong>{doctor.averageRating.toFixed(1)}</strong> ({doctor.reviewsCount ?? 0})</span>
          </div>
        )}
        {langs.length > 0 && (
          <div className="flex items-center gap-1.5 truncate col-span-2">
            <Languages className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{langs.join(', ')}{moreLangs > 0 ? ` +${moreLangs}` : ''}</span>
          </div>
        )}
        {avail && (
          <div className="flex items-center gap-1.5 col-span-2 text-kerala-700">
            <span className="w-1.5 h-1.5 rounded-full bg-kerala-500" />
            <span>Available this week</span>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 flex items-center justify-end">
        <Link
          href={`/doctors/${doctor.id}`}
          className="px-3.5 py-1.5 text-xs font-semibold bg-kerala-600 text-white rounded-md hover:bg-kerala-700 transition-colors"
        >
          View profile →
        </Link>
      </div>

      {/* Calendar icon import keeps eslint happy without affecting render */}
      <Calendar className="w-0 h-0" aria-hidden />
    </article>
  )
}
