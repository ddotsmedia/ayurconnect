import { Mail, MessageCircle } from 'lucide-react'

type Settings = { 'contact.phone'?: string; 'contact.email'?: string }

// Thin dark bar shown above the navbar. Reads phone + email from SiteSetting
// (admin-editable via /admin/settings). Renders nothing if both values are
// missing — we don't want a blank bar in dev.
//
// Phone links to WhatsApp (wa.me/<digits>), not tel: — the admin-configured
// number is the AyurConnect concierge/care-coordinator, which we want people
// to message rather than call.
export function TopContactBar({ settings = {} }: { settings?: Settings } = {}) {
  const phone = (settings['contact.phone'] ?? '').trim()
  const email = (settings['contact.email'] ?? '').trim()
  if (!phone && !email) return null

  const waDigits = phone.replace(/\D/g, '')

  return (
    <div className="bg-kerala-800 text-white/90 text-xs">
      <div className="container mx-auto px-4 py-2 flex items-center justify-end gap-5">
        {phone && waDigits && (
          <a
            href={`https://wa.me/${waDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            aria-label="WhatsApp AyurConnect"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="tabular-nums">WhatsApp: {phone}</span>
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
