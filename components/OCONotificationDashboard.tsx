'use client'

import { useState, useEffect } from 'react'
import { ocoNotificationService, OCONotification } from '../lib/oco-notifications'

interface OCONotificationDashboardProps {
  userId: string
}

export default function OCONotificationDashboard({ userId }: OCONotificationDashboardProps) {
  const [notifications, setNotifications] = useState<OCONotification[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    loadNotifications()
    
    // Check for triggered notifications every 30 seconds
    const interval = setInterval(checkForTriggers, 30000)
    return () => clearInterval(interval)
  }, [userId])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const activeNotifications = await ocoNotificationService.getActiveOCONotifications(userId)
      setNotifications(activeNotifications)
    } catch (error) {
      console.error('Error loading OCO notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkForTriggers = async () => {
    if (checking) return
    setChecking(true)
    
    try {
      const { triggered, alerts } = await ocoNotificationService.checkTriggeredNotifications(userId)
      
      if (alerts.length > 0) {
        // Show alerts to user
        alerts.forEach(alert => {
          // In a real app, this would be a toast notification or push notification
          console.log('🔔 OCO Alert:', alert)
        })
        
        // Refresh notifications list
        loadNotifications()
      }
    } catch (error) {
      console.error('Error checking triggered notifications:', error)
    } finally {
      setChecking(false)
    }
  }

  const cancelNotification = async (ocoId: string) => {
    try {
      await ocoNotificationService.cancelOCONotification(ocoId)
      loadNotifications() // Refresh list
    } catch (error) {
      console.error('Error cancelling notification:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#007AFF'
      case 'triggered': return '#FF9500'
      case 'completed': return '#34C759'
      case 'cancelled': return '#8E8E93'
      default: return '#8E8E93'
    }
  }

  const getSectorTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return '📈'
      case 'bearish': return '📉'
      default: return '➡️'
    }
  }

  if (loading) {
    return (
      <div style={{
        padding: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #E5E5E7',
        textAlign: 'center'
      }}>
        <div style={{ color: '#86868B', fontSize: '14px' }}>
          Loading OCO notifications...
        </div>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #E5E5E7',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid #E5E5E7',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1D1D1F',
            margin: '0 0 0.25rem 0'
          }}>
            🔔 Active OCO Notifications
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#86868B',
            margin: 0
          }}>
            Smart alerts for price targets, news, and related stocks
          </p>
        </div>
        <button
          onClick={checkForTriggers}
          disabled={checking}
          style={{
            padding: '8px 12px',
            backgroundColor: checking ? '#F2F2F7' : '#007AFF',
            color: checking ? '#8E8E93' : 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: checking ? 'not-allowed' : 'pointer'
          }}
        >
          {checking ? '⏳ Checking...' : '🔄 Check Now'}
        </button>
      </div>

      {/* Notifications List */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#86868B',
            fontSize: '14px'
          }}>
            No active OCO notifications. Click an OCO strategy to set up smart alerts.
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid #F2F2F7',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}
            >
              <div style={{ flex: 1 }}>
                {/* Symbol and Strategy */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#1D1D1F'
                  }}>
                    {notification.symbol}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'white',
                    backgroundColor: notification.strategy === 'conservative' ? '#34C759' : 
                                  notification.strategy === 'moderate' ? '#FF9500' : '#FF3B30',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {notification.strategy.toUpperCase()}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '500',
                    color: getStatusColor(notification.status),
                    backgroundColor: `${getStatusColor(notification.status)}20`,
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {notification.status.toUpperCase()}
                  </div>
                </div>

                {/* Price Targets */}
                <div style={{
                  fontSize: '12px',
                  color: '#6E6E73',
                  marginBottom: '0.5rem'
                }}>
                  📊 Entry: ${notification.entryPrice.toFixed(2)} | 
                  Stop: ${notification.stopLoss.toFixed(2)} | 
                  Target: ${notification.takeProfit.toFixed(2)}
                </div>

                {/* Monitoring Status */}
                <div style={{
                  fontSize: '11px',
                  color: '#8E8E93',
                  marginBottom: '0.5rem'
                }}>
                  🔔 Monitoring: {[
                    notification.notifications.priceTargets && 'Price Targets',
                    notification.notifications.newsCatalysts && 'News',
                    notification.notifications.relatedStocks && 'Related Stocks',
                    notification.notifications.volumeSpikes && 'Volume'
                  ].filter(Boolean).join(' • ')}
                </div>

                {/* Related Stocks and Sector Trend */}
                {notification.relatedSymbols.length > 0 && (
                  <div style={{
                    fontSize: '11px',
                    color: '#8E8E93',
                    marginBottom: '0.5rem'
                  }}>
                    {getSectorTrendIcon(notification.sectorTrend)} Related: {notification.relatedSymbols.slice(0, 3).join(', ')}
                  </div>
                )}

                {/* Created Date */}
                <div style={{
                  fontSize: '10px',
                  color: '#8E8E93'
                }}>
                  Created: {new Date(notification.createdAt).toLocaleDateString()} • 
                  ID: {notification.id.slice(-8)}
                </div>
              </div>

              {/* Cancel Button */}
              <button
                onClick={() => cancelNotification(notification.id)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'rgba(255, 59, 48, 0.1)',
                  border: '1px solid #FF3B30',
                  borderRadius: '6px',
                  color: '#FF3B30',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}