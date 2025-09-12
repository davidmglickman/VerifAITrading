'use client'

import HoverButton from '../../components/HoverButton'

export default function SimpleTest() {
  return (
    <div style={{ 
      padding: '2rem', 
      backgroundColor: '#f8f9fa', 
      color: '#1d1d1f', 
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '1rem' }}>Test Page Working!</h1>
      <p style={{ fontSize: '17px', color: '#6e6e73', marginBottom: '2rem' }}>
        If you can see this, the server is running correctly.
      </p>
      <HoverButton 
        onClick={() => alert('Button works!')}
        variant="primary"
        style={{ padding: '0.75rem 1.5rem', fontSize: '17px' }}
      >
        Click Test
      </HoverButton>
    </div>
  )
}
