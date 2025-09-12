'use client'

import { useState, useEffect } from 'react'
import { marketDataService } from '../lib/market-data'

interface AITradingCoachProps {
  userWatchlist: Array<{ symbol: string }>
}

const AITradingCoach: React.FC<AITradingCoachProps> = ({ userWatchlist }) => {
  const [insights, setInsights] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [selectedStock, setSelectedStock] = useState<string>('')
  const [stockAnalysis, setStockAnalysis] = useState<any>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)

  useEffect(() => {
    if (userWatchlist.length > 0) {
      generateInsights()
    }
  }, [userWatchlist])

  const generateInsights = async () => {
    if (userWatchlist.length === 0) return
    
    setLoading(true)
    try {
      const symbols = userWatchlist.map(item => item.symbol)
      console.log('Generating insights for symbols:', symbols)
      
      // Try to get comprehensive market data for watchlist symbols
      let marketData: Record<string, any> = {}
      let newsData: Record<string, any> = {}
      let companyProfiles: Record<string, any> = {}
      
      try {
        // Get real-time quotes
        const quotes = await marketDataService.getMultipleQuotes(symbols.slice(0, 5))
        console.log('Market quotes received:', quotes)
        
        // Get company profiles and news for each stock
        for (const symbol of symbols.slice(0, 3)) { // Limit to avoid API rate limits
          try {
            const [profile, news] = await Promise.all([
              marketDataService.getCompanyProfile(symbol),
              marketDataService.getStockNews(symbol)
            ])
            companyProfiles[symbol] = profile
            newsData[symbol] = news.slice(0, 3) // Top 3 news items
          } catch (error) {
            console.warn(`Failed to get additional data for ${symbol}:`, error)
          }
        }
        
        marketData = quotes.reduce((acc, quote) => {
          acc[quote.symbol] = {
            price: quote.currentPrice,
            change: quote.change,
            changePercent: quote.changePercent,
            volume: quote.volume,
            high: quote.high,
            low: quote.low,
            open: quote.open,
            previousClose: quote.previousClose
          }
          return acc
        }, {} as Record<string, any>)
      } catch (marketError) {
        console.warn('Market data unavailable, using fallback data:', marketError)
        // Provide fallback market data so AI can still generate insights
        marketData = symbols.reduce((acc, symbol) => {
          acc[symbol] = {
            price: 50 + Math.random() * 100,
            change: (Math.random() - 0.5) * 10,
            changePercent: (Math.random() - 0.5) * 10,
            volume: Math.floor(Math.random() * 1000000),
            note: 'Simulated data - real market data unavailable'
          }
          return acc
        }, {} as Record<string, any>)
      }
      
      console.log('Final market data for AI:', marketData)
      console.log('News data:', newsData)
      console.log('Company profiles:', companyProfiles)
      
      // Call our enhanced AI insights API
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          symbols, 
          marketData,
          newsData,
          companyProfiles,
          analysisType: 'watchlist_insights' // Specific to current watchlist
        }),
      })
      
      const result = await response.json()
      console.log('AI insights response:', result)
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate insights')
      }
      
      setInsights(result.data)
    } catch (error) {
      console.error('Error generating insights:', error)
      if (error instanceof Error) {
        setInsights(`Unable to generate insights: ${error.message}`)
      } else {
        setInsights('Unable to generate insights at this time. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  const findSwingTradingOpportunities = async () => {
    setLoading(true)
    try {
      console.log('Finding new swing trading opportunities...')
      
      // Call our swing trading discovery API
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          analysisType: 'swing_trading_discovery',
          currentWatchlist: userWatchlist.map(item => item.symbol),
          preferences: {
            riskTolerance: 'moderate',
            timeHorizon: '2-4 weeks',
            sectors: ['technology', 'healthcare', 'finance'],
            marketCap: 'small_to_large'
          }
        }),
      })
      
      const result = await response.json()
      console.log('Swing trading opportunities response:', result)
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to find swing trading opportunities')
      }
      
      setInsights(result.data)
    } catch (error) {
      console.error('Error finding swing trading opportunities:', error)
      if (error instanceof Error) {
        setInsights(`Unable to find swing trading opportunities: ${error.message}`)
      } else {
        setInsights('Unable to find opportunities at this time. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  const analyzeSpecificStock = async (symbol: string) => {
    setAnalysisLoading(true)
    setSelectedStock(symbol)
    
    try {
      // Get current market data
      const quote = await marketDataService.getStockQuote(symbol)
      const news = await marketDataService.getStockNews(symbol)
      const profile = await marketDataService.getCompanyProfile(symbol)
      
      // Call our secure API route for analysis
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: symbol,
          currentPrice: quote.currentPrice,
          priceHistory: [quote.previousClose, quote.currentPrice],
          volume: quote.volume,
          marketCap: profile.marketCapitalization,
          news: news.slice(0, 3).map(item => ({
            title: item.headline,
            summary: item.summary
          }))
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze stock')
      }
      
      setStockAnalysis(result.data)
    } catch (error) {
      console.error('Error analyzing stock:', error)
      setStockAnalysis({
        error: error instanceof Error ? error.message : 'Unable to analyze this stock at the moment. Please try again later.'
      })
    } finally {
      setAnalysisLoading(false)
    }
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      padding: '2rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1d1d1f',
          letterSpacing: '-0.022em'
        }}>
          🤖 AI Trading Coach
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={generateInsights}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              background: loading ? '#8e8e93' : '#007AFF',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Analyzing...' : 'Analyze Watchlist'}
          </button>
          <button
            onClick={findSwingTradingOpportunities}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              background: loading ? '#8e8e93' : '#34C759',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Searching...' : 'Find New Stocks'}
          </button>
        </div>
      </div>

      {/* Daily Insights */}
      <div style={{
        backgroundColor: '#F2F2F7',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h4 style={{
          fontSize: '17px',
          fontWeight: '600',
          color: '#1d1d1f',
          marginBottom: '1rem'
        }}>
          📈 Today's Market Insights
        </h4>
        {loading ? (
          <div style={{ color: '#8e8e93', fontStyle: 'italic' }}>
            Analyzing your watchlist and market conditions...
          </div>
        ) : (
          <div style={{
            color: '#1d1d1f',
            fontSize: '15px',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap'
          }}>
            {insights || 'Add stocks to your watchlist to get personalized insights.'}
          </div>
        )}
      </div>

      {/* Stock Analysis Section */}
      <div>
        <h4 style={{
          fontSize: '17px',
          fontWeight: '600',
          color: '#1d1d1f',
          marginBottom: '1rem'
        }}>
          🔍 Analyze Your Stocks
        </h4>
        
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginBottom: '1rem'
        }}>
          {userWatchlist.slice(0, 6).map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => analyzeSpecificStock(stock.symbol)}
              disabled={analysisLoading}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: selectedStock === stock.symbol ? '#007AFF' : '#F2F2F7',
                color: selectedStock === stock.symbol ? 'white' : '#1d1d1f',
                border: '1px solid #D1D1D6',
                borderRadius: '8px',
                cursor: analysisLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              {stock.symbol}
            </button>
          ))}
        </div>

        {/* Analysis Results */}
        {analysisLoading && (
          <div style={{
            backgroundColor: '#F2F2F7',
            borderRadius: '12px',
            padding: '1.5rem',
            color: '#8e8e93',
            fontStyle: 'italic',
            textAlign: 'center'
          }}>
            Analyzing {selectedStock}... This may take a moment.
          </div>
        )}

        {stockAnalysis && !analysisLoading && (
          <div style={{
            backgroundColor: '#F2F2F7',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            {stockAnalysis.error ? (
              <div style={{ color: '#FF3B30', fontWeight: '500' }}>
                {stockAnalysis.error}
              </div>
            ) : (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h5 style={{
                    fontSize: '17px',
                    fontWeight: '600',
                    color: '#1d1d1f'
                  }}>
                    {stockAnalysis.symbol} Analysis
                  </h5>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: stockAnalysis.recommendation === 'buy' ? '#34C759' :
                                   stockAnalysis.recommendation === 'sell' ? '#FF3B30' : '#FF9500',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {stockAnalysis.recommendation}
                  </span>
                  <span style={{
                    color: '#8e8e93',
                    fontSize: '14px'
                  }}>
                    {stockAnalysis.confidence}% confidence
                  </span>
                </div>

                <p style={{
                  color: '#1d1d1f',
                  fontSize: '15px',
                  lineHeight: '1.5',
                  marginBottom: '1rem'
                }}>
                  {stockAnalysis.summary}
                </p>

                {stockAnalysis.priceTarget && (
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <strong>Price Target:</strong> ${stockAnalysis.priceTarget} 
                    <span style={{ color: '#8e8e93', fontSize: '14px', marginLeft: '0.5rem' }}>
                      ({stockAnalysis.timeHorizon})
                    </span>
                  </div>
                )}

                {stockAnalysis.keyPoints && stockAnalysis.keyPoints.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#1d1d1f', fontSize: '15px' }}>Key Points:</strong>
                    <ul style={{ 
                      marginTop: '0.5rem', 
                      paddingLeft: '1.25rem',
                      color: '#1d1d1f',
                      fontSize: '14px'
                    }}>
                      {stockAnalysis.keyPoints.map((point: string, index: number) => (
                        <li key={index} style={{ marginBottom: '0.25rem' }}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {stockAnalysis.riskFactors && stockAnalysis.riskFactors.length > 0 && (
                  <div>
                    <strong style={{ color: '#FF3B30', fontSize: '15px' }}>Risk Factors:</strong>
                    <ul style={{ 
                      marginTop: '0.5rem', 
                      paddingLeft: '1.25rem',
                      color: '#1d1d1f',
                      fontSize: '14px'
                    }}>
                      {stockAnalysis.riskFactors.map((risk: string, index: number) => (
                        <li key={index} style={{ marginBottom: '0.25rem' }}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AITradingCoach
