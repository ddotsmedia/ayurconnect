'use client'

import { useState } from 'react'
import { MessageCircle, Facebook, Mail, Link2, Check } from 'lucide-react'

// 5-button share bar. Client component (Copy Link needs navigator.clipboard).
// URL is built from SITE_URL + /articles/:id — always absolute so share
// targets never end up with relative paths.
export function ArticleShareBar({ id, title }: { id: string; title: string }) {
  const [copied, setCopied] = useState(false)
  const url = `https://ayurconnect.com/articles/${id}`
  const encodedUrl   = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const targets = [
    { key: 'whatsapp', href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,                                        label: 'WhatsApp', bg: 'bg-[#25D366] hover:opacity-90 text-white',    icon: MessageCircle },
    { key: 'facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,                                 label: 'Facebook', bg: 'bg-[#1877F2] hover:opacity-90 text-white',    icon: Facebook },
    // Twitter/X — lucide has no X-brand icon; use a styled 𝕏 glyph.
    { key: 'twitter',  href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,                     label: 'Twitter',  bg: 'bg-black hover:opacity-90 text-white',        icon: null      },
  ]

  // Cloudflare's Email Address Obfuscation rewrites <a href="mailto:*"> to a
  // /cdn-cgi/l/email-protection JS-decoder link — which breaks the share
  // flow because there's no address to hide. We open the mailto: URL on
  // click instead so Cloudflare has nothing to intercept in the HTML.
  function shareEmail() {
    window.location.href = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked — user can still copy from the URL bar */ }
  }

  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Share this article</p>
      <div className="flex flex-wrap gap-2">
        {targets.map((t) => {
          const Icon = t.icon
          return (
            <a
              key={t.key}
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded ${t.bg}`}
              aria-label={`Share on ${t.label}`}
            >
              {Icon ? <Icon className="w-3.5 h-3.5" /> : <span className="text-sm leading-none">𝕏</span>}
              {t.label}
            </a>
          )
        })}
        <button
          type="button"
          onClick={shareEmail}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded bg-gray-700 hover:bg-gray-800 text-white"
          aria-label="Share via Email"
        >
          <Mail className="w-3.5 h-3.5" /> Email
        </button>
        <button
          type="button"
          onClick={copyLink}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded ${copied ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-cream'}`}
          aria-label="Copy link"
        >
          {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Link2 className="w-3.5 h-3.5" /> Copy link</>}
        </button>
      </div>
    </div>
  )
}
