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
type Hospital = {
  id: string
  name: string
  type: string
  district: string
  contact: string | null
  ayushCertified: boolean
  panchakarma: boolean
  nabh: boolean
  ccimVerified: boolean
  createdAt: string
}

type DocList = { doctors: Doctor[] }

export default function CCIMVerifyQueue() {
  const [resource, setResource] = useState<'doctor' | 'hospital'>('doctor')
  const [tab, setTab] = useState<'unverified' | 'verified'>('unverified')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function load() {
    setLoading(true); setErr(null)
    try {
      const verifiedFlag = tab === 'verified' ? 'true' : 'false'
      if (resource === 'doctor') {
        const params = new URLSearchParams({ limit: '60', verified: verifiedFlag, sort: 'newest', ...(q ? { q } : {}) })
        const data = await adminApi.get<DocList>(`/doctors?${params}`)
        setDoctors(data.doctors.filter((d) => tab === 'verified' ? d.ccimVerified : !d.ccimVerified))
      } else {
        const params = new URLSearchParams({ limit: '100', verified: verifiedFlag, ...(q ? { q } : {}) })
        const data = await adminApi.get<Hospital[]>(`/hospitals?${params}`)
        setHospitals((Array.isArray(data) ? data : []).filter((h) => tab === 'verified' ? h.ccimVerified : !h.ccimVerified))
      }
    } catch (e) { setErr(String(e)) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [tab, resource]) // eslint-disable-line react-hooks/exhaustive-deps

  async function setVerified(kind: 'doctor' | 'hospital', id: string, v: boolean) {
    setBusyId(id)
    try {
      await adminApi.patch(`/${kind}s/${id}`, { ccimVerified: v })
      if (kind === 'doctor') setDoctors((cur) => cur.filter((x) => x.id !== id))
      else setHospitals((cur) => cur.filter((x) => x.id !== id))
    } catch (e) { setErr(String(e)) } finally { setBusyId(null) }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
          <p className="text-sm text-gray-500 mt-1">
            Cross-check doctor or hospital records against CCIM / AYUSH registers, then verify or unverify.
          </p>
        </div>
        <button onClick={load} disabled={loading} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-md bg-white hover:bg-gray-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </header>

      <div className="flex items-center gap-2 border-b">
        {(['doctor', 'hospital'] as const).map((r) => (
          <button key={r} onClick={() => setResource(r)}
            className={resource === r
              ? 'px-4 py-2 text-sm font-semibold text-green-800 border-b-2 border-green-700'
              : 'px-4 py-2 text-sm text-gray-600 hover:text-gray-900'}>
            {r === 'doctor' ? 'Doctors' : 'Hospitals'}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {(['unverified', 'verified'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={tab === t
              ? 'px-3 py-1 text-xs font-semibold rounded-full bg-green-700 text-white'
              : 'px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200'}>
            {t === 'unverified' ? 'Awaiting' : 'Verified'}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); load() }} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={resource === 'doctor' ? 'Name, specialization, district…' : 'Name, type, district…'}
          className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-700" />
      </form>

      {err && <p className="text-sm text-red-600">{err}</p>}

      {resource === 'doctor' ? (
        <DoctorList doctors={doctors} loading={loading} tab={tab} busyId={busyId} setVerified={(d, v) => setVerified('doctor', d.id, v)} />
      ) : (
        <HospitalList hospitals={hospitals} loading={loading} tab={tab} busyId={busyId} setVerified={(h, v) => setVerified('hospital', h.id, v)} />
      )}
    </div>
  )
}

function DoctorList({ doctors, loading, tab, busyId, setVerified }: { doctors: Doctor[]; loading: boolean; tab: 'unverified' | 'verified'; busyId: string | null; setVerified: (d: Doctor, v: boolean) => void }) {
  if (loading && doctors.length === 0) return <p className="text-sm text-gray-500">Loading…</p>
  if (!loading && doctors.length === 0) return <p className="text-sm text-gray-500">{tab === 'unverified' ? 'Doctor queue clear. 🎉' : 'No verified doctors match.'}</p>
  return (
    <div className="bg-white border rounded-md divide-y">
      {doctors.map((d) => {
        const ccimSearch = `https://www.google.com/search?q=${encodeURIComponent(`${d.name} ${d.qualification ?? ''} CCIM ${d.district}`)}`
        return (
          <div key={d.id} className="p-4 flex items-start gap-4 flex-wrap">
            <div className="flex-1 min-w-[260px]">
              <div className="font-semibold text-gray-900">{d.name}</div>
              <div className="text-sm text-gray-700">{d.specialization} · {d.district}{d.experienceYears != null && <> · {d.experienceYears} yrs</>}</div>
              <div className="text-xs text-gray-500 mt-1">{d.qualification ?? <em className="text-amber-700">no qualification on record</em>}{d.contact && <> · {d.contact}</>}</div>
              <div className="text-xs text-gray-400 mt-1">Added {new Date(d.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <a href={ccimSearch} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border rounded-md text-gray-700 hover:bg-gray-50">
                <ExternalLink className="w-3.5 h-3.5" /> Search CCIM
              </a>
              <Link href={`/doctors/${d.id}`} target="_blank" className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border rounded-md text-gray-700 hover:bg-gray-50">Public profile</Link>
              {tab === 'unverified' ? (
                <button onClick={() => setVerified(d, true)} disabled={busyId === d.id} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-green-700 text-white hover:bg-green-800 disabled:opacity-50">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verify
                </button>
              ) : (
                <button onClick={() => setVerified(d, false)} disabled={busyId === d.id} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50">
                  <ShieldOff className="w-3.5 h-3.5" /> Unverify
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function HospitalList({ hospitals, loading, tab, busyId, setVerified }: { hospitals: Hospital[]; loading: boolean; tab: 'unverified' | 'verified'; busyId: string | null; setVerified: (h: Hospital, v: boolean) => void }) {
  if (loading && hospitals.length === 0) return <p className="text-sm text-gray-500">Loading…</p>
  if (!loading && hospitals.length === 0) return <p className="text-sm text-gray-500">{tab === 'unverified' ? 'Hospital queue clear. 🎉' : 'No verified hospitals match.'}</p>
  return (
    <div className="bg-white border rounded-md divide-y">
      {hospitals.map((h) => {
        const ayushSearch = `https://www.google.com/search?q=${encodeURIComponent(`${h.name} AYUSH certified ${h.district}`)}`
        return (
          <div key={h.id} className="p-4 flex items-start gap-4 flex-wrap">
            <div className="flex-1 min-w-[260px]">
              <div className="font-semibold text-gray-900">{h.name}</div>
              <div className="text-sm text-gray-700">{h.type} · {h.district}</div>
              <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                {h.ayushCertified && <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded">AYUSH</span>}
                {h.panchakarma && <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded">Panchakarma</span>}
                {h.nabh && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">NABH</span>}
                {h.contact && <span>· {h.contact}</span>}
              </div>
              <div className="text-xs text-gray-400 mt-1">Added {new Date(h.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <a href={ayushSearch} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border rounded-md text-gray-700 hover:bg-gray-50">
                <ExternalLink className="w-3.5 h-3.5" /> Search AYUSH
              </a>
              <Link href={`/hospitals`} target="_blank" className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border rounded-md text-gray-700 hover:bg-gray-50">Public list</Link>
              {tab === 'unverified' ? (
                <button onClick={() => setVerified(h, true)} disabled={busyId === h.id} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-green-700 text-white hover:bg-green-800 disabled:opacity-50">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verify
                </button>
              ) : (
                <button onClick={() => setVerified(h, false)} disabled={busyId === h.id} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50">
                  <ShieldOff className="w-3.5 h-3.5" /> Unverify
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
