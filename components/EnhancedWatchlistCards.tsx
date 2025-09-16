'use client'

import { useState, useEffect } from 'react'
import { aiStockAnalysisService, AIStockAnalysis } from '../lib/ai-stock-analysis'
import { ocoNotificationService } from '../lib/oco-notifications'

interface StockCardData {
  symbol: string
  companyName: string
  aiAnalysis: AIStockAnalysis
  topPick: boolean
  lastUpdated: string
}

interface EnhancedWatchlistCardsProps {
  watchlist: Array<{ symbol: string; id: string }>
  onStockClick: (symbol: string) => void
  onSetAlert: (symbol: string, price: number, type: 'above' | 'below') => void
  userId?: string
}

export default function EnhancedWatchlistCards({ 
  watchlist, 
  onStockClick, 
  onSetAlert,
  userId = "550e8400-e29b-41d4-a716-446655440000"
}: EnhancedWatchlistCardsProps) {
  const [stocksData, setStocksData] = useState<StockCardData[]>([])
  const [loading, setLoading] = useState(true)

  const setupOCONotifications = async (
    stock: StockCardData, 
    profile: 'conservative' | 'moderate' | 'aggressive'
  ) => {
    try {
      const ocoData = generateOCOByRiskProfile(stock, profile)
      
      // Show notification preferences modal (simplified for now)
      const userWantsNotifications = confirm(
        `Set up smart notifications for ${stock.symbol} ${profile.toUpperCase()} OCO?\n\n` +
        `This will monitor:\n` +
        `✅ Price targets (Entry: $${ocoData.entry.toFixed(2)}, Stop: $${ocoData.stop.toFixed(2)}, Target: $${ocoData.target.toFixed(2)})\n` +
        `✅ News catalysts related to ${stock.symbol}\n` +
        `✅ Related stock movements (sector correlation)\n` +
        `✅ Volume spikes indicating momentum\n\n` +
        `Click OK to enable all notifications, Cancel to copy OCO only.`
      )
      
      if (userWantsNotifications) {
        const { notification, triggers } = await ocoNotificationService.createOCONotification(
          userId,
          stock.symbol,
          profile,
          {
            entry: ocoData.entry,
            stop: ocoData.stop,
            target: ocoData.target,
            confidence: ocoData.confidence,
            reasoning: ocoData.reasoning
          },
          {
            priceTargets: true,
            newsCatalysts: true,
            relatedStocks: true,
            volumeSpikes: true
          }
        )
        
        // Copy OCO to clipboard with notification info
        const ocoText = `${stock.symbol} ${profile.toUpperCase()} OCO (AI-Generated + Smart Notifications):

📊 TRADING SETUP:
Entry: $${ocoData.entry.toFixed(2)}
Stop: $${ocoData.stop.toFixed(2)}
Target: $${ocoData.target.toFixed(2)}
Risk/Reward: ${ocoData.riskReward.toFixed(2)}:1
Position: ${ocoData.positionSize}
Confidence: ${ocoData.confidence}%

🔔 SMART NOTIFICATIONS ACTIVE:
✅ Price target alerts (${triggers.filter(t => t.type.startsWith('price_')).length} triggers)
✅ News catalyst monitoring
✅ Related stocks: ${notification.relatedSymbols.join(', ')}
✅ Volume spike detection
📈 Sector trend: ${notification.sectorTrend.toUpperCase()}

🤖 AI Analysis: ${ocoData.reasoning}

Notification ID: ${notification.id.slice(-8)}`
        
        navigator.clipboard.writeText(ocoText)
        alert(`🎯 ${profile.toUpperCase()} OCO + Smart Notifications activated!\n\nYou'll be notified when:\n• Price targets are reached\n• Relevant news breaks\n• Related stocks move significantly\n• Volume spikes occur\n\nOCO details copied to clipboard!`)
      } else {
        // Just copy regular OCO
        const ocoText = `${stock.symbol} ${profile.toUpperCase()} OCO (AI-Generated):
Entry: $${ocoData.entry.toFixed(2)}
Stop: $${ocoData.stop.toFixed(2)}
Target: $${ocoData.target.toFixed(2)}
Risk/Reward: ${ocoData.riskReward.toFixed(2)}:1
Position: ${ocoData.positionSize}
Confidence: ${ocoData.confidence}%

AI Analysis: ${ocoData.reasoning}`
        navigator.clipboard.writeText(ocoText)
        alert('📋 OCO strategy copied to clipboard!')
      }
    } catch (error) {
      console.error('Error setting up OCO notifications:', error)
      alert('Error setting up notifications. OCO strategy copied to clipboard.')
    }
  }

  useEffect(() => {
    loadStockData()
  }, [watchlist])

  const loadStockData = async () => {
    setLoading(true)
    try {
      const enhancedData: StockCardData[] = await Promise.all(
        watchlist.map(async (stock) => {
          console.log(`🔍 Analyzing ${stock.symbol} with AI...`)
          
          // Get comprehensive AI analysis
          const aiAnalysis = await aiStockAnalysisService.analyzeStock(stock.symbol)
          
          return {
            symbol: stock.symbol,
            companyName: await getCompanyName(stock.symbol),
            aiAnalysis,
            topPick: aiAnalysis.confidence > 80 && (aiAnalysis.recommendation === 'STRONG_BUY' || aiAnalysis.recommendation === 'BUY'),
            lastUpdated: new Date().toLocaleTimeString()
          }
        })
      )
      
      // Sort by confidence and recommendation strength
      enhancedData.sort((a, b) => {
        // Top picks first
        if (a.topPick && !b.topPick) return -1
        if (!a.topPick && b.topPick) return 1
        
        // Then by confidence
        return b.aiAnalysis.confidence - a.aiAnalysis.confidence
      })
      
      setStocksData(enhancedData)
    } catch (error) {
      console.error('Error loading enhanced stock data:', error)
      setStocksData([])
    } finally {
      setLoading(false)
    }
  }

  const getCompanyName = async (symbol: string): Promise<string> => {
    const companyNames: Record<string, string> = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc.',
      'AMZN': 'Amazon.com Inc.',
      'TSLA': 'Tesla Inc.',
      'NVDA': 'NVIDIA Corporation',
      'META': 'Meta Platforms Inc.',
      'NFLX': 'Netflix Inc.',
      'GLXY': 'Galaxy Digital Holdings Ltd.'
    }
    
    return companyNames[symbol] || `${symbol} Corp.`
  }

  const generateOCOByRiskProfile = (stock: StockCardData, profile: 'conservative' | 'moderate' | 'aggressive') => {
    const currentPrice = stock.aiAnalysis.currentPrice
    const { stopLoss, takeProfit } = stock.aiAnalysis
    
    // Adjust based on risk profile
    let adjustedStop, adjustedTarget, positionSize, confidence
    
    if (profile === 'conservative') {
      adjustedStop = currentPrice - (currentPrice - stopLoss) * 0.7  // Tighter stop
      adjustedTarget = currentPrice + (takeProfit - currentPrice) * 0.6  // Lower target
      positionSize = '25% position'
      confidence = Math.min(stock.aiAnalysis.confidence + 5, 95)
    } else if (profile === 'moderate') {
      adjustedStop = stopLoss
      adjustedTarget = takeProfit
      positionSize = '50% position'
      confidence = stock.aiAnalysis.confidence
    } else { // aggressive
      adjustedStop = currentPrice - (currentPrice - stopLoss) * 1.3  // Wider stop
      adjustedTarget = currentPrice + (takeProfit - currentPrice) * 1.4  // Higher target
      positionSize = '75% position'
      confidence = Math.max(stock.aiAnalysis.confidence - 10, 60)
    }
    
    const riskAmount = currentPrice - adjustedStop
    const rewardAmount = adjustedTarget - currentPrice
    const riskReward = rewardAmount / riskAmount
    
    return {
      entry: currentPrice,
      stop: adjustedStop,
      target: adjustedTarget,
      riskReward,
      positionSize,
      confidence,
      reasoning: stock.aiAnalysis.reasoning
    }
  }

  const getRecommendationColor = (recommendation: AIStockAnalysis['recommendation']) => {
    switch (recommendation) {
      case 'STRONG_BUY': return '#00C851'
      case 'BUY': return '#34C759'
      case 'HOLD': return '#FF9500'
      case 'SELL': return '#FF6B47'
      case 'STRONG_SELL': return '#FF3B30'
      default: return '#8E8E93'
    }
  }

  const getRecommendationLabel = (recommendation: AIStockAnalysis['recommendation']) => {
    switch (recommendation) {
      case 'STRONG_BUY': return 'STRONG BUY'
      case 'BUY': return 'BUY'
      case 'HOLD': return 'HOLD'
      case 'SELL': return 'SELL'
      case 'STRONG_SELL': return 'STRONG SELL'
      default: return 'HOLD'
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem',
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #007AFF',
            borderRadius: '50%',
            borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#86868B', fontSize: '16px', margin: 0 }}>
            🤖 AI analyzing your watchlist stocks...
          </p>
        </div>
      </div>
    )
  }

  if (stocksData.length === 0) {
    return (
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        <p style={{ color: '#86868B', fontSize: '16px', margin: 0 }}>
          No stocks in your watchlist. Add some symbols to get AI-powered analysis!
        </p>
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    }}>
      {stocksData.map((stock) => (
        <div
          key={stock.symbol}
          onClick={() => onStockClick(stock.symbol)}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            border: stock.topPick ? '2px solid #007AFF' : '1px solid rgba(0, 0, 0, 0.06)',
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: stock.topPick ? '0 8px 25px rgba(0, 122, 255, 0.15)' : '0 4px 12px rgba(0, 0, 0, 0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Top Pick Badge */}
          {stock.topPick && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: '#007AFF',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: '600'
            }}>
              ⭐ TOP PICK
            </div>
          )}

          {/* Header with Symbol and Company */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1D1D1F',
                marginRight: '0.5rem'
              }}>
                {stock.symbol}
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: '500',
                color: 'white',
                backgroundColor: stock.aiAnalysis.riskLevel === 'LOW' ? '#34C759' : 
                              stock.aiAnalysis.riskLevel === 'MEDIUM' ? '#FF9500' : '#FF3B30',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {stock.aiAnalysis.riskLevel} RISK
              </div>
            </div>
            <div style={{
              fontSize: '14px',
              color: '#8E8E93',
              marginBottom: '0.5rem'
            }}>
              {stock.companyName}
            </div>
            <div style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#007AFF',
              backgroundColor: '#F0F9FF',
              padding: '4px 8px',
              borderRadius: '6px',
              display: 'inline-block'
            }}>
              Market Open • Updated: {stock.lastUpdated}
            </div>
          </div>

          {/* Current Price and Change */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1D1D1F',
              marginBottom: '0.25rem'
            }}>
              ${stock.aiAnalysis.currentPrice.toFixed(2)}
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: stock.aiAnalysis.priceChangePercent >= 0 ? '#34C759' : '#FF3B30',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>
                {stock.aiAnalysis.priceChangePercent >= 0 ? '+' : ''}
                ${stock.aiAnalysis.priceChange.toFixed(2)} 
                ({stock.aiAnalysis.priceChangePercent.toFixed(2)}%)
              </span>
              <span style={{ fontSize: '12px', color: '#8E8E93' }}>
                Vol: {(stock.aiAnalysis.volume / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>

          {/* AI Recommendation */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '700',
              color: getRecommendationColor(stock.aiAnalysis.recommendation),
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🎯 {getRecommendationLabel(stock.aiAnalysis.recommendation)} Signal
              <span style={{
                fontSize: '12px',
                backgroundColor: 'rgba(0, 122, 255, 0.1)',
                color: '#007AFF',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {stock.aiAnalysis.confidence}% Confidence
              </span>
            </div>
            <div style={{
              fontSize: '13px',
              color: '#6E6E73',
              lineHeight: '1.4',
              marginBottom: '0.75rem'
            }}>
              💡 AI Analysis: {stock.aiAnalysis.reasoning}
            </div>
            {stock.aiAnalysis.sentiment.topCatalyst && (
              <div style={{
                fontSize: '12px',
                color: '#007AFF',
                backgroundColor: 'rgba(0,122,255,0.08)',
                padding: '6px 8px',
                borderRadius: '6px',
                marginBottom: '0.5rem'
              }}>
                📰 Catalyst: {stock.aiAnalysis.sentiment.topCatalyst.length > 90 
                  ? stock.aiAnalysis.sentiment.topCatalyst.slice(0,90) + '…' 
                  : stock.aiAnalysis.sentiment.topCatalyst}
              </div>
            )}
            {stock.aiAnalysis.sentiment.summary && (
              <div style={{
                fontSize: '11px',
                color: '#6E6E73',
                lineHeight: 1.4,
                borderLeft: '3px solid #E5E5EA',
                padding: '4px 8px',
                background: '#F8F9FA',
                borderRadius: '4px'
              }}>
                {stock.aiAnalysis.sentiment.summary}
              </div>
            )}
          </div>

          {/* Price Targets */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '0.25rem' }}>📈 Entry</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#007AFF' }}>
                ${stock.aiAnalysis.entryPrice.toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '0.25rem' }}>🛡️ Stop</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#FF3B30' }}>
                ${stock.aiAnalysis.stopLoss.toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '0.25rem' }}>🎯 Target</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#34C759' }}>
                ${stock.aiAnalysis.takeProfit.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSetAlert(stock.symbol, stock.aiAnalysis.takeProfit, 'above')
              }}
              style={{
                padding: '0.5rem',
                backgroundColor: '#F0F9FF',
                border: '1px solid #007AFF',
                borderRadius: '8px',
                color: '#007AFF',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🔔 Set Entry Alert
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                const ocoText = `${stock.symbol} AI RECOMMENDATION:
Signal: ${getRecommendationLabel(stock.aiAnalysis.recommendation)}
Confidence: ${stock.aiAnalysis.confidence}%
Entry: $${stock.aiAnalysis.entryPrice.toFixed(2)}
Stop: $${stock.aiAnalysis.stopLoss.toFixed(2)}
Target: $${stock.aiAnalysis.takeProfit.toFixed(2)}
R/R: ${stock.aiAnalysis.riskRewardRatio.toFixed(1)}:1
Risk Level: ${stock.aiAnalysis.riskLevel}
Time Horizon: ${stock.aiAnalysis.timeHorizon}

AI Analysis: ${stock.aiAnalysis.reasoning}`
                navigator.clipboard.writeText(ocoText)
                alert('📋 AI analysis copied to clipboard!')
              }}
              style={{
                padding: '0.5rem',
                backgroundColor: '#F0FDF4',
                border: '1px solid #34C759',
                borderRadius: '8px',
                color: '#34C759',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📋 Copy OCO
            </button>
          </div>

          {/* Technical Analysis Summary */}
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#F8F9FA',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <div style={{ fontSize: '12px', color: '#6E6E73', marginBottom: '0.5rem' }}>
              📊 Technical Analysis: {stock.aiAnalysis.technicalSignals.trend} ({stock.aiAnalysis.confidence}%)
            </div>
            <div style={{ fontSize: '11px', color: '#8E8E93', lineHeight: '1.4' }}>
              {stock.aiAnalysis.technicalSignals.momentum} momentum • {stock.aiAnalysis.technicalSignals.volatility} volatility
              <br/>
              Support: ${stock.aiAnalysis.technicalSignals.support.toFixed(2)} • 
              Resistance: ${stock.aiAnalysis.technicalSignals.resistance.toFixed(2)}
            </div>
          </div>

          {/* OCO Trading Strategies */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1D1D1F',
              marginBottom: '0.75rem',
              textAlign: 'center'
            }}>
              🎯<br/>OCO Trading Strategies
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '0.5rem'
            }}>
              {/* Conservative OCO */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setupOCONotifications(stock, 'conservative')
                }}
                style={{
                  padding: '12px 8px',
                  backgroundColor: 'white',
                  border: '2px solid #34C759',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#34C759', marginBottom: '4px' }}>
                  🛡️ CONSERVATIVE
                </div>
                <div style={{ fontSize: '10px', color: '#6E6E73', marginBottom: '6px' }}>
                  AI-powered • Low risk
                </div>
                <div style={{ fontSize: '9px', color: '#8E8E93' }}>
                  Entry: ${generateOCOByRiskProfile(stock, 'conservative').entry.toFixed(2)}<br/>
                  Stop: ${generateOCOByRiskProfile(stock, 'conservative').stop.toFixed(2)}<br/>
                  Target: ${generateOCOByRiskProfile(stock, 'conservative').target.toFixed(2)}
                </div>
                <div style={{ fontSize: '8px', color: '#34C759', marginTop: '4px', fontWeight: '600' }}>
                  R/R: {generateOCOByRiskProfile(stock, 'conservative').riskReward.toFixed(1)}:1
                </div>
              </button>

              {/* Moderate OCO */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setupOCONotifications(stock, 'moderate')
                }}
                style={{
                  padding: '12px 8px',
                  backgroundColor: 'white',
                  border: '2px solid #FF9500',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#FF9500', marginBottom: '4px' }}>
                  ⚖️ MODERATE
                </div>
                <div style={{ fontSize: '10px', color: '#6E6E73', marginBottom: '6px' }}>
                  AI-balanced • Medium risk
                </div>
                <div style={{ fontSize: '9px', color: '#8E8E93' }}>
                  Entry: ${generateOCOByRiskProfile(stock, 'moderate').entry.toFixed(2)}<br/>
                  Stop: ${generateOCOByRiskProfile(stock, 'moderate').stop.toFixed(2)}<br/>
                  Target: ${generateOCOByRiskProfile(stock, 'moderate').target.toFixed(2)}
                </div>
                <div style={{ fontSize: '8px', color: '#FF9500', marginTop: '4px', fontWeight: '600' }}>
                  R/R: {generateOCOByRiskProfile(stock, 'moderate').riskReward.toFixed(1)}:1
                </div>
              </button>

              {/* Aggressive OCO */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setupOCONotifications(stock, 'aggressive')
                }}
                style={{
                  padding: '12px 8px',
                  backgroundColor: 'white',
                  border: '2px solid #FF3B30',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#FF3B30', marginBottom: '4px' }}>
                  🚀 AGGRESSIVE
                </div>
                <div style={{ fontSize: '10px', color: '#6E6E73', marginBottom: '6px' }}>
                  AI-optimized • Higher risk
                </div>
                <div style={{ fontSize: '9px', color: '#8E8E93' }}>
                  Entry: ${generateOCOByRiskProfile(stock, 'aggressive').entry.toFixed(2)}<br/>
                  Stop: ${generateOCOByRiskProfile(stock, 'aggressive').stop.toFixed(2)}<br/>
                  Target: ${generateOCOByRiskProfile(stock, 'aggressive').target.toFixed(2)}
                </div>
                <div style={{ fontSize: '8px', color: '#FF3B30', marginTop: '4px', fontWeight: '600' }}>
                  R/R: {generateOCOByRiskProfile(stock, 'aggressive').riskReward.toFixed(1)}:1
                </div>
              </button>
            </div>

            <div style={{
              marginTop: '12px',
              padding: '8px',
              backgroundColor: 'rgba(0, 122, 255, 0.05)',
              borderRadius: '8px',
              fontSize: '10px',
              color: '#6E6E73',
              textAlign: 'center'
            }}>
              🤖 AI analyzes technical indicators, sentiment, volume & market conditions to generate dynamic OCO levels
            </div>
          </div>

          {/* Profit Potential & Risk Analysis */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '1rem'
          }}>
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(52, 199, 89, 0.1)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#6E6E73', marginBottom: '0.25rem' }}>
                Profit Potential
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#34C759' }}>
                +{stock.aiAnalysis.profitPotential.upside}%
              </div>
              <div style={{ fontSize: '10px', color: '#8E8E93' }}>
                Risk: -{stock.aiAnalysis.profitPotential.downside}%
              </div>
              <div style={{ fontSize: '10px', color: '#8E8E93' }}>
                R/R: {stock.aiAnalysis.riskRewardRatio}:1
              </div>
            </div>
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(0, 122, 255, 0.1)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#6E6E73', marginBottom: '0.25rem' }}>
                AI Probability
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#007AFF' }}>
                {stock.aiAnalysis.profitPotential.probability}%
              </div>
              <div style={{ fontSize: '10px', color: '#8E8E93' }}>
                {stock.aiAnalysis.timeHorizon} horizon
              </div>
              <div style={{ fontSize: '10px', color: '#8E8E93' }}>
                {stock.aiAnalysis.sentiment.newsCount} news items
              </div>
            </div>
          </div>

          {/* Alert Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSetAlert(stock.symbol, stock.aiAnalysis.takeProfit, 'above')
              }}
              style={{
                padding: '0.5rem',
                backgroundColor: 'rgba(52, 199, 89, 0.1)',
                border: '1px solid #34C759',
                borderRadius: '6px',
                color: '#34C759',
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
                onSetAlert(stock.symbol, stock.aiAnalysis.stopLoss, 'below')
              }}
              style={{
                padding: '0.5rem',
                backgroundColor: 'rgba(255, 59, 48, 0.1)',
                border: '1px solid #FF3B30',
                borderRadius: '6px',
                color: '#FF3B30',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ⚠️ Stop Alert
            </button>
          </div>
        </div>
      ))}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}