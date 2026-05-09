'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '../../../lib/admin-api'
import { EntityFormShell, Field, inputClass } from '../../../components/admin/entity-form-shell'

const DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode',
  'Wayanad', 'Kannur', 'Kasaragod',
]

const TYPES = ['hospital', 'clinic', 'panchakarma', 'pharmacy', 'wellness']

type Hospital = {
  id: string
  name: string
  type: string
  district: string
  ccimVerified: boolean
  ayushCertified: boolean
  panchakarma: boolean
  nabh: boolean
  profile: string | null
  contact: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
}

const empty = {
  name: '', type: '', district: '',
  ccimVerified: false, ayushCertified: false, panchakarma: false, nabh: false,
  profile: '', contact: '', address: '', latitude: '', longitude: '',
}

export default function HospitalsAdminPage() {
  const [items, setItems] = useState<Hospital[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...empty })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true); setError(null)
    try { setItems(await adminApi.get<Hospital[]>('/hospitals')) }
    catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function startEdit(h: Hospital) {
    setEditingId(h.id)
    setForm({
      name: h.name, type: h.type, district: h.district,
      ccimVerified: h.ccimVerified, ayushCertified: h.ayushCertified, panchakarma: h.panchakarma, nabh: h.nabh,
      profile: h.profile ?? '', contact: h.contact ?? '', address: h.address ?? '',
      latitude: h.latitude == null ? '' : String(h.latitude),
      longitude: h.longitude == null ? '' : String(h.longitude),
    })
    setShowForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      if (editingId) await adminApi.patch(`/hospitals/${editingId}`, form)
      else await adminApi.post('/hospitals', form)
      setShowForm(false); await load()
    } catch (err) { alert(String(err)) } finally { setSaving(false) }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete hospital "${name}"?`)) return
    try { await adminApi.del(`/hospitals/${id}`); await load() } catch (e) { alert(String(e)) }
  }

  const flag = (k: keyof typeof empty, label: string) => (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={form[k] as boolean} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} />
      <span className="text-sm">{label}</span>
    </label>
  )

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hospitals</h1>
          <p className="text-gray-600 mt-1">{items.length} total</p>
        </div>
        {!showForm && (
          <button onClick={() => { setEditingId(null); setForm({ ...empty }); setShowForm(true) }} className="px-4 py-2 bg-green-700 text-white rounded text-sm hover:bg-green-800">
            + New hospital
          </button>
        )}
      </header>

      {error && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>}

      {showForm && (
        <EntityFormShell title="hospital" isEditing={!!editingId} onSubmit={save} onCancel={() => setShowForm(false)} saving={saving}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Name *">
              <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Type *">
              <select required className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="">— select —</option>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="District *">
              <select required className={inputClass} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
                <option value="">— select —</option>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Contact">
              <input className={inputClass} value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            </Field>
            <Field label="Latitude">
              <input className={inputClass} type="number" step="0.0001" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
            </Field>
            <Field label="Longitude">
              <input className={inputClass} type="number" step="0.0001" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
            </Field>
          </div>
          <Field label="Address">
            <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t">
            {flag('ccimVerified', 'CCIM Verified')}
            {flag('ayushCertified', 'AYUSH Certified')}
            {flag('panchakarma', 'Panchakarma')}
            {flag('nabh', 'NABH Accredited')}
          </div>
          <Field label="Profile / description">
            <textarea rows={3} className={inputClass} value={form.profile} onChange={(e) => setForm({ ...form, profile: e.target.value })} />
          </Field>
        </EntityFormShell>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">District</th>
              <th className="px-4 py-2.5">Flags</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>}
            {!loading && items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No hospitals yet.</td></tr>
            )}
            {items.map((h) => (
              <tr key={h.id}>
                <td className="px-4 py-2.5 font-medium">{h.name}</td>
                <td className="px-4 py-2.5">{h.type}</td>
                <td className="px-4 py-2.5">{h.district}</td>
                <td className="px-4 py-2.5 text-xs text-gray-600">
                  {[h.ccimVerified && 'CCIM', h.ayushCertified && 'AYUSH', h.panchakarma && 'PK', h.nabh && 'NABH']
                    .filter(Boolean).join(' · ') || '—'}
                </td>
                <td className="px-4 py-2.5 text-right space-x-3">
                  <button onClick={() => startEdit(h)} className="text-green-700 hover:underline text-xs">Edit</button>
                  <button onClick={() => remove(h.id, h.name)} className="text-red-600 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
