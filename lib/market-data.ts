import axios from 'axios'

const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || process.env.FINNHUB_API_KEY
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1'

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

export interface StockNews {
  category: string
  datetime: number
  headline: string
  id: number
  image: string
  related: string
  source: string
  summary: string
  url: string
}

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

class MarketDataService {
  private apiKey: string

  constructor() {
    this.apiKey = FINNHUB_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Finnhub API key not found. Market data features will be limited.')
    }
  }

  async getStockQuote(symbol: string): Promise<StockQuote> {
    try {
      const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
        params: {
          symbol: symbol.toUpperCase(),
          token: this.apiKey,
        },
      })

      const data = response.data
      return {
        symbol: symbol.toUpperCase(),
        currentPrice: data.c,
        change: data.d,
        changePercent: data.dp,
        high: data.h,
        low: data.l,
        open: data.o,
        previousClose: data.pc,
        volume: 0, // Finnhub doesn't provide volume in quote endpoint
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error)
      throw new Error(`Failed to fetch quote for ${symbol}`)
    }
  }

  async getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
    const quotes = await Promise.allSettled(
      symbols.map(symbol => this.getStockQuote(symbol))
    )

    return quotes
      .filter((result): result is PromiseFulfilledResult<StockQuote> => result.status === 'fulfilled')
      .map(result => result.value)
  }

  async getCompanyProfile(symbol: string): Promise<CompanyProfile> {
    try {
      const response = await axios.get(`${FINNHUB_BASE_URL}/stock/profile2`, {
        params: {
          symbol: symbol.toUpperCase(),
          token: this.apiKey,
        },
      })

      return response.data
    } catch (error) {
      console.error(`Error fetching company profile for ${symbol}:`, error)
      throw new Error(`Failed to fetch company profile for ${symbol}`)
    }
  }

  async getStockNews(symbol: string, fromDate?: string, toDate?: string): Promise<StockNews[]> {
    try {
      const today = new Date()
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      const from = fromDate || oneWeekAgo.toISOString().split('T')[0]
      const to = toDate || today.toISOString().split('T')[0]

      const response = await axios.get(`${FINNHUB_BASE_URL}/company-news`, {
        params: {
          symbol: symbol.toUpperCase(),
          from,
          to,
          token: this.apiKey,
        },
      })

      return response.data.slice(0, 10) // Limit to 10 most recent articles
    } catch (error) {
      console.error(`Error fetching news for ${symbol}:`, error)
      throw new Error(`Failed to fetch news for ${symbol}`)
    }
  }

  async getGeneralNews(category: string = 'general'): Promise<StockNews[]> {
    try {
      const response = await axios.get(`${FINNHUB_BASE_URL}/news`, {
        params: {
          category,
          token: this.apiKey,
        },
      })

      return response.data.slice(0, 20) // Limit to 20 articles
    } catch (error) {
      console.error('Error fetching general news:', error)
      throw new Error('Failed to fetch general news')
    }
  }

  async searchSymbols(query: string): Promise<Array<{ symbol: string; description: string; type: string }>> {
    try {
      const response = await axios.get(`${FINNHUB_BASE_URL}/search`, {
        params: {
          q: query,
          token: this.apiKey,
        },
      })

      return response.data.result || []
    } catch (error) {
      console.error('Error searching symbols:', error)
      throw new Error('Failed to search symbols')
    }
  }

  async getHistoricalData(
    symbol: string,
    resolution: 'D' | 'W' | 'M' = 'D',
    daysBack: number = 30
  ): Promise<{
    timestamps: number[]
    closes: number[]
    highs: number[]
    lows: number[]
    opens: number[]
    volumes: number[]
  }> {
    try {
      const endDate = Math.floor(Date.now() / 1000)
      const startDate = endDate - (daysBack * 24 * 60 * 60)

      const response = await axios.get(`${FINNHUB_BASE_URL}/stock/candle`, {
        params: {
          symbol: symbol.toUpperCase(),
          resolution,
          from: startDate,
          to: endDate,
          token: this.apiKey,
        },
      })

      const data = response.data
      if (data.s === 'no_data') {
        throw new Error('No historical data available')
      }

      return {
        timestamps: data.t,
        closes: data.c,
        highs: data.h,
        lows: data.l,
        opens: data.o,
        volumes: data.v,
      }
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error)
      throw new Error(`Failed to fetch historical data for ${symbol}`)
    }
  }

  // Alternative data sources for when Finnhub is not available
  async getQuoteFromYahoo(symbol: string): Promise<Partial<StockQuote>> {
    try {
      // This would typically use a Yahoo Finance API or web scraping
      // For now, return mock data
      console.warn('Using mock data - implement Yahoo Finance integration')
      return {
        symbol: symbol.toUpperCase(),
        currentPrice: 100 + Math.random() * 50,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 1000000),
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error('Error fetching Yahoo quote:', error)
      throw new Error('Failed to fetch quote from Yahoo Finance')
    }
  }

  // Market sentiment analysis
  async getMarketSentiment(symbol: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral'
    score: number
    buzz: number
  }> {
    try {
      const response = await axios.get(`${FINNHUB_BASE_URL}/news-sentiment`, {
        params: {
          symbol: symbol.toUpperCase(),
          token: this.apiKey,
        },
      })

      const data = response.data
      const sentiment = data.sentiment
      
      let sentimentLabel: 'positive' | 'negative' | 'neutral' = 'neutral'
      if (sentiment > 0.1) sentimentLabel = 'positive'
      else if (sentiment < -0.1) sentimentLabel = 'negative'

      return {
        sentiment: sentimentLabel,
        score: sentiment,
        buzz: data.buzz || 0,
      }
    } catch (error) {
      console.error(`Error fetching sentiment for ${symbol}:`, error)
      return {
        sentiment: 'neutral',
        score: 0,
        buzz: 0,
      }
    }
  }
}

export const marketDataService = new MarketDataService()

// Helper functions
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price)
}

export const formatPercentage = (percent: number): string => {
  const sign = percent >= 0 ? '+' : ''
  return `${sign}${percent.toFixed(2)}%`
}

export const formatVolume = (volume: number): string => {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`
  }
  return volume.toString()
}

export const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1000000000) {
    return `$${(marketCap / 1000000000).toFixed(1)}B`
  } else if (marketCap >= 1000000) {
    return `$${(marketCap / 1000000).toFixed(1)}M`
  }
  return `$${marketCap.toLocaleString()}`
}
