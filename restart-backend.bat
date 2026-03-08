@echo off
REM Personal Assistant - Backend Restart Script
REM Kills all node processes and restarts the backend server

echo.
echo ========================================
echo Personal Assistant - Backend Restart
echo ========================================
echo.

echo [STEP 1] Checking for running node processes...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo   Found node processes. Killing...
    taskkill /IM node.exe /F /T 2>nul
    echo   ✅ Node processes killed
) else (
    echo   No node processes found
)

echo.
echo [STEP 2] Waiting 2 seconds for port to be released...
timeout /t 2 /nobreak

echo.
echo [STEP 3] Starting backend server...
echo.
cd /d "%~dp0backend"
if exist "server.js" (
    node server.js
) else (
    echo ERROR: server.js not found!
    echo Make sure you're running this script from the project root folder.
    pause
    exit /b 1
)
