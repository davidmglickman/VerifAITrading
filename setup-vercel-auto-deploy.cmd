@echo off
echo ===================================================
echo            VerifAI Trading
echo         Auto-Deploy Setup Script
echo ===================================================
echo.

echo 🚀 Setting up automatic deployment to Vercel...
echo.

echo Step 1: Linking project to Vercel...
echo Running: npx vercel
echo.
echo Please follow the prompts:
echo   - Set up project? → Y
echo   - Which scope? → Choose your account
echo   - Link to existing project? → N (create new)
echo   - Project name → verifai-trading
echo   - Directory → . (current)
echo   - Override settings? → N
echo.

npx vercel

echo.
echo ✅ Project linked to Vercel!
echo.

echo 📋 Next steps:
echo.
echo 1. Go to https://vercel.com/dashboard
echo 2. Find your project and go to Settings → Environment Variables
echo 3. Add all your environment variables from .env.local
echo 4. Update Google OAuth callback URL to your Vercel domain
echo.

echo 🎉 Auto-deploy is now configured!
echo Every push to GitHub will automatically deploy to Vercel.
echo.

echo Press any key to continue...
pause >nul
