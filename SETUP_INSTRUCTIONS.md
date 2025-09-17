# Budget Tracker - Shared Database Setup

## Problem Solved
Your budget tracker was storing data locally in each user's browser, so users couldn't see each other's data. Now it uses a shared database that all users can access.

## What Changed
1. **Removed localStorage fallbacks** - The app now requires a backend server to work
2. **Added API integration** - All data operations now go through the API
3. **Real-time sync** - Data syncs every 5 seconds between all users
4. **Better error handling** - Clear messages when the server is unavailable

## How to Set Up the Shared Database

### Step 1: Install Node.js
Download and install Node.js from https://nodejs.org/ (any recent version)

### Step 2: Install Backend Dependencies
Open a terminal/command prompt in your project folder and run:
```bash
npm install
```

### Step 3: Start the Backend Server
Run this command to start the shared database server:
```bash
npm start
```

You should see:
```
Budget Tracker API server running on http://localhost:5678
Health check: http://localhost:5678/health
Data file: /path/to/your/project/budget_data.json
```

### Step 4: Open Your Budget Tracker
Open `index.html` in your browser. You should see a success message: "Connected to shared database"

## How It Works Now

### For All Users:
- **Same Data**: All users see the same expenses, income, and budget
- **Real-time Updates**: Changes appear for all users within 5 seconds
- **Shared Categories**: Category additions/deletions are shared
- **Persistent Storage**: Data is saved to `budget_data.json` file

### Data Storage:
- **File**: `budget_data.json` (created automatically)
- **Location**: Same folder as your HTML files
- **Backup**: You can backup this file to save all data

## Troubleshooting

### "API server unavailable" Error
- Make sure the backend server is running (`npm start`)
- Check that port 5678 is not being used by another application
- Refresh your browser page

### Data Not Syncing
- Check the browser console for error messages
- Ensure the backend server is still running
- Try refreshing the page

### Server Won't Start
- Make sure Node.js is installed
- Run `npm install` first
- Check if port 5678 is already in use

## Development Mode
For development with auto-restart on file changes:
```bash
npm run dev
```

## Stopping the Server
Press `Ctrl+C` in the terminal to stop the server.

## Data Backup
The `budget_data.json` file contains all your data. Make regular backups of this file.
