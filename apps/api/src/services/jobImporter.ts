// Ayurveda / Kerala / BAMS / AYUSH job auto-importer.
//
// Sources:
//   1. Kerala PSC notifications  (govt — public record, no ToS issues)
//   2. NHM Kerala recruitment    (govt — public record, no ToS issues)
//   3. Indeed India              ⚠ ToS-ambiguous; commercial site uses bot detection
//   4. Naukri.com                ⚠ ToS prohibits scraping; aggressive anti-bot
//
// Each scraper is wrapped in its own try/catch so one failure doesn't kill
// the others. Per-source disable flags via env: JOB_IMPORT_DISABLE_NAUKRI=true
// etc., so an admin can pause a scraper without redeploying.
//
// Dedupe: every record gets a sourceId = md5(source + applyUrl + title); the
// DB has a unique constraint on sourceId so re-imports become no-ops via
// upsert. importedAt is updated on each upsert so we can prune stale rows.

import axios, { type AxiosError } from 'axios'
import { load as cheerioLoad } from 'cheerio'
import { createHash } from 'node:crypto'
import type { FastifyInstance } from 'fastify'

// ─── Config ──────────────────────────────────────────────────────────────
const TIMEOUT_MS  = 15_000
const REQUEST_GAP = 2_000           // 2-second delay between requests within a single source
const KEYWORDS = [
  'ayurveda', 'ayurvedic', 'bams', 'vaidya', 'ayush', 'panchakarma',
  'shalakya', 'kayachikitsa', 'prasuti', 'rasashastra', 'dravyaguna',
]

// Rotate between a few realistic browser UAs to slightly extend lifespan
// before commercial sites start bot-blocking us. Doesn't make scraping
// more legitimate — just slows down detection.
const UAS: ReadonlyArray<string> = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
]
const ua = (): string => UAS[Math.floor(Math.random() * UAS.length)]
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

const isAyurvedaJob = (text: string | null | undefined): boolean => {
  if (!text) return false
  const lower = text.toLowerCase()
  return KEYWORDS.some((kw) => lower.includes(kw))
}

const fingerprint = (source: string, applyUrl: string, title: string): string =>
  createHash('md5').update(`${source}|${applyUrl}|${title}`).digest('hex')

// ─── Common HTTP fetch with retry + UA + timeout ─────────────────────────
async function fetchHtml(url: string, attempts = 2): Promise<string | null> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await axios.get<string>(url, {
        timeout: TIMEOUT_MS,
        responseType: 'text',
        // Many of these endpoints redirect; allow up to 5 hops.
        maxRedirects: 5,
        headers: {
          'User-Agent': ua(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-IN,en;q=0.9',
        },
        // Don't throw on 3xx/4xx — let the caller decide
        validateStatus: (s) => s >= 200 && s < 500,
      })
      if (res.status >= 400) return null
      return typeof res.data === 'string' ? res.data : String(res.data)
    } catch (err) {
      const e = err as AxiosError
      if (i === attempts - 1) {
        // last attempt — caller logs the failure
        throw new Error(`fetch ${url} failed: ${e.code ?? e.message}`)
      }
      // exponential backoff: 1s, 3s, 7s …
      await sleep(1_000 * (2 ** i + 1))
    }
  }
  return null
}

// ─── Scraper output shape ────────────────────────────────────────────────
export type ScrapedJob = {
  title:           string
  organization?:   string | null
  location?:       string | null
  description?:    string | null
  qualifications?: string | null
  lastDate?:       Date | null
  applyUrl:        string
  source:          'kerala-psc' | 'nhm-kerala' | 'indeed' | 'naukri'
  salary?:         string | null
  jobType?:        string | null
  category?:       string | null
}

// ─── Scraper 1: Kerala PSC notifications ─────────────────────────────────
// We scrape the public notifications page. Public-record listings; no ToS issue.
async function scrapeKeralaPsc(): Promise<ScrapedJob[]> {
  const url = 'https://www.keralapsc.gov.in/notifications/notifications'
  const html = await fetchHtml(url)
  if (!html) return []
  const $ = cheerioLoad(html)
  const out: ScrapedJob[] = []

  // The PSC notification page is a long table; structure changes occasionally.
  // We use a tolerant selector: any <a> within a table row whose row text
  // mentions our keywords.
  $('table tr').each((_, tr) => {
    const $tr = $(tr)
    const text = $tr.text().toLowerCase()
    if (!isAyurvedaJob(text)) return

    const link = $tr.find('a[href]').first()
    const href = link.attr('href')
    const title = link.text().trim() || $tr.find('td').eq(1).text().trim()
    if (!title || !href) return

    const applyUrl = new URL(href, url).toString()
    out.push({
      title,
      organization: 'Kerala Public Service Commission',
      location:     'Kerala',
      description:  $tr.text().replace(/\s+/g, ' ').trim().slice(0, 1500),
      applyUrl,
      source:       'kerala-psc',
      jobType:      'govt',
      category:     'government',
    })
  })

  return out
}

// ─── Scraper 2: National Health Mission Kerala ───────────────────────────
async function scrapeNhmKerala(): Promise<ScrapedJob[]> {
  const url = 'https://arogyakeralam.gov.in/2020/01/10/recruitments-2/'
  const html = await fetchHtml(url)
  if (!html) return []
  const $ = cheerioLoad(html)
  const out: ScrapedJob[] = []

  // Page structure: WordPress with a long list of <li>/<p> entries.
  // We pick anchor tags whose surrounding text mentions keywords.
  $('a[href]').each((_, a) => {
    const $a = $(a)
    const href = $a.attr('href')
    const title = $a.text().replace(/\s+/g, ' ').trim()
    const ctx = $a.closest('li, p, td, div').text().toLowerCase()
    if (!href || !title) return
    if (!isAyurvedaJob(`${title} ${ctx}`)) return

    const applyUrl = new URL(href, url).toString()
    out.push({
      title:        title.slice(0, 250),
      organization: 'National Health Mission, Kerala',
      location:     'Kerala',
      description:  $a.closest('li, p, td, div').text().replace(/\s+/g, ' ').trim().slice(0, 1500),
      applyUrl,
      source:       'nhm-kerala',
      jobType:      'govt',
      category:     'government',
    })
  })

  return out
}

// ─── Scraper 3: Indeed India ─────────────────────────────────────────────
// ⚠ Indeed ToS prohibits automated scraping. Indeed has aggressive bot detection
// (PerimeterX) and rotates DOM frequently. This will work intermittently then
// start returning empty results. Disable with JOB_IMPORT_DISABLE_INDEED=true.
//
// Legitimate alternative: Indeed Publisher API (https://ads.indeed.com/jobroll/xmlfeed).
async function scrapeIndeed(): Promise<ScrapedJob[]> {
  if (process.env.JOB_IMPORT_DISABLE_INDEED === 'true') return []

  const url = 'https://in.indeed.com/jobs?q=ayurveda+OR+bams+OR+ayush&l=Kerala'
  const html = await fetchHtml(url)
  if (!html) return []
  const $ = cheerioLoad(html)
  const out: ScrapedJob[] = []

  // Tolerant selector: Indeed's class names rotate weekly. We grep for
  // h2.jobTitle anchors which has stayed stable across recent versions.
  $('h2.jobTitle a, [data-jk] h2 a, .jobTitle a').each((_, a) => {
    const $a = $(a)
    const card = $a.closest('[data-jk], .job_seen_beacon, .resultContent')
    const title = $a.text().replace(/\s+/g, ' ').trim()
    const href = $a.attr('href')
    if (!title || !href) return
    if (!isAyurvedaJob(title) && !isAyurvedaJob(card.text())) return

    const applyUrl = new URL(href, url).toString()
    const org = card.find('[data-testid="company-name"], .companyName, span.companyName').first().text().trim() || null
    const loc = card.find('[data-testid="text-location"], .companyLocation').first().text().trim() || 'Kerala'

    out.push({
      title,
      organization: org,
      location:     loc,
      description:  card.text().replace(/\s+/g, ' ').trim().slice(0, 1500),
      applyUrl,
      source:       'indeed',
      jobType:      'full-time',
      category:     'doctor',
    })
  })

  return out
}

// ─── Scraper 4: Naukri ───────────────────────────────────────────────────
// ⚠ Naukri ToS Section 2 explicitly prohibits robots/spiders. Cloudflare +
// reCAPTCHA on this domain will likely block our requests within hours.
// Disable with JOB_IMPORT_DISABLE_NAUKRI=true.
async function scrapeNaukri(): Promise<ScrapedJob[]> {
  if (process.env.JOB_IMPORT_DISABLE_NAUKRI === 'true') return []

  const url = 'https://www.naukri.com/ayurveda-jobs-in-kerala'
  const html = await fetchHtml(url)
  if (!html) return []
  const $ = cheerioLoad(html)
  const out: ScrapedJob[] = []

  $('article.jobTuple, .srp-jobtuple-wrapper').each((_, card) => {
    const $card = $(card)
    const titleA = $card.find('a.title, a[title]').first()
    const title = (titleA.attr('title') ?? titleA.text()).trim()
    const href = titleA.attr('href')
    if (!title || !href) return
    if (!isAyurvedaJob(title) && !isAyurvedaJob($card.text())) return

    const applyUrl = href.startsWith('http') ? href : new URL(href, url).toString()
    const org = $card.find('.subTitle, .companyInfo a').first().text().trim() || null
    const loc = $card.find('.locWdth, .loc-wrap').first().text().trim() || 'Kerala'
    const exp = $card.find('.expwdth, .exp-wrap').first().text().trim() || null

    out.push({
      title,
      organization: org,
      location:     loc,
      description:  $card.text().replace(/\s+/g, ' ').trim().slice(0, 1500),
      qualifications: exp,
      applyUrl,
      source:       'naukri',
      jobType:      'full-time',
      category:     'doctor',
    })
  })

  return out
}

// ─── Persist scraped jobs via Prisma upsert ──────────────────────────────
// Uses the unique sourceId index so re-imports are idempotent. We bump
// `importedAt` on every upsert so admins can sort by freshness.
async function persist(fastify: FastifyInstance, jobs: ScrapedJob[]): Promise<{ created: number; updated: number }> {
  let created = 0, updated = 0
  for (const j of jobs) {
    const sourceId = fingerprint(j.source, j.applyUrl, j.title)
    const data = {
      title:          j.title.slice(0, 500),
      organization:   j.organization ?? null,
      location:       j.location ?? null,
      description:    j.description ?? null,
      qualifications: j.qualifications ?? null,
      lastDate:       j.lastDate ?? null,
      applyUrl:       j.applyUrl.slice(0, 2000),
      source:         j.source,
      sourceId,
      salary:         j.salary ?? null,
      jobType:        j.jobType ?? null,
      category:       j.category ?? null,
    }
    try {
      const existing = await fastify.prisma.importedJob.findUnique({ where: { sourceId } })
      if (existing) {
        await fastify.prisma.importedJob.update({
          where: { sourceId },
          data: { ...data, isActive: true, importedAt: new Date() },
        })
        updated++
      } else {
        await fastify.prisma.importedJob.create({ data })
        created++
      }
    } catch (err) {
      fastify.log.warn({ err, sourceId, title: j.title }, 'jobImporter: persist failed for one row')
    }
  }
  return { created, updated }
}

// ─── Public entry point ──────────────────────────────────────────────────
export type ImportSummary = {
  perSource: Array<{ source: string; scraped: number; created: number; updated: number; error?: string }>
  total:     { scraped: number; created: number; updated: number }
  durationMs: number
}

export async function runJobImport(fastify: FastifyInstance): Promise<ImportSummary> {
  const t0 = Date.now()
  const sources: Array<{ name: ScrapedJob['source']; fn: () => Promise<ScrapedJob[]> }> = [
    { name: 'kerala-psc', fn: scrapeKeralaPsc },
    { name: 'nhm-kerala', fn: scrapeNhmKerala },
    { name: 'indeed',     fn: scrapeIndeed     },
    { name: 'naukri',     fn: scrapeNaukri     },
  ]

  const perSource: ImportSummary['perSource'] = []
  for (const s of sources) {
    try {
      fastify.log.info({ source: s.name }, 'jobImporter: starting source')
      const jobs = await s.fn()
      const { created, updated } = await persist(fastify, jobs)
      perSource.push({ source: s.name, scraped: jobs.length, created, updated })
      fastify.log.info({ source: s.name, scraped: jobs.length, created, updated }, 'jobImporter: source done')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      fastify.log.warn({ err, source: s.name }, 'jobImporter: source failed (continuing with others)')
      perSource.push({ source: s.name, scraped: 0, created: 0, updated: 0, error: msg.slice(0, 300) })
    }
    await sleep(REQUEST_GAP)
  }

  const total = perSource.reduce(
    (acc, s) => ({
      scraped: acc.scraped + s.scraped,
      created: acc.created + s.created,
      updated: acc.updated + s.updated,
    }),
    { scraped: 0, created: 0, updated: 0 },
  )

  return { perSource, total, durationMs: Date.now() - t0 }
}
