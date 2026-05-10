import type { FastifyPluginAsync } from 'fastify'
import { cached } from '../lib/cache.js'

export const autoPrefix = '/site-settings'

// Whitelist of supported keys + per-key validation. We only persist known
// keys so admins can't fill the table with arbitrary garbage. Default values
// are returned when the key is missing from the DB.
export const SETTING_KEYS = [
  // social
  { key: 'social.facebook',  type: 'url',   default: '' },
  { key: 'social.instagram', type: 'url',   default: '' },
  { key: 'social.youtube',   type: 'url',   default: '' },
  { key: 'social.linkedin',  type: 'url',   default: '' },
  { key: 'social.twitter',   type: 'url',   default: '' },
  { key: 'social.whatsapp',  type: 'url',   default: '' }, // wa.me link
  { key: 'social.telegram',  type: 'url',   default: '' },
  // contact
  { key: 'contact.email',    type: 'email', default: '' },
  { key: 'contact.phone',    type: 'phone', default: '' },
  { key: 'contact.address',  type: 'text',  default: '' },
  // brand
  { key: 'brand.tagline',    type: 'text',  default: "Kerala's #1 Ayurveda Platform" },
  { key: 'brand.copyright',  type: 'text',  default: '' },
] as const

export type SettingKey = typeof SETTING_KEYS[number]['key']

export const SETTING_DEFAULTS: Record<string, string> = Object.fromEntries(SETTING_KEYS.map((k) => [k.key, k.default]))
export const SETTING_KEY_SET = new Set<string>(SETTING_KEYS.map((k) => k.key))

export function validateSetting(key: string, value: string): string | null {
  if (!SETTING_KEY_SET.has(key)) return `unknown key: ${key}`
  if (typeof value !== 'string') return 'value must be a string'
  if (value.length > 500) return 'value too long (max 500 chars)'
  if (value === '') return null
  const def = SETTING_KEYS.find((k) => k.key === key)!
  switch (def.type) {
    case 'url':
      try { const u = new URL(value); if (!/^https?:$/.test(u.protocol)) return 'must be http(s) URL'; return null }
      catch { return 'invalid URL' }
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'invalid email'
    case 'phone':
      return value.length >= 5 && value.length <= 30 ? null : 'phone too short/long'
    case 'text':
      return null
  }
}

const route: FastifyPluginAsync = async (fastify) => {
  // Public read — returns full settings object with defaults filled in.
  fastify.get('/', async () => {
    return cached(fastify, 'site-settings:all', 60, async () => {
      const rows = await fastify.prisma.siteSetting.findMany()
      const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]))
      const out: Record<string, string> = { ...SETTING_DEFAULTS }
      for (const k of SETTING_KEY_SET) if (stored[k]) out[k] = stored[k]
      return out
    })
  })
}

export default route
