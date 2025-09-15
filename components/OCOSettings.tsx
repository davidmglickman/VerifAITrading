'use client'

import { useState } from 'react'
import { Holding } from './PortfolioHoldings'

interface OCOOrder {
  symbol: string
  currentPrice: number
  profitTarget: number
  stopLoss: number
  riskReward: number
  confidence: number
  reasoning: string
  timeHorizon: string
}

interface OCOSettingsProps {
  holdings: Holding[]
  watchlistSymbols: string[]
}

export default function OCOSettings({ holdings, watchlistSymbols }: OCOSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState('')
  const [ocoRecommendations, setOcoRecommendations] = useState<Record<string, OCOOrder>>({})
  const [activeTab, setActiveTab] = useState<'holdings' | 'watchlist'>('holdings')

  const allSymbols = activeTab === 'holdings' 
    ? holdings.map(h => h.symbol)
    : watchlistSymbols

  const generateOCOSettings = async (symbol: string) => {
    setLoading(true)
    try {
      const holding = holdings.find(h => h.symbol === symbol)
      
      // Use default values for missing parameters
      const currentPrice = holding?.currentPrice || 50 // Default price
      const accountSize = 50000 // Default account size
      const riskTolerance = 2 // Default 2% risk
      
      console.log('Generating OCO for:', { symbol, currentPrice, accountSize, riskTolerance })
      
      const response = await fetch('/api/ai/oco-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          currentPrice,
          accountSize,
          riskTolerance
        })
      })

      console.log('OCO API response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('OCO API error:', errorData)
        throw new Error(errorData.error || 'Failed to generate OCO recommendation')
      }

      const result = await response.json()
      console.log('OCO API result:', result)
      
      // Map the API response to our component format
      const ocoOrder: OCOOrder = {
        symbol: result.symbol,
        currentPrice: result.currentPrice,
        profitTarget: result.profitTarget,
        stopLoss: result.stopLoss,
        riskReward: result.riskRewardRatio,
        confidence: result.confidence,
        reasoning: result.reasoning,
        timeHorizon: result.timeframe
      }
      
      setOcoRecommendations(prev => ({
        ...prev,
        [symbol]: ocoOrder
      }))
      
      console.log('OCO recommendation generated successfully for', symbol)
    } catch (error) {
      console.error('Error generating OCO:', error)
      const errorMessage = error instanceof Error ? error.message : 'Please try again.'
      alert(`Failed to generate OCO settings for ${symbol}. ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const generateAllOCO = async () => {
    setLoading(true)
    try {
      for (const symbol of allSymbols.slice(0, 5)) { // Limit to 5 to avoid overwhelming
        await generateOCOSettings(symbol)
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const formatOCOForBroker = (oco: OCOOrder) => {
    return `${oco.symbol} OCO Order:
Profit Target: $${oco.profitTarget.toFixed(2)}
Stop Loss: $${oco.stopLoss.toFixed(2)}
Risk/Reward: ${oco.riskReward.toFixed(2)}:1
Confidence: ${oco.confidence}%
Duration: ${oco.timeHorizon}`
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      padding: '1.5rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#1d1d1f',
          margin: 0
        }}>
          🎯 AI OCO Settings
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={generateAllOCO}
            disabled={loading || allSymbols.length === 0}
            style={{
              padding: '0.5rem 1rem',
              background: loading ? '#8e8e93' : '#34C759',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {loading ? 'Generating...' : 'Generate All OCO'}
          </button>
        </div>
      </div>

      {/* Tab Selection */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #E5E5E7',
        marginBottom: '1rem'
      }}>
        <button
          onClick={() => setActiveTab('holdings')}
          style={{
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'holdings' ? '2px solid #007AFF' : '2px solid transparent',
            color: activeTab === 'holdings' ? '#007AFF' : '#8e8e93',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Current Holdings ({holdings.length})
        </button>
        <button
          onClick={() => setActiveTab('watchlist')}
          style={{
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'watchlist' ? '2px solid #007AFF' : '2px solid transparent',
            color: activeTab === 'watchlist' ? '#007AFF' : '#8e8e93',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Watchlist ({watchlistSymbols.length})
        </button>
      </div>

      {allSymbols.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: '#8e8e93',
          fontSize: '15px'
        }}>
          {activeTab === 'holdings' 
            ? '📊 Add holdings to get exit strategy OCO orders'
            : '👀 Add stocks to watchlist to get entry strategy OCO orders'
          }
        </div>
      ) : (
        <div>
          {/* Symbol Selector */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            marginBottom: '1.5rem'
          }}>
            {allSymbols.map(symbol => (
              <button
                key={symbol}
                onClick={() => generateOCOSettings(symbol)}
                disabled={loading}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: ocoRecommendations[symbol] ? '#E6F7EE' : '#F2F2F7',
                  color: ocoRecommendations[symbol] ? '#2F855A' : '#1d1d1f',
                  border: '1px solid #D1D1D6',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  position: 'relative'
                }}
              >
                {symbol}
                {ocoRecommendations[symbol] && (
                  <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: '#34C759',
                    color: 'white',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* OCO Recommendations */}
          {Object.entries(ocoRecommendations).map(([symbol, oco]) => (
            <div
              key={symbol}
              style={{
                backgroundColor: '#F2F2F7',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1d1d1f',
                  margin: 0
                }}>
                  {symbol} OCO Order
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: oco.confidence >= 80 ? '#34C759' : oco.confidence >= 60 ? '#FF9500' : '#FF3B30',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {oco.confidence}% confidence
                  </span>
                  <button
                    onClick={() => copyToClipboard(formatOCOForBroker(oco))}
                    style={{
                      background: 'none',
                      border: '1px solid #D1D1D6',
                      borderRadius: '6px',
                      padding: '0.25rem 0.5rem',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '12px', color: '#8e8e93', marginBottom: '4px' }}>
                    Current Price
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#1d1d1f' }}>
                    ${oco.currentPrice.toFixed(2)}
                  </div>
                </div>

                <div style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '12px', color: '#8e8e93', marginBottom: '4px' }}>
                    Profit Target
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#34C759' }}>
                    ${oco.profitTarget.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8e8e93' }}>
                    +{(((oco.profitTarget - oco.currentPrice) / oco.currentPrice) * 100).toFixed(1)}%
                  </div>
                </div>

                <div style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '12px', color: '#8e8e93', marginBottom: '4px' }}>
                    Stop Loss
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#FF3B30' }}>
                    ${oco.stopLoss.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8e8e93' }}>
                    {(((oco.stopLoss - oco.currentPrice) / oco.currentPrice) * 100).toFixed(1)}%
                  </div>
                </div>

                <div style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '12px', color: '#8e8e93', marginBottom: '4px' }}>
                    Risk/Reward
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#007AFF' }}>
                    {oco.riskReward.toFixed(2)}:1
                  </div>
                  <div style={{ fontSize: '12px', color: '#8e8e93' }}>
                    {oco.timeHorizon}
                  </div>
                </div>
              </div>

              <div style={{
                background: 'white',
                padding: '1rem',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1d1d1f', marginBottom: '0.5rem' }}>
                  AI Reasoning
                </div>
                <div style={{ fontSize: '14px', color: '#1d1d1f', lineHeight: '1.5' }}>
                  {oco.reasoning}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#8e8e93',
              fontSize: '15px'
            }}>
              🤖 AI is analyzing market conditions and generating OCO settings...
            </div>
          )}
        </div>
      )}
    </div>
  )
}