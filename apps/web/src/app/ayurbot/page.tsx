'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, Leaf, Stethoscope, Activity, Send, Loader2 } from 'lucide-react'

type Mode = 'default' | 'prakriti' | 'herb' | 'symptom'
type Message = { role: 'user' | 'bot' | 'error'; content: string }
type Status = { enabled: boolean; reason: string | null; provider?: string | null; model?: string | null }

const MODES: Array<{ id: Mode; label: string; icon: typeof Bot; tint: string; placeholder: string; starter: string; examples: string[] }> = [
  {
    id: 'default',
    label: 'General',
    icon: Bot,
    tint: 'bg-kerala-700',
    placeholder: 'Ask anything about Ayurveda…',
    starter: "Namaste 🙏 — ask me about Kerala Ayurveda, treatments, doshas, or anything wellness-related.",
    examples: ['What is Panchakarma?', 'Difference between Vata and Pitta?', 'How does Shirodhara work?'],
  },
  {
    id: 'prakriti',
    label: 'Prakriti Quiz',
    icon: Activity,
    tint: 'bg-purple-700',
    placeholder: 'Describe your build, sleep, digestion, energy…',
    starter: "Let's identify your Prakriti (Ayurvedic body type). Tell me about your build, sleep patterns, appetite, energy levels, and how you respond to weather. I'll figure out whether you're Vata, Pitta, or Kapha dominant.",
    examples: ['I sleep light and have cold hands', 'I get hungry often and overheat easily', 'I sleep deeply and gain weight easily'],
  },
  {
    id: 'herb',
    label: 'Herb Lookup',
    icon: Leaf,
    tint: 'bg-emerald-700',
    placeholder: 'Name a herb (Sanskrit, English, or Malayalam)…',
    starter: "Tell me a herb name (Sanskrit, English, or Malayalam) and I'll give you the classical Rasa, Guna, Virya, Vipaka, and traditional uses.",
    examples: ['Ashwagandha', 'Brahmi', 'Triphala', 'കടുക്ക (Haritaki)'],
  },
  {
    id: 'symptom',
    label: 'Symptom Checker',
    icon: Stethoscope,
    tint: 'bg-amber-700',
    placeholder: 'Describe your symptom…',
    starter: "Describe your symptom and I'll suggest classical Ayurvedic approaches, lifestyle changes, and when to consult a practitioner. (Not medical advice — always see a Vaidya for diagnosis.)",
    examples: ['Chronic acidity after meals', 'Insomnia and stress', 'Joint pain in knees', 'Hair fall'],
  },
]

export default function AyurBotPage() {
  const [mode, setMode] = useState<Mode>('default')
  const [status, setStatus] = useState<Status | null>(null)
  const [messages, setMessages] = useState<Record<Mode, Message[]>>({
    default:  [{ role: 'bot', content: MODES[0].starter }],
    prakriti: [{ role: 'bot', content: MODES[1].starter }],
    herb:     [{ role: 'bot', content: MODES[2].starter }],
    symptom:  [{ role: 'bot', content: MODES[3].starter }],
  })
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const threadRef = useRef<HTMLDivElement>(null)
  const current = MODES.find((m) => m.id === mode)!

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight
  }, [messages, busy, mode])

  useEffect(() => {
    let cancelled = false
    fetch('/api/ayurbot/status')
      .then((r) => r.json())
      .then((s: Status) => { if (!cancelled) setStatus(s) })
      .catch(() => { if (!cancelled) setStatus({ enabled: false, reason: 'network error reaching AyurBot service' }) })
    return () => { cancelled = true }
  }, [])

  function append(m: Message) {
    setMessages((cur) => ({ ...cur, [mode]: [...cur[mode], m] }))
  }

  async function send(text: string) {
    const t = text.trim()
    if (!t || busy) return
    append({ role: 'user', content: t })
    setInput('')
    setBusy(true)
    append({ role: 'bot', content: '' }) // placeholder for stream

    try {
      const url = `/api/ayurbot/chat-stream?message=${encodeURIComponent(t)}&type=${encodeURIComponent(mode)}`
      const res = await fetch(url)
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let acc = ''

      const replaceLast = (msg: Message) => {
        setMessages((cur) => {
          const list = [...cur[mode]]
          if (list.length > 0) list[list.length - 1] = msg
          return { ...cur, [mode]: list }
        })
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() ?? ''
        for (const evt of events) {
          let event = 'message', data = ''
          for (const line of evt.split('\n')) {
            if (line.startsWith('event:')) event = line.slice(6).trim()
            else if (line.startsWith('data:')) data += line.slice(5).trim()
          }
          if (!data) continue
          try {
            const obj = JSON.parse(data) as { text?: string; reason?: string; code?: string }
            if (event === 'delta' && obj.text) {
              acc += obj.text
              replaceLast({ role: 'bot', content: acc })
            } else if (event === 'error') {
              const friendly =
                obj.code === 'not-configured' ? '⚙️ AyurBot is not configured.'
                : obj.code === 'auth-failed'  ? '🔑 The configured API key was rejected.'
                : obj.code === 'no-credits'   ? '💳 AyurBot has run out of credits/quota.'
                : obj.code === 'rate-limited' ? '⏳ Rate-limited — try again shortly.'
                : `⚠️ ${obj.reason ?? 'AyurBot upstream error.'}`
              replaceLast({ role: 'error', content: friendly })
            }
          } catch { /* skip malformed */ }
        }
      }

      if (!acc) replaceLast({ role: 'bot', content: '(no response)' })
    } catch {
      setMessages((cur) => {
        const list = [...cur[mode]]
        if (list.length > 0) list[list.length - 1] = { role: 'error', content: '⚠️ Network error reaching AyurBot.' }
        return { ...cur, [mode]: list }
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="text-center mb-6">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-hero-green text-white">
            <Bot className="w-6 h-6" />
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-kerala-700 mt-3">AyurBot</h1>
          <p className="text-sm text-muted mt-1">Claude-powered Ayurveda assistant — ask anything, with classical context.</p>
          {status && (
            <p className="text-[11px] mt-2">
              <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${status.enabled ? 'bg-green-500' : 'bg-amber-500'}`} />
              {status.enabled ? `online · ${status.provider ?? '?'} (${status.model ?? '?'})` : `offline — ${status.reason ?? 'not configured'}`}
            </p>
          )}
        </header>

        {/* Mode picker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {MODES.map((m) => {
            const Icon = m.icon
            const active = mode === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={
                  active
                    ? `${m.tint} text-white p-3 rounded-card shadow-card ring-2 ring-offset-2 ring-offset-cream ring-kerala-300 flex flex-col items-center gap-1.5 transition-all`
                    : 'bg-white border border-gray-200 text-gray-700 p-3 rounded-card flex flex-col items-center gap-1.5 hover:border-kerala-300 hover:shadow-card transition-all'
                }
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-semibold">{m.label}</span>
              </button>
            )
          })}
        </div>

        {/* Example chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {current.examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => send(ex)}
              disabled={busy || (status !== null && !status.enabled)}
              className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-full text-gray-700 hover:border-kerala-400 hover:text-kerala-700 disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </div>

        {/* Thread */}
        <div className="bg-white rounded-card border border-gray-100 shadow-card overflow-hidden">
          <div ref={threadRef} className="h-[460px] overflow-y-auto p-4 space-y-3 bg-cream/40">
            {messages[mode].map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[80%] bg-kerala-700 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm whitespace-pre-line'
                      : m.role === 'error'
                        ? 'max-w-[85%] bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm whitespace-pre-line'
                        : 'max-w-[85%] bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm whitespace-pre-line shadow-sm'
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-500 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin inline" />
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
              placeholder={status?.enabled === false ? 'AyurBot is offline (see banner above)…' : current.placeholder}
              className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-kerala-600"
              disabled={busy || (status !== null && !status.enabled)}
            />
            <button
              type="submit"
              disabled={busy || !input.trim() || (status !== null && !status.enabled)}
              className="w-10 h-10 rounded-md bg-kerala-700 text-white flex items-center justify-center hover:bg-kerala-800 disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="text-[11px] text-muted text-center mt-4">
          AyurBot generates educational content with classical Ayurvedic context. Not a substitute for consulting a qualified Vaidya. Switch tabs to change mode — each thread is independent.
        </p>
      </div>
    </div>
  )
}
