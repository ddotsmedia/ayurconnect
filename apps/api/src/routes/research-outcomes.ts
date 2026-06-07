import type { FastifyPluginAsync } from 'fastify'

export const autoPrefix = '/research'

// K-anonymized outcome aggregates for /research page. STRICT rules:
// - Only episodes with consentForResearch=true are included.
// - Cells with patient count < K_THRESHOLD are SUPPRESSED entirely (no
//   leak via "n=3" cells).
// - No PII in aggregates ever — only condition / status / count / mean / median.
// - We tag the suppression policy in the response so the UI can label it.
const K_THRESHOLD = 10
// 5-minute server-side cache because /research is a low-write, high-read surface.
const TTL_MS = 5 * 60_000

type Aggregate = {
  condition: string
  patientCount:   number
  episodeCount:   number
  meanInitialSeverity: number
  meanLatestSeverity:  number
  meanDeltaSeverity:   number  // negative = improvement
  improvedFraction:    number  // fraction of patients whose latest < initial
  medianDurationDays:  number | null
}
type AggregateResponse = { aggregates: Aggregate[]; suppressedConditions: number; kThreshold: number; computedAt: string }

let cached: { at: number; data: AggregateResponse } | null = null

const route: FastifyPluginAsync = async (fastify) => {
  fastify.get('/outcomes', async () => {
    if (cached && Date.now() - cached.at < TTL_MS) return cached.data

    // Pull every consenting episode with its log timeline.
    const episodes = await fastify.prisma.treatmentEpisode.findMany({
      where: { consentForResearch: true, status: { in: ['active', 'completed'] } },
      select: {
        condition: true, patientUserId: true, startDate: true, endDate: true,
        logs: { orderBy: { date: 'asc' }, select: { date: true, severity: true } },
      },
    })

    // Group by condition. We need ≥1 log per episode to be useful.
    type Bucket = {
      condition: string
      patients: Set<string>
      episodeCount: number
      initials: number[]
      latests: number[]
      deltas: number[]
      improved: number
      durationsDays: number[]
    }
    const byCondition = new Map<string, Bucket>()

    for (const ep of episodes) {
      if (ep.logs.length === 0) continue
      const first = ep.logs[0]!.severity
      const last  = ep.logs[ep.logs.length - 1]!.severity
      const key   = ep.condition
      let b = byCondition.get(key)
      if (!b) {
        b = { condition: key, patients: new Set(), episodeCount: 0, initials: [], latests: [], deltas: [], improved: 0, durationsDays: [] }
        byCondition.set(key, b)
      }
      b.patients.add(ep.patientUserId)
      b.episodeCount++
      b.initials.push(first)
      b.latests.push(last)
      b.deltas.push(last - first)
      if (last < first) b.improved++
      const end = ep.endDate ?? ep.logs[ep.logs.length - 1]!.date
      const days = Math.max(1, Math.round((end.getTime() - ep.startDate.getTime()) / 86_400_000))
      b.durationsDays.push(days)
    }

    let suppressedConditions = 0
    const aggregates: Aggregate[] = []
    for (const b of byCondition.values()) {
      const patientCount = b.patients.size
      if (patientCount < K_THRESHOLD) { suppressedConditions++; continue }
      const mean   = (xs: number[]) => xs.reduce((a, b2) => a + b2, 0) / xs.length
      const median = (xs: number[]) => {
        const s = [...xs].sort((a, b2) => a - b2)
        const m = Math.floor(s.length / 2)
        return s.length % 2 === 0 ? (s[m - 1]! + s[m]!) / 2 : s[m]!
      }
      aggregates.push({
        condition:            b.condition,
        patientCount,
        episodeCount:         b.episodeCount,
        meanInitialSeverity:  +mean(b.initials).toFixed(2),
        meanLatestSeverity:   +mean(b.latests).toFixed(2),
        meanDeltaSeverity:    +mean(b.deltas).toFixed(2),
        improvedFraction:     +(b.improved / b.episodeCount).toFixed(3),
        medianDurationDays:   Math.round(median(b.durationsDays)),
      })
    }
    aggregates.sort((a, b) => b.patientCount - a.patientCount)

    const data: AggregateResponse = {
      aggregates,
      suppressedConditions,
      kThreshold: K_THRESHOLD,
      computedAt: new Date().toISOString(),
    }
    cached = { at: Date.now(), data }
    return data
  })
}

export default route
