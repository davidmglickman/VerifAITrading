import { supabase } from './supabase'
import { marketDataService } from './market-data'

export interface OCONotification {
  id: string
  userId: string
  symbol: string
  strategy: 'conservative' | 'moderate' | 'aggressive'
  
  // Price Targets
  entryPrice: number
  stopLoss: number
  takeProfit: number
  
  // Current Status
  status: 'active' | 'triggered' | 'completed' | 'cancelled'
  triggeredAt?: string
  completedAt?: string
  
  // Notification Preferences
  notifications: {
    priceTargets: boolean
    newsCatalysts: boolean
    relatedStocks: boolean
    volumeSpikes: boolean
  }
  
  // Related Tracking
  relatedSymbols: string[]
  sectorTrend: 'bullish' | 'bearish' | 'neutral'
  
  // Metadata
  createdAt: string
  updatedAt: string
  confidence: number
  aiReasoning: string
}

export interface NotificationTrigger {
  id: string
  ocoId: string
  type: 'price_entry' | 'price_stop' | 'price_target' | 'news_catalyst' | 'related_stock' | 'volume_spike'
  symbol: string
  threshold: number
  condition: 'above' | 'below' | 'spike' | 'drop'
  isTriggered: boolean
  triggeredAt?: string
  message: string
}

class OCONotificationService {
  /**
   * Creates a comprehensive OCO notification setup with multiple trigger types
   */
  async createOCONotification(
    userId: string,
    symbol: string,
    strategy: 'conservative' | 'moderate' | 'aggressive',
    ocoData: {
      entry: number
      stop: number
      target: number
      confidence: number
      reasoning: string
    },
    notificationPrefs: {
      priceTargets?: boolean
      newsCatalysts?: boolean
      relatedStocks?: boolean
      volumeSpikes?: boolean
    } = {}
  ): Promise<{ notification: OCONotification; triggers: NotificationTrigger[] }> {
    
    // Get related stocks for tracking
    const relatedSymbols = await this.getRelatedStocks(symbol)
    
    // Determine sector trend
    const sectorTrend = await this.getSectorTrend(symbol, relatedSymbols)
    
    // Create OCO notification record
    const ocoNotification: OCONotification = {
      id: `oco_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      symbol: symbol.toUpperCase(),
      strategy,
      entryPrice: ocoData.entry,
      stopLoss: ocoData.stop,
      takeProfit: ocoData.target,
      status: 'active',
      notifications: {
        priceTargets: notificationPrefs.priceTargets !== false,
        newsCatalysts: notificationPrefs.newsCatalysts !== false,
        relatedStocks: notificationPrefs.relatedStocks !== false,
        volumeSpikes: notificationPrefs.volumeSpikes !== false
      },
      relatedSymbols,
      sectorTrend,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      confidence: ocoData.confidence,
      aiReasoning: ocoData.reasoning
    }
    
    // Create notification triggers
    const triggers: NotificationTrigger[] = []
    
    // Price target triggers
    if (ocoNotification.notifications.priceTargets) {
      triggers.push(
        {
          id: `trigger_entry_${Date.now()}`,
          ocoId: ocoNotification.id,
          type: 'price_entry',
          symbol,
          threshold: ocoData.entry,
          condition: strategy === 'conservative' ? 'above' : 'above', // Entry condition
          isTriggered: false,
          message: `${symbol} ${strategy.toUpperCase()} OCO: Entry target reached at $${ocoData.entry.toFixed(2)}`
        },
        {
          id: `trigger_stop_${Date.now() + 1}`,
          ocoId: ocoNotification.id,
          type: 'price_stop',
          symbol,
          threshold: ocoData.stop,
          condition: 'below',
          isTriggered: false,
          message: `${symbol} ${strategy.toUpperCase()} OCO: Stop loss triggered at $${ocoData.stop.toFixed(2)} - Consider exit`
        },
        {
          id: `trigger_target_${Date.now() + 2}`,
          ocoId: ocoNotification.id,
          type: 'price_target',
          symbol,
          threshold: ocoData.target,
          condition: 'above',
          isTriggered: false,
          message: `${symbol} ${strategy.toUpperCase()} OCO: Take profit target reached at $${ocoData.target.toFixed(2)} 🎯`
        }
      )
    }
    
    // Volume spike trigger
    if (ocoNotification.notifications.volumeSpikes) {
      triggers.push({
        id: `trigger_volume_${Date.now() + 3}`,
        ocoId: ocoNotification.id,
        type: 'volume_spike',
        symbol,
        threshold: 2.0, // 2x average volume
        condition: 'spike',
        isTriggered: false,
        message: `${symbol} volume spike detected - Check your ${strategy} OCO strategy`
      })
    }
    
    // Related stock triggers
    if (ocoNotification.notifications.relatedStocks) {
      relatedSymbols.slice(0, 3).forEach((relatedSymbol, index) => {
        triggers.push({
          id: `trigger_related_${Date.now() + 4 + index}`,
          ocoId: ocoNotification.id,
          type: 'related_stock',
          symbol: relatedSymbol,
          threshold: 5.0, // 5% move
          condition: 'spike',
          isTriggered: false,
          message: `Related stock ${relatedSymbol} moved significantly - Review ${symbol} ${strategy} OCO`
        })
      })
    }
    
    // Store in database (simulated for now)
    await this.storeOCONotification(ocoNotification, triggers)
    
    return { notification: ocoNotification, triggers }
  }
  
  /**
   * Gets stocks related to the target symbol (same sector/industry)
   */
  private async getRelatedStocks(symbol: string): Promise<string[]> {
    // Industry mapping for demo purposes
    const sectorMap: Record<string, string[]> = {
      'AAPL': ['MSFT', 'GOOGL', 'META', 'AMZN'],
      'MSFT': ['AAPL', 'GOOGL', 'META', 'CRM'],
      'GOOGL': ['AAPL', 'MSFT', 'META', 'AMZN'],
      'META': ['AAPL', 'GOOGL', 'SNAP', 'TWTR'],
      'TSLA': ['F', 'GM', 'NIO', 'RIVN'],
      'NVDA': ['AMD', 'INTC', 'TSM', 'QCOM'],
      'AMZN': ['AAPL', 'GOOGL', 'WMT', 'TGT'],
      'NFLX': ['DIS', 'PARA', 'WBD', 'SPOT']
    }
    
    return sectorMap[symbol.toUpperCase()] || []
  }
  
  /**
   * Determines overall sector trend based on related stocks
   */
  private async getSectorTrend(symbol: string, relatedSymbols: string[]): Promise<'bullish' | 'bearish' | 'neutral'> {
    try {
      if (relatedSymbols.length === 0) return 'neutral'
      
      const quotes = await Promise.allSettled(
        relatedSymbols.slice(0, 3).map(sym => marketDataService.getStockQuote(sym))
      )
      
      const validQuotes = quotes
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value)
      
      if (validQuotes.length === 0) return 'neutral'
      
      const avgChange = validQuotes.reduce((sum, quote) => sum + quote.changePercent, 0) / validQuotes.length
      
      if (avgChange > 1.5) return 'bullish'
      if (avgChange < -1.5) return 'bearish'
      return 'neutral'
      
    } catch (error) {
      console.error('Error determining sector trend:', error)
      return 'neutral'
    }
  }
  
  /**
   * Store OCO notification and triggers (would use Supabase in production)
   */
  private async storeOCONotification(notification: OCONotification, triggers: NotificationTrigger[]): Promise<void> {
    try {
      // Store notification
      const { error: notificationError } = await supabase
        .from('oco_notifications')
        .insert([{
          id: notification.id,
          user_id: notification.userId,
          symbol: notification.symbol,
          strategy: notification.strategy,
          entry_price: notification.entryPrice,
          stop_loss: notification.stopLoss,
          take_profit: notification.takeProfit,
          status: notification.status,
          notifications_config: notification.notifications,
          related_symbols: notification.relatedSymbols,
          sector_trend: notification.sectorTrend,
          confidence: notification.confidence,
          ai_reasoning: notification.aiReasoning,
          created_at: notification.createdAt,
          updated_at: notification.updatedAt
        }])
      
      if (notificationError) {
        console.log('Using demo storage for OCO notification (Supabase table not available)')
        // Store in localStorage for demo
        const stored = JSON.parse(localStorage.getItem('oco_notifications') || '[]')
        stored.push(notification)
        localStorage.setItem('oco_notifications', JSON.stringify(stored))
      }
      
      // Store triggers
      const { error: triggersError } = await supabase
        .from('oco_triggers')
        .insert(triggers.map(trigger => ({
          id: trigger.id,
          oco_id: trigger.ocoId,
          type: trigger.type,
          symbol: trigger.symbol,
          threshold: trigger.threshold,
          condition: trigger.condition,
          is_triggered: trigger.isTriggered,
          message: trigger.message
        })))
      
      if (triggersError) {
        console.log('Using demo storage for OCO triggers (Supabase table not available)')
        // Store in localStorage for demo
        const storedTriggers = JSON.parse(localStorage.getItem('oco_triggers') || '[]')
        storedTriggers.push(...triggers)
        localStorage.setItem('oco_triggers', JSON.stringify(storedTriggers))
      }
      
    } catch (error) {
      console.error('Error storing OCO notification:', error)
      // Fallback to localStorage
      const stored = JSON.parse(localStorage.getItem('oco_notifications') || '[]')
      stored.push(notification)
      localStorage.setItem('oco_notifications', JSON.stringify(stored))
      
      const storedTriggers = JSON.parse(localStorage.getItem('oco_triggers') || '[]')
      storedTriggers.push(...triggers)
      localStorage.setItem('oco_triggers', JSON.stringify(storedTriggers))
    }
  }
  
  /**
   * Get active OCO notifications for a user
   */
  async getActiveOCONotifications(userId: string): Promise<OCONotification[]> {
    try {
      const { data, error } = await supabase
        .from('oco_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      if (error) {
        // Fallback to localStorage
        const stored = JSON.parse(localStorage.getItem('oco_notifications') || '[]')
        return stored.filter((n: OCONotification) => n.userId === userId && n.status === 'active')
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching OCO notifications:', error)
      return []
    }
  }
  
  /**
   * Check for triggered notifications and send alerts
   */
  async checkTriggeredNotifications(userId: string): Promise<{ triggered: NotificationTrigger[]; alerts: string[] }> {
    try {
      const activeNotifications = await this.getActiveOCONotifications(userId)
      const triggeredAlerts: NotificationTrigger[] = []
      const alertMessages: string[] = []
      
      for (const notification of activeNotifications) {
        // Get current price
        try {
          const quote = await marketDataService.getStockQuote(notification.symbol)
          
          // Check price triggers
          const triggers = JSON.parse(localStorage.getItem('oco_triggers') || '[]')
            .filter((t: NotificationTrigger) => t.ocoId === notification.id && !t.isTriggered)
          
          for (const trigger of triggers) {
            let shouldTrigger = false
            
            if (trigger.type.startsWith('price_')) {
              if (trigger.condition === 'above' && quote.currentPrice >= trigger.threshold) {
                shouldTrigger = true
              } else if (trigger.condition === 'below' && quote.currentPrice <= trigger.threshold) {
                shouldTrigger = true
              }
            }
            
            if (shouldTrigger) {
              trigger.isTriggered = true
              trigger.triggeredAt = new Date().toISOString()
              triggeredAlerts.push(trigger)
              alertMessages.push(trigger.message)
              
              // Update trigger status
              const allTriggers = JSON.parse(localStorage.getItem('oco_triggers') || '[]')
              const updatedTriggers = allTriggers.map((t: NotificationTrigger) => 
                t.id === trigger.id ? trigger : t
              )
              localStorage.setItem('oco_triggers', JSON.stringify(updatedTriggers))
            }
          }
        } catch (error) {
          console.error(`Error checking triggers for ${notification.symbol}:`, error)
        }
      }
      
      return { triggered: triggeredAlerts, alerts: alertMessages }
    } catch (error) {
      console.error('Error checking triggered notifications:', error)
      return { triggered: [], alerts: [] }
    }
  }
  
  /**
   * Cancel an OCO notification
   */
  async cancelOCONotification(ocoId: string): Promise<void> {
    try {
      await supabase
        .from('oco_notifications')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', ocoId)
      
      // Update localStorage as fallback
      const stored = JSON.parse(localStorage.getItem('oco_notifications') || '[]')
      const updated = stored.map((n: OCONotification) => 
        n.id === ocoId ? { ...n, status: 'cancelled', updatedAt: new Date().toISOString() } : n
      )
      localStorage.setItem('oco_notifications', JSON.stringify(updated))
    } catch (error) {
      console.error('Error cancelling OCO notification:', error)
    }
  }
}

export const ocoNotificationService = new OCONotificationService()