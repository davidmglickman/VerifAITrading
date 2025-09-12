'use client'

import { useState, useEffect, useRef } from 'react'
import { getCurrentUser, signOut } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import AITradingCoach from '../../components/AITradingCoach'
import WatchlistManager from '../../components/WatchlistManager'
import AlertsManager from '../../components/AlertsManager'
import TechnicalAnalysisAI from '../../components/TechnicalAnalysisAI'
import PortfolioRiskAI from '../../components/PortfolioRiskAI'
import PositionSizingCalculator from '../../components/PositionSizingCalculator'
import SwingPatternScanner from '../../components/SwingPatternScanner'

// Modern Dashboard with Sidebar Navigation
export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('overview')
  const aiCoachRef = useRef<any>(null)
  const watchlistRef = useRef<any>(null)
  const [watchlist, setWatchlist] = useState<any[]>([
    { id: 'default-1', symbol: 'GLXY', added_at: new Date().toISOString() },
    { id: 'default-2', symbol: 'GRGG', added_at: new Date().toISOString() }
  ])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { user, error } = await getCurrentUser()
      if (error || !user) {
        router.push('/auth/signin')
        return
      }
      setUser(user)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/auth/signin')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F7',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #007AFF',
            borderRadius: '50%',
            borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#86868B', fontSize: '16px' }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'watchlist', label: 'Watchlist', icon: '⭐' },
    { id: 'ai-coach', label: 'AI Coach', icon: '🤖' },
    { id: 'analysis', label: 'Analysis', icon: '📈' },
    { id: 'alerts', label: 'Alerts', icon: '🔔' },
    { id: 'tools', label: 'Tools', icon: '🛠️' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F5F5F7',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      display: 'flex'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        backgroundColor: 'white',
        borderRight: '1px solid #E5E5E7',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #E5E5E7'
        }}>
          <h1 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1D1D1F',
            margin: '0 0 0.5rem 0'
          }}>
            VerifAI Trading
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#86868B',
            margin: 0
          }}>
            Welcome back, {user?.email?.split('@')[0]}
          </p>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: '1rem 0' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: activeView === item.id ? '#007AFF15' : 'transparent',
                color: activeView === item.id ? '#007AFF' : '#1D1D1F',
                fontSize: '16px',
                fontWeight: activeView === item.id ? '500' : '400',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                borderLeft: activeView === item.id ? '3px solid #007AFF' : '3px solid transparent'
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* User Menu */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #E5E5E7'
        }}>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #E5E5E7',
              borderRadius: '8px',
              background: 'white',
              color: '#86868B',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: '280px',
        padding: '2rem',
        maxWidth: 'calc(100vw - 280px)',
        overflow: 'auto'
      }}>
        {/* Page Header */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1D1D1F',
            margin: '0 0 0.5rem 0'
          }}>
            {navItems.find(item => item.id === activeView)?.label}
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#86868B',
            margin: 0
          }}>
            {activeView === 'overview' && 'Your trading dashboard overview'}
            {activeView === 'watchlist' && 'Manage your stock watchlist'}
            {activeView === 'ai-coach' && 'AI-powered trading insights and recommendations'}
            {activeView === 'analysis' && 'Technical and fundamental analysis tools'}
            {activeView === 'alerts' && 'Price alerts and notifications'}
            {activeView === 'tools' && 'Position sizing and risk management tools'}
          </p>
        </div>

        {/* Content Area */}
        <div style={{ minHeight: '500px' }}>
          {activeView === 'overview' && <OverviewContent watchlist={watchlist} />}
          {activeView === 'watchlist' && <WatchlistContent watchlist={watchlist} setWatchlist={setWatchlist} />}
          {activeView === 'ai-coach' && <AICoachContent watchlist={watchlist} />}
          {activeView === 'analysis' && <AnalysisContent watchlist={watchlist} />}
          {activeView === 'alerts' && <AlertsContent />}
          {activeView === 'tools' && <ToolsContent />}
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// Overview Content Component
function OverviewContent({ watchlist }: { watchlist: any[] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '1.5rem'
    }}>
      {/* Market Summary Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid #E5E5E7',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1D1D1F',
          margin: '0 0 1rem 0'
        }}>
          📈 Market Summary
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#86868B' }}>S&P 500</span>
            <span style={{ color: '#34C759', fontWeight: '500' }}>+0.85%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#86868B' }}>NASDAQ</span>
            <span style={{ color: '#34C759', fontWeight: '500' }}>+1.23%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#86868B' }}>VIX</span>
            <span style={{ color: '#FF3B30', fontWeight: '500' }}>18.4</span>
          </div>
        </div>
      </div>

      {/* Watchlist Preview */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid #E5E5E7',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1D1D1F',
          margin: '0 0 1rem 0'
        }}>
          ⭐ Your Watchlist
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {watchlist.slice(0, 3).map((stock) => (
            <div key={stock.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '500' }}>{stock.symbol}</span>
              <span style={{ color: '#86868B' }}>--</span>
            </div>
          ))}
          {watchlist.length > 3 && (
            <p style={{ color: '#86868B', fontSize: '14px', margin: 0 }}>
              +{watchlist.length - 3} more stocks
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid #E5E5E7',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1D1D1F',
          margin: '0 0 1rem 0'
        }}>
          🚀 Quick Actions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            onClick={async () => {
              try {
                // Trigger AI insights generation directly
                if (watchlist.length === 0) {
                  alert('Add some stocks to your watchlist first!')
                  return
                }
                
                // Trigger the actual AI insights API call
                const symbols = watchlist.map(item => item.symbol)
                const response = await fetch('/api/ai/insights', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    symbols,
                    marketData: {},
                    newsData: {},
                    companyProfiles: {}
                  })
                })
                
                if (response.ok) {
                  const result = await response.json()
                  alert('✅ AI Insights generated! Check the AI Trading Coach section below.')
                  // Scroll to AI coach section
                  document.querySelector('[data-section="ai-coach"]')?.scrollIntoView({ behavior: 'smooth' })
                } else {
                  alert('❌ Failed to generate AI insights. Please try again.')
                }
              } catch (error) {
                console.error('Error generating insights:', error)
                alert('❌ Error generating insights. Please check your connection.')
              }
            }}
            style={{
              padding: '0.75rem',
              border: '1px solid #007AFF',
              borderRadius: '8px',
              background: '#007AFF',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Get AI Insights
          </button>
          <button 
            onClick={() => {
              // Scroll to watchlist section and focus add input
              const watchlistSection = document.querySelector('[data-section="watchlist"]')
              const addInput = document.querySelector('[data-action="add-stock-input"]') as HTMLInputElement
              
              if (watchlistSection) {
                watchlistSection.scrollIntoView({ behavior: 'smooth' })
                setTimeout(() => {
                  if (addInput) {
                    addInput.focus()
                  }
                }, 500)
              } else {
                alert('Scroll down to find the watchlist section')
              }
            }}
            style={{
              padding: '0.75rem',
              border: '1px solid #E5E5E7',
              borderRadius: '8px',
              background: 'white',
              color: '#1D1D1F',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Add Stock to Watchlist
          </button>
        </div>
      </div>
    </div>
  )
}

// Watchlist Content Component
function WatchlistContent({ watchlist, setWatchlist }: { watchlist: any[], setWatchlist: (list: any[]) => void }) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '2rem',
      border: '1px solid #E5E5E7',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }} data-section="watchlist">
      <WatchlistManager userId="default-user" watchlist={watchlist} onWatchlistUpdate={() => {}} />
    </div>
  )
}

// AI Coach Content Component
function AICoachContent({ watchlist }: { watchlist: any[] }) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '2rem',
      border: '1px solid #E5E5E7',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }} data-section="ai-coach">
      <AITradingCoach userWatchlist={watchlist} />
    </div>
  )
}

// Analysis Content Component
function AnalysisContent({ watchlist }: { watchlist: any[] }) {
  const firstStock = watchlist[0]?.symbol || 'GLXY'
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '1.5rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid #E5E5E7',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <TechnicalAnalysisAI symbol={firstStock} />
      </div>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid #E5E5E7',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <PortfolioRiskAI positions={watchlist.map(stock => ({ 
          symbol: stock.symbol, 
          shares: 100, 
          avgCost: 45,
          currentPrice: 50,
          sector: 'Technology',
          marketValue: 5000,
          gainLoss: 500,
          gainLossPercent: 11.1
        }))} />
      </div>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid #E5E5E7',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <SwingPatternScanner symbol={firstStock} />
      </div>
    </div>
  )
}

// Alerts Content Component
function AlertsContent() {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '2rem',
      border: '1px solid #E5E5E7',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <AlertsManager userId="default-user" />
    </div>
  )
}

// Tools Content Component
function ToolsContent() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '1.5rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid #E5E5E7',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <PositionSizingCalculator accountSize={50000} riskPerTrade={2} />
      </div>
    </div>
  )
}
