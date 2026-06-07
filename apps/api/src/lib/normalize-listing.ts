// Haiku-only normalizer for messy CSV/JSON listing rows. Used by the
// scripts/import-listings.ts ingestion CLI. Returns ONLY JSON; parse
// defensively. Malayalam preserved byte-for-byte (Unicode pass-through).

import { chat } from './llm.js'

export type RawRow = Record<string, unknown>

export type NormalizedListing = {
  entityType: 'doctor' | 'centre' | 'college' | 'manufacturer' | 'product'
  badgeType:  'state_registered' | 'tourism_classified' | 'gmp_licensed' | 'ncism_kuhs' | 'lineage_verified'
  // Original Malayalam preserved as primary; English as secondary.
  nameMl?:    string
  nameEn:     string
  district?:  string
  address?:   string
  tier?:      'diamond' | 'gold' | 'silver' | 'green_leaf' | 'olive_leaf'
  referenceNumber?: string
  sourceUrl?: string
  sourceName?: string
  contactEmail?: string
  contactPhone?: string
}

const SYSTEM_PROMPT = `You are a data-cleaning assistant for an Ayurveda directory ingestion pipeline.

You will receive a single messy row (CSV-like keys/values) of a Kerala Ayurveda listing — a centre, college, manufacturer, doctor, or product — together with the badge type being ingested. Your job is to normalize it into the strict JSON schema below.

STRICT RULES (override anything else):
- Output ONLY valid JSON. No prose, no markdown, no code fences.
- Preserve Malayalam script EXACTLY as it appears in the input. Never transliterate, romanize, or strip Malayalam characters. If the name is available in both Malayalam and English, put Malayalam in nameMl AND English in nameEn. If only one is available, put it in nameEn (and leave nameMl null).
- "district" must be one of: Thiruvananthapuram, Kollam, Pathanamthitta, Alappuzha, Kottayam, Idukki, Ernakulam, Thrissur, Palakkad, Malappuram, Kozhikode, Wayanad, Kannur, Kasaragod — or null if not derivable. Spelling variations (Trivandrum→Thiruvananthapuram, Calicut→Kozhikode, Alleppey→Alappuzha, Quilon→Kollam) MUST be mapped to the canonical name above.
- "tier" applies ONLY to tourism_classified badges; map fuzzy values to: diamond, gold, silver, green_leaf, olive_leaf. For any other badgeType, omit tier.
- Never invent data. If a field is missing in the input, OMIT it from the JSON (do NOT guess).
- Trim whitespace; collapse internal multi-spaces to single space; keep Malayalam as-is.

Schema: {"entityType": "doctor"|"centre"|"college"|"manufacturer"|"product", "badgeType": "state_registered"|"tourism_classified"|"gmp_licensed"|"ncism_kuhs"|"lineage_verified", "nameEn": string, "nameMl"?: string, "district"?: string, "address"?: string, "tier"?: "diamond"|"gold"|"silver"|"green_leaf"|"olive_leaf", "referenceNumber"?: string, "sourceUrl"?: string, "sourceName"?: string, "contactEmail"?: string, "contactPhone"?: string}`

const VALID_ENTITY = new Set(['doctor', 'centre', 'college', 'manufacturer', 'product'])
const VALID_BADGE  = new Set(['state_registered', 'tourism_classified', 'gmp_licensed', 'ncism_kuhs', 'lineage_verified'])
const VALID_TIER   = new Set(['diamond', 'gold', 'silver', 'green_leaf', 'olive_leaf'])
const VALID_DISTRICT = new Set([
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam',
  'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram',
  'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod',
])

function parse(text: string): NormalizedListing | null {
  const stripped = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
  try {
    const obj = JSON.parse(stripped) as Partial<NormalizedListing>
    if (!obj || typeof obj !== 'object') return null
    if (!obj.entityType || !VALID_ENTITY.has(obj.entityType)) return null
    if (!obj.badgeType  || !VALID_BADGE.has(obj.badgeType))   return null
    if (typeof obj.nameEn !== 'string' || obj.nameEn.length === 0) return null
    if (obj.district && !VALID_DISTRICT.has(obj.district))    obj.district = undefined
    if (obj.tier     && !VALID_TIER.has(obj.tier))            obj.tier = undefined
    // Length caps (defensive)
    const cap = (s: string | undefined, n: number) => s ? s.slice(0, n) : undefined
    return {
      entityType: obj.entityType,
      badgeType:  obj.badgeType,
      nameEn:     obj.nameEn.slice(0, 200),
      nameMl:     cap(obj.nameMl,    200),
      district:   obj.district,
      address:    cap(obj.address,   500),
      tier:       obj.tier,
      referenceNumber: cap(obj.referenceNumber, 100),
      sourceUrl:       cap(obj.sourceUrl,       500),
      sourceName:      cap(obj.sourceName,      200),
      contactEmail:    cap(obj.contactEmail,    200),
      contactPhone:    cap(obj.contactPhone,    50),
    }
  } catch { return null }
}

export async function normalizeListing(
  row:        RawRow,
  entityType: NormalizedListing['entityType'],
  badgeType:  NormalizedListing['badgeType'],
  sourceName?: string,
  sourceUrl?:  string,
): Promise<{ ok: true; data: NormalizedListing } | { ok: false; reason: string }> {
  const message = `Normalize this row.
Hint: entityType=${entityType} badgeType=${badgeType}${sourceName ? ` sourceName="${sourceName}"` : ''}${sourceUrl ? ` sourceUrl="${sourceUrl}"` : ''}

Row (JSON):
${JSON.stringify(row, null, 2)}

Return the normalized JSON now.`
  const res = await chat({ system: SYSTEM_PROMPT, message, maxTokens: 600 })
  if (res.ok !== true) return { ok: false, reason: `llm: ${res.code}` }
  const data = parse(res.text)
  if (!data) return { ok: false, reason: 'parse-failed' }
  // Force the entityType + badgeType from the caller (the model can drift).
  data.entityType = entityType
  data.badgeType  = badgeType
  if (sourceName && !data.sourceName) data.sourceName = sourceName.slice(0, 200)
  if (sourceUrl  && !data.sourceUrl)  data.sourceUrl  = sourceUrl.slice(0, 500)
  return { ok: true, data }
}

// Simple normalized-name dedupe key: lowercase + collapse spaces + strip
// punctuation. Preserves Malayalam (Unicode is left alone) so a Malayalam
// name dedupes against itself but not against its English transliteration.
export function dedupeKey(nameEn: string, district: string | undefined): string {
  const n = nameEn.normalize('NFKC').toLowerCase().replace(/[.,'"`!?(){}\[\]<>;:]/g, '').replace(/\s+/g, ' ').trim()
  return `${n}|${(district ?? '').toLowerCase().trim()}`
}
