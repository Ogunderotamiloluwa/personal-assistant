#!/bin/bash
# Windows version of verification script

@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo Personal Assistant - Quick Setup (Windows)
echo ==========================================
echo.

echo Step 1: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo   ✅ Node.js found
    node --version
) else (
    echo   ❌ Node.js NOT found - Download from nodejs.org
    pause
    exit /b 1
)

echo.
echo Step 2: Install backend dependencies
cd backend
if exist "node_modules" (
    echo   ✅ Backend dependencies already installed
) else (
    echo   Installing backend dependencies...
    call npm install
    echo   ✅ Done
)
cd ..

echo.
echo Step 3: Install frontend dependencies
cd frontend
if exist "node_modules" (
    echo   ✅ Frontend dependencies already installed
) else (
    echo   Installing frontend dependencies...
    call npm install
    echo   ✅ Done
)
cd ..

echo.
echo ==========================================
echo Setup Complete! 🎉
echo ==========================================
echo.
echo To start the application:
echo.
echo   Option 1 - Click both batch files:
echo     1. Start the backend: double-click restart-backend.bat
echo     2. Start the frontend: double-click start-frontend.bat
echo.
echo   Option 2 - Manual in terminals:
echo     Terminal 1: cd backend ^&^& node server.js
echo     Terminal 2: cd frontend ^&^& npm run dev
echo.
echo Then open: http://localhost:5173
echo.
echo Test the updates:
echo   1. Try chat: "Tell me about my habits"
echo   2. Try chat: "Give me productivity tips"
echo   3. Mobile: Press F12 ^-> Ctrl+Shift+M ^-> Select iPhone SE
echo.
pause
