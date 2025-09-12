# 🚀 VerifAI Trading - Auto-Deploy Setup Guide

## Overview
This guide will help you set up automatic deployment to Vercel whenever you push to your GitHub repository.

## Prerequisites
✅ GitHub repository created: `davidmglickman/VerifAITrading`  
✅ Vercel CLI installed  
✅ Code committed and pushed to GitHub  

## Setup Steps

### 1. **Link Project to Vercel**

Run this command and follow the prompts:

```bash
npx vercel
```

When prompted:
- **Set up project?** → `Y`
- **Which scope?** → Choose your personal account
- **Found GitHub repository?** → `Y` (should detect davidmglickman/VerifAITrading)
- **Link to existing project?** → `N` (create new)
- **Project name** → `verifai-trading` (or keep default)
- **Directory** → `.` (current directory)
- **Override settings?** → `N` (use vercel.json)

### 2. **Configure Auto-Deploy**

After linking, Vercel will automatically:
- ✅ Deploy on every push to `main` branch
- ✅ Create preview deployments for other branches
- ✅ Use your `vercel.json` configuration
- ✅ Set up the automated cron jobs for notifications

### 3. **Set Environment Variables**

In Vercel Dashboard (https://vercel.com/dashboard):

1. Go to your project → Settings → Environment Variables
2. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
FINNHUB_API_KEY=your_finnhub_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
APP_URL=https://your-project.vercel.app
```

### 4. **Update OAuth Callback URLs**

After deployment, update your Google OAuth settings:
- **Authorized redirect URI**: `https://your-project.vercel.app/auth/callback`

### 5. **Test Auto-Deploy**

Make a small change and push to test:

```bash
git add .
git commit -m "test: trigger auto-deploy"
git push origin verifai-clean3
```

## Current Branch Strategy

- **Production**: `main` branch → Auto-deploys to production
- **Development**: `verifai-clean3` branch → Auto-deploys to preview URL
- **Features**: Other branches → Preview deployments

## Deployment Features

Your `vercel.json` includes:

✅ **Next.js Framework Detection**  
✅ **Automatic Build Process**  
✅ **Environment Variable Management**  
✅ **API Route Optimization** (30s timeout)  
✅ **Automated Notifications** (Cron: Every 30min, 9-4 PM, weekdays)  

## Useful Commands

```bash
# Check deployment status
npx vercel ls

# View logs
npx vercel logs

# Manual deployment
npx vercel --prod

# Promote preview to production
npx vercel promote [preview-url]
```

## Branch-Based Deployments

- **Main Branch** → Production deployment
- **Feature Branches** → Preview deployments with unique URLs
- **Pull Requests** → Automatic preview deployments

## Monitoring

Monitor your deployments at:
- **Dashboard**: https://vercel.com/dashboard
- **Analytics**: Built-in performance monitoring
- **Logs**: Real-time function logs

---

🎉 **Once set up, every git push will automatically deploy to Vercel!**
