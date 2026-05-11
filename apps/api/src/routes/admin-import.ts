import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/admin/import'

// Bulk import endpoints for doctors and hospitals. Admin-gated.
// Accepts JSON arrays. Upserts on stable keys to make repeated imports safe:
//   Doctor:   tcmcNumber if present, else (name + district)
//   Hospital: (name + district)
//
// Each record may include a `source` and `sourceUrl` so admin can audit
// where rows came from. All imported rows start with ccimVerified=false —
// the admin verifies via /admin/verify before they go public.

type ImportDoctor = {
  name: string
  specialization?: string
  district?: string
  qualification?: string | null
  experienceYears?: number | null
  languages?: string[]
  availableDays?: string[]
  availableForOnline?: boolean
  contact?: string | null
  address?: string | null
  profile?: string | null
  bio?: string | null
  photoUrl?: string | null
  tcmcNumber?: string | null
  source?: string | null
  sourceUrl?: string | null
}

type ImportHospital = {
  name: string
  type?: string                  // hospital | panchakarma | wellness | clinic
  district?: string
  classification?: string | null // 'olive-leaf' | 'green-leaf' | null
  ayushCertified?: boolean
  panchakarma?: boolean
  nabh?: boolean
  establishedYear?: number | null
  services?: string[]
  contact?: string | null
  address?: string | null
  profile?: string | null
  latitude?: number | null
  longitude?: number | null
  source?: string | null
  sourceUrl?: string | null
}

type ImportResult = { ok: number; skipped: number; errors: Array<{ row: number; reason: string }> }

const STR_ARR = (v: unknown): string[] => Array.isArray(v) ? (v as unknown[]).filter((x): x is string => typeof x === 'string') : []
const NUM_OR_NULL = (v: unknown): number | null => v == null || v === '' ? null : (Number.isFinite(Number(v)) ? Number(v) : null)
const STR_OR_NULL = (v: unknown): string | null => typeof v === 'string' && v.trim() ? v.trim() : null
const BOOL = (v: unknown): boolean => v === true || v === 'true' || v === 1 || v === '1'

const adminImport: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.requireAdmin)

  // ─── Doctors ─────────────────────────────────────────────────────────
  fastify.post('/doctors', async (request) => {
    const { records, dryRun } = request.body as { records: ImportDoctor[]; dryRun?: boolean }
    if (!Array.isArray(records)) return { error: 'records must be an array' }

    const result: ImportResult = { ok: 0, skipped: 0, errors: [] }
    const previews: Array<{ action: 'create' | 'update'; name: string; district?: string }> = []

    for (let i = 0; i < records.length; i++) {
      const r = records[i]
      try {
        if (!r.name?.trim()) { result.errors.push({ row: i, reason: 'name required' }); continue }
        const name = r.name.trim()
        const specialization = (r.specialization ?? 'Kayachikitsa').trim()
        const district = (r.district ?? 'Ernakulam').trim()

        // Find existing by tcmcNumber, else by (name + district)
        let existing = null
        if (r.tcmcNumber) {
          existing = await fastify.prisma.doctor.findUnique({ where: { tcmcNumber: r.tcmcNumber } })
        }
        if (!existing) {
          existing = await fastify.prisma.doctor.findFirst({ where: { name, district } })
        }

        const data = {
          name,
          specialization,
          district,
          qualification:    STR_OR_NULL(r.qualification),
          experienceYears:  NUM_OR_NULL(r.experienceYears),
          languages:        STR_ARR(r.languages),
          availableDays:    STR_ARR(r.availableDays),
          availableForOnline: r.availableForOnline === undefined ? true : BOOL(r.availableForOnline),
          contact:          STR_OR_NULL(r.contact),
          address:          STR_OR_NULL(r.address),
          profile:          STR_OR_NULL(r.profile),
          bio:              STR_OR_NULL(r.bio),
          photoUrl:         STR_OR_NULL(r.photoUrl),
          tcmcNumber:       STR_OR_NULL(r.tcmcNumber),
          source:           STR_OR_NULL(r.source) ?? 'admin-import',
          sourceUrl:        STR_OR_NULL(r.sourceUrl),
          importedAt:       new Date(),
          ccimVerified:     false,
        }

        previews.push({ action: existing ? 'update' : 'create', name, district })

        if (!dryRun) {
          if (existing) {
            await fastify.prisma.doctor.update({ where: { id: existing.id }, data })
          } else {
            await fastify.prisma.doctor.create({ data })
          }
        }
        result.ok++
      } catch (e) {
        result.errors.push({ row: i, reason: e instanceof Error ? e.message : String(e) })
        result.skipped++
      }
    }

    return { ...result, dryRun: !!dryRun, previews: dryRun ? previews : undefined }
  })

  // ─── Hospitals ───────────────────────────────────────────────────────
  fastify.post('/hospitals', async (request) => {
    const { records, dryRun } = request.body as { records: ImportHospital[]; dryRun?: boolean }
    if (!Array.isArray(records)) return { error: 'records must be an array' }

    const result: ImportResult = { ok: 0, skipped: 0, errors: [] }
    const previews: Array<{ action: 'create' | 'update'; name: string; district?: string }> = []

    for (let i = 0; i < records.length; i++) {
      const r = records[i]
      try {
        if (!r.name?.trim()) { result.errors.push({ row: i, reason: 'name required' }); continue }
        const name = r.name.trim()
        const type = (r.type ?? 'hospital').trim()
        const district = (r.district ?? 'Ernakulam').trim()

        const existing = await fastify.prisma.hospital.findFirst({ where: { name, district } })

        const data = {
          name,
          type,
          district,
          classification:  STR_OR_NULL(r.classification),
          ayushCertified:  BOOL(r.ayushCertified),
          panchakarma:     BOOL(r.panchakarma),
          nabh:            BOOL(r.nabh),
          establishedYear: NUM_OR_NULL(r.establishedYear),
          services:        STR_ARR(r.services),
          contact:         STR_OR_NULL(r.contact),
          address:         STR_OR_NULL(r.address),
          profile:         STR_OR_NULL(r.profile),
          latitude:        NUM_OR_NULL(r.latitude),
          longitude:       NUM_OR_NULL(r.longitude),
          source:          STR_OR_NULL(r.source) ?? 'admin-import',
          sourceUrl:       STR_OR_NULL(r.sourceUrl),
          importedAt:      new Date(),
          ccimVerified:    false,
        }

        previews.push({ action: existing ? 'update' : 'create', name, district })

        if (!dryRun) {
          if (existing) {
            await fastify.prisma.hospital.update({ where: { id: existing.id }, data })
          } else {
            await fastify.prisma.hospital.create({ data })
          }
        }
        result.ok++
      } catch (e) {
        result.errors.push({ row: i, reason: e instanceof Error ? e.message : String(e) })
        result.skipped++
      }
    }

    return { ...result, dryRun: !!dryRun, previews: dryRun ? previews : undefined }
  })
}

export default adminImport
