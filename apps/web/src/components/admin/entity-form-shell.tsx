'use client'

// Small wrapper for the inline create/edit forms used across all directory
// admin pages. Keeps the per-entity files focused on their fields.

import type { ReactNode } from 'react'

export function EntityFormShell({
  title,
  isEditing,
  onSubmit,
  onCancel,
  saving,
  children,
}: {
  title: string
  isEditing: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  saving: boolean
  children: ReactNode
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border rounded-lg p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">{isEditing ? `Edit ${title}` : `New ${title}`}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
            disabled={saving}
          >Cancel</button>
          <button
            type="submit"
            className="px-3 py-1.5 text-sm bg-kerala-700 text-white rounded hover:bg-kerala-800 disabled:opacity-50"
            disabled={saving}
          >{saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create'}</button>
        </div>
      </div>
      {children}
    </form>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  )
}

export const inputClass = 'w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-600'
