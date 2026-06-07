'use client'

import { useEffect, useState } from 'react'
import { Loader2, ShieldCheck, AlertCircle, Filter, RefreshCw, Clock } from 'lucide-react'

type Badge = {
  id: string; entityType: string; entityId: string; badgeType: string; status: string
  tier: string | null; referenceNumber: string | null; sourceUrl: string | null; sourceName: string | null
  entityNameCached: string | null; entityDistrictCached: string | null
  verifiedAt: string | null; verifiedById: string | null
  validUntil: string | null; notes: string | null
  createdAt: string; updatedAt: string
}

const ENTITY_TYPES = ['doctor', 'centre', 'college', 'manufacturer', 'product'] as const
const BADGE_TYPES  = ['state_registered', 'tourism_classified', 'gmp_licensed', 'ncism_kuhs', 'lineage_verified'] as const
const TIERS        = ['diamond', 'gold', 'silver', 'green_leaf', 'olive_leaf'] as const
const DISTRICTS    = ['Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'] as const

export default function VerifyBadgesPage() {
  const [tab, setTab] = useState<'queue' | 'expiring'>('queue')
  const [items, setItems] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [filters, setFilters] = useState<{ status: string; entityType: string; badgeType: string; district: string }>({ status: 'pending', entityType: '', badgeType: '', district: '' })
  const [selected, setSelected] = useState<Set<string>>(new Set())

  async function load() {
    setLoading(true); setErr(null)
    const qp = new URLSearchParams()
    if (tab === 'expiring') {
      try {
        const r = await fetch(`/api/admin/credential-badges/expiring`)
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `HTTP ${r.status}`)
        const j = await r.json() as { items: Badge[] }
        setItems(j.items)
      } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setLoading(false) }
      return
    }
    if (filters.status)     qp.set('status',     filters.status)
    if (filters.entityType) qp.set('entityType', filters.entityType)
    if (filters.badgeType)  qp.set('badgeType',  filters.badgeType)
    if (filters.district)   qp.set('district',   filters.district)
    try {
      const r = await fetch(`/api/admin/credential-badges?${qp}`)
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `HTTP ${r.status}`)
      const j = await r.json() as { items: Badge[] }
      setItems(j.items)
      setSelected(new Set())
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) } finally { setLoading(false) }
  }
  useEffect(() => { void load() /* eslint-disable-line react-hooks/exhaustive-deps */ }, [tab, filters])

  async function patch(id: string, patchBody: Record<string, unknown>) {
    setErr(null)
    try {
      const r = await fetch(`/api/admin/credential-badges/${id}`, {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(patchBody),
      })
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `HTTP ${r.status}`)
      void load()
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) }
  }

  async function bulkVerify() {
    if (selected.size === 0) return
    setErr(null)
    try {
      const r = await fetch(`/api/admin/credential-badges/bulk-verify`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids: [...selected] }),
      })
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `HTTP ${r.status}`)
      const j = await r.json() as { requested: number; verified: number; refused: number }
      alert(`Bulk: requested=${j.requested} verified=${j.verified} refused=${j.refused} (refused = no sourceUrl AND no referenceNumber)`)
      void load()
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)) }
  }

  const sel = (b: string) => 'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full ' + b

  return (
    <main className="space-y-5">
      <header>
        <h1 className="font-serif text-2xl text-ink inline-flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-kerala-700" /> Verification badges
        </h1>
        <p className="text-sm text-muted mt-1">
          Polymorphic credential ledger. <strong>Hard rule:</strong> a row cannot be set <code>verified</code> without <code>sourceUrl</code> OR <code>referenceNumber</code>. Server enforces this.
        </p>
      </header>

      <nav className="inline-flex bg-gray-100 rounded-md p-1 text-sm">
        <button onClick={() => setTab('queue')}    className={'px-3 py-1.5 rounded ' + (tab === 'queue'    ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}>Queue</button>
        <button onClick={() => setTab('expiring')} className={'px-3 py-1.5 rounded inline-flex items-center gap-1 ' + (tab === 'expiring' ? 'bg-white shadow-sm font-semibold' : 'text-gray-600')}><Clock className="w-3.5 h-3.5" /> Re-verify queue</button>
      </nav>

      {tab === 'queue' && (
        <section className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
          <div className="flex items-center gap-3 flex-wrap text-sm">
            <span className="inline-flex items-center gap-1 text-xs text-gray-500"><Filter className="w-3.5 h-3.5" /> Filters:</span>
            <select value={filters.status}     onChange={(e) => setFilters({ ...filters, status: e.target.value })}     className="px-2 py-1 border rounded text-xs">
              {['pending', 'verified', 'rejected', 'expired', 'all'].map((s) => <option key={s} value={s === 'all' ? 'all' : s}>{s}</option>)}
            </select>
            <select value={filters.entityType} onChange={(e) => setFilters({ ...filters, entityType: e.target.value })} className="px-2 py-1 border rounded text-xs">
              <option value="">all entities</option>
              {ENTITY_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filters.badgeType}  onChange={(e) => setFilters({ ...filters, badgeType: e.target.value })}  className="px-2 py-1 border rounded text-xs">
              <option value="">all badges</option>
              {BADGE_TYPES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <select value={filters.district}   onChange={(e) => setFilters({ ...filters, district: e.target.value })}   className="px-2 py-1 border rounded text-xs">
              <option value="">all districts</option>
              {DISTRICTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={load} className="ml-auto inline-flex items-center gap-1 px-2 py-1 text-xs border rounded hover:bg-gray-50"><RefreshCw className="w-3 h-3" /> reload</button>
            {selected.size > 0 && (
              <button onClick={bulkVerify} className="px-3 py-1 bg-kerala-700 hover:bg-kerala-800 text-white rounded text-xs font-semibold">
                Bulk verify ({selected.size})
              </button>
            )}
          </div>
        </section>
      )}

      {err && (
        <div className="p-3 rounded bg-red-50 border border-red-100 text-sm text-red-800 inline-flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5" /> {err}
        </div>
      )}

      {loading ? <Loader2 className="w-5 h-5 animate-spin text-kerala-700" /> : (
        items.length === 0 ? (
          <p className="text-sm text-muted bg-white border border-gray-100 rounded-card p-8 text-center">No rows match.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((b) => {
              const hasSource = (b.sourceUrl ?? '').trim().length > 0 || (b.referenceNumber ?? '').trim().length > 0
              const isExpired = b.validUntil ? new Date(b.validUntil).getTime() < Date.now() : false
              const expiringSoon = b.validUntil && !isExpired && new Date(b.validUntil).getTime() - Date.now() < 60 * 86_400_000
              return (
                <li key={b.id} className="bg-white border border-gray-100 rounded-card p-4 shadow-card">
                  <div className="flex items-start gap-3 flex-wrap">
                    {tab === 'queue' && b.status === 'pending' && (
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={selected.has(b.id)}
                        onChange={(e) => {
                          const s = new Set(selected)
                          e.target.checked ? s.add(b.id) : s.delete(b.id)
                          setSelected(s)
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={sel(b.status === 'verified' ? 'bg-emerald-50 text-emerald-700' : b.status === 'pending' ? 'bg-amber-50 text-amber-700' : b.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700')}>
                          {b.status}
                        </span>
                        <span className={sel('bg-kerala-50 text-kerala-700')}>{b.entityType}</span>
                        <span className={sel('bg-blue-50 text-blue-700')}>{b.badgeType.replace(/_/g, ' ')}</span>
                        {b.tier && <span className={sel('bg-yellow-50 text-yellow-700')}>{b.tier}</span>}
                        {isExpired      && <span className={sel('bg-red-50 text-red-700')}>expired</span>}
                        {expiringSoon   && <span className={sel('bg-amber-50 text-amber-800')}>expiring &lt; 60 days</span>}
                      </div>
                      <p className="font-semibold text-ink">{b.entityNameCached ?? b.entityId}{b.entityDistrictCached && <span className="text-gray-400 font-normal"> · {b.entityDistrictCached}</span>}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        entityId: <code className="px-1 py-0.5 bg-gray-100 rounded">{b.entityId}</code>
                        {b.referenceNumber && <> · ref: <code className="px-1 py-0.5 bg-gray-100 rounded">{b.referenceNumber}</code></>}
                      </p>
                      {b.sourceUrl && <p className="text-[11px] mt-1"><a className="text-kerala-700 hover:underline" href={b.sourceUrl} target="_blank" rel="noreferrer">{b.sourceName ?? b.sourceUrl}</a></p>}
                      {b.notes     && <p className="text-[11px] text-gray-600 mt-1 whitespace-pre-line">{b.notes}</p>}
                      {!hasSource && <p className="text-[11px] text-red-600 mt-1">No sourceUrl or referenceNumber — cannot be verified.</p>}
                      <RowForm badge={b} onPatch={(p) => patch(b.id, p)} />
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )
      )}
    </main>
  )
}

function RowForm({ badge, onPatch }: { badge: Badge; onPatch: (p: Record<string, unknown>) => void }) {
  const [entityId,    setEntityId]    = useState(badge.entityId)
  const [tier,        setTier]        = useState(badge.tier ?? '')
  const [ref,         setRef]         = useState(badge.referenceNumber ?? '')
  const [src,         setSrc]         = useState(badge.sourceUrl ?? '')
  const [srcName,     setSrcName]     = useState(badge.sourceName ?? '')
  const [notes,       setNotes]       = useState(badge.notes ?? '')
  const [validUntil,  setValidUntil]  = useState(badge.validUntil ? badge.validUntil.slice(0, 10) : '')

  const baseFields = { entityId, referenceNumber: ref, sourceUrl: src, sourceName: srcName, notes, tier, validUntil: validUntil || null }
  const hasSrc = ref.trim().length > 0 || src.trim().length > 0

  return (
    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
      <input placeholder="entityId"        value={entityId}   onChange={(e) => setEntityId(e.target.value)}    className="px-2 py-1 border rounded" />
      <input placeholder="reference number" value={ref}       onChange={(e) => setRef(e.target.value)}         className="px-2 py-1 border rounded" />
      <input placeholder="source URL"      value={src}        onChange={(e) => setSrc(e.target.value)}         className="px-2 py-1 border rounded md:col-span-2" />
      <input placeholder="source name"     value={srcName}    onChange={(e) => setSrcName(e.target.value)}     className="px-2 py-1 border rounded" />
      <select value={tier}                 onChange={(e) => setTier(e.target.value)}    className="px-2 py-1 border rounded">
        <option value="">no tier</option>
        {['diamond', 'gold', 'silver', 'green_leaf', 'olive_leaf'].map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="px-2 py-1 border rounded md:col-span-2" />
      <textarea placeholder="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="px-2 py-1 border rounded md:col-span-2 min-h-[60px]" />
      <div className="md:col-span-2 flex gap-2 pt-1 flex-wrap">
        <button onClick={() => onPatch(baseFields)} className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">Save fields only</button>
        <button
          onClick={() => onPatch({ ...baseFields, status: 'verified' })}
          disabled={!hasSrc}
          title={hasSrc ? 'Mark verified' : 'Add sourceUrl OR referenceNumber first'}
          className={'px-3 py-1 rounded text-white ' + (hasSrc ? 'bg-kerala-700 hover:bg-kerala-800' : 'bg-gray-300 cursor-not-allowed')}
        >Mark verified</button>
        <button onClick={() => onPatch({ ...baseFields, status: 'rejected' })} className="px-3 py-1 border border-red-200 text-red-700 rounded hover:bg-red-50">Reject</button>
        <button onClick={() => onPatch({ ...baseFields, status: 'pending'  })} className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">Pending</button>
      </div>
    </div>
  )
}
