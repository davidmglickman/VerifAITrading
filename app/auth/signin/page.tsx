'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signInWithEmail, signInWithGoogle } from '../../../lib/database'

// SVG Icons as components
const TrendingUp = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
  </svg>
)

const Mail = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="22,6 12,13 2,6"/>
  </svg>
)

const Lock = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
  </svg>
)

const Eye = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
  </svg>
)

const EyeOff = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
  </svg>
)

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState('Page loaded - waiting for interaction')

  // Debug function for page clicks
  const handlePageClick = (e: React.MouseEvent) => {
    const target = e.target as Element
    setDebugInfo(`Click detected! Target: ${target.tagName} at (${e.clientX}, ${e.clientY})`)
    console.log('Page click:', target)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const { data, error } = await signInWithEmail(email, password)
      
      if (error) {
        console.error('Sign in error:', error.message)
        alert('Sign in failed: ' + error.message)
      } else {
        console.log('Sign in successful:', data)
        // Redirect to dashboard on success
        window.location.href = '/dashboard'
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    console.log('Google sign-in initiated')
    setDebugInfo('Google OAuth starting...')
    setIsLoading(true)
    
    try {
      console.log('Attempting Google OAuth...')
      const { data, error } = await signInWithGoogle()
      
      if (error) {
        console.error('Google sign in error:', error)
        setDebugInfo(`Google sign-in failed: ${error.message}`)
        setIsLoading(false)
      } else {
        console.log('Google OAuth redirect initiated')
        setDebugInfo('Redirecting to Google...')
        // Note: For OAuth, the redirect happens automatically
      }
    } catch (error) {
      console.error('Unexpected Google sign in error:', error)
      setDebugInfo(`Unexpected error: ${(error as any)?.message || 'Unknown error'}`)
      setIsLoading(false)
    }
  }

  return (
    <div 
      onClick={handlePageClick}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #1e40af 50%, #1e293b 75%, #0f172a 100%)',
      backgroundSize: '400% 400%'
    }}>
      <div style={{maxWidth: '28rem', width: '100%'}}>
        {/* Header */}
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            textDecoration: 'none'
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)'
            }}>
              <TrendingUp style={{width: '1.75rem', height: '1.75rem', color: 'white'}} />
            </div>
            <span style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#f8fafc'
            }}>
              VerifAI Trading
            </span>
          </Link>
          
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#f8fafc',
            marginBottom: '0.5rem'
          }}>
            Welcome Back
          </h1>
          <p style={{color: 'rgba(255, 255, 255, 0.6)'}}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Sign In Form */}
        <div style={{
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '1.5rem',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          padding: '2rem',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 60px rgba(59, 130, 246, 0.1)'
        }}>
          {/* Debug Info */}
          <div style={{
            padding: '0.5rem',
            backgroundColor: 'rgba(255, 255, 0, 0.1)',
            border: '1px solid rgba(255, 255, 0, 0.3)',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.8rem',
            color: '#ffff00'
          }}>
            Debug: {debugInfo}
          </div>
          
          <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '0.5rem'
              }}>
                Email Address
              </label>
              <div style={{position: 'relative'}}>
                <Mail style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '1.25rem',
                  height: '1.25rem',
                  color: 'rgba(255, 255, 255, 0.4)'
                }} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '2.75rem',
                    paddingRight: '1rem',
                    paddingTop: '0.75rem',
                    paddingBottom: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '0.5rem'
              }}>
                Password
              </label>
              <div style={{position: 'relative'}}>
                <Lock style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '1.25rem',
                  height: '1.25rem',
                  color: 'rgba(255, 255, 255, 0.4)'
                }} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '2.75rem',
                    paddingRight: '3rem',
                    paddingTop: '0.75rem',
                    paddingBottom: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(255, 255, 255, 0.4)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.3s ease'
                  }}
                >
                  {showPassword ? <EyeOff style={{width: '1.25rem', height: '1.25rem'}} /> : <Eye style={{width: '1.25rem', height: '1.25rem'}} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
              <Link 
                href="/auth/forgot-password"
                style={{
                  fontSize: '0.875rem',
                  color: '#60a5fa',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease'
                }}
              >
                Forgot your password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                color: 'white',
                fontWeight: '600',
                borderRadius: '0.75rem',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
                opacity: isLoading ? 0.5 : 1
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            margin: '1.5rem 0',
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{
              flex: 1,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}></div>
            <span style={{
              padding: '0 1rem',
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '0.875rem'
            }}>
              or
            </span>
            <div style={{
              flex: 1,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: isLoading ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: isLoading ? 'rgba(255, 255, 255, 0.5)' : 'white',
              fontWeight: '500',
              borderRadius: '0.75rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            <svg style={{width: '1.25rem', height: '1.25rem'}} viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Sign Up Link */}
          <div style={{
            marginTop: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{color: 'rgba(255, 255, 255, 0.6)'}}>
              Don't have an account?{' '}
              <Link 
                href="/auth/signup"
                style={{
                  color: '#60a5fa',
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease'
                }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
