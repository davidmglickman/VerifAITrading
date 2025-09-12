'use client'

import { useState } from 'react'
import WatchlistManager from '../../components/WatchlistManager'
import AITradingCoach from '../../components/AITradingCoach'

export default function ButtonTestPage() {
  const [mockWatchlist, setMockWatchlist] = useState([
    { id: '1', symbol: 'GLXY', added_at: new Date().toISOString() },
    { id: '2', symbol: 'GRGG', added_at: new Date().toISOString() }
  ])

  const mockUserId = 'test-user-123'

  const handleWatchlistUpdate = () => {
    console.log('Watchlist update triggered!')
    // In real app, this would reload the watchlist
  }

  const testAIInsights = async () => {
    console.log('Testing AI Insights...')
    alert('AI Insights button clicked! Check console for details.')
  }

  const testAddStock = async () => {
    console.log('Testing Add Stock...')
    alert('Add Stock button functionality - search for a stock and click to add!')
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 Button Test Page</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Manual Button Tests</h2>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button
            onClick={testAIInsights}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            🤖 Test AI Insights
          </button>
          
          <button
            onClick={testAddStock}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#34C759',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ➕ Test Add Stock
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>AI Trading Coach Component</h2>
        <div style={{ 
          border: '2px solid #007AFF', 
          borderRadius: '12px', 
          padding: '1rem',
          backgroundColor: '#f8f9fa'
        }}>
          <AITradingCoach userWatchlist={mockWatchlist} />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Watchlist Manager Component</h2>
        <div style={{ 
          border: '2px solid #34C759', 
          borderRadius: '12px', 
          padding: '1rem',
          backgroundColor: '#f8f9fa'
        }}>
          <WatchlistManager
            userId={mockUserId}
            watchlist={mockWatchlist}
            onWatchlistUpdate={handleWatchlistUpdate}
          />
        </div>
      </div>

      <div>
        <h2>Instructions</h2>
        <ol>
          <li><strong>AI Insights:</strong> Click "Analyze Watchlist" in the AI Trading Coach section</li>
          <li><strong>Add Stock:</strong> Type a stock symbol (like AAPL) in the search box and click on the result to add it</li>
          <li><strong>Check Console:</strong> Open browser dev tools (F12) to see detailed logs</li>
          <li><strong>Watch Alerts:</strong> Both buttons should show success/error messages</li>
        </ol>
      </div>
    </div>
  )
}
