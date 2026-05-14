# Stabilize the local dev environment after pulling WIP changes.
#
# Idempotent — safe to re-run. Does the parts of STABILIZATION.md you'd
# otherwise do by hand:
#   1. boots docker (postgres + redis + meili + minio)
#   2. applies all pending Prisma migrations (non-interactive)
#   3. regenerates the Prisma client
#   4. runs all seeds in order (each is idempotent / upsert-based)
#   5. typechecks API + web
#   6. (optional) installs Playwright browsers if -WithPlaywright is passed
#
# Stops at the first failure so you don't silently land in a half-state.
#
# Usage:
#   pnpm stabilize                     # everything except playwright browsers
#   pnpm stabilize -- -WithPlaywright  # also download chromium for e2e tests
#   pnpm stabilize -- -SkipSeeds       # skip the seed scripts (faster re-runs)

param(
    [switch]$WithPlaywright,
    [switch]$SkipSeeds,
    [switch]$SkipDocker
)

$ErrorActionPreference = "Stop"
$startedAt = Get-Date

# Move into repo root regardless of where the user invoked from.
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

function Step($title) {
    Write-Host ""
    Write-Host "── $title ─────────────────────────────────────────────" -ForegroundColor Cyan
}

function Done($what) {
    Write-Host "  ✓ $what" -ForegroundColor Green
}

function Fail($what) {
    Write-Host "  ✗ $what" -ForegroundColor Red
    exit 1
}

# ─── 0. Prerequisites ────────────────────────────────────────────────────
Step "Checking prerequisites"

$missing = @()
foreach ($cmd in @('pnpm', 'docker', 'node')) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        $missing += $cmd
    }
}
if ($missing.Count -gt 0) {
    Fail "missing required tool(s): $($missing -join ', '). Install before re-running."
}
Done "pnpm + docker + node available"

# ─── 0.5. Install deps ───────────────────────────────────────────────────
# Always run pnpm install — it's fast when up-to-date and catches the case
# where the user just pulled WIP with new package.json entries.
Step "Installing / verifying node_modules"
pnpm install
if ($LASTEXITCODE -ne 0) { Fail "pnpm install failed" }
Done "deps in sync"

# ─── 1. Docker infra ─────────────────────────────────────────────────────
if (-not $SkipDocker) {
    Step "Starting docker infra (postgres, redis, meili, minio)"
    docker compose up -d
    if ($LASTEXITCODE -ne 0) { Fail "docker compose up failed" }

    # Wait for postgres healthcheck. Migrations + seeds will fail if we race it.
    $deadline = (Get-Date).AddSeconds(90)
    while ((Get-Date) -lt $deadline) {
        $status = docker inspect -f '{{.State.Health.Status}}' ayurconnect-postgres 2>$null
        if ($status -eq "healthy") { Done "postgres healthy"; break }
        Start-Sleep -Seconds 2
    }
    if ($status -ne "healthy") { Fail "postgres did not become healthy within 90s" }
} else {
    Step "Skipping docker (assuming already running)"
}

# ─── 2. Migrations ───────────────────────────────────────────────────────
Step "Applying Prisma migrations (non-interactive: prisma migrate deploy)"
# `migrate deploy` is the right tool here — it applies pending migrations
# without prompting about schema drift. `migrate dev` would interactively ask
# to reset on drift, which we never want in an automation script.
pnpm --filter '@ayurconnect/db' exec prisma migrate deploy
if ($LASTEXITCODE -ne 0) { Fail "prisma migrate deploy failed" }
Done "migrations applied"

# ─── 3. Prisma client regen ──────────────────────────────────────────────
Step "Regenerating Prisma client"
pnpm --filter '@ayurconnect/db' exec prisma generate
if ($LASTEXITCODE -ne 0) { Fail "prisma generate failed" }
Done "client regenerated"

# ─── 4. Seeds ────────────────────────────────────────────────────────────
if (-not $SkipSeeds) {
    Step "Running seeds (idempotent upserts — safe to re-run)"
    $seeds = @(
        @{ Name = 'seed (base — doctors/hospitals/herbs/posts/...)' ; File = 'prisma/seed.ts' }
        @{ Name = 'seed-phase8 (programs / formulary / Q&A)'         ; File = 'prisma/seed-phase8.ts' }
        @{ Name = 'seed-phase10 (doctor hub: journals/papers/cases)' ; File = 'prisma/seed-phase10.ts' }
        @{ Name = 'seed-articles (20 knowledge articles)'            ; File = 'prisma/seed-articles.ts' }
    )
    foreach ($s in $seeds) {
        Write-Host "  → $($s.Name)" -ForegroundColor Gray
        pnpm --filter '@ayurconnect/db' exec tsx $s.File
        if ($LASTEXITCODE -ne 0) { Fail "$($s.File) failed" }
    }
    Done "all seeds ran"
} else {
    Step "Skipping seeds (-SkipSeeds)"
}

# ─── 5. Typecheck ────────────────────────────────────────────────────────
Step "Typechecking API"
pnpm --filter api exec tsc --noEmit
if ($LASTEXITCODE -ne 0) { Fail "API typecheck failed" }
Done "API typecheck clean"

Step "Typechecking web"
pnpm --filter '@ayurconnect/web' exec tsc --noEmit
if ($LASTEXITCODE -ne 0) { Fail "web typecheck failed" }
Done "web typecheck clean"

# ─── 6. Playwright (opt-in) ──────────────────────────────────────────────
if ($WithPlaywright) {
    Step "Installing @playwright/test + chromium browser (~200MB)"
    # Add as a root devDep (workspace-level, hence -w).
    pnpm add -D -w '@playwright/test'
    if ($LASTEXITCODE -ne 0) { Fail "pnpm add @playwright/test failed" }
    pnpm exec playwright install --with-deps chromium
    if ($LASTEXITCODE -ne 0) { Fail "playwright install failed" }
    Done "playwright + chromium installed"
} else {
    Write-Host ""
    Write-Host "  (skipped playwright install — re-run with -WithPlaywright to enable e2e tests)" -ForegroundColor DarkGray
}

# ─── Summary ─────────────────────────────────────────────────────────────
$elapsed = [int]((Get-Date) - $startedAt).TotalSeconds
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host " stabilize complete in ${elapsed}s" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps you still need to do manually:" -ForegroundColor Yellow
Write-Host "  1. Sign up a user via /auth/sign-up/email, then promote them to DOCTOR:"
Write-Host "       docker exec -it ayurconnect-postgres psql -U ayurconnect -d ayurconnect"
Write-Host "     then at the prompt:"
Write-Host "       UPDATE `"User`" SET role = 'DOCTOR' WHERE email = '<your-email>';"
Write-Host "  2. Boot the apps in two terminals:"
Write-Host "       pnpm --filter api dev"
Write-Host "       pnpm --filter @ayurconnect/web dev"
Write-Host "  3. Click through STABILIZATION.md section 3 to find what's broken."
Write-Host "  4. Watch the API console — every 4xx/5xx is now logged with route + userId."
Write-Host ""
if (-not $WithPlaywright) {
    Write-Host "Optional:" -ForegroundColor Yellow
    Write-Host "  • Run e2e smoke tests:  pnpm stabilize -- -WithPlaywright   (once)"
    Write-Host "                          pnpm test:e2e                       (every PR)"
    Write-Host "  • Enable Sentry:        pnpm --filter api add @sentry/node"
    Write-Host "                          then set SENTRY_DSN in apps/api env"
    Write-Host ""
}
