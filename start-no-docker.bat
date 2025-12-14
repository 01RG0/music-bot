@echo off
echo ============================================
echo   Discord Music Bot - Start (No Docker)
echo ============================================
echo.

REM Check prerequisites (skip Docker check)
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Java is not installed!
    echo Please install Java from https://adoptium.net/
    pause
    exit /b 1
)

if not exist ".env" (
    echo ❌ ERROR: .env file not found!
    echo Please run 'setup-no-docker.bat' first
    pause
    exit /b 1
)

REM Check if Lavalink JAR exists
if not exist "lavalink\Lavalink.jar" (
    echo ❌ ERROR: Lavalink.jar not found!
    echo Please run 'setup-no-docker.bat' first
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

REM Start Lavalink manually in background
echo 🎵 Starting Lavalink server (Java)...
cd lavalink
start /B "Lavalink" java -jar Lavalink.jar > lavalink.log 2>&1
cd ..

REM Wait a bit for Lavalink to start
echo Waiting for Lavalink to initialize...
timeout /t 10 /nobreak >nul

REM Check if Lavalink is running
netstat -an | findstr ":2333" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Lavalink server started on port 2333
) else (
    echo ⚠️  Lavalink may not have started properly
    echo Check lavalink/lavalink.log for errors
)
echo.

REM Start all Node.js services
echo 🚀 Starting Node.js services...
echo.
echo Services starting:
echo - 🤖 Discord Bot (apps/bot)
echo - 🌐 API Server (apps/api)
echo - 💻 Web Dashboard (apps/web)
echo.

npm run dev

echo.
echo ============================================
echo         All services have stopped
echo ============================================
pause
