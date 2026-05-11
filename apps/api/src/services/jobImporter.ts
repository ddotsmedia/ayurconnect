// Ayurveda / Kerala / BAMS / AYUSH job auto-importer.
//
// Source reality (as of 2026-05-11, after audit):
//   1. NHM Kerala (arogyakeralam.gov.in)  WordPress RSS feed   ✓ WORKS
//   2. Kerala PSC (keralapsc.gov.in)      Drupal HTML listing  ⚠ PARTIAL — gazette
//      listings page works but Ayurveda-specific categories sit inside PDFs.
//      We extract gazette announcements and let admin drill in manually.
//   3. Indeed India                       ⚠ Cloudflare CAPTCHA — disabled by default.
//      Indeed requires the paid Publisher API for legitimate access.
//   4. Naukri.com                         ⚠ JS-only SPA — disabled by default. ToS
//      forbids scraping; only an Enterprise contract would unlock data.
//
// Each scraper is wrapped in its own try/catch so one failure doesn't kill
// the others. Per-source enable flags via env: JOB_IMPORT_ENABLE_NAUKRI=true
// to re-enable a disabled scraper (e.g. after refactoring with a headless
// browser proxy).
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
const REQUEST_GAP = 1_500
const KEYWORDS = [
  'ayurveda', 'ayurvedic', 'bams', 'vaidya', 'ayush', 'panchakarma',
  'shalakya', 'kayachikitsa', 'prasuti', 'rasashastra', 'dravyaguna',
]

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
async function fetchText(url: string, attempts = 2): Promise<string | null> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await axios.get<string>(url, {
        timeout: TIMEOUT_MS,
        responseType: 'text',
        maxRedirects: 5,
        headers: {
          'User-Agent': ua(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-IN,en;q=0.9',
        },
        validateStatus: (s) => s >= 200 && s < 500,
      })
      if (res.status >= 400) return null
      return typeof res.data === 'string' ? res.data : String(res.data)
    } catch (err) {
      const e = err as AxiosError
      if (i === attempts - 1) {
        throw new Error(`fetch ${url} failed: ${e.code ?? e.message}`)
      }
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

// ─── Scraper 1: NHM Kerala via WP RSS (multi-keyword) ────────────────────
// arogyakeralam.gov.in is a WordPress site with public RSS that supports
// per-query feeds via /feed/?s=<keyword>. We query each keyword in turn and
// merge — dedupe happens later via fingerprint.
async function scrapeNhmKerala(): Promise<ScrapedJob[]> {
  const baseUrl = 'https://arogyakeralam.gov.in'
  const queries = ['ayurveda', 'ayush', 'bams']
  const out: ScrapedJob[] = []
  const seen = new Set<string>()

  for (const q of queries) {
    const url = `${baseUrl}/feed/?s=${encodeURIComponent(q)}`
    const xml = await fetchText(url).catch(() => null)
    if (!xml) continue

    const $ = cheerioLoad(xml, { xmlMode: true })
    $('item').each((_, item) => {
      const $item = $(item)
      const title = $item.find('title').first().text().trim()
      let link = $item.find('link').first().text().trim()
      const description = $item.find('description').first().text().trim()
      const pubDate = $item.find('pubDate').first().text().trim()
      const guid = $item.find('guid').first().text().trim()

      if (!title || !link) return
      // Normalise relative paths
      if (link.startsWith('/')) link = baseUrl + link
      if (!isAyurvedaJob(`${title} ${description}`)) return
      if (seen.has(guid || link)) return
      seen.add(guid || link)

      out.push({
        title:         title.slice(0, 250),
        organization:  'National Health Mission, Kerala',
        location:      'Kerala',
        description:   description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1500),
        applyUrl:      link,
        source:        'nhm-kerala',
        jobType:       'govt',
        category:      'government',
        lastDate:      pubDate ? new Date(pubDate) : null,
      })
    })

    await sleep(REQUEST_GAP)
  }

  return out
}

// ─── Scraper 2: Kerala PSC gazette listing ───────────────────────────────
// PSC publishes extra-ordinary gazettes monthly. The gazette page lists
// "CAT.NO 19/2026" style category numbers; the actual Ayurveda category
// titles are inside PDF gazettes we don't parse.
//
// What this scraper DOES capture: each gazette page link as a single "job"
// entry, tagged as `category: gazette-batch`. Admin can drill in to find
// Ayurveda categories. Realistic Ayurveda postings: ~3–5 per year, so a
// monthly gazette-batch link is the right granularity.
//
// To disable: JOB_IMPORT_DISABLE_PSC=true.
async function scrapeKeralaPsc(): Promise<ScrapedJob[]> {
  if (process.env.JOB_IMPORT_DISABLE_PSC === 'true') return []

  const url = 'https://www.keralapsc.gov.in/index.php/notifications'
  const html = await fetchText(url)
  if (!html) return []
  const $ = cheerioLoad(html)
  const out: ScrapedJob[] = []
  const seen = new Set<string>()

  // The page lists gazette entries — usually <a> tags inside the main content
  // area with hreflang="en" and href containing "extra-ordinary-gazette".
  $('a[hreflang="en"]').each((_, a) => {
    const $a = $(a)
    const href = $a.attr('href') ?? ''
    const title = $a.text().replace(/\s+/g, ' ').trim()
    if (!href.includes('extra-ordinary-gazette')) return
    if (!title) return
    if (seen.has(href)) return
    seen.add(href)

    const applyUrl = new URL(href, url).toString()
    out.push({
      title:         `Kerala PSC — ${title}`,
      organization:  'Kerala Public Service Commission',
      location:      'Kerala',
      description:   `Kerala PSC publishes BAMS / Ayurveda-relevant postings via the Extra Ordinary Gazette. Visit the link to view the full gazette and find Ayurveda-specific category numbers.`,
      applyUrl,
      source:        'kerala-psc',
      jobType:       'govt',
      category:      'gazette-batch',
    })
  })

  // Cap to the 6 most recent gazettes — older ones are historical.
  return out.slice(0, 6)
}

// ─── Scraper 3: Indeed India (DISABLED by default) ───────────────────────
// Indeed serves a Cloudflare CAPTCHA to non-browser clients. The only viable
// legitimate access path is Indeed Publisher API (https://ads.indeed.com/jobroll/xmlfeed).
// Enable only with the paid API: JOB_IMPORT_ENABLE_INDEED=true.
async function scrapeIndeed(): Promise<ScrapedJob[]> {
  if (process.env.JOB_IMPORT_ENABLE_INDEED !== 'true') return []

  const url = 'https://in.indeed.com/jobs?q=ayurveda+OR+bams+OR+ayush&l=Kerala'
  const html = await fetchText(url)
  if (!html) return []
  // Detect Cloudflare challenge and skip silently — no point parsing
  if (/cloudflare|cf-chl|captcha|security check/i.test(html.slice(0, 2000))) {
    return []
  }
  const $ = cheerioLoad(html)
  const out: ScrapedJob[] = []

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

// ─── Scraper 4: Naukri (DISABLED by default) ─────────────────────────────
// Naukri renders job cards client-side via Next.js — the initial HTML response
// contains the page shell only. Scraping requires headless Chromium (puppeteer/
// playwright) which is heavyweight + bot-blocked. Naukri ToS Section 2
// explicitly prohibits robots/spiders. Enable with: JOB_IMPORT_ENABLE_NAUKRI=true.
async function scrapeNaukri(): Promise<ScrapedJob[]> {
  if (process.env.JOB_IMPORT_ENABLE_NAUKRI !== 'true') return []

  const url = 'https://www.naukri.com/ayurveda-jobs-in-kerala'
  const html = await fetchText(url)
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
type CreatedJob = {
  id: string; title: string; organization: string | null; location: string | null;
  salary: string | null; applyUrl: string; source: string; category: string | null;
}
async function persist(fastify: FastifyInstance, jobs: ScrapedJob[]): Promise<{ created: number; updated: number; newJobs: CreatedJob[] }> {
  let created = 0, updated = 0
  const newJobs: CreatedJob[] = []
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
        const row = await fastify.prisma.importedJob.create({ data })
        created++
        newJobs.push({
          id: row.id, title: row.title, organization: row.organization, location: row.location,
          salary: row.salary, applyUrl: row.applyUrl, source: row.source, category: row.category,
        })
      }
    } catch (err) {
      fastify.log.warn({ err, sourceId, title: j.title }, 'jobImporter: persist failed for one row')
    }
  }
  return { created, updated, newJobs }
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
    { name: 'nhm-kerala', fn: scrapeNhmKerala },
    { name: 'kerala-psc', fn: scrapeKeralaPsc },
    { name: 'indeed',     fn: scrapeIndeed     },
    { name: 'naukri',     fn: scrapeNaukri     },
  ]

  const perSource: ImportSummary['perSource'] = []
  const allNewJobs: CreatedJob[] = []
  for (const s of sources) {
    try {
      fastify.log.info({ source: s.name }, 'jobImporter: starting source')
      const jobs = await s.fn()
      const { created, updated, newJobs } = await persist(fastify, jobs)
      allNewJobs.push(...newJobs)
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

  if (allNewJobs.length > 0) {
    try {
      const { sendAlertsForNewJobs } = await import('./whatsappAlerts.js')
      await sendAlertsForNewJobs(fastify, allNewJobs)
    } catch (err) {
      fastify.log.warn({ err }, 'jobImporter: WhatsApp alert fan-out failed (non-fatal)')
    }
  }

  return { perSource, total, durationMs: Date.now() - t0 }
}
