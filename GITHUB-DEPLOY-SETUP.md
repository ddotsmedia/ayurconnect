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

```powershell
# edit code via Claude or VS Code, then:
git add -A
git commit -m "what changed and why"
git push                               # deploy fires automatically
```

You can still run a deploy manually any time:

```powershell
pnpm ship                # standard manual deploy (use this — `pnpm deploy` collides with pnpm's built-in)
pnpm ship:check          # ssh + dirs + PM2 reachability check only
pnpm ship:dry            # print every step without executing
pnpm ship:seed           # also re-run db:seed
pnpm ship -- --logs      # tail PM2 logs after smoke test
```

Same script as the GitHub Actions runs. Useful when offline, when testing changes pre-commit, or for a manual recovery deploy.

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
