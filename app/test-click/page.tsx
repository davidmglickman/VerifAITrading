'use client'

export default function TestClick() {
  return (
    <div style={{ 
      padding: '2rem', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 50%, #F1F3F4 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <h1 style={{ color: '#1D1D1F', marginBottom: '2rem', fontWeight: 'bold' }}>Click Test Page</h1>
      
      <button 
        onClick={() => alert('Basic button clicked!')}
        style={{
          padding: '1rem 2rem',
          background: 'linear-gradient(135deg, #007AFF, #5856D6)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '1rem',
          display: 'block',
          boxShadow: '0 8px 25px rgba(0, 122, 255, 0.3)',
          transition: 'all 0.3s ease'
        }}
      >
        Test Button 1
      </button>

      <div 
        onClick={() => alert('Div clicked!')}
        style={{
          padding: '1rem 2rem',
          backgroundColor: 'rgba(0, 0, 0, 0.03)',
          color: '#1D1D1F',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '16px',
          marginBottom: '1rem',
          display: 'block',
          width: 'fit-content',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease'
        }}
      >
        Test Div 2
      </div>

      <input 
        type="button" 
        value="Test Input Button 3"
        onClick={() => alert('Input button clicked!')}
        style={{
          padding: '1rem 2rem',
          backgroundColor: '#86868B',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          marginBottom: '1rem',
          display: 'block',
          transition: 'all 0.3s ease'
        }}
      />
    </div>
  )
}
