'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback started')
        setStatus('Verifying authentication...')
        
        // Handle the OAuth callback from the URL
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setStatus('Authentication failed. Redirecting...')
          setTimeout(() => router.push('/auth/signin?error=session_failed'), 2000)
          return
        }

        if (data?.session) {
          console.log('Valid session found:', data.session.user?.email)
          setStatus('Authentication successful! Redirecting to dashboard...')
          
          // Clear any existing timeouts and redirect immediately
          router.replace('/dashboard')
        } else {
          console.log('No session found, redirecting to sign in')
          setStatus('No active session. Redirecting to sign in...')
          setTimeout(() => router.push('/auth/signin'), 1500)
        }
      } catch (error) {
        console.error('Unexpected auth callback error:', error)
        setStatus('Unexpected error occurred. Redirecting...')
        setTimeout(() => router.push('/auth/signin?error=unexpected'), 2000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        maxWidth: '400px'
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTopColor: '#60a5fa',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <h1 style={{ marginBottom: '1rem' }}>Completing sign in...</h1>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.9rem',
          lineHeight: '1.4'
        }}>
          {status}
        </p>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
