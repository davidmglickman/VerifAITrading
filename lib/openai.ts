import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface StockAnalysisRequest {
  symbol: string
  currentPrice: number
  priceHistory?: number[]
  volume?: number
  marketCap?: number
  pe_ratio?: number
  eps?: number
  news?: Array<{
    title: string
    summary: string
    sentiment?: string
  }>
}

export interface StockAnalysisResponse {
  symbol: string
  recommendation: 'buy' | 'sell' | 'hold'
  confidence: number
  priceTarget?: number
  timeHorizon: string
  keyPoints: string[]
  riskFactors: string[]
  summary: string
}

export const analyzeStock = async (request: StockAnalysisRequest): Promise<StockAnalysisResponse> => {
  try {
    const prompt = buildAnalysisPrompt(request)
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional stock analyst with deep expertise in technical analysis, fundamental analysis, and market sentiment. 
          Provide clear, actionable investment advice based on the data provided. 
          Always include specific reasoning for your recommendations and acknowledge any limitations in the analysis.
          
          Respond in the following JSON format:
          {
            "recommendation": "buy" | "sell" | "hold",
            "confidence": 0-100,
            "priceTarget": number | null,
            "timeHorizon": "1-3 months" | "3-6 months" | "6-12 months",
            "keyPoints": ["point1", "point2", "point3"],
            "riskFactors": ["risk1", "risk2", "risk3"],
            "summary": "A 2-3 sentence executive summary"
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
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    const analysis = JSON.parse(responseText)
    
    return {
      symbol: request.symbol,
      recommendation: analysis.recommendation,
      confidence: analysis.confidence,
      priceTarget: analysis.priceTarget,
      timeHorizon: analysis.timeHorizon,
      keyPoints: analysis.keyPoints,
      riskFactors: analysis.riskFactors,
      summary: analysis.summary,
    }
  } catch (error) {
    console.error('Error analyzing stock:', error)
    throw new Error(`Failed to analyze ${request.symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

const buildAnalysisPrompt = (request: StockAnalysisRequest): string => {
  let prompt = `Analyze the stock ${request.symbol} with the following data:\n\n`
  
  prompt += `Current Price: $${request.currentPrice}\n`
  
  if (request.priceHistory && request.priceHistory.length > 0) {
    prompt += `Recent Price History (last ${request.priceHistory.length} periods): [${request.priceHistory.join(', ')}]\n`
  }
  
  if (request.volume) {
    prompt += `Current Volume: ${request.volume.toLocaleString()}\n`
  }
  
  if (request.marketCap) {
    prompt += `Market Cap: $${(request.marketCap / 1000000000).toFixed(2)}B\n`
  }
  
  if (request.pe_ratio) {
    prompt += `P/E Ratio: ${request.pe_ratio}\n`
  }
  
  if (request.eps) {
    prompt += `EPS: $${request.eps}\n`
  }
  
  if (request.news && request.news.length > 0) {
    prompt += `\nRecent News:\n`
    request.news.forEach((item, index) => {
      prompt += `${index + 1}. ${item.title}\n`
      prompt += `   Summary: ${item.summary}\n`
      if (item.sentiment) {
        prompt += `   Sentiment: ${item.sentiment}\n`
      }
      prompt += '\n'
    })
  }
  
  prompt += `\nPlease provide a comprehensive analysis considering technical indicators, fundamental metrics, market sentiment, and recent news. 
  Include specific price targets if appropriate and identify key risk factors that could affect the investment thesis.`
  
  return prompt
}

export const summarizeNews = async (newsItems: Array<{ title: string; content?: string }>): Promise<string> => {
  try {
    const newsText = newsItems.map(item => 
      `Title: ${item.title}\n${item.content ? `Content: ${item.content}\n` : ''}`
    ).join('\n---\n')

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a financial news analyst. Summarize the key market-moving information from the provided news articles. Focus on actionable insights and potential market impacts."
        },
        {
          role: "user",
          content: `Please summarize the following news articles and highlight the most important market implications:\n\n${newsText}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    })

    return completion.choices[0]?.message?.content || 'Unable to generate summary'
  } catch (error) {
    console.error('Error summarizing news:', error)
    throw new Error('Failed to summarize news')
  }
}

export const generateTradingInsight = async (
  symbols: string[],
  marketData: Record<string, any>
): Promise<string> => {
  try {
    const hasRealData = Object.values(marketData).some(data => !data.note?.includes('Simulated'))
    
    const prompt = `Based on the following stocks in the watchlist: ${symbols.join(', ')}, 
    provide 3-5 key trading insights for today. Focus on:
    1. General market trends and sector analysis
    2. Swing trading opportunities and patterns
    3. Risk management considerations
    4. Portfolio diversification insights
    5. Technical analysis concepts
    
    ${hasRealData ? 'Market Data:' : 'Note: Real market data unavailable, providing general insights for:'} 
    ${JSON.stringify(marketData, null, 2)}
    
    ${!hasRealData ? 'Please provide general trading insights for these symbols based on typical market behavior and trading principles.' : ''}
    
    Keep insights practical and actionable for swing traders.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional swing trader and market analyst. Provide concise, actionable trading insights. If real market data is unavailable, focus on general trading strategies, sector analysis, and risk management principles that would apply to the given stocks."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 800,
    })

    return completion.choices[0]?.message?.content || 'Unable to generate insights'
  } catch (error) {
    console.error('Error generating trading insights:', error)
    throw new Error('Failed to generate trading insights')
  }
}
