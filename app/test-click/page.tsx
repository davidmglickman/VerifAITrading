'use client'

export default function TestClick() {
  return (
    <div style={{ padding: '2rem', backgroundColor: '#000' }}>
      <h1 style={{ color: 'white', marginBottom: '2rem' }}>Click Test Page</h1>
      
      <button 
        onClick={() => alert('Basic button clicked!')}
        style={{
          padding: '1rem 2rem',
          backgroundColor: '#ff0000',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          marginBottom: '1rem',
          display: 'block'
        }}
      >
        Test Button 1
      </button>

      <div 
        onClick={() => alert('Div clicked!')}
        style={{
          padding: '1rem 2rem',
          backgroundColor: '#00ff00',
          color: 'black',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          marginBottom: '1rem',
          display: 'block',
          width: 'fit-content'
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
          backgroundColor: '#0000ff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          marginBottom: '1rem',
          display: 'block'
        }}
      />
    </div>
  )
}
