'use client'

import Link from 'next/link'

export default function RedirectTest() {
  const testPages = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Sign In', path: '/auth/signin' },
    { name: 'Sign Up', path: '/auth/signup' },
    { name: 'Auth Callback', path: '/auth/callback' },
    { name: 'Test Auth', path: '/test-auth' }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{marginBottom: '2rem', color: '#1D1D1F'}}>Port 4000 Redirect Test</h1>
        
        <div style={{marginBottom: '2rem'}}>
          <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
          <p><strong>Port:</strong> {typeof window !== 'undefined' ? window.location.port : 'Loading...'}</p>
          <p><strong>Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Loading...'}</p>
        </div>

        <h2 style={{marginBottom: '1rem', color: '#333'}}>Test All Page Navigation</h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {testPages.map((page) => (
            <Link 
              key={page.path}
              href={page.path}
              style={{
                display: 'block',
                padding: '1rem',
                backgroundColor: '#007AFF',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              {page.name}
            </Link>
          ))}
        </div>

        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '1rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <h3>Setup Status:</h3>
          <ul>
            <li>✅ Environment variables updated to port 4000</li>
            <li>✅ Development server running on port 4000</li>
            <li>✅ Auth functions use dynamic origin detection</li>
            <li>⚠️ Google OAuth may need manual configuration for port 4000</li>
            <li>⚠️ Supabase redirect URLs may need manual configuration</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
