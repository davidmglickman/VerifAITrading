import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface NewsItem {
  symbol: string
  title: string
  summary: string
  source: string
  published_at: string
  sentiment: 'positive' | 'negative' | 'neutral'
  impact_score: number
  url: string
}

interface WatchlistNewsNotification {
  user_id: string
  email: string
  watchlist_items: Array<{
    symbol: string
    target_price?: number
    stop_loss?: number
  }>
  relevant_news: NewsItem[]
}

export async function POST(request: NextRequest) {
  try {
    const { 
      checkForNews = true, 
      forceNotify = false,
      specific_symbols = null 
    } = await request.json()

    // Get all users with watchlist items and notification preferences
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        news_alerts_enabled,
        last_news_notification
      `)
      .eq('news_alerts_enabled', true)

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`)
    }

    const notifications: WatchlistNewsNotification[] = []

    for (const user of users) {
      // Get user's watchlist
      const { data: watchlist, error: watchlistError } = await supabase
        .from('user_watchlist')
        .select('symbol, target_price, stop_loss')
        .eq('user_id', user.id)

      if (watchlistError || !watchlist?.length) continue

      // Filter by specific symbols if provided
      const relevantSymbols = specific_symbols 
        ? watchlist.filter(item => specific_symbols.includes(item.symbol))
        : watchlist

      if (!relevantSymbols.length) continue

      // Get recent news for watchlist symbols
      const symbolsArray = relevantSymbols.map(item => item.symbol)
      const newsTimeframe = new Date()
      newsTimeframe.setHours(newsTimeframe.getHours() - 4) // Last 4 hours

      const relevantNews = await fetchNewsForSymbols(symbolsArray, newsTimeframe)

      // Only notify if there's significant news or forced notification
      if (relevantNews.length > 0 || forceNotify) {
        notifications.push({
          user_id: user.id,
          email: user.email,
          watchlist_items: relevantSymbols,
          relevant_news: relevantNews
        })
      }
    }

    // Send notifications
    const results = await Promise.allSettled(
      notifications.map(notification => sendWatchlistNewsEmail(notification))
    )

    const successCount = results.filter(result => result.status === 'fulfilled').length
    const failureCount = results.filter(result => result.status === 'rejected').length

    return NextResponse.json({
      success: true,
      notifications_sent: successCount,
      failures: failureCount,
      total_users_checked: users.length
    })

  } catch (error) {
    console.error('News notification error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send news notifications' },
      { status: 500 }
    )
  }
}

async function fetchNewsForSymbols(symbols: string[], since: Date): Promise<NewsItem[]> {
  // Mock news data for now - in production, integrate with real news APIs
  const mockNews: NewsItem[] = [
    {
      symbol: 'AAPL',
      title: 'Apple Reports Strong Q4 Earnings, Beats Revenue Expectations',
      summary: 'Apple Inc. reported quarterly revenue of $89.5 billion, surpassing analyst expectations. iPhone sales showed resilience despite market concerns, with services revenue reaching new highs.',
      source: 'Reuters',
      published_at: new Date().toISOString(),
      sentiment: 'positive',
      impact_score: 8.5,
      url: 'https://news.example.com/apple-earnings'
    },
    {
      symbol: 'TSLA',
      title: 'Tesla Announces Major Supercharger Network Expansion',
      summary: 'Tesla revealed plans to expand its Supercharger network by 40% in 2024, targeting key metropolitan areas. The move is seen as strengthening Tesla\'s competitive moat in EV infrastructure.',
      source: 'Bloomberg',
      published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      impact_score: 7.2,
      url: 'https://news.example.com/tesla-supercharger'
    },
    {
      symbol: 'NVDA',
      title: 'NVIDIA Faces New AI Chip Export Restrictions',
      summary: 'New government regulations may limit NVIDIA\'s ability to export advanced AI chips to certain markets. Analysts express concern about potential revenue impact in key growth segments.',
      source: 'Wall Street Journal',
      published_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      sentiment: 'negative',
      impact_score: 6.8,
      url: 'https://news.example.com/nvidia-restrictions'
    }
  ]

  // Filter news for symbols that are in the watchlist and within timeframe
  return mockNews.filter(news => 
    symbols.includes(news.symbol) && 
    new Date(news.published_at) > since
  )
}

async function sendWatchlistNewsEmail(notification: WatchlistNewsNotification): Promise<void> {
  const { email, watchlist_items, relevant_news } = notification

  if (relevant_news.length === 0) return

  const subject = `📰 Watchlist News Alert - ${relevant_news.length} ${relevant_news.length === 1 ? 'Update' : 'Updates'}`

  const html = createWatchlistNewsEmailHTML(watchlist_items, relevant_news)
  const text = createWatchlistNewsEmailText(watchlist_items, relevant_news)

  await emailService.sendEmail(email, subject, html, text)

  // Update last notification timestamp
  await supabase
    .from('profiles')
    .update({ last_news_notification: new Date().toISOString() })
    .eq('id', notification.user_id)
}

function createWatchlistNewsEmailHTML(
  watchlistItems: Array<{ symbol: string; target_price?: number; stop_loss?: number }>,
  news: NewsItem[]
): string {
  const newsRows = news.map(item => {
    const sentimentColor = item.sentiment === 'positive' ? '#34C759' : 
                          item.sentiment === 'negative' ? '#FF3B30' : '#8E8E93'
    const sentimentEmoji = item.sentiment === 'positive' ? '📈' : 
                          item.sentiment === 'negative' ? '📉' : '➡️'
    
    return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 16px 12px; vertical-align: top;">
          <div style="font-weight: 600; color: #1D1D1F; font-size: 16px; margin-bottom: 4px;">
            ${item.symbol}
          </div>
          <div style="font-size: 14px; color: #6E6E73;">
            Impact: ${item.impact_score}/10
          </div>
        </td>
        <td style="padding: 16px 12px; vertical-align: top;">
          <div style="font-weight: 600; color: #1D1D1F; font-size: 14px; margin-bottom: 6px;">
            ${item.title}
          </div>
          <div style="font-size: 13px; color: #6E6E73; line-height: 1.4; margin-bottom: 6px;">
            ${item.summary}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; color: #8E8E93;">
              ${item.source} • ${new Date(item.published_at).toLocaleTimeString()}
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">
              <span>${sentimentEmoji}</span>
              <span style="color: ${sentimentColor}; font-weight: 600; font-size: 12px;">
                ${item.sentiment.toUpperCase()}
              </span>
            </div>
          </div>
        </td>
      </tr>
    `
  }).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Watchlist News Alert - VerifAI Trading</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">📰 Watchlist News Alert</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">
          ${news.length} ${news.length === 1 ? 'update' : 'updates'} for your watchlist
        </p>
      </div>
      
      <div style="background: #FAFAFA; padding: 30px; border-radius: 0 0 12px 12px;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #E5E5EA;">
          <h3 style="margin: 0 0 16px 0; color: #1D1D1F; font-size: 18px;">📊 Your Watchlist</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${watchlistItems.map(item => `
              <span style="background: #F2F2F7; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 500; color: #1D1D1F;">
                ${item.symbol}
                ${item.target_price ? ` • Target: $${item.target_price}` : ''}
              </span>
            `).join('')}
          </div>
        </div>

        <div style="background: white; padding: 0; border-radius: 8px; border: 1px solid #E5E5EA; overflow: hidden;">
          <div style="background: #F8F9FA; padding: 16px; border-bottom: 1px solid #E5E5EA;">
            <h3 style="margin: 0; color: #1D1D1F; font-size: 18px;">📰 Latest News</h3>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              ${newsRows}
            </tbody>
          </table>
        </div>

        <div style="background: #E8F4FD; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007AFF;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 20px;">🤖</span>
            <strong style="color: #1D1D1F; font-size: 14px;">AI Trading Insight</strong>
          </div>
          <p style="margin: 0; font-size: 14px; color: #6E6E73; line-height: 1.4;">
            Monitor these news developments closely. Consider using stop-losses for swing trades and 
            watch for momentum changes in day trading positions. News sentiment can drive significant 
            price action in the first few hours.
          </p>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${process.env.APP_URL}/dashboard" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; padding: 14px 28px; text-decoration: none; 
                    border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
            View Dashboard & Analysis
          </a>
        </div>

        <div style="background: #F8F9FA; padding: 16px; border-radius: 8px; margin-top: 20px;">
          <p style="margin: 0; font-size: 12px; color: #8E8E93; text-align: center;">
            This is an automated notification based on your watchlist. News updates are sent when 
            significant developments occur for your tracked stocks.
            <br><br>
            To manage your notification preferences, visit your 
            <a href="${process.env.APP_URL}/settings" style="color: #007AFF;">account settings</a>.
          </p>
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #8E8E93; font-size: 12px;">
        <p>© 2024 VerifAI Trading. All rights reserved.</p>
      </div>
    </body>
    </html>
  `
}

function createWatchlistNewsEmailText(
  watchlistItems: Array<{ symbol: string; target_price?: number; stop_loss?: number }>,
  news: NewsItem[]
): string {
  const newsText = news.map(item => `
${item.symbol} - ${item.sentiment.toUpperCase()} (Impact: ${item.impact_score}/10)
${item.title}
${item.summary}
Source: ${item.source} | ${new Date(item.published_at).toLocaleString()}
---
  `).join('\n')

  return `
VerifAI Trading - Watchlist News Alert

Your Watchlist: ${watchlistItems.map(item => item.symbol).join(', ')}

Latest News Updates:
${newsText}

AI Trading Insight:
Monitor these news developments closely. Consider using stop-losses for swing trades and watch for momentum changes in day trading positions. News sentiment can drive significant price action in the first few hours.

View your dashboard: ${process.env.APP_URL}/dashboard
Manage preferences: ${process.env.APP_URL}/settings

© 2024 VerifAI Trading
  `
}
