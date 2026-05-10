'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'

type Notif = {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  read: boolean
  createdAt: string
}

const TYPE_EMOJI: Record<string, string> = {
  'appointment-booked':    '📅',
  'appointment-confirmed': '✅',
  'appointment-cancelled': '❌',
  'review-received':       '⭐',
  'doctor-verified':       '🛡️',
  'hospital-verified':     '🛡️',
  'forum-reply':           '💬',
  'system':                '🔔',
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const m = Math.floor(ms / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  return `${d}d`
}

export function NotificationBell() {
  const [items, setItems] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  // Initial fetch
  async function reload() {
    try {
      const res = await fetch('/api/me/notifications', { credentials: 'include' })
      if (!res.ok) return
      const data = (await res.json()) as { items: Notif[]; unread: number }
      setItems(data.items)
      setUnread(data.unread)
    } catch { /* offline; ignore */ }
  }

  useEffect(() => { reload() }, [])

  // Live updates via SSE
  useEffect(() => {
    let es: EventSource | null = null
    let cancelled = false
    try {
      es = new EventSource('/api/me/notifications/stream', { withCredentials: true })
      es.addEventListener('notification', (e) => {
        if (cancelled) return
        try {
          const n = JSON.parse((e as MessageEvent).data) as Notif
          setItems((cur) => [n, ...cur].slice(0, 20))
          setUnread((u) => u + 1)
        } catch { /* ignore malformed */ }
      })
      es.onerror = () => { /* browser auto-reconnects */ }
    } catch { /* SSE not available; polling fallback below */ }
    return () => { cancelled = true; es?.close() }
  }, [])

  // Polling fallback every 60s in case SSE is dropped (e.g. via a misbehaving proxy)
  useEffect(() => {
    const t = setInterval(reload, 60_000)
    return () => clearInterval(t)
  }, [])

  // Click outside to close
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  async function markAllRead() {
    try {
      await fetch('/api/me/notifications/read-all', { method: 'PATCH', credentials: 'include' })
      setItems((cur) => cur.map((n) => ({ ...n, read: true })))
      setUnread(0)
    } catch { /* ignore */ }
  }

  async function markOneRead(id: string) {
    try {
      await fetch(`/api/me/notifications/${id}/read`, { method: 'PATCH', credentials: 'include' })
      setItems((cur) => cur.map((n) => (n.id === id ? { ...n, read: true } : n)))
      setUnread((u) => Math.max(0, u - 1))
    } catch { /* ignore */ }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative p-2 rounded-full text-gray-700 hover:bg-gray-100"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-1rem)] bg-white border border-gray-100 rounded-card shadow-cardLg overflow-hidden z-50 animate-slide-up">
          <header className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="inline-flex items-center gap-1 text-xs text-kerala-700 hover:underline">
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </header>
          <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">No notifications yet.</p>
            ) : items.map((n) => {
              const Item = (props: { children: React.ReactNode; className: string }) => n.link
                ? <Link href={n.link} onClick={() => { setOpen(false); if (!n.read) markOneRead(n.id) }} className={props.className}>{props.children}</Link>
                : <button onClick={() => { if (!n.read) markOneRead(n.id) }} className={`text-left ${props.className}`}>{props.children}</button>
              return (
                <Item key={n.id} className={`block w-full px-4 py-3 hover:bg-gray-50 ${n.read ? '' : 'bg-kerala-50/30'}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_EMOJI[n.type] ?? '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className={`text-sm leading-snug truncate ${n.read ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>{n.title}</div>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(n.createdAt)}</span>
                      </div>
                      {n.body && <div className="text-xs text-gray-600 mt-1 line-clamp-2">{n.body}</div>}
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-kerala-700 flex-shrink-0 mt-2" />}
                  </div>
                </Item>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
