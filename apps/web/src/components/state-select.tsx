'use client'

import { hasStates, statesFor } from '../lib/country-states'

type Props = {
  country: string             // ISO-2
  value: string
  onChange: (state: string) => void
  className?: string
  required?: boolean
  placeholder?: string
}

// State picker that adapts to the selected country:
//   - Known country with state list → searchable native <select>
//   - Unknown country (most of the world) → free-text input
//
// Native select keeps the bundle small and is fully accessible.
export function StateSelect({ country, value, onChange, className = '', required, placeholder = 'State / region' }: Props) {
  const known = hasStates(country)

  if (known) {
    const states = statesFor(country)
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`w-full border rounded-md px-3 py-2 text-base sm:text-sm bg-white ${className}`}
      >
        <option value="">{placeholder} —</option>
        {states.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    )
  }

  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder={placeholder}
      className={`w-full border rounded-md px-3 py-2 text-base sm:text-sm ${className}`}
    />
  )
}
