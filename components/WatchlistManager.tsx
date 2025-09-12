'use client'

import { useState, useEffect } from 'react'
import { addToWatchlist, removeFromWatchlist, getUserWatchlist } from '../lib/supabase'
import { marketDataService } from '../lib/market-data'

interface WatchlistManagerProps {
  userId: string
  watchlist: Array<{ id: string; symbol: string; added_at: string }>
  onWatchlistUpdate: () => void
}

const WatchlistManager: React.FC<WatchlistManagerProps> = ({ 
  userId, 
  watchlist, 
  onWatchlistUpdate 
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPrices, setLoadingPrices] = useState(false)
  const [watchlistWithPrices, setWatchlistWithPrices] = useState<any[]>([])

  // Load prices for watchlist items
  useEffect(() => {
    if (watchlist.length > 0) {
      loadWatchlistPrices()
    }
  }, [watchlist])

  const loadWatchlistPrices = async () => {
    try {
      const symbols = watchlist.map(item => item.symbol)
      const quotes = await marketDataService.getMultipleQuotes(symbols)
      
      const watchlistWithPriceData = watchlist.map(item => {
        const quote = quotes.find(q => q.symbol === item.symbol)
        return {
          ...item,
          currentPrice: quote?.currentPrice || 0,
          change: quote?.change || 0,
          changePercent: quote?.changePercent || 0,
          volume: quote?.volume || 0
        }
      })
      
      setWatchlistWithPrices(watchlistWithPriceData)
    } catch (error) {
      console.error('Error loading watchlist prices:', error)
      setWatchlistWithPrices(watchlist.map(item => ({ ...item, currentPrice: 0, change: 0, changePercent: 0, volume: 0 })))
    }
  }

  const searchStocks = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      console.log('Searching for stocks:', query)
      const results = await marketDataService.searchSymbols(query)
      console.log('Search results:', results)
      setSearchResults(results.slice(0, 5)) // Limit to 5 results
    } catch (error) {
      console.error('Error searching stocks:', error)
      // Provide fallback search results for testing
      const mockResults = [
        { symbol: query.toUpperCase(), description: `${query.toUpperCase()} - Stock`, type: 'Common Stock' },
        { symbol: 'AAPL', description: 'Apple Inc', type: 'Common Stock' },
        { symbol: 'TSLA', description: 'Tesla Inc', type: 'Common Stock' },
        { symbol: 'GOOGL', description: 'Alphabet Inc', type: 'Common Stock' },
        { symbol: 'MSFT', description: 'Microsoft Corporation', type: 'Common Stock' }
      ].filter(item => item.symbol.includes(query.toUpperCase()))
      
      console.log('Using fallback results:', mockResults)
      setSearchResults(mockResults.slice(0, 5))
    } finally {
      setLoading(false)
    }
  }

  const addStock = async (symbol: string) => {
    try {
      console.log('Adding stock to watchlist:', { userId, symbol })
      
      // Check if stock is already in watchlist
      const isAlreadyAdded = watchlist.some(item => item.symbol === symbol)
      if (isAlreadyAdded) {
        alert(`${symbol} is already in your watchlist!`)
        return
      }
      
      const { data, error } = await addToWatchlist(userId, symbol)
      console.log('Add to watchlist result:', { data, error })
      
      if (error) {
        console.error('Database error:', error)
        alert(`Failed to add ${symbol} to watchlist: ${error.message}`)
        return
      }
      
      setSearchQuery('')
      setSearchResults([])
      onWatchlistUpdate()
      alert(`✅ ${symbol} added to your watchlist!`)
      console.log('Stock added successfully!')
    } catch (error) {
      console.error('Error adding stock to watchlist:', error)
      alert(`❌ Failed to add ${symbol} to watchlist. Please try again.`)
    }
  }

  const removeStock = async (watchlistId: string) => {
    try {
      await removeFromWatchlist(watchlistId)
      onWatchlistUpdate()
    } catch (error) {
      console.error('Error removing stock from watchlist:', error)
      alert('Failed to remove stock from watchlist')
    }
  }

  const refreshPrices = () => {
    setLoadingPrices(true)
    loadWatchlistPrices().finally(() => setLoadingPrices(false))
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      padding: '2rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: '600',
          color: '#1d1d1f',
          letterSpacing: '-0.022em'
        }}>
          👀 Your Watchlist
        </h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span style={{
            fontSize: '14px',
            color: '#8e8e93',
            fontWeight: '500'
          }}>
            {watchlist.length} {watchlist.length === 1 ? 'stock' : 'stocks'}
          </span>
        </div>
      </div>

      {/* Add Stock Section */}
      <div style={{
        backgroundColor: '#F2F2F7',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#1d1d1f',
          marginBottom: '1rem'
        }}>
          ➕ Add New Stock
        </h3>
        
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search for stocks (e.g., AAPL, TSLA, GOOGL)..."
            value={searchQuery}
            data-action="add-stock-input"
            onChange={(e) => {
              setSearchQuery(e.target.value)
              searchStocks(e.target.value)
            }}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: 'white',
              border: '1px solid #D1D1D6',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none'
            }}
          />
          
          {loading && (
            <div style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8e8e93'
            }}>
              Searching...
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #D1D1D6',
            borderRadius: '8px',
            marginTop: '0.5rem',
            overflow: 'hidden'
          }}>
            {searchResults.map((result, index) => (
              <div
                key={index}
                onClick={() => addStock(result.symbol)}
                style={{
                  padding: '0.75rem',
                  borderBottom: index < searchResults.length - 1 ? '1px solid #F2F2F7' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <div style={{ fontWeight: '600', color: '#1d1d1f' }}>
                  {result.symbol}
                </div>
                <div style={{ fontSize: '14px', color: '#8e8e93' }}>
                  {result.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Watchlist Items */}
      {watchlistWithPrices.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: '#8e8e93'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
          <h3 style={{ fontSize: '1.25rem', color: '#1d1d1f', marginBottom: '0.5rem' }}>
            Your watchlist is empty
          </h3>
          <p>Start by adding some stocks you want to track!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '1rem'
        }}>
          {watchlistWithPrices.map((stock) => (
            <div
              key={stock.id}
              style={{
                backgroundColor: '#F2F2F7',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '0.5rem'
                }}>
                  <h4 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1d1d1f'
                  }}>
                    {stock.symbol}
                  </h4>
                  <span style={{
                    fontSize: '12px',
                    color: '#8e8e93',
                    backgroundColor: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px'
                  }}>
                    Added {new Date(stock.added_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1d1d1f'
                  }}>
                    ${stock.currentPrice.toFixed(2)}
                  </div>
                  
                  {stock.change !== 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: stock.change >= 0 ? '#34C759' : '#FF3B30'
                    }}>
                      <span>
                        {stock.change >= 0 ? '▲' : '▼'} ${Math.abs(stock.change).toFixed(2)}
                      </span>
                      <span>
                        ({stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  )}
                  
                  {stock.volume > 0 && (
                    <div style={{
                      fontSize: '12px',
                      color: '#8e8e93',
                      backgroundColor: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px'
                    }}>
                      Vol: {(stock.volume / 1000000).toFixed(1)}M
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ marginLeft: '1rem' }}>
                <button
                  onClick={() => removeStock(stock.id)}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255, 59, 48, 0.1)',
                    border: '1px solid rgba(255, 59, 48, 0.2)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg style={{width: '1rem', height: '1rem', color: '#FF3B30'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      {watchlist.length > 0 && (
        <button
          onClick={refreshPrices}
          disabled={loadingPrices}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#F2F2F7',
            border: '1px solid #D1D1D6',
            borderRadius: '8px',
            color: '#1d1d1f',
            cursor: loadingPrices ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            marginTop: '1.5rem'
          }}
        >
          {loadingPrices ? '🔄 Refreshing...' : '🔄 Refresh Prices'}
        </button>
      )}
    </div>
  )
}

export default WatchlistManager
