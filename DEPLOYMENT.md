# AyurConnect Deployment Plan

## Overview
Deploy the full-stack AyurConnect platform to VPS at 194.164.151.202 with domain ayurconnect.com

## Architecture
- **Frontend**: Next.js 14 App Router (Static Export)
- **Backend**: Fastify API Server with Node.js
- **Database**: PostgreSQL (production) / SQLite (dev)
- **Domain**: ayurconnect.com
- **VPS**: 194.164.151.202

## Deployment Steps

### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install Nginx
sudo apt install nginx -y
```

### 2. Database Setup
```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE ayurconnect;
CREATE USER ayurconnect_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE ayurconnect TO ayurconnect_user;
\q

# Update schema.prisma for PostgreSQL
# Change provider from "sqlite" to "postgresql"
# Update url to production database URL
```

### 3. Application Deployment
```bash
# Clone repository
git clone https://github.com/your-repo/ayurconnect.git
cd ayurconnect

# Install dependencies
pnpm install

# Build packages
pnpm --dir packages/db run build
pnpm --dir apps/api run build:ts

# Build web app for static export
cd apps/web
pnpm build
pnpm export  # For static hosting

# Build API
cd ../api
pnpm build:ts
```

### 4. Environment Configuration
```bash
# Create .env files
# apps/api/.env
DATABASE_URL="postgresql://ayurconnect_user:password@localhost:5432/ayurconnect"
ANTHROPIC_API_KEY="your_claude_api_key"
PORT=3001
HOST=localhost

# apps/web/.env.local (if needed)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 5. PM2 Configuration
```json
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'ayurconnect-api',
    script: 'apps/api/dist/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
```

### 6. Nginx Configuration
```nginx
# /etc/nginx/sites-available/ayurconnect.com
server {
    listen 80;
    server_name ayurconnect.com www.ayurconnect.com;

    # Static files for Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/ayurconnect.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Get SSL certificate
sudo certbot --nginx -d ayurconnect.com -d www.ayurconnect.com
```

### 8. Database Migration
```bash
# Run Prisma migrations
cd packages/db
npx prisma migrate deploy
npx prisma generate
```

### 9. Start Services
```bash
# Start API with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Start Next.js (if not using static export)
cd apps/web
pm2 start "npm run start" --name ayurconnect-web
```

### 10. Monitoring & Logs
```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Current Project Status
- ✅ Monorepo with pnpm workspaces
- ✅ Database schema with all 8 modules
- ✅ API server (Fastify) with routes for doctors, hospitals, ayurbot
- ✅ Web app (Next.js) with pages for doctors, hospitals, ayurbot
- ✅ Local development servers running

## Files to Deploy
- `packages/db/` - Database schema and client
- `apps/api/` - Backend API server
- `apps/web/` - Frontend Next.js app
- `package.json` - Root dependencies
- `pnpm-workspace.yaml` - Workspace config
- `turbo.json` - Build orchestration

## Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `ANTHROPIC_API_KEY` - Claude AI API key
- `NEXT_PUBLIC_API_URL` - API base URL for frontend