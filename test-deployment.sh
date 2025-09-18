#!/bin/bash

# Test Budget Tracker Deployment
# Run this script on your server after deployment

echo "🧪 Testing Budget Tracker deployment..."

# Test 1: Check if services are running
echo "1️⃣ Checking services..."
if systemctl is-active --quiet budget-tracker-api; then
    echo "✅ API service is running"
else
    echo "❌ API service is not running"
    exit 1
fi

if systemctl is-active --quiet budget-tracker-bot; then
    echo "✅ Telegram bot service is running"
else
    echo "❌ Telegram bot service is not running"
    exit 1
fi

# Test 2: Check if ports are listening
echo "2️⃣ Checking ports..."
if netstat -tlnp | grep -q ":3001"; then
    echo "✅ API is listening on port 3001"
else
    echo "❌ API is not listening on port 3001"
    exit 1
fi

if netstat -tlnp | grep -q ":80"; then
    echo "✅ nginx is listening on port 80"
else
    echo "❌ nginx is not listening on port 80"
    exit 1
fi

if netstat -tlnp | grep -q ":443"; then
    echo "✅ nginx is listening on port 443 (HTTPS)"
else
    echo "❌ nginx is not listening on port 443 (HTTPS)"
    exit 1
fi

# Test 3: Test API health endpoint
echo "3️⃣ Testing API health endpoint..."
if curl -s http://localhost:3001/health | grep -q "OK"; then
    echo "✅ API health check passed"
else
    echo "❌ API health check failed"
    exit 1
fi

# Test 4: Test API categories endpoint
echo "4️⃣ Testing API categories endpoint..."
if curl -s http://localhost:3001/api/categories | grep -q "expense"; then
    echo "✅ API categories endpoint working"
else
    echo "❌ API categories endpoint failed"
    exit 1
fi

# Test 5: Test nginx configuration
echo "5️⃣ Testing nginx configuration..."
if nginx -t > /dev/null 2>&1; then
    echo "✅ nginx configuration is valid"
else
    echo "❌ nginx configuration has errors"
    exit 1
fi

# Test 6: Test SSL certificate
echo "6️⃣ Testing SSL certificate..."
if [ -f "/etc/letsencrypt/live/budget.amatin8n.ru/fullchain.pem" ]; then
    echo "✅ SSL certificate exists"
else
    echo "⚠️  SSL certificate not found (may need to be created)"
fi

echo ""
echo "🎉 All tests passed! Your Budget Tracker is ready!"
echo "🌐 Website: https://budget.amatin8n.ru"
echo "🔧 API: https://budget.amatin8n.ru/api/"
echo "🤖 Telegram bot is running in the background"
echo ""
echo "📋 Service management commands:"
echo "  sudo systemctl status budget-tracker-api"
echo "  sudo systemctl status budget-tracker-bot"
echo "  sudo journalctl -u budget-tracker-api -f"
echo "  sudo journalctl -u budget-tracker-bot -f"