'use client'

import { useState, useEffect } from 'react'
import HoverButton from './HoverButton'

interface TechnicalIndicators {
  rsi: number
  macd: { signal: number, histogram: number, line: number }
  bollingerBands: { upper: number, middle: number, lower: number }
  sma20: number
  sma50: number
  volume: number
  support: number
  resistance: number
}

interface TechnicalAnalysis {
  symbol: string
  indicators: TechnicalIndicators
  patterns: string[]
  signals: {
    trend: 'bullish' | 'bearish' | 'neutral'
    strength: number
    confidence: number
  }
  aiInsights: string[]
}

interface Props {
  symbol: string
  onAnalysisUpdate?: (analysis: TechnicalAnalysis) => void
}

const TechnicalAnalysisAI: React.FC<Props> = ({ symbol, onAnalysisUpdate }) => {
  const [analysis, setAnalysis] = useState<TechnicalAnalysis | null>(null)
  const [loading, setLoading] = useState(false)

  const analyzeTechnicals = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/technical-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      })
      
      const data = await response.json()
      setAnalysis(data)
      onAnalysisUpdate?.(data)
    } catch (error) {
      console.error('Technical analysis error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'bullish': return '#34C759'
      case 'bearish': return '#FF3B30'
      default: return '#8E8E93'
    }
  }

  const getPatternEmoji = (pattern: string) => {
    const patterns: Record<string, string> = {
      'head_and_shoulders': '👑',
      'double_top': '⏫',
      'double_bottom': '⏬',
      'triangle': '📐',
      'flag': '🏁',
      'wedge': '📈',
      'channel': '📊'
    }
    return patterns[pattern] || '📈'
  }

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid #E5E5EA',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1D1D1F', margin: 0 }}>
          📊 Technical Analysis - {symbol}
        </h3>
        <HoverButton
          onClick={analyzeTechnicals}
          disabled={loading}
          variant="primary"
          style={{ padding: '0.5rem 1rem', fontSize: '14px' }}
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </HoverButton>
      </div>

      {analysis && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Signal Overview */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: '#F8F9FA',
            borderRadius: '8px'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: getSignalColor(analysis.signals.trend)
            }}></div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1D1D1F' }}>
                {analysis.signals.trend.toUpperCase()} Signal
              </div>
              <div style={{ fontSize: '14px', color: '#6E6E73' }}>
                Strength: {analysis.signals.strength}/10 | Confidence: {analysis.signals.confidence}%
              </div>
            </div>
          </div>

          {/* Technical Indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F', margin: '0 0 0.5rem 0' }}>
                RSI (14)
              </h4>
              <div style={{ fontSize: '18px', fontWeight: '600', color: analysis.indicators.rsi > 70 ? '#FF3B30' : analysis.indicators.rsi < 30 ? '#34C759' : '#007AFF' }}>
                {analysis.indicators.rsi.toFixed(1)}
              </div>
              <div style={{ fontSize: '12px', color: '#6E6E73' }}>
                {analysis.indicators.rsi > 70 ? 'Overbought' : analysis.indicators.rsi < 30 ? 'Oversold' : 'Neutral'}
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F', margin: '0 0 0.5rem 0' }}>
                MACD
              </h4>
              <div style={{ fontSize: '16px', fontWeight: '600', color: analysis.indicators.macd.histogram > 0 ? '#34C759' : '#FF3B30' }}>
                {analysis.indicators.macd.line > analysis.indicators.macd.signal ? '📈 Bullish' : '📉 Bearish'}
              </div>
              <div style={{ fontSize: '12px', color: '#6E6E73' }}>
                Histogram: {analysis.indicators.macd.histogram.toFixed(3)}
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F', margin: '0 0 0.5rem 0' }}>
                Support/Resistance
              </h4>
              <div style={{ fontSize: '14px', color: '#34C759' }}>
                📈 Support: ${analysis.indicators.support.toFixed(2)}
              </div>
              <div style={{ fontSize: '14px', color: '#FF3B30' }}>
                📉 Resistance: ${analysis.indicators.resistance.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Chart Patterns */}
          {analysis.patterns.length > 0 && (
            <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F', margin: '0 0 0.5rem 0' }}>
                Detected Patterns
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {analysis.patterns.map((pattern, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #D1D1D6',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#1D1D1F'
                    }}
                  >
                    {getPatternEmoji(pattern)} {pattern.replace('_', ' ').toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Insights */}
          <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F', margin: '0 0 0.5rem 0' }}>
              🤖 AI Insights
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
              {analysis.aiInsights.map((insight, index) => (
                <li key={index} style={{ fontSize: '14px', color: '#6E6E73', marginBottom: '0.25rem' }}>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default TechnicalAnalysisAI
