'use client'

import { useState } from 'react'
import { signInWithGoogle } from '../../lib/database'

export default function AuthDebug() {
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const debugGoogleAuth = async () => {
    addLog('Starting Google OAuth debug...')
    addLog(`Current URL: ${window.location.href}`)
    addLog(`Current origin: ${window.location.origin}`)
    addLog(`Current hostname: ${window.location.hostname}`)
    
    // Check what baseUrl will be used
    const baseUrl = window.location.hostname === 'localhost' 
      ? `${window.location.origin}`
      : 'https://trade.verifaitrust.com'
    
    addLog(`Calculated baseUrl: ${baseUrl}`)
    addLog(`Expected redirectTo: ${baseUrl}/auth/callback`)
    
    try {
      const result = await signInWithGoogle()
      
      if (result.error) {
        addLog(`OAuth Error: ${result.error.message}`)
      } else {
        addLog('OAuth request sent successfully!')
        addLog('Check browser for redirect...')
      }
    } catch (error) {
      addLog(`Unexpected error: ${error}`)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: '2rem',
        borderRadius: '1rem',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{marginBottom: '2rem'}}>OAuth Debug Tool</h1>
        
        <div style={{marginBottom: '2rem'}}>
          <button 
            onClick={debugGoogleAuth}
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              marginRight: '1rem',
              cursor: 'pointer'
            }}
          >
            Debug Google OAuth
          </button>
          
          <button 
            onClick={clearLogs}
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Clear Logs
          </button>
        </div>

        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          padding: '1rem',
          borderRadius: '0.5rem',
          maxHeight: '400px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.875rem'
        }}>
          <h3 style={{marginBottom: '1rem'}}>Debug Logs:</h3>
          {logs.length === 0 ? (
            <p style={{color: '#888'}}>No logs yet. Click "Debug Google OAuth" to start.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{marginBottom: '0.5rem', wordWrap: 'break-word'}}>
                {log}
              </div>
            ))
          )}
        </div>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <h3>Expected Behavior:</h3>
          <p>1. Should redirect to Google OAuth with localhost:4000 callback</p>
          <p>2. After Google auth, should return to localhost:4000/auth/callback</p>
          <p>3. Callback should redirect to localhost:4000/dashboard</p>
          
          <h3 style={{marginTop: '1rem'}}>If redirecting to live site:</h3>
          <p>• Check Supabase dashboard Site URL setting</p>
          <p>• Check Google OAuth authorized redirect URIs</p>
          <p>• Verify environment variables loaded correctly</p>
        </div>
      </div>
    </div>
  )
}
