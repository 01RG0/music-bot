@echo off
echo ============================================
echo     Discord Music Bot - Service Status
echo ============================================
echo.

REM Check Lavalink
echo 🎵 Lavalink Status:
docker ps | findstr "lavalink" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Lavalink is running
    for /f "tokens=*" %%i in ('docker ps --filter "name=lavalink" --format "{{.Ports}}"') do echo    Ports: %%i
) else (
    echo ❌ Lavalink is not running
)
echo.

REM Check Node.js processes
echo 🤖 Node.js Services:
tasklist /fi "imagename eq node.exe" /nh | findstr "node.exe" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js processes are running
    tasklist /fi "imagename eq node.exe" /nh
) else (
    echo ❌ No Node.js processes found
)
echo.

REM Check ports
echo 🌐 Port Status:
netstat -an | findstr ":3000" >nul 2>&1 && echo ✅ Port 3000 (Web): Open || echo ❌ Port 3000 (Web): Closed
netstat -an | findstr ":4000" >nul 2>&1 && echo ✅ Port 4000 (API): Open || echo ❌ Port 4000 (API): Closed
netstat -an | findstr ":2333" >nul 2>&1 && echo ✅ Port 2333 (Lavalink): Open || echo ❌ Port 2333 (Lavalink): Closed
echo.

REM Check environment
echo ⚙️  Environment:
if exist ".env" (
    echo ✅ .env file exists
) else (
    echo ❌ .env file missing
)

if exist "node_modules" (
    echo ✅ Dependencies installed
) else (
    echo ❌ Dependencies not installed
)
echo.

echo ============================================
echo             Status check complete
echo ============================================
pause
