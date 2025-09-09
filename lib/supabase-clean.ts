// Real Supabase implementation using REST API
// This connects directly to your Supabase database without requiring the SDK

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Types for our database tables
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface UserWatchlist {
  id: string
  user_id: string
  symbol: string
  target_price?: number
  stop_loss?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface Alert {
  id: string
  user_id: string
  symbol: string
  alert_type: 'price_target' | 'stop_loss' | 'volume_spike' | 'news'
  target_value?: number
  current_value?: number
  message: string
  is_triggered: boolean
  is_email_sent: boolean
  created_at: string
  triggered_at?: string
}

// Authentication helpers using Supabase Auth REST API
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({ email, password }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return { data: null, error: data }
    }
    
    // Store token for future requests
    if (typeof window !== 'undefined') {
      localStorage.setItem('supabase.auth.token', data.access_token)
    }
    
    return { data: { user: data.user, session: data }, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Network error' } }
  }
}

export const signUpWithEmail = async (email: string, password: string, name?: string) => {
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({ 
        email, 
        password,
        data: { name: name || '' }
      }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return { data: null, error: data }
    }
    
    return { data: { user: data.user, session: data }, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Network error' } }
  }
}

export const signInWithGoogle = async () => {
  // For OAuth, redirect to Supabase auth endpoint
  const redirectUrl = `${window.location.origin}/dashboard`
  const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`
  
  if (typeof window !== 'undefined') {
    window.location.href = authUrl
  }
  
  return { data: null, error: null }
}

export const signOut = async () => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('supabase.auth.token') : null
    
    if (token) {
      await fetch(`${supabaseUrl}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': supabaseAnonKey,
        },
      })
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token')
      }
    }
    
    return { error: null }
  } catch (error) {
    return { error: { message: 'Network error' } }
  }
}

export const getCurrentUser = async () => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('supabase.auth.token') : null
    
    if (!token) {
      return { user: null, error: null }
    }
    
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseAnonKey,
      },
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return { user: null, error: data }
    }
    
    return { user: data, error: null }
  } catch (error) {
    return { user: null, error: { message: 'Network error' } }
  }
}

// Create a supabase-compatible object for existing code
export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string, password: string }) => {
      return await signInWithEmail(email, password)
    },
    signUp: async ({ email, password, options }: { email: string, password: string, options?: any }) => {
      return await signUpWithEmail(email, password, options?.data?.name)
    },
    signInWithOAuth: async ({ provider, options }: { provider: string, options?: any }) => {
      if (provider === 'google') {
        return await signInWithGoogle()
      }
      return { data: null, error: { message: 'Provider not supported' } }
    },
    signOut: async () => {
      return await signOut()
    },
    getUser: async () => {
      return await getCurrentUser()
    }
  }
}
