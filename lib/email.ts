import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    try {
      const config: EmailConfig = {
        host: process.env.SMTP_SERVER || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_EMAIL || '',
          pass: process.env.SMTP_PASSWORD || '',
        },
      }

      this.transporter = nodemailer.createTransport(config)
    } catch (error) {
      console.error('Failed to initialize email transporter:', error)
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not initialized')
      return false
    }

    try {
      const mailOptions = {
        from: `"VerifAI Trading" <${process.env.SMTP_EMAIL}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', result.messageId)
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  // Alert-specific email templates
  async sendPriceAlert(
    userEmail: string,
    symbol: string,
    currentPrice: number,
    targetPrice: number,
    alertType: 'above' | 'below'
  ): Promise<boolean> {
    const direction = alertType === 'above' ? 'risen above' : 'fallen below'
    const template = this.createPriceAlertTemplate(symbol, currentPrice, targetPrice, direction)
    
    return this.sendEmail(
      userEmail,
      template.subject,
      template.html,
      template.text
    )
  }

  async sendVolumeAlert(
    userEmail: string,
    symbol: string,
    currentVolume: number,
    averageVolume: number,
    percentIncrease: number
  ): Promise<boolean> {
    const template = this.createVolumeAlertTemplate(symbol, currentVolume, averageVolume, percentIncrease)
    
    return this.sendEmail(
      userEmail,
      template.subject,
      template.html,
      template.text
    )
  }

  async sendNewsAlert(
    userEmail: string,
    symbol: string,
    newsHeadline: string,
    newsSummary: string,
    sentiment: 'positive' | 'negative' | 'neutral'
  ): Promise<boolean> {
    const template = this.createNewsAlertTemplate(symbol, newsHeadline, newsSummary, sentiment)
    
    return this.sendEmail(
      userEmail,
      template.subject,
      template.html,
      template.text
    )
  }

  async sendWelcomeEmail(
    userEmail: string,
    userName: string
  ): Promise<boolean> {
    const template = this.createWelcomeTemplate(userName)
    
    return this.sendEmail(
      userEmail,
      template.subject,
      template.html,
      template.text
    )
  }

  async sendProfitTakingAlert(
    userEmail: string,
    positions: Array<{
      symbol: string
      profit_loss: number
      profit_loss_percent: number
      recommendation: string
      confidence: number
    }>,
    totalPnL: number
  ): Promise<boolean> {
    const template = this.createProfitTakingTemplate(positions, totalPnL)
    
    return this.sendEmail(
      userEmail,
      template.subject,
      template.html,
      template.text
    )
  }

  async sendDailyDigest(
    userEmail: string,
    userName: string,
    watchlistUpdates: Array<{
      symbol: string
      currentPrice: number
      change: number
      changePercent: number
    }>,
    alerts: Array<{
      symbol: string
      message: string
      triggeredAt: string
    }>
  ): Promise<boolean> {
    const template = this.createDailyDigestTemplate(userName, watchlistUpdates, alerts)
    
    return this.sendEmail(
      userEmail,
      template.subject,
      template.html,
      template.text
    )
  }

  // Email template generators
  private createPriceAlertTemplate(
    symbol: string,
    currentPrice: number,
    targetPrice: number,
    direction: string
  ): EmailTemplate {
    const priceColor = direction.includes('above') ? '#10B981' : '#EF4444'
    
    return {
      subject: `🚨 Price Alert: ${symbol} has ${direction} $${targetPrice}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Price Alert - VerifAI Trading</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">VerifAI Trading Alert</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Price Alert Triggered</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${priceColor};">
              <h3 style="margin: 0 0 10px 0; color: #333;">${symbol}</h3>
              <p style="margin: 5px 0; font-size: 18px;">
                <strong>Current Price:</strong> 
                <span style="color: ${priceColor}; font-weight: bold;">$${currentPrice.toFixed(2)}</span>
              </p>
              <p style="margin: 5px 0;">
                <strong>Target Price:</strong> $${targetPrice.toFixed(2)}
              </p>
              <p style="margin: 5px 0;">
                <strong>Status:</strong> Price has ${direction} your target
              </p>
            </div>
            
            <p style="color: #666; margin: 20px 0;">
              This alert was triggered automatically based on your watchlist settings. 
              Consider reviewing your position and risk management strategy.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL}/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; padding: 12px 24px; text-decoration: none; 
                        border-radius: 6px; display: inline-block; font-weight: bold;">
                View Dashboard
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>© 2024 VerifAI Trading. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        VerifAI Trading - Price Alert
        
        ${symbol} has ${direction} your target price of $${targetPrice.toFixed(2)}
        
        Current Price: $${currentPrice.toFixed(2)}
        Target Price: $${targetPrice.toFixed(2)}
        
        Visit your dashboard to review: ${process.env.APP_URL}/dashboard
        
        © 2024 VerifAI Trading
      `
    }
  }

  private createVolumeAlertTemplate(
    symbol: string,
    currentVolume: number,
    averageVolume: number,
    percentIncrease: number
  ): EmailTemplate {
    return {
      subject: `📈 Volume Alert: ${symbol} showing unusual activity`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Volume Alert - VerifAI Trading</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Volume Spike Alert</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Unusual Volume Detected</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
              <h3 style="margin: 0 0 10px 0; color: #333;">${symbol}</h3>
              <p style="margin: 5px 0;">
                <strong>Current Volume:</strong> ${currentVolume.toLocaleString()}
              </p>
              <p style="margin: 5px 0;">
                <strong>Average Volume:</strong> ${averageVolume.toLocaleString()}
              </p>
              <p style="margin: 5px 0;">
                <strong>Increase:</strong> 
                <span style="color: #F59E0B; font-weight: bold;">+${percentIncrease.toFixed(1)}%</span>
              </p>
            </div>
            
            <p style="color: #666; margin: 20px 0;">
              High volume can indicate significant price movement ahead. Consider monitoring this stock closely.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL}/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; padding: 12px 24px; text-decoration: none; 
                        border-radius: 6px; display: inline-block; font-weight: bold;">
                Analyze Now
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>© 2024 VerifAI Trading. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        VerifAI Trading - Volume Alert
        
        ${symbol} is showing unusual volume activity:
        
        Current Volume: ${currentVolume.toLocaleString()}
        Average Volume: ${averageVolume.toLocaleString()}
        Increase: +${percentIncrease.toFixed(1)}%
        
        Visit your dashboard: ${process.env.APP_URL}/dashboard
        
        © 2024 VerifAI Trading
      `
    }
  }

  private createNewsAlertTemplate(
    symbol: string,
    headline: string,
    summary: string,
    sentiment: string
  ): EmailTemplate {
    const sentimentColor = sentiment === 'positive' ? '#10B981' : sentiment === 'negative' ? '#EF4444' : '#6B7280'
    const sentimentEmoji = sentiment === 'positive' ? '📈' : sentiment === 'negative' ? '📉' : '📰'
    
    return {
      subject: `${sentimentEmoji} News Alert: ${symbol} - ${headline.substring(0, 50)}...`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>News Alert - VerifAI Trading</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">News Alert</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${sentimentColor};">
              <h3 style="margin: 0 0 10px 0; color: #333;">${symbol}</h3>
              <h4 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">${headline}</h4>
              <p style="margin: 10px 0; color: #666; line-height: 1.5;">${summary}</p>
              <p style="margin: 10px 0;">
                <strong>Sentiment:</strong> 
                <span style="color: ${sentimentColor}; font-weight: bold; text-transform: capitalize;">
                  ${sentiment} ${sentimentEmoji}
                </span>
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL}/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; padding: 12px 24px; text-decoration: none; 
                        border-radius: 6px; display: inline-block; font-weight: bold;">
                View Full Analysis
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>© 2024 VerifAI Trading. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        VerifAI Trading - News Alert
        
        ${symbol}: ${headline}
        
        ${summary}
        
        Sentiment: ${sentiment}
        
        Visit your dashboard: ${process.env.APP_URL}/dashboard
        
        © 2024 VerifAI Trading
      `
    }
  }

  private createWelcomeTemplate(userName: string): EmailTemplate {
    return {
      subject: 'Welcome to VerifAI Trading! 🚀',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to VerifAI Trading</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to VerifAI Trading!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">AI-Powered Stock Analysis Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${userName}! 👋</h2>
            
            <p style="margin: 20px 0; font-size: 16px;">
              Thank you for joining VerifAI Trading! You now have access to advanced AI-powered stock analysis, 
              real-time alerts, and comprehensive market insights.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; color: #333;">Get Started:</h3>
              <ul style="color: #666; padding-left: 20px;">
                <li style="margin: 8px 0;">Add stocks to your watchlist</li>
                <li style="margin: 8px 0;">Set up price and volume alerts</li>
                <li style="margin: 8px 0;">Explore AI-powered analysis</li>
                <li style="margin: 8px 0;">Review daily market insights</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL}/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
                Start Trading Smarter
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin: 25px 0;">
              Need help? Reply to this email or visit our support center.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>© 2024 VerifAI Trading. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to VerifAI Trading!
        
        Hello ${userName}!
        
        Thank you for joining VerifAI Trading! You now have access to advanced AI-powered 
        stock analysis, real-time alerts, and comprehensive market insights.
        
        Get Started:
        - Add stocks to your watchlist
        - Set up price and volume alerts
        - Explore AI-powered analysis
        - Review daily market insights
        
        Visit your dashboard: ${process.env.APP_URL}/dashboard
        
        Need help? Reply to this email or visit our support center.
        
        © 2024 VerifAI Trading
      `
    }
  }

  private createDailyDigestTemplate(
    userName: string,
    watchlistUpdates: Array<{
      symbol: string
      currentPrice: number
      change: number
      changePercent: number
    }>,
    alerts: Array<{
      symbol: string
      message: string
      triggeredAt: string
    }>
  ): EmailTemplate {
    const watchlistRows = watchlistUpdates.map(stock => {
      const changeColor = stock.change >= 0 ? '#10B981' : '#EF4444'
      const changeSign = stock.change >= 0 ? '+' : ''
      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 8px; font-weight: bold;">${stock.symbol}</td>
          <td style="padding: 12px 8px;">$${stock.currentPrice.toFixed(2)}</td>
          <td style="padding: 12px 8px; color: ${changeColor};">
            ${changeSign}$${stock.change.toFixed(2)} (${changeSign}${stock.changePercent.toFixed(2)}%)
          </td>
        </tr>
      `
    }).join('')

    const alertRows = alerts.map(alert => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 8px; font-weight: bold;">${alert.symbol}</td>
        <td style="padding: 12px 8px;">${alert.message}</td>
        <td style="padding: 12px 8px; color: #666; font-size: 12px;">
          ${new Date(alert.triggeredAt).toLocaleTimeString()}
        </td>
      </tr>
    `).join('')

    return {
      subject: `📊 Daily Market Digest - ${new Date().toLocaleDateString()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Daily Digest - VerifAI Trading</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Daily Market Digest</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${userName}! 👋</h2>
            
            ${watchlistUpdates.length > 0 ? `
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333;">Your Watchlist</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #f3f4f6;">
                      <th style="padding: 12px 8px; text-align: left;">Symbol</th>
                      <th style="padding: 12px 8px; text-align: left;">Price</th>
                      <th style="padding: 12px 8px; text-align: left;">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${watchlistRows}
                  </tbody>
                </table>
              </div>
            ` : ''}
            
            ${alerts.length > 0 ? `
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333;">Recent Alerts</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #f3f4f6;">
                      <th style="padding: 12px 8px; text-align: left;">Symbol</th>
                      <th style="padding: 12px 8px; text-align: left;">Alert</th>
                      <th style="padding: 12px 8px; text-align: left;">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${alertRows}
                  </tbody>
                </table>
              </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL}/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; padding: 12px 24px; text-decoration: none; 
                        border-radius: 6px; display: inline-block; font-weight: bold;">
                View Full Dashboard
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>© 2024 VerifAI Trading. All rights reserved.</p>
            <p>To unsubscribe from daily digests, <a href="${process.env.APP_URL}/settings" style="color: #667eea;">update your preferences</a></p>
          </div>
        </body>
        </html>
      `,
      text: `
        VerifAI Trading - Daily Market Digest
        ${new Date().toLocaleDateString()}
        
        Hello ${userName}!
        
        ${watchlistUpdates.length > 0 ? `
        Your Watchlist:
        ${watchlistUpdates.map(stock => 
          `${stock.symbol}: $${stock.currentPrice.toFixed(2)} (${stock.change >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)`
        ).join('\n')}
        ` : ''}
        
        ${alerts.length > 0 ? `
        Recent Alerts:
        ${alerts.map(alert => `${alert.symbol}: ${alert.message}`).join('\n')}
        ` : ''}
        
        View your dashboard: ${process.env.APP_URL}/dashboard
        
        © 2024 VerifAI Trading
      `
    }
  }

  private createProfitTakingTemplate(
    positions: Array<{
      symbol: string
      profit_loss: number
      profit_loss_percent: number
      recommendation: string
      confidence: number
    }>,
    totalPnL: number
  ): EmailTemplate {
    const positionsRows = positions.map(position => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 8px; font-weight: bold;">${position.symbol}</td>
        <td style="padding: 12px 8px; color: #10B981;">
          +$${position.profit_loss.toFixed(2)} (+${position.profit_loss_percent.toFixed(1)}%)
        </td>
        <td style="padding: 12px 8px;">${position.recommendation}</td>
        <td style="padding: 12px 8px; color: #666; font-size: 12px;">
          ${position.confidence}%
        </td>
      </tr>
    `).join('')

    return {
      subject: `💰 Profit-Taking Alert - ${positions.length} Opportunity${positions.length !== 1 ? 'ies' : ''}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Profit-Taking Alert - VerifAI Trading</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #34C759 0%, #32D74B 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">💰 Profit-Taking Alert</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">AI-Powered Trading Recommendations</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: linear-gradient(135deg, #E8F5E8 0%, #F0FFF0 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #34C759;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h3 style="margin: 0 0 8px 0; color: #333; font-size: 18px;">📊 Portfolio Performance</h3>
                  <div style="font-size: 14px; color: #666;">
                    ${positions.length} profitable position${positions.length !== 1 ? 's' : ''} ready for action
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 24px; font-weight: 600; color: #34C759;">
                    +$${totalPnL.toFixed(2)}
                  </div>
                  <div style="font-size: 16px; color: #34C759;">
                    Unrealized P&L
                  </div>
                </div>
              </div>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #333;">🎯 AI Recommendations</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 12px 8px; text-align: left;">Symbol</th>
                    <th style="padding: 12px 8px; text-align: left;">P&L</th>
                    <th style="padding: 12px 8px; text-align: left;">Action</th>
                    <th style="padding: 12px 8px; text-align: left;">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  ${positionsRows}
                </tbody>
              </table>
            </div>

            <div style="background: #FFF9E6; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFB800;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 20px;">🛡️</span>
                <strong style="color: #333; font-size: 14px;">Risk Management</strong>
              </div>
              <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.4;">
                Never let a profitable trade become a loss. Use trailing stops and partial profit-taking to protect your gains.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL}/dashboard" 
                 style="background: linear-gradient(135deg, #34C759 0%, #32D74B 100%); 
                        color: white; padding: 14px 28px; text-decoration: none; 
                        border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
                Execute Trades Now
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>© 2024 VerifAI Trading. All rights reserved.</p>
            <p>These are AI-generated recommendations. Always consider your risk tolerance before executing trades.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        VerifAI Trading - Profit-Taking Alert
        
        Portfolio Performance: +$${totalPnL.toFixed(2)} unrealized P&L
        
        AI Recommendations:
        ${positions.map(pos => 
          `${pos.symbol}: +$${pos.profit_loss.toFixed(2)} (+${pos.profit_loss_percent.toFixed(1)}%) - ${pos.recommendation} (${pos.confidence}% confidence)`
        ).join('\n')}
        
        Risk Management: Never let a profitable trade become a loss. Use trailing stops and partial profit-taking to protect your gains.
        
        Execute trades: ${process.env.APP_URL}/dashboard
        
        © 2024 VerifAI Trading
      `
    }
  }
}

export const emailService = new EmailService()
