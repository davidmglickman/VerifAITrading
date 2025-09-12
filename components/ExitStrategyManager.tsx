'use client'

import { useState, useEffect } from 'react'

interface ExitLevel {
  level: number
  percentage: number
  price: number
  type: 'profit' | 'stop'
  reason: string
  active: boolean
}

interface ExitStrategy {
  symbol: string
  entryPrice: number
  currentPrice: number
  positionSize: number
  exitLevels: ExitLevel[]
  trailingStop: {
    enabled: boolean
    percentage: number
    currentStopPrice: number
  }
  timeBasedExit: {
    enabled: boolean
    maxHoldDays: number
    entryDate: Date
  }
}

interface Props {
  symbol?: string
  entryPrice?: number
  currentPrice?: number
  positionSize?: number
  onStrategyUpdate?: (strategy: ExitStrategy) => void
}

export default function ExitStrategyManager({ 
  symbol = 'AAPL', 
  entryPrice = 150, 
  currentPrice = 152, 
  positionSize = 100,
  onStrategyUpdate 
}: Props) {
  const [strategy, setStrategy] = useState<ExitStrategy>({
    symbol,
    entryPrice,
    currentPrice,
    positionSize,
    exitLevels: [
      { level: 1, percentage: 25, price: 0, type: 'profit', reason: 'First resistance level', active: true },
      { level: 2, percentage: 50, price: 0, type: 'profit', reason: 'Technical target', active: true },
      { level: 3, percentage: 25, price: 0, type: 'profit', reason: 'Extended target', active: true },
      { level: 4, percentage: 100, price: 0, type: 'stop', reason: 'Stop loss', active: true }
    ],
    trailingStop: {
      enabled: false,
      percentage: 8,
      currentStopPrice: 0
    },
    timeBasedExit: {
      enabled: true,
      maxHoldDays: 21,
      entryDate: new Date()
    }
  })

  const calculateExitLevels = () => {
    const riskAmount = entryPrice * 0.05 // 5% initial risk
    const stopLoss = entryPrice - riskAmount
    
    const updatedLevels = strategy.exitLevels.map(level => {
      if (level.type === 'stop') {
        return { ...level, price: stopLoss }
      } else {
        // Calculate profit targets based on R:R ratios
        const riskRewardRatios = [1.5, 2.5, 4] // 1.5R, 2.5R, 4R
        const rrIndex = level.level - 1
        const profitTarget = entryPrice + (riskAmount * riskRewardRatios[rrIndex])
        return { ...level, price: profitTarget }
      }
    })

    // Calculate trailing stop
    const trailingStopPrice = strategy.trailingStop.enabled 
      ? currentPrice * (1 - strategy.trailingStop.percentage / 100)
      : 0

    const updatedStrategy = {
      ...strategy,
      currentPrice,
      exitLevels: updatedLevels,
      trailingStop: {
        ...strategy.trailingStop,
        currentStopPrice: trailingStopPrice
      }
    }

    setStrategy(updatedStrategy)
    onStrategyUpdate?.(updatedStrategy)
  }

  useEffect(() => {
    calculateExitLevels()
  }, [entryPrice, currentPrice, strategy.trailingStop.enabled, strategy.trailingStop.percentage])

  const updateExitLevel = (levelIndex: number, field: string, value: any) => {
    const updatedLevels = [...strategy.exitLevels]
    updatedLevels[levelIndex] = { ...updatedLevels[levelIndex], [field]: value }
    setStrategy({ ...strategy, exitLevels: updatedLevels })
  }

  const getCurrentPnL = () => {
    const unrealizedPnL = (currentPrice - entryPrice) * positionSize
    const unrealizedPnLPercent = ((currentPrice - entryPrice) / entryPrice) * 100
    return { unrealizedPnL, unrealizedPnLPercent }
  }

  const getDaysHeld = () => {
    const today = new Date()
    const daysDiff = Math.floor((today.getTime() - strategy.timeBasedExit.entryDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff
  }

  const { unrealizedPnL, unrealizedPnLPercent } = getCurrentPnL()
  const daysHeld = getDaysHeld()
  const maxDays = strategy.timeBasedExit.maxHoldDays

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
        🎯 Exit Strategy Manager
      </h3>

      {/* Position Overview */}
      <div style={{
        backgroundColor: 'rgba(0, 122, 255, 0.05)',
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '1.5rem',
        border: '1px solid rgba(0, 122, 255, 0.2)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6e6e73' }}>Entry Price</div>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1d1d1f' }}>
              ${entryPrice.toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6e6e73' }}>Current Price</div>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1d1d1f' }}>
              ${currentPrice.toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6e6e73' }}>Unrealized P&L</div>
            <div style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: unrealizedPnL >= 0 ? '#34C759' : '#FF3B30' 
            }}>
              ${unrealizedPnL.toFixed(0)} ({unrealizedPnLPercent.toFixed(1)}%)
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6e6e73' }}>Days Held</div>
            <div style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: daysHeld > maxDays * 0.8 ? '#FF9500' : '#1d1d1f' 
            }}>
              {daysHeld}/{maxDays}
            </div>
          </div>
        </div>
      </div>

      {/* Exit Levels */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1d1d1f', marginBottom: '0.75rem' }}>
          Exit Levels
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {strategy.exitLevels.map((level, index) => (
            <div
              key={index}
              style={{
                backgroundColor: level.active ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                opacity: level.active ? 1 : 0.6
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="checkbox"
                    checked={level.active}
                    onChange={(e) => updateExitLevel(index, 'active', e.target.checked)}
                    style={{ accentColor: '#007AFF' }}
                  />
                  
                  <div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600',
                      color: level.type === 'profit' ? '#34C759' : '#FF3B30'
                    }}>
                      {level.type === 'profit' ? `Profit Target ${level.level}` : 'Stop Loss'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6e6e73' }}>
                      {level.reason}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1rem', fontWeight: '600' }}>
                      ${level.price.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6e6e73' }}>
                      {level.percentage}% of position
                    </div>
                  </div>
                  
                  <div style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    backgroundColor: currentPrice >= level.price && level.type === 'profit' ? '#34C759' : 
                                   currentPrice <= level.price && level.type === 'stop' ? '#FF3B30' : '#f0f0f0',
                    color: currentPrice >= level.price && level.type === 'profit' ? 'white' : 
                           currentPrice <= level.price && level.type === 'stop' ? 'white' : '#6e6e73'
                  }}>
                    {currentPrice >= level.price && level.type === 'profit' ? 'HIT' : 
                     currentPrice <= level.price && level.type === 'stop' ? 'HIT' : 'PENDING'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trailing Stop */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1d1d1f', marginBottom: '0.75rem' }}>
          Trailing Stop
        </h4>
        
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          border: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={strategy.trailingStop.enabled}
                onChange={(e) => setStrategy({
                  ...strategy,
                  trailingStop: { ...strategy.trailingStop, enabled: e.target.checked }
                })}
                style={{ accentColor: '#007AFF' }}
              />
              Enable Trailing Stop
            </label>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number"
                value={strategy.trailingStop.percentage}
                onChange={(e) => setStrategy({
                  ...strategy,
                  trailingStop: { ...strategy.trailingStop, percentage: parseFloat(e.target.value) || 8 }
                })}
                min="1"
                max="20"
                step="0.5"
                style={{
                  width: '60px',
                  padding: '0.25rem',
                  borderRadius: '0.25rem',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  fontSize: '0.875rem'
                }}
              />
              <span style={{ fontSize: '0.875rem', color: '#424245' }}>%</span>
            </div>
          </div>
          
          {strategy.trailingStop.enabled && (
            <div style={{ fontSize: '0.875rem', color: '#424245' }}>
              Current Trailing Stop: <strong>${strategy.trailingStop.currentStopPrice.toFixed(2)}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Time-Based Exit Warning */}
      {strategy.timeBasedExit.enabled && daysHeld > maxDays * 0.8 && (
        <div style={{
          backgroundColor: 'rgba(255, 149, 0, 0.1)',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          border: '1px solid rgba(255, 149, 0, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#FF9500', fontWeight: '600' }}>
            ⏰ Approaching max hold period ({daysHeld}/{maxDays} days)
          </div>
          <div style={{ fontSize: '0.75rem', color: '#424245', marginTop: '0.25rem' }}>
            Consider closing position if targets aren't met soon
          </div>
        </div>
      )}
    </div>
  )
}
