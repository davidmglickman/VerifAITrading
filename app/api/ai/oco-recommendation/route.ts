import { NextRequest, NextResponse } from 'next/server'

interface OCORequest {
  symbol: string
  currentPrice: number
  accountSize: number
  riskTolerance: number
}

interface MarketData {
  volatility: number
  trend: 'bullish' | 'bearish' | 'neutral'
  volume: number
  support: number
  resistance: number
  atr: number // Average True Range
}

function getMarketData(symbol: string, currentPrice: number): MarketData {
  // In real implementation, this would fetch actual market data
  // For now, we'll generate realistic mock data
  
  const volatility = 0.15 + Math.random() * 0.25 // 15-40% annual volatility
  const dailyVolatility = volatility / Math.sqrt(252) // Convert to daily
  
  return {
    volatility: dailyVolatility,
    trend: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'bearish' : 'neutral',
    volume: 1000000 + Math.random() * 5000000,
    support: currentPrice * (0.92 + Math.random() * 0.05),
    resistance: currentPrice * (1.03 + Math.random() * 0.05),
    atr: currentPrice * (0.01 + Math.random() * 0.03) // 1-4% ATR
  }
}

function calculateOCOLevels(
  currentPrice: number, 
  marketData: MarketData, 
  riskTolerance: number,
  strategy: 'swing' | 'day' | 'position'
) {
  const { volatility, support, resistance, atr } = marketData
  
  // Base multipliers for different strategies
  const multipliers = {
    swing: { risk: 1.5, reward: 2.5, timeframe: '3-7 days' },
    day: { risk: 0.8, reward: 1.5, timeframe: '1 day' },
    position: { risk: 2.0, reward: 4.0, timeframe: '2-4 weeks' }
  }
  
  const mult = multipliers[strategy]
  
  // Calculate stop loss based on ATR and support/resistance
  const atrStop = currentPrice - (atr * mult.risk)
  const supportStop = support * 0.98 // Just below support
  const stopLoss = Math.max(atrStop, supportStop)
  
  // Calculate profit target based on resistance and risk/reward ratio
  const riskAmount = currentPrice - stopLoss
  const rewardAmount = riskAmount * mult.reward
  const profitTarget = Math.min(currentPrice + rewardAmount, resistance * 1.02)
  
  // Adjust entry price (for pending orders)
  let entryPrice = currentPrice
  if (marketData.trend === 'bullish') {
    entryPrice = currentPrice * 0.995 // Slight discount for bullish trend
  } else if (marketData.trend === 'bearish') {
    entryPrice = currentPrice * 1.005 // Slight premium for bearish trend
  }
  
  return {
    entryPrice,
    stopLoss,
    profitTarget,
    timeframe: mult.timeframe
  }
}

function determineStrategy(marketData: MarketData, riskTolerance: number): 'swing' | 'day' | 'position' {
  // High risk tolerance + trending market = position trading
  if (riskTolerance > 3 && marketData.trend !== 'neutral') {
    return 'position'
  }
  
  // Low risk tolerance or high volatility = day trading
  if (riskTolerance < 1.5 || marketData.volatility > 0.03) {
    return 'day'
  }
  
  // Default to swing trading
  return 'swing'
}

function generateReasoning(
  symbol: string,
  marketData: MarketData,
  levels: any,
  strategy: string,
  riskReward: number
): string {
  const trendDesc = marketData.trend === 'bullish' ? 'upward momentum' : 
                   marketData.trend === 'bearish' ? 'downward pressure' : 'sideways consolidation'
  
  const volatilityDesc = marketData.volatility > 0.025 ? 'high' : 
                        marketData.volatility > 0.015 ? 'moderate' : 'low'
  
  return `Based on ${symbol}'s current ${trendDesc} and ${volatilityDesc} volatility environment, a ${strategy} trading approach is recommended. The stop loss at $${levels.stopLoss.toFixed(2)} is positioned near key support levels with ATR-based risk management. The profit target at $${levels.profitTarget.toFixed(2)} offers a ${riskReward.toFixed(1)}:1 risk-reward ratio, accounting for nearby resistance and market structure.`
}

export async function POST(request: NextRequest) {
  try {
    const { symbol, currentPrice, accountSize, riskTolerance }: OCORequest = await request.json()

    if (!symbol || !currentPrice || !accountSize || !riskTolerance) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Get market data
    const marketData = getMarketData(symbol, currentPrice)
    
    // Determine optimal strategy
    const strategy = determineStrategy(marketData, riskTolerance)
    
    // Calculate OCO levels
    const levels = calculateOCOLevels(currentPrice, marketData, riskTolerance, strategy)
    
    // Calculate risk and reward metrics
    const priceRisk = levels.entryPrice - levels.stopLoss
    const priceReward = levels.profitTarget - levels.entryPrice
    const riskRewardRatio = priceReward / priceRisk
    
    // Calculate position sizing
    const riskAmount = accountSize * (riskTolerance / 100)
    const positionSize = Math.floor(riskAmount / priceRisk)
    const expectedProfit = positionSize * priceReward
    const maxRisk = positionSize * priceRisk
    
    // Calculate probability based on market conditions
    let probability = 50 // Base probability
    if (marketData.trend === 'bullish' && strategy === 'swing') probability += 15
    if (marketData.trend === 'bearish' && strategy === 'day') probability += 10
    if (riskRewardRatio > 2) probability += 10
    if (marketData.volatility < 0.02) probability += 5
    probability = Math.min(probability, 85) // Cap at 85%
    
    // Calculate confidence based on various factors
    let confidence = 60 // Base confidence
    if (riskRewardRatio > 2) confidence += 10
    if (marketData.trend !== 'neutral') confidence += 10
    if (marketData.volatility < 0.025) confidence += 10
    confidence = Math.min(confidence, 90) // Cap at 90%
    
    const reasoning = generateReasoning(symbol, marketData, levels, strategy, riskRewardRatio)

    const recommendation = {
      symbol,
      currentPrice,
      entryPrice: levels.entryPrice,
      profitTarget: levels.profitTarget,
      stopLoss: levels.stopLoss,
      expectedProfit,
      maxRisk,
      riskRewardRatio,
      probability,
      timeframe: levels.timeframe,
      reasoning,
      strategy,
      confidence
    }

    return NextResponse.json(recommendation)

  } catch (error) {
    console.error('OCO recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate OCO recommendation' },
      { status: 500 }
    )
  }
}
