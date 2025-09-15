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
          content: "You are a professional swing trader. Provide VERY concise, actionable insights. Use bullet points. Keep total response under 200 words. Focus only on the most critical trading opportunities."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 400,
    })

    return completion.choices[0]?.message?.content || 'Unable to generate insights'
  } catch (error) {
    console.error('Error generating trading insights:', error)
    throw new Error('Failed to generate trading insights')
  }
}

export const generateEnhancedTradingInsight = async (
  symbols: string[],
  marketData: Record<string, any>,
  newsData: Record<string, any>,
  companyProfiles: Record<string, any>
): Promise<string> => {
  try {
    const hasRealData = Object.values(marketData).some(data => !data.note?.includes('Simulated') && !data.note?.includes('Fallback'))
    const dataCount = Object.keys(marketData).length
    
    const prompt = `As a professional swing trading advisor, analyze my current watchlist and provide personalized insights.

WATCHLIST: ${symbols.join(', ')}

${hasRealData ? 'REAL-TIME MARKET DATA:' : 'MARKET DATA (Limited/Simulated):'}
${JSON.stringify(marketData, null, 2)}

${Object.keys(newsData).length > 0 ? `RECENT NEWS:
${Object.entries(newsData).map(([symbol, news]) => 
  `${symbol}: ${JSON.stringify(news, null, 2)}`
).join('\n')}` : ''}

${Object.keys(companyProfiles).length > 0 ? `COMPANY PROFILES:
${JSON.stringify(companyProfiles, null, 2)}` : ''}

ANALYSIS REQUEST:
${dataCount === 0 ? `I have ${symbols.length} stocks in my watchlist but market data is currently unavailable. Please provide general swing trading guidance for these symbols based on their typical market behavior and current market conditions.` : 
  `I have market data for ${dataCount} of my ${symbols.length} watchlist stocks. Please provide actionable insights.`}

Please provide:
1. **Specific analysis for each stock** in my watchlist (even with limited data)
2. **Entry/exit opportunities** based on available information
3. **Risk assessment** for each position
4. **Portfolio correlation** insights
5. **Actionable recommendations** for the next 1-2 weeks

${!hasRealData ? 'Note: Since real-time data is limited, focus on general trading principles, sector trends, and risk management strategies for these symbols.' : ''}

Format as clear, bullet-pointed insights that I can act on immediately.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a swing trading analyst. Provide CONCISE, bullet-pointed insights. Maximum 300 words total. If market data is limited, focus on general trading principles and risk management. Always provide actionable guidance even with incomplete data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 600,
    })

    return completion.choices[0]?.message?.content || 'Unable to generate enhanced insights'
  } catch (error) {
    console.error('Error generating enhanced trading insights:', error)
    throw new Error('Failed to generate enhanced trading insights')
  }
}

export const generateSwingTradingOpportunities = async (
  currentWatchlist: string[],
  preferences: any
): Promise<string> => {
  try {
    const prompt = `As a swing trading specialist, help me discover NEW trading opportunities beyond my current watchlist.

CURRENT WATCHLIST: ${currentWatchlist.join(', ')}
PREFERENCES:
- Risk Tolerance: ${preferences.riskTolerance}
- Time Horizon: ${preferences.timeHorizon}
- Preferred Sectors: ${preferences.sectors.join(', ')}
- Market Cap: ${preferences.marketCap}

Please identify 3-5 NEW swing trading opportunities that:
1. **Are NOT in my current watchlist**
2. **Show strong swing trading setups** (breakouts, reversals, momentum)
3. **Match my risk profile and preferences**
4. **Have clear entry/exit criteria**
5. **Include specific price targets and stop-losses**

For each recommendation, provide:
- Stock symbol and company name
- Current setup/pattern
- Entry point and reasoning
- Target price (2-4 week horizon)
- Stop-loss level
- Key catalysts to watch

Focus on actionable opportunities I can research and potentially add to my watchlist.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a swing trading scout. Provide VERY concise recommendations. Maximum 300 words. Use bullet points. Focus on 2-3 specific stocks with clear entry/exit prices only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 600,
    })

    return completion.choices[0]?.message?.content || 'Unable to generate swing trading opportunities'
  } catch (error) {
    console.error('Error generating swing trading opportunities:', error)
    throw new Error('Failed to generate swing trading opportunities')
  }
}
