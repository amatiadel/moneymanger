# Budget Tracker Deployment Guide

This guide will help you deploy your budget tracking website and Telegram bot to your Ubuntu server.

## 🚀 Quick Start

### 1. Upload Files to Server

First, upload all files to your Ubuntu server (179.61.132.56):

```bash
# From your local machine, upload files to server
scp -r . user@179.61.132.56:/home/user/budget-tracker/
```

### 2. Run Deployment Script

SSH into your server and run the deployment script:

```bash
ssh user@179.61.132.56
cd /home/user/budget-tracker
chmod +x deploy.sh
./deploy.sh
```

### 3. Set Up Telegram Bot

After deployment, set up the Telegram bot:

```bash
chmod +x setup-n8n-workflows.sh
./setup-n8n-workflows.sh
```

## 📋 Detailed Steps

### Server Requirements

- Ubuntu Server 22.04 LTS
- Node.js 18.x
- nginx
- n8n (already installed on port 5678)
- Domain: amatin8n.ru

### What the Deployment Script Does

1. **Updates system packages**
2. **Installs Node.js 18.x** (if not already installed)
3. **Installs PM2** for process management
4. **Creates application directory** at `/opt/budget-tracker`
5. **Copies application files** to the server
6. **Installs dependencies** with `npm install --production`
7. **Creates systemd service** for automatic startup
8. **Configures nginx** for the subdomain `budget.amatin8n.ru`
9. **Sets up SSL certificate** with Let's Encrypt
10. **Starts the application** and enables auto-start

### File Structure After Deployment

```
/opt/budget-tracker/
├── index.html          # Main website
├── script.js           # Frontend with API integration
├── styles.css          # Styling
├── server.js           # Express backend server
├── budget_data.json    # JSON database
├── package.json        # Dependencies
├── .env               # Production environment
└── node_modules/      # Installed dependencies
```

### nginx Configuration

The deployment creates an nginx configuration at `/etc/nginx/sites-available/budget.amatin8n.ru` that:

- Redirects HTTP to HTTPS
- Serves static files from `/opt/budget-tracker`
- Proxies API requests to `localhost:3001`
- Includes security headers
- Handles SSL termination

### Systemd Service

The application runs as a systemd service called `budget-tracker`:

```bash
# Check status
sudo systemctl status budget-tracker

# Start/stop/restart
sudo systemctl start budget-tracker
sudo systemctl stop budget-tracker
sudo systemctl restart budget-tracker

# View logs
sudo journalctl -u budget-tracker -f
```

## 🤖 Telegram Bot Setup

### 1. Create Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow instructions to create a new bot
4. Save the bot token

### 2. Configure n8n

1. Open n8n: `http://179.61.132.56:5678`
2. Go to Settings > Credentials
3. Add "Telegram API" credential with your bot token
4. Import the workflow from `~/n8n-workflows/telegram-bot-workflow.json`

### 3. Bot Features

The Telegram bot provides:

- **Interactive conversation flow** for adding income/expenses
- **Category selection** from the website's database
- **Amount validation** with error handling
- **Optional description** field
- **Automatic data saving** to the website database
- **Success/error confirmation** messages
- **Multi-user support** (all users see the same data)

### 4. Bot Commands

- `/start` - Start the conversation flow
- `/skip` - Skip description when adding entries

## 🔧 Configuration Details

### API Endpoints

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

### Data Format

**Expense/Income Entry:**
```json
{
  "id": 1234567890,
  "amount": 1500.50,
  "category": "продукты",
  "description": "Покупка продуктов",
  "addedBy": "username",
  "date": "2024-01-15",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Categories:**
```json
{
  "expense": ["ипотека", "продукты", "транспорт", ...],
  "income": ["ЗП Адель", "ЗП Кристина", "Tax refund", ...]
}
```

## 🧪 Testing

### Test API Connection

```bash
# Test health endpoint
curl https://budget.amatin8n.ru/health

# Test categories
curl https://budget.amatin8n.ru/api/categories

# Test adding expense
curl -X POST https://budget.amatin8n.ru/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "category": "тест", "description": "Test"}'
```

### Test Multi-User Functionality

1. Open the website in multiple browsers/incognito windows
2. Add expenses/income from different "users"
3. Verify all users see the same data
4. Test the Telegram bot from different accounts

## 🔒 Security

The deployment includes:

- **SSL/TLS encryption** with Let's Encrypt
- **Security headers** (X-Frame-Options, X-XSS-Protection, etc.)
- **CORS configuration** for API access
- **Input validation** on the backend
- **Error handling** without exposing sensitive information

## 📊 Monitoring

### Application Logs

```bash
# View application logs
sudo journalctl -u budget-tracker -f

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Health Checks

- Website: `https://budget.amatin8n.ru`
- API Health: `https://budget.amatin8n.ru/health`
- n8n: `http://179.61.132.56:5678`

## 🚨 Troubleshooting

### Common Issues

1. **Website not loading**
   - Check if the service is running: `sudo systemctl status budget-tracker`
   - Check nginx configuration: `sudo nginx -t`
   - Check SSL certificate: `sudo certbot certificates`

2. **API not responding**
   - Check if the service is running on port 3001: `sudo netstat -tlnp | grep 3001`
   - Check application logs: `sudo journalctl -u budget-tracker -f`

3. **Telegram bot not working**
   - Check n8n workflow is active
   - Verify Telegram credentials in n8n
   - Check n8n logs for errors

4. **SSL certificate issues**
   - Renew certificate: `sudo certbot renew`
   - Check certificate status: `sudo certbot certificates`

### Useful Commands

```bash
# Restart all services
sudo systemctl restart budget-tracker
sudo systemctl reload nginx

# Check service status
sudo systemctl status budget-tracker nginx

# View real-time logs
sudo journalctl -u budget-tracker -f

# Test nginx configuration
sudo nginx -t

# Check open ports
sudo netstat -tlnp | grep -E ':(80|443|3001|5678)'
```

## 📈 Scaling

For production use with many users, consider:

1. **Database upgrade** - Replace JSON file with PostgreSQL/MongoDB
2. **Load balancing** - Add multiple application instances
3. **Caching** - Add Redis for session management
4. **Monitoring** - Add application monitoring (e.g., PM2 monitoring)
5. **Backup** - Set up automated backups of the data file

## 🎉 Success!

After following this guide, you should have:

- ✅ Budget tracking website at `https://budget.amatin8n.ru`
- ✅ Working API backend
- ✅ Telegram bot for adding entries
- ✅ Multi-user support
- ✅ SSL encryption
- ✅ Automatic startup on server reboot

The system allows multiple users to access the same budget data through both the website and Telegram bot, with a guided conversation flow for adding income and expenses.
