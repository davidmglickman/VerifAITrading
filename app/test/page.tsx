'use client'

import { useState, useEffect } from 'react'
import HoverButton from '../../components/HoverButton'

export default function TestPage() {
  const [isClient, setIsClient] = useState(false)
  const [testData, setTestData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const testSupabaseConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-connection', {
        method: 'GET'
      })
      const data = await response.json()
      setTestData(data)
    } catch (error) {
      setTestData({ error: 'Connection failed', details: error })
    } finally {
      setLoading(false)
    }
  }

  const testNavigation = () => {
    window.location.href = '/dashboard'
  }

  if (!isClient) {
    return <div>Loading...</div>
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '600',
          color: '#1d1d1f',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          🧪 VerifAI Trading - Functionality Test
        </h1>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Basic React State Test */}
          <div style={{
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ color: '#1d1d1f', marginBottom: '0.5rem' }}>✅ React State Test</h3>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Client-side rendering: <strong style={{ color: isClient ? '#10b981' : '#ef4444' }}>
                {isClient ? 'Working' : 'Failed'}
              </strong>
            </p>
          </div>

          {/* Environment Variables Test */}
          <div style={{
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ color: '#1d1d1f', marginBottom: '0.5rem' }}>🔑 Environment Variables</h3>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              <div>Supabase URL: <span style={{ color: process.env.NEXT_PUBLIC_SUPABASE_URL ? '#10b981' : '#ef4444' }}>
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing'}
              </span></div>
              <div>Supabase Key: <span style={{ color: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '#10b981' : '#ef4444' }}>
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}
              </span></div>
            </div>
          </div>

          {/* Component Test */}
          <div style={{
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ color: '#1d1d1f', marginBottom: '1rem' }}>🧩 Component Test</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <HoverButton
                variant="primary"
                onClick={testSupabaseConnection}
                disabled={loading}
              >
                {loading ? 'Testing...' : 'Test Database Connection'}
              </HoverButton>
              
              <HoverButton
                variant="secondary"
                onClick={testNavigation}
              >
                Test Navigation
              </HoverButton>
            </div>
          </div>

          {/* API Test Results */}
          {testData && (
            <div style={{
              padding: '1rem',
              backgroundColor: testData.error ? '#fef2f2' : '#f0f9ff',
              borderRadius: '8px',
              border: `1px solid ${testData.error ? '#fecaca' : '#bae6fd'}`
            }}>
              <h3 style={{ 
                color: '#1d1d1f', 
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {testData.error ? '❌' : '✅'} API Test Results
              </h3>
              <pre style={{
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                padding: '0.75rem',
                borderRadius: '4px',
                fontSize: '0.875rem',
                overflow: 'auto',
                margin: 0
              }}>
                {JSON.stringify(testData, null, 2)}
              </pre>
            </div>
          )}

          {/* Quick Links */}
          <div style={{
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ color: '#1d1d1f', marginBottom: '1rem' }}>🔗 Quick Links</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <HoverButton href="/" variant="secondary">
                Landing Page
              </HoverButton>
              <HoverButton href="/dashboard" variant="secondary">
                Dashboard
              </HoverButton>
              <HoverButton href="/auth/signin" variant="secondary">
                Sign In
              </HoverButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
