@echo off
echo 🚀 Pushing Root Files to Frontend Repo...
cd /d "%~dp0"

REM Initialize root directory git repo
git init
git config user.email "godwin@personal-assistant.dev"
git config user.name "Personal Assistant Bot"
git remote add origin https://github.com/Ogunderotamiloluwa/personal-assistant.git 2>nul

REM Add only root files (not backend folder)
git add .gitignore quick-setup.bat restart-backend.bat start-frontend.bat start.sh verify-deployment.sh netlify.toml .env.example 2>nul
git add README.md DEPLOYMENT_GUIDE.md DEPLOYMENT_READY.md API_VERIFICATION.md 2>nul

git commit -m "Root - Setup scripts, deployment configs, and documentation"
git branch -M main
git push -u origin main --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Root files pushed successfully!
) else (
    echo.
    echo ⚠️ Some files may already exist in the repo.
)
