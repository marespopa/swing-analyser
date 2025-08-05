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
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually'
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
          threshold: 8, // 8% drift threshold
          lastRebalance: null,
          autoRebalance: false
        }
      case 'balanced':
        return {
          frequency: 'quarterly',
          threshold: 10, // 10% drift threshold
          lastRebalance: null,
          autoRebalance: false
        }
      case 'aggressive':
        return {
          frequency: 'monthly',
          threshold: 12, // 12% drift threshold
          lastRebalance: null,
          autoRebalance: false
        }
      case 'degen':
        return {
          frequency: 'monthly', // Changed from weekly to monthly for degen
          threshold: 35, // Increased from 20% to 35% for ultra-high risk tolerance
          lastRebalance: null,
          autoRebalance: false
        }
    }
  }

  // Calculate portfolio drift and rebalancing recommendations
  static analyzePortfolio(portfolio: Portfolio): RebalancingRecommendation {
    const settings = this.getDefaultSettings(portfolio.riskProfile)
    const now = new Date()
    
    // Check if portfolio has a stablecoin position
    const hasStablecoin = portfolio.assets.some(asset => asset.id === 'usd-coin')
    const cryptoAssets = portfolio.assets.filter(asset => asset.id !== 'usd-coin')
    console.log('Rebalancing - Portfolio assets:', portfolio.assets.map(a => a.symbol))
    console.log('Rebalancing - Has stablecoin:', hasStablecoin)
    console.log('Rebalancing - Crypto assets count:', cryptoAssets.length)
    
    // Special handling for single-asset portfolios (common in degen mode)
    if (cryptoAssets.length === 1) {
      return this.getSingleAssetRecommendation(portfolio, hasStablecoin, now)
    }
    
    // Calculate total drift (average of individual drifts, not sum)
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

    // Calculate average drift instead of sum
    totalDrift = totalDrift / portfolio.assets.length

    // Determine rebalancing type and urgency with degen-specific leniency
    let type: RebalancingRecommendation['type'] = 'hold'
    let urgency: RebalancingRecommendation['urgency'] = 'low'
    let reason = ''
    let suggestedActions: string[] = []

    // Much more lenient thresholds for degen mode
    if (portfolio.riskProfile === 'degen') {
      if (totalDrift > 40) {
        type = 'rebalance'
        urgency = 'medium' // Reduced from 'high' to 'medium'
        reason = 'Significant drift in degen portfolio. Consider rebalancing but maintain high-risk tolerance.'
        suggestedActions = [
          'Review only the most extreme allocation drifts',
          'Consider letting winners run longer',
          'Focus on momentum rather than strict allocation targets',
          'Monitor for 2-3 weeks before any major changes'
        ]
      } else if (totalDrift > 25) {
        type = 'partial-rebalance'
        urgency = 'low' // Reduced from 'medium' to 'low'
        reason = 'Moderate drift in degen portfolio. Minor adjustments may be considered.'
        suggestedActions = [
          'Focus only on assets with >25% drift',
          'Consider gradual adjustments over time',
          'Prioritize momentum over allocation targets',
          'Monitor for 3-4 weeks before acting'
        ]
      } else if (totalDrift > 15) {
        type = 'hold'
        urgency = 'low'
        reason = 'Minor drift in degen portfolio. Let positions run and focus on momentum.'
        suggestedActions = [
          'Let winners continue running',
          'Focus on swing trade opportunities',
          'Monitor for major trend changes',
          'Consider adding to strong performers'
        ]
      } else {
        type = 'hold'
        urgency = 'low'
        reason = 'Degen portfolio is performing well. Continue aggressive strategy.'
        suggestedActions = [
          'Maintain aggressive positioning',
          'Look for new momentum opportunities',
          'Consider increasing position sizes on winners',
          'Monitor for market-wide trend changes'
        ]
      }
    } else {
      // Standard logic for other risk profiles
      if (totalDrift > 15) {
        type = 'rebalance'
        urgency = 'high'
        reason = 'Significant portfolio drift detected. Major rebalancing recommended to maintain risk profile.'
        suggestedActions = [
          'Review all asset allocations',
          'Consider selling over-weighted positions',
          'Add to under-weighted positions',
          'Monitor for 1-2 weeks before executing'
        ]
      } else if (totalDrift > 10) {
        type = 'rebalance'
        urgency = 'medium'
        reason = 'Moderate portfolio drift. Rebalancing recommended to optimize allocation.'
        suggestedActions = [
          'Focus on largest allocation drifts',
          'Consider dollar-cost averaging',
          'Review within 1 week'
        ]
      } else if (totalDrift > 5) {
        type = 'partial-rebalance'
        urgency = 'medium'
        reason = 'Minor portfolio drift. Consider selective rebalancing.'
        suggestedActions = [
          'Focus on assets with >5% drift',
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
    }

    // Add stablecoin recommendation if missing (but be more lenient for degen)
    if (!hasStablecoin) {
      const stablecoinRecommendation = this.getStablecoinRecommendation(portfolio.riskProfile)
      console.log('Rebalancing - Adding stablecoin recommendation:', stablecoinRecommendation)
      
      // For degen mode, make stablecoin recommendation less urgent
      if (portfolio.riskProfile === 'degen') {
        suggestedActions.push(stablecoinRecommendation) // Add to end instead of beginning
      } else {
        suggestedActions.unshift(stablecoinRecommendation)
        
        // Increase urgency if no stablecoin (but not for degen)
        if (urgency === 'low') {
          urgency = 'medium'
        }
      }
    }

    // If no specific rebalancing actions needed and has stablecoin, add general guidance
    if (assetsToRebalance.length === 0 && hasStablecoin) {
      if (portfolio.riskProfile === 'degen') {
        suggestedActions = [
          'Degen portfolio is running well - let winners continue',
          'Focus on momentum and trend following',
          'Look for new high-risk opportunities',
          'Consider increasing position sizes on strong performers'
        ]
      } else {
        suggestedActions = [
          'Portfolio is well-balanced - no specific rebalancing actions needed',
          'Continue monitoring for market opportunities',
          'Focus on swing trade opportunities for active management'
        ]
      }
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
    
    // Normalize to ensure total allocation equals 100%
    return baseAllocation
  }

  // Get base allocation based on asset characteristics
  private static getBaseAllocation(asset: PortfolioAsset, riskProfile: RiskProfile): number {
    // Handle USDC stablecoin
    if (asset.id === 'usd-coin') {
      switch (riskProfile) {
        case 'conservative': return 20
        case 'balanced': return 15
        case 'aggressive': return 10
        case 'degen': return 5 // Reduced stablecoin allocation for degen
      }
    }
    
    // Simplified allocation logic - in a real app, this would be more sophisticated
    const marketCapRank = this.getMarketCapRank(asset.market_cap)
    
    switch (riskProfile) {
      case 'conservative':
        // Focus on top 10 coins with higher allocations
        if (marketCapRank <= 5) return 20
        if (marketCapRank <= 10) return 16
        if (marketCapRank <= 20) return 12
        return 8
      case 'balanced':
        // More diversified with moderate allocations
        if (marketCapRank <= 5) return 17
        if (marketCapRank <= 10) return 13
        if (marketCapRank <= 20) return 10
        return 7
      case 'aggressive':
        // More weight on smaller, volatile coins
        if (marketCapRank <= 5) return 16
        if (marketCapRank <= 10) return 13
        if (marketCapRank <= 20) return 10
        return 8
      case 'degen':
        // Ultra-high risk with focus on microcaps and momentum
        if (marketCapRank <= 5) return 18
        if (marketCapRank <= 10) return 15
        if (marketCapRank <= 20) return 12
        return 10 // Higher allocation for smaller coins in degen mode
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
      case 'weekly':
        next.setDate(next.getDate() + 7)
        break
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

  // Special recommendation for single-asset portfolios (common in degen mode)
  private static getSingleAssetRecommendation(portfolio: Portfolio, hasStablecoin: boolean, now: Date): RebalancingRecommendation {
    const cryptoAsset = portfolio.assets.find(asset => asset.id !== 'usd-coin')
    
    if (!cryptoAsset) {
      // Only stablecoin - suggest adding crypto
      return {
        type: 'hold',
        reason: 'Portfolio contains only stablecoin. Consider adding crypto assets for growth.',
        urgency: 'low',
        suggestedActions: [
          'Add crypto assets to your portfolio',
          'Consider starting with Bitcoin or Ethereum',
          'Monitor market conditions for entry points'
        ],
        nextReviewDate: this.getNextReviewDate('monthly', now),
        driftPercentage: 0,
        assetsToRebalance: []
      }
    }

    // Single crypto asset - typical degen scenario
    const priceChange = cryptoAsset.price_change_percentage_24h
    const isPerformingWell = priceChange > 0
    
    let type: RebalancingRecommendation['type'] = 'hold'
    let urgency: RebalancingRecommendation['urgency'] = 'low'
    let reason = ''
    let suggestedActions: string[] = []

    if (portfolio.riskProfile === 'degen') {
      if (isPerformingWell) {
        type = 'hold'
        urgency = 'low'
        reason = 'Degen portfolio with single asset performing well. Let it run and focus on momentum.'
        suggestedActions = [
          'Let your position continue running',
          'Monitor for trend changes or exhaustion signals',
          'Consider adding to position if momentum continues',
          'Set trailing stop-loss to protect gains',
          'Look for new opportunities while maintaining current position'
        ]
      } else {
        type = 'partial-rebalance'
        urgency = 'medium'
        reason = 'Single asset underperforming. Consider position management or new opportunities.'
        suggestedActions = [
          'Review your position and market conditions',
          'Consider cutting losses if trend is broken',
          'Look for new momentum opportunities',
          'Consider diversifying into 2-3 assets',
          'Set tighter stop-loss to limit downside'
        ]
      }
    } else {
      // Non-degen with single asset - suggest diversification
      type = 'partial-rebalance'
      urgency = 'medium'
      reason = 'Single asset portfolio detected. Consider diversifying for risk management.'
      suggestedActions = [
        'Consider diversifying into multiple assets',
        'Add Bitcoin and Ethereum as core holdings',
        'Consider adding stablecoin for liquidity',
        'Review your risk tolerance and strategy'
      ]
    }

    // Add stablecoin recommendation if missing
    if (!hasStablecoin && portfolio.riskProfile !== 'degen') {
      suggestedActions.unshift('Consider adding 5-10% USDC for liquidity and swing trading')
    }

    return {
      type,
      reason,
      urgency,
      suggestedActions,
      nextReviewDate: this.getNextReviewDate('monthly', now),
      driftPercentage: 0, // No meaningful drift for single asset
      assetsToRebalance: []
    }
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
      case 'degen':
        return 'Monthly rebalancing for degen portfolios with high drift tolerance. Focus on momentum over strict allocation targets. Let winners run longer.'
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
      case 'degen':
        return 'Ultra-short term holding (hours to days) with momentum-based decisions. Let strong performers run and cut losses quickly.'
    }
  }

  // Get stablecoin recommendation based on risk profile
  private static getStablecoinRecommendation(riskProfile: RiskProfile): string {
    switch (riskProfile) {
      case 'conservative':
        return 'Consider adding 15-20% USDC stablecoin position for risk management and swing trading opportunities'
      case 'balanced':
        return 'Consider adding 10-15% USDC stablecoin position for liquidity and swing trading flexibility'
      case 'aggressive':
        return 'Consider adding 5-10% USDC stablecoin position for quick entry/exit opportunities'
      case 'degen':
        return 'Consider adding 3-5% USDC stablecoin position for rapid re-entry during momentum shifts (optional for degen)'
    }
  }
} 