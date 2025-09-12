'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser, getUserWatchlist, getUserAlerts, signOut } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import AITradingCoach from '../../components/AITradingCoach'
import WatchlistManager from '../../components/WatchlistManager'
import AlertsManager from '../../components/AlertsManager'
import TechnicalAnalysisAI from '../../components/TechnicalAnalysisAI'
import OCORecommendationAI from '../../components/OCORecommendationAI'
import SentimentAnalysisAI from '../../components/SentimentAnalysisAI'
import PortfolioRiskAI from '../../components/PortfolioRiskAI'
import ProfitTakingAI from '../../components/ProfitTakingAI'
import HoverButton from '../../components/HoverButton'
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

const Settings = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
  </svg>
)

const LogOut = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
  </svg>
)

const Search = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
    <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
  </svg>
)

// Mock data for development
const mockWatchlist = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 185.43, change: 2.67, changePercent: 1.46 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.56, change: -1.23, changePercent: -0.85 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.85, change: 5.34, changePercent: 1.43 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.42, change: -3.67, changePercent: -1.45 },
]

const mockAlerts = [
  { id: 1, symbol: 'AAPL', message: 'Price target of $185 reached', time: '2 min ago', type: 'price' },
  { id: 2, symbol: 'GOOGL', message: 'Volume spike detected', time: '15 min ago', type: 'volume' },
  { id: 3, symbol: 'MSFT', message: 'Breaking news alert', time: '1 hour ago', type: 'news' },
]

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
        // Check if user is authenticated
        const { user: currentUser, error: userError } = await getCurrentUser()
        
        if (userError || !currentUser) {
          router.push('/auth/signin')
          return
        }
        
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
        router.push('/auth/signin')
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
        background: 'linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 50%, #F1F3F4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#1D1D1F',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Loading...</div>
          <div style={{ fontSize: '1rem', opacity: 0.7 }}>Fetching your trading data</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 50%, #F1F3F4 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        padding: '1rem 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: 'linear-gradient(135deg, #007AFF, #5856D6)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(0, 122, 255, 0.3)'
            }}>
              <TrendingUp style={{width: '1.5rem', height: '1.5rem', color: 'white'}} />
            </div>
            <h1 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1D1D1F'}}>VerifAI Trading</h1>
          </div>
          
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            {/* Search */}
            <div style={{position: 'relative'}}>
              <Search style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1.25rem',
                height: '1.25rem',
                color: '#86868B'
              }} />
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  paddingLeft: '2.5rem',
                  paddingRight: '1rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#1D1D1F',
                  width: '16rem',
                  outline: 'none'
                }}
              />
            </div>
            
            {/* Notifications */}
            <button style={{
              position: 'relative',
              padding: '0.5rem',
              backgroundColor: 'rgba(0, 0, 0, 0.03)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease'
            }}>
              <Bell style={{width: '1.25rem', height: '1.25rem', color: '#1D1D1F'}} />
              {alerts.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-0.25rem',
                  right: '-0.25rem',
                  width: '1.25rem',
                  height: '1.25rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '0.75rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {alerts.length}
                </span>
              )}
            </button>
            
            {/* Settings */}
            <button style={{
              padding: '0.5rem',
              backgroundColor: 'rgba(0, 0, 0, 0.03)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease'
            }}>
              <Settings style={{width: '1.25rem', height: '1.25rem', color: '#1D1D1F'}} />
            </button>
            
            {/* Logout */}
            <button 
              onClick={handleSignOut}
              style={{
                padding: '0.5rem',
                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.03)'}
            >
              <LogOut style={{width: '1.25rem', height: '1.25rem', color: '#1D1D1F'}} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2rem'
        }}>
          {/* Welcome Section */}
          <div style={{
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '1rem',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5)'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#1D1D1F',
              marginBottom: '0.5rem'
            }}>
              Welcome back! 👋
            </h2>
            <p style={{color: '#86868B'}}>
              Here's what's happening with your portfolio today.
            </p>
          </div>

          {/* Dashboard Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {/* Watchlist */}
            <div style={{
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '1rem',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1D1D1F'
                }}>
                  Your Watchlist
                </h3>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(135deg, #007AFF, #5856D6)',
                  color: 'white',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 25px rgba(0, 122, 255, 0.3)'
                }}>
                  <Plus style={{width: '1rem', height: '1rem'}} />
                  <span>Add Stock</span>
                </button>
              </div>

              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {watchlist.map((stock) => (
                  <div key={stock.symbol} style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    transition: 'background-color 0.3s ease'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem'
                        }}>
                          <h4 style={{
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#1D1D1F'
                          }}>
                            {stock.symbol}
                          </h4>
                          <span style={{color: '#86868B'}}>
                            {stock.name}
                          </span>
                        </div>
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <div style={{
                          fontSize: '1.25rem',
                          fontWeight: 'bold',
                          color: '#1D1D1F'
                        }}>
                          ${stock.price.toFixed(2)}
                        </div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: stock.change >= 0 ? '#10b981' : '#ef4444'
                        }}>
                          {stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)} ({stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Alerts */}
            <div style={{
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '1rem',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5)'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1D1D1F',
                marginBottom: '1rem'
              }}>
                Recent Alerts 🔔
              </h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                {alerts.map((alert) => (
                  <div key={alert.id} style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{
                          fontWeight: '600',
                          color: '#1D1D1F',
                          fontSize: '0.875rem'
                        }}>
                          {alert.symbol}
                        </div>
                        <div style={{
                          color: '#86868B',
                          fontSize: '0.875rem'
                        }}>
                          {alert.message}
                        </div>
                      </div>
                      <div style={{
                        color: '#86868B',
                        fontSize: '0.75rem'
                      }}>
                        {alert.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button style={{
                width: '100%',
                marginTop: '1rem',
                color: '#007AFF',
                fontSize: '0.875rem',
                transition: 'color 0.3s ease',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}>
                View All Alerts
              </button>
            </div>

            {/* AI Insights */}
            <div style={{
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '1rem',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5)'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1D1D1F',
                marginBottom: '1rem'
              }}>
                AI Insights 🤖
              </h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <div style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(0, 0, 0, 0.1)'
                }}>
                  <h4 style={{
                    fontWeight: '600',
                    color: '#1D1D1F',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }}>
                    📈 Market Outlook
                  </h4>
                  <p style={{
                    color: '#86868B',
                    fontSize: '0.875rem'
                  }}>
                    Strong bullish momentum detected across tech sector. Consider increasing exposure to growth stocks.
                  </p>
                </div>
                <div style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(0, 0, 0, 0.1)'
                }}>
                  <h4 style={{
                    fontWeight: '600',
                    color: '#1D1D1F',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }}>
                    ⚠️ Risk Assessment
                  </h4>
                  <p style={{
                    color: '#86868B',
                    fontSize: '0.875rem'
                  }}>
                    Current portfolio shows moderate risk levels. Diversification recommended for volatility protection.
                  </p>
                </div>
              </div>
              <button style={{
                width: '100%',
                marginTop: '1rem',
                color: '#007AFF',
                fontSize: '0.875rem',
                transition: 'color 0.3s ease',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}>
                Get Full Analysis
              </button>
            </div>

            {/* TradingView Chart */}
            <div style={{
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '1rem',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5)'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1D1D1F',
                marginBottom: '1rem'
              }}>
                Market Chart 📊
              </h3>
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                borderRadius: '0.5rem',
                padding: '2rem',
                textAlign: 'center',
                border: '1px solid rgba(0, 0, 0, 0.1)'
              }}>
                <p style={{color: '#86868B'}}>
                  TradingView Chart will be integrated here
                </p>
                <p style={{
                  color: '#86868B',
                  fontSize: '0.875rem',
                  marginTop: '0.5rem'
                }}>
                  Real-time market data and interactive charts
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '1rem',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5)'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1D1D1F',
                marginBottom: '1rem'
              }}>
                Quick Actions ⚡
              </h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                <button style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  borderRadius: '0.5rem',
                  color: '#1D1D1F',
                  textAlign: 'left',
                  transition: 'background-color 0.3s ease',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer'
                }}>
                  📊 Run Portfolio Analysis
                </button>
                <button style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  borderRadius: '0.5rem',
                  color: '#1D1D1F',
                  textAlign: 'left',
                  transition: 'background-color 0.3s ease',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer'
                }}>
                  🔔 Set New Alert
                </button>
                <button style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  borderRadius: '0.5rem',
                  color: '#1D1D1F',
                  textAlign: 'left',
                  transition: 'background-color 0.3s ease',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer'
                }}>
                  📰 View Market News
                </button>
                <button style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  borderRadius: '0.5rem',
                  color: '#1D1D1F',
                  textAlign: 'left',
                  transition: 'background-color 0.3s ease',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer'
                }}>
                  ⚙️ Manage Settings
                </button>
              </div>
            </div>
          </div>

          {/* AI Trading Tools Section */}
          {/* AI Trading Components */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem',
            marginTop: '2rem'
          }}>
            {/* Position Sizing Calculator */}
            <PositionSizingCalculator 
              accountSize={100000} // Mock account size
              riskPerTrade={2} // 2% risk per trade
            />
            
            {/* Multi-Timeframe Analysis */}
            <MultiTimeframeAnalysis 
              symbol={watchlist[0]?.symbol || 'AAPL'} 
            />
            
            {/* Swing Pattern Scanner */}
            <SwingPatternScanner 
              symbol={watchlist[0]?.symbol || 'AAPL'} 
            />
            
            {/* Exit Strategy Manager */}
            <ExitStrategyManager 
              symbol={watchlist[0]?.symbol || 'AAPL'}
              entryPrice={150}
              currentPrice={watchlist[0]?.price || 152}
              positionSize={100}
            />
            
            {/* Technical Analysis AI */}
            <TechnicalAnalysisAI 
              symbol={watchlist[0]?.symbol || 'AAPL'} 
            />
            
            {/* OCO Recommendation AI */}
            <OCORecommendationAI 
              symbol={watchlist[0]?.symbol || 'AAPL'}
              currentPrice={watchlist[0]?.price || 150}
              accountSize={100000} // Mock account size
              riskTolerance={2} // Mock risk tolerance
            />
            
            {/* Sentiment Analysis AI */}
            <SentimentAnalysisAI 
              symbol={watchlist[0]?.symbol || 'AAPL'} 
            />
            
            {/* Profit-Taking AI */}
            <ProfitTakingAI />
            
            {/* Portfolio Risk AI */}
            <PortfolioRiskAI 
              positions={watchlist.map(stock => ({
                symbol: stock.symbol,
                shares: Math.floor(Math.random() * 100) + 10,
                avgCost: stock.price * (0.9 + Math.random() * 0.2),
                currentPrice: stock.price,
                sector: ['Technology', 'Healthcare', 'Finance', 'Energy'][Math.floor(Math.random() * 4)],
                marketValue: stock.price * (Math.floor(Math.random() * 100) + 10),
                gainLoss: (Math.random() - 0.5) * 1000,
                gainLossPercent: (Math.random() - 0.5) * 20
              }))}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
