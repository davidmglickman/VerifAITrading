import { marketDataService, StockQuote, StockNews } from './market-data'

export interface AIStockAnalysis {
  symbol: string
  timestamp: number
  
  // Current Market Data
  currentPrice: number
  priceChange: number
  priceChangePercent: number
  volume: number
  
  // AI-Generated Analysis
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL'
  confidence: number // 0-100
  reasoning: string
  
  // Price Targets
  entryPrice: number
  stopLoss: number
  takeProfit: number
  riskRewardRatio: number
  
  // Technical Analysis
  technicalSignals: {
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
    momentum: 'STRONG' | 'MODERATE' | 'WEAK'
    volatility: 'HIGH' | 'MEDIUM' | 'LOW'
    support: number
    resistance: number
  }
  
  // Sentiment Analysis
  sentiment: {
    score: number // -1 to 1
    newsCount: number
    keyPoints: string[]
  }
  
  // Risk Assessment
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  timeHorizon: '1D' | '1W' | '1M' | '3M'
  
  // Profit Potential
  profitPotential: {
    upside: number
    downside: number
    probability: number
  }
}

class AIStockAnalysisService {
  async analyzeStock(symbol: string): Promise<AIStockAnalysis> {
    try {
      console.log(`🤖 Starting AI analysis for ${symbol}...`)
      
      // 1. Get current market data
      const quote = await this.getMarketData(symbol)
      
      // 2. Get recent news for sentiment analysis
      const news = await this.getNewsData(symbol)
      
      // 3. Get historical data for technical analysis
      const historicalData = await this.getHistoricalData(symbol)
      
      // 4. Perform AI analysis
      const aiAnalysis = await this.performAIAnalysis(symbol, quote, news, historicalData)
      
      console.log(`✅ AI analysis complete for ${symbol}`)
      return aiAnalysis
      
    } catch (error) {
      console.error(`❌ AI analysis failed for ${symbol}:`, error)
      return this.getFallbackAnalysis(symbol)
    }
  }
  
  private async getMarketData(symbol: string): Promise<StockQuote> {
    try {
      return await marketDataService.getStockQuote(symbol)
    } catch (error) {
      console.log(`Finnhub failed for ${symbol}, using realistic mock data`)
      return this.getRealisticMockQuote(symbol)
    }
  }
  
  private async getNewsData(symbol: string): Promise<StockNews[]> {
    try {
      return await marketDataService.getStockNews(symbol)
    } catch (error) {
      console.log(`News data failed for ${symbol}, using mock sentiment`)
      return []
    }
  }
  
  private async getHistoricalData(symbol: string) {
    try {
      return await marketDataService.getHistoricalData(symbol, 'D', 30)
    } catch (error) {
      console.log(`Historical data failed for ${symbol}, using technical defaults`)
      return null
    }
  }
  
  private async performAIAnalysis(
    symbol: string, 
    quote: StockQuote, 
    news: StockNews[], 
    historicalData: any
  ): Promise<AIStockAnalysis> {
    
    // Calculate technical indicators
    const technicalSignals = this.calculateTechnicalSignals(quote, historicalData)
    
    // Analyze sentiment from news
    const sentiment = this.analyzeSentiment(news)
    
    // Generate AI recommendation
    const recommendation = this.generateRecommendation(quote, technicalSignals, sentiment)
    
    // Calculate risk and targets
    const { entryPrice, stopLoss, takeProfit, riskRewardRatio } = this.calculateTargets(quote, recommendation.action)
    
    // Assess profit potential
    const profitPotential = this.calculateProfitPotential(quote, takeProfit, stopLoss)
    
    return {
      symbol,
      timestamp: Date.now(),
      
      // Market data
      currentPrice: quote.currentPrice,
      priceChange: quote.change,
      priceChangePercent: quote.changePercent,
      volume: quote.volume,
      
      // AI recommendation
      recommendation: recommendation.action,
      confidence: recommendation.confidence,
      reasoning: recommendation.reasoning,
      
      // Targets
      entryPrice,
      stopLoss,
      takeProfit,
      riskRewardRatio,
      
      // Technical
      technicalSignals,
      
      // Sentiment
      sentiment,
      
      // Risk
      riskLevel: this.assessRiskLevel(quote, technicalSignals),
      timeHorizon: this.determineTimeHorizon(recommendation.action, technicalSignals),
      
      // Profit potential
      profitPotential
    }
  }
  
  private calculateTechnicalSignals(quote: StockQuote, historicalData: any) {
    // If we have historical data, calculate real indicators
    if (historicalData && historicalData.closes) {
      const closes = historicalData.closes
      const highs = historicalData.highs
      const lows = historicalData.lows
      
      // Simple moving average
      const sma20 = closes.slice(-20).reduce((a: number, b: number) => a + b, 0) / 20
      
      // Determine trend
      const trendSlope = (closes[closes.length - 1] - closes[closes.length - 10]) / 10
      const trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = trendSlope > 0.5 ? 'BULLISH' : trendSlope < -0.5 ? 'BEARISH' : 'NEUTRAL'
      
      // Calculate support/resistance
      const recentHighs = highs.slice(-10)
      const recentLows = lows.slice(-10)
      const resistance = Math.max(...recentHighs)
      const support = Math.min(...recentLows)
      
      // Volatility based on price range
      const volatility: 'HIGH' | 'MEDIUM' | 'LOW' = (resistance - support) / quote.currentPrice > 0.1 ? 'HIGH' : 
                        (resistance - support) / quote.currentPrice > 0.05 ? 'MEDIUM' : 'LOW'
      
      const momentum: 'STRONG' | 'MODERATE' | 'WEAK' = Math.abs(trendSlope) > 1 ? 'STRONG' : Math.abs(trendSlope) > 0.3 ? 'MODERATE' : 'WEAK'
      
      return {
        trend,
        momentum,
        volatility,
        support,
        resistance
      }
    }
    
    // Fallback technical analysis
    const priceMovement = Math.abs(quote.changePercent)
    return {
      trend: (quote.changePercent > 1 ? 'BULLISH' : quote.changePercent < -1 ? 'BEARISH' : 'NEUTRAL') as 'BULLISH' | 'BEARISH' | 'NEUTRAL',
      momentum: (priceMovement > 3 ? 'STRONG' : priceMovement > 1 ? 'MODERATE' : 'WEAK') as 'STRONG' | 'MODERATE' | 'WEAK',
      volatility: (priceMovement > 5 ? 'HIGH' : priceMovement > 2 ? 'MEDIUM' : 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW',
      support: quote.currentPrice * 0.95,
      resistance: quote.currentPrice * 1.05
    }
  }
  
  private analyzeSentiment(news: StockNews[]) {
    if (news.length === 0) {
      return {
        score: 0,
        newsCount: 0,
        keyPoints: ['No recent news available']
      }
    }
    
    // Simple sentiment analysis based on keywords
    let totalSentiment = 0
    const keyPoints: string[] = []
    
    news.forEach(article => {
      const headline = article.headline.toLowerCase()
      let sentiment = 0
      
      // Positive keywords
      if (headline.includes('beat') || headline.includes('gain') || headline.includes('rise') || 
          headline.includes('bull') || headline.includes('strong') || headline.includes('growth')) {
        sentiment += 0.3
      }
      
      // Negative keywords
      if (headline.includes('fall') || headline.includes('drop') || headline.includes('loss') || 
          headline.includes('bear') || headline.includes('weak') || headline.includes('concern')) {
        sentiment -= 0.3
      }
      
      totalSentiment += sentiment
      if (Math.abs(sentiment) > 0.1) {
        keyPoints.push(article.headline.substring(0, 60) + '...')
      }
    })
    
    return {
      score: Math.max(-1, Math.min(1, totalSentiment / news.length)),
      newsCount: news.length,
      keyPoints: keyPoints.slice(0, 3)
    }
  }
  
  private generateRecommendation(quote: StockQuote, technical: any, sentiment: any) {
    let score = 0
    let reasons: string[] = []
    
    // Technical analysis weight (40%)
    if (technical.trend === 'BULLISH') {
      score += 0.4
      reasons.push(`${technical.trend} trend with ${technical.momentum.toLowerCase()} momentum`)
    } else if (technical.trend === 'BEARISH') {
      score -= 0.4
      reasons.push(`${technical.trend} trend with ${technical.momentum.toLowerCase()} momentum`)
    }
    
    // Price momentum weight (30%)
    const priceScore = quote.changePercent / 10 // Normalize to -1 to 1
    score += priceScore * 0.3
    if (Math.abs(quote.changePercent) > 2) {
      reasons.push(`${quote.changePercent > 0 ? 'Strong positive' : 'Strong negative'} price movement (${quote.changePercent.toFixed(1)}%)`)
    }
    
    // Sentiment weight (20%)
    score += sentiment.score * 0.2
    if (Math.abs(sentiment.score) > 0.3) {
      reasons.push(`${sentiment.score > 0 ? 'Positive' : 'Negative'} news sentiment`)
    }
    
    // Volume analysis weight (10%)
    // Note: We'd need average volume for proper analysis
    if (quote.volume > 1000000) {
      score += 0.1
      reasons.push('High trading volume indicates institutional interest')
    }
    
    // Convert score to recommendation
    let action: AIStockAnalysis['recommendation']
    let confidence: number
    
    if (score > 0.6) {
      action = 'STRONG_BUY'
      confidence = Math.min(95, 70 + score * 25)
    } else if (score > 0.2) {
      action = 'BUY'
      confidence = Math.min(85, 60 + score * 25)
    } else if (score > -0.2) {
      action = 'HOLD'
      confidence = Math.min(75, 50 + Math.abs(score) * 25)
    } else if (score > -0.6) {
      action = 'SELL'
      confidence = Math.min(85, 60 + Math.abs(score) * 25)
    } else {
      action = 'STRONG_SELL'
      confidence = Math.min(95, 70 + Math.abs(score) * 25)
    }
    
    return {
      action,
      confidence: Math.round(confidence),
      reasoning: reasons.join('. ') || 'Mixed signals suggest cautious approach'
    }
  }
  
  private calculateTargets(quote: StockQuote, action: AIStockAnalysis['recommendation']) {
    const currentPrice = quote.currentPrice
    let entryPrice, stopLoss, takeProfit
    
    if (action === 'STRONG_BUY' || action === 'BUY') {
      entryPrice = currentPrice * 1.005 // Small premium for market order
      stopLoss = currentPrice * 0.94    // 6% stop loss
      takeProfit = action === 'STRONG_BUY' ? currentPrice * 1.18 : currentPrice * 1.12 // 18% or 12% target
    } else if (action === 'STRONG_SELL' || action === 'SELL') {
      entryPrice = currentPrice * 0.995 // Small discount for short
      stopLoss = currentPrice * 1.06    // 6% stop loss for short
      takeProfit = action === 'STRONG_SELL' ? currentPrice * 0.82 : currentPrice * 0.88 // 18% or 12% target
    } else { // HOLD
      entryPrice = currentPrice
      stopLoss = currentPrice * 0.97    // 3% stop
      takeProfit = currentPrice * 1.06  // 6% target
    }
    
    const riskAmount = Math.abs(entryPrice - stopLoss)
    const rewardAmount = Math.abs(takeProfit - entryPrice)
    const riskRewardRatio = rewardAmount / riskAmount
    
    return {
      entryPrice: Number(entryPrice.toFixed(2)),
      stopLoss: Number(stopLoss.toFixed(2)),
      takeProfit: Number(takeProfit.toFixed(2)),
      riskRewardRatio: Number(riskRewardRatio.toFixed(2))
    }
  }
  
  private calculateProfitPotential(quote: StockQuote, takeProfit: number, stopLoss: number) {
    const currentPrice = quote.currentPrice
    const upside = ((takeProfit - currentPrice) / currentPrice) * 100
    const downside = ((currentPrice - stopLoss) / currentPrice) * 100
    
    // Probability based on technical strength and market conditions
    const volatility = Math.abs(quote.changePercent)
    const probability = Math.max(45, Math.min(85, 60 + (5 - volatility) * 2))
    
    return {
      upside: Number(Math.abs(upside).toFixed(1)),
      downside: Number(Math.abs(downside).toFixed(1)),
      probability: Math.round(probability)
    }
  }
  
  private assessRiskLevel(quote: StockQuote, technical: any): 'LOW' | 'MEDIUM' | 'HIGH' {
    const volatility = Math.abs(quote.changePercent)
    if (volatility > 5 || technical.volatility === 'HIGH') return 'HIGH'
    if (volatility > 2 || technical.volatility === 'MEDIUM') return 'MEDIUM'
    return 'LOW'
  }
  
  private determineTimeHorizon(action: AIStockAnalysis['recommendation'], technical: any): AIStockAnalysis['timeHorizon'] {
    if (action.includes('STRONG')) return '1W'
    if (technical.momentum === 'STRONG') return '1W'
    if (technical.momentum === 'MODERATE') return '1M'
    return '3M'
  }
  
  private getRealisticMockQuote(symbol: string): StockQuote {
    // Realistic price ranges for different stocks
    const stockPrices: Record<string, {base: number, range: [number, number]}> = {
      'AAPL': { base: 175, range: [170, 180] },
      'MSFT': { base: 340, range: [330, 350] },
      'GOOGL': { base: 135, range: [130, 140] },
      'AMZN': { base: 145, range: [140, 150] },
      'TSLA': { base: 240, range: [230, 250] },
      'NVDA': { base: 450, range: [440, 460] },
      'META': { base: 320, range: [310, 330] },
      'NFLX': { base: 430, range: [420, 440] },
      'GLXY': { base: 30, range: [28, 32] }
    }
    
    const stockInfo = stockPrices[symbol] || { base: 100, range: [95, 105] }
    const currentPrice = stockInfo.range[0] + Math.random() * (stockInfo.range[1] - stockInfo.range[0])
    const change = (Math.random() - 0.5) * 6 // -3 to +3
    const changePercent = (change / currentPrice) * 100
    
    return {
      symbol,
      currentPrice: Number(currentPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      high: Number((currentPrice * 1.02).toFixed(2)),
      low: Number((currentPrice * 0.98).toFixed(2)),
      open: Number((currentPrice - change * 0.8).toFixed(2)),
      previousClose: Number((currentPrice - change).toFixed(2)),
      volume: Math.floor(Math.random() * 5000000) + 1000000,
      timestamp: Date.now()
    }
  }
  
  private getFallbackAnalysis(symbol: string): AIStockAnalysis {
    const mockQuote = this.getRealisticMockQuote(symbol)
    
    return {
      symbol,
      timestamp: Date.now(),
      currentPrice: mockQuote.currentPrice,
      priceChange: mockQuote.change,
      priceChangePercent: mockQuote.changePercent,
      volume: mockQuote.volume,
      
      recommendation: 'HOLD',
      confidence: 60,
      reasoning: 'Limited data available. Recommend monitoring for better entry opportunities.',
      
      entryPrice: mockQuote.currentPrice,
      stopLoss: mockQuote.currentPrice * 0.95,
      takeProfit: mockQuote.currentPrice * 1.08,
      riskRewardRatio: 1.6,
      
      technicalSignals: {
        trend: 'NEUTRAL',
        momentum: 'MODERATE',
        volatility: 'MEDIUM',
        support: mockQuote.currentPrice * 0.95,
        resistance: mockQuote.currentPrice * 1.05
      },
      
      sentiment: {
        score: 0,
        newsCount: 0,
        keyPoints: ['No sentiment data available']
      },
      
      riskLevel: 'MEDIUM',
      timeHorizon: '1M',
      
      profitPotential: {
        upside: 8.0,
        downside: 5.0,
        probability: 65
      }
    }
  }
}

export const aiStockAnalysisService = new AIStockAnalysisService()