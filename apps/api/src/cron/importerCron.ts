// Hourly cron to run the Ayurveda job importer.
//
// Schedule: '0 * * * *' (top of every hour). Also fires once on startup
// after a 10-second delay so freshly-deployed instances pull data without
// waiting up to an hour.
//
// Disable per-source via env (see services/jobImporter.ts):
//   JOB_IMPORT_DISABLE_NAUKRI=true
//   JOB_IMPORT_DISABLE_INDEED=true
//
// Disable the cron entirely:
//   JOB_IMPORT_CRON_DISABLED=true
//
// We're aware that hourly hits on Naukri/Indeed will get IP-banned within
// a few days. This is a deliberate user choice; the per-source disable
// flags let us pause the commercial sources without redeploying once
// they start failing.

import cron, { type ScheduledTask } from 'node-cron'
import type { FastifyInstance } from 'fastify'
import { runJobImport } from '../services/jobImporter.js'

const SCHEDULE = process.env.JOB_IMPORT_CRON_SCHEDULE ?? '0 * * * *' // hourly
const STARTUP_DELAY_MS = 10_000

let task: ScheduledTask | null = null
let runInFlight = false

export function startJobImportCron(fastify: FastifyInstance): { stop: () => void } | null {
  if (process.env.JOB_IMPORT_CRON_DISABLED === 'true') {
    fastify.log.info('jobImporter cron: disabled via JOB_IMPORT_CRON_DISABLED')
    return null
  }
  if (!cron.validate(SCHEDULE)) {
    fastify.log.warn({ schedule: SCHEDULE }, 'jobImporter cron: invalid schedule, refusing to start')
    return null
  }

  // Single-flight guard so an over-running scrape doesn't pile up.
  const tick = async (label: string): Promise<void> => {
    if (runInFlight) {
      fastify.log.info({ label }, 'jobImporter cron: skipped — previous run still in flight')
      return
    }
    runInFlight = true
    try {
      const summary = await runJobImport(fastify)
      fastify.log.info({ label, ...summary }, 'jobImporter cron: complete')
    } catch (err) {
      fastify.log.error({ err, label }, 'jobImporter cron: unexpected failure')
    } finally {
      runInFlight = false
    }
  }

  // Startup run (10s grace so DB + plugins are fully ready)
  setTimeout(() => { void tick('startup') }, STARTUP_DELAY_MS)

  // Recurring run on the configured schedule. Asia/Kolkata so
  // "hourly at the top of the hour" lines up with IST.
  task = cron.schedule(SCHEDULE, () => { void tick('cron') }, { timezone: 'Asia/Kolkata' })
  fastify.log.info({ schedule: SCHEDULE, tz: 'Asia/Kolkata' }, 'jobImporter cron: started')

  return {
    stop: () => {
      try { task?.stop() } catch { /* noop */ }
      task = null
    },
  }
}
