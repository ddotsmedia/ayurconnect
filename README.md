# AyurConnect Deployment Guide

## Overview
This guide will help you deploy AyurConnect.com to your VPS at 194.164.151.202.

## Prerequisites
- VPS with Ubuntu/Debian
- Root or sudo access
- Domain: ayurconnect.com pointing to 194.164.151.202
- Claude AI API key

## Quick Deployment

### 1. Upload Project to VPS
```bash
# On your local machine
scp -r . root@194.164.151.202:/var/www/ayurconnect
```

### 2. Run Deployment Script
```bash
# On your VPS
cd /var/www/ayurconnect
chmod +x deploy.sh
./deploy.sh
```

### 3. Configure Environment Variables
Edit the following files with your actual values:

**apps/api/.env:**
```env
DATABASE_URL="postgresql://ayurconnect_user:YOUR_SECURE_PASSWORD@localhost:5432/ayurconnect"
ANTHROPIC_API_KEY="your_claude_api_key_here"
JWT_SECRET="your_jwt_secret_here"
```

**apps/web/.env:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=https://ayurconnect.com
```

### 4. Restart Services
```bash
pm2 restart all
sudo systemctl reload nginx
```

## Manual Deployment Steps

If you prefer manual deployment, follow these steps:

### Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 and pnpm
sudo npm install -g pm2 pnpm

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Database Setup
```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE ayurconnect;
CREATE USER ayurconnect_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ayurconnect TO ayurconnect_user;
ALTER USER ayurconnect_user CREATEDB;
\q

# Run migrations
cd packages/db
npx prisma migrate deploy
npx prisma generate
```

### Application Deployment
```bash
# Install dependencies
pnpm install

# Build applications
pnpm --dir packages/db run build
pnpm --dir apps/api run build:ts
pnpm --dir apps/web run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Nginx Setup
```bash
# Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/ayurconnect.com
sudo ln -sf /etc/nginx/sites-available/ayurconnect.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Setup
```bash
# Install certbot
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Get SSL certificate
sudo certbot --nginx -d ayurconnect.com -d www.ayurconnect.com
```

## Monitoring & Maintenance

### Check Status
```bash
# PM2 status
pm2 status
pm2 monit

# Nginx status
sudo systemctl status nginx

# PostgreSQL status
sudo systemctl status postgresql
```

### View Logs
```bash
# Application logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Backup Database
```bash
# Manual backup
pg_dump -U ayurconnect_user -h localhost ayurconnect > backup.sql

# Automated backups are set up via cron job
```

## Troubleshooting

### Common Issues

1. **Port 80/443 already in use**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   # Stop conflicting services
   ```

2. **Database connection failed**
   - Check DATABASE_URL in .env
   - Verify PostgreSQL is running
   - Check user permissions

3. **API not responding**
   ```bash
   pm2 logs ayurconnect-api
   # Check for errors in logs
   ```

4. **SSL certificate issues**
   ```bash
   sudo certbot certificates
   sudo certbot renew
   ```

### Performance Tuning

- **PM2 clustering**: Edit ecosystem.config.js to increase instances
- **Nginx caching**: Adjust cache settings in nginx.conf
- **Database optimization**: Add indexes as needed
- **Memory limits**: Monitor with `pm2 monit`

## Security Checklist

- [ ] Change default PostgreSQL password
- [ ] Use strong JWT secret
- [ ] Enable UFW firewall
- [ ] Keep system updated
- [ ] Monitor logs regularly
- [ ] Backup database regularly
- [ ] Use HTTPS only
- [ ] Secure .env files (chmod 600)

## Support

For issues:
1. Check logs first
2. Verify environment variables
3. Test database connectivity
4. Check firewall rules
5. Verify domain DNS settings

Your AyurConnect platform should now be live at https://ayurconnect.com! 🎉