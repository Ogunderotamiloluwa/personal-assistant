@echo off
echo 🚀 Pushing Backend to GitHub...
cd /d "%~dp0backend"

git init
git config user.email "godwin@personal-assistant.dev"
git config user.name "Personal Assistant Bot"
git remote add origin https://github.com/Ogunderotamiloluwa/persona-assistant-backend.git 2>nul
git add .
git commit -m "Backend API - Controllers, routes, auth, database integration, and MongoDB schema"
git branch -M main
git push -u origin main --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Backend pushed successfully to persona-assistant-backend repo!
) else (
    echo.
    echo ❌ Error pushing backend. Check your internet connection and GitHub credentials.
)
pause
