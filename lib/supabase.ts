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

// Helper function to make Supabase API calls
const supabaseRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: any,
  token?: string
) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'apikey': supabaseAnonKey,
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  
  if (!response.ok) {
    throw new Error(`Supabase error: ${response.statusText}`)
  }
  
  return response.json()
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
    const token = localStorage.getItem('supabase.auth.token')
    
    if (token) {
      await fetch(`${supabaseUrl}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': supabaseAnonKey,
        },
      })
      
      localStorage.removeItem('supabase.auth.token')
    }
    
    return { error: null }
  } catch (error) {
    return { error: { message: 'Network error' } }
  }
}

export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('supabase.auth.token')
    
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

// Database helpers using Supabase REST API
export const getUserWatchlist = async (userId: string) => {
  try {
    const data = await supabaseRequest(`user_watchlist?user_id=eq.${userId}&order=created_at.desc`)
    return { data, error: null }
  } catch (error) {
    return { data: null, error: { message: (error as Error).message } }
  }
}

export const addToWatchlist = async (userId: string, symbol: string, targetPrice?: number, stopLoss?: number, notes?: string) => {
  try {
    const data = await supabaseRequest('user_watchlist', 'POST', {
      user_id: userId,
      symbol,
      target_price: targetPrice,
      stop_loss: stopLoss,
      notes,
    })
    return { data: [data], error: null }
  } catch (error) {
    return { data: null, error: { message: (error as Error).message } }
  }
}

export const removeFromWatchlist = async (id: string) => {
  try {
    await supabaseRequest(`user_watchlist?id=eq.${id}`, 'DELETE')
    return { error: null }
  } catch (error) {
    return { error: { message: (error as Error).message } }
  }
}

export const getUserAlerts = async (userId: string) => {
  try {
    const data = await supabaseRequest(`alerts?user_id=eq.${userId}&order=created_at.desc`)
    return { data, error: null }
  } catch (error) {
    return { data: null, error: { message: (error as Error).message } }
  }
}

export const createAlert = async (
  userId: string,
  symbol: string,
  alertType: Alert['alert_type'],
  targetValue?: number,
  message?: string
) => {
  try {
    const data = await supabaseRequest('alerts', 'POST', {
      user_id: userId,
      symbol,
      alert_type: alertType,
      target_value: targetValue,
      message: message || `Alert for ${symbol}`,
      is_triggered: false,
      is_email_sent: false,
    })
    return { data: [data], error: null }
  } catch (error) {
    return { data: null, error: { message: (error as Error).message } }
  }
}

export const getAIAnalysis = async (symbol: string, analysisType?: AIAnalysis['analysis_type']) => {
  try {
    let endpoint = `ai_analysis?symbol=eq.${symbol}&order=created_at.desc&limit=10`
    
    if (analysisType) {
      endpoint += `&analysis_type=eq.${analysisType}`
    }
    
    const data = await supabaseRequest(endpoint)
    return { data, error: null }
  } catch (error) {
    return { data: null, error: { message: (error as Error).message } }
  }
}

export const saveAIAnalysis = async (analysis: Omit<AIAnalysis, 'id' | 'created_at'>) => {
  try {
    const data = await supabaseRequest('ai_analysis', 'POST', analysis)
    return { data: [data], error: null }
  } catch (error) {
    return { data: null, error: { message: (error as Error).message } }
  }
}

// Create a mock supabase object for compatibility
export const supabase = {
  auth: {
    signInWithPassword: signInWithEmail,
    signUp: signUpWithEmail,
    signInWithOAuth: signInWithGoogle,
    signOut,
    getUser: getCurrentUser,
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        data: [],
        error: null
      }),
      order: (column: string, options?: any) => ({
        data: [],
        error: null
      })
    }),
    insert: (data: any) => ({
      select: () => ({
        data: [data],
        error: null
      }),
      data: [data],
      error: null
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        data: [data],
        error: null
      })
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        data: null,
        error: null
      })
    })
  })
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
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
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
      triggered_at: new Date().toISOString()
    }
  ]
  return { data, error: null }
}

export const createAlert = async (
  userId: string,
  symbol: string,
  alertType: Alert['alert_type'],
  targetValue?: number,
  message?: string
) => {
  const data = [{
    id: Math.random().toString(),
    user_id: userId,
    symbol,
    alert_type: alertType,
    target_value: targetValue,
    current_value: undefined,
    message: message || `Alert for ${symbol}`,
    is_triggered: false,
    is_email_sent: false,
    created_at: new Date().toISOString(),
    triggered_at: undefined
  }]
  return { data, error: null }
}

export const getAIAnalysis = async (symbol: string, analysisType?: AIAnalysis['analysis_type']) => {
  // Mock AI analysis data
  const data = [
    {
      id: '1',
      symbol,
      user_id: '123',
      analysis_type: 'comprehensive' as const,
      recommendation: 'buy' as const,
      confidence_score: 0.85,
      key_points: ['Strong earnings growth', 'Positive market sentiment', 'Technical indicators bullish'],
      price_target: 200,
      time_horizon: '3m' as const,
      created_at: new Date().toISOString()
    }
  ]
  return { data, error: null }
}

export const saveAIAnalysis = async (analysis: Omit<AIAnalysis, 'id' | 'created_at'>) => {
  const data = [{
    ...analysis,
    id: Math.random().toString(),
    created_at: new Date().toISOString()
  }]
  return { data, error: null }
}
