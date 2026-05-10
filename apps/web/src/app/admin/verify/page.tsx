'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, ShieldOff, ExternalLink, Search, RefreshCw } from 'lucide-react'
import { adminApi } from '../../../lib/admin-api'

type Doctor = {
  id: string
  name: string
  specialization: string
  district: string
  qualification: string | null
  experienceYears: number | null
  contact: string | null
  ccimVerified: boolean
  createdAt: string
}

type ListResponse = { doctors: Doctor[]; pagination: { total: number; pages: number } }

export default function CCIMVerifyQueue() {
  const [tab, setTab] = useState<'unverified' | 'verified'>('unverified')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function load() {
    setLoading(true); setErr(null)
    try {
      const params = new URLSearchParams({
        limit: '60',
        verified: tab === 'verified' ? 'true' : 'false',
        sort: 'newest',
        ...(q ? { q } : {}),
      })
      const data = await adminApi.get<ListResponse>(`/doctors?${params}`)
      // backend treats verified=false as "no filter" — filter client-side too
      setDoctors(data.doctors.filter((d) => tab === 'verified' ? d.ccimVerified : !d.ccimVerified))
    } catch (e) {
      setErr(String(e))
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  async function setVerified(d: Doctor, v: boolean) {
    setBusyId(d.id)
    try {
      await adminApi.patch(`/doctors/${d.id}`, { ccimVerified: v })
      setDoctors((cur) => cur.filter((x) => x.id !== d.id))
    } catch (e) { setErr(String(e)) } finally { setBusyId(null) }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CCIM Verification Queue</h1>
          <p className="text-sm text-gray-500 mt-1">
            Cross-check doctor records against the Central Council of Indian Medicine register, then approve or unverify.
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-md bg-white hover:bg-gray-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </header>

      <div className="flex items-center gap-2 border-b">
        {(['unverified', 'verified'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={tab === t
              ? 'px-4 py-2 text-sm font-semibold text-green-800 border-b-2 border-green-700'
              : 'px-4 py-2 text-sm text-gray-600 hover:text-gray-900'}
          >
            {t === 'unverified' ? 'Awaiting verification' : 'Verified'}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); load() }} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, specialization, district…"
          className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-700"
        />
      </form>

      {err && <p className="text-sm text-red-600">{err}</p>}
      {loading && doctors.length === 0 && <p className="text-sm text-gray-500">Loading…</p>}
      {!loading && doctors.length === 0 && (
        <p className="text-sm text-gray-500">{tab === 'unverified' ? 'Queue clear — no pending doctors. 🎉' : 'No verified doctors match.'}</p>
      )}

      <div className="bg-white border rounded-md divide-y">
        {doctors.map((d) => {
          const ccimSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${d.name} ${d.qualification ?? ''} CCIM ${d.district}`)}`
          return (
            <div key={d.id} className="p-4 flex items-start gap-4 flex-wrap">
              <div className="flex-1 min-w-[260px]">
                <div className="font-semibold text-gray-900">{d.name}</div>
                <div className="text-sm text-gray-700">
                  {d.specialization} · {d.district}
                  {d.experienceYears != null && <> · {d.experienceYears} yrs</>}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {d.qualification ?? <em className="text-amber-700">no qualification on record</em>}
                  {d.contact && <> · {d.contact}</>}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Added {new Date(d.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <a href={ccimSearchUrl} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border rounded-md text-gray-700 hover:bg-gray-50">
                  <ExternalLink className="w-3.5 h-3.5" /> Search CCIM
                </a>
                <Link href={`/doctors/${d.id}`} target="_blank"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border rounded-md text-gray-700 hover:bg-gray-50">
                  Public profile
                </Link>
                {tab === 'unverified' ? (
                  <button onClick={() => setVerified(d, true)} disabled={busyId === d.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-green-700 text-white hover:bg-green-800 disabled:opacity-50">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verify
                  </button>
                ) : (
                  <button onClick={() => setVerified(d, false)} disabled={busyId === d.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50">
                    <ShieldOff className="w-3.5 h-3.5" /> Unverify
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
