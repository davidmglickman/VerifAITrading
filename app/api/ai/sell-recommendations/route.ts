import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'AI service is not configured. Please contact support.' 
      }, { status: 503 })
    }

    const body = await request.json()
    const { holdings } = body

    if (!holdings || !Array.isArray(holdings) || holdings.length === 0) {
      return NextResponse.json({ 
        error: 'Holdings array is required' 
      }, { status: 400 })
    }

    const prompt = buildSellRecommendationsPrompt(holdings)

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional portfolio manager specializing in exit strategies and profit-taking recommendations.
          
          Analyze the provided portfolio holdings and provide specific sell recommendations with clear reasoning.
          
          Respond in the following JSON format:
          {
            "recommendations": [
              {
                "symbol": "SYMBOL",
                "action": "SELL_ALL" | "SELL_PARTIAL" | "HOLD" | "ADD_STOP",
                "urgency": "HIGH" | "MEDIUM" | "LOW",
                "targetPrice": number | null,
                "stopLoss": number | null,
                "percentToSell": number (0-100),
                "reasoning": "Detailed explanation",
                "timeframe": "Immediate" | "1-2 weeks" | "1 month",
                "confidence": number (0-100)
              }
            ],
            "portfolioSummary": {
              "overallRisk": "HIGH" | "MEDIUM" | "LOW",
              "diversificationScore": number (0-100),
              "recommendedActions": ["action1", "action2"],
              "totalPortfolioValue": number,
              "unrealizedPnL": number
            }
          }`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from AI')
    }

    const sellData = JSON.parse(responseText)
    
    return NextResponse.json({ success: true, data: sellData })
  } catch (error) {
    console.error('Error in sell recommendations API:', error)
    
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
      error: 'Failed to generate sell recommendations. Please try again later.' 
    }, { status: 500 })
  }
}

function buildSellRecommendationsPrompt(holdings: any[]): string {
  const holdingsText = holdings.map(holding => {
    const unrealizedPnL = holding.currentPrice 
      ? (holding.currentPrice - holding.entryPrice) * holding.shares
      : 0
    const unrealizedPnLPercent = holding.currentPrice 
      ? ((holding.currentPrice - holding.entryPrice) / holding.entryPrice) * 100
      : 0
    
    return `${holding.symbol}: ${holding.shares} shares @ $${holding.entryPrice.toFixed(2)} entry${
      holding.currentPrice 
        ? `, current $${holding.currentPrice.toFixed(2)}, P&L: $${unrealizedPnL.toFixed(2)} (${unrealizedPnLPercent.toFixed(1)}%)`
        : ''
    }`
  }).join('\n')

  const totalPositions = holdings.length
  const totalValue = holdings.reduce((sum, h) => sum + (h.shares * (h.currentPrice || h.entryPrice)), 0)

  return `Analyze my current portfolio holdings and provide specific sell/exit recommendations:

CURRENT PORTFOLIO (${totalPositions} positions, ~$${totalValue.toFixed(0)} total value):
${holdingsText}

ANALYSIS REQUEST:
For each holding, please provide:

1. **Action Recommendation**: 
   - SELL_ALL: Complete exit recommended
   - SELL_PARTIAL: Take some profits, hold remainder
   - HOLD: Continue holding with current strategy
   - ADD_STOP: Add protective stop loss

2. **Specific Price Targets**: Where to exit (if selling)

3. **Risk Assessment**: Current risk level for each position

4. **Timing**: When to execute the recommendation

5. **Portfolio-Level Analysis**:
   - Overall diversification and risk concentration
   - Correlation between holdings
   - Recommended rebalancing actions

Consider:
- Current market conditions and sector trends
- Position sizing relative to portfolio
- Risk management and profit-taking opportunities
- Technical support/resistance levels
- Fundamental changes in company outlook
- Portfolio concentration and diversification

Provide actionable recommendations with specific price levels and clear reasoning for each decision.`
}