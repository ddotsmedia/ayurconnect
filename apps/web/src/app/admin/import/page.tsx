'use client'

import { useState } from 'react'
import { Upload, FileText, Sparkles, AlertTriangle, CheckCircle2, RefreshCw, Loader2, Download } from 'lucide-react'
import { adminApi } from '../../../lib/admin-api'

type ImportType = 'doctors' | 'hospitals'
type ImportResult = {
  ok: number
  skipped: number
  errors: Array<{ row: number; reason: string }>
  dryRun?: boolean
  previews?: Array<{ action: 'create' | 'update'; name: string; district?: string }>
}

type Row = Record<string, unknown>

const ARRAY_COLS = new Set(['languages', 'availableDays', 'services'])
const BOOL_COLS = new Set(['ayushCertified', 'panchakarma', 'nabh', 'availableForOnline'])
const NUM_COLS = new Set(['experienceYears', 'establishedYear', 'latitude', 'longitude'])

function parseCsv(text: string): Row[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter((l) => l.trim().length > 0)
  if (lines.length === 0) return []
  const split = (line: string): string[] => {
    const out: string[] = []
    let cur = ''
    let inQuote = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (inQuote) {
        if (c === '"' && line[i + 1] === '"') { cur += '"'; i++ }
        else if (c === '"') inQuote = false
        else cur += c
      } else {
        if (c === ',') { out.push(cur); cur = '' }
        else if (c === '"') inQuote = true
        else cur += c
      }
    }
    out.push(cur)
    return out
  }
  const headers = split(lines[0]).map((h) => h.trim())
  const rows: Row[] = []
  for (let li = 1; li < lines.length; li++) {
    const cells = split(lines[li])
    const row: Row = {}
    for (let ci = 0; ci < headers.length; ci++) {
      const k = headers[ci]
      const v = (cells[ci] ?? '').trim()
      if (v === '') { row[k] = ''; continue }
      if (ARRAY_COLS.has(k))      row[k] = v.split(',').map((s) => s.trim()).filter(Boolean)
      else if (BOOL_COLS.has(k))  row[k] = /^(true|1|yes)$/i.test(v)
      else if (NUM_COLS.has(k))   row[k] = Number.isFinite(Number(v)) ? Number(v) : null
      else                        row[k] = v
    }
    rows.push(row)
  }
  return rows
}

export default function AdminImportPage() {
  const [type, setType] = useState<ImportType>('hospitals')
  const [rows, setRows] = useState<Row[]>([])
  const [filename, setFilename] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loadingBuiltin, setLoadingBuiltin] = useState(false)

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFilename(file.name)
    setErr(null)
    setResult(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result)
        const parsed = parseCsv(text)
        setRows(parsed)
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e))
      }
    }
    reader.readAsText(file)
  }

  async function loadBuiltinTourism() {
    setLoadingBuiltin(true); setErr(null); setResult(null)
    try {
      // Fetch the curated dataset bundled in this repo (served via API by route below).
      const res = await fetch('/api/admin/import/sample/kerala-tourism', { credentials: 'include' })
      if (!res.ok) {
        // Fallback: ask the backend to import directly without preview
        const importRes = await adminApi.post<ImportResult>('/admin/import/hospitals', { records: BUILTIN_KERALA_TOURISM, dryRun: true })
        setType('hospitals')
        setRows(BUILTIN_KERALA_TOURISM as Row[])
        setResult(importRes)
        setFilename('builtin: kerala-tourism (' + BUILTIN_KERALA_TOURISM.length + ')')
        return
      }
      const data = (await res.json()) as { records: Row[] }
      setType('hospitals')
      setRows(data.records ?? [])
      setFilename('builtin: kerala-tourism (' + (data.records?.length ?? 0) + ')')
    } catch (e) {
      // Fallback to inline data
      setType('hospitals')
      setRows(BUILTIN_KERALA_TOURISM as Row[])
      setFilename('builtin: kerala-tourism (' + BUILTIN_KERALA_TOURISM.length + ')')
    } finally { setLoadingBuiltin(false) }
  }

  async function commit(dryRun: boolean) {
    if (rows.length === 0) { setErr('no rows loaded'); return }
    setBusy(true); setErr(null); setResult(null)
    try {
      const data = await adminApi.post<ImportResult>(`/admin/import/${type}`, { records: rows, dryRun })
      setResult(data)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally { setBusy(false) }
  }

  function downloadTemplate() {
    const url = type === 'doctors'
      ? 'https://raw.githubusercontent.com/ddotsmedia/ayurconnect/main/scripts/import/templates/doctors-template.csv'
      : 'https://raw.githubusercontent.com/ddotsmedia/ayurconnect/main/scripts/import/templates/hospitals-template.csv'
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Bulk import</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-2xl">
          Import doctors or clinics from CSV, or load the built-in curated list of well-known
          Kerala Ayurveda hospitals (compiled from publicly published sources). All imported rows
          start as <code className="px-1.5 py-0.5 bg-gray-100 rounded text-[11px]">ccimVerified=false</code> —
          flip them via <a href="/admin/verify" className="text-kerala-700 hover:underline">CCIM queue</a> after manual cross-check.
        </p>
      </header>

      {/* Step 1: pick type + source */}
      <section className="bg-white border rounded-md p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Type</span>
            {(['hospitals', 'doctors'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={type === t
                  ? 'px-3 py-1.5 text-sm font-semibold rounded-md bg-kerala-700 text-white'
                  : 'px-3 py-1.5 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200'}
              >{t}</button>
            ))}
          </div>
          <button onClick={downloadTemplate} className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-gray-700 hover:bg-gray-50">
            <Download className="w-3.5 h-3.5" /> {type} CSV template
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2 p-4 border-2 border-dashed border-gray-300 rounded-md hover:border-kerala-600 cursor-pointer transition-colors">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Upload className="w-4 h-4" /> Upload CSV file
            </span>
            <span className="text-xs text-gray-500">
              Format: see template. First row is headers. Quoted fields with commas allowed.
            </span>
            <input type="file" accept=".csv,text/csv" onChange={onFile} className="text-xs text-gray-700" />
            {filename && !filename.startsWith('builtin:') && <span className="text-xs text-green-700"><FileText className="w-3 h-3 inline" /> {filename} — {rows.length} rows</span>}
          </label>

          <button
            onClick={loadBuiltinTourism}
            disabled={loadingBuiltin}
            className="flex flex-col gap-2 p-4 border-2 border-dashed border-amber-300 rounded-md hover:border-amber-600 cursor-pointer transition-colors text-left disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900">
              <Sparkles className="w-4 h-4" /> Use built-in Kerala Tourism list
            </span>
            <span className="text-xs text-amber-800">
              ~25 well-known Olive/Green Leaf-classified Ayurveda hospitals & wellness centres.
              Compiled from public institutional websites.
            </span>
            {filename.startsWith('builtin:') && <span className="text-xs text-green-700"><CheckCircle2 className="w-3 h-3 inline" /> loaded</span>}
            {loadingBuiltin && <Loader2 className="w-4 h-4 animate-spin" />}
          </button>
        </div>
      </section>

      {/* Step 2: preview + commit */}
      {rows.length > 0 && (
        <section className="bg-white border rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-sm font-semibold text-gray-700">Preview — {rows.length} {type}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => commit(true)}
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} /> Dry run
              </button>
              <button
                onClick={() => commit(false)}
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md bg-kerala-700 text-white hover:bg-kerala-800 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" /> Commit import
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-md">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2 font-semibold">name</th>
                  <th className="text-left p-2 font-semibold">type/spec</th>
                  <th className="text-left p-2 font-semibold">district</th>
                  <th className="text-left p-2 font-semibold">flags</th>
                  <th className="text-left p-2 font-semibold">contact</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2 font-medium">{String(r.name ?? '')}</td>
                    <td className="p-2 text-gray-700">{String(type === 'doctors' ? (r.specialization ?? '') : (r.type ?? ''))}</td>
                    <td className="p-2 text-gray-700">{String(r.district ?? '')}</td>
                    <td className="p-2 text-gray-500">
                      {type === 'hospitals' && (
                        <span className="space-x-1">
                          {r.classification ? <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px]">{String(r.classification)}</span> : null}
                          {r.ayushCertified ? <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-[10px]">AYUSH</span> : null}
                          {r.panchakarma ? <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px]">PK</span> : null}
                          {r.nabh ? <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px]">NABH</span> : null}
                        </span>
                      )}
                      {type === 'doctors' && r.tcmcNumber ? <span className="text-gray-700">TCMC: {String(r.tcmcNumber)}</span> : null}
                    </td>
                    <td className="p-2 text-gray-500">{String(r.contact ?? '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 50 && <div className="p-2 text-xs text-center text-gray-500 border-t">… and {rows.length - 50} more rows</div>}
          </div>
        </section>
      )}

      {/* Step 3: result */}
      {err && <p className="text-sm text-red-600 inline-flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> {err}</p>}

      {result && (
        <section className={`border rounded-md p-5 ${result.dryRun ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
          <h2 className="text-sm font-semibold text-gray-900 inline-flex items-center gap-2">
            {result.dryRun ? <RefreshCw className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-green-700" />}
            {result.dryRun ? 'Dry-run preview' : 'Import complete'}
          </h2>
          <div className="mt-2 text-sm text-gray-800 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><span className="text-gray-500">Imported:</span> <strong>{result.ok}</strong></div>
            <div><span className="text-gray-500">Skipped:</span> <strong>{result.skipped}</strong></div>
            <div><span className="text-gray-500">Errors:</span> <strong>{result.errors.length}</strong></div>
            <div><span className="text-gray-500">Mode:</span> <strong>{result.dryRun ? 'preview' : 'live'}</strong></div>
          </div>

          {result.previews && result.previews.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Will be applied:</div>
              <div className="bg-white border rounded-md max-h-64 overflow-y-auto text-xs divide-y">
                {result.previews.map((p, i) => (
                  <div key={i} className="px-3 py-1.5 flex justify-between">
                    <span>{p.name} <span className="text-gray-400">({p.district ?? '—'})</span></span>
                    <span className={p.action === 'create' ? 'text-green-700 font-semibold' : 'text-blue-700 font-semibold'}>{p.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.errors.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Errors:</div>
              <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                {result.errors.slice(0, 10).map((e, i) => <li key={i}>row {e.row}: {e.reason}</li>)}
                {result.errors.length > 10 && <li>… and {result.errors.length - 10} more</li>}
              </ul>
            </div>
          )}

          {!result.dryRun && result.ok > 0 && (
            <p className="mt-4 text-xs text-green-800">
              ✓ <a href="/admin/verify" className="underline">Verify them →</a> (the new rows are <code className="px-1 bg-white rounded">ccimVerified=false</code> until you approve)
            </p>
          )}
        </section>
      )}
    </div>
  )
}

// Inline copy of the curated tourism dataset (kept in sync with
// scripts/import/data/kerala-tourism-centres.json). Used as a fallback when the
// "Use built-in" button is clicked and the API isn't serving it directly.
const BUILTIN_KERALA_TOURISM: Row[] = [
  { name: 'Vaidyaratnam P.S. Varier Ayurveda Hospital, Kottakkal', type: 'hospital', district: 'Malappuram', classification: 'olive-leaf', ayushCertified: true, panchakarma: true, nabh: true, establishedYear: 1902, services: ['Panchakarma','Kayachikitsa','Rasayana','International Patients','In-patient Care','Manufacturing'], profile: 'Heritage Kerala Ayurveda institution founded by P.S. Varier — 120+ years.', contact: '+91-494-2742-216', address: 'Kottakkal, Malappuram', latitude: 10.9989, longitude: 76.0035, source: 'kerala-tourism', sourceUrl: 'https://www.aryavaidyasala.com/' },
  { name: 'Govt Ayurveda Hospital Thiruvananthapuram', type: 'hospital', district: 'Thiruvananthapuram', ayushCertified: true, panchakarma: true, establishedYear: 1947, services: ['Panchakarma','Kayachikitsa','Free Treatment'], profile: 'Premier government Ayurveda hospital, attached to Govt Ayurveda College.', contact: '+91-471-2461-094', address: 'PMG Junction, Trivandrum', latitude: 8.5071, longitude: 76.9486, source: 'kerala-tourism', sourceUrl: 'http://gackerala.org/' },
  { name: 'Somatheeram Ayurveda Resort', type: 'wellness', district: 'Thiruvananthapuram', classification: 'olive-leaf', ayushCertified: true, panchakarma: true, establishedYear: 1985, services: ['Panchakarma','Yoga','Beach Resort','International Packages'], profile: "World's first Ayurveda resort — beachfront packages.", contact: '+91-471-2266-501', address: 'Chowara Beach, Trivandrum', latitude: 8.3697, longitude: 76.9755, source: 'kerala-tourism', sourceUrl: 'https://www.somatheeram.org/' },
  { name: 'Kairali Ayurvedic Healing Village', type: 'wellness', district: 'Palakkad', classification: 'olive-leaf', ayushCertified: true, panchakarma: true, establishedYear: 1989, services: ['Panchakarma','Kerala Special Treatments','Yoga'], profile: 'Award-winning healing village in Palakkad foothills.', contact: '+91-491-2522-555', address: 'Olassery, Palakkad', latitude: 10.7867, longitude: 76.6548, source: 'kerala-tourism', sourceUrl: 'https://www.kairali.com/' },
  { name: 'Sitaram Ayurveda Hospital', type: 'hospital', district: 'Thrissur', ayushCertified: true, panchakarma: true, nabh: true, establishedYear: 1921, services: ['Panchakarma','Kayachikitsa','Manufacturing','Research'], profile: 'Century-old Thrissur institution.', contact: '+91-487-2389-411', address: 'Kuruppam Road, Thrissur', latitude: 10.5276, longitude: 76.2144, source: 'kerala-tourism' },
  { name: 'Sreedhareeyam Ayurvedic Eye Hospital', type: 'hospital', district: 'Ernakulam', ayushCertified: true, establishedYear: 1972, services: ['Eye Treatment','Tarpana','Anjana'], profile: 'World-renowned Ayurvedic eye-care institution.', contact: '+91-484-2658-301', address: 'Nellikuzhi, Kothamangalam', source: 'kerala-tourism', sourceUrl: 'https://www.sreedhareeyam.com/' },
  { name: 'Manaltheeram Ayurveda Beach Village', type: 'wellness', district: 'Thiruvananthapuram', classification: 'olive-leaf', ayushCertified: true, panchakarma: true, establishedYear: 1995, services: ['Panchakarma','Beach Resort','Yoga'], profile: 'Sister centre to Somatheeram. Beach-front Ayurveda.', contact: '+91-471-2267-238', address: 'Chowara Beach, Trivandrum', latitude: 8.3725, longitude: 76.9748, source: 'kerala-tourism', sourceUrl: 'https://www.manaltheeram.com/' },
  { name: 'Vaidyamadham Vaidyasala & Nursing Home', type: 'hospital', district: 'Thrissur', ayushCertified: true, panchakarma: true, establishedYear: 1900, services: ['Panchakarma','Nadi Pariksha','Classical Treatment'], profile: '8 generations of unbroken Vaidya lineage at Mezhathur.', contact: '+91-466-2243-251', address: 'Mezhathur, Thrissur', source: 'kerala-tourism', sourceUrl: 'https://www.vaidyamadham.com/' },
  { name: 'Punarnava Ayurveda Hospital', type: 'hospital', district: 'Ernakulam', classification: 'green-leaf', ayushCertified: true, panchakarma: true, establishedYear: 2003, services: ['Panchakarma','Lifestyle Management','International Patients'], profile: 'Modern Kochi facility focusing on lifestyle disorders.', contact: '+91-484-3257-666', address: 'Maradu, Kochi', source: 'kerala-tourism', sourceUrl: 'https://www.punarnava-ayurveda.com/' },
  { name: 'Ayurvedagram Heritage Wellness Centre', type: 'wellness', district: 'Kottayam', classification: 'green-leaf', ayushCertified: true, panchakarma: true, establishedYear: 2007, services: ['Heritage Cottages','Panchakarma','Yoga'], profile: 'Boutique heritage village at Kumarakom.', contact: '+91-481-2469-009', address: 'Kumarakom, Kottayam', latitude: 9.6178, longitude: 76.4274, source: 'kerala-tourism', sourceUrl: 'https://www.ayurvedagram.com/' },
  { name: 'Kerala Ayurveda (Kakkanad)', type: 'panchakarma', district: 'Ernakulam', classification: 'olive-leaf', ayushCertified: true, panchakarma: true, nabh: true, establishedYear: 1992, services: ['Panchakarma','Rejuvenation','International Packages'], profile: 'NABH-accredited Panchakarma resort.', contact: '+91-484-2345-678', address: 'Kakkanad, Kochi', latitude: 10.0289, longitude: 76.3416, source: 'kerala-tourism', sourceUrl: 'https://www.keralaayurveda.us/' },
  { name: 'Pankajakasthuri Ayurveda Medical College Hospital', type: 'hospital', district: 'Thiruvananthapuram', ayushCertified: true, panchakarma: true, establishedYear: 1996, services: ['Teaching Hospital','Panchakarma','Kayachikitsa'], profile: 'Private teaching Ayurveda hospital + manufacturing.', contact: '+91-471-2412-400', address: 'Killimanoor, Trivandrum', source: 'kerala-tourism' },
  { name: 'Vasudeva Vilasam Ayurveda Hospital', type: 'hospital', district: 'Thiruvananthapuram', ayushCertified: true, panchakarma: true, establishedYear: 1924, services: ['Panchakarma','Kayachikitsa','Manufacturing'], profile: 'Heritage Trivandrum institution with attached pharmacy.', contact: '+91-471-2474-045', address: 'Sasthamangalam, Trivandrum', source: 'kerala-tourism' },
  { name: 'Niraamaya Retreats Surya Samudra', type: 'wellness', district: 'Thiruvananthapuram', classification: 'olive-leaf', panchakarma: true, establishedYear: 1991, services: ['Panchakarma','Wellness Retreat','Heritage Cottages'], profile: 'Heritage cliff-top wellness retreat at Kovalam.', contact: '+91-471-2267-333', address: 'Chowara, Trivandrum', source: 'kerala-tourism' },
  { name: 'Athreya Ayurvedic Hospital, Kottayam', type: 'hospital', district: 'Kottayam', ayushCertified: true, panchakarma: true, establishedYear: 2003, services: ['Panchakarma','International Patients'], profile: 'International-friendly Ayurveda hospital.', contact: '+91-481-2533-516', address: 'Chingavanam, Kottayam', source: 'kerala-tourism' },
  { name: 'Coconut Lagoon Kumarakom', type: 'wellness', district: 'Kottayam', classification: 'green-leaf', panchakarma: true, services: ['Panchakarma','Backwater Resort','Yoga'], profile: 'CGH Earth backwater resort with classical Ayurveda wing.', contact: '+91-481-2524-491', address: 'Kumarakom, Kottayam', latitude: 9.6178, longitude: 76.4274, source: 'kerala-tourism' },
  { name: 'Spice Village Thekkady', type: 'wellness', district: 'Idukki', classification: 'green-leaf', panchakarma: true, services: ['Panchakarma','Plantation Stay','Yoga'], profile: 'CGH Earth spice plantation resort.', contact: '+91-486-9322-314', address: 'Thekkady, Idukki', source: 'kerala-tourism' },
  { name: 'PNNM Ayurveda Medical College Hospital', type: 'hospital', district: 'Pathanamthitta', ayushCertified: true, panchakarma: true, establishedYear: 1972, services: ['Teaching Hospital','Panchakarma','Kayachikitsa'], profile: 'Pampady Mandiram — teaching hospital.', contact: '+91-468-2222-777', address: 'Cheruthuruthy', latitude: 9.2647, longitude: 76.7867, source: 'kerala-tourism' },
  { name: 'Govt Ayurveda Hospital Tripunithura', type: 'hospital', district: 'Ernakulam', ayushCertified: true, panchakarma: true, establishedYear: 1957, services: ['Panchakarma','Kayachikitsa','Free Treatment'], profile: 'Government hospital with subsidised/free Ayurveda care.', contact: '+91-484-2778-024', address: 'Tripunithura, Kochi', latitude: 9.9476, longitude: 76.3496, source: 'kerala-tourism', sourceUrl: 'http://gactri.org/' },
  { name: 'Govt Ayurveda Hospital Kannur', type: 'hospital', district: 'Kannur', ayushCertified: true, panchakarma: true, services: ['Panchakarma','Kayachikitsa','Free Treatment'], profile: 'Government Ayurveda hospital serving North Malabar.', contact: '+91-497-2700-060', address: 'Pariyaram, Kannur', source: 'kerala-tourism' },
  { name: 'Devaaya - The Ayurveda & Nature Cure Centre', type: 'wellness', district: 'Ernakulam', classification: 'green-leaf', ayushCertified: true, panchakarma: true, establishedYear: 2000, services: ['Panchakarma','Naturopathy','Yoga'], profile: 'Nature-cure island retreat combining Ayurveda + naturopathy.', contact: '+91-484-2873-100', address: 'Cherai, Vypin Island', source: 'kerala-tourism' },
  { name: 'Bhaktivedanta Hospital - Ayurveda Wing', type: 'hospital', district: 'Ernakulam', ayushCertified: true, services: ['Integrative Medicine','Panchakarma'], profile: 'Modern multi-speciality hospital with dedicated Ayurveda integration.', contact: '+91-484-2540-800', address: 'Edappally, Kochi', source: 'kerala-tourism' },
  { name: 'Athulya Ayurvedic Hospital', type: 'hospital', district: 'Kozhikode', ayushCertified: true, panchakarma: true, services: ['Panchakarma','Kayachikitsa'], profile: 'Modern Ayurveda hospital in Kozhikode.', contact: '+91-495-2766-100', address: 'Mavoor Road, Kozhikode', source: 'kerala-tourism' },
  { name: 'Travancore Ayurveda Hospital', type: 'hospital', district: 'Alappuzha', ayushCertified: true, panchakarma: true, services: ['Panchakarma','Backwater Wellness'], profile: 'Backwater-side Ayurveda facility.', contact: '+91-477-2243-300', address: 'Beach Road, Alappuzha', source: 'kerala-tourism' },
  { name: 'Ayur Centre Kollam', type: 'panchakarma', district: 'Kollam', classification: 'green-leaf', ayushCertified: true, panchakarma: true, services: ['Panchakarma','Lifestyle Disorders'], profile: 'Mid-tier Ayurveda hospital serving South Kerala.', contact: '+91-474-2792-300', address: 'Karunagappally, Kollam', source: 'kerala-tourism' },
]
