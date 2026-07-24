'use client'

// Shared WhatsApp message-picker. Replaces ad-hoc `wa.me/{phone}?text={fixed}`
// links across doctor + hospital pages with a modal that lets the visitor
// pick from admin-managed templates OR type a custom message.
//
// Usage:
//   <WhatsAppMessagePicker phone="971509379212" context="doctor">
//     <button className="…">Message on WhatsApp</button>
//   </WhatsAppMessagePicker>
//
// The passed child is rendered as the trigger; the picker manages its own
// open state. On "Open WhatsApp" the browser navigates to the wa.me link in
// a new tab (window.open with 'noopener,noreferrer').

import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

export type WhatsAppMessageContext = 'doctor' | 'hospital'

type Template = { id: string; text: string; sortOrder: number }

type Props = {
  phone: string
  context: WhatsAppMessageContext
  /** Optional entity name — appended to the pre-filled message header. */
  entityName?: string
  /** Trigger element (usually a button). Clicking it opens the picker. */
  children: React.ReactNode
  /** Extra classes on the outer <span> wrapper (keeps layout parity with a link). */
  className?: string
}

// Cache templates in memory per context so opening the picker multiple times
// only hits the API on first open per session.
const templateCache: Partial<Record<WhatsAppMessageContext, Template[]>> = {}

function buildWaLink(phone: string, message: string): string {
  const digits = (phone ?? '').replace(/[^\d]/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function WhatsAppMessagePicker({
  phone,
  context,
  entityName,
  children,
  className,
}: Props) {
  const [open, setOpen] = useState(false)
  const [templates, setTemplates] = useState<Template[] | null>(
    templateCache[context] ?? null,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [customText, setCustomText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!open || templateCache[context]) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/whatsapp-templates?context=${context}`, {
      credentials: 'omit',
      signal: AbortSignal.timeout(5000),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const ct = r.headers.get('content-type') ?? ''
        if (!ct.includes('application/json')) throw new Error('non-JSON response')
        return r.json() as Promise<{ items: Template[] }>
      })
      .then((data) => {
        if (cancelled) return
        templateCache[context] = data.items
        setTemplates(data.items)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [open, context])

  // Lock body scroll while modal is open (mobile UX).
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  const trimmedCustom = customText.trim()
  const selectedTemplate = templates?.find((t) => t.id === selectedId) ?? null
  // If the user typed anything, custom wins. Otherwise use selected template.
  const chosenBody = trimmedCustom.length > 0
    ? trimmedCustom
    : (selectedTemplate?.text ?? '')

  const finalMessage = entityName && chosenBody
    ? `Hi ${entityName}, ${chosenBody}`
    : chosenBody

  const canSend = finalMessage.trim().length > 0

  function handleSend() {
    if (!canSend) return
    const url = buildWaLink(phone, finalMessage)
    window.open(url, '_blank', 'noopener,noreferrer')
    setOpen(false)
    // Reset selection so next open starts fresh.
    setSelectedId(null)
    setCustomText('')
  }

  return (
    <>
      <span
        className={className}
        onClick={(e) => {
          // If child is an <a>, prevent default navigation.
          if ((e.target as HTMLElement).closest('a')) e.preventDefault()
          setOpen(true)
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true) } }}
      >
        {children}
      </span>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white w-full sm:w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Choose your WhatsApp message"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    WhatsApp {context === 'doctor' ? 'the doctor' : 'the hospital'}
                  </div>
                  {entityName && (
                    <div className="text-xs text-gray-500 truncate max-w-[240px]">{entityName}</div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="p-1 text-gray-500 hover:text-gray-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Quick messages
                </div>
                {loading && (
                  <div className="text-sm text-gray-500 py-6 text-center">Loading templates…</div>
                )}
                {error && !loading && (
                  <div className="text-sm text-rose-700 py-3">Could not load templates. You can still type a custom message below.</div>
                )}
                {!loading && !error && templates && templates.length === 0 && (
                  <div className="text-sm text-gray-500 py-3">No templates yet — type your own below.</div>
                )}
                {!loading && templates && templates.length > 0 && (
                  <ul className="space-y-1.5">
                    {templates.map((t) => (
                      <li key={t.id}>
                        <label className="flex items-start gap-2 p-2.5 rounded-md border border-gray-200 hover:border-kerala-300 hover:bg-kerala-50/50 cursor-pointer text-sm">
                          <input
                            type="radio"
                            name="wa-template"
                            className="mt-0.5 accent-kerala-600"
                            checked={selectedId === t.id && trimmedCustom.length === 0}
                            onChange={() => {
                              setSelectedId(t.id)
                              setCustomText('')
                            }}
                          />
                          <span className="text-gray-800">{t.text}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label htmlFor="wa-custom" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Or type your own
                </label>
                <textarea
                  id="wa-custom"
                  ref={textareaRef}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  onFocus={() => setSelectedId(null)}
                  rows={3}
                  maxLength={500}
                  placeholder="Type your message…"
                  className="w-full text-sm border border-gray-200 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-kerala-500 focus:border-transparent resize-none"
                />
                <div className="text-[11px] text-gray-400 mt-1 text-right">{customText.length}/500</div>
              </div>
            </div>

            <div className="border-t px-4 py-3 flex gap-2 flex-col-reverse sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                className="px-4 py-2 bg-[#25D366] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md inline-flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                Open WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
