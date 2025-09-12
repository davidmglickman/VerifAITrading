'use client'

import { useState, useEffect } from 'react'

interface SwingPattern {
  name: string
  confidence: number
  direction: 'bullish' | 'bearish' | 'neutral'
  timeframe: string
  description: string
  keyLevels: {
    support?: number
    resistance?: number
    breakoutLevel?: number
    target?: number
  }
}

interface Props {
  symbol: string
  onPatternUpdate?: (patterns: SwingPattern[]) => void
}

export default function SwingPatternScanner({ symbol, onPatternUpdate }: Props) {
  const [patterns, setPatterns] = useState<SwingPattern[]>([])
  const [loading, setLoading] = useState(false)
  const [lastScan, setLastScan] = useState<Date | null>(null)

  const scanForPatterns = async () => {
    if (!symbol) return
    
    setLoading(true)
    try {
      // Simulate pattern detection (in real app, this would call your AI API)
      const mockPatterns: SwingPattern[] = [
        {
          name: 'Bull Flag',
          confidence: 78,
          direction: 'bullish',
          timeframe: 'Daily',
          description: 'Strong uptrend followed by tight consolidation with decreasing volume',
          keyLevels: {
            support: 148.50,
            resistance: 152.20,
            breakoutLevel: 152.25,
            target: 158.00
          }
        },
        {
          name: 'Ascending Triangle',
          confidence: 65,
          direction: 'bullish',
          timeframe: '4H',
          description: 'Series of higher lows with consistent resistance at same level',
          keyLevels: {
            support: 149.80,
            resistance: 151.50,
            breakoutLevel: 151.55,
            target: 154.20
          }
        },
        {
          name: 'Volume Breakout',
          confidence: 82,
          direction: 'bullish',
          timeframe: 'Daily',
          description: 'Price broke above resistance with 3x average volume',
          keyLevels: {
            support: 150.00,
            breakoutLevel: 151.20,
            target: 155.60
          }
        }
      ]

      // Add some variation based on symbol
      const filteredPatterns = mockPatterns.filter(() => Math.random() > 0.3)
      
      setPatterns(filteredPatterns)
      setLastScan(new Date())
      onPatternUpdate?.(filteredPatterns)
    } catch (error) {
      console.error('Error scanning patterns:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (symbol) {
      scanForPatterns()
    }
  }, [symbol])

  const getPatternIcon = (pattern: SwingPattern) => {
    switch (pattern.name) {
      case 'Bull Flag':
      case 'Bear Flag':
        return '🚩'
      case 'Ascending Triangle':
      case 'Descending Triangle':
        return '📐'
      case 'Cup and Handle':
        return '☕'
      case 'Double Top':
      case 'Double Bottom':
        return '👥'
      case 'Volume Breakout':
        return '📊'
      default:
        return '📈'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#34C759'
    if (confidence >= 60) return '#FF9500'
    return '#FF3B30'
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
          🔍 Swing Pattern Scanner
        </h3>
        
        <button
          onClick={scanForPatterns}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: loading ? '#f0f0f0' : 'linear-gradient(135deg, #007AFF, #5856D6)',
            color: loading ? '#999' : 'white',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {loading ? 'Scanning...' : 'Refresh Scan'}
        </button>
      </div>

      {lastScan && (
        <div style={{
          fontSize: '0.75rem',
          color: '#6e6e73',
          marginBottom: '1rem'
        }}>
          Last scan: {lastScan.toLocaleTimeString()}
        </div>
      )}

      {patterns.length === 0 && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: '#6e6e73',
          fontSize: '0.875rem'
        }}>
          {symbol ? 'No swing patterns detected for ' + symbol : 'Enter a symbol to scan for patterns'}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {patterns.map((pattern, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '0.75rem',
              padding: '1rem',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{getPatternIcon(pattern)}</span>
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1d1d1f',
                    margin: 0
                  }}>
                    {pattern.name}
                  </h4>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6e6e73',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>{pattern.timeframe}</span>
                    <span>•</span>
                    <span style={{
                      color: pattern.direction === 'bullish' ? '#34C759' : 
                            pattern.direction === 'bearish' ? '#FF3B30' : '#6e6e73'
                    }}>
                      {pattern.direction.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{
                backgroundColor: getConfidenceColor(pattern.confidence),
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {pattern.confidence}%
              </div>
            </div>

            <p style={{
              fontSize: '0.875rem',
              color: '#424245',
              margin: '0 0 0.75rem 0',
              lineHeight: '1.4'
            }}>
              {pattern.description}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '0.5rem'
            }}>
              {pattern.keyLevels.support && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6e6e73' }}>Support</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#34C759' }}>
                    ${pattern.keyLevels.support.toFixed(2)}
                  </div>
                </div>
              )}
              
              {pattern.keyLevels.resistance && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6e6e73' }}>Resistance</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#FF3B30' }}>
                    ${pattern.keyLevels.resistance.toFixed(2)}
                  </div>
                </div>
              )}
              
              {pattern.keyLevels.breakoutLevel && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6e6e73' }}>Breakout</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#007AFF' }}>
                    ${pattern.keyLevels.breakoutLevel.toFixed(2)}
                  </div>
                </div>
              )}
              
              {pattern.keyLevels.target && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6e6e73' }}>Target</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#FF9500' }}>
                    ${pattern.keyLevels.target.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
