@echo off
echo ============================================
echo      Discord Music Bot - Stop Services
echo ============================================
echo.

REM Stop Lavalink
echo 🛑 Stopping Lavalink server...
cd lavalink
docker-compose down >nul 2>&1
cd ..
echo ✅ Lavalink server stopped
echo.

REM Kill Node.js processes
echo 🛑 Stopping Node.js services...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im tsx.exe >nul 2>&1
taskkill /f /im vite.exe >nul 2>&1
echo ✅ Node.js services stopped
echo.

echo ============================================
echo         All services stopped
echo ============================================
pause
