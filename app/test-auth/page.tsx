'use client'

import { useState } from 'react'
import { signInWithGoogle } from '../../lib/database'

export default function TestAuth() {
  const [status, setStatus] = useState('')

  const testGoogleAuth = async () => {
    setStatus('Testing Google OAuth...')
    
    try {
      const result = await signInWithGoogle()
      
      if (result.error) {
        setStatus(`Error: ${result.error.message}`)
      } else {
        setStatus('OAuth initiated successfully! Check for redirect...')
      }
    } catch (error) {
      setStatus(`Unexpected error: ${error}`)
    }
  }

  const checkCurrentUrl = () => {
    setStatus(`Current URL: ${window.location.href}`)
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{marginBottom: '2rem', color: '#1D1D1F'}}>Auth Test Page</h1>
        
        <div style={{marginBottom: '1rem'}}>
          <button 
            onClick={checkCurrentUrl}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              marginRight: '1rem'
            }}
          >
            Check Current URL
          </button>
          
          <button 
            onClick={testGoogleAuth}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#34C759',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem'
            }}
          >
            Test Google OAuth
          </button>
        </div>
        
        {status && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '0.5rem',
            marginTop: '1rem',
            wordWrap: 'break-word'
          }}>
            <strong>Status:</strong> {status}
          </div>
        )}
        
        <div style={{marginTop: '2rem', fontSize: '0.875rem', color: '#666'}}>
          <p><strong>Environment Check:</strong></p>
          <p>Expected redirect: http://localhost:4000/auth/callback</p>
          <p>Current port: {typeof window !== 'undefined' ? window.location.port : 'Unknown'}</p>
        </div>
      </div>
    </div>
  )
}
