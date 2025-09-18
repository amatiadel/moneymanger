# Budget Tracker - Linux Server Deployment Guide

This guide will help you deploy your budget tracking website and Telegram bot to your Ubuntu server at `179.61.132.56` with the domain `budget.amatin8n.ru`.

## 🚀 Quick Deployment

### Prerequisites
- Ubuntu Server with sudo access
- Domain `amatin8n.ru` pointing to your server IP `179.61.132.56`
- n8n already running on port 5678
- nginx installed and configured

### Step 1: Upload Files to Server

From your local machine, upload all project files to your server:

```bash
# Create a temporary directory on the server
ssh user@179.61.132.56 "mkdir -p /home/user/budget-tracker-temp"

# Upload files using scp
scp -r . user@179.61.132.56:/home/user/budget-tracker-temp/
```

### Step 2: Run Deployment Script

SSH into your server and run the deployment script:

```bash
# SSH into your server
ssh user@179.61.132.56

# Navigate to the uploaded files
cd /home/user/budget-tracker-temp

# Make the deployment script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

The deployment script will:
- Install Node.js 18.x (if not already installed)
- Install PM2 for process management
- Create application directory at `/opt/budget-tracker`
- Install dependencies
- Create systemd services for both API and Telegram bot
- Configure nginx for `budget.amatin8n.ru`
- Set up SSL certificate with Let's Encrypt
- Start all services

### Step 3: Verify Deployment

After deployment, verify everything is working:

```bash
# Check service status
sudo systemctl status budget-tracker-api
sudo systemctl status budget-tracker-bot

# Check if services are listening on correct ports
sudo netstat -tlnp | grep -E ':(80|443|3001)'

# Test API endpoint
curl http://localhost:3001/health

# Check nginx configuration
sudo nginx -t
```

### Step 4: Test the Application

1. **Website**: Open `https://budget.amatin8n.ru` in your browser
2. **API**: Test `https://budget.amatin8n.ru/api/categories`
3. **Telegram Bot**: Send `/start` to your bot

## 📁 File Structure After Deployment

```
/opt/budget-tracker/
├── index.html              # Main website
├── script.js               # Frontend JavaScript
├── styles.css              # CSS styling
├── server.js               # Express API server
├── telegram-bot.js         # Telegram bot
├── budget_data.json        # JSON database
├── package.json            # Dependencies
├── .env                    # Environment variables
└── node_modules/           # Installed dependencies
```

## 🔧 Service Management

### Check Service Status
```bash
sudo systemctl status budget-tracker-api
sudo systemctl status budget-tracker-bot
```

### Start/Stop/Restart Services
```bash
# Start services
sudo systemctl start budget-tracker-api
sudo systemctl start budget-tracker-bot

# Stop services
sudo systemctl stop budget-tracker-api
sudo systemctl stop budget-tracker-bot

# Restart services
sudo systemctl restart budget-tracker-api
sudo systemctl restart budget-tracker-bot
```

### View Logs
```bash
# View API logs
sudo journalctl -u budget-tracker-api -f

# View Telegram bot logs
sudo journalctl -u budget-tracker-bot -f

# View recent logs
sudo journalctl -u budget-tracker-api --since "1 hour ago"
sudo journalctl -u budget-tracker-bot --since "1 hour ago"
```

## 🌐 nginx Configuration

The deployment creates an nginx configuration at `/etc/nginx/sites-available/budget.amatin8n.ru` that:

- Redirects HTTP to HTTPS
- Serves static files from `/opt/budget-tracker`
- Proxies API requests to `localhost:3001`
- Includes security headers
- Handles SSL termination

### nginx Commands
```bash
# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Restart nginx
sudo systemctl restart nginx

# Check nginx status
sudo systemctl status nginx
```

## 🔒 SSL Certificate

The deployment automatically sets up SSL certificates using Let's Encrypt:

- Certificate location: `/etc/letsencrypt/live/budget.amatin8n.ru/`
- Auto-renewal: Configured via cron job
- Manual renewal: `sudo certbot renew`

## 🤖 Telegram Bot Configuration

The Telegram bot is configured with:
- **Bot Token**: `8432533152:AAH7siLTo-nTsna7TiBYM9ZMiIjgngD0bFc`
- **API URL**: `http://localhost:3001`
- **Auto-start**: Enabled via systemd service

### Bot Features
- Interactive conversation flow for adding income/expenses
- Category selection from the website's database
- Amount validation with error handling
- Optional description field
- Automatic data saving to the website database
- Success/error confirmation messages
- Multi-user support

### Bot Commands
- `/start` - Start the conversation flow
- `/add` - Add new entry
- `/skip` - Skip description when adding entries

## 🔧 Environment Variables

The application uses these environment variables (set in `/opt/budget-tracker/.env`):

```bash
NODE_ENV=production
PORT=3001
DATA_FILE=/opt/budget-tracker/budget_data.json
API_BASE_URL=http://localhost:3001
BOT_TOKEN=8432533152:AAH7siLTo-nTsna7TiBYM9ZMiIjgngD0bFc
```

## 📊 API Endpoints

The application exposes these API endpoints:

- `GET /health` - Health check
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Add new expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/income` - Get all income
- `POST /api/income` - Add new income
- `DELETE /api/income/:id` - Delete income
- `GET /api/budget` - Get budget settings
- `POST /api/budget` - Update budget
- `GET /api/categories` - Get categories
- `POST /api/categories` - Add category
- `DELETE /api/categories` - Delete category

## 🧪 Testing

### Test Website
```bash
# Test health endpoint
curl https://budget.amatin8n.ru/health

# Test API
curl https://budget.amatin8n.ru/api/categories

# Test adding expense
curl -X POST https://budget.amatin8n.ru/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "category": "тест", "description": "Test"}'
```

### Test Telegram Bot
1. Open Telegram and search for your bot
2. Send `/start` command
3. Follow the conversation flow to add an entry
4. Verify the entry appears on the website

## 🚨 Troubleshooting

### Common Issues

1. **Website not loading**
   ```bash
   # Check if services are running
   sudo systemctl status budget-tracker-api
   
   # Check nginx configuration
   sudo nginx -t
   
   # Check SSL certificate
   sudo certbot certificates
   ```

2. **API not responding**
   ```bash
   # Check if API is running on port 3001
   sudo netstat -tlnp | grep 3001
   
   # Check API logs
   sudo journalctl -u budget-tracker-api -f
   ```

3. **Telegram bot not working**
   ```bash
   # Check bot service status
   sudo systemctl status budget-tracker-bot
   
   # Check bot logs
   sudo journalctl -u budget-tracker-bot -f
   ```

4. **SSL certificate issues**
   ```bash
   # Renew certificate
   sudo certbot renew
   
   # Check certificate status
   sudo certbot certificates
   ```

### Useful Debug Commands

```bash
# Check all running services
sudo systemctl list-units --type=service --state=running

# Check open ports
sudo netstat -tlnp | grep -E ':(80|443|3001|5678)'

# Check disk space
df -h

# Check memory usage
free -h

# Check system logs
sudo journalctl -f
```

## 🔄 Updates and Maintenance

### Updating the Application
```bash
# Stop services
sudo systemctl stop budget-tracker-api
sudo systemctl stop budget-tracker-bot

# Update files
cd /opt/budget-tracker
# Copy new files here

# Install new dependencies (if any)
npm install --production

# Start services
sudo systemctl start budget-tracker-api
sudo systemctl start budget-tracker-bot
```

### Backup Data
```bash
# Backup the data file
sudo cp /opt/budget-tracker/budget_data.json /opt/budget-tracker/budget_data.json.backup.$(date +%Y%m%d_%H%M%S)
```

## 🎉 Success!

After following this guide, you should have:

- ✅ Budget tracking website at `https://budget.amatin8n.ru`
- ✅ Working API backend on port 3001
- ✅ Telegram bot running in the background
- ✅ SSL encryption with Let's Encrypt
- ✅ Automatic startup on server reboot
- ✅ Multi-user support through both website and bot

The system allows multiple users to access the same budget data through both the website and Telegram bot, with a guided conversation flow for adding income and expenses.

## 📞 Support

If you encounter any issues:

1. Check the service logs: `sudo journalctl -u budget-tracker-api -f`
2. Verify nginx configuration: `sudo nginx -t`
3. Test API connectivity: `curl http://localhost:3001/health`
4. Check SSL certificate: `sudo certbot certificates`
