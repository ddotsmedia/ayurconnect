#!/usr/bin/env node
// Universal importer for AyurConnect.
//
// Usage:
//   node scripts/import/run.mjs --source kerala-tourism                          # builtin curated dataset
//   node scripts/import/run.mjs --source csv --type doctors   --file path.csv     # CSV → /admin/import/doctors
//   node scripts/import/run.mjs --source csv --type hospitals --file path.csv     # CSV → /admin/import/hospitals
//   node scripts/import/run.mjs --source kerala-tourism --dry-run                # preview only
//
// Env:
//   API_URL    default https://ayurconnect.com (use http://localhost:4100 for dev)
//   ADMIN_COOKIE    Better Auth session cookie (export from browser dev-tools)
//
// All imports go through the admin-gated POST /admin/import/{doctors|hospitals}
// endpoint, which upserts on stable keys (TCMC# for doctors, name+district for
// hospitals). Records start with ccimVerified=false; admin verifies via
// /admin/verify after manual cross-check.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const args = process.argv.slice(2)
function arg(name, fallback = null) {
  const i = args.indexOf(`--${name}`)
  if (i === -1) return fallback
  return args[i + 1] ?? true
}
const HAS = (name) => args.includes(`--${name}`)

const SOURCE = arg('source')
const TYPE   = arg('type', 'hospitals')        // for csv: doctors | hospitals
const FILE   = arg('file')
const DRY    = HAS('dry-run')
const API    = process.env.API_URL ?? 'https://ayurconnect.com'
const COOKIE = process.env.ADMIN_COOKIE ?? ''

if (!SOURCE) {
  console.error('usage: node scripts/import/run.mjs --source <name> [--type doctors|hospitals] [--file path.csv] [--dry-run]')
  console.error('  sources: kerala-tourism, csv')
  process.exit(1)
}

if (!COOKIE) {
  console.warn('⚠ ADMIN_COOKIE not set — the request will likely 401.')
  console.warn('  Sign in to /admin in your browser, copy the better-auth.session_token cookie, then:')
  console.warn('    set ADMIN_COOKIE=better-auth.session_token=eyJ...')
  console.warn('  (Windows CMD), or export ADMIN_COOKIE=... in bash.')
}

// ─── CSV parser (handles quoted fields with commas) ───────────────────────
function parseCsv(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter((l) => l.trim().length > 0)
  if (lines.length === 0) return []
  const split = (line) => {
    const out = []
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
  const rows = []
  for (let li = 1; li < lines.length; li++) {
    const cells = split(lines[li])
    const row = {}
    for (let ci = 0; ci < headers.length; ci++) {
      let v = (cells[ci] ?? '').trim()
      if (v === '') { row[headers[ci]] = ''; continue }
      // type-coerce known list/bool/number columns
      if (['languages', 'availableDays', 'services'].includes(headers[ci])) {
        row[headers[ci]] = v.split(',').map((s) => s.trim()).filter(Boolean)
      } else if (['ayushCertified', 'panchakarma', 'nabh', 'availableForOnline'].includes(headers[ci])) {
        row[headers[ci]] = /^(true|1|yes)$/i.test(v)
      } else if (['experienceYears', 'establishedYear', 'latitude', 'longitude'].includes(headers[ci])) {
        row[headers[ci]] = Number.isFinite(Number(v)) ? Number(v) : null
      } else {
        row[headers[ci]] = v
      }
    }
    rows.push(row)
  }
  return rows
}

// ─── Source loaders ───────────────────────────────────────────────────────
async function loadKeralaTourism() {
  const file = path.join(__dirname, 'data', 'kerala-tourism-centres.json')
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  const records = data.records.map((r) => ({ ...r, source: 'kerala-tourism', sourceUrl: r.sourceUrl ?? 'https://www.keralatourism.org/ayurveda/' }))
  return { type: 'hospitals', records }
}

async function loadCsv() {
  if (!FILE) { console.error('--file required for --source csv'); process.exit(1) }
  const text = fs.readFileSync(FILE, 'utf8')
  const records = parseCsv(text)
  return { type: TYPE, records }
}

// ─── HTTP POST to /admin/import/{doctors|hospitals} ───────────────────────
async function post(endpointType, records) {
  const url = `${API}/api/admin/import/${endpointType}`
  console.log(`▶ POST ${url}  (${records.length} records, dryRun=${DRY})`)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: COOKIE },
    body: JSON.stringify({ records, dryRun: DRY }),
  })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch { /* keep text */ }

  if (!res.ok) {
    console.error(`✗ HTTP ${res.status}`)
    console.error(text.slice(0, 500))
    process.exit(2)
  }
  console.log(`✓ HTTP 200`)
  console.log(`  ok: ${json.ok ?? '?'}  skipped: ${json.skipped ?? '?'}`)
  if (json.errors?.length) {
    console.log(`  errors:`)
    for (const e of json.errors.slice(0, 10)) console.log(`    row ${e.row}: ${e.reason}`)
    if (json.errors.length > 10) console.log(`    … and ${json.errors.length - 10} more`)
  }
  if (json.previews) {
    console.log(`  previews (dry-run):`)
    for (const p of json.previews.slice(0, 20)) console.log(`    ${p.action.padEnd(6)} ${p.name} (${p.district ?? '—'})`)
    if (json.previews.length > 20) console.log(`    … and ${json.previews.length - 20} more`)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────
const loader = {
  'kerala-tourism': loadKeralaTourism,
  csv: loadCsv,
}[SOURCE]
if (!loader) {
  console.error(`✗ unknown source '${SOURCE}'. Try: kerala-tourism, csv`)
  process.exit(1)
}

const { type, records } = await loader()
if (!Array.isArray(records) || records.length === 0) {
  console.error('✗ no records loaded')
  process.exit(1)
}
console.log(`▶ loaded ${records.length} ${type} from source '${SOURCE}'`)
await post(type, records)
console.log(DRY ? '\n(dry-run — nothing was written)' : '\n✓ done')
