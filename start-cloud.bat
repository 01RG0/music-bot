@echo off
echo ============================================
echo  Discord Music Bot - Start (Cloud Lavalink)
echo ============================================
echo.

REM Check prerequisites (skip Docker and Java checks)
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

if not exist ".env" (
    echo ❌ ERROR: .env file not found!
    echo Please run 'setup-cloud.bat' first
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)
echo.

REM Show Lavalink info
echo 🌐 Using Cloud Lavalink Service
echo This setup uses a public Lavalink server.
echo For production use, consider self-hosting Lavalink.
echo.

REM Start all Node.js services
echo 🚀 Starting Node.js services...
echo.
echo Services starting:
echo - 🤖 Discord Bot (apps/bot)
echo - 🌐 API Server (apps/api)
echo - 💻 Web Dashboard (apps/web)
echo.
echo Lavalink: Using cloud service (no local Lavalink needed)
echo.

npm run dev

echo.
echo ============================================
echo         All services have stopped
echo ============================================
pause
