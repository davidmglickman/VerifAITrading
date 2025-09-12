'use client'

import { useState, useEffect } from 'react'

interface TimeframeAnalysis {
  timeframe: string
  trend: 'bullish' | 'bearish' | 'neutral'
  strength: number
  key_levels: {
    support: number
    resistance: number
  }
  indicators: {
    rsi: number
    macd_signal: 'bullish' | 'bearish' | 'neutral'
    moving_average: 'above' | 'below' | 'at'
  }
}

interface MultiTimeframeData {
  symbol: string
  alignment_score: number
  overall_bias: 'bullish' | 'bearish' | 'neutral'
  timeframes: TimeframeAnalysis[]
  recommendation: string
}

interface Props {
  symbol: string
  onAnalysisUpdate?: (analysis: MultiTimeframeData) => void
}

export default function MultiTimeframeAnalysis({ symbol, onAnalysisUpdate }: Props) {
  const [analysis, setAnalysis] = useState<MultiTimeframeData | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const analyzeTimeframes = async () => {
    if (!symbol) return
    
    setLoading(true)
    try {
      // Simulate multi-timeframe analysis (in real app, this would call your AI API)
      const mockData: MultiTimeframeData = {
        symbol,
        alignment_score: 75,
        overall_bias: 'bullish',
        timeframes: [
          {
            timeframe: 'Daily',
            trend: 'bullish',
            strength: 8,
            key_levels: { support: 148.50, resistance: 155.00 },
            indicators: { rsi: 58, macd_signal: 'bullish', moving_average: 'above' }
          },
          {
            timeframe: '4H',
            trend: 'bullish',
            strength: 7,
            key_levels: { support: 150.20, resistance: 152.80 },
            indicators: { rsi: 62, macd_signal: 'bullish', moving_average: 'above' }
          },
          {
            timeframe: '1H',
            trend: 'neutral',
            strength: 5,
            key_levels: { support: 150.80, resistance: 151.50 },
            indicators: { rsi: 48, macd_signal: 'neutral', moving_average: 'at' }
          },
          {
            timeframe: '15M',
            trend: 'bearish',
            strength: 3,
            key_levels: { support: 150.90, resistance: 151.20 },
            indicators: { rsi: 35, macd_signal: 'bearish', moving_average: 'below' }
          }
        ],
        recommendation: 'Higher timeframes show bullish alignment. Wait for 1H/15M to align for optimal entry.'
      }

      setAnalysis(mockData)
      onAnalysisUpdate?.(mockData)
    } catch (error) {
      console.error('Error analyzing timeframes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (symbol) {
      analyzeTimeframes()
    }
  }, [symbol])

  useEffect(() => {
    if (autoRefresh && symbol) {
      const interval = setInterval(analyzeTimeframes, 60000) // Refresh every minute
      return () => clearInterval(interval)
    }
  }, [autoRefresh, symbol])

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return '#34C759'
      case 'bearish': return '#FF3B30'
      default: return '#6e6e73'
    }
  }

  const getStrengthWidth = (strength: number) => `${(strength / 10) * 100}%`

  const getAlignmentColor = (score: number) => {
    if (score >= 80) return '#34C759'
    if (score >= 60) return '#FF9500'
    return '#FF3B30'
  }

  if (!analysis && !loading) {
    return (
      <div style={{
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1d1d1f', marginBottom: '1rem' }}>
          ⏰ Multi-Timeframe Analysis
        </h3>
        <p style={{ color: '#6e6e73', fontSize: '0.875rem' }}>
          {symbol ? 'Loading analysis...' : 'Select a symbol to view multi-timeframe analysis'}
        </p>
      </div>
    )
  }

  return (
    <div style={{
      backdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '1rem',
      padding: '1.5rem',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#1d1d1f',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ⏰ Multi-Timeframe Analysis
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#424245' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ accentColor: '#007AFF' }}
            />
            Auto-refresh
          </label>
          
          <button
            onClick={analyzeTimeframes}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: loading ? '#f0f0f0' : 'linear-gradient(135deg, #007AFF, #5856D6)',
              color: loading ? '#999' : 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Analyzing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {analysis && (
        <>
          {/* Overall Alignment */}
          <div style={{
            backgroundColor: 'rgba(0, 122, 255, 0.05)',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            border: '1px solid rgba(0, 122, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1d1d1f', margin: 0 }}>
                Timeframe Alignment
              </h4>
              <div style={{
                backgroundColor: getAlignmentColor(analysis.alignment_score),
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {analysis.alignment_score}% Aligned
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem'
            }}>
              <span style={{ fontSize: '0.875rem', color: '#424245' }}>Overall Bias:</span>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: getTrendColor(analysis.overall_bias),
                textTransform: 'uppercase'
              }}>
                {analysis.overall_bias}
              </span>
            </div>
            
            <p style={{
              fontSize: '0.875rem',
              color: '#424245',
              margin: 0,
              fontStyle: 'italic'
            }}>
              {analysis.recommendation}
            </p>
          </div>

          {/* Timeframe Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {analysis.timeframes.map((tf, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  border: '1px solid rgba(0, 0, 0, 0.1)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <h5 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1d1d1f',
                    margin: 0
                  }}>
                    {tf.timeframe}
                  </h5>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: getTrendColor(tf.trend),
                      textTransform: 'uppercase'
                    }}>
                      {tf.trend}
                    </span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6e6e73' }}>Strength:</span>
                      <div style={{
                        width: '60px',
                        height: '8px',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: getStrengthWidth(tf.strength),
                          height: '100%',
                          backgroundColor: getTrendColor(tf.trend),
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{tf.strength}/10</span>
                    </div>
                  </div>
                </div>

                {/* Key Levels */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6e6e73' }}>Support</div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: '#34C759' }}>
                      ${tf.key_levels.support.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6e6e73' }}>Resistance</div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: '#FF3B30' }}>
                      ${tf.key_levels.resistance.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Indicators */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  fontSize: '0.75rem',
                  color: '#6e6e73'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div>RSI</div>
                    <div style={{ fontWeight: '600', color: '#1d1d1f' }}>{tf.indicators.rsi}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div>MACD</div>
                    <div style={{ 
                      fontWeight: '600', 
                      color: getTrendColor(tf.indicators.macd_signal),
                      textTransform: 'capitalize'
                    }}>
                      {tf.indicators.macd_signal}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div>MA Position</div>
                    <div style={{ 
                      fontWeight: '600',
                      color: tf.indicators.moving_average === 'above' ? '#34C759' :
                            tf.indicators.moving_average === 'below' ? '#FF3B30' : '#6e6e73',
                      textTransform: 'capitalize'
                    }}>
                      {tf.indicators.moving_average}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
