# Budget Tracker - Shared Database Setup

## 🚀 Quick Start

### Option 1: Using the Batch File (Windows)
1. Double-click `start-server.bat`
2. Open your browser and go to `http://localhost:5678`
3. The server will keep running until you press Ctrl+C

### Option 2: Manual Start
1. Open Command Prompt or PowerShell in this folder
2. Run: `node server.js`
3. Open your browser and go to `http://localhost:5678`

## 📋 Requirements
- Node.js installed on your computer
- Dependencies installed: `npm install`

## 🔄 How It Works
- **Shared Database**: All users see the same data
- **Real-time Updates**: Data syncs every 5 seconds automatically
- **File Storage**: Data is stored in `budget_data.json`
- **Port**: Server runs on port 5678

## 👥 For Multiple Users
1. **One person starts the server** (using either method above)
2. **All other users** open `http://localhost:5678` in their browsers
3. **Everyone sees the same data** and can add/edit expenses and income
4. **Changes appear for everyone** within 5 seconds

## 🛑 Stopping the Server
- Press `Ctrl+C` in the terminal where the server is running
- Or close the terminal window

## 📁 Data File
- All data is stored in `budget_data.json`
- This file is automatically created when you first start the server
- You can backup this file to save your data

## ⚠️ Important Notes
- **Keep the server running** for others to access the shared data
- **Only one server** should be running at a time
- **Data is shared** - everyone can see and modify the same budget data
- **Export/Import** is disabled when using shared database mode

## 🔧 Troubleshooting
- **"Cannot connect to database"**: Make sure the server is running
- **Port already in use**: Close other applications using port 5678
- **Data not syncing**: Check if the server is still running
