'use client'

import { useState } from 'react'

export interface Holding {
  symbol: string
  shares: number
  entryPrice: number
  currentPrice?: number
  unrealizedPnL?: number
  unrealizedPnLPercent?: number
}

interface PortfolioHoldingsProps {
  onHoldingsUpdate: (holdings: Holding[]) => void
}

export default function PortfolioHoldings({ onHoldingsUpdate }: PortfolioHoldingsProps) {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [inputText, setInputText] = useState('')
  const [showInput, setShowInput] = useState(false)

  const parseHoldingsText = (text: string): Holding[] => {
    const lines = text.split('\n').filter(line => line.trim())
    const parsed: Holding[] = []

    for (const line of lines) {
      // Try to parse different formats:
      // "AAPL 100 150.50" or "AAPL,100,150.50" or "AAPL: 100 shares @ $150.50"
      const patterns = [
        /^([A-Z]+)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)$/i, // AAPL 100 150.50
        /^([A-Z]+),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)$/i, // AAPL,100,150.50
        /^([A-Z]+):\s*(\d+(?:\.\d+)?)\s*shares?\s*@\s*\$?(\d+(?:\.\d+)?)$/i, // AAPL: 100 shares @ $150.50
        /^([A-Z]+)\s*\|\s*(\d+(?:\.\d+)?)\s*\|\s*\$?(\d+(?:\.\d+)?)$/i, // AAPL | 100 | $150.50
      ]

      for (const pattern of patterns) {
        const match = line.match(pattern)
        if (match) {
          const [, symbol, shares, price] = match
          parsed.push({
            symbol: symbol.toUpperCase(),
            shares: parseFloat(shares),
            entryPrice: parseFloat(price),
          })
          break
        }
      }
    }

    return parsed
  }

  const handlePasteHoldings = () => {
    const parsed = parseHoldingsText(inputText)
    if (parsed.length > 0) {
      setHoldings(parsed)
      onHoldingsUpdate(parsed)
      setInputText('')
      setShowInput(false)
    } else {
      alert('Could not parse holdings. Please use format: SYMBOL SHARES PRICE (e.g., "AAPL 100 150.50")')
    }
  }

  const addSingleHolding = (symbol: string, shares: number, entryPrice: number) => {
    const newHolding: Holding = { symbol: symbol.toUpperCase(), shares, entryPrice }
    const updated = [...holdings, newHolding]
    setHoldings(updated)
    onHoldingsUpdate(updated)
  }

  const removeHolding = (index: number) => {
    const updated = holdings.filter((_, i) => i !== index)
    setHoldings(updated)
    onHoldingsUpdate(updated)
  }

  const totalValue = holdings.reduce((sum, holding) => 
    sum + (holding.shares * (holding.currentPrice || holding.entryPrice)), 0
  )

  const totalUnrealizedPnL = holdings.reduce((sum, holding) => 
    sum + (holding.unrealizedPnL || 0), 0
  )

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
          📊 Portfolio Holdings
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowInput(!showInput)}
            style={{
              padding: '0.5rem 1rem',
              background: '#007AFF',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {showInput ? 'Cancel' : 'Add Holdings'}
          </button>
          {holdings.length > 0 && (
            <button
              onClick={() => { setHoldings([]); onHoldingsUpdate([]) }}
              style={{
                padding: '0.5rem 1rem',
                background: '#FF3B30',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {showInput && (
        <div style={{
          backgroundColor: '#F2F2F7',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1d1d1f', marginBottom: '0.5rem' }}>
            Paste Your Holdings
          </h4>
          <p style={{ fontSize: '14px', color: '#8e8e93', marginBottom: '1rem' }}>
            Paste one holding per line. Supported formats:
            <br />• AAPL 100 150.50
            <br />• AAPL, 100, 150.50
            <br />• AAPL: 100 shares @ $150.50
          </p>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="AAPL 100 150.50&#10;MSFT 50 300.25&#10;GOOGL 25 2500.00"
            style={{
              width: '100%',
              height: '120px',
              padding: '12px',
              border: '1px solid #D1D1D6',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'monospace',
              resize: 'vertical'
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              onClick={handlePasteHoldings}
              disabled={!inputText.trim()}
              style={{
                padding: '0.5rem 1rem',
                background: inputText.trim() ? '#34C759' : '#8e8e93',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Parse Holdings
            </button>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      {holdings.length > 0 ? (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 80px 100px 100px 120px 60px',
            gap: '12px',
            padding: '12px',
            backgroundColor: '#F8F9FA',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#6E6E73',
            marginBottom: '8px'
          }}>
            <div>Symbol</div>
            <div>Shares</div>
            <div>Entry</div>
            <div>Current</div>
            <div>P&L</div>
            <div></div>
          </div>

          {holdings.map((holding, index) => (
            <div
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 100px 100px 120px 60px',
                gap: '12px',
                padding: '12px',
                borderBottom: '1px solid #F2F2F7',
                alignItems: 'center'
              }}
            >
              <div style={{ fontWeight: '600', color: '#1d1d1f' }}>
                {holding.symbol}
              </div>
              <div style={{ color: '#1d1d1f' }}>
                {holding.shares}
              </div>
              <div style={{ color: '#1d1d1f' }}>
                ${holding.entryPrice.toFixed(2)}
              </div>
              <div style={{ color: '#1d1d1f' }}>
                ${holding.currentPrice?.toFixed(2) || '—'}
              </div>
              <div style={{
                color: (holding.unrealizedPnL || 0) >= 0 ? '#34C759' : '#FF3B30',
                fontWeight: '500'
              }}>
                {holding.unrealizedPnL !== undefined ? (
                  <>
                    ${holding.unrealizedPnL.toFixed(2)}
                    <br />
                    <span style={{ fontSize: '12px' }}>
                      ({(holding.unrealizedPnLPercent || 0) >= 0 ? '+' : ''}{(holding.unrealizedPnLPercent || 0).toFixed(1)}%)
                    </span>
                  </>
                ) : '—'}
              </div>
              <button
                onClick={() => removeHolding(index)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FF3B30',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
                title="Remove holding"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Summary */}
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#F2F2F7',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '14px', color: '#8e8e93' }}>Total Portfolio Value</div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f' }}>
                ${totalValue.toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', color: '#8e8e93' }}>Unrealized P&L</div>
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: totalUnrealizedPnL >= 0 ? '#34C759' : '#FF3B30'
              }}>
                {totalUnrealizedPnL >= 0 ? '+' : ''}${totalUnrealizedPnL.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: '#8e8e93',
          fontSize: '15px'
        }}>
          📝 Add your current holdings to get AI-powered sell recommendations
        </div>
      )}
    </div>
  )
}