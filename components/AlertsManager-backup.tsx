'use client'

import { useState, useEffect } from 'react'
import { Alert, getUserAlerts, createAlert } from '../lib/supabase'
import HoverButton from './HoverButton'

interface AlertsManagerProps {
  userId: string
}

export default function AlertsManager({ userId }: AlertsManagerProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="h-4 bg-white/20 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <h2 className="text-xl font-semibold text-white mb-6">Alerts Manager</h2>
      
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Active Alerts ({alerts.length})</h3>
        
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <p>No alerts configured yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border ${
                  alert.is_triggered
                    ? 'bg-green-500/20 border-green-500/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      alert.is_triggered ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <div>
                      <div className="font-medium text-white">
                        {alert.symbol} - {alert.alert_type.replace('_', ' ').toUpperCase()}
                      </div>
                      {alert.target_value && (
                        <div className="text-sm text-white/70">
                          Target: ${alert.target_value}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      alert.is_triggered ? 'text-green-300' : 'text-yellow-300'
                    }`}>
                      {alert.is_triggered ? 'Triggered' : 'Active'}
                    </div>
                    <div className="text-xs text-white/50">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {alert.message && (
                  <div className="mt-2 text-sm text-white/80">
                    {alert.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
