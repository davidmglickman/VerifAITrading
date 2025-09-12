import { NextRequest, NextResponse } from 'next/server'

interface PortfolioPosition {
  symbol: string
  shares: number
  avgCost: number
  currentPrice: number
  sector: string
  marketValue: number
  gainLoss: number
  gainLossPercent: number
}

interface RiskMetrics {
  portfolioValue: number
  totalGainLoss: number
  totalGainLossPercent: number
  beta: number
  sharpeRatio: number
  maxDrawdown: number
  volatility: number
  var95: number
  diversificationScore: number
  riskScore: number
}

interface SectorAllocation {
  sector: string
  allocation: number
  recommendedAllocation: number
  risk: 'low' | 'medium' | 'high'
}

interface RiskRecommendation {
  type: 'rebalance' | 'reduce' | 'add' | 'hedge'
  priority: 'high' | 'medium' | 'low'
  action: string
  reasoning: string
  impact: string
}

// Standard sector allocations for diversified portfolio
const SECTOR_TARGETS: Record<string, { allocation: number, risk: 'low' | 'medium' | 'high' }> = {
  'Technology': { allocation: 25, risk: 'high' },
  'Healthcare': { allocation: 15, risk: 'medium' },
  'Finance': { allocation: 15, risk: 'medium' },
  'Consumer': { allocation: 12, risk: 'medium' },
  'Energy': { allocation: 8, risk: 'high' },
  'Utilities': { allocation: 8, risk: 'low' },
  'Real Estate': { allocation: 7, risk: 'medium' },
  'Materials': { allocation: 5, risk: 'medium' },
  'Industrials': { allocation: 5, risk: 'medium' }
}

function calculateRiskMetrics(positions: PortfolioPosition[]): RiskMetrics {
  const portfolioValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0)
  const totalGainLoss = positions.reduce((sum, pos) => sum + pos.gainLoss, 0)
  const totalGainLossPercent = portfolioValue > 0 ? (totalGainLoss / (portfolioValue - totalGainLoss)) * 100 : 0
  
  // Calculate portfolio beta (weighted average of individual betas)
  // Mock beta calculation - in real implementation, would fetch actual betas
  const weightedBeta = positions.reduce((sum, pos) => {
    const weight = pos.marketValue / portfolioValue
    const mockBeta = 0.8 + Math.random() * 0.8 // Mock beta between 0.8-1.6
    return sum + (weight * mockBeta)
  }, 0)
  
  // Calculate volatility based on position concentration and sector diversity
  const concentration = Math.max(...positions.map(p => p.marketValue / portfolioValue))
  const baseVolatility = 0.15 + (concentration * 0.2) // 15-35% base volatility
  
  // Sharpe ratio calculation (mock)
  const riskFreeRate = 0.03 // 3% risk-free rate
  const expectedReturn = totalGainLossPercent / 100 // Annualized
  const sharpeRatio = baseVolatility > 0 ? (expectedReturn - riskFreeRate) / baseVolatility : 0
  
  // Max drawdown (mock calculation)
  const maxDrawdown = Math.random() * 0.25 // 0-25% max drawdown
  
  // Value at Risk (95% confidence, 1-day)
  const var95 = portfolioValue * baseVolatility * 1.645 / Math.sqrt(252) // Daily VaR
  
  // Diversification score based on number of positions and sector spread
  let diversificationScore = Math.min(positions.length, 10) // Up to 10 points for positions
  const uniqueSectors = [...new Set(positions.map(p => p.sector))].length
  diversificationScore += Math.min(uniqueSectors, 5) // Up to 5 points for sectors
  diversificationScore = Math.min(diversificationScore, 10) // Cap at 10
  
  // Overall risk score (1-10, where 10 is highest risk)
  let riskScore = 5 // Base score
  if (concentration > 0.4) riskScore += 2 // High concentration
  if (baseVolatility > 0.25) riskScore += 2 // High volatility
  if (diversificationScore < 5) riskScore += 1 // Poor diversification
  if (weightedBeta > 1.3) riskScore += 1 // High beta
  riskScore = Math.min(riskScore, 10)
  
  return {
    portfolioValue,
    totalGainLoss,
    totalGainLossPercent,
    beta: weightedBeta,
    sharpeRatio,
    maxDrawdown,
    volatility: baseVolatility,
    var95,
    diversificationScore,
    riskScore
  }
}

function calculateSectorAllocations(positions: PortfolioPosition[]): SectorAllocation[] {
  const portfolioValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0)
  
  // Group positions by sector
  const sectorTotals: Record<string, number> = {}
  positions.forEach(pos => {
    sectorTotals[pos.sector] = (sectorTotals[pos.sector] || 0) + pos.marketValue
  })
  
  // Calculate allocations
  const allocations: SectorAllocation[] = []
  
  // Add current sectors
  Object.entries(sectorTotals).forEach(([sector, value]) => {
    const allocation = (value / portfolioValue) * 100
    const target = SECTOR_TARGETS[sector] || { allocation: 10, risk: 'medium' }
    
    allocations.push({
      sector,
      allocation,
      recommendedAllocation: target.allocation,
      risk: target.risk
    })
  })
  
  // Add missing recommended sectors
  Object.entries(SECTOR_TARGETS).forEach(([sector, target]) => {
    if (!sectorTotals[sector]) {
      allocations.push({
        sector,
        allocation: 0,
        recommendedAllocation: target.allocation,
        risk: target.risk
      })
    }
  })
  
  return allocations.sort((a, b) => b.allocation - a.allocation)
}

function generateRecommendations(
  positions: PortfolioPosition[], 
  metrics: RiskMetrics, 
  sectorAllocations: SectorAllocation[]
): RiskRecommendation[] {
  const recommendations: RiskRecommendation[] = []
  
  // High concentration risk
  const maxPosition = Math.max(...positions.map(p => p.marketValue / metrics.portfolioValue))
  if (maxPosition > 0.3) {
    recommendations.push({
      type: 'reduce',
      priority: 'high',
      action: 'Reduce largest position concentration',
      reasoning: `Largest position represents ${(maxPosition * 100).toFixed(1)}% of portfolio, exceeding 30% threshold`,
      impact: 'Reduce portfolio volatility by 15-25%'
    })
  }
  
  // Sector imbalances
  sectorAllocations.forEach(sector => {
    const difference = Math.abs(sector.allocation - sector.recommendedAllocation)
    if (difference > 10 && sector.allocation > 0) {
      recommendations.push({
        type: 'rebalance',
        priority: difference > 20 ? 'high' : 'medium',
        action: `Rebalance ${sector.sector} allocation`,
        reasoning: `${sector.sector} allocation (${sector.allocation.toFixed(1)}%) differs significantly from target (${sector.recommendedAllocation}%)`,
        impact: 'Improve diversification and risk-adjusted returns'
      })
    }
  })
  
  // Low diversification
  if (metrics.diversificationScore < 5) {
    recommendations.push({
      type: 'add',
      priority: 'high',
      action: 'Increase portfolio diversification',
      reasoning: `Diversification score of ${metrics.diversificationScore}/10 indicates concentration risk`,
      impact: 'Reduce overall portfolio risk by 20-30%'
    })
  }
  
  // High volatility
  if (metrics.volatility > 0.25) {
    recommendations.push({
      type: 'hedge',
      priority: 'medium',
      action: 'Consider defensive positions',
      reasoning: `Portfolio volatility of ${(metrics.volatility * 100).toFixed(1)}% is above 25% threshold`,
      impact: 'Stabilize returns during market downturns'
    })
  }
  
  // High beta exposure
  if (metrics.beta > 1.4) {
    recommendations.push({
      type: 'add',
      priority: 'medium',
      action: 'Add low-beta defensive stocks',
      reasoning: `Portfolio beta of ${metrics.beta.toFixed(2)} indicates high market sensitivity`,
      impact: 'Reduce correlation with market volatility'
    })
  }
  
  return recommendations.slice(0, 4) // Limit to top 4 recommendations
}

function generateAIInsights(
  positions: PortfolioPosition[], 
  metrics: RiskMetrics, 
  recommendations: RiskRecommendation[]
): string[] {
  const insights: string[] = []
  
  // Portfolio performance insight
  if (metrics.totalGainLossPercent > 10) {
    insights.push(`Strong portfolio performance with ${metrics.totalGainLossPercent.toFixed(1)}% gains suggests effective stock selection`)
  } else if (metrics.totalGainLossPercent < -10) {
    insights.push(`Portfolio underperformance of ${metrics.totalGainLossPercent.toFixed(1)}% indicates need for strategy review`)
  } else {
    insights.push(`Portfolio returns of ${metrics.totalGainLossPercent.toFixed(1)}% are in line with market expectations`)
  }
  
  // Risk level insight
  if (metrics.riskScore <= 3) {
    insights.push('Conservative portfolio with low risk profile suitable for capital preservation')
  } else if (metrics.riskScore >= 7) {
    insights.push('Aggressive portfolio with high growth potential but elevated risk exposure')
  } else {
    insights.push('Balanced risk profile with moderate growth expectations and manageable volatility')
  }
  
  // Diversification insight
  if (metrics.diversificationScore >= 8) {
    insights.push('Excellent diversification across sectors and positions reduces unsystematic risk')
  } else if (metrics.diversificationScore <= 4) {
    insights.push('Limited diversification creates concentration risk - consider adding positions in underrepresented sectors')
  } else {
    insights.push('Moderate diversification provides some risk reduction but could be improved')
  }
  
  // Beta insight
  if (metrics.beta > 1.2) {
    insights.push(`High portfolio beta of ${metrics.beta.toFixed(2)} amplifies market movements both up and down`)
  } else if (metrics.beta < 0.8) {
    insights.push(`Low portfolio beta of ${metrics.beta.toFixed(2)} provides defensive characteristics during market stress`)
  }
  
  return insights.slice(0, 4)
}

export async function POST(request: NextRequest) {
  try {
    const { positions } = await request.json()

    if (!positions || !Array.isArray(positions) || positions.length === 0) {
      return NextResponse.json({ error: 'Valid positions array is required' }, { status: 400 })
    }

    // Calculate risk metrics
    const metrics = calculateRiskMetrics(positions)
    
    // Calculate sector allocations
    const sectorAllocations = calculateSectorAllocations(positions)
    
    // Generate recommendations
    const recommendations = generateRecommendations(positions, metrics, sectorAllocations)
    
    // Generate AI insights
    const aiInsights = generateAIInsights(positions, metrics, recommendations)
    
    const analysis = {
      positions,
      metrics,
      sectorAllocations,
      recommendations,
      aiInsights
    }

    return NextResponse.json(analysis)

  } catch (error) {
    console.error('Portfolio risk analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to perform portfolio risk analysis' },
      { status: 500 }
    )
  }
}
