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
        
        // First, handle the OAuth callback URL
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        console.log('Session check:', { sessionData, sessionError })
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setStatus('Authentication failed. Redirecting...')
          setTimeout(() => router.push('/auth/signin?error=session_failed'), 2000)
          return
        }

        if (sessionData?.session) {
          console.log('Valid session found:', sessionData.session.user?.email)
          setStatus('Authentication successful! Redirecting to dashboard...')
          
          // Wait a moment to ensure session is fully established
          setTimeout(() => {
            router.push('/dashboard')
          }, 1500)
        } else {
          console.log('No session found, checking URL hash')
          
          // Check if we have auth tokens in the URL hash (OAuth callback)
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')
          
          if (accessToken) {
            console.log('Found access token in URL, setting session')
            setStatus('Setting up your session...')
            
            const { data: authData, error: authError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            })
            
            if (authError) {
              console.error('Auth error:', authError)
              setStatus('Failed to establish session. Redirecting...')
              setTimeout(() => router.push('/auth/signin?error=token_failed'), 2000)
            } else {
              console.log('Session established successfully')
              setStatus('Success! Redirecting to dashboard...')
              setTimeout(() => router.push('/dashboard'), 1500)
            }
          } else {
            console.log('No auth tokens found')
            setStatus('No authentication data found. Redirecting...')
            setTimeout(() => router.push('/auth/signin?error=no_tokens'), 2000)
          }
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
