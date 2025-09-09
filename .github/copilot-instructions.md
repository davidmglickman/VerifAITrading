# VerifAI Trading - AI-Powered Stock Analysis Platform

## Project Overview
VerifAI Trading is a modern AI-powered stock swing-trading platform built with Next.js 14, featuring real-time analysis, smart alerts, and comprehensive portfolio management.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Authentication**: Supabase Auth with Google OAuth
- **Database**: Supabase PostgreSQL
- **AI**: OpenAI GPT-4 for stock analysis and recommendations
- **Charts**: TradingView widgets for live market data
- **Email**: SMTP with Gmail Workspace integration
- **APIs**: yfinance, Finnhub for market data

## Key Features
- Google OAuth authentication with Supabase
- AI-powered stock analysis and recommendations
- Real-time price alerts and email notifications
- Interactive TradingView charts
- Personal watchlist management
- News aggregation and AI summarization
- User invite system
- Glassmorphic UI design with custom SVG icons

## Development Guidelines
- Use TypeScript for all components and utilities
- Implement responsive design with Tailwind CSS
- Follow Next.js 14 App Router patterns
- Use Supabase for all database operations
- Integrate OpenAI for analysis features
- Maintain clean component architecture
- Use proper error handling and loading states

## Environment Variables
Required environment variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- OPENAI_API_KEY
- FINNHUB_API_KEY
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- SMTP_SERVER, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD

## Project Structure
- `/app` - Next.js 14 app directory
- `/components` - Reusable UI components
- `/lib` - Utilities and configurations
- `/types` - TypeScript type definitions
- `/public` - Static assets and SVG icons
