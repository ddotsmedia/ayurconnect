import { Mail, Phone } from 'lucide-react'

type Settings = { 'contact.phone'?: string; 'contact.email'?: string }

// Thin dark bar shown above the navbar. Reads phone + email from SiteSetting
// (admin-editable via /admin/settings). Renders nothing if both values are
// missing — we don't want a blank bar in dev.
//
// Mobile: shows only phone (email link removed to save space). Desktop: both.
export function TopContactBar({ settings = {} }: { settings?: Settings } = {}) {
  const phone = (settings['contact.phone'] ?? '').trim()
  const email = (settings['contact.email'] ?? '').trim()
  if (!phone && !email) return null

  return (
    <div className="bg-kerala-800 text-white/90 text-xs">
      <div className="container mx-auto px-4 py-2 flex items-center justify-end gap-5">
        {phone && (
          <a
            href={`tel:${phone.replace(/\s+/g, '')}`}
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            aria-label="Call AyurConnect"
          >
            <Phone className="w-3.5 h-3.5 text-gold-400" />
            <span className="tabular-nums">{phone}</span>
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className="hidden sm:inline-flex items-center gap-1.5 hover:text-white transition-colors"
            aria-label="Email AyurConnect"
          >
            <Mail className="w-3.5 h-3.5 text-gold-400" />
            <span>{email}</span>
          </a>
        )}
      </div>
    </div>
  )
}
