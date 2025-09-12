'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser, getUserWatchlist } from '../../lib/supabase'

export default function DebugPage() {
  const [user, setUser] = useState<any>(null)
  const [watchlist, setWatchlist] = useState<any[]>([])
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    testFunctionality()
  }, [])

  const testFunctionality = async () => {
    try {
      console.log('Testing user authentication...')
      const { user, error: userError } = await getCurrentUser()
      
      if (userError) {
        setError(`Auth Error: ${userError.message}`)
        setLoading(false)
        return
      }

      if (!user) {
        setError('No user found - please sign in')
        setLoading(false)
        return
      }

      setUser(user)
      console.log('User authenticated:', user.email)

      console.log('Testing watchlist functionality...')
      const { data: watchlistData, error: watchlistError } = await getUserWatchlist(user.id)
      
      if (watchlistError) {
        setError(`Watchlist Error: ${watchlistError.message}`)
      } else {
        setWatchlist(watchlistData || [])
        console.log('Watchlist loaded:', watchlistData)
      }

    } catch (err) {
      console.error('Test failed:', err)
      setError(`General Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testAIAPI = async () => {
    try {
      console.log('Testing AI API...')
      const response = await fetch('/api/ai/alert-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || 'test',
          existingAlerts: []
        }),
      })

      const result = await response.json()
      console.log('AI API Response:', result)
      alert(`AI API Test: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.message || result.error}`)
    } catch (err) {
      console.error('AI API Test failed:', err)
      alert(`AI API Test FAILED: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>🔧 Debugging Dashboard Issues...</h1>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔧 Debug Dashboard</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Authentication Status</h2>
        {user ? (
          <div style={{ color: 'green' }}>
            ✅ User authenticated: {user.email}
            <br />
            User ID: {user.id}
          </div>
        ) : (
          <div style={{ color: 'red' }}>
            ❌ Not authenticated
          </div>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Watchlist Status</h2>
        {watchlist.length > 0 ? (
          <div style={{ color: 'green' }}>
            ✅ Watchlist loaded: {watchlist.length} items
            <ul>
              {watchlist.map((item, index) => (
                <li key={index}>{item.symbol}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div style={{ color: 'orange' }}>
            ⚠️ Watchlist empty or not loaded
          </div>
        )}
      </div>

      {error && (
        <div style={{ marginBottom: '2rem' }}>
          <h2>Error Details</h2>
          <div style={{ 
            color: 'red', 
            backgroundColor: '#ffebee', 
            padding: '1rem', 
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}>
            {error}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h2>Test Functions</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={testFunctionality}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Retest All
          </button>
          
          {user && (
            <button 
              onClick={testAIAPI}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#34C759',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🤖 Test AI API
            </button>
          )}
          
          <a 
            href="/dashboard"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#FF9500',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            📊 Go to Dashboard
          </a>
        </div>
      </div>

      <div>
        <h2>Environment Check</h2>
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '1rem', 
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
          <br />
          SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
          <br />
          OPENAI_API_KEY: {process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}
          <br />
          NODE_ENV: {process.env.NODE_ENV}
        </div>
      </div>
    </div>
  )
}
