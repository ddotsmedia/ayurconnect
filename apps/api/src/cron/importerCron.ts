// Hourly cron to run the Ayurveda job importer.
//
// Schedule: '0 * * * *' (top of every hour). Also fires once on startup
// after a 10-second delay so freshly-deployed instances pull data without
// waiting up to an hour. Each fire runs 10 sources in parallel via
// Promise.allSettled in services/jobImporter.ts → runJobImport.
//
// The 10 sources:
//   1. nhm-kerala        WP RSS multi-keyword     (working)
//   2. kerala-psc        Drupal HTML gazette page (working — gazette batches)
//   3. indeed            Cloudflare-blocked       (disabled by default)
//   4. naukri            JS-only SPA              (disabled by default)
//   5. Evanios Jobs      commercial Kerala board
//   6. FreeJobAlert      govt-jobs aggregator
//   7. 20Govt Kerala     Kerala govt-jobs board
//   8. SimplyHired       likely Cloudflare-blocked
//   9. NHM Kerala (NAM)  Arogyakeralam /nam-kerala/ page
//  10. OLX Kerala        likely Cloudflare-blocked (often returns 0)
//
// Per-source flags (see services/jobImporter.ts):
//   JOB_IMPORT_ENABLE_INDEED=true        enable Indeed (paid Publisher API)
//   JOB_IMPORT_ENABLE_NAUKRI=true        enable Naukri (headless browser)
//   JOB_IMPORT_DISABLE_PSC=true          disable PSC scraper
//   JOB_IMPORT_DISABLE_OLX=true          disable OLX (often blocked)
//   JOB_IMPORT_DISABLE_SIMPLYHIRED=true  disable SimplyHired (often blocked)
//
// Disable the cron entirely:
//   JOB_IMPORT_CRON_DISABLED=true

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
