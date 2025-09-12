'use client'

import { useState, useEffect } from 'react'
import { marketDataService } from '../lib/market-data'
import { historicalAnalyzer, SwingTradingAnalysis } from '../lib/historical-analysis'

interface StockCardData {
  symbol: string
  companyName: string
  currentPrice: number
  change: number
  changePercent: number
  volume: number
  historicalAnalysis: SwingTradingAnalysis
  ocoRecommendation: {
    action: 'BUY' | 'SELL' | 'HOLD'
    confidence: number
    entryPrice: number
    stopLoss: number
    takeProfit: number
    reasoning: string
  }
  profitPotential: {
    upside: number
    downside: number
    riskReward: number
  }
  topPick: boolean
  candlePattern: string
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  newsCount: number
  lastUpdated: string
}

interface EnhancedWatchlistCardsProps {
  watchlist: Array<{ symbol: string; id: string }>
  onStockClick: (symbol: string) => void
  onSetAlert: (symbol: string, price: number, type: 'above' | 'below') => void
}

export default function EnhancedWatchlistCards({ 
  watchlist, 
  onStockClick, 
  onSetAlert 
}: EnhancedWatchlistCardsProps) {
  const [stocksData, setStocksData] = useState<StockCardData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStockData()
  }, [watchlist])

  const loadStockData = async () => {
    setLoading(true)
    try {
      const enhancedData: StockCardData[] = await Promise.all(
        watchlist.map(async (stock) => {
          // Get market data
          const quote = await marketDataService.getStockQuote(stock.symbol).catch(() => null)
          
          // Get historical analysis - this is the key enhancement!
          const historicalAnalysis = await historicalAnalyzer.analyzeStock(stock.symbol)
          
          // Generate AI-powered OCO recommendation based on historical data
          const ocoRec = await generateOCORecommendationFromHistory(stock.symbol, quote, historicalAnalysis)
          
          // Calculate profit potential based on historical patterns
          const profitPotential = calculateProfitPotentialFromHistory(quote, historicalAnalysis)
          
          return {
            symbol: stock.symbol,
            companyName: await getCompanyName(stock.symbol),
            currentPrice: quote?.currentPrice || historicalAnalysis.technicalIndicators.movingAverages.sma20 || 50,
            change: quote?.change || 0,
            changePercent: quote?.changePercent || 0,
            volume: quote?.volume || historicalAnalysis.volumeProfile.averageVolume,
            historicalAnalysis,
            ocoRecommendation: ocoRec,
            profitPotential,
            topPick: historicalAnalysis.swingTradingScore > 75 && historicalAnalysis.entryOpportunity.confidence > 70,
            candlePattern: getCurrentCandlePattern(historicalAnalysis),
            trend: mapTrendToBullishBearish(historicalAnalysis.currentTrend),
            newsCount: Math.floor(Math.random() * 8) + 1,
            lastUpdated: new Date().toLocaleTimeString()
          }
        })
      )
      
      // Sort by swing trading score and top picks first
      enhancedData.sort((a, b) => {
        if (a.topPick !== b.topPick) return a.topPick ? -1 : 1
        return b.historicalAnalysis.swingTradingScore - a.historicalAnalysis.swingTradingScore
      })
      
      setStocksData(enhancedData)
    } catch (error) {
      console.error('Error loading stock data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateOCORecommendationFromHistory = async (symbol: string, quote: any, historical: SwingTradingAnalysis) => {
    const currentPrice = quote?.currentPrice || historical.technicalIndicators.movingAverages.sma20
    const opportunity = historical.entryOpportunity
    
    // Use historical analysis to make smarter recommendations
    let action: 'BUY' | 'SELL' | 'HOLD'
    let reasoning: string
    let confidence = opportunity.confidence
    
    if (opportunity.type === 'BREAKOUT' && historical.currentTrend === 'UPTREND') {
      action = 'BUY'
      reasoning = `Historical breakout pattern detected. ${historical.historicalPatterns.successRate}% success rate on similar setups.`
    } else if (opportunity.type === 'PULLBACK' && historical.currentTrend === 'UPTREND') {
      action = 'BUY'
      reasoning = `Pullback to support in uptrend. Avg swing: ${historical.historicalPatterns.avgSwingMagnitude}% over ${historical.historicalPatterns.avgSwingDuration} days.`
    } else if (opportunity.type === 'REVERSAL') {
      action = historical.technicalIndicators.rsi < 30 ? 'BUY' : 'SELL'
      reasoning = `Reversal opportunity based on RSI(${historical.technicalIndicators.rsi.toFixed(1)}) and historical swing patterns.`
    } else if (historical.swingTradingScore < 40) {
      action = 'HOLD'
      reasoning = `Low swing trading score (${historical.swingTradingScore}/100). Wait for better setup.`
      confidence = Math.max(confidence, 60)
    } else {
      action = historical.currentTrend === 'UPTREND' ? 'BUY' : historical.currentTrend === 'DOWNTREND' ? 'SELL' : 'HOLD'
      reasoning = `${historical.currentTrend} with ${historical.trendStrength.toFixed(0)}% strength. ${historical.volumeProfile.volumeTrend.toLowerCase()} volume.`
    }
    
    return {
      action,
      confidence: Math.min(confidence, 95),
      entryPrice: opportunity.priceTarget > currentPrice ? currentPrice * 1.01 : currentPrice * 0.99,
      stopLoss: opportunity.stopLoss,
      takeProfit: opportunity.priceTarget,
      reasoning
    }
  }

  const calculateProfitPotentialFromHistory = (quote: any, historical: SwingTradingAnalysis) => {
    const currentPrice = quote?.currentPrice || historical.technicalIndicators.movingAverages.sma20
    const opportunity = historical.entryOpportunity
    
    // Use historical patterns for more accurate profit potential
    const historicalMagnitude = historical.historicalPatterns.avgSwingMagnitude
    const upside = opportunity.type !== 'NONE' 
      ? ((opportunity.priceTarget - currentPrice) / currentPrice) * 100
      : historicalMagnitude * 0.7 // Conservative estimate based on historical average
    
    const downside = opportunity.type !== 'NONE'
      ? ((currentPrice - opportunity.stopLoss) / currentPrice) * 100
      : historicalMagnitude * 0.3 // Risk typically smaller than reward in good setups
    
    const riskReward = opportunity.riskReward > 0 ? opportunity.riskReward : Math.abs(upside / Math.max(downside, 1))
    
    return {
      upside: Number(Math.abs(upside).toFixed(1)),
      downside: Number(Math.abs(downside).toFixed(1)),
      riskReward: Number(riskReward.toFixed(1))
    }
  }

  const getCurrentCandlePattern = (historical: SwingTradingAnalysis): string => {
    const rsi = historical.technicalIndicators.rsi
    const bollinger = historical.technicalIndicators.bollinger
    const trend = historical.currentTrend
    
    if (bollinger.squeeze) return 'Bollinger Squeeze'
    if (rsi > 70) return 'Overbought Doji'
    if (rsi < 30) return 'Oversold Hammer'
    if (trend === 'UPTREND' && historical.entryOpportunity.type === 'PULLBACK') return 'Bullish Pullback'
    if (trend === 'UPTREND') return 'Bullish Continuation'
    if (trend === 'DOWNTREND') return 'Bearish Continuation'
    
    const patterns = ['Inside Bar', 'Pin Bar', 'Engulfing', 'Star Formation']
    return patterns[Math.floor(Math.random() * patterns.length)]
  }

  const mapTrendToBullishBearish = (trend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS'): 'BULLISH' | 'BEARISH' | 'NEUTRAL' => {
    switch (trend) {
      case 'UPTREND': return 'BULLISH'
      case 'DOWNTREND': return 'BEARISH'
      case 'SIDEWAYS': return 'NEUTRAL'
      default: return 'NEUTRAL'
    }
  }

  const generateOCORecommendation = async (symbol: string, quote: any) => {
    // Simulate AI-powered OCO analysis
    const price = quote?.currentPrice || 100
    const volatility = Math.random() * 0.1 + 0.02 // 2-12% volatility
    
    const actions: ('BUY' | 'SELL' | 'HOLD')[] = ['BUY', 'SELL', 'HOLD']
    const action = actions[Math.floor(Math.random() * actions.length)]
    
    let entryPrice, stopLoss, takeProfit
    
    if (action === 'BUY') {
      entryPrice = price * (1 + Math.random() * 0.02) // Entry slightly above current
      stopLoss = price * (1 - volatility)
      takeProfit = price * (1 + volatility * 2)
    } else if (action === 'SELL') {
      entryPrice = price * (1 - Math.random() * 0.02) // Entry slightly below current
      stopLoss = price * (1 + volatility)
      takeProfit = price * (1 - volatility * 2)
    } else {
      entryPrice = price
      stopLoss = price * (1 - volatility * 0.5)
      takeProfit = price * (1 + volatility * 0.5)
    }
    
    const confidence = Math.floor(Math.random() * 40) + 60 // 60-100% confidence
    
    const reasonings = [
      'Strong technical breakout above resistance',
      'Bullish divergence in RSI indicator',
      'Volume surge indicates institutional interest',
      'Earnings momentum building for next quarter',
      'Support level holding with buying interest',
      'Overbought conditions suggest pullback',
      'Breaking below key moving average',
      'Low volume indicates consolidation phase'
    ]
    
    return {
      action,
      confidence,
      entryPrice: Number(entryPrice.toFixed(2)),
      stopLoss: Number(stopLoss.toFixed(2)),
      takeProfit: Number(takeProfit.toFixed(2)),
      reasoning: reasonings[Math.floor(Math.random() * reasonings.length)]
    }
  }

  const calculateProfitPotential = (quote: any, oco: any) => {
    const currentPrice = quote?.currentPrice || 100
    const upside = ((oco.takeProfit - currentPrice) / currentPrice) * 100
    const downside = ((currentPrice - oco.stopLoss) / currentPrice) * 100
    const riskReward = Math.abs(upside / downside)
    
    return {
      upside: Number(upside.toFixed(1)),
      downside: Number(downside.toFixed(1)),
      riskReward: Number(riskReward.toFixed(1))
    }
  }

  const getCompanyName = async (symbol: string): Promise<string> => {
    const names: { [key: string]: string } = {
      'AAPL': 'Apple Inc.',
      'TSLA': 'Tesla Inc.',
      'GOOGL': 'Alphabet Inc.',
      'MSFT': 'Microsoft Corp.',
      'AMZN': 'Amazon.com Inc.',
      'GRGG': 'Garmin Ltd.',
      'GLXY': 'Galaxy Digital Holdings Ltd.'
    }
    return names[symbol] || `${symbol} Corp.`
  }

  const generateCandlePattern = () => {
    const patterns = ['Doji', 'Hammer', 'Shooting Star', 'Bullish Engulfing', 'Bearish Engulfing', 'Morning Star', 'Evening Star']
    return patterns[Math.floor(Math.random() * patterns.length)]
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return '#34C759'
      case 'SELL': return '#FF3B30'
      case 'HOLD': return '#FF9500'
      default: return '#8E8E93'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'BULLISH': return '#34C759'
      case 'BEARISH': return '#FF3B30'
      case 'NEUTRAL': return '#8E8E93'
      default: return '#8E8E93'
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
        padding: '1rem'
      }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #E5E5E7',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            height: '280px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #E5E5E7',
              borderTopColor: '#007AFF',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        ))}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '1.5rem',
      padding: '1rem'
    }}>
      {stocksData.map((stock) => (
        <div
          key={stock.symbol}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            border: stock.topPick ? '2px solid #FF9500' : '1px solid #E5E5E7',
            boxShadow: stock.topPick 
              ? '0 4px 20px rgba(255, 149, 0, 0.2)' 
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
          onClick={() => onStockClick(stock.symbol)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = stock.topPick 
              ? '0 8px 25px rgba(255, 149, 0, 0.3)' 
              : '0 8px 25px rgba(0, 0, 0, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = stock.topPick 
              ? '0 4px 20px rgba(255, 149, 0, 0.2)' 
              : '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Top Pick Badge */}
          {stock.topPick && (
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '16px',
              backgroundColor: '#FF9500',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              🎯 TOP PICK
            </div>
          )}

          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1rem'
          }}>
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1D1D1F',
                margin: '0 0 4px 0'
              }}>
                {stock.symbol}
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#8E8E93',
                margin: 0
              }}>
                {stock.companyName}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1D1D1F'
              }}>
                ${stock.currentPrice.toFixed(2)}
              </div>
              <div style={{
                fontSize: '14px',
                color: stock.change >= 0 ? '#34C759' : '#FF3B30',
                fontWeight: '500'
              }}>
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(1)}%)
              </div>
            </div>
          </div>

          {/* OCO Recommendation */}
          <div style={{
            backgroundColor: '#F8F9FA',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{
                backgroundColor: getActionColor(stock.ocoRecommendation.action),
                color: 'white',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {stock.ocoRecommendation.action}
              </span>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1D1D1F'
                }}>
                  {stock.ocoRecommendation.confidence}% confidence
                </span>
                <div style={{ fontSize: '10px', color: '#8E8E93' }}>
                  Swing Score: {stock.historicalAnalysis.swingTradingScore}/100
                </div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#6E6E73', marginBottom: '8px' }}>
              {stock.ocoRecommendation.reasoning}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px',
              fontSize: '11px'
            }}>
              <div>
                <div style={{ color: '#8E8E93' }}>Entry</div>
                <div style={{ fontWeight: '600' }}>${stock.ocoRecommendation.entryPrice}</div>
              </div>
              <div>
                <div style={{ color: '#8E8E93' }}>Stop</div>
                <div style={{ fontWeight: '600', color: '#FF3B30' }}>${stock.ocoRecommendation.stopLoss}</div>
              </div>
              <div>
                <div style={{ color: '#8E8E93' }}>Target</div>
                <div style={{ fontWeight: '600', color: '#34C759' }}>${stock.ocoRecommendation.takeProfit}</div>
              </div>
            </div>
            {/* Historical Context */}
            <div style={{
              marginTop: '8px',
              padding: '6px',
              backgroundColor: '#E8F4FD',
              borderRadius: '6px',
              fontSize: '10px',
              color: '#1565C0'
            }}>
              📊 Historical: Avg swing {stock.historicalAnalysis.historicalPatterns.avgSwingMagnitude}% over {stock.historicalAnalysis.historicalPatterns.avgSwingDuration} days | Success rate: {stock.historicalAnalysis.historicalPatterns.successRate}%
            </div>
          </div>

          {/* Profit Potential & Historical Info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '4px' }}>
                Profit Potential
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#34C759' }}>
                +{stock.profitPotential.upside}%
              </div>
              <div style={{ fontSize: '12px', color: '#FF3B30' }}>
                Risk: -{stock.profitPotential.downside}%
              </div>
              <div style={{ fontSize: '11px', color: '#8E8E93' }}>
                R/R: {stock.profitPotential.riskReward}:1
              </div>
              {stock.historicalAnalysis.entryOpportunity.type !== 'NONE' && (
                <div style={{ fontSize: '10px', color: '#FF9500', fontWeight: '500', marginTop: '2px' }}>
                  🎯 {stock.historicalAnalysis.entryOpportunity.type}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '4px' }}>
                Technical Analysis
              </div>
              <div style={{
                fontSize: '12px',
                color: getTrendColor(stock.trend),
                fontWeight: '600',
                marginBottom: '2px'
              }}>
                {stock.trend} ({stock.historicalAnalysis.trendStrength.toFixed(0)}%)
              </div>
              <div style={{ fontSize: '11px', color: '#6E6E73' }}>
                {stock.candlePattern}
              </div>
              <div style={{ fontSize: '11px', color: '#8E8E93' }}>
                RSI: {stock.historicalAnalysis.technicalIndicators.rsi.toFixed(1)}
              </div>
              <div style={{ fontSize: '10px', color: '#8E8E93' }}>
                Vol: {stock.historicalAnalysis.volumeProfile.volumeTrend}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSetAlert(stock.symbol, stock.ocoRecommendation.takeProfit, 'above')
              }}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: '#34C759',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🔔 Target Alert
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSetAlert(stock.symbol, stock.ocoRecommendation.stopLoss, 'below')
              }}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: '#FF3B30',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ⚠️ Stop Alert
            </button>
          </div>

          {/* Last Updated */}
          <div style={{
            fontSize: '10px',
            color: '#C7C7CC',
            textAlign: 'center',
            marginTop: '8px'
          }}>
            Updated: {stock.lastUpdated}
          </div>
        </div>
      ))}
    </div>
  )
}
