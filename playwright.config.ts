import { defineConfig, devices } from '@playwright/test'

// Playwright smoke tests live in e2e/. They run against a locally-running
// stack — bring it up with `pnpm dev` from the repo root before invoking
// `pnpm exec playwright test`.
//
// In CI: see .github/workflows/ci.yml — it boots the stack, runs migrations,
// and runs this config against http://localhost:3100.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,           // smoke tests are short; keep logs readable
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3100',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
