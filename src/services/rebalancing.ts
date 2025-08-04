import type { Portfolio, PortfolioAsset, RiskProfile } from '../types'

export interface RebalancingRecommendation {
  type: 'rebalance' | 'hold' | 'partial-rebalance'
  reason: string
  urgency: 'low' | 'medium' | 'high'
  suggestedActions: string[]
  nextReviewDate: Date
  driftPercentage: number
  assetsToRebalance: {
    asset: PortfolioAsset
    currentAllocation: number
    targetAllocation: number
    action: 'buy' | 'sell' | 'hold'
    amount: number
  }[]
}

export interface RebalancingSettings {
  frequency: 'monthly' | 'quarterly' | 'semi-annually' | 'annually'
  threshold: number // percentage drift before rebalancing
  lastRebalance: Date | null
  autoRebalance: boolean
}

export class RebalancingService {
  // Default rebalancing settings based on risk profile
  static getDefaultSettings(riskProfile: RiskProfile): RebalancingSettings {
    switch (riskProfile) {
      case 'conservative':
        return {
          frequency: 'quarterly',
          threshold: 5, // 5% drift threshold
          lastRebalance: null,
          autoRebalance: false
        }
      case 'balanced':
        return {
          frequency: 'quarterly',
          threshold: 7, // 7% drift threshold
          lastRebalance: null,
          autoRebalance: false
        }
      case 'aggressive':
        return {
          frequency: 'monthly',
          threshold: 10, // 10% drift threshold
          lastRebalance: null,
          autoRebalance: false
        }
    }
  }

  // Calculate portfolio drift and rebalancing recommendations
  static analyzePortfolio(portfolio: Portfolio): RebalancingRecommendation {
    const settings = this.getDefaultSettings(portfolio.riskProfile)
    const now = new Date()
    
    // Calculate total drift
    let totalDrift = 0
    const assetsToRebalance: RebalancingRecommendation['assetsToRebalance'] = []
    
    portfolio.assets.forEach(asset => {
      const drift = Math.abs(asset.allocation - this.getTargetAllocation(asset, portfolio.riskProfile))
      totalDrift += drift
      
      if (drift > settings.threshold) {
        const targetAllocation = this.getTargetAllocation(asset, portfolio.riskProfile)
        const currentAllocation = asset.allocation
        const action = currentAllocation > targetAllocation ? 'sell' : 'buy'
        const amount = Math.abs(currentAllocation - targetAllocation) * portfolio.totalValue / 100
        
        assetsToRebalance.push({
          asset,
          currentAllocation,
          targetAllocation,
          action,
          amount
        })
      }
    })

    // Determine rebalancing type and urgency
    let type: RebalancingRecommendation['type'] = 'hold'
    let urgency: RebalancingRecommendation['urgency'] = 'low'
    let reason = ''
    let suggestedActions: string[] = []

    if (totalDrift > 20) {
      type = 'rebalance'
      urgency = 'high'
      reason = 'Significant portfolio drift detected. Major rebalancing recommended to maintain risk profile.'
      suggestedActions = [
        'Review all asset allocations',
        'Consider selling over-weighted positions',
        'Add to under-weighted positions',
        'Monitor for 1-2 weeks before executing'
      ]
    } else if (totalDrift > 15) {
      type = 'rebalance'
      urgency = 'medium'
      reason = 'Moderate portfolio drift. Rebalancing recommended to optimize allocation.'
      suggestedActions = [
        'Focus on largest allocation drifts',
        'Consider dollar-cost averaging',
        'Review within 1 week'
      ]
    } else if (totalDrift > 10) {
      type = 'partial-rebalance'
      urgency = 'medium'
      reason = 'Minor portfolio drift. Consider selective rebalancing.'
      suggestedActions = [
        'Focus on assets with >10% drift',
        'Consider gradual adjustments',
        'Monitor for 2-3 weeks'
      ]
    } else {
      type = 'hold'
      urgency = 'low'
      reason = 'Portfolio is well-balanced. No immediate rebalancing needed.'
      suggestedActions = [
        'Continue monitoring monthly',
        'Review quarterly as scheduled',
        'Focus on swing trade opportunities'
      ]
    }

    // Calculate next review date based on frequency
    const nextReviewDate = this.getNextReviewDate(settings.frequency, now)

    return {
      type,
      reason,
      urgency,
      suggestedActions,
      nextReviewDate,
      driftPercentage: totalDrift,
      assetsToRebalance
    }
  }

  // Get target allocation based on risk profile and asset characteristics
  private static getTargetAllocation(asset: PortfolioAsset, riskProfile: RiskProfile): number {
    // Base allocation on market cap and risk profile
    const baseAllocation = this.getBaseAllocation(asset, riskProfile)
    
    // Adjust for volatility (reduce allocation for very volatile assets)
    const volatilityAdjustment = Math.max(0.5, 1 - Math.abs(asset.price_change_percentage_24h) / 100)
    
    return baseAllocation * volatilityAdjustment
  }

  // Get base allocation based on asset characteristics
  private static getBaseAllocation(asset: PortfolioAsset, riskProfile: RiskProfile): number {
    // Simplified allocation logic - in a real app, this would be more sophisticated
    const marketCapRank = this.getMarketCapRank(asset.market_cap)
    
    switch (riskProfile) {
      case 'conservative':
        // Focus on top 10 coins with higher allocations
        if (marketCapRank <= 5) return 20
        if (marketCapRank <= 10) return 15
        if (marketCapRank <= 20) return 10
        return 5
      case 'balanced':
        // More diversified with moderate allocations
        if (marketCapRank <= 5) return 15
        if (marketCapRank <= 10) return 12
        if (marketCapRank <= 20) return 8
        return 6
      case 'aggressive':
        // More weight on smaller, volatile coins
        if (marketCapRank <= 5) return 12
        if (marketCapRank <= 10) return 10
        if (marketCapRank <= 20) return 8
        return 7
    }
  }

  // Estimate market cap rank (simplified)
  private static getMarketCapRank(marketCap: number): number {
    if (marketCap > 100000000000) return 1 // >100B
    if (marketCap > 50000000000) return 2 // >50B
    if (marketCap > 20000000000) return 3 // >20B
    if (marketCap > 10000000000) return 4 // >10B
    if (marketCap > 5000000000) return 5 // >5B
    if (marketCap > 2000000000) return 10 // >2B
    if (marketCap > 1000000000) return 15 // >1B
    if (marketCap > 500000000) return 20 // >500M
    return 25
  }

  // Calculate next review date
  private static getNextReviewDate(frequency: RebalancingSettings['frequency'], fromDate: Date): Date {
    const next = new Date(fromDate)
    
    switch (frequency) {
      case 'monthly':
        next.setMonth(next.getMonth() + 1)
        break
      case 'quarterly':
        next.setMonth(next.getMonth() + 3)
        break
      case 'semi-annually':
        next.setMonth(next.getMonth() + 6)
        break
      case 'annually':
        next.setFullYear(next.getFullYear() + 1)
        break
    }
    
    return next
  }

  // Get rebalancing frequency recommendation
  static getFrequencyRecommendation(riskProfile: RiskProfile): string {
    switch (riskProfile) {
      case 'conservative':
        return 'Quarterly rebalancing recommended for conservative portfolios to maintain stability while avoiding excessive trading costs.'
      case 'balanced':
        return 'Quarterly rebalancing strikes the right balance between maintaining allocation targets and minimizing transaction costs.'
      case 'aggressive':
        return 'Monthly rebalancing may be appropriate for aggressive portfolios, but monitor trading costs and consider threshold-based rebalancing.'
    }
  }

  // Get holding period recommendation
  static getHoldingPeriodRecommendation(riskProfile: RiskProfile): string {
    switch (riskProfile) {
      case 'conservative':
        return 'Long-term holding (6+ months) recommended for core positions. Focus on "time in the market" over timing.'
      case 'balanced':
        return 'Medium-term holding (3-6 months) with periodic rebalancing. Consider swing trading with 10-20% of portfolio.'
      case 'aggressive':
        return 'Short to medium-term holding (1-3 months) with active swing trading opportunities. Monitor for major trend changes.'
    }
  }
} 