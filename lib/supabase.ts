import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Default export for compatibility
export default supabase

// Types for our database tables
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Stock {
  id: string
  symbol: string
  name: string
  exchange: string
  current_price?: number
  change_percent?: number
  volume?: number
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

export interface NewsItem {
  id: string
  symbol?: string
  title: string
  summary: string
  url: string
  source: string
  published_at: string
  sentiment?: 'positive' | 'negative' | 'neutral'
  created_at: string
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
  // FORCE local development redirects - override Supabase dashboard settings
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  const forceLocal = process.env.NEXT_PUBLIC_FORCE_LOCAL_REDIRECT === 'true'
  
  // Determine redirect URL based on environment
  let baseUrl: string
  if (isLocal || isDevelopment || forceLocal) {
    baseUrl = window.location.origin
  } else {
    // Production environment - use the actual production URL
    baseUrl = window.location.origin // This will be the Vercel URL or custom domain
  }
  
  console.log('OAuth Debug (supabase.ts FORCED):', {
    isLocal,
    isDevelopment,
    forceLocal,
    hostname: window.location.hostname,
    origin: window.location.origin,
    baseUrl,
    redirectTo: `${baseUrl}/auth/callback`
  })
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
    },
  })
  return { data, error }
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
  console.log('removeFromWatchlist called with ID:', id)
  const { error } = await supabase
    .from('user_watchlist')
    .delete()
    .eq('id', id)

  console.log('removeFromWatchlist result:', { error })
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
