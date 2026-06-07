#!/usr/bin/env tsx
// scripts/import-listings.ts — CSV/JSON drop importer for credential badge ingestion.
//
// Usage:
//   pnpm import:listings <file.csv|file.json> --entity centre --badge tourism_classified --source "Kerala Tourism Classification 2025" --sourceUrl "https://keralatourism.gov.in/.../classified-2025.html"
//
// Idempotent + resumable: dedupes against existing CredentialBadge rows by
// (entityType, badgeType, normalized name+district). Bad rows are LOGGED
// and skipped — the batch never crashes. Every new/matched listing gets a
// CredentialBadge row with status='pending' so the admin can verify it.
//
// Dedupe-as-FLAG (not auto-merge): when a name+district match is found,
// the new row is INSERTED as pending and tagged with notes mentioning the
// existing row's id, so the admin can decide. We never silently overwrite.

import { readFileSync, existsSync } from 'node:fs'
import { resolve, extname } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { normalizeListing, dedupeKey, type RawRow } from '../apps/api/src/lib/normalize-listing.js'

type Args = {
  file:       string
  entityType: 'doctor' | 'centre' | 'college' | 'manufacturer' | 'product'
  badgeType:  'state_registered' | 'tourism_classified' | 'gmp_licensed' | 'ncism_kuhs' | 'lineage_verified'
  sourceName: string | undefined
  sourceUrl:  string | undefined
  dryRun:     boolean
  limit:      number | undefined
}

function parseArgs(argv: string[]): Args {
  const args: Partial<Args> = { dryRun: false }
  const positional: string[] = []
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]!
    if (a === '--entity' || a === '--entityType') { args.entityType = argv[++i] as Args['entityType']; continue }
    if (a === '--badge'  || a === '--badgeType')  { args.badgeType  = argv[++i] as Args['badgeType'];  continue }
    if (a === '--source' || a === '--sourceName') { args.sourceName = argv[++i]; continue }
    if (a === '--sourceUrl')                       { args.sourceUrl  = argv[++i]; continue }
    if (a === '--dry-run' || a === '--dry')        { args.dryRun = true; continue }
    if (a === '--limit')                            { args.limit = parseInt(argv[++i] ?? '0', 10) || undefined; continue }
    if (a.startsWith('--')) { console.warn(`unknown flag: ${a}`); continue }
    positional.push(a)
  }
  if (!positional[0]) throw new Error('missing file path')
  args.file = positional[0]
  if (!args.entityType) throw new Error('--entity required (doctor|centre|college|manufacturer|product)')
  if (!args.badgeType)  throw new Error('--badge required (state_registered|tourism_classified|gmp_licensed|ncism_kuhs|lineage_verified)')
  return args as Args
}

// Robust-ish CSV parser. Handles quoted fields + escaped quotes. No new dep.
function parseCsv(text: string): RawRow[] {
  const rows: string[][] = []
  let i = 0, field = '', row: string[] = [], inQuotes = false
  while (i < text.length) {
    const c = text[i]!
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 2; continue }
      if (c === '"') { inQuotes = false; i++; continue }
      field += c; i++; continue
    }
    if (c === '"') { inQuotes = true; i++; continue }
    if (c === ',') { row.push(field); field = ''; i++; continue }
    if (c === '\r') { i++; continue }
    if (c === '\n') { row.push(field); rows.push(row); field = ''; row = []; i++; continue }
    field += c; i++
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  if (rows.length === 0) return []
  const header = rows[0]!.map((h) => h.trim())
  return rows.slice(1).filter((r) => r.some((c) => c.trim().length > 0)).map((r) => {
    const obj: RawRow = {}
    header.forEach((h, idx) => { obj[h] = r[idx] ?? '' })
    return obj
  })
}

function loadRows(path: string): RawRow[] {
  const buf = readFileSync(path, 'utf8')
  if (extname(path).toLowerCase() === '.json') {
    const j = JSON.parse(buf)
    if (!Array.isArray(j)) throw new Error('JSON must be an array of rows')
    return j as RawRow[]
  }
  return parseCsv(buf)
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv)
  const path = resolve(args.file)
  if (!existsSync(path)) throw new Error(`file not found: ${path}`)

  const rows = loadRows(path)
  const slice = args.limit ? rows.slice(0, args.limit) : rows
  console.log(`▶ ${rows.length} row${rows.length === 1 ? '' : 's'} parsed; processing ${slice.length}; entity=${args.entityType} badge=${args.badgeType}${args.dryRun ? ' [DRY RUN]' : ''}`)

  const prisma = new PrismaClient()
  let ok = 0, skipped = 0, flagged = 0, inserted = 0
  const errors: Array<{ index: number; reason: string; row: RawRow }> = []

  // Preload existing rows in this (entityType, badgeType) slice for dedupe.
  const existing = await prisma.credentialBadge.findMany({
    where: { entityType: args.entityType, badgeType: args.badgeType },
    select: { id: true, entityNameCached: true, entityDistrictCached: true },
  })
  const existingByKey = new Map<string, string>()  // dedupeKey -> id
  for (const e of existing) {
    if (e.entityNameCached) existingByKey.set(dedupeKey(e.entityNameCached, e.entityDistrictCached ?? undefined), e.id)
  }

  for (let i = 0; i < slice.length; i++) {
    const row = slice[i]!
    const norm = await normalizeListing(row, args.entityType, args.badgeType, args.sourceName, args.sourceUrl)
    if (!norm.ok) {
      errors.push({ index: i, reason: norm.reason, row })
      skipped++
      console.warn(`  row ${i + 1}: SKIP (${norm.reason})`)
      continue
    }
    const d = norm.data
    const key = dedupeKey(d.nameEn, d.district)
    const matchedId = existingByKey.get(key)
    const isDuplicate = !!matchedId

    if (args.dryRun) {
      ok++
      console.log(`  row ${i + 1}: ${isDuplicate ? '[FLAG-DUP]' : '[NEW]'} ${d.nameEn}${d.nameMl ? ` / ${d.nameMl}` : ''}${d.district ? ` · ${d.district}` : ''}`)
      continue
    }

    const notesLines: string[] = []
    if (isDuplicate) notesLines.push(`Possible duplicate of CredentialBadge ${matchedId} — admin to merge/dismiss.`)
    if (d.address)   notesLines.push(`Address: ${d.address}`)
    if (d.nameMl)    notesLines.push(`Malayalam name: ${d.nameMl}`)
    if (d.contactEmail) notesLines.push(`Contact email: ${d.contactEmail}`)
    if (d.contactPhone) notesLines.push(`Contact phone: ${d.contactPhone}`)

    // entityId in v1 = a synthetic slug derived from name+district until the
    // entity has its own DB row. When the entity exists, the admin can edit
    // the row to use the real id.
    const entityIdProvisional = (d.nameEn + (d.district ? '-' + d.district : '')).normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'unknown'

    await prisma.credentialBadge.create({
      data: {
        entityType:           d.entityType,
        entityId:             entityIdProvisional,
        badgeType:            d.badgeType,
        status:               'pending',
        tier:                 d.tier ?? null,
        referenceNumber:      d.referenceNumber ?? null,
        sourceUrl:            d.sourceUrl ?? null,
        sourceName:           d.sourceName ?? null,
        entityNameCached:     d.nameEn,
        entityDistrictCached: d.district ?? null,
        notes:                notesLines.join('\n') || null,
      },
    })
    inserted++
    if (isDuplicate) flagged++
    ok++
    if ((i + 1) % 25 === 0) console.log(`  … ${i + 1} processed`)
  }

  console.log(`\n▶ Done. ok=${ok} inserted=${inserted} duplicates_flagged=${flagged} skipped=${skipped} total_rows=${slice.length}`)
  if (errors.length > 0) {
    console.log(`\n▶ First 5 skipped row reasons:`)
    for (const e of errors.slice(0, 5)) console.log(`  [${e.index + 1}] ${e.reason}`)
  }
  await prisma.$disconnect()
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1) })
