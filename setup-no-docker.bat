@echo off
echo ============================================
echo  Discord Music Bot - Setup (No Docker)
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

REM Check if Java is installed (for Lavalink)
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Java is not installed!
    echo Please install Java from https://adoptium.net/
    echo Or download from: https://java.com
    echo.
    echo Lavalink requires Java 11 or higher
    pause
    exit /b 1
)

REM Check Java version
echo ✅ Java found, checking version...
java -version 2>&1 | findstr "version" > temp_java_version.txt
set /p JAVA_VERSION=<temp_java_version.txt
del temp_java_version.txt
echo Java Version: %JAVA_VERSION%

REM Setup environment file
echo.
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
    echo Press any key to open .env file for editing...
    pause >nul
    notepad .env
) else (
    echo ✅ .env file already exists
)

REM Setup Lavalink manually
echo.
echo 🎵 Setting up Lavalink (without Docker)...
if not exist "lavalink" (
    mkdir lavalink
    echo ✅ Created lavalink directory
)

cd lavalink

REM Download Lavalink JAR if it doesn't exist
if not exist "Lavalink.jar" (
    echo 📥 Downloading Lavalink.jar...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/lavalink-devs/Lavalink/releases/download/4.0.1/Lavalink.jar' -OutFile 'Lavalink.jar'"
    if %errorlevel% neq 0 (
        echo ❌ Failed to download Lavalink.jar
        echo Please download manually from:
        echo https://github.com/lavalink-devs/Lavalink/releases/download/4.0.1/Lavalink.jar
        echo And place it in the lavalink/ folder
        cd ..
        pause
        exit /b 1
    )
    echo ✅ Lavalink.jar downloaded
)

REM Check if application.yml exists
if not exist "application.yml" (
    echo ❌ application.yml not found in lavalink folder
    cd ..
    pause
    exit /b 1
)

cd ..

REM Install dependencies
echo.
echo 📦 Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo 🎉 Setup complete (No Docker version)!
echo.
echo Next steps:
echo 1. Edit your .env file with your Discord bot credentials
echo 2. Create a MongoDB database (Atlas recommended)
echo 3. Run 'start-no-docker.bat' to launch the application
echo 4. Invite your bot to a Discord server
echo.
echo Useful commands:
echo - start-no-docker.bat : Start all services (no Docker)
echo - stop.bat           : Stop all services
echo - status.bat         : Check service status
echo.

pause
