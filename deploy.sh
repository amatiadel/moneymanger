#!/bin/bash

# Budget Tracker Deployment Script for Ubuntu Server
# Run this script on your Ubuntu server (179.61.132.56)

set -e

echo "🚀 Starting Budget Tracker deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x if not already installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 for process management
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Create application directory
APP_DIR="/opt/budget-tracker"
echo "📁 Creating application directory at $APP_DIR..."
mkdir -p $APP_DIR

# Copy application files
echo "📋 Copying application files..."
cp -r . $APP_DIR/
cd $APP_DIR

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install --production

# Create production environment file
echo "⚙️ Creating production configuration..."
cat > .env << EOF
NODE_ENV=production
PORT=3001
DATA_FILE=/opt/budget-tracker/budget_data.json
API_BASE_URL=http://localhost:3001
BOT_TOKEN=8432533152:AAH7siLTo-nTsna7TiBYM9ZMiIjgngD0bFc
EOF

# Create systemd service files
echo "🔧 Creating systemd services..."

# API Server service
tee /etc/systemd/system/budget-tracker-api.service > /dev/null << EOF
[Unit]
Description=Budget Tracker API Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=DATA_FILE=/opt/budget-tracker/budget_data.json
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Telegram Bot service
tee /etc/systemd/system/budget-tracker-bot.service > /dev/null << EOF
[Unit]
Description=Budget Tracker Telegram Bot
After=network.target budget-tracker-api.service
Requires=budget-tracker-api.service

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=API_BASE_URL=http://localhost:3001
Environment=BOT_TOKEN=8432533152:AAH7siLTo-nTsna7TiBYM9ZMiIjgngD0bFc
ExecStart=/usr/bin/node telegram-bot.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start services
echo "🔄 Starting Budget Tracker services..."
systemctl daemon-reload
systemctl enable budget-tracker-api
systemctl enable budget-tracker-bot
systemctl start budget-tracker-api
systemctl start budget-tracker-bot

# Check service status
echo "✅ Checking service status..."
systemctl status budget-tracker-api --no-pager
systemctl status budget-tracker-bot --no-pager

# Create nginx configuration
echo "🌐 Creating nginx configuration..."
tee /etc/nginx/sites-available/budget.amatin8n.ru > /dev/null << 'EOF'
server {
    listen 80;
    server_name budget.amatin8n.ru;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name budget.amatin8n.ru;
    
    # SSL configuration (will be updated by certbot)
    ssl_certificate /etc/letsencrypt/live/budget.amatin8n.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/budget.amatin8n.ru/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Serve static files
    location / {
        root /opt/budget-tracker;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable the site
echo "🔗 Enabling nginx site..."
ln -sf /etc/nginx/sites-available/budget.amatin8n.ru /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Install and configure SSL certificate
echo "🔒 Setting up SSL certificate..."
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
fi

# Get SSL certificate
certbot --nginx -d budget.amatin8n.ru --non-interactive --agree-tos --email admin@amatin8n.ru

# Set up automatic renewal
echo "🔄 Setting up SSL certificate auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "✅ Deployment completed successfully!"
echo "🌐 Your budget tracker is now available at: https://budget.amatin8n.ru"
echo "🔧 API endpoint: https://budget.amatin8n.ru/api/"
echo "💾 Data file location: $APP_DIR/budget_data.json"
echo "🤖 Telegram bot is running in the background"
echo ""
echo "📋 Next steps:"
echo "1. Test the website: https://budget.amatin8n.ru"
echo "2. Test the Telegram bot by sending /start to your bot"
echo "3. Test multi-user functionality"
echo ""
echo "🔧 Service management commands:"
echo "  sudo systemctl status budget-tracker-api"
echo "  sudo systemctl status budget-tracker-bot"
echo "  sudo systemctl restart budget-tracker-api"
echo "  sudo systemctl restart budget-tracker-bot"
echo "  sudo journalctl -u budget-tracker-api -f"
echo "  sudo journalctl -u budget-tracker-bot -f"
