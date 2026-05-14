'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { COUNTRIES, COUNTRY_BY_CODE, PRIORITY_CODES, type Country } from '../lib/countries'

type Props = {
  value: string                        // ISO-2 code (uppercase)
  onChange: (code: string) => void
  placeholder?: string
  className?: string
  showDial?: boolean                   // when true, label shows "🇮🇳 India · +91"
  ariaLabel?: string
}

const CMP = (a: Country, b: Country): number => {
  const ai = (PRIORITY_CODES as readonly string[]).indexOf(a.code)
  const bi = (PRIORITY_CODES as readonly string[]).indexOf(b.code)
  if (ai !== -1 && bi === -1) return -1
  if (bi !== -1 && ai === -1) return 1
  if (ai !== -1 && bi !== -1) return ai - bi
  return a.name.localeCompare(b.name)
}

export function CountrySelect({ value, onChange, placeholder = 'Select country', className = '', showDial = false, ariaLabel = 'Country' }: Props) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Click-outside-to-close
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  // Auto-focus search box when opening
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 30) }, [open])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return [...COUNTRIES].sort(CMP)
    return COUNTRIES
      .filter((c) =>
        c.name.toLowerCase().includes(term) ||
        c.code.toLowerCase().includes(term) ||
        c.dial.startsWith(term.replace(/^\+/, '')),
      )
      .sort(CMP)
      .slice(0, 50)
  }, [q])

  const current = COUNTRY_BY_CODE[value] ?? null

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 border border-gray-200 rounded-md px-3 py-2 text-sm bg-white hover:border-kerala-400 focus:outline-none focus:ring-1 focus:ring-kerala-700"
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          {current ? (
            <>
              <span className="text-base leading-none">{current.flag}</span>
              <span className="truncate">{current.name}</span>
              {showDial && <span className="text-gray-500 flex-shrink-0">+{current.dial}</span>}
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-100 rounded-card shadow-cardLg overflow-hidden max-h-[320px] flex flex-col">
          <div className="relative border-b border-gray-100">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, code, or dial code…"
              className="w-full pl-7 pr-2 py-2 text-base sm:text-sm focus:outline-none"
            />
          </div>
          <ul role="listbox" className="overflow-y-auto">
            {filtered.length === 0 && <li className="px-3 py-4 text-xs text-gray-500">No matches</li>}
            {filtered.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.code === value}
                  onClick={() => { onChange(c.code); setOpen(false); setQ('') }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-kerala-50 ${c.code === value ? 'bg-kerala-50 font-medium' : ''}`}
                >
                  <span className="text-base leading-none flex-shrink-0">{c.flag}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0">+{c.dial}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
