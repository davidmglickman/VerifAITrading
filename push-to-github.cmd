@echo off
echo =================================================
echo           VerifAI Trading
echo      Push to GitHub Repository
echo =================================================
echo.

echo Configuring Git...
git config --global user.name "davidmglickman"
git config --global user.email "davidmglickman1@gmail.com"

echo.
echo Initializing repository...
git init

echo.
echo Adding remote repository...
git remote add origin https://github.com/davidmglickman/VerifAI-Trading.git

echo.
echo Adding files...
git add .

echo.
echo Creating commit...
git commit -m "Initial commit - VerifAI Trading Platform"

echo.
echo Setting main branch...
git branch -M main

echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo ✅ SUCCESS! Code pushed to GitHub
echo.
echo Next steps:
echo 1. Go to https://vercel.com/
echo 2. Sign in with GitHub
echo 3. Import "VerifAI-Trading" repository
echo 4. Deploy to trade.verifaitrust.com
echo.
pause
