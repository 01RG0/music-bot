@echo off
echo ============================================
echo  Discord Music Bot - Setup (Cloud Lavalink)
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js installed
echo.

REM Setup environment file
echo 📝 Setting up environment file...
if not exist ".env" (
    copy env.example .env
    echo ✅ Created .env file from template
    echo.
    echo ⚠️  IMPORTANT: Please edit .env file and fill in your values:
    echo    - DISCORD_TOKEN (from Discord Developer Portal)
    echo    - DISCORD_CLIENT_ID (from Discord Developer Portal)
    echo    - DISCORD_CLIENT_SECRET (from Discord Developer Portal)
    echo    - MONGODB_URI (from MongoDB Atlas or local MongoDB)
    echo.
    echo 🔗 For Lavalink, you can use a FREE public Lavalink server:
    echo    LAVALINK_HOST=lavalink.darrennathanael.com
    echo    LAVALINK_PORT=80
    echo    LAVALINK_PASSWORD=maybeiwasboring
    echo    LAVALINK_SECURE=false
    echo.
    echo Press any key to open .env file for editing...
    pause >nul
    notepad .env
) else (
    echo ✅ .env file already exists
)

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo 🎉 Setup complete (Cloud Lavalink)!
echo.
echo This setup uses a FREE public Lavalink server.
echo For production, consider running your own Lavalink instance.
echo.
echo Next steps:
echo 1. Edit your .env file with your Discord bot credentials
echo 2. Use the Lavalink settings provided above (or find others)
echo 3. Create a MongoDB database (Atlas recommended)
echo 4. Run 'start-cloud.bat' to launch the application
echo 5. Invite your bot to a Discord server
echo.
echo Useful commands:
echo - start-cloud.bat : Start services (cloud Lavalink)
echo - stop.bat        : Stop all services
echo - status.bat      : Check service status
echo.

pause
