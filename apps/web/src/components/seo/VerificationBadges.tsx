import Link from 'next/link'
import { ShieldCheck, Award, BookOpen, BadgeCheck, Sparkles } from 'lucide-react'
import { API_INTERNAL as API } from '../../lib/server-fetch'

type Badge = {
  id: string; badgeType: string; tier: string | null; sourceName: string | null; sourceUrl: string | null
  verifiedAt: string | null; validUntil: string | null; referenceNumber: string | null
}

type Props = {
  entityType: 'doctor' | 'centre' | 'college' | 'manufacturer' | 'product'
  entityId:   string
  className?: string
}

const LABEL: Record<string, string> = {
  state_registered:   'State-Registered',
  tourism_classified: 'Tourism-Classified',
  gmp_licensed:       'GMP-Licensed',
  ncism_kuhs:         'NCISM / KUHS-Recognised',
  lineage_verified:   'Lineage-Verified',
}
const ICON: Record<string, typeof ShieldCheck> = {
  state_registered:   BadgeCheck,
  tourism_classified: Award,
  gmp_licensed:       ShieldCheck,
  ncism_kuhs:         BookOpen,
  lineage_verified:   Sparkles,
}
const TIER_LABEL: Record<string, string> = {
  diamond:     'Diamond',
  gold:        'Gold',
  silver:      'Silver',
  green_leaf:  'Green Leaf',
  olive_leaf:  'Olive Leaf',
}

async function fetchBadges(entityType: string, entityId: string): Promise<Badge[]> {
  try {
    const r = await fetch(`${API}/credential-badges/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`, { next: { revalidate: 300 } })
    if (!r.ok) return []
    const j = await r.json() as { badges: Badge[] }
    return j.badges ?? []
  } catch { return [] }
}

export async function VerificationBadges({ entityType, entityId, className = '' }: Props) {
  const badges = await fetchBadges(entityType, entityId)
  if (badges.length === 0) return null

  // Emit minimal JSON-LD listing the credentials (schema.org `hasCredential`).
  const ld = {
    '@context': 'https://schema.org',
    '@type':    'Thing',
    hasCredential: badges.map((b) => ({
      '@type':         'EducationalOccupationalCredential',
      credentialCategory: LABEL[b.badgeType] ?? b.badgeType,
      recognizedBy:    b.sourceName ? { '@type': 'Organization', name: b.sourceName, url: b.sourceUrl ?? undefined } : undefined,
      identifier:      b.referenceNumber ?? undefined,
      validFrom:       b.verifiedAt ?? undefined,
      expires:         b.validUntil ?? undefined,
    })),
  }

  return (
    <section className={'border border-kerala-100 bg-kerala-50/40 rounded-card p-4 ' + className} aria-label="Verified credentials">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <header className="flex items-center justify-between gap-2 mb-3">
        <h3 className="font-serif text-sm text-kerala-800 inline-flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Verified credentials
        </h3>
        <Link href="/about/methodology#verification" className="text-[10px] text-kerala-700 hover:underline">How we verify</Link>
      </header>

      <ul className="flex flex-wrap gap-2 mb-3">
        {badges.map((b) => {
          const Icon = ICON[b.badgeType] ?? ShieldCheck
          return (
            <li key={b.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-kerala-200 rounded-full text-xs text-kerala-900 shadow-sm">
              <Icon className="w-3.5 h-3.5 text-kerala-700" />
              <span className="font-semibold">{LABEL[b.badgeType] ?? b.badgeType}</span>
              {b.tier && <span className="text-[10px] uppercase tracking-wider px-1 py-0.5 rounded bg-yellow-50 text-yellow-800 border border-yellow-100">{TIER_LABEL[b.tier] ?? b.tier}</span>}
            </li>
          )
        })}
      </ul>

      <details className="text-xs text-gray-700">
        <summary className="cursor-pointer text-kerala-700 hover:underline">What does each badge mean?</summary>
        <ul className="mt-2 space-y-1.5">
          {badges.map((b) => (
            <li key={b.id} className="leading-relaxed">
              <strong>{LABEL[b.badgeType] ?? b.badgeType}{b.tier && ` (${TIER_LABEL[b.tier] ?? b.tier})`}.</strong>
              {b.sourceName && <> Source: {b.sourceUrl ? <a className="text-kerala-700 hover:underline" href={b.sourceUrl} target="_blank" rel="noreferrer">{b.sourceName}</a> : b.sourceName}.</>}
              {b.referenceNumber && <> Reference: <code className="px-1 py-0.5 bg-gray-100 rounded">{b.referenceNumber}</code>.</>}
              {b.verifiedAt && <> Checked {new Date(b.verifiedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}.</>}
              {b.validUntil && <> Valid until {new Date(b.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}.</>}
            </li>
          ))}
        </ul>
      </details>
    </section>
  )
}
