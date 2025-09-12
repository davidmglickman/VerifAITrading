'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  // Navigation handlers
  const handleSignIn = () => {
    router.push('/auth/signin')
  }

  const handleGetStarted = () => {
    router.push('/auth/signin')
  }

  const handleViewDashboard = () => {
    router.push('/dashboard')
  }
  return (
    <div style={{
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%, #f8fafc 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(59, 130, 246, 0.25);
        }
      `}</style>

      {/* Header */}
      <header style={{
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        padding: '1rem 1.5rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
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
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)'
            }}>
              <svg style={{width: '1.5rem', height: '1.5rem', color: 'white'}} fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
            </div>
            <h1 style={{fontSize: '1.5rem', fontWeight: '600', color: '#1d1d1f'}}>VerifAI Trading</h1>
          </div>
          
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <button 
              onClick={handleSignIn}
              style={{
                padding: '0.5rem 1rem',
                color: '#424245',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: '400',
                borderRadius: '0.5rem',
                fontSize: '16px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#1d1d1f'
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#424245'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              Sign In
            </button>
            <button 
              onClick={handleGetStarted}
              className="cta-button"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1.5rem'}}>
        <div style={{maxWidth: '70rem', margin: '0 auto', textAlign: 'center'}}>
          {/* Main Glassmorphic Container */}
          <div style={{
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '2rem',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            padding: '3rem',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.08), 0 0 60px rgba(59, 130, 246, 0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.03) 0%, transparent 50%)',
              pointerEvents: 'none'
            }}></div>

            {/* Content */}
            <div style={{position: 'relative', zIndex: 1}}>
              {/* Logo/Brand */}
              <div style={{marginBottom: '3rem'}}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '5rem',
                  height: '5rem',
                  borderRadius: '1.5rem',
                  background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                  marginBottom: '1.5rem',
                  boxShadow: '0 20px 60px rgba(16, 185, 129, 0.4)'
                }}>
                  <svg style={{width: '2.5rem', height: '2.5rem', color: 'white'}} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 2.05v2.02c4.39.54 7.5 4.53 6.96 8.92-.46 3.64-3.32 6.5-6.96 6.96v2.02c5.5-.55 9.5-5.43 8.95-10.93C21.45 6.37 17.63 2.55 13 2.05z"/>
                    <path d="M11 2.05C6.5 2.6 2.5 7.48 3.05 12.98c.5 4.67 4.28 8.49 8.95 8.99v-2.02c-3.64-.46-6.5-3.32-6.96-6.96C4.5 8.58 7.61 4.59 12 4.05V2.05h-1z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <h1 style={{
                  fontSize: '3.5rem',
                  fontWeight: '700',
                  color: '#1d1d1f',
                  marginBottom: '1rem',
                  letterSpacing: '-0.025em'
                }}>
                  VerifAI Trading
                </h1>
                <p style={{
                  fontSize: '1.5rem',
                  color: '#424245',
                  fontWeight: '400',
                  marginBottom: '1rem'
                }}>
                  AI-Powered Stock Swing Trading Platform
                </p>
                <p style={{
                  fontSize: '1.125rem',
                  color: '#6e6e73',
                  maxWidth: '600px',
                  margin: '0 auto',
                  fontWeight: '400',
                  lineHeight: '1.5'
                }}>
                  Intelligent notifications, profit-taking recommendations, and institutional-grade trading insights powered by OpenAI.
                </p>
              </div>

              {/* Features Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)', // Always 3 columns
                gap: '1.5rem',
                marginBottom: '3rem',
                alignItems: 'stretch',
              }}>
                {/* Card 1 */}
                <div className="feature-card" style={{
                  backdropFilter: 'blur(10px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '1rem',
                  padding: '2rem',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '0.75rem',
                    background: 'linear-gradient(135deg, #4ade80, #3b82f6)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(74, 222, 128, 0.2)'
                  }}>
                    <svg style={{width: '1.5rem', height: '1.5rem', color: 'white'}} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#1d1d1f', marginBottom: '0.75rem'}}>AI-Powered Analysis</h3>
                  <p style={{color: '#424245', fontSize: '0.95rem', lineHeight: '1.6', fontWeight: '400'}}>Advanced OpenAI-powered stock analysis, OCO recommendations, and real-time sentiment analysis for swing and day trading.</p>
                </div>

                {/* Card 2 */}
                <div className="feature-card" style={{
                  backdropFilter: 'blur(10px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '1rem',
                  padding: '2rem',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '0.75rem',
                    background: 'linear-gradient(135deg, #c084fc, #ec4899)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(192, 132, 252, 0.2)'
                  }}>
                    <svg style={{width: '1.5rem', height: '1.5rem', color: 'white'}} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                    </svg>
                  </div>
                  <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#1d1d1f', marginBottom: '0.75rem'}}>Smart Notifications</h3>
                  <p style={{color: '#424245', fontSize: '0.95rem', lineHeight: '1.6', fontWeight: '400'}}>Automated email alerts for watchlist news and AI-powered profit-taking recommendations to minimize risk and lock in gains.</p>
                </div>

                {/* Card 3 */}
                <div className="feature-card" style={{
                  backdropFilter: 'blur(10px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '1rem',
                  padding: '2rem',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '0.75rem',
                    background: 'linear-gradient(135deg, #fb923c, #ef4444)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(251, 146, 60, 0.2)'
                  }}>
                    <svg style={{width: '1.5rem', height: '1.5rem', color: 'white'}} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                    </svg>
                  </div>
                  <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#1d1d1f', marginBottom: '0.75rem'}}>Real-Time Data</h3>
                  <p style={{color: '#424245', fontSize: '0.95rem', lineHeight: '1.6', fontWeight: '400'}}>Live market data integration with TradingView charts, portfolio risk analysis, and institutional-grade trading insights.</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '2rem'
              }}>
                <button 
                  onClick={handleGetStarted}
                  className="cta-button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem 2rem',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    borderRadius: '0.75rem',
                    background: 'linear-gradient(135deg, #007AFF, #5856D6)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 25px rgba(0, 122, 255, 0.3)',
                    minWidth: '200px'
                  }}
                >
                  Start Trading with AI
                </button>
                <button 
                  onClick={handleViewDashboard}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '400',
                    borderRadius: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    color: '#1d1d1f',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(4px)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    minWidth: '200px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.08)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  View Live Dashboard
                </button>
              </div>

              {/* Status */}
              <div style={{textAlign: 'center'}}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  borderRadius: '2rem',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  <p style={{color: '#1d1d1f', fontSize: '0.875rem', fontWeight: '600', margin: 0}}>
                    System Online • AI Models Active
                  </p>
                </div>
                <p style={{color: '#6e6e73', fontSize: '0.8rem', fontWeight: '400'}}>
                  Real-time market data • Automated notifications • 24/7 AI monitoring
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{textAlign: 'center', padding: '2rem 0', color: '#6e6e73', fontSize: '0.875rem'}}>
        <div style={{maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem'}}>
          <p>&copy; 2024 VerifAI Trading. Powered by OpenAI, Supabase, and TradingView.</p>
          <p style={{marginTop: '0.5rem', fontSize: '0.75rem', color: '#86868b', fontWeight: '400'}}>
            Intelligent trading • Risk management • Profit optimization
          </p>
        </div>
      </footer>
    </div>
  )
}
