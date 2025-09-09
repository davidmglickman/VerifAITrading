// User types
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// Stock-related types
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

export interface StockQuote {
  symbol: string
  currentPrice: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  previousClose: number
  volume: number
  marketCap?: number
  timestamp: number
}

export interface WatchlistItem {
  id: string
  user_id: string
  symbol: string
  target_price?: number
  stop_loss?: number
  notes?: string
  created_at: string
  updated_at: string
}

// Alert types
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

// News types
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

// AI Analysis types
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

// Company profile
export interface CompanyProfile {
  country: string
  currency: string
  exchange: string
  ipo: string
  marketCapitalization: number
  name: string
  phone: string
  shareOutstanding: number
  ticker: string
  weburl: string
  logo: string
  finnhubIndustry: string
}

// Market data types
export interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  marketCap?: number
  pe?: number
  eps?: number
}

// Chart data
export interface ChartData {
  timestamps: number[]
  prices: number[]
  volumes: number[]
  highs: number[]
  lows: number[]
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// Form types
export interface SignInFormData {
  email: string
  password: string
}

export interface SignUpFormData {
  email: string
  password: string
  confirmPassword: string
  name?: string
}

export interface AddStockFormData {
  symbol: string
  targetPrice?: number
  stopLoss?: number
  notes?: string
}

export interface AlertFormData {
  symbol: string
  alertType: Alert['alert_type']
  targetValue?: number
  message?: string
}

// UI Component types
export interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose: () => void
}

// Dashboard types
export interface DashboardData {
  watchlist: WatchlistItem[]
  alerts: Alert[]
  recentNews: NewsItem[]
  portfolioValue?: number
  totalGainLoss?: number
  totalGainLossPercent?: number
}

// Settings types
export interface UserSettings {
  emailNotifications: boolean
  priceAlerts: boolean
  newsAlerts: boolean
  volumeAlerts: boolean
  dailyDigest: boolean
  theme: 'light' | 'dark' | 'auto'
  timezone: string
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY'
}

// Search types
export interface SearchResult {
  symbol: string
  name: string
  type: string
  exchange: string
}

// Email types
export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
}

// Loading states
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

// Pagination
export interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Filter types
export interface StockFilter {
  exchange?: string
  sector?: string
  minPrice?: number
  maxPrice?: number
  minVolume?: number
  sortBy?: 'price' | 'volume' | 'change' | 'name'
  sortOrder?: 'asc' | 'desc'
}

export interface NewsFilter {
  symbol?: string
  source?: string
  sentiment?: 'positive' | 'negative' | 'neutral'
  dateFrom?: string
  dateTo?: string
}

// Webhook types
export interface WebhookData {
  type: string
  symbol: string
  data: any
  timestamp: number
}

// Analytics types
export interface AnalyticsEvent {
  event: string
  symbol?: string
  value?: number
  metadata?: Record<string, any>
  timestamp: number
}
