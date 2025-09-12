'use client'

import { useState, useEffect } from 'react'
import { Alert, getUserAlerts, createAlert } from '../lib/supabase'

interface AlertsManagerProps {
  userId: string
}

interface AIAlertSuggestion {
  symbol: string
  type: 'price_target' | 'stop_loss' | 'volume_spike' | 'news'
  price: number
  reason: string
  confidence: number
  timeframe: string
}

export default function AlertsManager({ userId }: AlertsManagerProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<AIAlertSuggestion[]>([])
  const [showAISetup, setShowAISetup] = useState(false)
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null)
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    alertType: 'price_target' as Alert['alert_type'],
    targetPrice: '',
    message: ''
  })

  useEffect(() => {
    loadAlerts()
  }, [userId])

  const loadAlerts = async () => {
    try {
      const { data, error } = await getUserAlerts(userId)
      if (error) throw error
      setAlerts(data || [])
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAIAlerts = async () => {
    setAiLoading(true)
    try {
      // Call AI API to generate smart alert suggestions
      const response = await fetch('/api/ai/alert-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          existingAlerts: alerts.map(alert => ({
            symbol: alert.symbol,
            type: alert.alert_type,
            price: alert.target_value
          }))
        }),
      })

      const result = await response.json()
      if (result.success) {
        setAiSuggestions(result.suggestions)
        setShowAISetup(true)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error generating AI alerts:', error)
      alert('Failed to generate AI alert suggestions. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const createAlertFromSuggestion = async (suggestion: AIAlertSuggestion) => {
    try {
      const { data, error } = await createAlert(
        userId,
        suggestion.symbol,
        suggestion.type,
        suggestion.price,
        suggestion.reason
      )
      if (error) throw error
      
      await loadAlerts()
      
      // Remove suggestion after creating alert
      setAiSuggestions(prev => prev.filter(s => s !== suggestion))
      
      alert(`Alert created for ${suggestion.symbol} at $${suggestion.price}`)
    } catch (error) {
      console.error('Error creating alert:', error)
      alert('Failed to create alert. Please try again.')
    }
  }

  const handleCreateManualAlert = async () => {
    if (!newAlert.symbol || !newAlert.targetPrice) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const { data, error } = await createAlert(
        userId,
        newAlert.symbol.toUpperCase(),
        newAlert.alertType,
        parseFloat(newAlert.targetPrice),
        newAlert.message || `Price alert for ${newAlert.symbol}`
      )
      if (error) throw error
      
      await loadAlerts()
      setNewAlert({ symbol: '', alertType: 'price_target', targetPrice: '', message: '' })
      alert('Alert created successfully!')
    } catch (error) {
      console.error('Error creating alert:', error)
      alert('Failed to create alert. Please try again.')
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        color: '#86868B'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #007AFF',
            borderRadius: '50%',
            borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          Loading alerts...
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header with AI Setup Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#1D1D1F',
          margin: 0
        }}>
          🔔 Price Alerts
        </h2>
        <button
          onClick={generateAIAlerts}
          disabled={aiLoading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: aiLoading ? '#8e8e93' : '#34C759',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: aiLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {aiLoading ? '🤖 Analyzing...' : '🤖 AI Smart Setup'}
        </button>
      </div>

      {/* AI Suggestions Modal */}
      {showAISetup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto',
            margin: '1rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1D1D1F',
                margin: 0
              }}>
                🤖 AI Alert Suggestions
              </h3>
              <button
                onClick={() => setShowAISetup(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#86868B'
                }}
              >
                ×
              </button>
            </div>

            {aiSuggestions.length === 0 ? (
              <p style={{ color: '#86868B', textAlign: 'center', padding: '2rem' }}>
                No new alert suggestions at this time. Your current alerts cover the key levels!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} style={{
                    border: '1px solid #E5E5E7',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    backgroundColor: '#F8F9FA'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.75rem'
                    }}>
                      <div>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1D1D1F',
                          margin: '0 0 0.25rem 0'
                        }}>
                          {suggestion.symbol} - ${suggestion.price}
                        </h4>
                        <span style={{
                          fontSize: '12px',
                          backgroundColor: getTypeColor(suggestion.type),
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          textTransform: 'capitalize'
                        }}>
                          {suggestion.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#007AFF',
                        backgroundColor: '#007AFF20',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px'
                      }}>
                        {suggestion.confidence}% confidence
                      </div>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#1D1D1F',
                      margin: '0 0 1rem 0',
                      lineHeight: '1.4'
                    }}>
                      {suggestion.reason}
                    </p>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: '#86868B'
                      }}>
                        Timeframe: {suggestion.timeframe}
                      </span>
                      <button
                        onClick={() => createAlertFromSuggestion(suggestion)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#007AFF',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        Create Alert
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Alert Creation */}
      <div style={{
        backgroundColor: '#F8F9FA',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#1D1D1F',
          margin: '0 0 1rem 0'
        }}>
          Create Manual Alert
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <input
            type="text"
            placeholder="Symbol (e.g., AAPL)"
            value={newAlert.symbol}
            onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value }))}
            style={{
              padding: '0.75rem',
              border: '1px solid #E5E5E7',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <select
            value={newAlert.alertType}
            onChange={(e) => setNewAlert(prev => ({ ...prev, alertType: e.target.value as Alert['alert_type'] }))}
            style={{
              padding: '0.75rem',
              border: '1px solid #E5E5E7',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            <option value="price_target">Price Target</option>
            <option value="stop_loss">Stop Loss</option>
            <option value="volume_spike">Volume Spike</option>
            <option value="news">News Alert</option>
          </select>
          <input
            type="number"
            placeholder="Target Price"
            value={newAlert.targetPrice}
            onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: e.target.value }))}
            style={{
              padding: '0.75rem',
              border: '1px solid #E5E5E7',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
        <input
          type="text"
          placeholder="Custom message (optional)"
          value={newAlert.message}
          onChange={(e) => setNewAlert(prev => ({ ...prev, message: e.target.value }))}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #E5E5E7',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '1rem'
          }}
        />
        <button
          onClick={handleCreateManualAlert}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007AFF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Create Alert
        </button>
      </div>

      {/* Active Alerts List */}
      <div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1D1D1F',
          margin: '0 0 1rem 0'
        }}>
          Active Alerts ({alerts.length})
        </h3>

        {alerts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#86868B',
            backgroundColor: '#F8F9FA',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔔</div>
            <p style={{ margin: 0 }}>No alerts set up yet. Use AI Smart Setup or create manual alerts.</p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {alerts.map((alert) => (
              <div key={alert.id} style={{
                border: '1px solid #E5E5E7',
                borderRadius: '12px',
                padding: '1rem',
                backgroundColor: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.25rem'
                  }}>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1D1D1F'
                    }}>
                      {alert.symbol}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      backgroundColor: getTypeColor(alert.alert_type),
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      textTransform: 'capitalize'
                    }}>
                      {alert.alert_type.replace('_', ' ')}
                    </span>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#1D1D1F'
                    }}>
                      ${alert.target_value}
                    </span>
                  </div>
                  {alert.message && (
                    <p style={{
                      fontSize: '14px',
                      color: '#86868B',
                      margin: 0
                    }}>
                      {alert.message}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setEditingAlert(alert)}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#F8F9FA',
                      border: '1px solid #E5E5E7',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#FF3B30',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'price_above': '#34C759',
    'price_below': '#FF3B30',
    'breakout': '#007AFF',
    'support': '#FF9500',
    'resistance': '#AF52DE',
    'stop_loss': '#FF3B30',
    'profit_target': '#34C759'
  }
  return colors[type] || '#86868B'
}
