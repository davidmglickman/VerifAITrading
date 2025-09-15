import { NextRequest, NextResponse } from 'next/server'

// Popular stock symbols database for quick search
const STOCK_DATABASE = [
  // Tech Giants
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', exchange: 'NASDAQ' },
  { symbol: 'GOOG', name: 'Alphabet Inc. Class C', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
  
  // Galaxy/Crypto Related
  { symbol: 'GLXY', name: 'Galaxy Digital Holdings Ltd.', exchange: 'TSX' },
  { symbol: 'GLXY.TO', name: 'Galaxy Digital Holdings Ltd. (Toronto)', exchange: 'TSX' },
  { symbol: 'BRPHF', name: 'Galaxy Digital Holdings Ltd. (OTC)', exchange: 'OTC' },
  
  // Popular Trading Stocks
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', exchange: 'NYSE' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', exchange: 'NASDAQ' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', exchange: 'NYSE' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', exchange: 'NYSE' },
  
  // Meme/Popular Stocks
  { symbol: 'GME', name: 'GameStop Corp.', exchange: 'NYSE' },
  { symbol: 'AMC', name: 'AMC Entertainment Holdings Inc.', exchange: 'NYSE' },
  { symbol: 'BB', name: 'BlackBerry Limited', exchange: 'NYSE' },
  
  // Banks
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE' },
  { symbol: 'BAC', name: 'Bank of America Corporation', exchange: 'NYSE' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', exchange: 'NYSE' },
  
  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', exchange: 'NYSE' },
  { symbol: 'CVX', name: 'Chevron Corporation', exchange: 'NYSE' },
  
  // Healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE' },
  { symbol: 'PFE', name: 'Pfizer Inc.', exchange: 'NYSE' },
  
  // Other popular
  { symbol: 'BRK.A', name: 'Berkshire Hathaway Inc. Class A', exchange: 'NYSE' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc. Class B', exchange: 'NYSE' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE' },
  { symbol: 'MA', name: 'Mastercard Incorporated', exchange: 'NYSE' },
  { symbol: 'UNH', name: 'UnitedHealth Group Incorporated', exchange: 'NYSE' },
  { symbol: 'HD', name: 'The Home Depot Inc.', exchange: 'NYSE' },
  { symbol: 'PG', name: 'The Procter & Gamble Company', exchange: 'NYSE' },
  { symbol: 'DIS', name: 'The Walt Disney Company', exchange: 'NYSE' },
  { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ' },
  { symbol: 'CRM', name: 'Salesforce Inc.', exchange: 'NYSE' },
  { symbol: 'ORCL', name: 'Oracle Corporation', exchange: 'NYSE' },
  { symbol: 'ADBE', name: 'Adobe Inc.', exchange: 'NASDAQ' },
  { symbol: 'GRGG', name: 'Green Energy Solutions', exchange: 'OTC' }, // Example stock
]

async function searchFinnhub(query: string) {
  try {
    const apiKey = process.env.FINNHUB_API_KEY
    if (!apiKey) {
      console.log('No Finnhub API key, using local database only')
      return []
    }

    const response = await fetch(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${apiKey}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.log('Finnhub search failed:', response.status)
      return []
    }

    const data = await response.json()
    
    if (data.result && Array.isArray(data.result)) {
      return data.result.slice(0, 10).map((item: any) => ({
        symbol: item.symbol,
        name: item.description || item.displaySymbol || item.symbol,
        exchange: item.type || 'Unknown',
        source: 'finnhub'
      }))
    }

    return []
  } catch (error) {
    console.error('Finnhub search error:', error)
    return []
  }
}

function searchLocalDatabase(query: string) {
  const normalizedQuery = query.toUpperCase().trim()
  
  if (normalizedQuery.length < 1) {
    return []
  }

  return STOCK_DATABASE.filter(stock => {
    const symbolMatch = stock.symbol.toUpperCase().includes(normalizedQuery)
    const nameMatch = stock.name.toUpperCase().includes(normalizedQuery)
    return symbolMatch || nameMatch
  }).slice(0, 10).map(stock => ({
    ...stock,
    source: 'local'
  }))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        results: [],
        message: 'Query must be at least 2 characters'
      })
    }

    // Search local database first (instant)
    const localResults = searchLocalDatabase(query)
    
    // If we have good local results, return them immediately
    if (localResults.length >= 3) {
      return NextResponse.json({
        results: localResults,
        source: 'local'
      })
    }

    // Otherwise, try Finnhub for more comprehensive search
    const finnhubResults = await searchFinnhub(query)
    
    // Combine results, prioritizing local matches
    const combinedResults = [...localResults]
    
    // Add Finnhub results that aren't already in local results
    finnhubResults.forEach((finnhubResult: any) => {
      const existsInLocal = localResults.some(localResult => 
        localResult.symbol.toUpperCase() === finnhubResult.symbol.toUpperCase()
      )
      
      if (!existsInLocal) {
        combinedResults.push(finnhubResult)
      }
    })

    return NextResponse.json({
      results: combinedResults.slice(0, 10),
      source: 'combined'
    })

  } catch (error) {
    console.error('Stock search error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to search stocks',
        results: [],
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}