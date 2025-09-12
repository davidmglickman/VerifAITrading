export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #1e40af 50%, #1e293b 75%, #0f172a 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite'
    }}>
      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(16, 185, 129, 0.5);
        }
      `}</style>

      {/* Header */}
      <header style={{
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
        padding: '1rem 1.5rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
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
            <h1 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc'}}>VerifAI Trading</h1>
          </div>
          
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <a 
              href="/auth/signin"
              style={{
                padding: '0.5rem 1rem',
                color: '#cbd5e1',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                fontWeight: '500',
                borderRadius: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#f8fafc'
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#cbd5e1'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              Sign In
            </a>
            <a 
              href="/auth/signin"
              className="cta-button"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                color: 'white',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
                fontWeight: '600'
              }}
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1.5rem'}}>
        <div style={{maxWidth: '70rem', margin: '0 auto', textAlign: 'center'}}>
          {/* Main Glassmorphic Container */}
          <div style={{
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '2rem',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            padding: '3rem',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 60px rgba(59, 130, 246, 0.1)',
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
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
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
                  fontWeight: 'bold',
                  color: '#f8fafc',
                  marginBottom: '1rem',
                  letterSpacing: '-0.025em',
                  background: 'linear-gradient(135deg, #f8fafc, #cbd5e1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  VerifAI Trading
                </h1>
                <p style={{
                  fontSize: '1.5rem',
                  color: '#94a3b8',
                  fontWeight: '500',
                  marginBottom: '1rem'
                }}>
                  AI-Powered Stock Swing Trading Platform
                </p>
                <p style={{
                  fontSize: '1.125rem',
                  color: '#64748b',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  Intelligent notifications, profit-taking recommendations, and institutional-grade trading insights powered by OpenAI.
                </p>
              </div>

              {/* Features Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
              }}>
                <div className="feature-card" style={{
                  backdropFilter: 'blur(10px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '1rem',
                  padding: '2rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  textAlign: 'left'
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
                    boxShadow: '0 8px 20px rgba(74, 222, 128, 0.3)'
                  }}>
                    <svg style={{width: '1.5rem', height: '1.5rem', color: 'white'}} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h3 style={{fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '0.75rem'}}>AI-Powered Analysis</h3>
                  <p style={{color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6'}}>Advanced OpenAI-powered stock analysis, OCO recommendations, and real-time sentiment analysis for swing and day trading.</p>
                </div>

                <div className="feature-card" style={{
                  backdropFilter: 'blur(10px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '1rem',
                  padding: '2rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  textAlign: 'left'
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
                    boxShadow: '0 8px 20px rgba(192, 132, 252, 0.3)'
                  }}>
                    <svg style={{width: '1.5rem', height: '1.5rem', color: 'white'}} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                    </svg>
                  </div>
                  <h3 style={{fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '0.75rem'}}>Smart Notifications</h3>
                  <p style={{color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6'}}>Automated email alerts for watchlist news and AI-powered profit-taking recommendations to minimize risk and lock in gains.</p>
                </div>

                <div className="feature-card" style={{
                  backdropFilter: 'blur(10px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '1rem',
                  padding: '2rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  textAlign: 'left'
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
                    boxShadow: '0 8px 20px rgba(251, 146, 60, 0.3)'
                  }}>
                    <svg style={{width: '1.5rem', height: '1.5rem', color: 'white'}} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                    </svg>
                  </div>
                  <h3 style={{fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '0.75rem'}}>Real-Time Data</h3>
                  <p style={{color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6'}}>Live market data integration with TradingView charts, portfolio risk analysis, and institutional-grade trading insights.</p>
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
                <a 
                  href="/auth/signin"
                  className="cta-button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem 2rem',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    borderRadius: '0.75rem',
                    background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                    color: 'white',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
                    minWidth: '200px'
                  }}
                >
                  Start Trading with AI
                </a>
                <a 
                  href="/dashboard"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    borderRadius: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(4px)',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    minWidth: '200px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  View Live Dashboard
                </a>
              </div>

              {/* Status */}
              <div style={{textAlign: 'center'}}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '2rem',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  <p style={{color: '#10b981', fontSize: '0.875rem', fontWeight: '600', margin: 0}}>
                    System Online • AI Models Active
                  </p>
                </div>
                <p style={{color: '#64748b', fontSize: '0.8rem'}}>
                  Real-time market data • Automated notifications • 24/7 AI monitoring
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{textAlign: 'center', padding: '2rem 0', color: '#64748b', fontSize: '0.875rem'}}>
        <div style={{maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem'}}>
          <p>&copy; 2024 VerifAI Trading. Powered by OpenAI, Supabase, and TradingView.</p>
          <p style={{marginTop: '0.5rem', fontSize: '0.75rem', color: '#475569'}}>
            Intelligent trading • Risk management • Profit optimization
          </p>
        </div>
      </footer>
    </div>
  )
}
