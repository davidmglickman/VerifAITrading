'use client'

import { useState, useEffect } from 'react'
import { marketDataService } from '../lib/market-data'

interface StockDetailViewProps {
  symbol: string
  onClose: () => void
  onSetAlert: (symbol: string, price: number, type: 'above' | 'below') => void
}

interface NewsItem {
  headline: string
  source: string
  time: string
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  summary: string
}

interface TechnicalAnalysis {
  rsi: number
  macd: { signal: string, value: number }
  movingAverages: { ma20: number, ma50: number, ma200: number }
  support: number
  resistance: number
  trendStrength: number
}

export default function StockDetailView({ symbol, onClose, onSetAlert }: StockDetailViewProps) {
  const [stockData, setStockData] = useState<any>(null)
  const [news, setNews] = useState<NewsItem[]>([])
  const [technical, setTechnical] = useState<TechnicalAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'technical'>('overview')

  useEffect(() => {
    loadStockDetail()
  }, [symbol])

  const loadStockDetail = async () => {
    setLoading(true)
    try {
      // Load stock quote
      const quote = await marketDataService.getStockQuote(symbol)
      setStockData(quote)
      
      // Load news
      const newsData = await generateNews()
      setNews(newsData)
      
      // Load technical analysis
      const techData = await generateTechnicalAnalysis()
      setTechnical(techData)
      
    } catch (error) {
      console.error('Error loading stock detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateNews = async (): Promise<NewsItem[]> => {
    // Simulate news data - in production this would come from news API
    const headlines = [
      'Q3 Earnings Beat Expectations with Strong Revenue Growth',
      'Analyst Upgrades Price Target Following Strategic Partnership',
      'New Product Launch Expected to Drive Market Share Gains',
      'Institutional Investors Increase Holdings by 15%',
      'CEO Interview Reveals Expansion Plans for 2025',
      'Technical Breakout Signals Potential Upside Move',
      'Market Volatility Creates Buying Opportunity',
      'Sector Rotation Benefits Leading Companies'
    ]
    
    return Array.from({ length: 5 }, (_, i) => ({
      headline: headlines[Math.floor(Math.random() * headlines.length)],
      source: ['Reuters', 'Bloomberg', 'CNBC', 'MarketWatch', 'Yahoo Finance'][Math.floor(Math.random() * 5)],
      time: `${Math.floor(Math.random() * 12) + 1}h ago`,
      sentiment: (['POSITIVE', 'NEGATIVE', 'NEUTRAL'] as const)[Math.floor(Math.random() * 3)],
      summary: 'AI-generated summary analyzing the impact on stock performance and trading outlook...'
    }))
  }

  const generateTechnicalAnalysis = async (): Promise<TechnicalAnalysis> => {
    const currentPrice = stockData?.currentPrice || 100
    
    return {
      rsi: Math.floor(Math.random() * 40) + 30, // 30-70 range
      macd: {
        signal: Math.random() > 0.5 ? 'BUY' : 'SELL',
        value: (Math.random() - 0.5) * 2
      },
      movingAverages: {
        ma20: currentPrice * (0.95 + Math.random() * 0.1),
        ma50: currentPrice * (0.90 + Math.random() * 0.2),
        ma200: currentPrice * (0.80 + Math.random() * 0.4)
      },
      support: currentPrice * (0.90 + Math.random() * 0.05),
      resistance: currentPrice * (1.05 + Math.random() * 0.05),
      trendStrength: Math.floor(Math.random() * 100)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE': return '#34C759'
      case 'NEGATIVE': return '#FF3B30'
      case 'NEUTRAL': return '#8E8E93'
      default: return '#8E8E93'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE': return '📈'
      case 'NEGATIVE': return '📉'
      case 'NEUTRAL': return '➡️'
      default: return '➡️'
    }
  }

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          width: '90%',
          maxWidth: '800px',
          height: '80%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '6px solid #E5E5E7',
            borderTopColor: '#007AFF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '900px',
        height: '90%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #E5E5E7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1D1D1F',
              margin: '0 0 4px 0'
            }}>
              {symbol}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <span style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1D1D1F'
              }}>
                ${stockData?.currentPrice?.toFixed(2) || '0.00'}
              </span>
              <span style={{
                fontSize: '14px',
                color: (stockData?.change || 0) >= 0 ? '#34C759' : '#FF3B30',
                fontWeight: '500'
              }}>
                {(stockData?.change || 0) >= 0 ? '+' : ''}{(stockData?.change || 0).toFixed(2)} ({(stockData?.changePercent || 0).toFixed(1)}%)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '20px',
              border: '1px solid #E5E5E7',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #E5E5E7'
        }}>
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'news', label: 'News' },
            { key: 'technical', label: 'Technical' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                flex: 1,
                padding: '1rem',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                fontWeight: '600',
                color: activeTab === tab.key ? '#007AFF' : '#8E8E93',
                borderBottom: activeTab === tab.key ? '2px solid #007AFF' : '2px solid transparent',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '1.5rem'
        }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Price Chart Placeholder */}
              <div style={{
                height: '200px',
                backgroundColor: '#F8F9FA',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #E5E5E7'
              }}>
                <div style={{ textAlign: 'center', color: '#8E8E93' }}>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>📊</div>
                  <div>Interactive Price Chart</div>
                  <div style={{ fontSize: '12px' }}>TradingView widget would be integrated here</div>
                </div>
              </div>

              {/* Key Metrics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem'
              }}>
                {[
                  { label: 'Volume', value: (stockData?.volume || 0).toLocaleString() },
                  { label: 'Market Cap', value: '$45.2B' },
                  { label: 'P/E Ratio', value: '18.5' },
                  { label: '52W High', value: '$185.20' },
                  { label: '52W Low', value: '$142.80' },
                  { label: 'Dividend', value: '2.4%' }
                ].map(metric => (
                  <div key={metric.label} style={{
                    backgroundColor: '#F8F9FA',
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '4px' }}>
                      {metric.label}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1D1D1F' }}>
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}>
                <button
                  onClick={() => onSetAlert(symbol, (stockData?.currentPrice || 0) * 1.05, 'above')}
                  style={{
                    padding: '12px',
                    backgroundColor: '#34C759',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🔔 Set Price Alert (+5%)
                </button>
                <button
                  onClick={() => onSetAlert(symbol, (stockData?.currentPrice || 0) * 0.95, 'below')}
                  style={{
                    padding: '12px',
                    backgroundColor: '#FF3B30',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ⚠️ Set Stop Alert (-5%)
                </button>
              </div>
            </div>
          )}

          {activeTab === 'news' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {news.map((item, index) => (
                <div key={index} style={{
                  padding: '1rem',
                  border: '1px solid #E5E5E7',
                  borderRadius: '12px',
                  backgroundColor: '#FAFAFA'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1D1D1F',
                      margin: 0,
                      flex: 1
                    }}>
                      {item.headline}
                    </h4>
                    <span style={{
                      fontSize: '12px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: getSentimentColor(item.sentiment),
                      color: 'white',
                      marginLeft: '8px'
                    }}>
                      {getSentimentIcon(item.sentiment)} {item.sentiment}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: '#8E8E93',
                    marginBottom: '8px'
                  }}>
                    <span>{item.source}</span>
                    <span>{item.time}</span>
                  </div>
                  <p style={{
                    fontSize: '13px',
                    color: '#6E6E73',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {item.summary}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'technical' && technical && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Technical Indicators */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#F8F9FA',
                  borderRadius: '12px'
                }}>
                  <h4 style={{ fontSize: '14px', color: '#8E8E93', margin: '0 0 8px 0' }}>RSI (14)</h4>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#1D1D1F' }}>
                    {technical.rsi}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: technical.rsi > 70 ? '#FF3B30' : technical.rsi < 30 ? '#34C759' : '#8E8E93'
                  }}>
                    {technical.rsi > 70 ? 'Overbought' : technical.rsi < 30 ? 'Oversold' : 'Neutral'}
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  backgroundColor: '#F8F9FA',
                  borderRadius: '12px'
                }}>
                  <h4 style={{ fontSize: '14px', color: '#8E8E93', margin: '0 0 8px 0' }}>MACD Signal</h4>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: technical.macd.signal === 'BUY' ? '#34C759' : '#FF3B30'
                  }}>
                    {technical.macd.signal}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8E8E93' }}>
                    Value: {technical.macd.value.toFixed(3)}
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  backgroundColor: '#F8F9FA',
                  borderRadius: '12px'
                }}>
                  <h4 style={{ fontSize: '14px', color: '#8E8E93', margin: '0 0 8px 0' }}>Trend Strength</h4>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#1D1D1F' }}>
                    {technical.trendStrength}%
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: technical.trendStrength > 70 ? '#34C759' : technical.trendStrength < 30 ? '#FF3B30' : '#8E8E93'
                  }}>
                    {technical.trendStrength > 70 ? 'Strong' : technical.trendStrength < 30 ? 'Weak' : 'Moderate'}
                  </div>
                </div>
              </div>

              {/* Support/Resistance */}
              <div style={{
                padding: '1rem',
                backgroundColor: '#F8F9FA',
                borderRadius: '12px'
              }}>
                <h4 style={{ fontSize: '16px', color: '#1D1D1F', margin: '0 0 16px 0' }}>Key Levels</h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '4px' }}>Resistance</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#FF3B30' }}>
                      ${technical.resistance.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '4px' }}>Support</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#34C759' }}>
                      ${technical.support.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Moving Averages */}
              <div style={{
                padding: '1rem',
                backgroundColor: '#F8F9FA',
                borderRadius: '12px'
              }}>
                <h4 style={{ fontSize: '16px', color: '#1D1D1F', margin: '0 0 16px 0' }}>Moving Averages</h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '1rem'
                }}>
                  {[
                    { label: 'MA20', value: technical.movingAverages.ma20 },
                    { label: 'MA50', value: technical.movingAverages.ma50 },
                    { label: 'MA200', value: technical.movingAverages.ma200 }
                  ].map(ma => (
                    <div key={ma.label}>
                      <div style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '4px' }}>
                        {ma.label}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F' }}>
                        ${ma.value.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
