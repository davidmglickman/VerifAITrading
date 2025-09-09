'use client'

import { useState } from 'react'

export default function SignInTest() {
  const [clicked, setClicked] = useState(false)

  return (
    <div style={{ 
      padding: '2rem', 
      backgroundColor: '#000', 
      color: 'white', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <h1>Sign In Page Test</h1>
      <p>Debug: {clicked ? 'Button was clicked!' : 'Waiting for click...'}</p>
      
      <button 
        onClick={() => {
          setClicked(true);
          alert('Google button test works!');
        }}
        style={{
          padding: '1rem 2rem',
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        🔍 Test Google Sign In
      </button>
    </div>
  )
}
