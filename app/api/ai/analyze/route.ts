import { NextRequest, NextResponse } from 'next/server'
import { analyzeStock } from '../../../../lib/openai'

export async function POST(request: NextRequest) {
  try {
    // For now, skip authentication to test the functionality
    // TODO: Implement proper server-side authentication
    console.log('AI Analyze API called')

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'AI service is not configured. Please contact support.' 
      }, { status: 503 })
    }

    const body = await request.json()
    const { symbol, currentPrice, priceHistory, volume, marketCap, pe_ratio, eps, news } = body

    if (!symbol || !currentPrice) {
      return NextResponse.json({ 
        error: 'Missing required fields: symbol and currentPrice' 
      }, { status: 400 })
    }

    const analysisRequest = {
      symbol,
      currentPrice,
      priceHistory,
      volume,
      marketCap,
      pe_ratio,
      eps,
      news
    }

    const analysis = await analyzeStock(analysisRequest)
    
    return NextResponse.json({ success: true, data: analysis })
  } catch (error) {
    console.error('Error in AI analyze API:', error)
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json({ 
          error: 'AI service configuration error. Please contact support.' 
        }, { status: 503 })
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json({ 
          error: 'AI service is temporarily busy. Please try again in a moment.' 
        }, { status: 429 })
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to analyze stock. Please try again later.' 
    }, { status: 500 })
  }
}
