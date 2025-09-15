'use client'

import { useState, useEffect, useRef } from 'react'

interface StockSearchResult {
  symbol: string
  name: string
  exchange: string
  source?: string
}

interface StockAutocompleteProps {
  onSelect: (symbol: string, result?: StockSearchResult) => void
  placeholder?: string
  initialValue?: string
  disabled?: boolean
  className?: string
}

export default function StockAutocomplete({
  onSelect,
  placeholder = "Enter stock symbol...",
  initialValue = "",
  disabled = false,
  className = ""
}: StockAutocompleteProps) {
  const [query, setQuery] = useState(initialValue)
  const [results, setResults] = useState<StockSearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [error, setError] = useState<string | null>(null)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced search function
  const searchStocks = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/market/search?q=${encodeURIComponent(searchQuery)}`)
      
      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
        setResults([])
      } else {
        setResults(data.results || [])
        setIsOpen(data.results?.length > 0)
      }
    } catch (err) {
      console.error('Stock search error:', err)
      setError('Search failed. Please try again.')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle input changes with debouncing
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchStocks(query)
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 300) // 300ms debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [query])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        // Allow direct symbol entry
        onSelect(query.trim().toUpperCase())
        setIsOpen(false)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          const selected = results[selectedIndex]
          onSelect(selected.symbol, selected)
          setQuery(selected.symbol)
          setIsOpen(false)
        } else if (query.trim()) {
          onSelect(query.trim().toUpperCase())
          setIsOpen(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Handle result selection
  const handleSelect = (result: StockSearchResult) => {
    onSelect(result.symbol, result)
    setQuery(result.symbol)
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%' }} className={className}>
      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setSelectedIndex(-1)
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (results.length > 0) {
            setIsOpen(true)
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '1px solid #E5E5E7',
          borderRadius: '8px',
          fontSize: '16px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          outline: 'none',
          transition: 'border-color 0.2s ease',
          backgroundColor: disabled ? '#F5F5F7' : 'white',
          ...{
            ':focus': {
              borderColor: '#007AFF',
              boxShadow: '0 0 0 3px rgba(0, 122, 255, 0.1)'
            }
          }
        }}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          right: '0.75rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '16px',
          height: '16px',
          border: '2px solid #E5E5E7',
          borderTop: '2px solid #007AFF',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      )}

      {/* Dropdown Results */}
      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #E5E5E7',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto',
            marginTop: '4px'
          }}
        >
          {error ? (
            <div style={{
              padding: '0.75rem',
              color: '#FF3B30',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          ) : results.length === 0 ? (
            <div style={{
              padding: '0.75rem',
              color: '#86868B',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {query.length >= 2 ? 'No results found' : 'Type at least 2 characters to search'}
            </div>
          ) : (
            results.map((result, index) => (
              <div
                key={`${result.symbol}-${result.exchange}`}
                onClick={() => handleSelect(result)}
                style={{
                  padding: '0.75rem',
                  cursor: 'pointer',
                  borderBottom: index < results.length - 1 ? '1px solid #F5F5F7' : 'none',
                  backgroundColor: selectedIndex === index ? '#F5F5F7' : 'white',
                  transition: 'background-color 0.1s ease'
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: '600',
                      color: '#1D1D1F',
                      fontSize: '16px',
                      marginBottom: '0.25rem'
                    }}>
                      {result.symbol}
                    </div>
                    <div style={{
                      color: '#86868B',
                      fontSize: '14px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {result.name}
                    </div>
                  </div>
                  <div style={{
                    color: '#86868B',
                    fontSize: '12px',
                    backgroundColor: '#F5F5F7',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap'
                  }}>
                    {result.exchange}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Add manual entry hint */}
          {query.trim().length >= 2 && (
            <div style={{
              padding: '0.5rem 0.75rem',
              borderTop: '1px solid #F5F5F7',
              backgroundColor: '#FAFAFA',
              fontSize: '12px',
              color: '#86868B',
              textAlign: 'center'
            }}>
              Press Enter to add "{query.toUpperCase()}" directly
            </div>
          )}
        </div>
      )}

      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}