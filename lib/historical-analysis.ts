import { marketDataService } from './market-data'
import { getMarketTimeContext, MarketSession } from './market-hours'

export interface HistoricalDataPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface SwingTradingAnalysis {
  currentTrend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS'
  trendStrength: number // 0-100
  supportLevels: number[]
  resistanceLevels: number[]
  swingHighs: Array<{ price: number; date: string; strength: number }>
  swingLows: Array<{ price: number; date: string; strength: number }>
  volumeProfile: {
    averageVolume: number
    recentVolumeSpike: boolean
    volumeTrend: 'INCREASING' | 'DECREASING' | 'STABLE'
  }
  technicalIndicators: {
    rsi: number
    macd: { value: number; signal: number; histogram: number }
    movingAverages: {
      sma20: number
      sma50: number
      sma200: number
      ema12: number
      ema26: number
    }
    bollinger: {
      upper: number
      middle: number
      lower: number
      squeeze: boolean
    }
  }
  swingTradingScore: number // 0-100
  entryOpportunity: {
    type: 'BREAKOUT' | 'PULLBACK' | 'REVERSAL' | 'CONTINUATION' | 'NONE'
    confidence: number
    priceTarget: number
    stopLoss: number
    riskReward: number
    timeframe: string
  }
  market: {
    session: MarketSession
    nowET: string
    nextOpen: string
    nextClose: string
  }
  historicalPatterns: {
    avgSwingDuration: number // days
    avgSwingMagnitude: number // percentage
    successRate: number // percentage
    bestEntryTimes: string[] // time of day patterns
  }
}

export class HistoricalAnalyzer {
  private readonly SWING_DETECTION_PERIOD = 90 // days
  private readonly VOLUME_ANALYSIS_PERIOD = 30 // days
  private readonly MIN_SWING_PERCENTAGE = 2 // minimum 2% move for swing detection

  async analyzeStock(symbol: string): Promise<SwingTradingAnalysis> {
    try {
      // Get historical data
      const historicalData = await this.getHistoricalData(symbol)
      const currentPrice = historicalData[historicalData.length - 1]?.close || 0
      const timeCtx = getMarketTimeContext()

      // Perform comprehensive analysis
      const trendAnalysis = this.analyzeTrend(historicalData)
      const supportResistance = this.findSupportResistanceLevels(historicalData)
      const swingPoints = this.detectSwingPoints(historicalData)
      const volumeAnalysis = this.analyzeVolume(historicalData)
      const technicalIndicators = this.calculateTechnicalIndicators(historicalData)
      const patterns = this.analyzeHistoricalPatterns(historicalData, swingPoints)
      
      // Calculate swing trading score
      const swingScore = this.calculateSwingTradingScore({
        trendAnalysis,
        supportResistance,
        volumeAnalysis,
        technicalIndicators,
        patterns,
        currentPrice
      })

      // Find entry opportunity
      const entryOpportunity = this.identifyEntryOpportunity({
        currentPrice,
        trendAnalysis,
        supportResistance,
        swingPoints,
        technicalIndicators,
        patterns,
        market: timeCtx
      })

      return {
        currentTrend: trendAnalysis.direction,
        trendStrength: trendAnalysis.strength,
        supportLevels: supportResistance.support,
        resistanceLevels: supportResistance.resistance,
        swingHighs: swingPoints.highs,
        swingLows: swingPoints.lows,
        volumeProfile: volumeAnalysis,
        technicalIndicators,
        swingTradingScore: swingScore,
        entryOpportunity,
        market: {
          session: timeCtx.session,
          nowET: timeCtx.nowET.toISOString(),
          nextOpen: timeCtx.nextOpen.toISOString(),
          nextClose: timeCtx.nextClose.toISOString()
        },
        historicalPatterns: patterns
      }
    } catch (error) {
      console.error('Historical analysis failed:', error)
      return this.getDefaultAnalysis()
    }
  }

  private async getHistoricalData(symbol: string): Promise<HistoricalDataPoint[]> {
    // In production, this would fetch real historical data
    // For now, generate realistic sample data
    const data: HistoricalDataPoint[] = []
    const basePrice = 45 + Math.random() * 50 // $45-$95 range
    let currentPrice = basePrice
    
    for (let i = 0; i < this.SWING_DETECTION_PERIOD; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (this.SWING_DETECTION_PERIOD - i))
      
      // Simulate realistic price movements with trends and swings
      const trend = Math.sin(i / 20) * 0.02 // Long-term trend
      const swing = Math.sin(i / 5) * 0.05 // Swing movements
      const noise = (Math.random() - 0.5) * 0.04 // Daily noise
      
      const change = trend + swing + noise
      currentPrice = currentPrice * (1 + change)
      
      const dayVolatility = 0.02 + Math.random() * 0.03
      const high = currentPrice * (1 + dayVolatility)
      const low = currentPrice * (1 - dayVolatility)
      const open = low + (high - low) * Math.random()
      const close = low + (high - low) * Math.random()
      
      data.push({
        date: date.toISOString().split('T')[0],
        open,
        high,
        low,
        close,
        volume: Math.floor(1000000 + Math.random() * 2000000)
      })
    }
    
    return data
  }

  private analyzeTrend(data: HistoricalDataPoint[]): { direction: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS', strength: number } {
    if (data.length < 20) return { direction: 'SIDEWAYS', strength: 0 }
    
    const recent = data.slice(-20)
    const early = data.slice(-40, -20)
    
    const recentAvg = recent.reduce((sum, d) => sum + d.close, 0) / recent.length
    const earlyAvg = early.reduce((sum, d) => sum + d.close, 0) / early.length
    
    const trendChange = (recentAvg - earlyAvg) / earlyAvg
    
    let direction: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS'
    if (trendChange > 0.02) direction = 'UPTREND'
    else if (trendChange < -0.02) direction = 'DOWNTREND'
    else direction = 'SIDEWAYS'
    
    const strength = Math.min(Math.abs(trendChange) * 1000, 100)
    
    return { direction, strength }
  }

  private findSupportResistanceLevels(data: HistoricalDataPoint[]): { support: number[], resistance: number[] } {
    const prices = data.map(d => d.close)
    const highs = data.map(d => d.high)
    const lows = data.map(d => d.low)
    
    // Find significant levels where price bounced multiple times
    const levels = new Map<number, number>() // price -> touch count
    
    // Check for support levels (bounces from lows)
    lows.forEach(low => {
      const roundedPrice = Math.round(low * 100) / 100
      levels.set(roundedPrice, (levels.get(roundedPrice) || 0) + 1)
    })
    
    // Check for resistance levels (bounces from highs)
    highs.forEach(high => {
      const roundedPrice = Math.round(high * 100) / 100
      levels.set(roundedPrice, (levels.get(roundedPrice) || 0) + 1)
    })
    
    // Sort by significance (touch count)
    const significantLevels = Array.from(levels.entries())
      .filter(([_, count]) => count >= 2)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 10)
      .map(([price, _]) => price)
    
    const currentPrice = data[data.length - 1].close
    const support = significantLevels.filter(price => price < currentPrice).slice(0, 3)
    const resistance = significantLevels.filter(price => price > currentPrice).slice(0, 3)
    
    return { support, resistance }
  }

  private detectSwingPoints(data: HistoricalDataPoint[]): { 
    highs: Array<{ price: number; date: string; strength: number }>
    lows: Array<{ price: number; date: string; strength: number }>
  } {
    const highs: Array<{ price: number; date: string; strength: number }> = []
    const lows: Array<{ price: number; date: string; strength: number }> = []
    
    for (let i = 2; i < data.length - 2; i++) {
      const current = data[i]
      const prev2 = data[i - 2]
      const prev1 = data[i - 1]
      const next1 = data[i + 1]
      const next2 = data[i + 2]
      
      // Swing high detection
      if (current.high > prev2.high && current.high > prev1.high && 
          current.high > next1.high && current.high > next2.high) {
        const strength = this.calculateSwingStrength(data, i, 'high')
        if (strength > 30) { // Only significant swings
          highs.push({
            price: current.high,
            date: current.date,
            strength
          })
        }
      }
      
      // Swing low detection
      if (current.low < prev2.low && current.low < prev1.low && 
          current.low < next1.low && current.low < next2.low) {
        const strength = this.calculateSwingStrength(data, i, 'low')
        if (strength > 30) { // Only significant swings
          lows.push({
            price: current.low,
            date: current.date,
            strength
          })
        }
      }
    }
    
    return { 
      highs: highs.slice(-5), // Last 5 significant swing highs
      lows: lows.slice(-5)   // Last 5 significant swing lows
    }
  }

  private calculateSwingStrength(data: HistoricalDataPoint[], index: number, type: 'high' | 'low'): number {
    const current = data[index]
    const lookback = 10
    const start = Math.max(0, index - lookback)
    const end = Math.min(data.length - 1, index + lookback)
    
    let strength = 0
    
    for (let i = start; i <= end; i++) {
      if (i === index) continue
      
      if (type === 'high') {
        if (current.high > data[i].high) strength += 5
      } else {
        if (current.low < data[i].low) strength += 5
      }
    }
    
    return Math.min(strength, 100)
  }

  private analyzeVolume(data: HistoricalDataPoint[]): SwingTradingAnalysis['volumeProfile'] {
    const volumes = data.map(d => d.volume)
    const recentVolumes = volumes.slice(-this.VOLUME_ANALYSIS_PERIOD)
    const olderVolumes = volumes.slice(-this.VOLUME_ANALYSIS_PERIOD * 2, -this.VOLUME_ANALYSIS_PERIOD)
    
    const averageVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length
    const recentAvgVolume = recentVolumes.reduce((sum, v) => sum + v, 0) / recentVolumes.length
    const olderAvgVolume = olderVolumes.reduce((sum, v) => sum + v, 0) / olderVolumes.length
    
    const recentVolumeSpike = recentAvgVolume > averageVolume * 1.5
    
    let volumeTrend: 'INCREASING' | 'DECREASING' | 'STABLE'
    const volumeChange = (recentAvgVolume - olderAvgVolume) / olderAvgVolume
    
    if (volumeChange > 0.2) volumeTrend = 'INCREASING'
    else if (volumeChange < -0.2) volumeTrend = 'DECREASING'
    else volumeTrend = 'STABLE'
    
    return {
      averageVolume,
      recentVolumeSpike,
      volumeTrend
    }
  }

  private calculateTechnicalIndicators(data: HistoricalDataPoint[]): SwingTradingAnalysis['technicalIndicators'] {
    const closes = data.map(d => d.close)
    const highs = data.map(d => d.high)
    const lows = data.map(d => d.low)
    
    return {
      rsi: this.calculateRSI(closes, 14),
      macd: this.calculateMACD(closes),
      movingAverages: {
        sma20: this.calculateSMA(closes, 20),
        sma50: this.calculateSMA(closes, 50),
        sma200: this.calculateSMA(closes, 200),
        ema12: this.calculateEMA(closes, 12),
        ema26: this.calculateEMA(closes, 26)
      },
      bollinger: this.calculateBollingerBands(closes, 20, 2)
    }
  }

  private calculateRSI(prices: number[], period: number): number {
    if (prices.length < period + 1) return 50
    
    let gains = 0
    let losses = 0
    
    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1]
      if (change > 0) gains += change
      else losses -= change
    }
    
    const avgGain = gains / period
    const avgLoss = losses / period
    
    if (avgLoss === 0) return 100
    
    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
  }

  private calculateMACD(prices: number[]): { value: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12)
    const ema26 = this.calculateEMA(prices, 26)
    const macdLine = ema12 - ema26
    
    // For simplicity, using a basic signal calculation
    const signal = macdLine * 0.9 // Simplified signal line
    const histogram = macdLine - signal
    
    return {
      value: Number(macdLine.toFixed(4)),
      signal: Number(signal.toFixed(4)),
      histogram: Number(histogram.toFixed(4))
    }
  }

  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0
    
    const recentPrices = prices.slice(-period)
    return recentPrices.reduce((sum, price) => sum + price, 0) / period
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0
    if (prices.length === 1) return prices[0]
    
    const multiplier = 2 / (period + 1)
    let ema = prices[0]
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier))
    }
    
    return ema
  }

  private calculateBollingerBands(prices: number[], period: number, stdDev: number): {
    upper: number
    middle: number
    lower: number
    squeeze: boolean
  } {
    const sma = this.calculateSMA(prices, period)
    
    if (prices.length < period) {
      return { upper: sma * 1.02, middle: sma, lower: sma * 0.98, squeeze: false }
    }
    
    const recentPrices = prices.slice(-period)
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period
    const standardDeviation = Math.sqrt(variance)
    
    const upper = sma + (standardDeviation * stdDev)
    const lower = sma - (standardDeviation * stdDev)
    const squeeze = (upper - lower) / sma < 0.1 // Tight bands indicate low volatility
    
    return { upper, middle: sma, lower, squeeze }
  }

  private analyzeHistoricalPatterns(data: HistoricalDataPoint[], swingPoints: any): SwingTradingAnalysis['historicalPatterns'] {
    const swings = [...swingPoints.highs, ...swingPoints.lows].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    let totalDuration = 0
    let totalMagnitude = 0
    let successfulSwings = 0
    
    for (let i = 1; i < swings.length; i++) {
      const current = swings[i]
      const previous = swings[i - 1]
      
      const duration = (new Date(current.date).getTime() - new Date(previous.date).getTime()) / (1000 * 60 * 60 * 24)
      const magnitude = Math.abs((current.price - previous.price) / previous.price) * 100
      
      totalDuration += duration
      totalMagnitude += magnitude
      
      if (magnitude > this.MIN_SWING_PERCENTAGE) {
        successfulSwings++
      }
    }
    
    const avgSwingDuration = swings.length > 1 ? totalDuration / (swings.length - 1) : 7
    const avgSwingMagnitude = swings.length > 1 ? totalMagnitude / (swings.length - 1) : 5
    const successRate = swings.length > 1 ? (successfulSwings / (swings.length - 1)) * 100 : 70
    
    return {
      avgSwingDuration: Number(avgSwingDuration.toFixed(1)),
      avgSwingMagnitude: Number(avgSwingMagnitude.toFixed(1)),
      successRate: Number(successRate.toFixed(1)),
      bestEntryTimes: ['09:30-10:00', '14:00-14:30', '15:30-16:00'] // Typical high-volume periods
    }
  }

  private calculateSwingTradingScore(analysis: any): number {
    let score = 0
    
    // Trend strength contribution (25%)
    if (analysis.trendAnalysis.direction !== 'SIDEWAYS') {
      score += (analysis.trendAnalysis.strength / 100) * 25
    }
    
    // Volume activity contribution (20%)
    if (analysis.volumeAnalysis.recentVolumeSpike) score += 15
    if (analysis.volumeAnalysis.volumeTrend === 'INCREASING') score += 5
    
    // Technical indicators contribution (30%)
    const rsi = analysis.technicalIndicators.rsi
    if (rsi > 30 && rsi < 70) score += 15 // Not overbought/oversold
    if (analysis.technicalIndicators.macd.histogram > 0) score += 8
    if (analysis.technicalIndicators.bollinger.squeeze) score += 7 // Volatility squeeze
    
    // Pattern reliability contribution (25%)
    score += (analysis.patterns.successRate / 100) * 15
    if (analysis.patterns.avgSwingMagnitude > 5) score += 10
    
    return Math.min(Math.round(score), 100)
  }

  private identifyEntryOpportunity(params: any): SwingTradingAnalysis['entryOpportunity'] {
    const { currentPrice, trendAnalysis, supportResistance, technicalIndicators, patterns, market } = params
    
    // Determine opportunity type
    let type: 'BREAKOUT' | 'PULLBACK' | 'REVERSAL' | 'CONTINUATION' | 'NONE' = 'NONE'
    let confidence = 0
    let priceTarget = currentPrice * 1.05
    let stopLoss = currentPrice * 0.95
    
    // Check for breakout opportunity
    const nearestResistance = supportResistance.resistance[0]
    if (nearestResistance && currentPrice > nearestResistance * 0.98) {
      type = 'BREAKOUT'
      confidence = 75
      priceTarget = nearestResistance * 1.08
      stopLoss = nearestResistance * 0.98
    }
    
    // Check for pullback opportunity
    const nearestSupport = supportResistance.support[0]
    if (nearestSupport && currentPrice < nearestSupport * 1.02 && trendAnalysis.direction === 'UPTREND') {
      type = 'PULLBACK'
      confidence = 80
      priceTarget = currentPrice * 1.12
      stopLoss = nearestSupport * 0.97
    }
    
    // Check for reversal opportunity
    const rsi = technicalIndicators.rsi
    if ((rsi < 25 && trendAnalysis.direction === 'DOWNTREND') || 
        (rsi > 75 && trendAnalysis.direction === 'UPTREND')) {
      type = 'REVERSAL'
      confidence = 65
      priceTarget = rsi < 25 ? currentPrice * 1.15 : currentPrice * 0.85
      stopLoss = rsi < 25 ? currentPrice * 0.92 : currentPrice * 1.08
    }
    
    // Adjust confidence based on historical success
    confidence = Math.min(confidence * (patterns.successRate / 100), 95)

    // Adjust for market session timing
    if (market?.session && market.session !== 'OPEN') {
      // Reduce execution confidence slightly if not regular hours
      const sessionPenalty = market.session === 'PRE_MARKET' ? 0.9 : market.session === 'AFTER_HOURS' ? 0.85 : 0.8
      confidence = Math.round(confidence * sessionPenalty)
    }
    
    const riskReward = Math.abs((priceTarget - currentPrice) / (currentPrice - stopLoss))
    
    return {
      type,
      confidence: Math.round(confidence),
      priceTarget: Number(priceTarget.toFixed(2)),
      stopLoss: Number(stopLoss.toFixed(2)),
      riskReward: Number(riskReward.toFixed(2)),
      timeframe: `${patterns.avgSwingDuration} days`
    }
  }

  private getDefaultAnalysis(): SwingTradingAnalysis {
    return {
      currentTrend: 'SIDEWAYS',
      trendStrength: 0,
      supportLevels: [],
      resistanceLevels: [],
      swingHighs: [],
      swingLows: [],
      volumeProfile: {
        averageVolume: 1000000,
        recentVolumeSpike: false,
        volumeTrend: 'STABLE'
      },
      technicalIndicators: {
        rsi: 50,
        macd: { value: 0, signal: 0, histogram: 0 },
        movingAverages: {
          sma20: 0, sma50: 0, sma200: 0,
          ema12: 0, ema26: 0
        },
        bollinger: { upper: 0, middle: 0, lower: 0, squeeze: false }
      },
      swingTradingScore: 0,
      entryOpportunity: {
        type: 'NONE',
        confidence: 0,
        priceTarget: 0,
        stopLoss: 0,
        riskReward: 1,
        timeframe: '7 days'
      },
      market: {
        session: 'CLOSED',
        nowET: new Date().toISOString(),
        nextOpen: new Date().toISOString(),
        nextClose: new Date().toISOString(),
      },
      historicalPatterns: {
        avgSwingDuration: 7,
        avgSwingMagnitude: 5,
        successRate: 50,
        bestEntryTimes: ['09:30-10:00', '14:00-14:30']
      }
    }
  }
}

export const historicalAnalyzer = new HistoricalAnalyzer()
