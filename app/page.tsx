export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #1e40af 50%, #1e293b 75%, #0f172a 100%)',
      backgroundSize: '400% 400%'
    }}>
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
                transition: 'color 0.3s ease',
                fontWeight: '500'
              }}
            >
              Sign In
            </a>
            <a 
              href="/auth/signin"
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
        <div style={{maxWidth: '56rem', margin: '0 auto', textAlign: 'center'}}>
          {/* Glassmorphic Container */}
          <div style={{
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '2rem',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            padding: '3rem',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 60px rgba(59, 130, 246, 0.1)'
          }}>
            {/* Logo/Brand */}
            <div style={{marginBottom: '2rem'}}>
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
                fontSize: '3rem',
                fontWeight: 'bold',
                color: '#f8fafc',
                marginBottom: '1rem',
                letterSpacing: '-0.025em'
              }}>
                VerifAI Trading
              </h1>
              <p style={{
                fontSize: '1.25rem',
                color: '#94a3b8',
                fontWeight: '500'
              }}>
                AI-Powered Stock Swing Trading Platform
              </p>
            </div>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
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
                  padding: '1rem 2rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)'
                }}
              >
                Get Started
              </a>
            </div>

            {/* Status */}
            <div style={{textAlign: 'center'}}>
              <p style={{color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem'}}>
                System Status: <span style={{color: '#10b981', fontWeight: '600'}}>Online</span>
              </p>
              <p style={{color: '#64748b', fontSize: '0.75rem'}}>Market Data: Real-time via Finnhub API</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{textAlign: 'center', padding: '1.5rem 0', color: '#64748b', fontSize: '0.875rem'}}>
        <p>&copy; 2024 VerifAI Trading. Powered by OpenAI, Supabase, and TradingView.</p>
      </footer>
    </div>
  )
}
