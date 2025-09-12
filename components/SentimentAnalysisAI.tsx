'use client'

import { useState, useEffect } from 'react'
import HoverButton from './HoverButton'

interface NewsItem {
  title: string
  source: string
  publishedAt: string
  sentiment: 'positive' | 'negative' | 'neutral'
  score: number
  impact: 'high' | 'medium' | 'low'
  summary: string
}

interface SentimentAnalysis {
  symbol: string
  overallSentiment: 'bullish' | 'bearish' | 'neutral'
  sentimentScore: number // -100 to +100
  newsItems: NewsItem[]
  keyTopics: string[]
  socialSentiment: {
    reddit: number
    twitter: number
    stocktwits: number
  }
  aiSummary: string
}

interface Props {
  symbol: string
  onSentimentUpdate?: (sentiment: SentimentAnalysis) => void
}

const SentimentAnalysisAI: React.FC<Props> = ({ symbol, onSentimentUpdate }) => {
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null)
  const [loading, setLoading] = useState(false)

  const analyzeSentiment = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/sentiment-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      })
      
      const data = await response.json()
      setSentiment(data)
      onSentimentUpdate?.(data)
    } catch (error) {
      console.error('Sentiment analysis error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
      case 'positive': return '#34C759'
      case 'bearish':
      case 'negative': return '#FF3B30'
      default: return '#8E8E93'
    }
  }

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
      case 'positive': return '📈'
      case 'bearish':
      case 'negative': return '📉'
      default: return '➡️'
    }
  }

  const getImpactEmoji = (impact: string) => {
    switch (impact) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  const formatTimeAgo = (publishedAt: string) => {
    const date = new Date(publishedAt)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid #E5E5EA',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1D1D1F', margin: 0 }}>
          📰 Sentiment Analysis - {symbol}
        </h3>
        <HoverButton
          onClick={analyzeSentiment}
          disabled={loading}
          variant="primary"
          style={{ padding: '0.5rem 1rem', fontSize: '14px' }}
        >
          {loading ? 'Analyzing...' : 'Analyze Sentiment'}
        </HoverButton>
      </div>

      {sentiment && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Overall Sentiment */}
          <div style={{
            padding: '1rem',
            backgroundColor: '#F8F9FA',
            borderRadius: '8px',
            border: `2px solid ${getSentimentColor(sentiment.overallSentiment)}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '24px' }}>{getSentimentEmoji(sentiment.overallSentiment)}</span>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: getSentimentColor(sentiment.overallSentiment) 
                  }}>
                    {sentiment.overallSentiment.toUpperCase()} SENTIMENT
                  </div>
                </div>
                <div style={{ fontSize: '14px', color: '#6E6E73', marginTop: '0.25rem' }}>
                  Based on {sentiment.newsItems.length} news articles and social signals
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: '600', color: getSentimentColor(sentiment.overallSentiment) }}>
                  {sentiment.sentimentScore > 0 ? '+' : ''}{sentiment.sentimentScore}
                </div>
                <div style={{ fontSize: '12px', color: '#6E6E73' }}>Score (-100 to +100)</div>
              </div>
            </div>
          </div>

          {/* Social Sentiment */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '0.5rem' }}>🔴</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1D1D1F' }}>
                {sentiment.socialSentiment.reddit > 0 ? '+' : ''}{sentiment.socialSentiment.reddit}
              </div>
              <div style={{ fontSize: '12px', color: '#6E6E73' }}>Reddit</div>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '0.5rem' }}>🐦</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1D1D1F' }}>
                {sentiment.socialSentiment.twitter > 0 ? '+' : ''}{sentiment.socialSentiment.twitter}
              </div>
              <div style={{ fontSize: '12px', color: '#6E6E73' }}>Twitter</div>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '0.5rem' }}>📈</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1D1D1F' }}>
                {sentiment.socialSentiment.stocktwits > 0 ? '+' : ''}{sentiment.socialSentiment.stocktwits}
              </div>
              <div style={{ fontSize: '12px', color: '#6E6E73' }}>StockTwits</div>
            </div>
          </div>

          {/* Key Topics */}
          <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F', margin: '0 0 0.5rem 0' }}>
              🏷️ Key Topics
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {sentiment.keyTopics.map((topic, index) => (
                <span
                  key={index}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D1D1D6',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#1D1D1F'
                  }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Recent News */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F', margin: '0 0 0.5rem 0' }}>
              📰 Recent News Impact
            </h4>
            <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {sentiment.newsItems.slice(0, 5).map((news, index) => (
                <div
                  key={index}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#FAFAFA',
                    borderRadius: '6px',
                    border: '1px solid #E5E5EA'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1D1D1F', flex: 1 }}>
                      {news.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: '0.5rem' }}>
                      <span>{getImpactEmoji(news.impact)}</span>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '600',
                        color: getSentimentColor(news.sentiment) 
                      }}>
                        {news.score > 0 ? '+' : ''}{news.score}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6E6E73', marginBottom: '0.25rem' }}>
                    {news.source} • {formatTimeAgo(news.publishedAt)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6E6E73' }}>
                    {news.summary}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1D1D1F', margin: '0 0 0.5rem 0' }}>
              🤖 AI Summary
            </h4>
            <p style={{ fontSize: '14px', color: '#6E6E73', margin: 0, lineHeight: '1.4' }}>
              {sentiment.aiSummary}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SentimentAnalysisAI
