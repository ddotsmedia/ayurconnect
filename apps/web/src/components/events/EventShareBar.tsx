'use client'

import { useState } from 'react'
import { MessageCircle, Facebook, Mail, Link2, Check } from 'lucide-react'

// 5-button share bar for events. Two visual variants:
//   - variant="detail": labelled buttons, header, top border (used on event detail page).
//   - variant="card":   compact icon buttons (used on homepage preview cards).
// Copy Link is a button (needs navigator.clipboard). Email is a button so Cloudflare's
// Email Address Obfuscation does not rewrite the mailto: — same pattern as ArticleShareBar.
export function EventShareBar({
  id, title, date, location, registrationLink, variant = 'detail',
}: {
  id:               string
  title:            string
  date:             string   // pre-formatted human date, e.g. "Sat, 14 Mar 2026, 10:00"
  location?:        string | null
  registrationLink?: string | null
  variant?:         'card' | 'detail'
}) {
  const [copied, setCopied] = useState(false)
  const url = `https://ayurconnect.com/events/${id}`

  const loc  = location?.trim() || 'online'
  const reg  = registrationLink?.trim()
  const cardText   = `${title} — ${date} in ${loc}${reg ? ` | Register: ${reg}` : ''}`
  const detailText = `🔔 ${title} — ${date} at ${loc} | Details: ${url}`
  const shareText  = variant === 'detail' ? detailText : cardText

  const encodedUrl   = encodeURIComponent(url)
  const encodedText  = encodeURIComponent(shareText)
  const encodedTitle = encodeURIComponent(title)

  const targets = [
    { key: 'whatsapp', href: `https://wa.me/?text=${encodedText}`,                                                       label: 'WhatsApp', bg: 'bg-[#25D366] hover:opacity-90 text-white', icon: MessageCircle },
    { key: 'facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,                              label: 'Facebook', bg: 'bg-[#1877F2] hover:opacity-90 text-white', icon: Facebook },
    { key: 'twitter',  href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,                  label: 'Twitter',  bg: 'bg-black hover:opacity-90 text-white',    icon: null      },
  ]

  function shareEmail() {
    window.location.href = `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`
  }
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked — user can still copy from URL bar */ }
  }

  if (variant === 'card') {
    // Compact icon-only row for use inside event preview cards on the homepage.
    // Explicit onClick handlers prevent the card's parent <Link> from swallowing the click.
    const btnCls = 'inline-flex items-center justify-center w-8 h-8 rounded-full transition-opacity'
    return (
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mr-1">Share</span>
        {targets.map((t) => {
          const Icon = t.icon
          return (
            <a key={t.key} href={t.href} target="_blank" rel="noopener noreferrer" className={`${btnCls} ${t.bg}`} aria-label={`Share on ${t.label}`} onClick={(e) => e.stopPropagation()}>
              {Icon ? <Icon className="w-3.5 h-3.5" /> : <span className="text-xs leading-none">𝕏</span>}
            </a>
          )
        })}
        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); shareEmail() }} className={`${btnCls} bg-gray-700 hover:bg-gray-800 text-white`} aria-label="Share via Email">
          <Mail className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); copyLink() }} className={`${btnCls} ${copied ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-cream'}`} aria-label="Copy link">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    )
  }

  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Share this event</p>
      <div className="flex flex-wrap gap-2">
        {targets.map((t) => {
          const Icon = t.icon
          return (
            <a key={t.key} href={t.href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded ${t.bg}`} aria-label={`Share on ${t.label}`}>
              {Icon ? <Icon className="w-3.5 h-3.5" /> : <span className="text-sm leading-none">𝕏</span>}
              {t.label}
            </a>
          )
        })}
        <button type="button" onClick={shareEmail} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded bg-gray-700 hover:bg-gray-800 text-white" aria-label="Share via Email">
          <Mail className="w-3.5 h-3.5" /> Email
        </button>
        <button type="button" onClick={copyLink} className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded ${copied ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-cream'}`} aria-label="Copy link">
          {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Link2 className="w-3.5 h-3.5" /> Copy link</>}
        </button>
      </div>
    </div>
  )
}
