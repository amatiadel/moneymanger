@echo off
echo ========================================
echo    Budget Tracker - Complete System
echo ========================================
echo.
echo Starting all services...
echo.

echo [1/3] Starting API Server (Port 5678)...
start "API Server" cmd /k "node server.js"

echo [2/3] Starting Telegram Bot...
start "Telegram Bot" cmd /k "node telegram-bot.js"

echo [3/3] Starting Web Interface (Port 3000)...
start "Web Interface" cmd /k "node static-server.js"

echo.
echo ========================================
echo    All services are starting...
echo ========================================
echo.
echo 🌐 Web Interface: http://localhost:3000
echo 🔧 API Server: http://localhost:5678
echo 🤖 Telegram Bot: Running with token 8432533152:AAH7siLTo-nTsna7TiBYM9ZMiIjgngD0bFc
echo.
echo Press any key to exit this window...
pause > nul
