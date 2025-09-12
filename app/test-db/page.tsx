'use client'

import { useState } from 'react'
import { getCurrentUser } from '../../lib/supabase'

export default function TestDatabasePage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDatabase = async () => {
    setLoading(true)
    try {
      // First test authentication
      const { user, error: authError } = await getCurrentUser()
      
      if (authError || !user) {
        setResult({
          success: false,
          error: 'Authentication failed',
          details: 'Please sign in first',
          authError: authError?.message
        })
        setLoading(false)
        return
      }

      // Test database connection
      const response = await fetch('/api/test-db', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      // Test watchlist query
      const { getUserWatchlist } = await import('../../lib/database')
      const watchlistResult = await getUserWatchlist(user.id)
      
      setResult({
        success: data.success,
        user: {
          id: user.id,
          email: user.email
        },
        database: data,
        watchlist: {
          success: !watchlistResult.error,
          error: watchlistResult.error?.message,
          data: watchlistResult.data
        }
      })
    } catch (error) {
      setResult({
        success: false,
        error: 'Database test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFAFA',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #E5E5E7'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#1D1D1F',
          marginBottom: '1rem'
        }}>
          Database Connection Test
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#86868B',
          marginBottom: '2rem'
        }}>
          Test the database connection and table structure after running the setup SQL.
        </p>

        <button
          onClick={testDatabase}
          disabled={loading}
          style={{
            padding: '1rem 2rem',
            backgroundColor: loading ? '#ccc' : '#34C759',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '2rem'
          }}
        >
          {loading ? 'Testing...' : 'Test Database Connection'}
        </button>

        {result && (
          <div style={{
            backgroundColor: result.success ? '#F0F9FF' : '#FEF2F2',
            border: `1px solid ${result.success ? '#BFDBFE' : '#FECACA'}`,
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              color: result.success ? '#1E40AF' : '#DC2626',
              marginBottom: '1rem'
            }}>
              {result.success ? 'Test Results' : 'Test Failed'}
            </h3>
            
            <pre style={{
              backgroundColor: '#F8F9FA',
              padding: '1rem',
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div style={{
          backgroundColor: '#FFF3CD',
          border: '1px solid #FFEAA7',
          borderRadius: '8px',
          padding: '1rem',
          marginTop: '2rem'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>How to use this test:</h4>
          <ol>
            <li>Make sure you're signed in to the app</li>
            <li>Run the database setup SQL first (go to /setup-db)</li>
            <li>Click "Test Database Connection" above</li>
            <li>Check the results to see if everything is working</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
