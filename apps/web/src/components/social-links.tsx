// Doctor + Hospital social-link UI primitives. Used by:
//   - Admin forms (/admin/doctors, /admin/hospitals)
//   - Self-edit form (/dashboard/profile)
//   - Public profile pages (/doctors/[id], /hospitals/[id])
//
// All 6 platforms are optional; empty values are saved as null. URLs are
// validated as http(s) at the API; the form input is permissive (admin can
// type partial URLs while editing).

import type { ComponentType, SVGProps } from 'react'
import { Globe2, Linkedin, Facebook, Instagram, Youtube } from 'lucide-react'

// Icon type that accommodates both lucide-react icons and our custom inline
// SVGs (e.g. WhatsApp, which lucide v0.x doesn't ship).
type IconCmp = ComponentType<{ className?: string } & SVGProps<SVGSVGElement>>

export type SocialLinks = {
  websiteUrl?:   string | null
  linkedinUrl?:  string | null
  facebookUrl?:  string | null
  instagramUrl?: string | null
  twitterUrl?:   string | null
  youtubeUrl?:   string | null
}

type Platform = {
  key:   keyof SocialLinks
  label: string
  icon:  IconCmp
  // Used as a placeholder + as the small grey example below the input
  example: string
  // Background tint when rendered as a profile-page icon button
  bg:    string
  // Foreground colour for the icon when rendered as a button
  fg:    string
}

export const SOCIAL_PLATFORMS: ReadonlyArray<Platform> = [
  { key: 'websiteUrl',   label: 'Website',    icon: Globe2,    example: 'https://drwhatever.com',          bg: 'bg-kerala-50 hover:bg-kerala-100',  fg: 'text-kerala-700' },
  { key: 'linkedinUrl',  label: 'LinkedIn',   icon: Linkedin,  example: 'https://linkedin.com/in/dr-x',    bg: 'bg-blue-50 hover:bg-blue-100',      fg: 'text-blue-700' },
  { key: 'facebookUrl',  label: 'Facebook',   icon: Facebook,  example: 'https://facebook.com/drwhatever', bg: 'bg-blue-50 hover:bg-blue-100',      fg: 'text-blue-800' },
  { key: 'instagramUrl', label: 'Instagram',  icon: Instagram, example: 'https://instagram.com/drwhatever',bg: 'bg-rose-50 hover:bg-rose-100',      fg: 'text-rose-700' },
  { key: 'twitterUrl',   label: 'Twitter / X',icon: Globe2,    example: 'https://x.com/drwhatever',        bg: 'bg-gray-100 hover:bg-gray-200',     fg: 'text-gray-800' },
  { key: 'youtubeUrl',   label: 'YouTube',    icon: Youtube,   example: 'https://youtube.com/@drwhatever', bg: 'bg-red-50 hover:bg-red-100',        fg: 'text-red-700' },
]

// ─── Form input (admin + self-edit) ───────────────────────────────────────
type FieldProps = {
  values:   SocialLinks
  onChange: (next: SocialLinks) => void
  /** Compact = single-column stack; default is 2-column responsive. */
  compact?: boolean
}

export function SocialLinksField({ values, onChange, compact = false }: FieldProps) {
  const set = (k: keyof SocialLinks, v: string) => onChange({ ...values, [k]: v || null })
  return (
    <div className={compact ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 gap-3'}>
      {SOCIAL_PLATFORMS.map((p) => (
        <label key={p.key} className="block">
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
            <p.icon className="w-3.5 h-3.5 text-gray-400" />
            {p.label}
          </span>
          <input
            type="url"
            value={values[p.key] ?? ''}
            onChange={(e) => set(p.key, e.target.value)}
            placeholder={p.example}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700"
          />
        </label>
      ))}
    </div>
  )
}

// ─── Public display (profile pages) ───────────────────────────────────────
// Renders only the platforms that have a non-empty URL. Each is a small
// rounded button that opens the destination in a new tab. WhatsApp is
// optionally appended from a phone string (E.164).
export function SocialLinksDisplay({
  links,
  whatsappPhone,
  size = 'md',
}: {
  links: SocialLinks
  whatsappPhone?: string | null
  size?: 'sm' | 'md'
}) {
  const items: Array<{ key: string; label: string; href: string; icon: IconCmp; bg: string; fg: string }> = []

  for (const p of SOCIAL_PLATFORMS) {
    const v = links[p.key]
    if (v && /^https?:\/\//i.test(v)) {
      items.push({ key: p.key, label: p.label, href: v, icon: p.icon, bg: p.bg, fg: p.fg })
    }
  }

  // Derive WhatsApp from phone if provided
  if (whatsappPhone) {
    const digits = whatsappPhone.replace(/[^\d]/g, '')
    if (digits.length >= 10) {
      items.push({
        key: 'whatsapp',
        label: 'WhatsApp',
        href: `https://wa.me/${digits}`,
        icon: WhatsAppIcon,
        bg:   'bg-emerald-50 hover:bg-emerald-100',
        fg:   'text-emerald-700',
      })
    }
  }

  if (items.length === 0) return null

  const sizeCls = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'
  const iconCls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <div className="flex flex-wrap gap-2" aria-label="Social links">
      {items.map((it) => (
        <a
          key={it.key}
          href={it.href}
          target="_blank"
          rel="noopener noreferrer me"
          title={it.label}
          aria-label={it.label}
          className={`inline-flex items-center justify-center rounded-full ${sizeCls} ${it.bg} ${it.fg} transition-colors`}
        >
          <it.icon className={iconCls} />
        </a>
      ))}
    </div>
  )
}

// Lucide doesn't ship a WhatsApp icon — render a small inline SVG.
function WhatsAppIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} aria-hidden="true">
      <path d="M19.05 4.91A10 10 0 0 0 4.49 18.5L3 22l3.6-.94a10 10 0 0 0 12.45-12.4 10 10 0 0 0-2-3.75ZM12.04 20.13a8.16 8.16 0 0 1-4.16-1.13l-.3-.18-2.13.56.57-2.08-.2-.32a8.16 8.16 0 1 1 6.22 3.15Zm4.71-5.85c-.26-.13-1.52-.75-1.76-.84-.24-.08-.42-.13-.59.13-.18.26-.67.84-.82 1.01-.15.18-.3.2-.56.07-.26-.13-1.08-.4-2.06-1.27a7.85 7.85 0 0 1-1.43-1.77c-.15-.26-.02-.4.11-.53.12-.12.26-.31.39-.46.13-.15.18-.26.26-.44.09-.18.04-.33-.02-.46-.07-.13-.59-1.42-.8-1.94-.21-.51-.43-.45-.59-.45h-.5a.97.97 0 0 0-.71.33c-.24.27-.92.9-.92 2.2 0 1.3.95 2.56 1.08 2.74.13.18 1.86 2.84 4.5 3.98 1.55.67 2.15.73 2.93.61.47-.07 1.52-.62 1.74-1.22.22-.6.22-1.12.16-1.22-.07-.1-.24-.16-.5-.29Z"/>
    </svg>
  )
}
