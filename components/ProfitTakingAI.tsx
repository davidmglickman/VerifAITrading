'use client'

import { useState, useEffect } from 'react'
import HoverButton from './HoverButton'

interface Position {
  symbol: string
  entry_price: number
  current_price: number
  quantity: number
  position_type: 'long' | 'short'
  entry_date: string
  profit_loss: number
  profit_loss_percent: number
  trading_style: 'day_trading' | 'swing_trading'
  market_value: number
}

interface ProfitTakingRecommendation {
  symbol: string
  action: 'take_profit' | 'partial_profit' | 'hold' | 'add_stop_loss' | 'trail_stop'
  reason: string
  suggested_price: number
  confidence: number
  risk_level: 'low' | 'medium' | 'high'
  time_horizon: '1h' | '4h' | '1d' | '3d' | '1w'
  percentage_to_sell?: number
  stop_loss_price?: number
  expected_return?: number
  risk_reward_ratio?: number
}

interface ProfitAnalysis {
  positions: Position[]
  recommendations: ProfitTakingRecommendation[]
  total_unrealized_pnl: number
  total_unrealized_percent: number
  portfolio_value: number
  risk_score: number
  optimal_actions: number
}

interface Props {
  onRecommendationUpdate?: (analysis: ProfitAnalysis) => void
}

const ProfitTakingAI: React.FC<Props> = ({ onRecommendationUpdate }) => {
  const [analysis, setAnalysis] = useState<ProfitAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null)

  const analyzePositions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/profit-taking-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          include_day_trading: true,
          include_swing_trading: true,
          min_profit_threshold: 3
        })
      })
      
      const data = await response.json()
      setAnalysis(data)
      onRecommendationUpdate?.(data)
    } catch (error) {
      console.error('Profit analysis error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'take_profit': return '#34C759'
      case 'partial_profit': return '#FF9500'
      case 'trail_stop': return '#007AFF'
      case 'add_stop_loss': return '#8E8E93'
      default: return '#6E6E73'
    }
  }

  const getActionEmoji = (action: string) => {
    switch (action) {
      case 'take_profit': return '💰'
      case 'partial_profit': return '📊'
      case 'trail_stop': return '🎯'
      case 'add_stop_loss': return '🛡️'
      default: return '⏳'
    }
  }

  const getStyleEmoji = (style: string) => {
    return style === 'day_trading' ? '⚡' : '📈'
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#34C759'
      case 'medium': return '#FF9500'
      case 'high': return '#FF3B30'
      default: return '#8E8E93'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : ''
    return `${sign}${percent.toFixed(2)}%`
  }

  useEffect(() => {
    analyzePositions()
  }, [])

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
          💰 AI Profit-Taking Assistant
        </h3>
        <HoverButton
          onClick={analyzePositions}
          disabled={loading}
          variant="primary"
          style={{ padding: '0.5rem 1rem', fontSize: '14px' }}
        >
          {loading ? 'Analyzing...' : 'Refresh Analysis'}
        </HoverButton>
      </div>

      {analysis && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Portfolio Summary */}
          <div style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, #E8F5E8 0%, #F0FFF0 100%)',
            borderRadius: '8px',
            border: '1px solid #34C759'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1D1D1F', marginBottom: '0.25rem' }}>
                  📊 Portfolio Overview
                </div>
                <div style={{ fontSize: '14px', color: '#6E6E73' }}>
                  {analysis.positions.length} position{analysis.positions.length !== 1 ? 's' : ''} • 
                  {analysis.optimal_actions} action{analysis.optimal_actions !== 1 ? 's' : ''} recommended
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#34C759' }}>
                  {formatCurrency(analysis.total_unrealized_pnl)}
                </div>
                <div style={{ fontSize: '14px', color: '#34C759' }}>
                  {formatPercent(analysis.total_unrealized_percent)} unrealized
                </div>
              </div>
            </div>
          </div>

          {/* Risk Score */}
          <div style={{
            padding: '1rem',
            backgroundColor: '#F8F9FA',
            borderRadius: '8px',
            border: `2px solid ${analysis.risk_score >= 7 ? '#FF3B30' : analysis.risk_score >= 4 ? '#FF9500' : '#34C759'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1D1D1F', marginBottom: '0.25rem' }}>
                  🎲 Portfolio Risk Score
                </div>
                <div style={{ fontSize: '14px', color: '#6E6E73' }}>
                  Based on position concentration and profit levels
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '600', 
                  color: analysis.risk_score >= 7 ? '#FF3B30' : analysis.risk_score >= 4 ? '#FF9500' : '#34C759'
                }}>
                  {analysis.risk_score}/10
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: analysis.risk_score >= 7 ? '#FF3B30' : analysis.risk_score >= 4 ? '#FF9500' : '#34C759',
                  fontWeight: '600'
                }}>
                  {analysis.risk_score >= 7 ? 'HIGH RISK' : analysis.risk_score >= 4 ? 'MEDIUM RISK' : 'LOW RISK'}
                </div>
              </div>
            </div>
          </div>

          {/* Positions & Recommendations */}
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1D1D1F', margin: 0 }}>
              🎯 Position Recommendations
            </h4>
            
            {analysis.positions.map((position, index) => {
              const recommendation = analysis.recommendations[index]
              if (!recommendation) return null

              const isSelected = selectedPosition === position.symbol
              const actionColor = getActionColor(recommendation.action)

              return (
                <div
                  key={position.symbol}
                  style={{
                    padding: '1rem',
                    backgroundColor: isSelected ? '#F0F8FF' : '#FAFAFA',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #007AFF' : '1px solid #E5E5EA',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setSelectedPosition(isSelected ? null : position.symbol)}
                >
                  {/* Position Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: '#1D1D1F' }}>
                        {position.symbol}
                      </div>
                      <span style={{ fontSize: '16px' }}>
                        {getStyleEmoji(position.trading_style)}
                      </span>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#8E8E93',
                        backgroundColor: '#F2F2F7',
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        {position.trading_style.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#34C759' }}>
                        {formatCurrency(position.profit_loss)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#34C759' }}>
                        {formatPercent(position.profit_loss_percent)}
                      </div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '20px' }}>{getActionEmoji(recommendation.action)}</span>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: actionColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {recommendation.action.replace('_', ' ')}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', color: '#6E6E73', lineHeight: '1.4' }}>
                        {recommendation.reason}
                      </div>
                    </div>
                  </div>

                  {/* Details Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
                    <div style={{ fontSize: '12px' }}>
                      <span style={{ color: '#8E8E93' }}>Confidence:</span>{' '}
                      <span style={{ fontWeight: '600', color: '#1D1D1F' }}>{recommendation.confidence}%</span>
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      <span style={{ color: '#8E8E93' }}>Risk:</span>{' '}
                      <span style={{ fontWeight: '600', color: getRiskColor(recommendation.risk_level) }}>
                        {recommendation.risk_level.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      <span style={{ color: '#8E8E93' }}>Timeline:</span>{' '}
                      <span style={{ fontWeight: '600', color: '#1D1D1F' }}>{recommendation.time_horizon}</span>
                    </div>
                    {recommendation.suggested_price && (
                      <div style={{ fontSize: '12px' }}>
                        <span style={{ color: '#8E8E93' }}>Target:</span>{' '}
                        <span style={{ fontWeight: '600', color: actionColor }}>
                          ${recommendation.suggested_price.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isSelected && (
                    <div style={{ 
                      marginTop: '1rem', 
                      paddingTop: '1rem', 
                      borderTop: '1px solid #E5E5EA',
                      display: 'grid',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '0.25rem' }}>Position Details</div>
                          <div style={{ fontSize: '13px', color: '#6E6E73' }}>
                            Entry: ${position.entry_price.toFixed(2)}<br/>
                            Current: ${position.current_price.toFixed(2)}<br/>
                            Quantity: {position.quantity} shares<br/>
                            Value: {formatCurrency(position.market_value)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '0.25rem' }}>Action Details</div>
                          <div style={{ fontSize: '13px', color: '#6E6E73' }}>
                            {recommendation.percentage_to_sell && (
                              <>Sell: {recommendation.percentage_to_sell}% of position<br/></>
                            )}
                            {recommendation.stop_loss_price && (
                              <>Stop Loss: ${recommendation.stop_loss_price.toFixed(2)}<br/></>
                            )}
                            {recommendation.risk_reward_ratio && (
                              <>Risk/Reward: 1:{recommendation.risk_reward_ratio.toFixed(1)}<br/></>
                            )}
                            {recommendation.expected_return && (
                              <>Expected Return: {formatCurrency(recommendation.expected_return)}<br/></>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Trading Style Guide */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#FFF3E0', borderRadius: '8px', border: '1px solid #FF9500' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '18px' }}>⚡</span>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F' }}>Day Trading Tips</div>
              </div>
              <div style={{ fontSize: '13px', color: '#6E6E73', lineHeight: '1.4' }}>
                • Take profits aggressively (5-8%+)<br/>
                • Avoid overnight positions<br/>
                • Use tight stop-losses<br/>
                • Monitor volume and momentum
              </div>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#E3F2FD', borderRadius: '8px', border: '1px solid #2196F3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '18px' }}>📈</span>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F' }}>Swing Trading Tips</div>
              </div>
              <div style={{ fontSize: '13px', color: '#6E6E73', lineHeight: '1.4' }}>
                • Target 10-20% gains<br/>
                • Use trailing stops<br/>
                • Take partial profits<br/>
                • Follow trend and support levels
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfitTakingAI
