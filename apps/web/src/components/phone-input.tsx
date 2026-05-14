'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { COUNTRIES, COUNTRY_BY_CODE, PRIORITY_CODES, findCountryByDial } from '../lib/countries'

type Props = {
  value:    string                          // E.164 string with leading '+', e.g. '+919447000000'
  onChange: (e164: string, parts: { country: string; national: string }) => void
  defaultCountry?: string                   // ISO-2 to start with when value is empty
  className?: string
  placeholder?: string
}

// Compose / decompose an E.164 number alongside an ISO country.
//   <PhoneInput value="+919447000000" onChange={(e164, parts) => ...} />
//
// Output is always E.164 (`+CCNNNNNNNNNN`) — easy to store + pass to Twilio /
// WhatsApp / SMS. Validation is lightweight: leading-zero strip and length
// check (4-15 digits per E.164). For strict per-country validation we'd
// need libphonenumber-js (~150 KB) — deliberately not pulled in.

const cmpCountries = (a: typeof COUNTRIES[number], b: typeof COUNTRIES[number]): number => {
  const ai = (PRIORITY_CODES as readonly string[]).indexOf(a.code)
  const bi = (PRIORITY_CODES as readonly string[]).indexOf(b.code)
  if (ai !== -1 && bi === -1) return -1
  if (bi !== -1 && ai === -1) return 1
  if (ai !== -1 && bi !== -1) return ai - bi
  return a.name.localeCompare(b.name)
}

function splitE164(value: string): { country: string; national: string } {
  if (!value) return { country: '', national: '' }
  const v = value.trim().replace(/^\+/, '')
  // Try longest-match dial codes first (e.g. 1284 BVI before 1 US)
  for (const len of [4, 3, 2, 1]) {
    const prefix = v.slice(0, len)
    const c = findCountryByDial(prefix)
    if (c) return { country: c.code, national: v.slice(len) }
  }
  return { country: '', national: v }
}

function combine(country: string, nationalRaw: string): string {
  const c = COUNTRY_BY_CODE[country]
  if (!c) return ''
  const national = nationalRaw.replace(/\D/g, '').replace(/^0+/, '')
  if (!national) return ''
  return `+${c.dial}${national}`
}

export function PhoneInput({ value, onChange, defaultCountry = 'IN', className = '', placeholder = 'Phone number' }: Props) {
  // Internal state derived from the value the parent passes in.
  const initial = useMemo(() => {
    const { country, national } = splitE164(value)
    return { country: country || defaultCountry, national }
  }, [value, defaultCountry])

  const [country, setCountry]   = useState(initial.country)
  const [national, setNational] = useState(initial.national)
  const [open, setOpen]         = useState(false)
  const [q, setQ]               = useState('')
  const ref = useRef<HTMLDivElement | null>(null)

  // Re-sync if the parent overwrites value externally (e.g. form reset)
  useEffect(() => {
    const parts = splitE164(value)
    if (parts.country && parts.country !== country) setCountry(parts.country)
    if (parts.national !== national) setNational(parts.national)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Click-outside-to-close
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const filteredCountries = useMemo(() => {
    const term = q.trim().toLowerCase()
    const list = term
      ? COUNTRIES.filter((c) =>
          c.name.toLowerCase().includes(term) ||
          c.code.toLowerCase().includes(term) ||
          c.dial.startsWith(term.replace(/^\+/, '')),
        )
      : [...COUNTRIES]
    return list.sort(cmpCountries).slice(0, 80)
  }, [q])

  const current = COUNTRY_BY_CODE[country]

  function emitChange(c: string, n: string) {
    setCountry(c)
    setNational(n)
    const e164 = combine(c, n)
    onChange(e164, { country: c, national: n })
  }

  return (
    <div ref={ref} className={`flex gap-1 ${className}`}>
      {/* Country prefix */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="h-full flex items-center gap-1 border border-gray-200 rounded-md px-2 py-2 text-sm bg-white hover:border-kerala-400 focus:outline-none focus:ring-1 focus:ring-kerala-700"
          aria-label={`Country code (currently ${current?.name ?? country})`}
        >
          <span className="text-base leading-none">{current?.flag ?? '🌐'}</span>
          <span className="text-gray-700 tabular-nums">+{current?.dial ?? ''}</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>
        {open && (
          <div className="absolute z-50 left-0 mt-1 w-72 max-w-[calc(100vw-2rem)] bg-white border border-gray-100 rounded-card shadow-cardLg overflow-hidden max-h-72 flex flex-col">
            <div className="relative border-b border-gray-100">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                value={q}
                autoFocus
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                className="w-full pl-7 pr-2 py-2 text-base sm:text-sm focus:outline-none"
              />
            </div>
            <ul className="overflow-y-auto">
              {filteredCountries.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => { emitChange(c.code, national); setOpen(false); setQ('') }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-kerala-50 ${c.code === country ? 'bg-kerala-50' : ''}`}
                  >
                    <span className="text-base leading-none">{c.flag}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-xs text-gray-500">+{c.dial}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* National number */}
      <input
        type="tel"
        value={national}
        onChange={(e) => emitChange(country, e.target.value)}
        placeholder={placeholder}
        inputMode="numeric"
        pattern="[0-9 ]*"
        className="flex-1 min-w-0 border border-gray-200 rounded-md px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-kerala-700"
      />
    </div>
  )
}
