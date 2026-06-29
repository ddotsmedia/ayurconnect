# Restore Instructions — De-AI Cleanup

If anything breaks after the de-AI cleanup deploy, use one of these options.

## Option 1: Instant VPS Restore (5 seconds, no rebuild)

```bash
ssh root@194.164.151.202 "cd /opt/ayurconnect/apps/web && rm -rf .next && mv .next.backup .next && pm2 restart ayurconnect-web"
```

## Option 2: Full Git Rollback (3-5 minutes, full rebuild)

```bash
git checkout pre-deai-cleanup
git push origin main --force
ssh root@194.164.151.202 "cd /opt/ayurconnect && git pull origin main && pnpm install && pnpm run build && pm2 restart ayurconnect-api ayurconnect-web"
```

## Option 3: Selective Revert (undo last N commits)

```bash
git revert --no-commit HEAD~N..HEAD
git commit -m "revert: rollback de-AI cleanup"
bash scripts/deploy.sh
```

Restore tag: `pre-deai-cleanup`
VPS backup path: `/opt/ayurconnect/apps/web/.next.backup`
