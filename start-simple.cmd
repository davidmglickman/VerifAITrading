@echo off
title VerifAI Trading - Development Server
echo.
echo =================================================
echo           VerifAI Trading
echo      AI-Powered Stock Analysis Platform
echo =================================================
echo.

REM Set the PATH to include our portable Node.js
set PATH=%CD%\node-v20.17.0-win-x64;%PATH%

REM Test Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not working properly
    echo Trying to install dependencies...
    .\node-v20.17.0-win-x64\npm.cmd install
)

echo ✅ Node.js ready
echo.

REM Install minimal dependencies if needed
if not exist "node_modules\next" (
    echo 📦 Installing core dependencies...
    .\node-v20.17.0-win-x64\npm.cmd install next@14.2.15 react@18.3.1 react-dom@18.3.1
)

echo 🚀 Starting development server...
echo.
echo The application will be available at:
echo http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server directly
.\node-v20.17.0-win-x64\node.exe .\node_modules\.bin\next dev
