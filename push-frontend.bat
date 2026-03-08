@echo off
echo 🚀 Pushing Frontend to GitHub...
cd /d "%~dp0frontend"

git init
git config user.email "godwin@personal-assistant.dev"
git config user.name "Personal Assistant Bot"
git remote add origin https://github.com/Ogunderotamiloluwa/personal-assistant.git 2>nul
git add .
git commit -m "Frontend - React/Vite app with all pages, components, and deployment config"
git branch -M main
git push -u origin main --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Frontend pushed successfully to personal-assistant repo!
) else (
    echo.
    echo ❌ Error pushing frontend. Check your internet connection and GitHub credentials.
)
pause
