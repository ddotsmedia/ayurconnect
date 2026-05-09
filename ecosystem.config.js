// PM2 process spec — used on the VPS via:
//   pm2 startOrReload ecosystem.config.js
// Each process loads its own .env via dotenv (api) or Next's built-in (web).
module.exports = {
  apps: [
    {
      name: 'ayurconnect-api',
      cwd: './apps/api',
      script: 'dist/server.js',
      interpreter: 'node',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '512M',
      autorestart: true,
      watch: false,
      kill_timeout: 5000,
      time: true,
    },
    {
      name: 'ayurconnect-web',
      cwd: './apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3100',
      interpreter: 'node',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '512M',
      autorestart: true,
      watch: false,
      kill_timeout: 5000,
      time: true,
    },
  ],
}
