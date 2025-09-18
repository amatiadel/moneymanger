#!/bin/bash

# Upload Budget Tracker to Linux Server
# Run this script from your local machine

SERVER_IP="179.61.132.56"
SERVER_USER="root"
REMOTE_DIR="/root/budget-tracker-temp"

echo "🚀 Uploading Budget Tracker to server..."

# Create remote directory
echo "📁 Creating remote directory..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR"

# Upload all files
echo "📤 Uploading files..."
scp -r . $SERVER_USER@$SERVER_IP:$REMOTE_DIR/

echo "✅ Upload completed!"
echo ""
echo "📋 Next steps:"
echo "1. SSH into your server: ssh $SERVER_USER@$SERVER_IP"
echo "2. Navigate to files: cd $REMOTE_DIR"
echo "3. Run deployment: chmod +x deploy.sh && ./deploy.sh"
echo ""
echo "🌐 After deployment, your app will be available at: https://budget.amatin8n.ru"
