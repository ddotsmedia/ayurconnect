#!/bin/bash

# AyurConnect Production Deployment Script
# Run this script on your VPS at 194.164.151.202

set -e

echo "🚀 Starting AyurConnect deployment to ayurconnect.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="ayurconnect.com"
VPS_IP="194.164.151.202"
PROJECT_DIR="/var/www/ayurconnect"
BACKUP_DIR="/var/backups/ayurconnect"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y curl wget git build-essential postgresql postgresql-contrib nginx snapd

# Install Node.js 20
print_status "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
print_status "Installing PM2..."
sudo npm install -g pm2

# Install pnpm
print_status "Installing pnpm..."
sudo npm install -g pnpm

# Setup PostgreSQL
print_status "Setting up PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
print_status "Creating PostgreSQL database and user..."
sudo -u postgres psql << EOF
CREATE DATABASE ayurconnect;
CREATE USER ayurconnect_user WITH PASSWORD 'CHANGE_THIS_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE ayurconnect TO ayurconnect_user;
ALTER USER ayurconnect_user CREATEDB;
EOF

# Create project directory
print_status "Creating project directory..."
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR

# Clone or update repository
if [ -d "$PROJECT_DIR/.git" ]; then
    print_status "Updating existing repository..."
    cd $PROJECT_DIR
    git pull origin main
else
    print_status "Cloning repository..."
    git clone https://github.com/YOUR_USERNAME/ayurconnect.git $PROJECT_DIR
    cd $PROJECT_DIR
fi

# Install dependencies
print_status "Installing project dependencies..."
pnpm install

# Setup environment files
print_status "Setting up environment files..."

# API environment
cp apps/api/.env.production apps/api/.env
# Edit the .env file with actual values
sed -i 's/CHANGE_THIS_PASSWORD/your_secure_db_password/g' apps/api/.env
sed -i 's/CHANGE_THIS_TO_YOUR_CLAUDE_API_KEY/your_claude_api_key/g' apps/api/.env

# Web environment
cp apps/web/.env.production apps/web/.env

# Build the project
print_status "Building the project..."
pnpm --dir packages/db run build
pnpm --dir apps/api run build:ts
pnpm --dir apps/web run build

# Run database migrations
print_status "Running database migrations..."
cd packages/db
npx prisma migrate deploy
npx prisma generate
cd ../..

# Setup PM2
print_status "Setting up PM2 processes..."
pm2 delete all || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Setup Nginx
print_status "Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/ayurconnect.com
sudo ln -sf /etc/nginx/sites-available/ayurconnect.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL with Let's Encrypt
print_status "Setting up SSL certificate..."
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

sudo certbot --nginx -d ayurconnect.com -d www.ayurconnect.com --non-interactive --agree-tos --email your-email@example.com

# Create logs directory
print_status "Setting up logging..."
mkdir -p logs
sudo chown -R www-data:www-data logs

# Setup firewall
print_status "Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Create backup script
print_status "Setting up backup script..."
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/ayurconnect"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/ayurconnect_$DATE.sql"

mkdir -p $BACKUP_DIR
pg_dump -U ayurconnect_user -h localhost ayurconnect > $BACKUP_FILE
gzip $BACKUP_FILE

# Keep only last 7 backups
cd $BACKUP_DIR
ls -t *.sql.gz | tail -n +8 | xargs -r rm
EOF

chmod +x backup.sh

# Setup cron job for backups
print_status "Setting up automated backups..."
(crontab -l ; echo "0 2 * * * $PROJECT_DIR/backup.sh") | crontab -

print_status "🎉 Deployment completed successfully!"
print_status "Your AyurConnect platform is now live at https://ayurconnect.com"
print_status ""
print_status "Next steps:"
print_status "1. Update the database password in apps/api/.env"
print_status "2. Add your Claude AI API key to apps/api/.env"
print_status "3. Test the application at https://ayurconnect.com"
print_status "4. Monitor logs with: pm2 logs"
print_status "5. Check PM2 status with: pm2 monit"
print_status ""
print_warning "Remember to:"
print_warning "- Keep your .env files secure"
print_warning "- Regularly update your system and dependencies"
print_warning "- Monitor server resources and logs"
print_warning "- Backup your database regularly"