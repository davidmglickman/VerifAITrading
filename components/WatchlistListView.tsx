'use client'

import { useState, useEffect } from 'react'
import { aiStockAnalysisService, AIStockAnalysis } from '../lib/ai-stock-analysis'
import { ocoNotificationService } from '../lib/oco-notifications'

interface StockListData {
  symbol: string
  companyName: string
  aiAnalysis: AIStockAnalysis
  topPick: boolean
  lastUpdated: string
}

interface WatchlistListViewProps {
  watchlist: Array<{ symbol: string; id: string }>
  onStockClick: (symbol: string) => void
  onSetAlert: (symbol: string, price: number, type: 'above' | 'below') => void
  userId?: string
}

export default function WatchlistListView({ 
  watchlist, 
  onStockClick, 
  onSetAlert,
  userId = "550e8400-e29b-41d4-a716-446655440000"
}: WatchlistListViewProps) {
  const [stocksData, setStocksData] = useState<StockListData[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const setupOCONotifications = async (
    stock: StockListData, 
    profile: 'conservative' | 'moderate' | 'aggressive'
  ) => {
    try {
      const ocoData = generateOCOByRiskProfile(stock, profile)
      
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
      const enhancedData: StockListData[] = await Promise.all(
        watchlist.map(async (stock) => {
          console.log(`🔍 Analyzing ${stock.symbol} for list view...`)
          
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
        if (a.topPick && !b.topPick) return -1
        if (!a.topPick && b.topPick) return 1
        return b.aiAnalysis.confidence - a.aiAnalysis.confidence
      })
      
      setStocksData(enhancedData)
    } catch (error) {
      console.error('Error loading list stock data:', error)
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

  const toggleExpanded = (symbol: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(symbol)) {
        newSet.delete(symbol)
      } else {
        newSet.add(symbol)
      }
      return newSet
    })
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

  const generateOCOByRiskProfile = (stock: StockListData, profile: 'conservative' | 'moderate' | 'aggressive') => {
    const currentPrice = stock.aiAnalysis.currentPrice
    const { stopLoss, takeProfit } = stock.aiAnalysis
    
    let adjustedStop, adjustedTarget, positionSize, confidence
    
    if (profile === 'conservative') {
      adjustedStop = currentPrice - (currentPrice - stopLoss) * 0.7
      adjustedTarget = currentPrice + (takeProfit - currentPrice) * 0.6
      positionSize = '25% position'
      confidence = Math.min(stock.aiAnalysis.confidence + 5, 95)
    } else if (profile === 'moderate') {
      adjustedStop = stopLoss
      adjustedTarget = takeProfit
      positionSize = '50% position'
      confidence = stock.aiAnalysis.confidence
    } else {
      adjustedStop = currentPrice - (currentPrice - stopLoss) * 1.3
      adjustedTarget = currentPrice + (takeProfit - currentPrice) * 1.4
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
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      overflow: 'hidden'
    }}>
      {/* Table Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '150px 1fr 120px 140px 120px 100px 60px',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: '#F8F9FA',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        fontSize: '12px',
        fontWeight: '600',
        color: '#6E6E73'
      }}>
        <div>SYMBOL</div>
        <div>AI ANALYSIS & CATALYST</div>
        <div>PRICE</div>
        <div>RECOMMENDATION</div>
        <div>TARGETS</div>
        <div>PROFIT</div>
        <div></div>
      </div>

      {/* Stock Rows */}
      {stocksData.map((stock) => (
        <div key={stock.symbol}>
          {/* Main Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '150px 1fr 120px 140px 120px 100px 60px',
              gap: '1rem',
              padding: '1rem',
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              backgroundColor: stock.topPick ? 'rgba(0, 122, 255, 0.02)' : 'white'
            }}
            onClick={() => onStockClick(stock.symbol)}
            onMouseEnter={(e) => {
              if (!stock.topPick) {
                e.currentTarget.style.backgroundColor = '#F8F9FA'
              }
            }}
            onMouseLeave={(e) => {
              if (!stock.topPick) {
                e.currentTarget.style.backgroundColor = 'white'
              }
            }}
          >
            {/* Symbol Column */}
            <div>
              <div style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#1D1D1F',
                marginBottom: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {stock.symbol}
                {stock.topPick && (
                  <span style={{
                    fontSize: '10px',
                    backgroundColor: '#007AFF',
                    color: 'white',
                    padding: '2px 4px',
                    borderRadius: '4px'
                  }}>
                    ⭐
                  </span>
                )}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#8E8E93',
                marginBottom: '4px'
              }}>
                {stock.companyName}
              </div>
              <div style={{
                fontSize: '10px',
                fontWeight: '500',
                color: 'white',
                backgroundColor: stock.aiAnalysis.riskLevel === 'LOW' ? '#34C759' : 
                              stock.aiAnalysis.riskLevel === 'MEDIUM' ? '#FF9500' : '#FF3B30',
                padding: '2px 4px',
                borderRadius: '3px',
                display: 'inline-block'
              }}>
                {stock.aiAnalysis.riskLevel} RISK
              </div>
            </div>

            {/* AI Analysis & Catalyst Column */}
            <div>
              <div style={{
                fontSize: '12px',
                color: '#6E6E73',
                lineHeight: '1.3',
                marginBottom: '6px'
              }}>
                💡 {stock.aiAnalysis.reasoning.length > 80 
                  ? stock.aiAnalysis.reasoning.slice(0, 80) + '...' 
                  : stock.aiAnalysis.reasoning}
              </div>
              {stock.aiAnalysis.sentiment.topCatalyst && (
                <div style={{
                  fontSize: '11px',
                  color: '#007AFF',
                  backgroundColor: 'rgba(0,122,255,0.08)',
                  padding: '4px 6px',
                  borderRadius: '4px',
                  marginBottom: '4px'
                }}>
                  📰 {stock.aiAnalysis.sentiment.topCatalyst.length > 60 
                    ? stock.aiAnalysis.sentiment.topCatalyst.slice(0, 60) + '...' 
                    : stock.aiAnalysis.sentiment.topCatalyst}
                </div>
              )}
              <div style={{
                fontSize: '10px',
                color: '#8E8E93'
              }}>
                {stock.aiAnalysis.technicalSignals.trend} • {stock.aiAnalysis.technicalSignals.momentum} momentum • Vol: {(stock.aiAnalysis.volume / 1000000).toFixed(1)}M
              </div>
            </div>

            {/* Price Column */}
            <div>
              <div style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#1D1D1F',
                marginBottom: '2px'
              }}>
                ${stock.aiAnalysis.currentPrice.toFixed(2)}
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: '500',
                color: stock.aiAnalysis.priceChangePercent >= 0 ? '#34C759' : '#FF3B30'
              }}>
                {stock.aiAnalysis.priceChangePercent >= 0 ? '+' : ''}
                {stock.aiAnalysis.priceChangePercent.toFixed(2)}%
              </div>
              <div style={{
                fontSize: '11px',
                color: '#8E8E93'
              }}>
                ${stock.aiAnalysis.priceChange.toFixed(2)}
              </div>
            </div>

            {/* Recommendation Column */}
            <div>
              <div style={{
                fontSize: '12px',
                fontWeight: '700',
                color: getRecommendationColor(stock.aiAnalysis.recommendation),
                marginBottom: '2px'
              }}>
                {getRecommendationLabel(stock.aiAnalysis.recommendation)}
              </div>
              <div style={{
                fontSize: '11px',
                backgroundColor: 'rgba(0, 122, 255, 0.1)',
                color: '#007AFF',
                padding: '2px 4px',
                borderRadius: '3px',
                display: 'inline-block',
                marginBottom: '2px'
              }}>
                {stock.aiAnalysis.confidence}% Confidence
              </div>
              <div style={{
                fontSize: '10px',
                color: '#8E8E93'
              }}>
                {stock.aiAnalysis.timeHorizon} horizon
              </div>
            </div>

            {/* Targets Column */}
            <div>
              <div style={{ fontSize: '11px', marginBottom: '2px' }}>
                <span style={{ color: '#007AFF' }}>Entry: ${stock.aiAnalysis.entryPrice.toFixed(2)}</span>
              </div>
              <div style={{ fontSize: '11px', marginBottom: '2px' }}>
                <span style={{ color: '#FF3B30' }}>Stop: ${stock.aiAnalysis.stopLoss.toFixed(2)}</span>
              </div>
              <div style={{ fontSize: '11px' }}>
                <span style={{ color: '#34C759' }}>Target: ${stock.aiAnalysis.takeProfit.toFixed(2)}</span>
              </div>
            </div>

            {/* Profit Column */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#34C759',
                marginBottom: '2px'
              }}>
                +{stock.aiAnalysis.profitPotential.upside}%
              </div>
              <div style={{ fontSize: '10px', color: '#8E8E93', marginBottom: '2px' }}>
                Risk: -{stock.aiAnalysis.profitPotential.downside}%
              </div>
              <div style={{ fontSize: '10px', color: '#8E8E93' }}>
                {stock.aiAnalysis.profitPotential.probability}% prob
              </div>
            </div>

            {/* Expand Button Column */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpanded(stock.symbol)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007AFF',
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {expandedRows.has(stock.symbol) ? '▼' : '▶'}
              </button>
            </div>
          </div>

          {/* Expanded Row - OCO Strategies */}
          {expandedRows.has(stock.symbol) && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#F8F9FA',
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1D1D1F',
                marginBottom: '1rem'
              }}>
                🎯 OCO Trading Strategies for {stock.symbol}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                {/* Conservative OCO */}
                <div style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '2px solid #34C759',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#34C759',
                    marginBottom: '4px'
                  }}>
                    🛡️ CONSERVATIVE
                  </div>
                  <div style={{ fontSize: '11px', color: '#6E6E73', marginBottom: '6px' }}>
                    AI-powered • Low risk
                  </div>
                  {(() => {
                    const conservativeOCO = generateOCOByRiskProfile(stock, 'conservative')
                    return (
                      <>
                        <div style={{ fontSize: '10px', color: '#8E8E93', marginBottom: '4px' }}>
                          Entry: ${conservativeOCO.entry.toFixed(2)}<br/>
                          Stop: ${conservativeOCO.stop.toFixed(2)}<br/>
                          Target: ${conservativeOCO.target.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '9px', color: '#34C759', fontWeight: '600' }}>
                          R/R: {conservativeOCO.riskReward.toFixed(1)}:1 • {conservativeOCO.positionSize}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setupOCONotifications(stock, 'conservative')
                          }}
                          style={{
                            fontSize: '9px',
                            padding: '4px 6px',
                            backgroundColor: '#34C759',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '4px',
                            width: '100%'
                          }}
                        >
                          📋 Copy OCO
                        </button>
                      </>
                    )
                  })()}
                </div>

                {/* Moderate OCO */}
                <div style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '2px solid #FF9500',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#FF9500',
                    marginBottom: '4px'
                  }}>
                    ⚖️ MODERATE
                  </div>
                  <div style={{ fontSize: '11px', color: '#6E6E73', marginBottom: '6px' }}>
                    AI-balanced • Medium risk
                  </div>
                  {(() => {
                    const moderateOCO = generateOCOByRiskProfile(stock, 'moderate')
                    return (
                      <>
                        <div style={{ fontSize: '10px', color: '#8E8E93', marginBottom: '4px' }}>
                          Entry: ${moderateOCO.entry.toFixed(2)}<br/>
                          Stop: ${moderateOCO.stop.toFixed(2)}<br/>
                          Target: ${moderateOCO.target.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '9px', color: '#FF9500', fontWeight: '600' }}>
                          R/R: {moderateOCO.riskReward.toFixed(1)}:1 • {moderateOCO.positionSize}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setupOCONotifications(stock, 'moderate')
                          }}
                          style={{
                            fontSize: '9px',
                            padding: '4px 6px',
                            backgroundColor: '#FF9500',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '4px',
                            width: '100%'
                          }}
                        >
                          📋 Copy OCO
                        </button>
                      </>
                    )
                  })()}
                </div>

                {/* Aggressive OCO */}
                <div style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '2px solid #FF3B30',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#FF3B30',
                    marginBottom: '4px'
                  }}>
                    🚀 AGGRESSIVE
                  </div>
                  <div style={{ fontSize: '11px', color: '#6E6E73', marginBottom: '6px' }}>
                    AI-optimized • Higher risk
                  </div>
                  {(() => {
                    const aggressiveOCO = generateOCOByRiskProfile(stock, 'aggressive')
                    return (
                      <>
                        <div style={{ fontSize: '10px', color: '#8E8E93', marginBottom: '4px' }}>
                          Entry: ${aggressiveOCO.entry.toFixed(2)}<br/>
                          Stop: ${aggressiveOCO.stop.toFixed(2)}<br/>
                          Target: ${aggressiveOCO.target.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '9px', color: '#FF3B30', fontWeight: '600' }}>
                          R/R: {aggressiveOCO.riskReward.toFixed(1)}:1 • {aggressiveOCO.positionSize}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setupOCONotifications(stock, 'aggressive')
                          }}
                          style={{
                            fontSize: '9px',
                            padding: '4px 6px',
                            backgroundColor: '#FF3B30',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '4px',
                            width: '100%'
                          }}
                        >
                          📋 Copy OCO
                        </button>
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'center'
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onSetAlert(stock.symbol, stock.aiAnalysis.takeProfit, 'above')
                  }}
                  style={{
                    padding: '8px 12px',
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
                    padding: '8px 12px',
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
          )}
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