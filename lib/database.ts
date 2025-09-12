import { createClient } from '@supabase/supabase-js'

// Load env vars (may be undefined during initial setup)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const SUPABASE_CONFIGURED = Boolean(supabaseUrl && supabaseAnonKey)

// Provide a graceful fallback stub instead of throwing during module load so
// the app can render and show a helpful UI message.
const createStub = () => {
  const errorMsg = 'Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.'
  const authError = { data: null, error: { message: errorMsg } }
  return {
    auth: {
      signInWithPassword: async () => authError,
      signUp: async () => authError,
      signInWithOAuth: async () => authError,
      signOut: async () => ({ error: { message: errorMsg } }),
      getUser: async () => ({ data: { user: null }, user: null, error: { message: errorMsg } })
    },
    from: () => ({
      select: () => ({ eq: () => ({ data: [], error: { message: errorMsg } }), order: () => ({ data: [], error: { message: errorMsg } }) }),
      insert: () => ({ select: () => ({ data: [], error: { message: errorMsg } }) }),
      delete: () => ({ eq: () => ({ error: { message: errorMsg } }) })
    })
  } as any
}

export const supabase = SUPABASE_CONFIGURED
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : createStub()

if (!SUPABASE_CONFIGURED && process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.warn('[Startup] Supabase env vars missing. Using stub client. Fill them in .env.local to enable data features.')
}

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

export interface AIAnalysis {
  id: string
  symbol: string
  user_id?: string
  analysis_type: 'technical' | 'fundamental' | 'sentiment' | 'comprehensive'
  recommendation: 'buy' | 'sell' | 'hold'
  confidence_score: number
  key_points: string[]
  price_target?: number
  time_horizon: '1d' | '1w' | '1m' | '3m' | '6m' | '1y'
  created_at: string
}

// Authentication helpers
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signUpWithEmail = async (email: string, password: string, name?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || '',
      },
    },
  })
  return { data, error }
}

export const signInWithGoogle = async () => {
  try {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      return { data: null, error: { message: 'OAuth can only be initiated in the browser' } }
    }
    
    // FORCE local development redirects - override Supabase dashboard settings
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_MODE === 'true'
    const forceLocal = process.env.NEXT_PUBLIC_FORCE_LOCAL_REDIRECT === 'true'
    
    // Force localhost redirect if any development indicator is true
    const useLocalRedirect = isLocal || isDevelopment || forceLocal
    const baseUrl = useLocalRedirect
      ? `${window.location.origin}`
      : 'https://trade.verifaitrust.com'
    
    console.log('OAuth Debug (FORCED):', {
      isLocal,
      isDevelopment,
      forceLocal,
      useLocalRedirect,
      hostname: window.location.hostname,
      origin: window.location.origin,
      baseUrl,
      redirectTo: `${baseUrl}/auth/callback`
    })
    
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
      console.error('Google OAuth error:', error)
      return { data: null, error }
    }
    
    console.log('Google OAuth initiated successfully')
    return { data, error: null }
  } catch (error) {
    console.error('Google OAuth error:', error)
    return { data: null, error: { message: 'OAuth setup failed' } }
  }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Database helpers
export const getUserWatchlist = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_watchlist')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const addToWatchlist = async (userId: string, symbol: string, targetPrice?: number, stopLoss?: number, notes?: string) => {
  const { data, error } = await supabase
    .from('user_watchlist')
    .insert({
      user_id: userId,
      symbol,
      target_price: targetPrice,
      stop_loss: stopLoss,
      notes,
    })
    .select()
  
  return { data, error }
}

export const removeFromWatchlist = async (id: string) => {
  const { error } = await supabase
    .from('user_watchlist')
    .delete()
    .eq('id', id)
  
  return { error }
}

export const getUserAlerts = async (userId: string) => {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const createAlert = async (
  userId: string,
  symbol: string,
  alertType: Alert['alert_type'],
  targetValue?: number,
  message?: string
) => {
  const { data, error } = await supabase
    .from('alerts')
    .insert({
      user_id: userId,
      symbol,
      alert_type: alertType,
      target_value: targetValue,
      message: message || `Alert for ${symbol}`,
      is_triggered: false,
      is_email_sent: false,
    })
    .select()
  
  return { data, error }
}

export const getAIAnalysis = async (symbol: string, analysisType?: AIAnalysis['analysis_type']) => {
  let query = supabase
    .from('ai_analysis')
    .select('*')
    .eq('symbol', symbol)
    .order('created_at', { ascending: false })
  
  if (analysisType) {
    query = query.eq('analysis_type', analysisType)
  }
  
  const { data, error } = await query.limit(10)
  return { data, error }
}

export const saveAIAnalysis = async (analysis: Omit<AIAnalysis, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('ai_analysis')
    .insert(analysis)
    .select()
  
  return { data, error }
}
