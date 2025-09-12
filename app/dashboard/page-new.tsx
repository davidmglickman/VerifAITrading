'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser, getUserWatchlist, getUserAlerts, signOut } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import AITradingCoach from '../../components/AITradingCoach'
import WatchlistManager from '../../components/WatchlistManager'
import AlertsManager from '../../components/AlertsManager'
import TechnicalAnalysisAI from '../../components/TechnicalAnalysisAI'
import PortfolioRiskAI from '../../components/PortfolioRiskAI'
import PositionSizingCalculator from '../../components/PositionSizingCalculator'
import SwingPatternScanner from '../../components/SwingPatternScanner'
import MultiTimeframeAnalysis from '../../components/MultiTimeframeAnalysis'
import ExitStrategyManager from '../../components/ExitStrategyManager'

// SVG Icons as components
const TrendingUp = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
  </svg>
)

const Plus = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
  </svg>
)

const Bell = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V3h0v14z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
)

const Search = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
    <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
  </svg>
)

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [watchlist, setWatchlist] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])

  // Check authentication and load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('Dashboard: Checking authentication')
        
        // Add a small delay to ensure session is established (especially after OAuth redirect)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check if user is authenticated
        const { user: currentUser, error: userError } = await getCurrentUser()
        
        console.log('Dashboard auth check:', { currentUser: currentUser?.email, userError })
        
        if (userError) {
          console.error('User error:', userError)
          router.push('/auth/signin?error=auth_check_failed')
          return
        }
        
        if (!currentUser) {
          console.log('No user found, redirecting to signin')
          router.push('/auth/signin?error=not_authenticated')
          return
        }
        
        console.log('User authenticated:', currentUser.email)
        setUser(currentUser)
        
        // Load user's watchlist
        const { data: watchlistData, error: watchlistError } = await getUserWatchlist(currentUser.id)
        if (!watchlistError && watchlistData) {
          setWatchlist(watchlistData)
        }
        
        // Load user's alerts
        const { data: alertsData, error: alertsError } = await getUserAlerts(currentUser.id)
        if (!alertsError && alertsData) {
          setAlerts(alertsData)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error loading user data:', error)
        router.push('/auth/signin?error=load_failed')
      }
    }
    
    loadUserData()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#FAFAFA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#1D1D1F',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #E5E5E7',
            borderTopColor: '#007AFF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Loading Dashboard</div>
          <div style={{ fontSize: '14px', color: '#86868B' }}>Fetching your trading data...</div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFAFA',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Modern Top Navigation */}
      <nav style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #E5E5E7',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '72px'
        }}>
          {/* Logo */}
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #007AFF, #5856D6)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(0, 122, 255, 0.3)'
            }}>
              <TrendingUp style={{width: '20px', height: '20px', color: 'white'}} />
            </div>
            <h1 style={{fontSize: '20px', fontWeight: '600', color: '#1D1D1F', margin: 0}}>
              VerifAI Trading
            </h1>
          </div>
          
          {/* Search Bar */}
          <div style={{
            flex: 1,
            maxWidth: '400px',
            margin: '0 2rem',
            position: 'relative'
          }}>
            <Search style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '18px',
              height: '18px',
              color: '#86868B'
            }} />
            <input
              type="text"
              placeholder="Search stocks, ETFs, or get AI insights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                backgroundColor: '#F5F5F7',
                border: '1px solid transparent',
                borderRadius: '12px',
                fontSize: '15px',
                color: '#1D1D1F',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          {/* User Menu */}
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <button style={{
              position: 'relative',
              padding: '8px',
              backgroundColor: 'transparent',
              border: '1px solid #E5E5E7',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}>
              <Bell style={{width: '20px', height: '20px', color: '#1D1D1F'}} />
              {alerts.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#FF3B30',
                  borderRadius: '50%'
                }}></span>
              )}
            </button>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 12px',
              backgroundColor: '#F5F5F7',
              borderRadius: '12px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#007AFF',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <span style={{fontSize: '14px', color: '#1D1D1F', fontWeight: '500'}}>
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'transparent',
                  border: '1px solid #E5E5E7',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#86868B',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 2rem',
        display: 'grid',
        gap: '24px'
      }}>
        {/* Welcome Section */}
        <section style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E5E5E7'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1D1D1F',
            margin: '0 0 8px 0'
          }}>
            Welcome back, {user?.email?.split('@')[0]}
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#86868B',
            margin: 0
          }}>
            Here's your trading overview for today
          </p>
        </section>

        {/* Quick Stats Grid */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #E5E5E7',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#E3F2FD',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp style={{width: '24px', height: '24px', color: '#007AFF'}} />
            </div>
            <div>
              <div style={{fontSize: '24px', fontWeight: '600', color: '#1D1D1F'}}>
                {watchlist.length}
              </div>
              <div style={{fontSize: '14px', color: '#86868B'}}>Watchlist Items</div>
            </div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #E5E5E7',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#FFF3E0',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bell style={{width: '24px', height: '24px', color: '#FF9500'}} />
            </div>
            <div>
              <div style={{fontSize: '24px', fontWeight: '600', color: '#1D1D1F'}}>
                {alerts.length}
              </div>
              <div style={{fontSize: '14px', color: '#86868B'}}>Active Alerts</div>
            </div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #E5E5E7',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#E8F5E8',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Plus style={{width: '24px', height: '24px', color: '#34C759'}} />
            </div>
            <div>
              <div style={{fontSize: '24px', fontWeight: '600', color: '#1D1D1F'}}>
                AI Ready
              </div>
              <div style={{fontSize: '14px', color: '#86868B'}}>Analysis Tools</div>
            </div>
          </div>
        </section>

        {/* Main Dashboard Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {/* AI Trading Coach */}
          <section style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E5E5E7'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1D1D1F',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#007AFF',
                borderRadius: '50%'
              }}></div>
              AI Trading Coach
            </h3>
            <AITradingCoach />
          </section>
          
          {/* Watchlist Manager */}
          <section style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E5E5E7'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1D1D1F',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#5856D6',
                borderRadius: '50%'
              }}></div>
              Watchlist Manager
            </h3>
            <WatchlistManager 
              watchlist={watchlist} 
              onWatchlistUpdate={(newWatchlist) => setWatchlist(newWatchlist)} 
            />
          </section>
          
          {/* Position Sizing Calculator */}
          <section style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E5E5E7'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1D1D1F',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#34C759',
                borderRadius: '50%'
              }}></div>
              Position Sizing Calculator
            </h3>
            <PositionSizingCalculator />
          </section>
          
          {/* Technical Analysis AI */}
          <section style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E5E5E7'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1D1D1F',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#FF3B30',
                borderRadius: '50%'
              }}></div>
              Technical Analysis AI
            </h3>
            <TechnicalAnalysisAI />
          </section>
          
          {/* Swing Pattern Scanner */}
          <section style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E5E5E7'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1D1D1F',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#FF9500',
                borderRadius: '50%'
              }}></div>
              Swing Pattern Scanner
            </h3>
            <SwingPatternScanner />
          </section>
          
          {/* Multi-Timeframe Analysis */}
          <section style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E5E5E7'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1D1D1F',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#AF52DE',
                borderRadius: '50%'
              }}></div>
              Multi-Timeframe Analysis
            </h3>
            <MultiTimeframeAnalysis />
          </section>
        </div>

        {/* Bottom Section - Advanced Tools */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {/* Exit Strategy Manager */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E5E5E7'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1D1D1F',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#007AFF',
                borderRadius: '50%'
              }}></div>
              Exit Strategy Manager
            </h3>
            <ExitStrategyManager />
          </div>
          
          {/* Alerts Manager */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E5E5E7'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1D1D1F',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#FF9500',
                borderRadius: '50%'
              }}></div>
              Smart Alerts
            </h3>
            <AlertsManager 
              alerts={alerts} 
              onAlertsUpdate={(newAlerts) => setAlerts(newAlerts)} 
            />
          </div>
          
          {/* Portfolio Risk AI */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E5E5E7'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1D1D1F',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#34C759',
                borderRadius: '50%'
              }}></div>
              Portfolio Risk Analysis
            </h3>
            <PortfolioRiskAI />
          </div>
        </section>
      </main>
    </div>
  )
}
