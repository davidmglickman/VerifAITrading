# VerifAI Trading - AI-Powered Stock Analysis Platform

🚀 **Live Site**: https://verif-ai-trading.vercel.app

Updated: September 9, 2025 - Deployment Trigger

A modern Next.js application that provides AI-powered stock analysis, real-time alerts, and comprehensive portfolio management.

## Features

- 🤖 **AI-Powered Analysis**: Advanced OpenAI integration for stock recommendations and market insights
- 📊 **Real-Time Data**: Live stock quotes and market data via Finnhub API
- 🔔 **Smart Alerts**: Price targets, volume spikes, and news-based notifications
- 📧 **Email Notifications**: SMTP integration for alert delivery
- 🔐 **Secure Authentication**: Supabase Auth with Google OAuth support
- 📱 **Responsive Design**: Modern glassmorphic UI with Tailwind CSS
- 📈 **TradingView Integration**: Interactive charts and market visualization
- ⚡ **High Performance**: Built with Next.js 14 and App Router

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Supabase account** - [Sign up here](https://supabase.com/)
- **OpenAI API key** - [Get one here](https://platform.openai.com/)
- **Finnhub API key** - [Register here](https://finnhub.io/)
- **Google OAuth credentials** - [Google Cloud Console](https://console.cloud.google.com/)
- **Gmail/SMTP settings** for email notifications

## Quick Start

### 1. Install Node.js (if not already installed)

**Windows:**
```cmd
# Run the included installation helper
install-nodejs.cmd
```

**Or download directly:**
- Go to https://nodejs.org/en/download/
- Download the Windows Installer (LTS version)
- Run the installer with default settings
- Restart your terminal

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Finnhub API Configuration
FINNHUB_API_KEY=your_finnhub_api_key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# SMTP Configuration (Gmail)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_gmail_email
SMTP_PASSWORD=your_gmail_app_password

# Application URLs
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
APP_URL=http://localhost:3000
```

### 4. Database Setup

The application uses Supabase as the database. You'll need to:

1. Create a new Supabase project
2. Set up the required tables (see `Database Schema` below)
3. Configure Row Level Security (RLS) policies
4. Enable Google OAuth in Supabase Auth settings

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Database Schema

Required Supabase tables:

```sql
-- Users table (auto-created by Supabase Auth)

-- User watchlist
CREATE TABLE user_watchlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    target_price DECIMAL(10,2),
    stop_loss DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts
CREATE TABLE alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('price_target', 'stop_loss', 'volume_spike', 'news')),
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2),
    message TEXT NOT NULL,
    is_triggered BOOLEAN DEFAULT FALSE,
    is_email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    triggered_at TIMESTAMP WITH TIME ZONE
);

-- AI Analysis
CREATE TABLE ai_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    analysis_type VARCHAR(20) NOT NULL CHECK (analysis_type IN ('technical', 'fundamental', 'sentiment', 'comprehensive')),
    recommendation VARCHAR(10) NOT NULL CHECK (recommendation IN ('buy', 'sell', 'hold')),
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
    key_points TEXT[],
    price_target DECIMAL(10,2),
    time_horizon VARCHAR(10) CHECK (time_horizon IN ('1d', '1w', '1m', '3m', '6m', '1y')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News items
CREATE TABLE news_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol VARCHAR(10),
    title TEXT NOT NULL,
    summary TEXT,
    url TEXT,
    source VARCHAR(100),
    published_at TIMESTAMP WITH TIME ZONE,
    sentiment VARCHAR(10) CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Keys Setup Guide

### Supabase
1. Go to [supabase.com](https://supabase.com/) and create a new project
2. In your project dashboard, go to Settings > API
3. Copy the Project URL and anon public key
4. Copy the service_role secret key (be careful with this one!)

### OpenAI
1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new secret key
5. Copy the key (starts with sk-)

### Finnhub
1. Go to [finnhub.io](https://finnhub.io/)
2. Sign up for a free account
3. Go to your dashboard
4. Copy your API key

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
5. Set application type to "Web application"
6. Add authorized redirect URIs: `http://localhost:3000/auth/callback/google`
7. Copy Client ID and Client Secret

### Gmail SMTP
1. Enable 2-factor authentication on your Gmail account
2. Generate an app-specific password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate password for "Mail"
   - Use this password in SMTP_PASSWORD

## Project Structure

```
├── app/                    # Next.js 14 App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── lib/                   # Utility libraries
│   ├── supabase.ts        # Supabase client and helpers
│   ├── openai.ts          # OpenAI integration
│   ├── market-data.ts     # Market data service
│   └── email.ts           # Email service
├── components/            # Reusable components (to be added)
├── types/                 # TypeScript definitions (to be added)
└── public/               # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import your repository on [vercel.com](https://vercel.com/)
3. Add all environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Troubleshooting

### Common Issues

**Node.js not found:**
- Make sure Node.js is installed and in your PATH
- Restart your terminal after installation
- Run `node --version` to verify

**Module not found errors:**
- Run `npm install` to install dependencies
- Delete `node_modules` and `package-lock.json`, then run `npm install`

**Supabase connection issues:**
- Verify your Supabase URL and keys
- Check if your database tables are created
- Ensure RLS policies are properly configured

**API key errors:**
- Double-check all API keys in your `.env.local` file
- Make sure keys don't have extra spaces or quotes
- Verify API key permissions and quotas

**Email sending fails:**
- Verify Gmail SMTP settings
- Use app-specific password for Gmail
- Check firewall/antivirus blocking SMTP ports

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the troubleshooting section above
- Review the setup guide carefully
- Ensure all API keys are correctly configured
- Verify your environment variables

## Roadmap

- [ ] Portfolio performance tracking
- [ ] Advanced charting and technical indicators
- [ ] Social sentiment analysis
- [ ] Mobile app development
- [ ] Paper trading simulation
- [ ] Advanced risk management tools
