'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '../../../lib/admin-api'
import { EntityFormShell, Field, inputClass } from '../../../components/admin/entity-form-shell'
import { CountrySelect } from '../../../components/country-select'
import { StateSelect } from '../../../components/state-select'
import { SocialLinksField, type SocialLinks } from '../../../components/social-links'

const TYPES = ['hospital', 'clinic', 'panchakarma', 'pharmacy', 'wellness']

type Hospital = {
  id: string
  name: string
  type: string
  country: string | null
  state: string | null
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
  websiteUrl: string | null
  linkedinUrl: string | null
  facebookUrl: string | null
  instagramUrl: string | null
  twitterUrl: string | null
  youtubeUrl: string | null
}

const empty = {
  name: '', type: '', country: 'IN', state: '', district: '',
  ccimVerified: false, ayushCertified: false, panchakarma: false, nabh: false,
  profile: '', contact: '', address: '', latitude: '', longitude: '',
  websiteUrl: '', linkedinUrl: '', facebookUrl: '', instagramUrl: '', twitterUrl: '', youtubeUrl: '',
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
      name: h.name, type: h.type,
      country: h.country ?? 'IN',
      state: h.state ?? '',
      district: h.district,
      ccimVerified: h.ccimVerified, ayushCertified: h.ayushCertified, panchakarma: h.panchakarma, nabh: h.nabh,
      profile: h.profile ?? '', contact: h.contact ?? '', address: h.address ?? '',
      latitude: h.latitude == null ? '' : String(h.latitude),
      longitude: h.longitude == null ? '' : String(h.longitude),
      websiteUrl:   h.websiteUrl   ?? '',
      linkedinUrl:  h.linkedinUrl  ?? '',
      facebookUrl:  h.facebookUrl  ?? '',
      instagramUrl: h.instagramUrl ?? '',
      twitterUrl:   h.twitterUrl   ?? '',
      youtubeUrl:   h.youtubeUrl   ?? '',
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
            <Field label="Country *">
              <CountrySelect value={form.country} onChange={(c) => setForm({ ...form, country: c, state: '' })} />
            </Field>
            <Field label="State / region">
              <StateSelect country={form.country} value={form.state} onChange={(s) => setForm({ ...form, state: s })} />
            </Field>
            <Field label="City / district *">
              <input
                required
                className={inputClass}
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                placeholder="e.g. Ernakulam, Mumbai, Dubai"
              />
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

          <div className="pt-2 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Social links <span className="font-normal text-gray-400 text-xs">— all optional</span></h3>
            <SocialLinksField
              values={{
                websiteUrl:   form.websiteUrl,
                linkedinUrl:  form.linkedinUrl,
                facebookUrl:  form.facebookUrl,
                instagramUrl: form.instagramUrl,
                twitterUrl:   form.twitterUrl,
                youtubeUrl:   form.youtubeUrl,
              }}
              onChange={(s: SocialLinks) => setForm({
                ...form,
                websiteUrl:   s.websiteUrl   ?? '',
                linkedinUrl:  s.linkedinUrl  ?? '',
                facebookUrl:  s.facebookUrl  ?? '',
                instagramUrl: s.instagramUrl ?? '',
                twitterUrl:   s.twitterUrl   ?? '',
                youtubeUrl:   s.youtubeUrl   ?? '',
              })}
            />
          </div>
        </EntityFormShell>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">Location</th>
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
                <td className="px-4 py-2.5 text-xs">
                  <div>{h.district}{h.state && h.state !== h.district ? `, ${h.state}` : ''}</div>
                  {h.country && h.country !== 'IN' && <div className="text-gray-400">{h.country}</div>}
                </td>
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
