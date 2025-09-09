'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/signin?error=auth_failed')
          return
        }

        if (data?.session) {
          console.log('OAuth success, redirecting to dashboard')
          router.push('/dashboard')
        } else {
          console.log('No session found, redirecting to signin')
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Unexpected auth callback error:', error)
        router.push('/auth/signin?error=unexpected')
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
        padding: '2rem'
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
        <h1 style={{ marginBottom: '0.5rem' }}>Completing sign in...</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          Please wait while we finish setting up your account.
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
