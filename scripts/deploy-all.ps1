# Commit everything in the working tree in 2 logical chunks (db, then app) and
# push to main -- which triggers .github/workflows/deploy.yml -> scripts/deploy.sh
# on the VPS, which does: pull, pnpm install, prisma migrate deploy, build, pm2
# restart. The remote handles install / migrate / build / restart fully.
#
# Excluded from the commit by default:
#   - .claude/                              (local Claude Code settings)
#   - ~$*                                   (Office app lock files)
#   - AyurConnect_SEO_Strategy_2026.docx    (binary doc -- keep out of git)
#   - AyurConnect_SEO_Strategy_2026.pdf     (same)
#   - scripts/.deploy-key, .pem, .ppk       (already in .gitignore but belt+braces)
#
# Usage:
#   pnpm deploy-all                # interactive -- confirms before committing/pushing
#   pnpm deploy-all -- -Yes        # skip confirmation; commit and push immediately
#   pnpm deploy-all -- -DryRun     # show what would happen, change nothing
#   pnpm deploy-all -- -SkipTypecheck  # don't run typecheck before pushing

param(
    [switch]$Yes,
    [switch]$DryRun,
    [switch]$SkipTypecheck,
    [switch]$NoWatch
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

function Step($title) {
    Write-Host ""
    Write-Host "== $title ==" -ForegroundColor Cyan
}
function Done($what) { Write-Host "  [ok] $what" -ForegroundColor Green }
function Note($what) { Write-Host "  ... $what" -ForegroundColor DarkGray }
function Fail($what) { Write-Host "  [FAIL] $what" -ForegroundColor Red; exit 1 }

# --- 0. Prereqs ----------------------------------------------------------
Step "Prereq check"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Fail "missing required tool: git"
}
Done "git on PATH"
if (-not $SkipTypecheck) {
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Fail "pnpm not on PATH (needed for typecheck). Re-run with -SkipTypecheck if you've already typechecked, or install pnpm."
    }
    Done "pnpm on PATH"
}

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
if ($branch -ne 'main') {
    Fail "you are on branch '$branch' -- switch to 'main' first (this script pushes to main)"
}
Done "on branch main"

$remote = (git remote get-url origin 2>$null).Trim()
if (-not $remote) { Fail "no 'origin' remote configured" }
Done "remote: $remote"

# --- 1. Preview ----------------------------------------------------------
Step "Preview of what would be committed"
$status = git status --porcelain
if (-not $status) {
    Write-Host "  Nothing to commit. Working tree is clean." -ForegroundColor Yellow
    exit 0
}

$counts = @{ modified = 0; added = 0; deleted = 0; untracked = 0 }
foreach ($line in $status) {
    $code = $line.Substring(0, 2)
    if ($code -match '^\?\?') { $counts.untracked++ }
    elseif ($code -match 'M')  { $counts.modified++ }
    elseif ($code -match 'A')  { $counts.added++ }
    elseif ($code -match 'D')  { $counts.deleted++ }
}
Write-Host ("  modified:  {0,4}" -f $counts.modified)
Write-Host ("  new:       {0,4}" -f ($counts.added + $counts.untracked))
Write-Host ("  deleted:   {0,4}" -f $counts.deleted)
Write-Host ("  total:     {0,4}" -f $status.Count)

# --- 2. Typecheck before pushing -----------------------------------------
if (-not $SkipTypecheck -and -not $DryRun) {
    Step "Typecheck (sanity gate)"
    Note "API..."
    pnpm --filter api exec tsc --noEmit
    if ($LASTEXITCODE -ne 0) { Fail "API typecheck failed -- fix before pushing" }
    Done "API clean"
    Note "Web..."
    pnpm --filter '@ayurconnect/web' exec tsc --noEmit
    if ($LASTEXITCODE -ne 0) { Fail "Web typecheck failed -- fix before pushing" }
    Done "Web clean"
}

# --- 3. Confirm ----------------------------------------------------------
if (-not $Yes -and -not $DryRun) {
    Write-Host ""
    Write-Host "  This will:" -ForegroundColor Yellow
    Write-Host "    1. Create 2 commits on 'main' (db chunk + app chunk)"
    Write-Host "    2. git push origin main"
    Write-Host "    3. GitHub Action runs scripts/deploy.sh on the VPS"
    Write-Host "       -> pnpm install, prisma migrate deploy, pnpm build, pm2 restart"
    Write-Host "    4. ayurconnect.com will be updated within ~3-5 minutes"
    Write-Host ""
    $resp = Read-Host "  Type 'deploy' to continue, anything else to abort"
    if ($resp -ne 'deploy') {
        Write-Host "  Aborted." -ForegroundColor Yellow
        exit 0
    }
}

# --- 4. Exclude patterns -------------------------------------------------
# Use the long-form ':(exclude)...' since git's short ':!path' form mis-parses
# leading '~' (treats it as unimplemented magic).
$excludes = @(
    ':(exclude).claude',
    ':(exclude).claude/**',
    ':(exclude,glob)~$*',
    ':(exclude,glob)**/~$*',
    ':(exclude)AyurConnect_SEO_Strategy_2026.docx',
    ':(exclude)AyurConnect_SEO_Strategy_2026.pdf',
    ':(exclude)scripts/.deploy-key',
    ':(exclude)scripts/.deploy-key.pub'
)

# --- 5. Chunk A: db ------------------------------------------------------
Step "Chunk 1/2 -- db: migrations + schema + seeds"
if ($DryRun) {
    Note "(dry-run) would: git add packages/db/ + git commit"
} else {
    git add 'packages/db/' @excludes
    $staged = git diff --cached --name-only
    if (-not $staged) {
        Note "nothing to commit for db chunk -- skipping"
    } else {
        Note "$($staged.Count) file(s) staged"
        $msgPath = Join-Path $repoRoot ".git\COMMIT_MSG_DB.txt"
        @"
db: phase 7-10 migrations + schema + seeds

- 9 new migrations: directory_indexes, doctor_workplace_media,
  phase7_health_platform, phase8_qa_programs_formulary, phase9_moderation,
  phase10_doctor_hub, testimonials, health_videos, research_paper_embedding,
  doctor_referrals.
- ResearchPaper.embedding vector(768) column for semantic RAG retrieval.
- DoctorReferral model: doctor-to-doctor referral inbox + accept/decline.
- Seeds: seed-phase8 (programs/formulary/Q&A), seed-phase10 (doctor hub),
  seed-articles (20 knowledge articles).
"@ | Out-File -FilePath $msgPath -Encoding utf8 -NoNewline
        git commit -F $msgPath
        if ($LASTEXITCODE -ne 0) { Fail "db commit failed" }
        Remove-Item -Force $msgPath -ErrorAction SilentlyContinue
        Done "db commit created"
    }
}

# --- 6. Chunk B: app -----------------------------------------------------
Step "Chunk 2/2 -- app: API + web + UI + infra"
if ($DryRun) {
    Note "(dry-run) would: git add -A (remaining) + git commit"
} else {
    git add -A . @excludes
    $staged = git diff --cached --name-only
    if (-not $staged) {
        Note "nothing to commit for app chunk -- skipping"
    } else {
        Note "$($staged.Count) file(s) staged"
        $msgPath = Join-Path $repoRoot ".git\COMMIT_MSG_APP.txt"
        @"
feat: doctor hub + health platform + UAE + conditions SEO + referrals + infra

- /dr/* doctor portal: cases, research (semantic RAG via pgvector), CME,
  protocols, conferences, journals, drug interactions, AI research assistant,
  doctor-to-doctor referral network.
- Health platform: patient dashboard for vitals, RPM, prescriptions, family,
  Q&A, programs, formulary, wellness-plans.
- UAE expansion: /abu-dhabi, /dubai, /sharjah city landing pages,
  /doctor-match flow, /second-opinion service.
- /conditions SEO: 8 high-intent landing pages with classical Ayurvedic
  understanding, formulations, lifestyle, MedicalCondition schema.org JSON-LD.
- /careers public page with 5 open roles.
- Content surfaces: admin-curated testimonials + health-videos + articles.
- Infra: centralized auth (root onRequest soft-attach), error-logger plugin
  with Sentry on-ramp, Playwright smoke tests + GitHub Actions CI typecheck,
  stabilize.ps1 + deploy-all.ps1 automation scripts.
- Verification rebrand: 'CCIM-verified' display text -> 'Verified' across the
  user-facing surface. About / methodology / admin verify queue intentionally
  retain regulatory references.
- Bug fixes: req.session not populated on /dr/* routes (every dr-* endpoint
  was 401-ing signed-in doctors); homepage testimonials hardcoded fallback
  that masked admin delete; doctor hub detail pages were missing for
  conferences and journals.
"@ | Out-File -FilePath $msgPath -Encoding utf8 -NoNewline
        git commit -F $msgPath
        if ($LASTEXITCODE -ne 0) { Fail "app commit failed" }
        Remove-Item -Force $msgPath -ErrorAction SilentlyContinue
        Done "app commit created"
    }
}

# --- 7. Push -------------------------------------------------------------
Step "Push to origin/main"
if ($DryRun) {
    Note "(dry-run) would: git push origin main"
} else {
    git push origin main
    if ($LASTEXITCODE -ne 0) { Fail "git push failed -- check network / credentials" }
    Done "pushed"
}

# --- 8. Watch ------------------------------------------------------------
if (-not $DryRun) {
    Step "GitHub Action triggered"
    $repo = $remote -replace '\.git$', '' -replace '^.*github\.com[:/]', ''
    $actionsUrl = "https://github.com/$repo/actions"
    Write-Host "  Watch the deploy live at:" -ForegroundColor Yellow
    Write-Host "    $actionsUrl"
    Write-Host ""

    if (-not $NoWatch -and (Get-Command gh -ErrorAction SilentlyContinue)) {
        Write-Host "  Tailing the most recent run with gh CLI..." -ForegroundColor DarkGray
        Start-Sleep -Seconds 3
        gh run watch --exit-status
        if ($LASTEXITCODE -eq 0) {
            Done "deploy succeeded"
        } else {
            Write-Host "  [FAIL] deploy reported failure -- check $actionsUrl" -ForegroundColor Red
            exit $LASTEXITCODE
        }
    } else {
        Note "(no gh CLI or -NoWatch passed; open the URL above to watch)"
    }

    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host " Done. ayurconnect.com should reflect the new build in ~1-2 min." -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host " If text changes still look stale (browser / Cloudflare cache):" -ForegroundColor Yellow
    Write-Host "   - Hard-refresh: Ctrl+Shift+R"
    Write-Host "   - Cloudflare -> Caching -> Purge Everything (if you control it)"
}
