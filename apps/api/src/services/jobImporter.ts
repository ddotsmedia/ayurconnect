// Ayurveda / Kerala / BAMS / AYUSH job auto-importer — 10 sources, hourly cron.
//
// Sources (10 total, run in parallel via Promise.allSettled):
//   1. NHM Kerala WP feed         (arogyakeralam.gov.in/feed/?s=*) — RSS
//   2. Kerala PSC notifications   (keralapsc.gov.in/index.php/notifications)
//   3. Indeed India               (in.indeed.com) — disabled by default
//   4. Naukri.com                 (naukri.com) — disabled by default
//   5. Evanios Jobs               (evaniosjobs.com/kerala/…)
//   6. FreeJobAlert               (freejobalert.com)
//   7. 20Govt Kerala              (kerala.20govt.com/jobs-for/bams)
//   8. SimplyHired India          (simplyhired.co.in)
//   9. NHM Kerala NAM page        (arogyakeralam.gov.in/nam-kerala) — distinct
//      from the WP RSS scraper above; targets the National Ayush Mission page.
//  10. OLX Kerala Jobs            (olx.in)
//
// Each scraper is wrapped in its own try/catch so one failure doesn't kill
// the others. Per-source enable / disable flags via env:
//   JOB_IMPORT_ENABLE_INDEED=true       enable Indeed (needs paid API)
//   JOB_IMPORT_ENABLE_NAUKRI=true       enable Naukri (needs headless browser)
//   JOB_IMPORT_DISABLE_PSC=true         disable PSC gazette scraper
//   JOB_IMPORT_DISABLE_OLX=true         disable OLX scraper (often blocked)
//   JOB_IMPORT_DISABLE_SIMPLYHIRED=true disable SimplyHired (often blocked)
//
// Dedupe: every record gets a sourceId. Default is md5(source|applyUrl|title);
// individual scrapers can override with j.sourceId to use a more stable key
// (e.g. md5(`evanios-${jobId}`) when the upstream ad ID is reliable). The DB
// has a unique constraint on sourceId so re-imports are idempotent upserts.

import axios, { type AxiosError } from 'axios'
import { load as cheerioLoad } from 'cheerio'
import { createHash } from 'node:crypto'
import type { FastifyInstance } from 'fastify'

// ─── Config ──────────────────────────────────────────────────────────────
const TIMEOUT_MS  = 15_000
const REQUEST_GAP = 2_000   // delay between requests within a single scraper
const KEYWORDS = [
  'ayurveda', 'ayurvedic', 'bams', 'vaidya', 'ayush', 'panchakarma',
  'shalakya', 'kayachikitsa', 'prasuti', 'rasashastra', 'dravyaguna',
  'therapist', 'therapy', 'pharmacist',
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

// Single-string variant — used by scrapers that have a more stable natural
// key (upstream ad ID, slug, etc.) than the default source/url/title triple.
const fingerprintOf = (key: string): string =>
  createHash('md5').update(key).digest('hex')

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

// ─── RSS fetch — must NOT follow redirects ───────────────────────────────
// Some WordPress installations (including arogyakeralam.gov.in) return a
// 302 redirect on /feed/?s=… requests with the RSS XML body inline AND a
// Location header pointing at the homepage. Browser-friendly behavior that
// breaks naive HTTP clients. We therefore accept 302 + don't follow it, so
// we read the body directly.
async function fetchRss(url: string): Promise<string | null> {
  try {
    const res = await axios.get<string>(url, {
      timeout: TIMEOUT_MS,
      responseType: 'text',
      maxRedirects: 0,
      headers: {
        'User-Agent': ua(),
        'Accept':     'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
      },
      validateStatus: (s) => s === 200 || s === 301 || s === 302 || s === 304,
    })
    const body = typeof res.data === 'string' ? res.data : String(res.data)
    if (!body || !body.includes('<rss') && !body.includes('<feed')) return null
    return body
  } catch (err) {
    const e = err as AxiosError
    // Axios throws on certain status codes even though we asked it not to —
    // if the response has a body we can still read, use it.
    const resp = (e as { response?: { data?: string; status?: number } }).response
    if (resp?.data && typeof resp.data === 'string' && (resp.data.includes('<rss') || resp.data.includes('<feed'))) {
      return resp.data
    }
    return null
  }
}

// ─── Scraper output shape ────────────────────────────────────────────────
export type SourceName =
  | 'kerala-psc' | 'nhm-kerala' | 'indeed' | 'naukri'
  | 'Evanios Jobs'
  | 'FreeJobAlert'
  | '20Govt Kerala'
  | 'SimplyHired'
  | 'NHM Kerala (Arogyakeralam)'
  | 'OLX Kerala'

export type ScrapedJob = {
  title:           string
  organization?:   string | null
  location?:       string | null
  description?:    string | null
  qualifications?: string | null
  lastDate?:       Date | null
  applyUrl:        string
  source:          SourceName
  salary?:         string | null
  jobType?:        string | null
  category?:       string | null
  // Override the default fingerprint(source, applyUrl, title). Use when the
  // upstream has a stable natural key (jobId, ad slug, etc.) that's more
  // reliable than title-based hashing.
  sourceId?:       string
}

// Canonical ordered list of all 10 sources — used by runJobImport for the
// Promise.allSettled fan-out and by the admin /status endpoint to ensure
// every source appears in the breakdown (even with a 0 count).
export const ALL_SOURCES: readonly SourceName[] = [
  'nhm-kerala', 'kerala-psc', 'indeed', 'naukri',
  'Evanios Jobs', 'FreeJobAlert', '20Govt Kerala',
  'SimplyHired', 'NHM Kerala (Arogyakeralam)', 'OLX Kerala',
]

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
    const xml = await fetchRss(url).catch(() => null)
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

// ─── Helper: detect Cloudflare / CAPTCHA / WAF challenge in body ─────────
// Many of the commercial scrapers below serve a challenge page in response
// to non-browser clients. We bail early so the caller logs `scraped: 0`
// without further effort.
function isChallengePage(html: string): boolean {
  const head = html.slice(0, 3000).toLowerCase()
  return /cloudflare|cf-chl|captcha|security check|verify you are human|access denied|forbidden/.test(head)
}

// ─── Scraper 5: Evanios Jobs (Kerala Ayurveda + Therapist) ────────────────
// Commercial Kerala job board. Two URLs — doctor + therapist — merged into
// a single source via the supplied jobId for dedupe.
async function scrapeEvanios(): Promise<ScrapedJob[]> {
  const urls = [
    'https://www.evaniosjobs.com/kerala/ayurveda-doctor-jobs',
    'https://www.evaniosjobs.com/kerala/ayurveda-therapist-jobs',
  ]
  const out: ScrapedJob[] = []
  const seen = new Set<string>()

  for (const url of urls) {
    const html = await fetchText(url).catch(() => null)
    if (!html) { await sleep(REQUEST_GAP); continue }
    if (isChallengePage(html)) { await sleep(REQUEST_GAP); continue }

    const $ = cheerioLoad(html)
    // Tolerant selectors — Evanios card markup may shift between releases.
    $('.job-card, .job-listing, .vacancy, .listing-card, article, .row .col').each((_, card) => {
      const $card = $(card)
      const title = ($card.find('.job-title, h2, h3, .title').first().text() || '').replace(/\s+/g, ' ').trim()
      if (!title) return

      const cardText = $card.text()
      const jobIdMatch = cardText.match(/JOB\s*ID[:\s#]*([0-9]{4,10})/i)
        || $card.find('[data-id], [data-job-id]').first().attr('data-id')?.match(/(\d{4,10})/)
      const jobId = Array.isArray(jobIdMatch) ? jobIdMatch[1] : null
      if (!jobId || seen.has(jobId)) return
      seen.add(jobId)

      const orgText = ($card.find('.company-type, .company-name, .organization, .org').first().text() || '').replace(/\s+/g, ' ').trim()
      const locText = ($card.find('.location, .city, .district, .area').first().text() || '').replace(/\s+/g, ' ').trim()
      const postedText = ($card.find('.posted, .date, .posted-date, time').first().text() || '').trim()

      out.push({
        title:        title.slice(0, 250),
        organization: orgText || 'Ayurvedic facility',
        location:     locText || 'Kerala',
        description:  cardText.replace(/\s+/g, ' ').trim().slice(0, 1500),
        applyUrl:     'https://www.evaniosjobs.com/kerala/ayurveda-doctor-jobs',
        source:       'Evanios Jobs',
        jobType:      'PRIVATE',
        category:     /therapist/i.test(title) ? 'therapist' : 'doctor',
        lastDate:     postedText && !Number.isNaN(Date.parse(postedText)) ? new Date(postedText) : null,
        sourceId:     fingerprintOf(`evanios-${jobId}`),
      })
    })

    await sleep(REQUEST_GAP)
  }

  return out
}

// ─── Scraper 6: FreeJobAlert — BAMS Kerala govt jobs ──────────────────────
// Aggregator of Indian govt-job notifications. Public HTML listing — usually
// scrapeable without bot defences.
async function scrapeFreeJobAlert(): Promise<ScrapedJob[]> {
  const url = 'https://www.freejobalert.com/search-jobs/bams-government-jobs/?state=Kerala'
  const html = await fetchText(url).catch(() => null)
  if (!html) return []
  if (isChallengePage(html)) return []

  const $ = cheerioLoad(html)
  const out: ScrapedJob[] = []
  const seen = new Set<string>()

  // Listings are usually anchor tags inside post-content / tabular rows.
  // Capture each link whose text matches Ayurveda keywords + Kerala context.
  $('a[href]').each((_, a) => {
    const $a = $(a)
    const title = $a.text().replace(/\s+/g, ' ').trim()
    const href = ($a.attr('href') ?? '').trim()
    if (!title || !href) return
    if (title.length < 10) return  // ignore "Read more" / "Apply" link text

    const ctx = $a.closest('article, .post, tr, li, p, div').text().replace(/\s+/g, ' ')
    if (!isAyurvedaJob(`${title} ${ctx}`)) return
    if (!/kerala/i.test(`${title} ${ctx}`)) return

    const applyUrl = href.startsWith('http') ? href : new URL(href, url).toString()
    const lastDateMatch = ctx.match(/last\s*date[:\s]*([0-9./-]+)/i)
    const lastDate = lastDateMatch ? new Date(lastDateMatch[1]) : null
    const organization = ($a.closest('article, .post').find('h2, h3').first().text() || ctx.split('|')[0] || '').trim().slice(0, 200)
    const key = `freejobalert-${title}-${organization}`
    if (seen.has(key)) return
    seen.add(key)

    out.push({
      title:        title.slice(0, 250),
      organization: organization || null,
      location:     'Kerala, India',
      description:  ctx.slice(0, 1500),
      applyUrl,
      source:       'FreeJobAlert',
      jobType:      'GOVERNMENT',
      category:     'government',
      lastDate:     lastDate && !Number.isNaN(lastDate.getTime()) ? lastDate : null,
      sourceId:     fingerprintOf(key),
    })
  })

  return out
}

// ─── Scraper 7: 20Govt Kerala — BAMS section ──────────────────────────────
// kerala.20govt.com publishes Kerala-specific govt job notifications.
async function scrape20Govt(): Promise<ScrapedJob[]> {
  const url = 'https://kerala.20govt.com/jobs-for/bams/'
  const html = await fetchText(url).catch(() => null)
  if (!html) return []
  if (isChallengePage(html)) return []

  const $ = cheerioLoad(html)
  const out: ScrapedJob[] = []
  const seen = new Set<string>()

  $('article, .post, .job-post, .entry').each((_, art) => {
    const $art = $(art)
    const $heading = $art.find('h1, h2, h3').first()
    const title = $heading.text().replace(/\s+/g, ' ').trim()
    if (!title || title.length < 10) return

    const titleLink = $heading.find('a[href]').first().attr('href')
      ?? $art.find('a[href]').first().attr('href')
      ?? ''
    if (!titleLink) return

    const text = $art.text().replace(/\s+/g, ' ').trim()
    if (!isAyurvedaJob(`${title} ${text}`)) return

    const lastDateMatch = text.match(/(?:last\s*date|walk[-\s]*in)[:\s]*([0-9./-]+)/i)
    const lastDateStr = lastDateMatch ? lastDateMatch[1] : ''
    const lastDate = lastDateStr ? new Date(lastDateStr) : null

    const orgMatch = text.match(/department[:\s]+([^|·\n]{3,80})/i)
      ?? text.match(/organization[:\s]+([^|·\n]{3,80})/i)
    const organization = orgMatch ? orgMatch[1].trim() : null

    const applyUrl = titleLink.startsWith('http') ? titleLink : new URL(titleLink, url).toString()
    const key = `20govt-${title}-${lastDateStr}`
    if (seen.has(key)) return
    seen.add(key)

    out.push({
      title:        title.slice(0, 250),
      organization,
      location:     'Kerala, India',
      description:  text.slice(0, 1500),
      applyUrl,
      source:       '20Govt Kerala',
      jobType:      'GOVERNMENT',
      category:     'government',
      lastDate:     lastDate && !Number.isNaN(lastDate.getTime()) ? lastDate : null,
      sourceId:     fingerprintOf(key),
    })
  })

  return out
}

// ─── Scraper 8: SimplyHired India ────────────────────────────────────────
// Owned by Recruit Holdings (same parent as Indeed). Usually shares Cloudflare/
// PerimeterX defenses. Likely to return 403 or challenge HTML — we detect that
// and bail. Disable with JOB_IMPORT_DISABLE_SIMPLYHIRED=true.
async function scrapeSimplyHired(): Promise<ScrapedJob[]> {
  if (process.env.JOB_IMPORT_DISABLE_SIMPLYHIRED === 'true') return []

  const urls = [
    'https://www.simplyhired.co.in/search?q=ayurveda+doctor&l=kerala',
    'https://www.simplyhired.co.in/search?q=bams+doctor&l=kerala',
    'https://www.simplyhired.co.in/search?q=ayurveda+therapist&l=kerala',
  ]
  const out: ScrapedJob[] = []
  const seen = new Set<string>()

  for (const url of urls) {
    const html = await fetchText(url).catch(() => null)
    if (!html) { await sleep(REQUEST_GAP); continue }
    if (isChallengePage(html)) { await sleep(REQUEST_GAP); continue }

    const $ = cheerioLoad(html)
    $('article, .SerpJob-jobCard, .card, [data-testid*="result"]').each((_, card) => {
      const $card = $(card)
      const titleEl = $card.find('h2 a, h3 a, .jobTitle a, [data-testid="jobTitle"]').first()
      const title = titleEl.text().replace(/\s+/g, ' ').trim()
      const href = titleEl.attr('href') ?? ''
      if (!title || !href) return

      const cardText = $card.text()
      if (!isAyurvedaJob(`${title} ${cardText}`)) return

      const org = ($card.find('[data-testid*="company"], .companyName').first().text() || '').trim() || null
      const loc = ($card.find('[data-testid*="location"], .location, .companyLocation').first().text() || '').trim() || 'Kerala'
      const salary = ($card.find('[data-testid*="salary"], .salary, [class*="salary"]').first().text() || '').trim() || null

      const applyUrl = href.startsWith('http') ? href : new URL(href, 'https://www.simplyhired.co.in').toString()
      const key = `simplyhired-${title}-${org ?? ''}-${loc}`
      if (seen.has(key)) return
      seen.add(key)

      out.push({
        title:        title.slice(0, 250),
        organization: org,
        location:     loc.slice(0, 120),
        description:  cardText.replace(/\s+/g, ' ').trim().slice(0, 1500),
        applyUrl,
        source:       'SimplyHired',
        jobType:      'PRIVATE',
        category:     /therapist/i.test(title) ? 'therapist' : 'doctor',
        salary:       salary?.slice(0, 120) ?? null,
        sourceId:     fingerprintOf(key),
      })
    })

    await sleep(REQUEST_GAP)
  }

  return out
}

// ─── Scraper 9: NHM Kerala — National Ayush Mission page ─────────────────
// Distinct from the WP RSS scraper above. Targets the dedicated /nam-kerala/
// page which lists current NAM-Kerala recruitment notifications + attached
// PDFs / detail links.
async function scrapeArogyakeralam(): Promise<ScrapedJob[]> {
  const url = 'https://arogyakeralam.gov.in/nam-kerala/'
  const html = await fetchText(url).catch(() => null)
  if (!html) return []
  if (isChallengePage(html)) return []

  const $ = cheerioLoad(html)
  const out: ScrapedJob[] = []
  const seen = new Set<string>()

  $('a[href]').each((_, a) => {
    const $a = $(a)
    const href = ($a.attr('href') ?? '').trim()
    const title = $a.text().replace(/\s+/g, ' ').trim()
    if (!href || !title) return
    if (title.length < 8) return

    // Filter — only links whose text or surrounding paragraph mentions an
    // Ayurveda-relevant role.
    const ctx = $a.closest('li, p, td, div').text().replace(/\s+/g, ' ')
    if (!isAyurvedaJob(`${title} ${ctx}`)) return

    const applyUrl = href.startsWith('http') ? href : new URL(href, url).toString()
    const lastDateMatch = ctx.match(/(?:last\s*date|deadline)[:\s]*([0-9./-]+)/i)
    const lastDate = lastDateMatch ? new Date(lastDateMatch[1]) : null
    const key = `arogyakeralam-${title}`
    if (seen.has(key)) return
    seen.add(key)

    out.push({
      title:        title.slice(0, 250),
      organization: 'NHM Kerala / National Health Mission',
      location:     'Kerala, India',
      description:  ctx.slice(0, 1500),
      applyUrl,
      source:       'NHM Kerala (Arogyakeralam)',
      jobType:      'GOVERNMENT',
      category:     'government',
      lastDate:     lastDate && !Number.isNaN(lastDate.getTime()) ? lastDate : null,
      sourceId:     fingerprintOf(key),
    })
  })

  return out
}

// ─── Scraper 10: OLX Kerala Jobs (Ayurveda) ──────────────────────────────
// OLX has Cloudflare + a custom anti-bot layer and their ToS explicitly bans
// automated scraping. Almost always returns 403 or a JS challenge page. The
// scraper code below is correct for the listing markup — but expect it to
// log scraped:0 unless you wire up a residential-proxy or Playwright path.
// Disable with JOB_IMPORT_DISABLE_OLX=true.
async function scrapeOLX(): Promise<ScrapedJob[]> {
  if (process.env.JOB_IMPORT_DISABLE_OLX === 'true') return []

  const url = 'https://www.olx.in/kerala_g2001160/jobs_c4/q-ayurveda'
  const html = await fetchText(url).catch(() => null)
  if (!html) return []
  if (isChallengePage(html)) return []

  const $ = cheerioLoad(html)
  const out: ScrapedJob[] = []
  const seen = new Set<string>()

  // OLX SSR shape — listing cards usually have data-aut-id / EIR-style attrs
  $('li[data-aut-id="itemBox"], li.EIR5N, .a8c1f, article, [data-aut-id*="item"]').each((_, card) => {
    const $card = $(card)
    const $link = $card.find('a[href]').first()
    const href = ($link.attr('href') ?? '').trim()
    if (!href) return

    const title = ($card.find('[data-aut-id="itemTitle"], h2, span._2tW1I').first().text()
                || $link.attr('title')
                || $link.text()).replace(/\s+/g, ' ').trim()
    if (!title) return

    // Strict keyword filter per spec — title-only, must contain at least one
    // Ayurveda-relevant token.
    if (!/ayurveda|ayurvedic|bams|vaidya|panchakarma/i.test(title)) return

    const adIdMatch = href.match(/-iid-(\d+)/)
      ?? href.match(/\/iid-(\d+)/)
      ?? href.match(/(\d{6,})/)
    const adId = adIdMatch ? adIdMatch[1] : null
    if (!adId || seen.has(adId)) return
    seen.add(adId)

    const applyUrl = href.startsWith('http') ? href : new URL(href, 'https://www.olx.in').toString()
    const loc = ($card.find('[data-aut-id="item-location"], ._2VQu4').first().text() || '').replace(/\s+/g, ' ').trim() || 'Kerala'
    const salary = ($card.find('[data-aut-id="itemPrice"], ._89yzn').first().text() || '').trim() || null

    out.push({
      title:        title.slice(0, 250),
      organization: 'Private Employer',
      location:     loc.slice(0, 120),
      description:  $card.text().replace(/\s+/g, ' ').trim().slice(0, 1500),
      applyUrl,
      source:       'OLX Kerala',
      jobType:      'PRIVATE',
      category:     'private',
      salary:       salary?.slice(0, 120) ?? null,
      sourceId:     fingerprintOf(`olx-${adId}`),
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
    const sourceId = j.sourceId ?? fingerprint(j.source, j.applyUrl, j.title)
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

// runOne — wrap a single source: scrape → persist → log. Never throws; any
// failure becomes a per-source error entry in the summary so Promise.allSettled
// always resolves with structured data per source.
type SourceResult = { source: SourceName; scraped: number; created: number; updated: number; newJobs: CreatedJob[]; error?: string }

async function runOne(
  fastify: FastifyInstance,
  name: SourceName,
  fn: () => Promise<ScrapedJob[]>,
): Promise<SourceResult> {
  try {
    fastify.log.info({ source: name }, 'jobImporter: starting source')
    const jobs = await fn()
    const { created, updated, newJobs } = await persist(fastify, jobs)
    fastify.log.info({ source: name, scraped: jobs.length, created, updated }, 'jobImporter: source done')
    return { source: name, scraped: jobs.length, created, updated, newJobs }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    fastify.log.warn({ err, source: name }, 'jobImporter: source failed (continuing with others)')
    return { source: name, scraped: 0, created: 0, updated: 0, newJobs: [], error: msg.slice(0, 300) }
  }
}

export async function runJobImport(fastify: FastifyInstance): Promise<ImportSummary> {
  const t0 = Date.now()

  // All 10 sources fan out in parallel. Each one is bounded by its own
  // TIMEOUT_MS + internal REQUEST_GAP loop, so wall-time is the slowest
  // single source rather than the sum.
  const settled = await Promise.allSettled([
    runOne(fastify, 'nhm-kerala',                  scrapeNhmKerala),
    runOne(fastify, 'kerala-psc',                  scrapeKeralaPsc),
    runOne(fastify, 'indeed',                      scrapeIndeed),
    runOne(fastify, 'naukri',                      scrapeNaukri),
    runOne(fastify, 'Evanios Jobs',                scrapeEvanios),
    runOne(fastify, 'FreeJobAlert',                scrapeFreeJobAlert),
    runOne(fastify, '20Govt Kerala',               scrape20Govt),
    runOne(fastify, 'SimplyHired',                 scrapeSimplyHired),
    runOne(fastify, 'NHM Kerala (Arogyakeralam)',  scrapeArogyakeralam),
    runOne(fastify, 'OLX Kerala',                  scrapeOLX),
  ])

  // runOne never rejects so every entry is fulfilled — but guard anyway.
  const results: SourceResult[] = settled.map((r) =>
    r.status === 'fulfilled'
      ? r.value
      : { source: 'kerala-psc' as SourceName, scraped: 0, created: 0, updated: 0, newJobs: [], error: String(r.reason) },
  )

  const perSource: ImportSummary['perSource'] = results.map((r) => ({
    source: r.source, scraped: r.scraped, created: r.created, updated: r.updated, error: r.error,
  }))
  const allNewJobs: CreatedJob[] = results.flatMap((r) => r.newJobs)

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
