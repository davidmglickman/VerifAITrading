'use client'

import { useState } from 'react'

export default function TestButtonsSimple() {
  const [message, setMessage] = useState('')

  const testAddStock = async () => {
    setMessage('Testing Add Stock...')
    
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols: ['AAPL'],
          marketData: {},
          newsData: {},
          companyProfiles: {}
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        setMessage('✅ API call successful: ' + JSON.stringify(result).substring(0, 100))
      } else {
        setMessage('❌ API call failed: ' + response.status + ' ' + response.statusText)
      }
    } catch (error) {
      setMessage('❌ Error: ' + (error as Error).message)
    }
  }

  const testFinnhubAPI = async () => {
    setMessage('Testing Finnhub API directly...')
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY
      setMessage(`API Key available: ${apiKey ? 'YES' : 'NO'} (${apiKey?.substring(0,10)}...)`)
      
      if (!apiKey) {
        setMessage('❌ No API key found')
        return
      }
      
      const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${apiKey}`)
      
      if (response.ok) {
        const data = await response.json()
        setMessage('✅ Finnhub API working: ' + JSON.stringify(data))
      } else {
        setMessage('❌ Finnhub API error: ' + response.status + ' ' + response.statusText)
      }
    } catch (error) {
      setMessage('❌ Error: ' + (error as Error).message)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '600',
          color: '#1d1d1f',
          marginBottom: '2rem'
        }}>
          🧪 Simple Button Test
        </h1>

        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={testAddStock}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            Test AI Insights API
          </button>

          <button
            onClick={testFinnhubAPI}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: '#34C759',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Test Finnhub API Directly
          </button>
        </div>

        <div style={{
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          minHeight: '100px'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1d1d1f' }}>Result:</h3>
          <pre style={{ 
            margin: 0, 
            color: '#424245',
            fontSize: '0.9rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {message || 'Click a button to test...'}
          </pre>
        </div>
      </div>
    </div>
  )
}
