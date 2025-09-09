import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency values
 */
export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format percentage values
 */
export const formatPercentage = (value: number, includeSign: boolean = true): string => {
  const sign = includeSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

/**
 * Format large numbers (K, M, B)
 */
export const formatNumber = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

/**
 * Format volume numbers
 */
export const formatVolume = (volume: number): string => {
  return formatNumber(volume)
}

/**
 * Format market cap
 */
export const formatMarketCap = (marketCap: number): string => {
  return formatCurrency(marketCap).replace('$', '$') + 
    (marketCap >= 1000000000 ? 'B' : marketCap >= 1000000 ? 'M' : 'K')
}

/**
 * Format date and time
 */
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export const formatTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: string | Date): string => {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else {
    return formatDate(date)
  }
}

/**
 * Validate email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate stock symbol
 */
export const isValidStockSymbol = (symbol: string): boolean => {
  const symbolRegex = /^[A-Z]{1,5}$/
  return symbolRegex.test(symbol.toUpperCase())
}

/**
 * Generate random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) return 0
  return ((newValue - oldValue) / oldValue) * 100
}

/**
 * Calculate moving average
 */
export const calculateMovingAverage = (values: number[], period: number): number[] => {
  const result: number[] = []
  for (let i = period - 1; i < values.length; i++) {
    const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
    result.push(sum / period)
  }
  return result
}

/**
 * Get color for price change
 */
export const getPriceChangeColor = (change: number): string => {
  if (change > 0) return 'text-green-500'
  if (change < 0) return 'text-red-500'
  return 'text-gray-500'
}

/**
 * Get background color for price change
 */
export const getPriceChangeBgColor = (change: number): string => {
  if (change > 0) return 'bg-green-500/10 border-green-500/20'
  if (change < 0) return 'bg-red-500/10 border-red-500/20'
  return 'bg-gray-500/10 border-gray-500/20'
}

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Truncate text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Safe JSON parse
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

/**
 * Check if market is open (US market hours)
 */
export const isMarketOpen = (): boolean => {
  const now = new Date()
  const day = now.getDay() // 0 = Sunday, 6 = Saturday
  const hours = now.getHours()
  const minutes = now.getMinutes()
  
  // Weekend check
  if (day === 0 || day === 6) return false
  
  // Market hours: 9:30 AM - 4:00 PM EST
  const marketOpen = 9 * 60 + 30 // 9:30 AM in minutes
  const marketClose = 16 * 60 // 4:00 PM in minutes
  const currentTime = hours * 60 + minutes
  
  return currentTime >= marketOpen && currentTime < marketClose
}

/**
 * Get market status
 */
export const getMarketStatus = (): 'open' | 'closed' | 'pre-market' | 'after-hours' => {
  const now = new Date()
  const day = now.getDay()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const currentTime = hours * 60 + minutes
  
  // Weekend
  if (day === 0 || day === 6) return 'closed'
  
  const preMarketStart = 4 * 60 // 4:00 AM
  const marketOpen = 9 * 60 + 30 // 9:30 AM
  const marketClose = 16 * 60 // 4:00 PM
  const afterHoursEnd = 20 * 60 // 8:00 PM
  
  if (currentTime >= preMarketStart && currentTime < marketOpen) {
    return 'pre-market'
  } else if (currentTime >= marketOpen && currentTime < marketClose) {
    return 'open'
  } else if (currentTime >= marketClose && currentTime < afterHoursEnd) {
    return 'after-hours'
  } else {
    return 'closed'
  }
}

/**
 * Sleep function for async operations
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry function for API calls
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (attempt === maxAttempts) break
      await sleep(delay * attempt) // Exponential backoff
    }
  }
  
  throw lastError!
}

/**
 * Local storage helpers
 */
export const storage = {
  get: <T>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : fallback
    } catch {
      return fallback
    }
  },
  
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Silently fail
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Silently fail
    }
  },
  
  clear: (): void => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.clear()
    } catch {
      // Silently fail
    }
  }
}

/**
 * URL helpers
 */
export const url = {
  addParams: (baseUrl: string, params: Record<string, string | number>): string => {
    const url = new URL(baseUrl)
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value))
    })
    return url.toString()
  },
  
  removeParams: (baseUrl: string, paramsToRemove: string[]): string => {
    const url = new URL(baseUrl)
    paramsToRemove.forEach(param => {
      url.searchParams.delete(param)
    })
    return url.toString()
  }
}
