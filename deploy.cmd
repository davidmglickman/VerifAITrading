@echo off
title VerifAI Trading - Vercel Deployment
echo.
echo =================================================
echo           VerifAI Trading
echo         Vercel Deployment Script
echo =================================================
echo.

echo ✅ Installing Vercel CLI globally...
npm install -g vercel

echo.
echo ✅ Building production version...
npm run build

echo.
echo ✅ Deploying to Vercel...
echo.
echo 📋 When prompted:
echo    - Project name: verifai-trading
echo    - Deploy to: trade.verifaitrust.com
echo    - Framework: Next.js
echo.

vercel --prod

echo.
echo 🎉 Deployment complete!
echo.
echo 📝 Next steps:
echo 1. Set up custom domain: trade.verifaitrust.com
echo 2. Configure environment variables in Vercel dashboard
echo 3. Update Google OAuth redirect URIs
echo 4. Update Supabase site URL
echo.
pause
