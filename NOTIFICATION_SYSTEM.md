# VerifAI Trading - Notification Cron Jobs

This document describes the automated notification system for VerifAI Trading.

## Notification Types

### 1. Watchlist News Notifications
- **Endpoint**: `/api/notifications/news-watchlist`
- **Frequency**: Every 2 hours during market hours (9:30 AM - 4:00 PM ET)
- **Purpose**: Send email alerts when significant news affects stocks in user watchlists

### 2. Profit-Taking Alerts
- **Endpoint**: `/api/notifications/profit-taking`
- **Frequency**: Every 1 hour during market hours
- **Purpose**: Send AI-powered recommendations for profit-taking on swing and day trades

### 3. Automated Batch Processing
- **Endpoint**: `/api/notifications/automated`
- **Frequency**: Every 30 minutes during market hours
- **Purpose**: Orchestrates all notification types

## Cron Schedule Examples

### Using Vercel Cron (vercel.json)
```json
{
  "crons": [
    {
      "path": "/api/notifications/automated",
      "schedule": "*/30 9-16 * * 1-5"
    }
  ]
}
```

### Using External Cron Service
```bash
# Every 30 minutes during market hours (Mon-Fri, 9:30 AM - 4:00 PM ET)
*/30 9-16 * * 1-5 curl -X POST https://your-domain.com/api/notifications/automated

# News notifications every 2 hours
0 */2 * * 1-5 curl -X POST https://your-domain.com/api/notifications/news-watchlist

# Profit alerts every hour
0 * * * 1-5 curl -X POST https://your-domain.com/api/notifications/profit-taking
```

## Manual Testing

Test the notification system manually:

```bash
# Test all notifications
curl -X GET "https://your-domain.com/api/notifications/automated?test=true"

# Test news notifications only
curl -X POST https://your-domain.com/api/notifications/news-watchlist \
  -H "Content-Type: application/json" \
  -d '{"forceNotify": true}'

# Test profit-taking alerts only
curl -X POST https://your-domain.com/api/notifications/profit-taking \
  -H "Content-Type: application/json" \
  -d '{"profit_threshold_percent": 3}'
```

## Environment Variables Required

```env
# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Database
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
APP_URL=https://your-domain.com
```

## Notification Features

### Watchlist News Alerts
- Monitors news for stocks in user watchlists
- AI sentiment analysis (positive/negative/neutral)
- Impact scoring (1-10 scale)
- Smart filtering to avoid spam
- Email templates with Apple-style design

### Profit-Taking Recommendations
- Separate strategies for day trading vs swing trading
- Risk-reward ratio calculations
- Confidence scoring
- Position-specific recommendations:
  - Take full profit
  - Take partial profit
  - Add stop-loss
  - Trail stop
  - Hold position

### Smart Features
- User preference controls
- Notification frequency limits
- Market hours awareness
- Risk level customization
- Performance tracking

## Database Schema Updates Needed

Add these columns to the `profiles` table:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS news_alerts_enabled BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profit_alerts_enabled BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_news_notification TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_profit_notification TIMESTAMP;
```

## Integration with Trading Platforms

Future enhancements will include:
- Real portfolio data from brokers
- Live position tracking
- Actual profit/loss calculations
- Real-time news feeds
- Social sentiment analysis
- Technical indicator integration
