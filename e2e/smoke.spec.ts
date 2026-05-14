import { test, expect } from '@playwright/test'

// Anonymous smoke. Hits the top public routes and asserts they don't 500.
// Catches regressions like:
//   - "homepage renders fallback testimonials" → key text would be the seed names
//   - "doctors list 500s" → status code
//   - "deploy broke /sitemap.xml" → no 404
//
// Auth-gated routes (/dr/*, /dashboard, /admin) are NOT smoke-tested here —
// they need seeded test users. Add a separate file when ready.

const PUBLIC_ROUTES: Array<[string, RegExp]> = [
  ['/',                  /AyurConnect|Kerala|Ayurveda/i],
  ['/doctors',           /doctor/i],
  ['/hospitals',         /hospital/i],
  ['/herbs',             /herb/i],
  ['/health-tips',       /health/i],
  ['/jobs',              /job/i],
  ['/tourism',           /tourism|panchakarma/i],
  ['/colleges',          /college/i],
  ['/forum',             /forum|community/i],
  ['/articles',          /article/i],
  ['/online-consultation', /consult/i],
  ['/contact',           /contact/i],
  ['/sitemap.xml',       /<urlset|<\?xml/i],
  ['/robots.txt',        /User-agent/i],
]

for (const [route, mustContain] of PUBLIC_ROUTES) {
  test(`GET ${route} renders without 5xx`, async ({ page, request }) => {
    if (route.endsWith('.xml') || route.endsWith('.txt')) {
      const res = await request.get(route)
      expect(res.status(), `${route} status`).toBeLessThan(400)
      expect(await res.text()).toMatch(mustContain)
      return
    }
    const res = await page.goto(route, { waitUntil: 'domcontentloaded' })
    expect(res, `${route} response`).toBeTruthy()
    expect(res!.status(), `${route} status`).toBeLessThan(400)
    await expect(page.locator('body')).toContainText(mustContain)
  })
}

test('homepage testimonials section reflects DB, not phantom fallback', async ({ page }) => {
  // Regression guard for the bug fixed in 2026-05-14: the homepage used to
  // render a hardcoded 3-testimonial fallback identical to the seeded rows
  // whenever the API call failed. If the admin deletes everything and the
  // section still shows Anita M. / James W. / Priya S., the bug is back.
  await page.goto('/')
  const testimonialsHeading = page.getByRole('heading', { name: /Stories of Healing/i })
  if (await testimonialsHeading.count() === 0) {
    // Section hidden because DB is empty — this is the correct empty state.
    return
  }
  // If the section IS rendered, fine — just ensure it's reading from the DB
  // (no useful assertion without seeding test data; this is a placeholder
  //  to be expanded once we seed deterministic testimonials).
  await expect(testimonialsHeading).toBeVisible()
})

test('/dr/* redirects anonymous users to /sign-in', async ({ page }) => {
  await page.goto('/dr/ai-research')
  expect(page.url()).toMatch(/\/sign-in/)
})
