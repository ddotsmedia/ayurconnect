# GitHub Actions auto-deploy — one-time setup

Once you complete these four steps, every `git push origin main` triggers a deploy to https://ayurconnect.com automatically.

---

## Prerequisites (already done by Claude)

- Git initialized locally with a baseline commit on `main`
- SSH deploy key generated at `scripts/.deploy-key` + `scripts/.deploy-key.pub`
- Public key already authorized on the VPS (`/root/.ssh/authorized_keys`)
- Workflow file at `.github/workflows/deploy.yml`
- `scripts/deploy.sh` is CI-friendly (reads `DEPLOY_VPS`, `DEPLOY_DIR`, `DEPLOY_DOMAIN` env vars)
- `.gitignore` excludes `scripts/.deploy-key*` so the private key never gets committed

---

## What you do

### 1. Create the GitHub repo

Go to https://github.com/new and create a repository named **ayurconnect**. Choose either Public or Private — doesn't matter for Actions to work.

**Don't** initialize it with a README, .gitignore, or license — we already have those locally.

### 2. Add 3 repo secrets

On the new repo, go to **Settings → Secrets and variables → Actions → New repository secret**. Add these three:

| Name | Value | How to get it |
|---|---|---|
| `SSH_HOST` | `194.164.151.202` | (literal — paste this) |
| `SSH_USER` | `root` | (literal — paste this) |
| `SSH_PRIVATE_KEY` | _entire contents of_ `scripts/.deploy-key` | open the file in any editor and copy everything from `-----BEGIN OPENSSH PRIVATE KEY-----` through `-----END OPENSSH PRIVATE KEY-----` (inclusive of both lines), then paste |

After adding `SSH_PRIVATE_KEY`, **delete the local copies** so the private key only lives in GitHub Secrets:

```powershell
Remove-Item scripts\.deploy-key, scripts\.deploy-key.pub
```

(The public half is already on the VPS; you don't need it locally any more.)

### 3. Connect the local repo to GitHub and push

Replace `YOUR-USERNAME` below with your GitHub username (or org name if you created the repo under one):

```powershell
cd c:\Users\home\.claude\ayurvedakerala
git remote add origin git@github.com:YOUR-USERNAME/ayurconnect.git
git push -u origin main
```

(If you don't have an SSH key set up to push *to* GitHub from your laptop, use the HTTPS URL instead: `git remote add origin https://github.com/YOUR-USERNAME/ayurconnect.git` — GitHub will prompt for a personal access token on the first push.)

### 4. Watch the first deploy run

Open `https://github.com/YOUR-USERNAME/ayurconnect/actions` in your browser. You'll see a "deploy to ayurconnect.com" run start within 5 seconds of the push. Click into it to watch the live log. About 2 minutes later the smoke test should print all green ✓ and the workflow turns green.

You can also trigger a deploy manually any time without pushing: go to **Actions → deploy → Run workflow**.

---

## After setup — your normal workflow

The fastest path is a single command from any directory in CMD or PowerShell:

```powershell
push "what changed"      # stages → commits → pushes → watches CI → smoke-tests prod
```

End-to-end output looks like this (~80 seconds for the whole pipeline):

```
▶ stage + commit
  ✓ committed
▶ push to origin
  ✓ pushed
▶ wait for GitHub Actions to start a run
  ✓ run id: 25618418537  (https://github.com/.../actions/runs/25618418537)
▶ follow CI run
  ✓ deploy in 1m10s
  ✓ CI green
▶ smoke test https://ayurconnect.com
  ✓ /                                → 200
  ✓ /doctors                         → 200
  ✓ /hospitals                       → 200
  ... etc
▶ ✓ live: https://ayurconnect.com/
```

If CI fails, `push` exits non-zero and shows the last 30 lines of the failed step's log so you can fix forward. If the smoke test on prod fails despite CI passing, same — exits non-zero with which paths broke.

The `push` script lives at `C:\Users\home\bin\push.sh` (called from `push.cmd`) and depends on `gh` CLI being authenticated (it's auto-installed in the home `bin` folder; `gh` was already installed during initial setup).

If you want to bypass git and push directly to the VPS without committing (e.g. WIP smoke):

```powershell
ship                     # direct local→VPS deploy: sync → install → migrate → build → restart → smoke
ship --check             # ssh + dirs + PM2 reachability check only
ship --dry-run           # print every step without executing
ship --seed              # also re-run db:seed
ship --logs              # tail PM2 logs after smoke
```

Same `scripts/deploy.sh` runs in both `ship` (local-direct) and the GitHub Actions workflow (after `push`). `pnpm ship` from the repo directory is the npm-script equivalent.

---

## Troubleshooting

- **Workflow says "Permission denied (publickey)"** — the `SSH_PRIVATE_KEY` secret is wrong (extra/missing newlines, wrong key, etc.). Re-paste with the BEGIN/END lines included.
- **Workflow says "Host key verification failed"** — the `ssh-keyscan` step failed. Check `SSH_HOST` is `194.164.151.202` (no `https://`, no port, no scheme).
- **Smoke test fails** — same as a manual deploy: SSH in and run `pm2 logs ayurconnect-web --lines 50 --err` to see what crashed. The previous deploy is already overwritten, so either fix forward or `git revert` and push again.
- **You want to disable auto-deploy temporarily** — disable the workflow at **Actions → deploy → ⋯ → Disable workflow**. Re-enable when ready.
- **You're collaborating and want PR-based review** — change the workflow's `on.push.branches` to `on.pull_request.branches` and require reviews via branch protection. Or run a "preview deploy" job that builds without restarting prod, and a separate "prod deploy" job on merge.

---

## Security notes

- The deploy key is **only authorized for the VPS** (it's not a GitHub user key) and **only added to `/root/.ssh/authorized_keys` on `194.164.151.202`**. If you ever rotate it, regenerate via `ssh-keygen -t ed25519 -f scripts/.deploy-key -N ""`, replace the line in the VPS's authorized_keys, and update the `SSH_PRIVATE_KEY` secret.
- GitHub Secrets are encrypted at rest and only injected into the workflow's runtime env. They're not visible in workflow logs.
- The workflow runs on Microsoft-hosted runners (`ubuntu-latest`). Code briefly lives there during the run; nothing is persisted.
