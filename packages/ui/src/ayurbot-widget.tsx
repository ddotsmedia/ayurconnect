'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, X, Send, Leaf } from 'lucide-react'

type Message = { role: 'user' | 'bot'; content: string }

const HIDDEN_PREFIXES = ['/admin', '/sign-in']

export function AyurBotWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: 'Namaste 🙏 I\'m AyurBot — ask me anything about Kerala Ayurveda, herbs, or treatments. (Not medical advice.)' },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight
  }, [messages, busy, open])

  if (HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p))) return null

  async function send(text: string) {
    const t = text.trim()
    if (!t) return
    setMessages((m) => [...m, { role: 'user', content: t }])
    setInput('')
    setBusy(true)
    try {
      const res = await fetch('/api/ayurbot/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: t }),
      })
      if (!res.ok) {
        setMessages((m) => [...m, { role: 'bot', content: '⚠️ I\'m offline right now. Please try again in a minute.' }])
      } else {
        const data = (await res.json()) as { response?: string }
        setMessages((m) => [...m, { role: 'bot', content: data.response ?? 'No response.' }])
      }
    } catch {
      setMessages((m) => [...m, { role: 'bot', content: '⚠️ Network error.' }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          aria-label="Open AyurBot chat"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 md:bottom-6 md:right-6 z-30 w-14 h-14 rounded-full bg-hero-green text-white shadow-cardLg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
        >
          <Leaf className="w-6 h-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 md:bottom-6 md:right-6 z-30 w-[calc(100%-2.5rem)] max-w-sm h-[520px] bg-white rounded-card shadow-cardXl border border-gray-100 flex flex-col overflow-hidden animate-slide-up">
          <header className="px-4 py-3 bg-hero-green text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center"><Leaf className="w-4 h-4" /></span>
              <div>
                <div className="font-semibold text-sm">AyurBot</div>
                <div className="text-[10px] text-white/70 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> online · Kerala Ayurveda
                </div>
              </div>
            </div>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="p-1 hover:bg-white/10 rounded">
              <X className="w-4 h-4" />
            </button>
          </header>

          <div ref={threadRef} className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-cream">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[80%] bg-kerala-600 text-white rounded-2xl rounded-tr-sm px-3.5 py-2 text-sm'
                      : 'max-w-[80%] bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-3.5 py-2 text-sm whitespace-pre-line'
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-3.5 py-2 text-sm text-gray-500">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:120ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:240ms]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); void send(input) }}
            className="p-3 border-t border-gray-100 bg-white flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about herbs, Panchakarma, doshas…"
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-kerala-600"
              disabled={busy}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="w-9 h-9 rounded-md bg-kerala-600 text-white flex items-center justify-center hover:bg-kerala-700 disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}

// avoid unused-import lint
export { MessageCircle as _MessageCircle }
