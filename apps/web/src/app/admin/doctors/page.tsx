'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '../../../lib/admin-api'
import { EntityFormShell, Field, inputClass } from '../../../components/admin/entity-form-shell'
import { ImageUpload } from '../../../components/image-upload'
import { CountrySelect } from '../../../components/country-select'
import { StateSelect } from '../../../components/state-select'
import { SocialLinksField, type SocialLinks } from '../../../components/social-links'
import { FeaturedArticlesField, FeaturedPostsField, type FeaturedArticle, type FeaturedPost } from '../../../components/featured-content'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const COMMON_LANGUAGES = ['Malayalam', 'English', 'Tamil', 'Hindi', 'Arabic', 'Kannada', 'Tulu']

type Doctor = {
  id: string
  name: string
  specialization: string
  country: string | null
  state: string | null
  district: string
  ccimVerified: boolean
  moderationStatus?: 'pending' | 'approved' | 'declined' | 'needs-info' | 'flagged' | null
  qualification: string | null
  experienceYears: number | null
  languages: string[]
  photoUrl: string | null
  availableDays: string[]
  availableForOnline: boolean
  profile: string | null
  bio: string | null
  contact: string | null
  address: string | null
  websiteUrl: string | null
  linkedinUrl: string | null
  facebookUrl: string | null
  instagramUrl: string | null
  twitterUrl: string | null
  youtubeUrl: string | null
  workplace: string | null
  workplaceUrl: string | null
  featuredArticles: FeaturedArticle[] | null
  featuredPosts: FeaturedPost[] | null
  createdAt: string
}

type Tab = 'pending' | 'approved' | 'declined' | 'all'

// Task spec vocab (Approved/Rejected) → server vocab (approved/declined).
// Kept internally as server vocab so admin API calls stay consistent.
const TAB_LABEL: Record<Tab, string> = { pending: 'Pending', approved: 'Approved', declined: 'Rejected', all: 'All' }
const STATUS_TONE: Record<string, string> = {
  pending:  'bg-amber-50 text-amber-800',
  approved: 'bg-emerald-50 text-emerald-800',
  declined: 'bg-rose-50 text-rose-800',
  'needs-info': 'bg-blue-50 text-blue-800',
  flagged:  'bg-purple-50 text-purple-800',
}

const empty = {
  name: '', specialization: '',
  country: 'IN', state: '', district: '',
  ccimVerified: false,
  qualification: '', experienceYears: '', languages: '', photoUrl: '',
  availableDays: [] as string[], availableForOnline: true,
  profile: '', bio: '', contact: '', address: '',
  websiteUrl: '', linkedinUrl: '', facebookUrl: '', instagramUrl: '', twitterUrl: '', youtubeUrl: '',
  workplace: '', workplaceUrl: '',
  featuredArticles: [] as FeaturedArticle[],
  featuredPosts:    [] as FeaturedPost[],
}

type DoctorListResponse = { doctors: Doctor[]; pagination: { total: number } }

export default function DoctorsAdminPage() {
  const [items, setItems] = useState<Doctor[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...empty })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('pending')
  const [busyModId, setBusyModId] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState<{ id: string; name: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  async function load() {
    setLoading(true); setError(null)
    try {
      // /doctors?status=X&sort=newest — API filters by moderationStatus when
      // status is one of pending/approved/declined/needs-info/flagged. 'all'
      // drops the filter server-side.
      const qs = new URLSearchParams({ limit: '60', sort: 'newest', status: tab })
      const data = await adminApi.get<DoctorListResponse>(`/doctors?${qs}`)
      setItems(data.doctors)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [tab])

  async function approve(id: string) {
    setBusyModId(id); setError(null)
    try {
      await adminApi.post(`/doctors/${id}/approve`, {})
      await load()
    } catch (e) { alert(String(e)) } finally { setBusyModId(null) }
  }
  async function submitReject() {
    if (!rejecting) return
    const reason = rejectReason.trim()
    if (!reason) { alert('Reason required'); return }
    setBusyModId(rejecting.id); setError(null)
    try {
      await adminApi.post(`/doctors/${rejecting.id}/decline`, { reason })
      setRejecting(null); setRejectReason(''); await load()
    } catch (e) { alert(String(e)) } finally { setBusyModId(null) }
  }

  function startEdit(d: Doctor) {
    setEditingId(d.id)
    setForm({
      name: d.name, specialization: d.specialization,
      country: d.country ?? 'IN', state: d.state ?? '', district: d.district,
      ccimVerified: d.ccimVerified,
      qualification: d.qualification ?? '',
      experienceYears: d.experienceYears == null ? '' : String(d.experienceYears),
      languages: (d.languages ?? []).join(', '),
      photoUrl: d.photoUrl ?? '',
      availableDays: d.availableDays ?? [],
      availableForOnline: d.availableForOnline,
      profile: d.profile ?? '', bio: d.bio ?? '',
      contact: d.contact ?? '', address: d.address ?? '',
      websiteUrl:   d.websiteUrl   ?? '',
      linkedinUrl:  d.linkedinUrl  ?? '',
      facebookUrl:  d.facebookUrl  ?? '',
      instagramUrl: d.instagramUrl ?? '',
      twitterUrl:   d.twitterUrl   ?? '',
      youtubeUrl:   d.youtubeUrl   ?? '',
      workplace:    d.workplace    ?? '',
      workplaceUrl: d.workplaceUrl ?? '',
      featuredArticles: Array.isArray(d.featuredArticles) ? d.featuredArticles : [],
      featuredPosts:    Array.isArray(d.featuredPosts)    ? d.featuredPosts    : [],
    })
    setShowForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function startNew() {
    setEditingId(null); setForm({ ...empty }); setShowForm(true)
  }

  function toggleDay(d: string) {
    setForm((f) => ({
      ...f,
      availableDays: f.availableDays.includes(d) ? f.availableDays.filter((x) => x !== d) : [...f.availableDays, d],
    }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setSaveError(null)
    try {
      const payload = {
        ...form,
        languages: form.languages.split(',').map((s) => s.trim()).filter(Boolean),
      }
      if (editingId) await adminApi.patch(`/doctors/${editingId}`, payload)
      else await adminApi.post('/doctors', payload)
      setShowForm(false); await load()
    } catch (err) {
      // Keep the form open so the admin doesn't lose their input.
      setSaveError(err instanceof Error ? err.message : String(err))
    } finally { setSaving(false) }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete doctor "${name}"?`)) return
    try { await adminApi.del(`/doctors/${id}`); await load() }
    catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Doctors</h1>
          <p className="text-gray-600 mt-1">{items.length} total</p>
        </div>
        {!showForm && (
          <button onClick={startNew} className="px-4 py-2 bg-kerala-700 text-white rounded text-sm hover:bg-kerala-800">+ New doctor</button>
        )}
      </header>

      {error && <div className="p-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>}

      {showForm && (
        <EntityFormShell title="doctor" isEditing={!!editingId} onSubmit={save} onCancel={() => setShowForm(false)} saving={saving}>
          {saveError && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm mb-3" role="alert">
              <strong>Save failed:</strong> {saveError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Name *">
              <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Qualification">
              <input className={inputClass} value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} placeholder="BAMS, MD (Ayurveda)" />
            </Field>
            <Field label="Specialization *">
              <input required className={inputClass} value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
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
                placeholder="e.g. Ernakulam, Dubai, Mumbai"
              />
            </Field>
            <Field label="Experience (years)">
              <input type="number" min="0" className={inputClass} value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} />
            </Field>
            <Field label="Photo">
              <ImageUpload value={form.photoUrl || null} onChange={(url) => setForm({ ...form, photoUrl: url ?? '' })} bucket="profile" shape="square" />
            </Field>
            <Field label="Contact">
              <input className={inputClass} value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="+91-..." />
            </Field>
            <Field label="Address">
              <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </Field>
            <Field label="Languages (comma-separated)">
              <input className={inputClass} value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} placeholder={COMMON_LANGUAGES.join(', ')} />
            </Field>
          </div>

          <Field label="Available days">
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => {
                const on = form.availableDays.includes(d)
                return (
                  <button
                    type="button"
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={on
                      ? 'px-3 py-1.5 rounded-md bg-kerala-700 text-white text-xs font-medium'
                      : 'px-3 py-1.5 rounded-md bg-white border border-gray-200 text-gray-600 text-xs hover:bg-gray-50'}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </Field>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.ccimVerified} onChange={(e) => setForm({ ...form, ccimVerified: e.target.checked })} />
              <span className="text-sm font-medium">Verified</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.availableForOnline} onChange={(e) => setForm({ ...form, availableForOnline: e.target.checked })} />
              <span className="text-sm font-medium">Online consultations</span>
            </label>
          </div>

          <Field label="Profile (one-line tagline shown on cards)">
            <input className={inputClass} value={form.profile} onChange={(e) => setForm({ ...form, profile: e.target.value })} maxLength={200} />
          </Field>
          <Field label="Bio (long-form, shown on profile page)">
            <textarea rows={5} className={inputClass} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </Field>

          <div className="pt-2 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Current practice / workplace <span className="font-normal text-gray-400 text-xs">— optional</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-3">
              <Field label="Workplace name">
                <input className={inputClass} value={form.workplace} onChange={(e) => setForm({ ...form, workplace: e.target.value })} placeholder="e.g. Kottakkal Arya Vaidya Sala, Dubai branch" />
              </Field>
              <Field label="Workplace URL">
                <input className={inputClass} value={form.workplaceUrl} onChange={(e) => setForm({ ...form, workplaceUrl: e.target.value })} placeholder="https://..." />
              </Field>
            </div>
          </div>

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

          <div className="pt-2 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Featured health articles <span className="font-normal text-gray-400 text-xs">— up to 10</span></h3>
            <FeaturedArticlesField
              values={form.featuredArticles}
              onChange={(next) => setForm({ ...form, featuredArticles: next })}
            />
          </div>

          <div className="pt-2 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Featured social posts <span className="font-normal text-gray-400 text-xs">— up to 10</span></h3>
            <FeaturedPostsField
              values={form.featuredPosts}
              onChange={(next) => setForm({ ...form, featuredPosts: next })}
            />
          </div>
        </EntityFormShell>
      )}

      {/* Moderation tabs — Pending default (approval queue lands admin here). */}
      <nav className="inline-flex bg-gray-100 rounded-md p-1 text-sm">
        {(['pending', 'approved', 'declined', 'all'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={'px-3 py-1.5 rounded ' + (tab === t ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </nav>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Qualification</th>
              <th className="px-4 py-2.5">Location</th>
              <th className="px-4 py-2.5">Joined</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>}
            {!loading && items.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 italic">No doctors in this queue.</td></tr>
            )}
            {items.map((d) => {
              const status = d.moderationStatus ?? 'pending'
              const isPending  = status === 'pending' || status === 'needs-info' || status === 'flagged'
              const isDeclined = status === 'declined'
              return (
                <tr key={d.id}>
                  <td className="px-4 py-2.5 font-medium">
                    <div>{d.name}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{d.specialization}{d.ccimVerified && <span className="ml-1 text-emerald-700">✓ CCIM</span>}</div>
                  </td>
                  <td className="px-4 py-2.5 text-xs">{d.qualification ?? '—'}</td>
                  <td className="px-4 py-2.5 text-xs">
                    <div>{d.district}{d.state && d.state !== d.district ? `, ${d.state}` : ''}</div>
                    {d.country && d.country !== 'IN' && <div className="text-gray-400">{d.country}</div>}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500 tabular-nums whitespace-nowrap">
                    {new Date(d.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={'inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold ' + (STATUS_TONE[status] ?? 'bg-gray-100 text-gray-700')}>
                      {status === 'declined' ? 'rejected' : status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right space-x-2 whitespace-nowrap">
                    {isPending && (
                      <>
                        <button disabled={busyModId === d.id} onClick={() => approve(d.id)} className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded text-xs font-semibold">Approve</button>
                        <button disabled={busyModId === d.id} onClick={() => setRejecting({ id: d.id, name: d.name })} className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded text-xs font-semibold">Reject</button>
                      </>
                    )}
                    {isDeclined && (
                      <button disabled={busyModId === d.id} onClick={() => approve(d.id)} className="text-emerald-700 hover:underline disabled:opacity-50 text-xs">Re-approve</button>
                    )}
                    <button onClick={() => startEdit(d)} className="text-kerala-700 hover:underline text-xs">Edit</button>
                    <button onClick={() => remove(d.id, d.name)} className="text-red-600 hover:underline text-xs">Delete</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {rejecting && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => { setRejecting(null); setRejectReason('') }}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-ink">Reject doctor</h2>
            <p className="text-sm text-gray-600 mt-1 line-clamp-1">&ldquo;{rejecting.name}&rdquo;</p>
            <label className="block text-[11px] uppercase tracking-wider text-kerala-700 font-semibold mt-4 mb-1">Reason *</label>
            <textarea
              autoFocus
              rows={4}
              maxLength={500}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="E.g. Registration number not verifiable against CCIM · duplicate profile · missing qualification proof…"
              className={inputClass}
            />
            <p className="text-[11px] text-gray-500 mt-1">{rejectReason.length}/500 — stored on the doctor record.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setRejecting(null); setRejectReason('') }} className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={submitReject} disabled={!rejectReason.trim() || busyModId === rejecting.id} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded text-sm font-semibold">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
