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
import EnhancedWatchlistCards from '../../components/EnhancedWatchlistCards'
import WatchlistListView from '../../components/WatchlistListView'
import StockDetailView from '../../components/StockDetailView'
import PortfolioHoldings from '../../components/PortfolioHoldings'
import OCOSettings from '../../components/OCOSettings'
import OCONotificationDashboard from '../../components/OCONotificationDashboard'

// Modern Dashboard with Sidebar Navigation
export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('watchlist')
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const aiCoachRef = useRef<any>(null)
  const watchlistRef = useRef<any>(null)
  const [watchlist, setWatchlist] = useState<any[]>([
    { id: 'default-1', symbol: 'GLXY', added_at: new Date().toISOString() }
  ])

  const updateWatchlist = async () => {
    try {
      console.log('Watchlist update requested - this is a demo with hardcoded data')
      // Since we're using hardcoded data, just trigger a re-render
      setWatchlist(current => [...current])
    } catch (error) {
      console.error('Error updating watchlist:', error)
    }
  }

  const addToWatchlistLocal = async (symbol: string) => {
    try {
      console.log('Adding stock to local watchlist:', symbol)
      const newId = `demo-${Date.now()}`
      const newItem = { 
        id: newId, 
        symbol: symbol.toUpperCase(), 
        added_at: new Date().toISOString() 
      }
      setWatchlist(current => [...current, newItem])
      return { data: newItem, error: null }
    } catch (error) {
      console.error('Error adding to local watchlist:', error)
      return { data: null, error }
    }
  }

  const removeFromWatchlistLocal = async (id: string) => {
    try {
      console.log('Removing stock with ID:', id)
      setWatchlist(current => current.filter(item => item.id !== id))
      return { error: null }
    } catch (error) {
      console.error('Error removing from local watchlist:', error)
      return { error }
    }
  }

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { user, error } = await getCurrentUser()
      if (error || !user) {
        // For development/demo, allow bypassing auth with a valid UUID
        console.log('No authenticated user found, using demo mode')
        setUser({ id: '550e8400-e29b-41d4-a716-446655440000', email: 'demo@example.com' })
        // Uncomment the line below to enforce authentication in production:
        // router.push('/auth/signin')
        return
      }
      setUser(user)
    } catch (error) {
      console.error('Auth check failed:', error)
      // For development/demo, create a demo user with valid UUID instead of redirecting
      console.log('Auth failed, using demo mode')
      setUser({ id: '550e8400-e29b-41d4-a716-446655440000', email: 'demo@example.com' })
      // Uncomment the line below to enforce authentication in production:
      // router.push('/auth/signin')
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

  const handleStockClick = (symbol: string) => {
    setSelectedStock(symbol)
  }

  const handleCloseStockDetail = () => {
    setSelectedStock(null)
  }

  const handleSetAlert = async (symbol: string, price: number, type: 'above' | 'below') => {
    // In production, this would save to database
    alert(`🔔 Alert set for ${symbol} when price goes ${type} $${price.toFixed(2)}`)
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
            {activeView === 'watchlist' && 'Manage your stock watchlist'}
            {activeView === 'ai-coach' && 'AI-powered trading insights and recommendations'}
            {activeView === 'analysis' && 'Technical and fundamental analysis tools'}
            {activeView === 'alerts' && 'Price alerts and notifications'}
            {activeView === 'tools' && 'Position sizing and risk management tools'}
          </p>
        </div>

        {/* Content Area */}
        <div style={{ minHeight: '500px' }}>
          {activeView === 'watchlist' && <WatchlistContent watchlist={watchlist} setWatchlist={setWatchlist} onStockClick={handleStockClick} onSetAlert={handleSetAlert} updateWatchlist={updateWatchlist} removeFromWatchlistLocal={removeFromWatchlistLocal} addToWatchlistLocal={addToWatchlistLocal} user={user} />}
          {activeView === 'ai-coach' && <AICoachContent watchlist={watchlist} />}
          {activeView === 'analysis' && <AnalysisContent watchlist={watchlist} />}
          {activeView === 'alerts' && <AlertsContent user={user} />}
          {activeView === 'tools' && <ToolsContent />}
        </div>
      </div>

      {/* Stock Detail Modal */}
      {selectedStock && (
        <StockDetailView 
          symbol={selectedStock} 
          onClose={handleCloseStockDetail}
          onSetAlert={handleSetAlert}
        />
      )}

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

// Watchlist Content Component
function WatchlistContent({ 
  watchlist, 
  setWatchlist, 
  onStockClick, 
  onSetAlert,
  updateWatchlist,
  removeFromWatchlistLocal,
  addToWatchlistLocal,
  user
}: { 
  watchlist: any[]
  setWatchlist: (list: any[]) => void
  onStockClick: (symbol: string) => void
  onSetAlert: (symbol: string, price: number, type: 'above' | 'below') => void
  updateWatchlist: () => Promise<void>
  removeFromWatchlistLocal: (id: string) => Promise<{error: any}>
  addToWatchlistLocal: (symbol: string) => Promise<{data: any, error: any}>
  user: any
}) {
  const [holdings, setHoldings] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('list')

  return (
    <div>
      {/* AI Trading Coach */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid #E5E5E7',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1D1D1F',
            margin: '0 0 1rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🤖 AI Trading Coach
          </h3>
          <AITradingCoach userWatchlist={watchlist} />
        </div>
      </div>

      {/* Enhanced Watchlist Cards */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1D1D1F',
            margin: 0
          }}>
            📊 Smart Watchlist {viewMode === 'cards' ? 'Cards' : 'List'}
          </h3>
          
          {/* View Toggle */}
          <div style={{
            display: 'flex',
            backgroundColor: '#F2F2F7',
            borderRadius: '8px',
            padding: '2px'
          }}>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                padding: '6px 12px',
                backgroundColor: viewMode === 'cards' ? '#007AFF' : 'transparent',
                color: viewMode === 'cards' ? 'white' : '#007AFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🎴 Cards
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 12px',
                backgroundColor: viewMode === 'list' ? '#007AFF' : 'transparent',
                color: viewMode === 'list' ? 'white' : '#007AFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              📋 List
            </button>
          </div>
        </div>
        
        <p style={{
          fontSize: '14px',
          color: '#86868B',
          margin: '0 0 1.5rem 0'
        }}>
          {viewMode === 'cards' 
            ? 'Click any card to see detailed analysis, news, and technical indicators'
            : 'Compact list view with expandable OCO strategies. Click ▶ to expand details.'
          }
        </p>
        
        {viewMode === 'cards' ? (
          <EnhancedWatchlistCards 
            watchlist={watchlist}
            onStockClick={onStockClick}
            onSetAlert={onSetAlert}
            userId={user?.id || "550e8400-e29b-41d4-a716-446655440000"}
          />
        ) : (
          <WatchlistListView 
            watchlist={watchlist}
            onStockClick={onStockClick}
            onSetAlert={onSetAlert}
            userId={user?.id || "550e8400-e29b-41d4-a716-446655440000"}
          />
        )}
      </div>

      {/* OCO Notifications Dashboard */}
      <div style={{ marginBottom: '2rem' }}>
        <OCONotificationDashboard userId={user?.id || "550e8400-e29b-41d4-a716-446655440000"} />
      </div>

      {/* Portfolio Holdings Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid #E5E5E7',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1D1D1F',
            margin: '0 0 1rem 0'
          }}>
            💼 Portfolio Holdings
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#86868B',
            margin: '0 0 1.5rem 0'
          }}>
            Paste your current positions to get AI-powered sell recommendations and OCO order suggestions
          </p>
          <PortfolioHoldings onHoldingsUpdate={setHoldings} />
        </div>
      </div>

      {/* OCO Settings Section */}
      {(holdings.length > 0 || watchlist.length > 0) && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '2rem',
            border: '1px solid #E5E5E7',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1D1D1F',
              margin: '0 0 1rem 0'
            }}>
              🎯 OCO Order Settings
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#86868B',
              margin: '0 0 1.5rem 0'
            }}>
              AI-generated bracket orders with profit targets and stop losses
            </p>
            <OCOSettings 
              holdings={holdings}
              watchlistSymbols={watchlist.map(item => item.symbol)}
            />
          </div>
        </div>
      )}

      {/* Traditional Watchlist Manager */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid #E5E5E7',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }} data-section="watchlist">
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1D1D1F',
          margin: '0 0 1rem 0'
        }}>
          ⚙️ Watchlist Management
        </h3>
        <WatchlistManager 
          userId={user?.id || "550e8400-e29b-41d4-a716-446655440000"} 
          watchlist={watchlist} 
          onWatchlistUpdate={updateWatchlist}
          removeFromWatchlistLocal={removeFromWatchlistLocal}
          addToWatchlistLocal={addToWatchlistLocal}
        />
      </div>
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
function AlertsContent({ user }: { user: any }) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '2rem',
      border: '1px solid #E5E5E7',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <AlertsManager userId={user?.id || "550e8400-e29b-41d4-a716-446655440000"} />
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
