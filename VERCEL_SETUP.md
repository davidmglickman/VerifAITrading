#!/bin/bash

echo "==================================================="
echo "           VerifAI Trading"
echo "        GitHub & Vercel Setup"
echo "==================================================="
echo ""

echo "📋 Manual Setup Steps:"
echo ""
echo "1. CREATE GITHUB REPOSITORY:"
echo "   - Go to https://github.com/new"
echo "   - Repository name: verifai-trading"
echo "   - Make it private"
echo "   - Don't initialize with README"
echo ""

echo "2. PUSH TO GITHUB:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/verifai-trading.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""

echo "3. DEPLOY TO VERCEL:"
echo "   - Go to https://vercel.com/"
echo "   - Sign in with GitHub"
echo "   - Click 'New Project'"
echo "   - Import your verifai-trading repository"
echo "   - Set framework to Next.js"
echo "   - Add environment variables (from .env.production)"
echo ""

echo "4. CUSTOM DOMAIN:"
echo "   - In Vercel dashboard, go to Domains"
echo "   - Add: trade.verifaitrust.com"
echo "   - Follow DNS setup instructions"
echo ""

echo "🔧 Your environment variables to add in Vercel:"
cat .env.production

echo ""
echo "🎉 After deployment, update Google OAuth with:"
echo "   https://trade.verifaitrust.com/auth/callback"
echo ""
