import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GradientHero } from '@ayurconnect/ui'
import {
  Target, Eye, Gem, Milestone as MilestoneIcon, Scale, Users,
  CalendarDays, Network, IdCard, Mail, Phone, MapPin, Globe,
} from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'
import { abs } from '../../lib/seo'

// Public AMAI microsite. All content is admin-editable at /admin/amai and
// served from GET /api/amai. Server component — no client JS needed.

type Bearer    = { id: string; name: string; position: string; category: string; photoUrl: string | null }
type Milestone = { id: string; year: string; description: string }
type ListItem  = { id: string; section: string; text: string }
type PageData = {
  page: {
    orgName: string; shortName: string; tagline: string
    heroImageUrl: string | null; logoUrl: string | null
    mission: string; aboutText: string; foundedInfo: string
    strategicNote: string; membershipInfo: string
    contactAddress: string; contactPhone: string; contactEmail: string
    websiteUrl: string; registrationInfo: string; copyrightText: string
    published: boolean
  } | null
  officeBearers: Bearer[]
  milestones: Milestone[]
  listItems: ListItem[]
}

const BEARER_GROUPS: Array<{ key: string; label: string }> = [
  { key: 'executive', label: 'Executive Leadership' },
  { key: 'secretary', label: 'Secretaries' },
  { key: 'women',     label: 'Women Sub Committee' },
  { key: 'apta',      label: 'APTA — Publication' },
  { key: 'other',     label: 'Other Office Bearers' },
]

async function getAmai(): Promise<PageData | null> {
  try {
    const res = await fetch(`${API}/amai`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    return (await res.json()) as PageData
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getAmai()
  const p = data?.page
  const title = p
    ? `${p.orgName} (${p.shortName}) | AyurConnect`
    : 'Ayurveda Medical Association of India | AyurConnect'
  const description = p?.mission || p?.tagline ||
    'The Ayurveda Medical Association of India (AMAI) — promoting quality Ayurveda for public health.'
  return {
    title,
    description: description.slice(0, 155),
    alternates: { canonical: '/amai' },
    openGraph: { title, description: description.slice(0, 155), url: abs('/amai') },
  }
}

function Paragraphs({ text, className = '' }: { text: string; className?: string }) {
  const parts = text.split(/\n+/).map((s) => s.trim()).filter(Boolean)
  if (parts.length === 0) return null
  return (
    <div className={`space-y-3 ${className}`}>
      {parts.map((para, i) => <p key={i}>{para}</p>)}
    </div>
  )
}

export default async function AmaiPage() {
  const data = await getAmai()
  if (!data || !data.page || !data.page.published) notFound()
  const { page, officeBearers, milestones, listItems } = data

  const bySection = (s: string) => listItems.filter((l) => l.section === s)
  const vision = bySection('vision')
  const coreValues = bySection('core_value')
  const strategicIssues = bySection('strategic_issue')
  const activities = bySection('activity')
  const committees = bySection('committee')
  const bearersByGroup = BEARER_GROUPS
    .map((g) => ({ ...g, items: officeBearers.filter((b) => b.category === g.key) }))
    .filter((g) => g.items.length > 0)

  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: page.orgName,
    alternateName: page.shortName,
    url: page.websiteUrl || abs('/amai'),
    ...(page.logoUrl ? { logo: page.logoUrl } : {}),
    ...(page.contactEmail ? { email: page.contactEmail } : {}),
    ...(page.contactPhone ? { telephone: page.contactPhone } : {}),
    ...(page.contactAddress ? { address: page.contactAddress } : {}),
    ...(page.mission ? { description: page.mission } : {}),
  }

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <GradientHero variant="green">
        <div className="max-w-3xl">
          {page.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={page.logoUrl} alt={`${page.shortName} logo`} className="h-20 w-auto mb-6 bg-white rounded-lg p-2" />
          )}
          <p className="text-gold-200 font-semibold tracking-wide uppercase text-sm mb-2">{page.shortName}</p>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight">{page.orgName}</h1>
          {page.tagline && <p className="mt-4 text-lg text-white/85">{page.tagline}</p>}
          {page.mission && <p className="mt-3 text-white/70">{page.mission}</p>}
        </div>
      </GradientHero>

      <div className="container mx-auto px-4 py-14 space-y-16 max-w-5xl">
        {/* ── About ──────────────────────────────────────────────────── */}
        {(page.aboutText || page.foundedInfo) && (
          <section>
            <h2 className="font-serif text-3xl text-kerala-800 mb-5">About {page.shortName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Paragraphs text={page.aboutText} className="md:col-span-2 text-gray-700 leading-relaxed" />
              {page.foundedInfo && (
                <aside className="bg-kerala-50 border border-kerala-100 rounded-card p-5 h-fit">
                  <h3 className="text-xs uppercase tracking-wider text-kerala-700 font-semibold mb-2">Founded</h3>
                  <Paragraphs text={page.foundedInfo} className="text-sm text-gray-700" />
                </aside>
              )}
            </div>
          </section>
        )}

        {/* ── Vision + Core values ───────────────────────────────────── */}
        {(vision.length > 0 || coreValues.length > 0) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {vision.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-card p-6 shadow-card">
                <h2 className="font-serif text-2xl text-kerala-800 inline-flex items-center gap-2 mb-4">
                  <Eye className="w-6 h-6" /> Vision
                </h2>
                <ul className="space-y-2.5">
                  {vision.map((v) => (
                    <li key={v.id} className="flex gap-2.5 text-gray-700">
                      <span className="text-kerala-600 mt-1">●</span><span>{v.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {coreValues.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-card p-6 shadow-card">
                <h2 className="font-serif text-2xl text-kerala-800 inline-flex items-center gap-2 mb-4">
                  <Gem className="w-6 h-6" /> Core Values
                </h2>
                <div className="flex flex-wrap gap-2">
                  {coreValues.map((c) => (
                    <span key={c.id} className="px-3 py-1.5 bg-gold-50 border border-gold-200 text-gold-700 rounded-full text-sm">
                      {c.text}
                    </span>
                  ))}
                </div>
                {page.mission && (
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <h3 className="text-xs uppercase tracking-wider text-kerala-700 font-semibold inline-flex items-center gap-1.5 mb-1.5">
                      <Target className="w-3.5 h-3.5" /> Mission
                    </h3>
                    <p className="text-gray-700">{page.mission}</p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── Milestones ─────────────────────────────────────────────── */}
        {milestones.length > 0 && (
          <section>
            <h2 className="font-serif text-3xl text-kerala-800 inline-flex items-center gap-2 mb-6">
              <MilestoneIcon className="w-7 h-7" /> Milestones
            </h2>
            <ol className="relative border-l-2 border-kerala-100 ml-3 space-y-6">
              {milestones.map((m) => (
                <li key={m.id} className="ml-6">
                  <span className="absolute -left-[9px] w-4 h-4 rounded-full bg-kerala-600 border-2 border-white" />
                  <div className="font-mono text-sm font-semibold text-kerala-700">{m.year}</div>
                  <p className="text-gray-700 mt-0.5">{m.description}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* ── Strategic issues ───────────────────────────────────────── */}
        {strategicIssues.length > 0 && (
          <section>
            <h2 className="font-serif text-3xl text-kerala-800 inline-flex items-center gap-2 mb-3">
              <Scale className="w-7 h-7" /> Strategic Issues
            </h2>
            {page.strategicNote && <p className="text-gray-600 mb-4 max-w-3xl">{page.strategicNote}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {strategicIssues.map((s) => (
                <div key={s.id} className="flex gap-2.5 bg-white border border-gray-100 rounded-card p-3.5 text-sm text-gray-700">
                  <Scale className="w-4 h-4 text-kerala-600 flex-shrink-0 mt-0.5" /><span>{s.text}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Office bearers ─────────────────────────────────────────── */}
        {bearersByGroup.length > 0 && (
          <section>
            <h2 className="font-serif text-3xl text-kerala-800 inline-flex items-center gap-2 mb-6">
              <Users className="w-7 h-7" /> Office Bearers
            </h2>
            <div className="space-y-7">
              {bearersByGroup.map((g) => (
                <div key={g.key}>
                  <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">{g.label}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {g.items.map((b) => (
                      <div key={b.id} className="bg-white border border-gray-100 rounded-card p-4 text-center shadow-card">
                        {b.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.photoUrl} alt={b.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-2" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-kerala-100 text-kerala-700 font-serif text-xl flex items-center justify-center mx-auto mb-2">
                            {b.name.replace(/^Dr\.?\s*/i, '').trim().charAt(0).toUpperCase() || '—'}
                          </div>
                        )}
                        <div className="font-semibold text-ink text-sm">{b.name}</div>
                        <div className="text-xs text-muted mt-0.5">{b.position}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Activities + Committees ────────────────────────────────── */}
        {(activities.length > 0 || committees.length > 0) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activities.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl text-kerala-800 inline-flex items-center gap-2 mb-4">
                  <CalendarDays className="w-6 h-6" /> Activities & Events
                </h2>
                <ul className="space-y-2">
                  {activities.map((a) => (
                    <li key={a.id} className="flex gap-2.5 text-gray-700">
                      <CalendarDays className="w-4 h-4 text-kerala-600 flex-shrink-0 mt-1" /><span>{a.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {committees.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl text-kerala-800 inline-flex items-center gap-2 mb-4">
                  <Network className="w-6 h-6" /> Committees
                </h2>
                <ul className="space-y-2">
                  {committees.map((c) => (
                    <li key={c.id} className="flex gap-2.5 text-gray-700">
                      <Network className="w-4 h-4 text-kerala-600 flex-shrink-0 mt-1" /><span>{c.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* ── Membership ─────────────────────────────────────────────── */}
        {page.membershipInfo && (
          <section className="bg-kerala-50 border border-kerala-100 rounded-card p-6">
            <h2 className="font-serif text-2xl text-kerala-800 inline-flex items-center gap-2 mb-3">
              <IdCard className="w-6 h-6" /> Membership
            </h2>
            <Paragraphs text={page.membershipInfo} className="text-gray-700" />
          </section>
        )}

        {/* ── Contact ────────────────────────────────────────────────── */}
        {(page.contactAddress || page.contactPhone || page.contactEmail || page.websiteUrl || page.registrationInfo) && (
          <section>
            <h2 className="font-serif text-3xl text-kerala-800 mb-5">Contact</h2>
            <div className="bg-white border border-gray-100 rounded-card p-6 shadow-card grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              {page.contactAddress && (
                <div className="flex gap-3"><MapPin className="w-5 h-5 text-kerala-600 flex-shrink-0 mt-0.5" /><span className="whitespace-pre-line">{page.contactAddress}</span></div>
              )}
              {page.contactPhone && (
                <div className="flex gap-3"><Phone className="w-5 h-5 text-kerala-600 flex-shrink-0 mt-0.5" /><a href={`tel:${page.contactPhone.replace(/\s+/g, '')}`} className="hover:text-kerala-700">{page.contactPhone}</a></div>
              )}
              {page.contactEmail && (
                <div className="flex gap-3"><Mail className="w-5 h-5 text-kerala-600 flex-shrink-0 mt-0.5" /><a href={`mailto:${page.contactEmail}`} className="hover:text-kerala-700">{page.contactEmail}</a></div>
              )}
              {page.websiteUrl && (
                <div className="flex gap-3"><Globe className="w-5 h-5 text-kerala-600 flex-shrink-0 mt-0.5" /><a href={page.websiteUrl} target="_blank" rel="noreferrer" className="hover:text-kerala-700">{page.websiteUrl.replace(/^https?:\/\//, '')}</a></div>
              )}
              {page.registrationInfo && (
                <div className="flex gap-3 md:col-span-2"><IdCard className="w-5 h-5 text-kerala-600 flex-shrink-0 mt-0.5" /><span>{page.registrationInfo}</span></div>
              )}
            </div>
          </section>
        )}

        {page.copyrightText && (
          <p className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">{page.copyrightText}</p>
        )}
      </div>
    </div>
  )
}
