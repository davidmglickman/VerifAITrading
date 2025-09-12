'use client'

import { useState } from 'react'

export default function TestInsightsPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testInsights = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          symbols: ['GLXY', 'GRGG'], 
          marketData: {
            'GLXY': { price: 10.50, change: 0.25, changePercent: 2.4, volume: 1000000 },
            'GRGG': { price: 5.75, change: -0.15, changePercent: -2.5, volume: 500000 }
          }
        }),
      })
      
      const data = await response.json()
      setResult({
        status: response.status,
        ok: response.ok,
        data: data
      })
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error'
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
          AI Insights API Test
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#86868B',
          marginBottom: '2rem'
        }}>
          Test the AI insights functionality with GLXY and GRGG stocks.
        </p>

        <button
          onClick={testInsights}
          disabled={loading}
          style={{
            padding: '1rem 2rem',
            backgroundColor: loading ? '#ccc' : '#007AFF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '2rem'
          }}
        >
          {loading ? 'Generating Insights...' : 'Test AI Insights'}
        </button>

        {result && (
          <div style={{
            backgroundColor: result.error ? '#FEF2F2' : '#F0F9FF',
            border: `1px solid ${result.error ? '#FECACA' : '#BFDBFE'}`,
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              color: result.error ? '#DC2626' : '#1E40AF',
              marginBottom: '1rem'
            }}>
              API Response
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
      </div>
    </div>
  )
}
