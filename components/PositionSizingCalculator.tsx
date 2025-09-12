'use client'

import { useState, useEffect } from 'react'

interface PositionSize {
  shares: number
  dollarsAtRisk: number
  positionValue: number
  portfolioPercentage: number
  kellyPercentage: number
}

interface Props {
  accountSize: number
  riskPerTrade: number // percentage (1-3%)
  onCalculationUpdate?: (calculation: PositionSize) => void
}

export default function PositionSizingCalculator({ accountSize, riskPerTrade, onCalculationUpdate }: Props) {
  const [symbol, setSymbol] = useState('')
  const [entryPrice, setEntryPrice] = useState<number>(0)
  const [stopLoss, setStopLoss] = useState<number>(0)
  const [winRate, setWinRate] = useState<number>(60) // Default 60%
  const [avgWin, setAvgWin] = useState<number>(2) // Average win: 2R
  const [avgLoss, setAvgLoss] = useState<number>(1) // Average loss: 1R
  const [calculation, setCalculation] = useState<PositionSize | null>(null)

  const calculatePositionSize = () => {
    if (!entryPrice || !stopLoss || entryPrice <= stopLoss) return

    const riskPerShare = entryPrice - stopLoss
    const dollarsAtRisk = (accountSize * riskPerTrade) / 100
    const shares = Math.floor(dollarsAtRisk / riskPerShare)
    const positionValue = shares * entryPrice
    const portfolioPercentage = (positionValue / accountSize) * 100

    // Kelly Criterion calculation
    const winProbability = winRate / 100
    const lossProbability = 1 - winProbability
    const kellyPercentage = Math.max(0, ((winProbability * avgWin) - (lossProbability * avgLoss)) / avgWin * 100)

    const result = {
      shares,
      dollarsAtRisk,
      positionValue,
      portfolioPercentage,
      kellyPercentage
    }

    setCalculation(result)
    onCalculationUpdate?.(result)
  }

  useEffect(() => {
    if (entryPrice && stopLoss) {
      calculatePositionSize()
    }
  }, [entryPrice, stopLoss, riskPerTrade, accountSize, winRate, avgWin, avgLoss])

  return (
    <div style={{
      backdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '1rem',
      padding: '1.5rem',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#1d1d1f',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        📏 Position Sizing Calculator
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#424245', marginBottom: '0.5rem' }}>
            Symbol
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="AAPL"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              fontSize: '0.875rem',
              backgroundColor: 'rgba(255, 255, 255, 0.8)'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#424245', marginBottom: '0.5rem' }}>
            Entry Price ($)
          </label>
          <input
            type="number"
            value={entryPrice || ''}
            onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
            placeholder="150.00"
            step="0.01"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              fontSize: '0.875rem',
              backgroundColor: 'rgba(255, 255, 255, 0.8)'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#424245', marginBottom: '0.5rem' }}>
            Stop Loss ($)
          </label>
          <input
            type="number"
            value={stopLoss || ''}
            onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
            placeholder="145.00"
            step="0.01"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              fontSize: '0.875rem',
              backgroundColor: 'rgba(255, 255, 255, 0.8)'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#424245', marginBottom: '0.5rem' }}>
            Risk Per Trade (%)
          </label>
          <select
            value={riskPerTrade}
            onChange={(e) => {}}
            disabled
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              fontSize: '0.875rem',
              backgroundColor: 'rgba(248, 248, 248, 0.8)',
              color: '#6e6e73'
            }}
          >
            <option value={riskPerTrade}>{riskPerTrade}%</option>
          </select>
        </div>
      </div>

      {/* Kelly Criterion Inputs */}
      <details style={{ marginBottom: '1rem' }}>
        <summary style={{ cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500', color: '#424245', marginBottom: '0.5rem' }}>
          🧮 Kelly Criterion Settings
        </summary>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#6e6e73', marginBottom: '0.25rem' }}>
              Win Rate (%)
            </label>
            <input
              type="number"
              value={winRate}
              onChange={(e) => setWinRate(parseFloat(e.target.value) || 60)}
              min="1"
              max="99"
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                fontSize: '0.75rem'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#6e6e73', marginBottom: '0.25rem' }}>
              Avg Win (R)
            </label>
            <input
              type="number"
              value={avgWin}
              onChange={(e) => setAvgWin(parseFloat(e.target.value) || 2)}
              min="0.1"
              step="0.1"
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                fontSize: '0.75rem'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#6e6e73', marginBottom: '0.25rem' }}>
              Avg Loss (R)
            </label>
            <input
              type="number"
              value={avgLoss}
              onChange={(e) => setAvgLoss(parseFloat(e.target.value) || 1)}
              min="0.1"
              step="0.1"
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                fontSize: '0.75rem'
              }}
            />
          </div>
        </div>
      </details>

      {calculation && (
        <div style={{
          backgroundColor: 'rgba(0, 122, 255, 0.05)',
          borderRadius: '0.75rem',
          padding: '1rem',
          border: '1px solid rgba(0, 122, 255, 0.2)'
        }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1d1d1f', marginBottom: '0.75rem' }}>
            Position Size Calculation
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#007AFF' }}>
                {calculation.shares.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6e6e73' }}>Shares</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#FF3B30' }}>
                ${calculation.dollarsAtRisk.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6e6e73' }}>Risk Amount</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#34C759' }}>
                ${calculation.positionValue.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6e6e73' }}>Position Value</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#FF9500' }}>
                {calculation.portfolioPercentage.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6e6e73' }}>Portfolio %</div>
            </div>
          </div>

          {calculation.kellyPercentage > 0 && (
            <div style={{
              marginTop: '0.75rem',
              padding: '0.5rem',
              backgroundColor: 'rgba(52, 199, 89, 0.1)',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#30a46c' }}>
                <strong>Kelly Criterion suggests: {calculation.kellyPercentage.toFixed(1)}% of portfolio</strong>
              </div>
            </div>
          )}

          {calculation.portfolioPercentage > 10 && (
            <div style={{
              marginTop: '0.5rem',
              padding: '0.5rem',
              backgroundColor: 'rgba(255, 59, 48, 0.1)',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#d12c20' }}>
                ⚠️ Position size exceeds 10% of portfolio - Consider reducing
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
