import { NextRequest, NextResponse } from 'next/server'

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_API_KEY
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1'

export async function GET(request: NextRequest) {
  try {
    if (!FINNHUB_API_KEY) {
      return NextResponse.json({ 
        error: 'Market data service not configured' 
      }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')

    if (!symbol) {
      return NextResponse.json({ 
        error: 'Symbol parameter is required' 
      }, { status: 400 })
    }

    console.log(`Fetching quote for ${symbol}`)
    
    const response = await fetch(`${FINNHUB_BASE_URL}/quote?symbol=${symbol.toUpperCase()}&token=${FINNHUB_API_KEY}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Finnhub response for ${symbol}:`, data)

    // Check if we got valid data
    if (data.c === 0 && data.d === 0 && data.dp === 0) {
      return NextResponse.json({ 
        error: `No data available for symbol ${symbol}` 
      }, { status: 404 })
    }

    const quote = {
      symbol: symbol.toUpperCase(),
      currentPrice: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      volume: 0,
      timestamp: Date.now(),
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Market data API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch market data' 
    }, { status: 500 })
  }
}