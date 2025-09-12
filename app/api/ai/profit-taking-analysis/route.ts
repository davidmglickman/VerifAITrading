import { NextRequest, NextResponse } from 'next/server'

interface Position {
  symbol: string
  entry_price: number
  current_price: number
  quantity: number
  position_type: 'long' | 'short'
  entry_date: string
  profit_loss: number
  profit_loss_percent: number
  trading_style: 'day_trading' | 'swing_trading'
  market_value: number
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
  expected_return?: number
  risk_reward_ratio?: number
}

interface ProfitAnalysis {
  positions: Position[]
  recommendations: ProfitTakingRecommendation[]
  total_unrealized_pnl: number
  total_unrealized_percent: number
  portfolio_value: number
  risk_score: number
  optimal_actions: number
}

export async function POST(request: NextRequest) {
  try {
    const { 
      include_day_trading = true,
      include_swing_trading = true,
      min_profit_threshold = 3
    } = await request.json()

    // Mock position data - in production, fetch from user's actual portfolio
    const mockPositions: Position[] = [
      {
        symbol: 'AAPL',
        entry_price: 185.50,
        current_price: 195.25,
        quantity: 100,
        position_type: 'long',
        entry_date: '2024-09-10T09:30:00Z',
        profit_loss: 975,
        profit_loss_percent: 5.26,
        trading_style: 'swing_trading',
        market_value: 19525
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
        trading_style: 'day_trading',
        market_value: 13372.50
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
        trading_style: 'swing_trading',
        market_value: 9442.50
      },
      {
        symbol: 'MSFT',
        entry_price: 342.10,
        current_price: 356.80,
        quantity: 30,
        position_type: 'long',
        entry_date: '2024-09-08T11:45:00Z',
        profit_loss: 441,
        profit_loss_percent: 4.29,
        trading_style: 'swing_trading',
        market_value: 10704
      },
      {
        symbol: 'AMD',
        entry_price: 142.30,
        current_price: 151.75,
        quantity: 80,
        position_type: 'long',
        entry_date: '2024-09-11T13:20:00Z',
        profit_loss: 756,
        profit_loss_percent: 6.64,
        trading_style: 'day_trading',
        market_value: 12140
      }
    ]

    // Filter positions based on criteria
    let filteredPositions = mockPositions.filter(pos => {
      const styleMatch = (include_day_trading && pos.trading_style === 'day_trading') ||
                        (include_swing_trading && pos.trading_style === 'swing_trading')
      const profitMatch = pos.profit_loss_percent >= min_profit_threshold
      return styleMatch && profitMatch
    })

    // Generate AI recommendations for each position
    const recommendations = await generateDetailedRecommendations(filteredPositions)

    // Calculate portfolio metrics
    const totalPnL = filteredPositions.reduce((sum, pos) => sum + pos.profit_loss, 0)
    const totalValue = filteredPositions.reduce((sum, pos) => sum + pos.market_value, 0)
    const avgPercent = filteredPositions.reduce((sum, pos) => sum + pos.profit_loss_percent, 0) / filteredPositions.length
    
    // Calculate risk score (0-10)
    const riskScore = calculatePortfolioRiskScore(filteredPositions, recommendations)
    
    // Count optimal actions (high confidence, actionable recommendations)
    const optimalActions = recommendations.filter(rec => 
      rec.confidence >= 75 && 
      ['take_profit', 'partial_profit', 'trail_stop'].includes(rec.action)
    ).length

    const analysis: ProfitAnalysis = {
      positions: filteredPositions,
      recommendations,
      total_unrealized_pnl: totalPnL,
      total_unrealized_percent: avgPercent,
      portfolio_value: totalValue,
      risk_score: riskScore,
      optimal_actions: optimalActions
    }

    return NextResponse.json(analysis)

  } catch (error) {
    console.error('Profit-taking analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze profit-taking opportunities' },
      { status: 500 }
    )
  }
}

async function generateDetailedRecommendations(positions: Position[]): Promise<ProfitTakingRecommendation[]> {
  const recommendations: ProfitTakingRecommendation[] = []
  const currentTime = new Date()
  const marketHours = isMarketHours(currentTime)

  for (const position of positions) {
    const { 
      symbol, 
      profit_loss_percent, 
      trading_style, 
      current_price, 
      entry_price,
      entry_date,
      market_value 
    } = position

    const daysHeld = Math.floor((currentTime.getTime() - new Date(entry_date).getTime()) / (1000 * 60 * 60 * 24))
    const profitAmount = market_value * (profit_loss_percent / 100)

    let recommendation: ProfitTakingRecommendation

    if (trading_style === 'day_trading') {
      recommendation = generateDayTradingRecommendation(
        position, 
        daysHeld, 
        marketHours, 
        profitAmount
      )
    } else {
      recommendation = generateSwingTradingRecommendation(
        position, 
        daysHeld, 
        profitAmount
      )
    }

    recommendations.push(recommendation)
  }

  return recommendations
}

function generateDayTradingRecommendation(
  position: Position, 
  daysHeld: number, 
  marketHours: boolean,
  profitAmount: number
): ProfitTakingRecommendation {
  const { symbol, profit_loss_percent, current_price, entry_price } = position

  // Day trading is aggressive - take profits quickly
  if (profit_loss_percent >= 12) {
    return {
      symbol,
      action: 'take_profit',
      reason: 'Exceptional day trading gain achieved. Take full profits immediately to lock in gains and avoid reversal risk.',
      suggested_price: current_price * 0.993, // 0.7% discount for quick execution
      confidence: 92,
      risk_level: 'low',
      time_horizon: '1h',
      percentage_to_sell: 100,
      expected_return: profitAmount * 0.95,
      risk_reward_ratio: 5.2
    }
  }
  
  if (profit_loss_percent >= 8) {
    return {
      symbol,
      action: 'take_profit',
      reason: 'Strong day trading target hit. Secure profits before market volatility or end-of-day selling pressure.',
      suggested_price: current_price * 0.995,
      confidence: 87,
      risk_level: 'low',
      time_horizon: '1h',
      percentage_to_sell: 100,
      expected_return: profitAmount * 0.97,
      risk_reward_ratio: 4.1
    }
  }
  
  if (profit_loss_percent >= 5) {
    const isLateInDay = !marketHours || new Date().getHours() >= 15
    
    if (isLateInDay) {
      return {
        symbol,
        action: 'take_profit',
        reason: 'Solid day trading gain with limited time remaining. Avoid overnight risk and secure profits.',
        suggested_price: current_price * 0.997,
        confidence: 82,
        risk_level: 'medium',
        time_horizon: '1h',
        percentage_to_sell: 100,
        expected_return: profitAmount * 0.98,
        risk_reward_ratio: 3.2
      }
    } else {
      return {
        symbol,
        action: 'partial_profit',
        reason: 'Good day trading gain with time remaining. Take 60% profit, trail stop on remainder for upside.',
        suggested_price: current_price * 0.998,
        confidence: 78,
        risk_level: 'medium',
        time_horizon: '4h',
        percentage_to_sell: 60,
        stop_loss_price: entry_price * 1.015, // 1.5% above entry
        expected_return: profitAmount * 0.6,
        risk_reward_ratio: 2.8
      }
    }
  }
  
  // Lower profits but still positive
  return {
    symbol,
    action: 'trail_stop',
    reason: 'Position moving favorably. Use tight trailing stop to protect gains while allowing continued upside.',
    suggested_price: current_price,
    confidence: 72,
    risk_level: 'medium',
    time_horizon: '4h',
    stop_loss_price: current_price * 0.975, // 2.5% trailing stop
    expected_return: profitAmount * 0.8,
    risk_reward_ratio: 2.1
  }
}

function generateSwingTradingRecommendation(
  position: Position, 
  daysHeld: number,
  profitAmount: number
): ProfitTakingRecommendation {
  const { symbol, profit_loss_percent, current_price, entry_price } = position

  // Swing trading allows for larger targets but also higher risk tolerance
  if (profit_loss_percent >= 20) {
    return {
      symbol,
      action: 'take_profit',
      reason: 'Outstanding swing trading return achieved. Consider taking majority of profits and looking for re-entry opportunities.',
      suggested_price: current_price * 0.995,
      confidence: 95,
      risk_level: 'low',
      time_horizon: '1d',
      percentage_to_sell: 80,
      expected_return: profitAmount * 0.8,
      risk_reward_ratio: 6.5
    }
  }
  
  if (profit_loss_percent >= 15) {
    return {
      symbol,
      action: 'partial_profit',
      reason: 'Excellent swing trading gains. Take 50% profit to reduce risk while maintaining upside exposure.',
      suggested_price: current_price * 0.997,
      confidence: 88,
      risk_level: 'low',
      time_horizon: '1d',
      percentage_to_sell: 50,
      stop_loss_price: entry_price * 1.08, // 8% above entry
      expected_return: profitAmount * 0.5,
      risk_reward_ratio: 4.8
    }
  }
  
  if (profit_loss_percent >= 10) {
    return {
      symbol,
      action: 'partial_profit',
      reason: 'Strong swing trading performance. Take 30% profit and raise stop-loss to protect remaining position.',
      suggested_price: current_price * 0.998,
      confidence: 82,
      risk_level: 'medium',
      time_horizon: '3d',
      percentage_to_sell: 30,
      stop_loss_price: entry_price * 1.05, // 5% above entry
      expected_return: profitAmount * 0.3,
      risk_reward_ratio: 3.5
    }
  }
  
  if (profit_loss_percent >= 7) {
    return {
      symbol,
      action: 'add_stop_loss',
      reason: 'Good swing trading progress. Move stop-loss to break-even plus small profit to eliminate downside risk.',
      suggested_price: current_price,
      confidence: 76,
      risk_level: 'low',
      time_horizon: '1w',
      stop_loss_price: entry_price * 1.03, // 3% above entry
      expected_return: profitAmount,
      risk_reward_ratio: 2.8
    }
  }
  
  if (daysHeld >= 14 && profit_loss_percent >= 5) {
    return {
      symbol,
      action: 'partial_profit',
      reason: 'Position held for extended period with decent gains. Consider taking some profit to reduce time risk.',
      suggested_price: current_price * 0.999,
      confidence: 70,
      risk_level: 'medium',
      time_horizon: '3d',
      percentage_to_sell: 25,
      stop_loss_price: entry_price * 1.02,
      expected_return: profitAmount * 0.25,
      risk_reward_ratio: 2.2
    }
  }
  
  // Default hold recommendation
  return {
    symbol,
    action: 'hold',
    reason: 'Position developing well for swing trading timeframe. Monitor key support levels and trend continuation.',
    suggested_price: current_price,
    confidence: 65,
    risk_level: 'medium',
    time_horizon: '1w',
    expected_return: profitAmount * 1.5, // Potential if held
    risk_reward_ratio: 2.0
  }
}

function calculatePortfolioRiskScore(positions: Position[], recommendations: ProfitTakingRecommendation[]): number {
  let riskScore = 0
  
  // Factor 1: Concentration risk (number of positions)
  if (positions.length <= 2) riskScore += 3
  else if (positions.length <= 4) riskScore += 1
  
  // Factor 2: Unrealized profit levels (higher profits = higher risk of reversal)
  const avgProfit = positions.reduce((sum, pos) => sum + pos.profit_loss_percent, 0) / positions.length
  if (avgProfit >= 15) riskScore += 3
  else if (avgProfit >= 10) riskScore += 2
  else if (avgProfit >= 7) riskScore += 1
  
  // Factor 3: Day trading exposure (higher intraday risk)
  const dayTradingPositions = positions.filter(pos => pos.trading_style === 'day_trading').length
  const dayTradingRatio = dayTradingPositions / positions.length
  riskScore += Math.floor(dayTradingRatio * 2)
  
  // Factor 4: Recommendations with high urgency
  const urgentActions = recommendations.filter(rec => 
    rec.action === 'take_profit' && rec.confidence >= 85
  ).length
  riskScore += Math.min(urgentActions, 2)
  
  return Math.min(riskScore, 10) // Cap at 10
}

function isMarketHours(date: Date): boolean {
  const hour = date.getHours()
  const day = date.getDay()
  
  // Monday = 1, Friday = 5
  // Market hours: 9:30 AM - 4:00 PM ET (simplified)
  return day >= 1 && day <= 5 && hour >= 9 && hour < 16
}
