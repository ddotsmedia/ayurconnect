// Meilisearch index management + sync helpers.
//
// Indexes:
//   doctors    — searchable: name, specialization, district, qualification, profile, bio, languages
//   hospitals  — searchable: name, type, district, services, profile
//   herbs      — searchable: name, sanskrit, english, malayalam, rasa, uses, description
//   articles   — searchable: title, content, category
//
// All indexes use the entity's `id` as the Meili document `id`. Ranking rules
// favour exact matches in name/title fields. We DO NOT index unverified
// records — only public-facing data.

import type { FastifyInstance } from 'fastify'

export const INDEXES = {
  doctors:   'ayurconnect_doctors',
  hospitals: 'ayurconnect_hospitals',
  herbs:     'ayurconnect_herbs',
  articles:  'ayurconnect_articles',
} as const
export type IndexKey = keyof typeof INDEXES

const SETTINGS: Record<IndexKey, Record<string, unknown>> = {
  doctors: {
    searchableAttributes: ['name', 'specialization', 'qualification', 'district', 'languages', 'profile', 'bio'],
    filterableAttributes: ['district', 'specialization', 'ccimVerified', 'availableForOnline', 'languages'],
    sortableAttributes:   ['experienceYears', 'consultationFee', 'createdAt'],
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
  },
  hospitals: {
    searchableAttributes: ['name', 'type', 'district', 'services', 'profile'],
    filterableAttributes: ['district', 'type', 'ccimVerified', 'ayushCertified', 'panchakarma', 'nabh', 'classification'],
    sortableAttributes:   ['establishedYear', 'createdAt'],
  },
  herbs: {
    searchableAttributes: ['name', 'sanskrit', 'english', 'malayalam', 'rasa', 'guna', 'virya', 'vipaka', 'description', 'uses'],
    filterableAttributes: [],
  },
  articles: {
    searchableAttributes: ['title', 'content', 'category'],
    filterableAttributes: ['category', 'language'],
    sortableAttributes:   ['createdAt'],
  },
}

export async function ensureIndexes(fastify: FastifyInstance): Promise<void> {
  for (const key of Object.keys(INDEXES) as IndexKey[]) {
    const uid = INDEXES[key]
    try {
      await fastify.meili.getIndex(uid)
    } catch {
      // Create if missing — Meili API for v0.30+
      await fastify.meili.createIndex(uid, { primaryKey: 'id' })
    }
    try {
      await fastify.meili.index(uid).updateSettings(SETTINGS[key])
    } catch (err) {
      fastify.log.warn({ err, uid }, 'meili: failed to update settings')
    }
  }
}

// ─── Reindex from Postgres ───────────────────────────────────────────────
export async function reindexAll(fastify: FastifyInstance): Promise<{ doctors: number; hospitals: number; herbs: number; articles: number }> {
  await ensureIndexes(fastify)

  const [doctors, hospitals, herbs, articles] = await Promise.all([
    fastify.prisma.doctor.findMany({
      select: {
        id: true, name: true, specialization: true, district: true, qualification: true,
        profile: true, bio: true, languages: true, ccimVerified: true,
        experienceYears: true, consultationFee: true, availableForOnline: true,
        photoUrl: true, createdAt: true,
      },
    }),
    fastify.prisma.hospital.findMany({
      select: {
        id: true, name: true, type: true, district: true, services: true, profile: true,
        ccimVerified: true, ayushCertified: true, panchakarma: true, nabh: true,
        classification: true, establishedYear: true, createdAt: true,
      },
    }),
    fastify.prisma.herb.findMany({
      select: {
        id: true, name: true, sanskrit: true, english: true, malayalam: true,
        rasa: true, guna: true, virya: true, vipaka: true, description: true, uses: true,
      },
    }),
    fastify.prisma.knowledgeArticle.findMany({
      select: { id: true, title: true, content: true, category: true, language: true, createdAt: true },
    }),
  ])

  const toMillis = (d: Date | null) => (d ? d.getTime() : 0) // Meili doesn't accept Date objects

  if (doctors.length)   await fastify.meili.index(INDEXES.doctors).addDocuments(doctors.map((d) => ({ ...d, createdAt: toMillis(d.createdAt) })))
  if (hospitals.length) await fastify.meili.index(INDEXES.hospitals).addDocuments(hospitals.map((h) => ({ ...h, createdAt: toMillis(h.createdAt) })))
  if (herbs.length)     await fastify.meili.index(INDEXES.herbs).addDocuments(herbs)
  if (articles.length)  await fastify.meili.index(INDEXES.articles).addDocuments(articles.map((a) => ({ ...a, createdAt: toMillis(a.createdAt) })))

  return { doctors: doctors.length, hospitals: hospitals.length, herbs: herbs.length, articles: articles.length }
}

// ─── Per-record upsert / delete (call from write routes) ─────────────────
export async function upsertDoc(fastify: FastifyInstance, key: IndexKey, doc: Record<string, unknown>): Promise<void> {
  try {
    await fastify.meili.index(INDEXES[key]).addDocuments([doc])
  } catch (err) {
    fastify.log.warn({ err, key, id: doc.id }, 'meili upsert failed (ignoring)')
  }
}

export async function deleteDoc(fastify: FastifyInstance, key: IndexKey, id: string): Promise<void> {
  try {
    await fastify.meili.index(INDEXES[key]).deleteDocument(id)
  } catch (err) {
    fastify.log.warn({ err, key, id }, 'meili delete failed (ignoring)')
  }
}
