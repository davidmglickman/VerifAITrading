import { NextRequest, NextResponse } from 'next/server'
import { generateTradingInsight } from '../../../../lib/openai'

export async function POST(request: NextRequest) {
  try {
    // For now, skip authentication to test the functionality
    // TODO: Implement proper server-side authentication
    console.log('AI Insights API called')

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'AI service is not configured. Please contact support.' 
      }, { status: 503 })
    }

    const body = await request.json()
    const { symbols, marketData } = body

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json({ 
        error: 'Missing required field: symbols (must be non-empty array)' 
      }, { status: 400 })
    }

    const insights = await generateTradingInsight(symbols, marketData || {})
    
    return NextResponse.json({ success: true, data: insights })
  } catch (error) {
    console.error('Error in AI insights API:', error)
    
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
      error: 'Failed to generate insights. Please try again later.' 
    }, { status: 500 })
  }
}
