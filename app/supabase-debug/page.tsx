'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function SupabaseDebug() {
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testSupabaseAuth = async () => {
    addLog('=== SUPABASE AUTH DEBUG ===')
    addLog(`Current URL: ${window.location.href}`)
    addLog(`Current origin: ${window.location.origin}`)
    addLog(`Current hostname: ${window.location.hostname}`)
    
    // Check environment variables
    addLog(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
    addLog(`NODE_ENV: ${process.env.NODE_ENV}`)
    addLog(`NEXT_PUBLIC_DEV_MODE: ${process.env.NEXT_PUBLIC_DEV_MODE}`)
    
    // Calculate what our redirect should be
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_MODE === 'true'
    const baseUrl = isDevelopment || window.location.hostname === 'localhost' 
      ? `${window.location.origin}`
      : 'https://trade.verifaitrust.com'
    
    addLog(`Calculated isDevelopment: ${isDevelopment}`)
    addLog(`Calculated baseUrl: ${baseUrl}`)
    addLog(`Expected redirectTo: ${baseUrl}/auth/callback`)
    
    try {
      addLog('Calling supabase.auth.signInWithOAuth...')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${baseUrl}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })
      
      if (error) {
        addLog(`❌ OAuth Error: ${error.message}`)
        addLog(`Error details: ${JSON.stringify(error, null, 2)}`)
      } else {
        addLog('✅ OAuth request initiated successfully!')
        addLog(`Data: ${JSON.stringify(data, null, 2)}`)
        addLog('🔄 Check browser for redirect...')
      }
    } catch (error: any) {
      addLog(`💥 Unexpected error: ${error.message}`)
      addLog(`Error stack: ${error.stack}`)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: '2rem',
        borderRadius: '1rem',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{marginBottom: '2rem'}}>🔍 Supabase OAuth Debug</h1>
        
        <div style={{marginBottom: '2rem'}}>
          <button 
            onClick={testSupabaseAuth}
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              marginRight: '1rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            🚀 Test Supabase OAuth
          </button>
          
          <button 
            onClick={clearLogs}
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            🗑️ Clear Logs
          </button>
        </div>

        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          maxHeight: '500px',
          overflowY: 'auto',
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '0.875rem',
          lineHeight: '1.4'
        }}>
          <h3 style={{marginBottom: '1rem', color: '#FFD700'}}>🔍 Debug Console:</h3>
          {logs.length === 0 ? (
            <p style={{color: '#888', fontStyle: 'italic'}}>
              No logs yet. Click "Test Supabase OAuth" to start debugging.
            </p>
          ) : (
            logs.map((log, index) => (
              <div 
                key={index} 
                style={{
                  marginBottom: '0.5rem', 
                  wordWrap: 'break-word',
                  padding: '0.25rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}
              >
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
          <h3 style={{color: '#FFD700'}}>🎯 What to Look For:</h3>
          <ul style={{marginLeft: '1rem', lineHeight: '1.6'}}>
            <li>Environment variables should show development mode</li>
            <li>baseUrl should be "http://localhost:4000"</li>
            <li>redirectTo should be "http://localhost:4000/auth/callback"</li>
            <li>If it redirects to live site, Supabase dashboard overrides our settings</li>
          </ul>
          
          <h3 style={{color: '#FFD700', marginTop: '1rem'}}>🔧 If Still Redirecting to Live Site:</h3>
          <ol style={{marginLeft: '1rem', lineHeight: '1.6'}}>
            <li><strong>Supabase Dashboard:</strong> Set Site URL to "http://localhost:4000"</li>
            <li><strong>Google Console:</strong> Add "http://localhost:4000/auth/callback" to redirect URIs</li>
            <li><strong>Check Auth Settings:</strong> Ensure no forced production redirects</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
