# Budget Tracker - Deployment Files

This directory contains all the necessary files to deploy your budget tracking website and Telegram bot to your Ubuntu server.

## 📁 Files Overview

### Deployment Scripts
- `deploy.sh` - Main deployment script for Ubuntu server
- `setup-n8n-workflows.sh` - Script to set up n8n workflows for Telegram bot
- `test-deployment.sh` - Test script to verify deployment

### n8n Workflows
- `n8n-workflows/telegram-bot-workflow.json` - Complete n8n workflow for Telegram bot integration

### Documentation
- `DEPLOYMENT_GUIDE.md` - Comprehensive deployment guide
- `README_DEPLOYMENT.md` - This file

## 🚀 Quick Deployment

1. **Upload files to your server:**
   ```bash
   scp -r . user@179.61.132.56:/home/user/budget-tracker/
   ```

2. **Run deployment script:**
   ```bash
   ssh user@179.61.132.56
   cd /home/user/budget-tracker
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Set up Telegram bot:**
   ```bash
   chmod +x setup-n8n-workflows.sh
   ./setup-n8n-workflows.sh
   ```

4. **Test deployment:**
   ```bash
   chmod +x test-deployment.sh
   ./test-deployment.sh
   ```

## 🎯 What Gets Deployed

### Website
- **URL:** https://budget.amatin8n.ru
- **Features:** Full budget tracking interface with charts and reports
- **API:** RESTful API for data management
- **Security:** SSL encryption with Let's Encrypt

### Telegram Bot
- **Integration:** n8n workflow-based bot
- **Features:** Interactive conversation flow for adding income/expenses
- **Multi-user:** All users share the same budget data
- **Categories:** Dynamic category selection from website database

### Server Configuration
- **Service:** systemd service for automatic startup
- **Proxy:** nginx reverse proxy with SSL termination
- **Process Management:** PM2 for Node.js application
- **Auto-renewal:** SSL certificate auto-renewal

## 🔧 Configuration Details

### API Endpoints
- `GET /health` - Health check
- `GET /api/expenses` - Get expenses
- `POST /api/expenses` - Add expense
- `GET /api/income` - Get income
- `POST /api/income` - Add income
- `GET /api/categories` - Get categories
- `POST /api/budget` - Update budget

### Data Format
```json
{
  "amount": 1500.50,
  "category": "продукты",
  "description": "Покупка продуктов",
  "addedBy": "username",
  "date": "2024-01-15"
}
```

## 🧪 Testing

The `test-deployment.sh` script verifies:
- ✅ API health endpoint
- ✅ Categories endpoint
- ✅ Expense creation
- ✅ Income creation
- ✅ Website access
- ✅ SSL certificate
- ✅ n8n access

## 🚨 Troubleshooting

### Common Issues

1. **Service not starting:**
   ```bash
   sudo systemctl status budget-tracker
   sudo journalctl -u budget-tracker -f
   ```

2. **nginx issues:**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

3. **SSL problems:**
   ```bash
   sudo certbot certificates
   sudo certbot renew
   ```

4. **API not responding:**
   ```bash
   curl https://budget.amatin8n.ru/health
   sudo netstat -tlnp | grep 3001
   ```

## 📊 Monitoring

### Logs
- Application: `sudo journalctl -u budget-tracker -f`
- nginx: `sudo tail -f /var/log/nginx/access.log`
- n8n: Check n8n interface logs

### Health Checks
- Website: https://budget.amatin8n.ru
- API: https://budget.amatin8n.ru/health
- n8n: http://179.61.132.56:5678

## 🎉 Success Criteria

After successful deployment, you should have:

- ✅ Website accessible at https://budget.amatin8n.ru
- ✅ API responding to all endpoints
- ✅ SSL certificate working
- ✅ n8n workflow imported and ready
- ✅ Telegram bot ready for configuration
- ✅ Multi-user data sharing working

## 📞 Support

If you encounter issues:

1. Check the logs first
2. Run the test script
3. Verify all services are running
4. Check the deployment guide for detailed troubleshooting

The system is designed to be robust and self-healing, with automatic restarts and SSL renewal.
