'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '../../../lib/admin-api'

type User = {
  id: string
  email: string
  name: string | null
  role: 'USER' | 'DOCTOR_PENDING' | 'DOCTOR' | 'HOSPITAL_PENDING' | 'HOSPITAL' | 'THERAPIST' | 'ADMIN'
  emailVerified: boolean
  createdAt: string
}

const ROLES: User['role'][] = ['USER', 'DOCTOR_PENDING', 'DOCTOR', 'HOSPITAL_PENDING', 'HOSPITAL', 'THERAPIST', 'ADMIN']

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      params.set('limit', '100')
      const data = await adminApi.get<{ users: User[]; pagination: { total: number } }>(`/admin/users?${params}`)
      setUsers(data.users)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function changeRole(id: string, role: User['role']) {
    setSavingId(id)
    try {
      await adminApi.patch(`/admin/users/${id}`, { role })
      setUsers((u) => u.map((x) => (x.id === id ? { ...x, role } : x)))
    } catch (e) {
      alert(String(e))
    } finally {
      setSavingId(null)
    }
  }

  async function deleteUser(id: string, email: string) {
    if (!confirm(`Delete user ${email}? This will also delete their sessions, posts, comments, jobs, reviews, appointments.`)) return
    try {
      await adminApi.del(`/admin/users/${id}`)
      setUsers((u) => u.filter((x) => x.id !== id))
    } catch (e) {
      alert(String(e))
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-600 mt-1">{users.length} loaded</p>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); load() }}
          className="flex gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search email or name…"
            className="border rounded px-3 py-1.5 text-sm w-72"
          />
          <button className="px-3 py-1.5 bg-kerala-700 text-white rounded text-sm hover:bg-kerala-800">Search</button>
        </form>
      </header>

      {error && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Role</th>
              <th className="px-4 py-2.5">Verified</th>
              <th className="px-4 py-2.5">Created</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>
            )}
            {!loading && users.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No users.</td></tr>
            )}
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2.5 font-mono text-xs">{u.email}</td>
                <td className="px-4 py-2.5">{u.name || <span className="text-gray-400">—</span>}</td>
                <td className="px-4 py-2.5">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value as User['role'])}
                    disabled={savingId === u.id}
                    className="border rounded px-2 py-1 text-xs"
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-4 py-2.5">{u.emailVerified ? '✓' : '—'}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() => deleteUser(u.id, u.email)}
                    className="text-red-600 hover:underline text-xs"
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
