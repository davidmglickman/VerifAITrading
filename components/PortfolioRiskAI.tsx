'use client'

import { useState, useEffect } from 'react'
import HoverButton from './HoverButton'

interface PortfolioPosition {
  symbol: string
  shares: number
  avgCost: number
  currentPrice: number
  sector: string
  marketValue: number
  gainLoss: number
  gainLossPercent: number
}

interface RiskMetrics {
  portfolioValue: number
  totalGainLoss: number
  totalGainLossPercent: number
  beta: number
  sharpeRatio: number
  maxDrawdown: number
  volatility: number
  var95: number // Value at Risk (95% confidence)
  diversificationScore: number
  riskScore: number // 1-10 scale
}

interface SectorAllocation {
  sector: string
  allocation: number
  recommendedAllocation: number
  risk: 'low' | 'medium' | 'high'
}

interface RiskRecommendation {
  type: 'rebalance' | 'reduce' | 'add' | 'hedge'
  priority: 'high' | 'medium' | 'low'
  action: string
  reasoning: string
  impact: string
}

interface PortfolioRiskAnalysis {
  positions: PortfolioPosition[]
  metrics: RiskMetrics
  sectorAllocations: SectorAllocation[]
  recommendations: RiskRecommendation[]
  aiInsights: string[]
}

interface Props {
  positions: PortfolioPosition[]
  onRiskUpdate?: (analysis: PortfolioRiskAnalysis) => void
}

const PortfolioRiskAI: React.FC<Props> = ({ positions, onRiskUpdate }) => {
  const [analysis, setAnalysis] = useState<PortfolioRiskAnalysis | null>(null)
  const [loading, setLoading] = useState(false)

  const analyzeRisk = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/portfolio-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positions })
      })
      
      const data = await response.json()
      setAnalysis(data)
      onRiskUpdate?.(data)
    } catch (error) {
      console.error('Portfolio risk analysis error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskLevel: string | number) => {
    if (typeof riskLevel === 'number') {
      if (riskLevel <= 3) return '#34C759'
      if (riskLevel <= 6) return '#FF9500'
      return '#FF3B30'
    }
    
    switch (riskLevel) {
      case 'low': return '#34C759'
      case 'medium': return '#FF9500'
      case 'high': return '#FF3B30'
      default: return '#8E8E93'
    }
  }

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`
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
          🛡️ Portfolio Risk Analysis
        </h3>
        <HoverButton
          onClick={analyzeRisk}
          disabled={loading || positions.length === 0}
          variant="primary"
          style={{ padding: '0.5rem 1rem', fontSize: '14px' }}
        >
          {loading ? 'Analyzing...' : 'Analyze Risk'}
        </HoverButton>
      </div>

      {positions.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          color: '#6E6E73',
          fontSize: '14px'
        }}>
          Add positions to your watchlist to analyze portfolio risk
        </div>
      )}

      {analysis && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Risk Score Overview */}
          <div style={{
            padding: '1rem',
            backgroundColor: '#F8F9FA',
            borderRadius: '8px',
            border: `2px solid ${getRiskColor(analysis.metrics.riskScore)}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1D1D1F' }}>
                  Portfolio Risk Score
                </div>
                <div style={{ fontSize: '14px', color: '#6E6E73' }}>
                  Portfolio Value: {formatCurrency(analysis.metrics.portfolioValue)}
                </div>
                <div style={{ fontSize: '14px', color: analysis.metrics.totalGainLoss >= 0 ? '#34C759' : '#FF3B30' }}>
                  Total P&L: {formatCurrency(analysis.metrics.totalGainLoss)} ({formatPercent(analysis.metrics.totalGainLossPercent)})
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '36px', 
                  fontWeight: '600', 
                  color: getRiskColor(analysis.metrics.riskScore) 
                }}>
                  {analysis.metrics.riskScore}
                </div>
                <div style={{ fontSize: '12px', color: '#6E6E73' }}>out of 10</div>
              </div>
            </div>
          </div>

          {/* Key Risk Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#6E6E73', fontWeight: '600' }}>DIVERSIFICATION</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: getRiskColor(analysis.metrics.diversificationScore) }}>
                {analysis.metrics.diversificationScore}/10
              </div>
              <div style={{ fontSize: '12px', color: '#6E6E73' }}>
                {analysis.metrics.diversificationScore >= 7 ? 'Well diversified' : 
                 analysis.metrics.diversificationScore >= 4 ? 'Moderate risk' : 'High concentration'}
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#6E6E73', fontWeight: '600' }}>VOLATILITY</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#1D1D1F' }}>
                {(analysis.metrics.volatility * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: '12px', color: '#6E6E73' }}>
                Annual volatility
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#6E6E73', fontWeight: '600' }}>VALUE AT RISK</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#FF3B30' }}>
                {formatCurrency(analysis.metrics.var95)}
              </div>
              <div style={{ fontSize: '12px', color: '#6E6E73' }}>
                95% confidence (1 day)
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#6E6E73', fontWeight: '600' }}>BETA</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: analysis.metrics.beta > 1.2 ? '#FF3B30' : analysis.metrics.beta < 0.8 ? '#34C759' : '#007AFF' }}>
                {analysis.metrics.beta.toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: '#6E6E73' }}>
                vs S&P 500
              </div>
            </div>
          </div>

          {/* Sector Allocation */}
          <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F', margin: '0 0 0.75rem 0' }}>
              🏭 Sector Allocation vs Recommended
            </h4>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {analysis.sectorAllocations.map((sector, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ minWidth: '100px', fontSize: '12px', color: '#1D1D1F', fontWeight: '500' }}>
                    {sector.sector}
                  </div>
                  <div style={{ flex: 1, position: 'relative', height: '20px', backgroundColor: '#E5E5EA', borderRadius: '10px' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${sector.allocation}%`,
                        backgroundColor: getRiskColor(sector.risk),
                        borderRadius: '10px',
                        transition: 'width 0.3s ease'
                      }}
                    ></div>
                    <div
                      style={{
                        position: 'absolute',
                        left: `${sector.recommendedAllocation}%`,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '2px',
                        height: '24px',
                        backgroundColor: '#1D1D1F',
                        opacity: 0.7
                      }}
                    ></div>
                  </div>
                  <div style={{ minWidth: '80px', fontSize: '12px', color: '#6E6E73', textAlign: 'right' }}>
                    {sector.allocation.toFixed(1)}% / {sector.recommendedAllocation.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Recommendations */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F', margin: '0 0 0.75rem 0' }}>
              💡 Risk Management Recommendations
            </h4>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {analysis.recommendations.map((rec, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1rem',
                    backgroundColor: '#FAFAFA',
                    borderRadius: '8px',
                    border: '1px solid #E5E5EA'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span>{getPriorityEmoji(rec.priority)}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F', marginBottom: '0.25rem' }}>
                        {rec.action}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6E6E73', marginBottom: '0.25rem' }}>
                        {rec.reasoning}
                      </div>
                      <div style={{ fontSize: '12px', color: '#007AFF', fontWeight: '500' }}>
                        Expected Impact: {rec.impact}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Holdings */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F', margin: '0 0 0.75rem 0' }}>
              📊 Top Holdings
            </h4>
            <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
              {analysis.positions
                .sort((a, b) => b.marketValue - a.marketValue)
                .slice(0, 8)
                .map((position, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#FAFAFA',
                    borderRadius: '6px',
                    border: '1px solid #E5E5EA'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F' }}>
                      {position.symbol}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6E6E73' }}>
                      {position.shares} shares • {position.sector}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F' }}>
                      {formatCurrency(position.marketValue)}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: position.gainLoss >= 0 ? '#34C759' : '#FF3B30' 
                    }}>
                      {formatPercent(position.gainLossPercent)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F', margin: '0 0 0.5rem 0' }}>
              🤖 AI Risk Insights
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

export default PortfolioRiskAI
