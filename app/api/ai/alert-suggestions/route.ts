import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { getUserWatchlist, getUserAlerts } from '../../../../lib/supabase'
import { marketDataService } from '../../../../lib/market-data'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface AIAlertSuggestion {
  symbol: string
  type: 'price_target' | 'stop_loss' | 'volume_spike' | 'news'
  price: number
  reason: string
  confidence: number
  timeframe: string
}

export async function POST(request: NextRequest) {
  try {
    const { userId, existingAlerts } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user's watchlist
    const { data: watchlist, error: watchlistError } = await getUserWatchlist(userId)
    if (watchlistError) {
      throw new Error(`Failed to get watchlist: ${watchlistError.message}`)
    }

    if (!watchlist || watchlist.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        message: 'Add stocks to your watchlist to get AI alert suggestions'
      })
    }

    // Get current market data for watchlist stocks
    const marketData: Record<string, any> = {}
    for (const item of watchlist) {
      try {
        const quote = await marketDataService.getStockQuote(item.symbol)
        if (quote) {
          marketData[item.symbol] = quote
        }
      } catch (error) {
        console.error(`Failed to get quote for ${item.symbol}:`, error)
      }
    }

    // Prepare context for AI
    const watchlistContext = watchlist.map(item => ({
      symbol: item.symbol,
      targetPrice: item.target_price,
      stopLoss: item.stop_loss,
      notes: item.notes,
      currentPrice: marketData[item.symbol]?.currentPrice,
      change: marketData[item.symbol]?.change,
      changePercent: marketData[item.symbol]?.changePercent,
      volume: marketData[item.symbol]?.volume
    }))

    const existingAlertsContext = existingAlerts.map((alert: any) => ({
      symbol: alert.symbol,
      type: alert.type,
      price: alert.price
    }))

    // Create AI prompt
    const prompt = `You are an expert swing trading assistant. Analyze the user's watchlist and suggest intelligent price alerts.

Current Watchlist:
${JSON.stringify(watchlistContext, null, 2)}

Existing Alerts:
${JSON.stringify(existingAlertsContext, null, 2)}

Rules:
1. Only suggest alerts for symbols in the watchlist
2. Don't duplicate existing alerts (avoid same symbol/type/price combinations)
3. Focus on swing trading opportunities (2-10 day holds)
4. Consider technical levels: support, resistance, breakouts
5. Factor in recent price action and volume
6. Provide clear, actionable reasons
7. Include confidence scores (60-95%)
8. Suggest 2-5 most valuable alerts

For each suggestion, provide:
- symbol: Stock symbol
- type: "price_target", "stop_loss", "volume_spike", or "news"
- price: Specific price level (round to 2 decimals)
- reason: Clear explanation (30-50 words)
- confidence: Number between 60-95
- timeframe: Expected timeframe like "1-3 days", "3-7 days", etc.

Respond with a JSON array of suggestions. If no good opportunities, return empty array.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert swing trading AI assistant. Respond only with valid JSON arrays of alert suggestions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    })

    const aiResponse = response.choices[0]?.message?.content
    if (!aiResponse) {
      throw new Error('No response from AI')
    }

    // Parse AI response
    let suggestions: AIAlertSuggestion[] = []
    try {
      suggestions = JSON.parse(aiResponse)
      
      // Validate suggestions format
      if (!Array.isArray(suggestions)) {
        throw new Error('AI response is not an array')
      }

      // Validate each suggestion
      suggestions = suggestions.filter(suggestion => {
        return (
          suggestion.symbol &&
          suggestion.type &&
          typeof suggestion.price === 'number' &&
          suggestion.reason &&
          typeof suggestion.confidence === 'number' &&
          suggestion.timeframe &&
          suggestion.confidence >= 60 &&
          suggestion.confidence <= 95
        )
      })

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('AI Response:', aiResponse)
      
      // Fallback: create basic suggestions based on technical analysis
      suggestions = createFallbackSuggestions(watchlistContext, existingAlertsContext)
    }

    return NextResponse.json({
      success: true,
      suggestions,
      message: suggestions.length > 0 ? `Generated ${suggestions.length} AI alert suggestions` : 'No new alert opportunities found'
    })

  } catch (error) {
    console.error('Error generating AI alert suggestions:', error)
    return NextResponse.json({ 
      error: 'Failed to generate alert suggestions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function createFallbackSuggestions(watchlistContext: any[], existingAlerts: any[]): AIAlertSuggestion[] {
  const suggestions: AIAlertSuggestion[] = []

  for (const item of watchlistContext.slice(0, 3)) { // Limit to first 3 stocks
    if (!item.currentPrice) continue

    const currentPrice = item.currentPrice
    const changePercent = item.changePercent || 0

    // Suggest resistance level if stock is trending up
    if (changePercent > 2) {
      const resistancePrice = Math.round((currentPrice * 1.05) * 100) / 100
      suggestions.push({
        symbol: item.symbol,
        type: 'price_target',
        price: resistancePrice,
        reason: `${item.symbol} is trending up (+${changePercent.toFixed(1)}%). Price target at resistance level.`,
        confidence: 75,
        timeframe: '2-5 days'
      })
    }

    // Suggest support level if stock is trending down
    if (changePercent < -2) {
      const supportPrice = Math.round((currentPrice * 0.95) * 100) / 100
      suggestions.push({
        symbol: item.symbol,
        type: 'stop_loss',
        price: supportPrice,
        reason: `${item.symbol} is declining (${changePercent.toFixed(1)}%). Consider stop loss at support level.`,
        confidence: 70,
        timeframe: '1-3 days'
      })
    }

    // Suggest breakout alert for consolidating stocks
    if (Math.abs(changePercent) < 1) {
      const breakoutPrice = Math.round((currentPrice * 1.03) * 100) / 100
      suggestions.push({
        symbol: item.symbol,
        type: 'price_target',
        price: breakoutPrice,
        reason: `${item.symbol} is consolidating. Price target above current range could signal upward momentum.`,
        confidence: 65,
        timeframe: '3-7 days'
      })
    }
  }

  return suggestions.slice(0, 4) // Return max 4 suggestions
}
