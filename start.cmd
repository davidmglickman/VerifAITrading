@echo off
title VerifAI Trading - Development Server
echo.
echo =================================================
echo           VerifAI Trading
echo      AI-Powered Stock Analysis Platform
echo =================================================
echo.

REM Check if portable Node.js is available
if exist "node-v20.17.0-win-x64\node.exe" (
    echo ✅ Node.js found (portable): 
    .\node-v20.17.0-win-x64\node.exe --version
    echo ✅ npm found: 
    .\node-v20.17.0-win-x64\npm.cmd --version
    set NODE_CMD=.\node-v20.17.0-win-x64\node.exe
    set NPM_CMD=.\node-v20.17.0-win-x64\npm.cmd
) else (
    REM Check if system Node.js is installed
    node --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Node.js is not installed or not in PATH
        echo.
        echo Please install Node.js first:
        echo 1. Go to https://nodejs.org/en/download/
        echo 2. Download the Windows Installer (LTS version)
        echo 3. Run the installer with default settings
        echo 4. Restart your terminal
        echo 5. Run this script again
        echo.
        pause
        exit /b 1
    )
    
    echo ✅ Node.js found: 
    node --version
    
    REM Check if npm is available
    npm --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ npm is not available
        echo Please reinstall Node.js with npm included
        pause
        exit /b 1
    )
    
    echo ✅ npm found: 
    npm --version
    set NODE_CMD=node
    set NPM_CMD=npm
)
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    echo This may take a few minutes...
    %NPM_CMD% install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        echo Check your internet connection and try again
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
    echo.
) else (
    echo ✅ Dependencies already installed
    echo.
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo ⚠️  Environment file not found
    echo.
    echo Creating .env.local from .env.example...
    copy ".env.example" ".env.local" >nul
    echo.
    echo ❗ IMPORTANT: Please edit .env.local and add your API keys:
    echo   - Supabase URL and keys
    echo   - OpenAI API key
    echo   - Finnhub API key
    echo   - Google OAuth credentials
    echo   - SMTP settings for email
    echo.
    echo The file .env.local has been created with placeholder values.
    echo.
    set /p CONTINUE="Press Enter to continue anyway, or Ctrl+C to exit and configure first: "
) else (
    echo ✅ Environment file found
    echo.
)

echo 🚀 Starting development server...
echo.
echo The application will be available at:
echo http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

%NPM_CMD% run dev
