export default function HomePage() {
  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      {/* Header */}
      <header style={{
        backdropFilter: 'blur(16px)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1rem 1.5rem'
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
              background: 'linear-gradient(135deg, #3b82f6, #9333ea)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={{width: '1.5rem', height: '1.5rem', color: 'white'}} fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
            </div>
            <h1 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white'}}>VerifAI Trading</h1>
          </div>
          
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <a 
              href="/auth/signin"
              style={{
                padding: '0.5rem 1rem',
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
            >
              Sign In
            </a>
            <a 
              href="/auth/signin"
              style={{
                padding: '0.5rem 1.5rem',
                background: 'linear-gradient(to right, #3b82f6, #9333ea)',
                color: 'white',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'all 0.2s',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1.5rem'}}>
        <div style={{maxWidth: '56rem', margin: '0 auto', textAlign: 'center'}}>
          {/* Glassmorphic Container */}
          <div style={{
            backdropFilter: 'blur(16px)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '3rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Logo/Brand */}
            <div style={{marginBottom: '2rem'}}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '5rem',
                height: '5rem',
                borderRadius: '1rem',
                background: 'linear-gradient(135deg, #3b82f6, #9333ea)',
                marginBottom: '1.5rem'
              }}>
                <svg style={{width: '2.5rem', height: '2.5rem', color: 'white'}} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2.05v2.02c4.39.54 7.5 4.53 6.96 8.92-.46 3.64-3.32 6.5-6.96 6.96v2.02c5.5-.55 9.5-5.43 8.95-10.93C21.45 6.37 17.63 2.55 13 2.05z"/>
                  <path d="M11 2.05C6.5 2.6 2.5 7.48 3.05 12.98c.5 4.67 4.28 8.49 8.95 8.99v-2.02c-3.64-.46-6.5-3.32-6.96-6.96C4.5 8.58 7.61 4.59 12 4.05V2.05h-1z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <h1 style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '1rem',
                letterSpacing: '-0.025em'
              }}>
                VerifAI Trading
              </h1>
              <p style={{
                fontSize: '1.25rem',
                color: '#bfdbfe',
                fontWeight: '500'
              }}>
                AI-Powered Stock Swing Trading Platform
              </p>
            </div>

            {/* Features Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2.5rem'
            }}>
              <div style={{
                backdropFilter: 'blur(4px)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.5rem',
                  background: 'linear-gradient(135deg, #4ade80, #3b82f6)',
                  marginBottom: '1rem',
                  margin: '0 auto 1rem auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{width: '1.5rem', height: '1.5rem', color: 'white'}} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem'}}>AI Analysis</h3>
                <p style={{color: '#bfdbfe', fontSize: '0.875rem'}}>Advanced OpenAI-powered stock analysis and recommendations</p>
              </div>

              <div style={{
                backdropFilter: 'blur(4px)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.5rem',
                  background: 'linear-gradient(135deg, #c084fc, #ec4899)',
                  marginBottom: '1rem',
                  margin: '0 auto 1rem auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{width: '1.5rem', height: '1.5rem', color: 'white'}} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                  </svg>
                </div>
                <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem'}}>Real-Time Data</h3>
                <p style={{color: '#bfdbfe', fontSize: '0.875rem'}}>Live market data and TradingView chart integration</p>
              </div>

              <div style={{
                backdropFilter: 'blur(4px)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.5rem',
                  background: 'linear-gradient(135deg, #fb923c, #ef4444)',
                  marginBottom: '1rem',
                  margin: '0 auto 1rem auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{width: '1.5rem', height: '1.5rem', color: 'white'}} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                  </svg>
                </div>
                <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem'}}>Smart Alerts</h3>
                <p style={{color: '#bfdbfe', fontSize: '0.875rem'}}>Intelligent email notifications for trading opportunities</p>
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
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  borderRadius: '0.5rem',
                  background: 'linear-gradient(to right, #3b82f6, #9333ea)',
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              >
                Get Started
              </a>
              <a 
                href="/dashboard"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  borderRadius: '0.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(4px)',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
              >
                View Dashboard
              </a>
            </div>

            {/* Status */}
            <div style={{textAlign: 'center'}}>
              <p style={{color: '#bfdbfe', fontSize: '0.875rem', marginBottom: '0.5rem'}}>
                System Status: <span style={{color: '#4ade80', fontWeight: '500'}}>Online</span>
              </p>
              <p style={{color: '#93c5fd', fontSize: '0.75rem'}}>Market Data: Real-time via Finnhub API</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{textAlign: 'center', padding: '1.5rem 0', color: '#93c5fd', fontSize: '0.875rem'}}>
        <p>&copy; 2024 VerifAI Trading. Powered by OpenAI, Supabase, and TradingView.</p>
      </footer>
    </div>
  )
}
