@echo off
title VerifAI Trading - GitHub Setup
echo.
echo =================================================
echo           VerifAI Trading
echo    Connecting to GitHub Repository
echo =================================================
echo.

echo ✅ Repository URL: https://github.com/davidmglickman/VerifAI-Trading.git
echo.

echo Step 1: Configure Git (if first time)
echo.
set /p username="Enter your GitHub username (davidmglickman): "
if "%username%"=="" set username=davidmglickman
set /p email="Enter your GitHub email: "

git config --global user.name "%username%"
git config --global user.email "%email%"

echo.
echo Step 2: Initialize and connect repository
git init
git remote add origin https://github.com/davidmglickman/VerifAI-Trading.git
git add .
git commit -m "Initial commit - VerifAI Trading Platform"
git branch -M main
git push -u origin main

echo.
echo ✅ Code pushed to GitHub!
echo.
echo Next steps:
echo 1. Go to https://vercel.com/
echo 2. Sign in with GitHub
echo 3. Click "New Project" 
echo 4. Import "VerifAI-Trading" repository
echo 5. Framework: Next.js (auto-detected)
echo 6. Add environment variables from .env.production
echo 7. Deploy!
echo.
echo 🌐 After deployment, set custom domain: trade.verifaitrust.com
echo.
pause
