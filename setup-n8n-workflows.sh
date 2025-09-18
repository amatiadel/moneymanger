#!/bin/bash

# Setup script for n8n workflows
# Run this script on your Ubuntu server after n8n is installed

set -e

echo "🤖 Setting up n8n workflows for Budget Tracker Telegram Bot..."

# Check if n8n is running
if ! curl -s http://localhost:5678/healthz > /dev/null; then
    echo "❌ n8n is not running on port 5678. Please start n8n first."
    exit 1
fi

# Create n8n workflows directory
mkdir -p ~/n8n-workflows
cd ~/n8n-workflows

# Copy workflow file
cp n8n-workflows/telegram-bot-workflow.json ./

echo "📋 Workflow file copied to ~/n8n-workflows/"

# Create n8n credentials setup instructions
cat > n8n-setup-instructions.md << 'EOF'
# n8n Setup Instructions for Budget Tracker Telegram Bot

## 1. Create Telegram Bot

1. Open Telegram and search for @BotFather
2. Send `/newbot` command
3. Follow the instructions to create a new bot
4. Save the bot token (you'll need it for n8n credentials)

## 2. Configure n8n Credentials

1. Open n8n web interface: http://your-server-ip:5678
2. Go to Settings > Credentials
3. Click "Add Credential"
4. Search for "Telegram" and select "Telegram API"
5. Enter your bot token from step 1
6. Save the credential with name "Telegram Bot API"

## 3. Import Workflow

1. In n8n, go to Workflows
2. Click "Import from file"
3. Select the file: ~/n8n-workflows/telegram-bot-workflow.json
4. The workflow will be imported with all nodes

## 4. Configure Webhook URLs

The workflow uses Telegram webhooks. You need to:

1. Set up a webhook URL for your bot (if not using polling)
2. Update the webhook URL in the Telegram nodes if needed

## 5. Test the Bot

1. Activate the workflow in n8n
2. Send `/start` to your bot in Telegram
3. Follow the conversation flow to add income/expenses

## 6. Bot Commands

- `/start` - Start the conversation flow
- `/skip` - Skip description when adding entries

## 7. Workflow Features

- Interactive conversation flow
- Category selection from website database
- Amount validation
- Optional description
- Automatic data saving to website database
- Success/error confirmation
- Multi-user support (all users see same data)

## 8. Troubleshooting

- Check n8n logs if bot doesn't respond
- Verify API credentials are correct
- Ensure budget tracker API is accessible
- Check that all webhook URLs are correct
EOF

echo "📖 Setup instructions created: ~/n8n-workflows/n8n-setup-instructions.md"

# Create a simple test script
cat > test-bot.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing Budget Tracker API connection..."

# Test API health
if curl -s https://budget.amatin8n.ru/health | grep -q "OK"; then
    echo "✅ API is healthy"
else
    echo "❌ API health check failed"
    exit 1
fi

# Test categories endpoint
if curl -s https://budget.amatin8n.ru/api/categories | grep -q "expense"; then
    echo "✅ Categories endpoint working"
else
    echo "❌ Categories endpoint failed"
    exit 1
fi

# Test adding a sample expense
SAMPLE_DATA='{
  "amount": 100,
  "category": "тест",
  "description": "Test from bot",
  "addedBy": "test-user",
  "date": "'$(date +%Y-%m-%d)'"
}'

if curl -s -X POST https://budget.amatin8n.ru/api/expenses \
  -H "Content-Type: application/json" \
  -d "$SAMPLE_DATA" | grep -q "id"; then
    echo "✅ Expense creation working"
else
    echo "❌ Expense creation failed"
    exit 1
fi

echo "🎉 All API tests passed! The bot should work correctly."
EOF

chmod +x test-bot.sh

echo "🧪 Test script created: ~/n8n-workflows/test-bot.sh"

echo ""
echo "✅ n8n workflow setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Read the setup instructions: cat ~/n8n-workflows/n8n-setup-instructions.md"
echo "2. Create a Telegram bot with @BotFather"
echo "3. Configure credentials in n8n"
echo "4. Import the workflow"
echo "5. Test with: ~/n8n-workflows/test-bot.sh"
echo ""
echo "🌐 n8n interface: http://179.61.132.56:5678"
echo "🤖 Your bot will be available once configured"
