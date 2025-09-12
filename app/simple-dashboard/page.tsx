'use client'

import { useState, useEffect } from 'react'
import HoverButton from '../../components/HoverButton'

export default function SimpleDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simple test - just set loading to false
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #007AFF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading VerifAI Trading...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Header */}
      <header style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #007AFF, #5856D6)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              📈
            </div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1d1d1f',
              margin: 0
            }}>
              VerifAI Trading Dashboard
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <HoverButton href="/test" variant="secondary">
              Test Page
            </HoverButton>
            <HoverButton href="/auth/signin" variant="primary">
              Sign In
            </HoverButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '2rem' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gap: '1.5rem'
        }}>
          {/* Status Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1d1d1f',
              marginBottom: '1rem'
            }}>
              🚀 System Status
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{
                padding: '1rem',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
                border: '1px solid #bae6fd'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#0369a1', marginBottom: '0.25rem' }}>
                  React App
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1d4ed8' }}>
                  ✅ Running
                </div>
              </div>
              
              <div style={{
                padding: '1rem',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                border: '1px solid #bbf7d0'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#065f46', marginBottom: '0.25rem' }}>
                  Components
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#059669' }}>
                  ✅ Loaded
                </div>
              </div>
              
              <div style={{
                padding: '1rem',
                backgroundColor: '#fefce8',
                borderRadius: '8px',
                border: '1px solid #fde047'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#a16207', marginBottom: '0.25rem' }}>
                  Database
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#ca8a04' }}>
                  ⏳ Testing
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1d1d1f',
              marginBottom: '1rem'
            }}>
              🎯 Quick Actions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              
              <div style={{
                padding: '1.5rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1d1d1f', marginBottom: '0.5rem' }}>
                  Technical Analysis
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                  AI-powered stock analysis
                </p>
                <HoverButton
                  onClick={() => alert('Technical Analysis feature - Working!')}
                  variant="primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  Analyze
                </HoverButton>
              </div>

              <div style={{
                padding: '1.5rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1d1d1f', marginBottom: '0.5rem' }}>
                  Watchlist
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                  Track your favorite stocks
                </p>
                <HoverButton
                  onClick={() => alert('Watchlist feature - Working!')}
                  variant="primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  Manage
                </HoverButton>
              </div>

              <div style={{
                padding: '1.5rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1d1d1f', marginBottom: '0.5rem' }}>
                  Alerts
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                  Smart price notifications
                </p>
                <HoverButton
                  onClick={() => alert('Alerts feature - Working!')}
                  variant="primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  Setup
                </HoverButton>
              </div>

            </div>
          </div>

          {/* Information Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1d1d1f',
              marginBottom: '1rem'
            }}>
              💡 Troubleshooting
            </h2>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>If you're experiencing issues:</strong>
              </p>
              <ul style={{ marginLeft: '1rem' }}>
                <li>Make sure your .env.local file has all required environment variables</li>
                <li>Check that Supabase credentials are correct</li>
                <li>Verify your internet connection for API calls</li>
                <li>Try refreshing the page or clearing browser cache</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
