'use client'

import { useState } from 'react'
import { Copy, MessageCircle, CheckCircle2 } from 'lucide-react'

export function CopyShare({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    void navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }
  const wa = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`
  return (
    <section className="mt-8 bg-cream rounded-card p-4 flex flex-wrap items-center gap-3" aria-label="Share this article">
      <span className="text-xs font-semibold text-gray-700">Share:</span>
      <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25d366] hover:opacity-90 text-white rounded text-xs font-semibold">
        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
      </a>
      <button onClick={copy} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded text-xs hover:bg-white">
        {copied ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy link</>}
      </button>
    </section>
  )
}
