// PM2 process spec — used on the VPS via:
//   pm2 startOrReload ecosystem.config.js
// Each process loads its own .env via dotenv (api) or Next's built-in (web).
//
// Phase 18 (2026-07-24, production audit): added crash-loop protection
// (min_uptime + max_restarts + exp_backoff_restart_delay) and bumped the
// memory ceiling on the API from 512M → 1G because production heap was
// sitting at 93% of the old limit and thrashing.
module.exports = {
  apps: [
    {
      name: 'ayurconnect-api',
      cwd: './apps/api',
      script: 'dist/server.js',
      interpreter: 'node',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '1G',
      autorestart: true,
      watch: false,
      kill_timeout: 5000,
      // Circuit-breaker: if the process dies within min_uptime, PM2 counts it
      // as a failed start and backs off exponentially instead of hammering
      // /health at N restarts/sec. Caps at max_restarts before giving up.
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 2000,
      exp_backoff_restart_delay: 100,
      time: true,
    },
    {
      name: 'ayurconnect-web',
      cwd: './apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3100 -H 127.0.0.1',
      interpreter: 'node',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '1G',
      autorestart: true,
      watch: false,
      kill_timeout: 5000,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 2000,
      exp_backoff_restart_delay: 100,
      time: true,
    },
  ],
}
