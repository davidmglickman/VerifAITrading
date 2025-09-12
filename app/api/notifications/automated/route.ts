import { NextRequest, NextResponse } from 'next/server'

// This endpoint will be called by a cron job service (like Vercel Cron or external service)
// to automatically send watchlist news notifications and profit-taking alerts

export async function POST(request: NextRequest) {
  try {
    const { 
      send_news_notifications = true,
      send_profit_alerts = true,
      force_notify = false 
    } = await request.json()

    const results = {
      news_notifications: null as any,
      profit_alerts: null as any,
      total_success: 0,
      total_failures: 0
    }

    // Send watchlist news notifications
    if (send_news_notifications) {
      try {
        const newsResponse = await fetch(`${process.env.APP_URL}/api/notifications/news-watchlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            checkForNews: true, 
            forceNotify: force_notify 
          })
        })
        
        results.news_notifications = await newsResponse.json()
        if (results.news_notifications.success) {
          results.total_success += results.news_notifications.notifications_sent
          results.total_failures += results.news_notifications.failures || 0
        }
      } catch (error) {
        console.error('News notification error:', error)
        results.news_notifications = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }

    // Send profit-taking alerts
    if (send_profit_alerts) {
      try {
        const profitResponse = await fetch(`${process.env.APP_URL}/api/notifications/profit-taking`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            profit_threshold_percent: 5,
            min_position_value: 1000,
            trading_styles: ['day_trading', 'swing_trading']
          })
        })
        
        results.profit_alerts = await profitResponse.json()
        if (results.profit_alerts.success) {
          results.total_success += results.profit_alerts.notifications_sent
          results.total_failures += results.profit_alerts.failures || 0
        }
      } catch (error) {
        console.error('Profit alert error:', error)
        results.profit_alerts = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }

    // Log notification activity
    console.log(`📧 Notification batch completed:`, {
      timestamp: new Date().toISOString(),
      news_sent: results.news_notifications?.notifications_sent || 0,
      profit_alerts_sent: results.profit_alerts?.notifications_sent || 0,
      total_success: results.total_success,
      total_failures: results.total_failures
    })

    return NextResponse.json({
      success: true,
      message: `Sent ${results.total_success} notifications with ${results.total_failures} failures`,
      details: results
    })

  } catch (error) {
    console.error('Automated notification error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process automated notifications' },
      { status: 500 }
    )
  }
}

// Manual trigger endpoint for testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const test_mode = searchParams.get('test') === 'true'
  
  if (!test_mode) {
    return NextResponse.json(
      { error: 'This endpoint requires test=true parameter' },
      { status: 400 }
    )
  }

  try {
    // Trigger a test run of notifications
    const response = await fetch(`${process.env.APP_URL}/api/notifications/automated`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        send_news_notifications: true,
        send_profit_alerts: true,
        force_notify: true 
      })
    })

    const result = await response.json()
    
    return NextResponse.json({
      message: 'Test notification batch triggered',
      result
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to trigger test notifications' },
      { status: 500 }
    )
  }
}
