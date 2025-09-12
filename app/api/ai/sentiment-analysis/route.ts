import { NextRequest, NextResponse } from 'next/server'

interface NewsItem {
  title: string
  source: string
  publishedAt: string
  sentiment: 'positive' | 'negative' | 'neutral'
  score: number
  impact: 'high' | 'medium' | 'low'
  summary: string
}

// Mock news data generator
function generateMockNews(symbol: string): NewsItem[] {
  const sources = ['Reuters', 'Bloomberg', 'CNBC', 'MarketWatch', 'Yahoo Finance', 'The Wall Street Journal']
  const newsTemplates = {
    positive: [
      `${symbol} Reports Strong Q3 Earnings, Beats Estimates`,
      `${symbol} Announces Strategic Partnership with Major Tech Firm`,
      `${symbol} Stock Upgraded by Multiple Analysts`,
      `${symbol} Launches Innovative Product Line`,
      `${symbol} CEO Optimistic About Future Growth Prospects`
    ],
    negative: [
      `${symbol} Faces Regulatory Challenges in Key Markets`,
      `${symbol} Reports Lower Than Expected Revenue`,
      `${symbol} Analyst Concerns Over Rising Competition`,
      `${symbol} Supply Chain Issues Impact Production`,
      `${symbol} Stock Downgraded Due to Market Headwinds`
    ],
    neutral: [
      `${symbol} Scheduled to Report Earnings Next Week`,
      `${symbol} Announces Quarterly Dividend Payment`,
      `${symbol} Management to Speak at Industry Conference`,
      `${symbol} Files Regular SEC Documentation`,
      `${symbol} Extends Share Buyback Program`
    ]
  }

  const news: NewsItem[] = []
  const sentiments: ('positive' | 'negative' | 'neutral')[] = ['positive', 'negative', 'neutral']
  
  for (let i = 0; i < 8; i++) {
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)]
    const templates = newsTemplates[sentiment]
    const title = templates[Math.floor(Math.random() * templates.length)]
    const source = sources[Math.floor(Math.random() * sources.length)]
    
    let score = 0
    if (sentiment === 'positive') score = 20 + Math.random() * 60 // 20-80
    else if (sentiment === 'negative') score = -20 - Math.random() * 60 // -20 to -80
    else score = -10 + Math.random() * 20 // -10 to +10
    
    const impact = Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
    
    news.push({
      title,
      source,
      publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 * 7).toISOString(), // Last 7 days
      sentiment,
      score: Math.round(score),
      impact,
      summary: `This ${sentiment} news about ${symbol} could ${
        sentiment === 'positive' ? 'boost' : sentiment === 'negative' ? 'pressure' : 'maintain'
      } the stock price in the ${impact === 'high' ? 'short' : impact === 'medium' ? 'medium' : 'long'} term.`
    })
  }
  
  return news.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

function calculateSocialSentiment() {
  return {
    reddit: Math.round((Math.random() - 0.5) * 100), // -50 to +50
    twitter: Math.round((Math.random() - 0.5) * 100),
    stocktwits: Math.round((Math.random() - 0.5) * 100)
  }
}

function extractKeyTopics(symbol: string, news: NewsItem[]): string[] {
  const topicTemplates = [
    'Earnings', 'Revenue Growth', 'Market Expansion', 'Product Launch', 
    'Partnership', 'Regulation', 'Competition', 'Supply Chain',
    'Management Changes', 'Dividend', 'Stock Buyback', 'Acquisition'
  ]
  
  // Randomly select 3-5 topics
  const numTopics = 3 + Math.floor(Math.random() * 3)
  const shuffled = [...topicTemplates].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, numTopics)
}

function generateAISummary(symbol: string, overallSentiment: string, sentimentScore: number, news: NewsItem[]): string {
  const positiveNews = news.filter(n => n.sentiment === 'positive').length
  const negativeNews = news.filter(n => n.sentiment === 'negative').length
  const neutralNews = news.filter(n => n.sentiment === 'neutral').length
  
  if (overallSentiment === 'bullish') {
    return `Current sentiment for ${symbol} is predominantly positive with ${positiveNews} bullish articles outweighing ${negativeNews} bearish ones. The sentiment score of +${sentimentScore} suggests strong market optimism. Key drivers include positive earnings expectations and favorable analyst coverage. Social media sentiment aligns with traditional news sources, indicating broad-based confidence.`
  } else if (overallSentiment === 'bearish') {
    return `${symbol} faces headwinds with ${negativeNews} negative stories overshadowing ${positiveNews} positive developments. The sentiment score of ${sentimentScore} reflects growing market concerns. Regulatory challenges and competitive pressures appear to be weighing on investor sentiment. Social sentiment mirrors traditional media concerns, suggesting persistent negative momentum.`
  } else {
    return `${symbol} sentiment remains balanced with mixed signals from ${positiveNews} positive, ${negativeNews} negative, and ${neutralNews} neutral news items. The neutral sentiment score of ${sentimentScore} indicates market indecision. Investors appear to be waiting for clearer catalysts or earnings results. Social sentiment shows similar uncertainty, suggesting a wait-and-see approach.`
  }
}

export async function POST(request: NextRequest) {
  try {
    const { symbol } = await request.json()

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
    }

    // Generate mock news data
    const newsItems = generateMockNews(symbol)
    
    // Calculate overall sentiment score
    const totalScore = newsItems.reduce((sum, news) => sum + news.score, 0)
    const avgScore = Math.round(totalScore / newsItems.length)
    
    // Determine overall sentiment
    let overallSentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral'
    if (avgScore > 15) overallSentiment = 'bullish'
    else if (avgScore < -15) overallSentiment = 'bearish'
    
    // Generate social sentiment
    const socialSentiment = calculateSocialSentiment()
    
    // Extract key topics
    const keyTopics = extractKeyTopics(symbol, newsItems)
    
    // Generate AI summary
    const aiSummary = generateAISummary(symbol, overallSentiment, avgScore, newsItems)
    
    const analysis = {
      symbol,
      overallSentiment,
      sentimentScore: avgScore,
      newsItems,
      keyTopics,
      socialSentiment,
      aiSummary
    }

    return NextResponse.json(analysis)

  } catch (error) {
    console.error('Sentiment analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to perform sentiment analysis' },
      { status: 500 }
    )
  }
}
