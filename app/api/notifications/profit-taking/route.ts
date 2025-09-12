import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface PositionData {
  symbol: string
  entry_price: number
  current_price: number
  quantity: number
  position_type: 'long' | 'short'
  entry_date: string
  profit_loss: number
  profit_loss_percent: number
  trading_style: 'day_trading' | 'swing_trading'
}

interface ProfitTakingRecommendation {
  symbol: string
  action: 'take_profit' | 'partial_profit' | 'hold' | 'add_stop_loss' | 'trail_stop'
  reason: string
  suggested_price: number
  confidence: number
  risk_level: 'low' | 'medium' | 'high'
  time_horizon: '1h' | '4h' | '1d' | '3d' | '1w'
  percentage_to_sell?: number
  stop_loss_price?: number
}

interface UserProfitAnalysis {
  user_id: string
  email: string
  positions: PositionData[]
  recommendations: ProfitTakingRecommendation[]
  total_unrealized_pnl: number
  total_unrealized_percent: number
}

export async function POST(request: NextRequest) {
  try {
    const { 
      profit_threshold_percent = 5, // Minimum profit % to trigger analysis
      min_position_value = 1000, // Minimum position value to analyze
      trading_styles = ['day_trading', 'swing_trading']
    } = await request.json()

    // Get users with active positions showing profit
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        profit_alerts_enabled,
        last_profit_notification
      `)
      .eq('profit_alerts_enabled', true)

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`)
    }

    const analyses: UserProfitAnalysis[] = []

    for (const user of users) {
      // Get user's current positions (mock data for now)
      const positions = await getUserPositions(user.id, min_position_value)
      
      if (!positions.length) continue

      // Filter profitable positions above threshold
      const profitablePositions = positions.filter(pos => 
        pos.profit_loss_percent >= profit_threshold_percent &&
        trading_styles.includes(pos.trading_style)
      )

      if (!profitablePositions.length) continue

      // Generate AI profit-taking recommendations
      const recommendations = await generateProfitTakingRecommendations(profitablePositions)

      if (recommendations.length > 0) {
        const totalPnL = positions.reduce((sum, pos) => sum + pos.profit_loss, 0)
        const totalPercent = positions.reduce((sum, pos) => sum + pos.profit_loss_percent, 0) / positions.length

        analyses.push({
          user_id: user.id,
          email: user.email,
          positions: profitablePositions,
          recommendations,
          total_unrealized_pnl: totalPnL,
          total_unrealized_percent: totalPercent
        })
      }
    }

    // Send profit-taking notifications
    const results = await Promise.allSettled(
      analyses.map(analysis => sendProfitTakingEmail(analysis))
    )

    const successCount = results.filter(result => result.status === 'fulfilled').length
    const failureCount = results.filter(result => result.status === 'rejected').length

    return NextResponse.json({
      success: true,
      notifications_sent: successCount,
      failures: failureCount,
      total_users_analyzed: users.length,
      profitable_users: analyses.length
    })

  } catch (error) {
    console.error('Profit-taking notification error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send profit-taking notifications' },
      { status: 500 }
    )
  }
}

async function getUserPositions(userId: string, minValue: number): Promise<PositionData[]> {
  // Mock position data - in production, integrate with actual portfolio tracking
  const mockPositions: PositionData[] = [
    {
      symbol: 'AAPL',
      entry_price: 185.50,
      current_price: 195.25,
      quantity: 100,
      position_type: 'long',
      entry_date: '2024-09-10T09:30:00Z',
      profit_loss: 975,
      profit_loss_percent: 5.26,
      trading_style: 'swing_trading'
    },
    {
      symbol: 'TSLA',
      entry_price: 245.80,
      current_price: 267.45,
      quantity: 50,
      position_type: 'long',
      entry_date: '2024-09-11T10:15:00Z',
      profit_loss: 1082.50,
      profit_loss_percent: 8.81,
      trading_style: 'day_trading'
    },
    {
      symbol: 'NVDA',
      entry_price: 118.75,
      current_price: 125.90,
      quantity: 75,
      position_type: 'long',
      entry_date: '2024-09-09T14:20:00Z',
      profit_loss: 536.25,
      profit_loss_percent: 6.02,
      trading_style: 'swing_trading'
    }
  ]

  // Filter by minimum position value
  return mockPositions.filter(pos => 
    (pos.current_price * pos.quantity) >= minValue
  )
}

async function generateProfitTakingRecommendations(positions: PositionData[]): Promise<ProfitTakingRecommendation[]> {
  const recommendations: ProfitTakingRecommendation[] = []

  for (const position of positions) {
    const { symbol, profit_loss_percent, trading_style, current_price, entry_price } = position

    let recommendation: ProfitTakingRecommendation

    if (trading_style === 'day_trading') {
      // Day trading recommendations - more aggressive profit taking
      if (profit_loss_percent >= 8) {
        recommendation = {
          symbol,
          action: 'take_profit',
          reason: 'Strong intraday gain achieved. Day trading target reached - secure profits before market close.',
          suggested_price: current_price * 0.995, // Small discount for quick execution
          confidence: 85,
          risk_level: 'low',
          time_horizon: '1h',
          percentage_to_sell: 100
        }
      } else if (profit_loss_percent >= 5) {
        recommendation = {
          symbol,
          action: 'partial_profit',
          reason: 'Solid day trading gain. Consider taking 50% profit and trailing stop on remainder.',
          suggested_price: current_price * 0.997,
          confidence: 78,
          risk_level: 'medium',
          time_horizon: '4h',
          percentage_to_sell: 50,
          stop_loss_price: entry_price * 1.02 // 2% above entry
        }
      } else {
        recommendation = {
          symbol,
          action: 'trail_stop',
          reason: 'Position moving favorably. Trail stop to protect gains while allowing for continued upside.',
          suggested_price: current_price,
          confidence: 70,
          risk_level: 'medium',
          time_horizon: '4h',
          stop_loss_price: current_price * 0.97 // 3% trailing stop
        }
      }
    } else {
      // Swing trading recommendations - more patient approach
      if (profit_loss_percent >= 15) {
        recommendation = {
          symbol,
          action: 'take_profit',
          reason: 'Excellent swing trading return achieved. Consider securing profits and looking for re-entry on pullback.',
          suggested_price: current_price * 0.99,
          confidence: 90,
          risk_level: 'low',
          time_horizon: '1d',
          percentage_to_sell: 75
        }
      } else if (profit_loss_percent >= 10) {
        recommendation = {
          symbol,
          action: 'partial_profit',
          reason: 'Strong swing trading gains. Take partial profits and raise stop-loss to protect remaining position.',
          suggested_price: current_price * 0.995,
          confidence: 82,
          risk_level: 'medium',
          time_horizon: '3d',
          percentage_to_sell: 40,
          stop_loss_price: entry_price * 1.05 // 5% above entry
        }
      } else if (profit_loss_percent >= 7) {
        recommendation = {
          symbol,
          action: 'add_stop_loss',
          reason: 'Good swing trading progress. Move stop-loss to break-even plus small profit to eliminate downside risk.',
          suggested_price: current_price,
          confidence: 75,
          risk_level: 'low',
          time_horizon: '1w',
          stop_loss_price: entry_price * 1.03 // 3% above entry
        }
      } else {
        recommendation = {
          symbol,
          action: 'hold',
          reason: 'Position developing well. Hold for larger swing trading target while monitoring key support levels.',
          suggested_price: current_price,
          confidence: 65,
          risk_level: 'medium',
          time_horizon: '1w'
        }
      }
    }

    recommendations.push(recommendation)
  }

  return recommendations
}

async function sendProfitTakingEmail(analysis: UserProfitAnalysis): Promise<void> {
  const { email, positions, recommendations, total_unrealized_pnl, total_unrealized_percent } = analysis

  const subject = `💰 Profit-Taking Alert - ${recommendations.length} Opportunity${recommendations.length !== 1 ? 'ies' : ''}`

  const html = createProfitTakingEmailHTML(positions, recommendations, total_unrealized_pnl, total_unrealized_percent)
  const text = createProfitTakingEmailText(positions, recommendations, total_unrealized_pnl, total_unrealized_percent)

  await emailService.sendEmail(email, subject, html, text)

  // Update last notification timestamp
  await supabase
    .from('profiles')
    .update({ last_profit_notification: new Date().toISOString() })
    .eq('id', analysis.user_id)
}

function createProfitTakingEmailHTML(
  positions: PositionData[],
  recommendations: ProfitTakingRecommendation[],
  totalPnL: number,
  totalPercent: number
): string {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'take_profit': return '#34C759'
      case 'partial_profit': return '#FF9500'
      case 'trail_stop': return '#007AFF'
      case 'add_stop_loss': return '#8E8E93'
      default: return '#6E6E73'
    }
  }

  const getActionEmoji = (action: string) => {
    switch (action) {
      case 'take_profit': return '💰'
      case 'partial_profit': return '📊'
      case 'trail_stop': return '🎯'
      case 'add_stop_loss': return '🛡️'
      default: return '⏳'
    }
  }

  const getStyleEmoji = (style: string) => {
    return style === 'day_trading' ? '⚡' : '📈'
  }

  const positionsRows = positions.map((position, index) => {
    const rec = recommendations[index]
    if (!rec) return ''

    const actionColor = getActionColor(rec.action)
    
    return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 16px 12px; vertical-align: top;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="font-weight: 600; color: #1D1D1F; font-size: 16px;">
              ${position.symbol}
            </span>
            <span style="font-size: 14px;">
              ${getStyleEmoji(position.trading_style)}
            </span>
          </div>
          <div style="font-size: 12px; color: #8E8E93;">
            ${position.quantity} shares @ $${position.entry_price}
          </div>
        </td>
        <td style="padding: 16px 12px; text-align: center; vertical-align: top;">
          <div style="font-size: 16px; font-weight: 600; color: #34C759; margin-bottom: 2px;">
            +$${position.profit_loss.toFixed(2)}
          </div>
          <div style="font-size: 14px; color: #34C759;">
            +${position.profit_loss_percent.toFixed(1)}%
          </div>
        </td>
        <td style="padding: 16px 12px; vertical-align: top;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="font-size: 16px;">${getActionEmoji(rec.action)}</span>
            <span style="font-weight: 600; color: ${actionColor}; text-transform: uppercase; font-size: 12px;">
              ${rec.action.replace('_', ' ')}
            </span>
          </div>
          <div style="font-size: 13px; color: #6E6E73; line-height: 1.3; margin-bottom: 6px;">
            ${rec.reason}
          </div>
          <div style="font-size: 12px; color: #8E8E93;">
            Confidence: ${rec.confidence}% • ${rec.time_horizon}
            ${rec.suggested_price ? ` • Target: $${rec.suggested_price.toFixed(2)}` : ''}
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
      <title>Profit-Taking Alert - VerifAI Trading</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #34C759 0%, #32D74B 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">💰 Profit-Taking Alert</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">
          AI-Powered Trading Recommendations
        </p>
      </div>
      
      <div style="background: #FAFAFA; padding: 30px; border-radius: 0 0 12px 12px;">
        <!-- Portfolio Summary -->
        <div style="background: linear-gradient(135deg, #E8F5E8 0%, #F0FFF0 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #34C759; border-left: 4px solid #34C759;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="margin: 0 0 8px 0; color: #1D1D1F; font-size: 18px;">📊 Portfolio Performance</h3>
              <div style="font-size: 14px; color: #6E6E73;">
                ${positions.length} profitable position${positions.length !== 1 ? 's' : ''} ready for action
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 24px; font-weight: 600; color: #34C759;">
                +$${totalPnL.toFixed(2)}
              </div>
              <div style="font-size: 16px; color: #34C759;">
                +${totalPercent.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        <!-- Positions & Recommendations -->
        <div style="background: white; border-radius: 8px; border: 1px solid #E5E5EA; overflow: hidden; margin-bottom: 20px;">
          <div style="background: #F8F9FA; padding: 16px; border-bottom: 1px solid #E5E5EA;">
            <h3 style="margin: 0; color: #1D1D1F; font-size: 18px;">🎯 AI Recommendations</h3>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #F8F9FA; border-bottom: 1px solid #E5E5EA;">
                <th style="padding: 12px; text-align: left; font-size: 12px; color: #8E8E93; font-weight: 600;">POSITION</th>
                <th style="padding: 12px; text-align: center; font-size: 12px; color: #8E8E93; font-weight: 600;">P&L</th>
                <th style="padding: 12px; text-align: left; font-size: 12px; color: #8E8E93; font-weight: 600;">RECOMMENDATION</th>
              </tr>
            </thead>
            <tbody>
              ${positionsRows}
            </tbody>
          </table>
        </div>

        <!-- Trading Style Insights -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0;">
          <div style="background: #FFF3E0; padding: 16px; border-radius: 8px; border-left: 4px solid #FF9500;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 20px;">⚡</span>
              <strong style="color: #1D1D1F; font-size: 14px;">Day Trading</strong>
            </div>
            <p style="margin: 0; font-size: 13px; color: #6E6E73; line-height: 1.4;">
              Take profits aggressively. Secure gains before market close and avoid overnight risk.
            </p>
          </div>
          
          <div style="background: #E3F2FD; padding: 16px; border-radius: 8px; border-left: 4px solid #2196F3;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 20px;">📈</span>
              <strong style="color: #1D1D1F; font-size: 14px;">Swing Trading</strong>
            </div>
            <p style="margin: 0; font-size: 13px; color: #6E6E73; line-height: 1.4;">
              Use trailing stops and partial profit-taking to ride trends while protecting gains.
            </p>
          </div>
        </div>

        <!-- Risk Management Tips -->
        <div style="background: #FFF9E6; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFB800;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 20px;">🛡️</span>
            <strong style="color: #1D1D1F; font-size: 14px;">Risk Management Tips</strong>
          </div>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; color: #6E6E73; line-height: 1.5;">
            <li>Never let a profitable trade become a loss</li>
            <li>Use trailing stops to protect gains while allowing upside</li>
            <li>Take partial profits to reduce position risk</li>
            <li>Consider market conditions and volatility</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${process.env.APP_URL}/dashboard" 
             style="background: linear-gradient(135deg, #34C759 0%, #32D74B 100%); 
                    color: white; padding: 14px 28px; text-decoration: none; 
                    border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
            Execute Trades Now
          </a>
        </div>

        <div style="background: #F8F9FA; padding: 16px; border-radius: 8px; margin-top: 20px;">
          <p style="margin: 0; font-size: 12px; color: #8E8E93; text-align: center;">
            These are AI-generated recommendations based on your current positions and market conditions. 
            Always consider your risk tolerance and market analysis before executing trades.
            <br><br>
            Manage your trading preferences in your 
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

function createProfitTakingEmailText(
  positions: PositionData[],
  recommendations: ProfitTakingRecommendation[],
  totalPnL: number,
  totalPercent: number
): string {
  const positionsText = positions.map((position, index) => {
    const rec = recommendations[index]
    if (!rec) return ''

    return `
${position.symbol} (${position.trading_style === 'day_trading' ? 'Day' : 'Swing'} Trade):
- P&L: +$${position.profit_loss.toFixed(2)} (+${position.profit_loss_percent.toFixed(1)}%)
- Recommendation: ${rec.action.replace('_', ' ').toUpperCase()}
- Reason: ${rec.reason}
- Confidence: ${rec.confidence}%
${rec.suggested_price ? `- Target Price: $${rec.suggested_price.toFixed(2)}` : ''}
${rec.percentage_to_sell ? `- Sell: ${rec.percentage_to_sell}%` : ''}
    `
  }).join('\n')

  return `
VerifAI Trading - Profit-Taking Alert

Portfolio Performance:
Total Unrealized P&L: +$${totalPnL.toFixed(2)} (+${totalPercent.toFixed(1)}%)
Profitable Positions: ${positions.length}

AI Recommendations:
${positionsText}

Risk Management Tips:
- Never let a profitable trade become a loss
- Use trailing stops to protect gains while allowing upside
- Take partial profits to reduce position risk
- Consider market conditions and volatility

Execute trades: ${process.env.APP_URL}/dashboard
Manage preferences: ${process.env.APP_URL}/settings

© 2024 VerifAI Trading
  `
}
