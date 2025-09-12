'use client'

import { useState, useEffect } from 'react'
import HoverButton from './HoverButton'

interface OCORecommendation {
  symbol: string
  currentPrice: number
  entryPrice: number
  profitTarget: number
  stopLoss: number
  expectedProfit: number
  maxRisk: number
  riskRewardRatio: number
  probability: number
  timeframe: string
  reasoning: string
  strategy: 'swing' | 'day' | 'position'
  confidence: number
}

interface Props {
  symbol: string
  currentPrice: number
  accountSize: number
  riskTolerance: number // percentage of account willing to risk
}

const OCORecommendationAI: React.FC<Props> = ({ 
  symbol, 
  currentPrice, 
  accountSize, 
  riskTolerance 
}) => {
  const [recommendation, setRecommendation] = useState<OCORecommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const [customRisk, setCustomRisk] = useState(riskTolerance)

  const generateOCORecommendation = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/oco-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          symbol, 
          currentPrice, 
          accountSize, 
          riskTolerance: customRisk 
        })
      })
      
      const data = await response.json()
      setRecommendation(data)
    } catch (error) {
      console.error('OCO recommendation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePositionSize = () => {
    if (!recommendation) return 0
    const riskAmount = accountSize * (customRisk / 100)
    const priceRisk = Math.abs(recommendation.entryPrice - recommendation.stopLoss)
    return Math.floor(riskAmount / priceRisk)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#34C759'
    if (confidence >= 60) return '#FF9500'
    return '#FF3B30'
  }

  const getStrategyEmoji = (strategy: string) => {
    switch (strategy) {
      case 'swing': return '🏄‍♂️'
      case 'day': return '⚡'
      case 'position': return '🏔️'
      default: return '📈'
    }
  }

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid #E5E5EA',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1D1D1F', margin: '0 0 1rem 0' }}>
          🎯 OCO Order Recommendation - {symbol}
        </h3>
        
        {/* Risk Tolerance Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <label style={{ fontSize: '14px', color: '#6E6E73', minWidth: '120px' }}>
            Risk Tolerance:
          </label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={customRisk}
            onChange={(e) => setCustomRisk(parseFloat(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '14px', color: '#1D1D1F', minWidth: '60px' }}>
            {customRisk}%
          </span>
        </div>

        <HoverButton
          onClick={generateOCORecommendation}
          disabled={loading}
          variant="primary"
          style={{ width: '100%', padding: '0.75rem', fontSize: '16px' }}
        >
          {loading ? 'Analyzing Market...' : 'Generate OCO Recommendation'}
        </HoverButton>
      </div>

      {recommendation && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Strategy Overview */}
          <div style={{
            padding: '1rem',
            backgroundColor: '#F8F9FA',
            borderRadius: '8px',
            border: `2px solid ${getConfidenceColor(recommendation.confidence)}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1D1D1F' }}>
                  {getStrategyEmoji(recommendation.strategy)} {recommendation.strategy.toUpperCase()} Strategy
                </div>
                <div style={{ fontSize: '14px', color: '#6E6E73' }}>
                  Timeframe: {recommendation.timeframe}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#6E6E73' }}>Confidence</div>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: getConfidenceColor(recommendation.confidence) 
                }}>
                  {recommendation.confidence}%
                </div>
              </div>
            </div>
          </div>

          {/* Price Levels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#E3F2FD', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#1976D2', fontWeight: '600' }}>ENTRY PRICE</div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#1976D2' }}>
                ${recommendation.entryPrice.toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: '#6E6E73' }}>
                Current: ${currentPrice.toFixed(2)}
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#E8F5E8', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#2E7D32', fontWeight: '600' }}>PROFIT TARGET</div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#2E7D32' }}>
                ${recommendation.profitTarget.toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: '#6E6E73' }}>
                +{((recommendation.profitTarget - recommendation.entryPrice) / recommendation.entryPrice * 100).toFixed(1)}%
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#FFEBEE', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#C62828', fontWeight: '600' }}>STOP LOSS</div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#C62828' }}>
                ${recommendation.stopLoss.toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: '#6E6E73' }}>
                -{((recommendation.entryPrice - recommendation.stopLoss) / recommendation.entryPrice * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Risk/Reward Analysis */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F', margin: '0 0 0.5rem 0' }}>
                💰 Profit Analysis
              </h4>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#34C759', marginBottom: '0.25rem' }}>
                ${recommendation.expectedProfit.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#6E6E73' }}>
                Expected profit with {calculatePositionSize()} shares
              </div>
              <div style={{ fontSize: '12px', color: '#6E6E73', marginTop: '0.25rem' }}>
                Probability: {recommendation.probability}%
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F', margin: '0 0 0.5rem 0' }}>
                ⚠️ Risk Analysis
              </h4>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#FF3B30', marginBottom: '0.25rem' }}>
                ${recommendation.maxRisk.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#6E6E73' }}>
                Maximum risk ({customRisk}% of account)
              </div>
              <div style={{ fontSize: '12px', color: '#6E6E73', marginTop: '0.25rem' }}>
                Risk/Reward: 1:{recommendation.riskRewardRatio.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Position Details */}
          <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F', margin: '0 0 0.5rem 0' }}>
              📊 Recommended Position
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6E6E73' }}>Position Size</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1D1D1F' }}>
                  {calculatePositionSize()} shares
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6E6E73' }}>Total Investment</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1D1D1F' }}>
                  ${(calculatePositionSize() * recommendation.entryPrice).toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6E6E73' }}>Account Risk</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1D1D1F' }}>
                  {customRisk}%
                </div>
              </div>
            </div>
          </div>

          {/* AI Reasoning */}
          <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F', margin: '0 0 0.5rem 0' }}>
              🤖 AI Reasoning
            </h4>
            <p style={{ fontSize: '14px', color: '#6E6E73', margin: 0, lineHeight: '1.4' }}>
              {recommendation.reasoning}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <HoverButton
              onClick={() => {
                // Copy OCO order details to clipboard
                const orderDetails = `OCO Order for ${symbol}:
Entry: $${recommendation.entryPrice}
Profit Target: $${recommendation.profitTarget}
Stop Loss: $${recommendation.stopLoss}
Position Size: ${calculatePositionSize()} shares
Risk/Reward: 1:${recommendation.riskRewardRatio.toFixed(1)}`
                navigator.clipboard.writeText(orderDetails)
                alert('Order details copied to clipboard!')
              }}
              variant="secondary"
              style={{ padding: '0.75rem', fontSize: '14px' }}
            >
              📋 Copy Order Details
            </HoverButton>
            
            <HoverButton
              onClick={() => alert('Order execution integration coming soon!')}
              variant="primary"
              style={{ padding: '0.75rem', fontSize: '14px' }}
            >
              🚀 Execute Order
            </HoverButton>
          </div>
        </div>
      )}
    </div>
  )
}

export default OCORecommendationAI
