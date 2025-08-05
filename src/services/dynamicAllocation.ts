import type { MarketSentiment } from './marketSentiment'
import type { CryptoAsset, RiskProfile } from '../types'

export interface DynamicAllocation {
  baseAllocation: { [key: string]: number }
  adjustedAllocation: { [key: string]: number }
  adjustments: {
    reason: string
    changes: { asset: string; from: number; to: number; reason: string }[]
  }
  riskLevel: 'low' | 'medium' | 'high'
  recommendations: string[]
}

export class DynamicAllocationService {
  // Adjust portfolio allocation based on market sentiment
  static calculateDynamicAllocation(
    assets: CryptoAsset[],
    riskProfile: RiskProfile,
    sentiment: MarketSentiment
  ): DynamicAllocation {
    const baseAllocation = this.getBaseAllocation(assets, riskProfile)
    const adjustedAllocation = { ...baseAllocation }
    const adjustments = { 
      reason: '', 
      changes: [] as { asset: string; from: number; to: number; reason: string }[] 
    }
    const recommendations: string[] = []

    // Apply sentiment-based adjustments
    this.applySentimentAdjustments(adjustedAllocation, sentiment, adjustments, recommendations)
    
    // Apply risk management rules
    this.applyRiskManagementRules(adjustedAllocation, adjustments, recommendations)
    
      // Apply capital preservation strategies
  this.applyCapitalPreservationStrategies(adjustedAllocation, sentiment, adjustments, recommendations)

  // Apply volatility-based adjustments (inspired by data-driven analysis)
  this.applyVolatilityAdjustments(adjustedAllocation, sentiment, adjustments, recommendations)

  // Apply correlation-based diversification
  this.applyCorrelationAdjustments(adjustedAllocation, sentiment, adjustments, recommendations)

  // Normalize allocations to 100%
  this.normalizeAllocations(adjustedAllocation)

    return {
      baseAllocation,
      adjustedAllocation,
      adjustments,
      riskLevel: sentiment.signals.riskLevel,
      recommendations
    }
  }

  private static getBaseAllocation(assets: CryptoAsset[], riskProfile: RiskProfile) {
    const allocation: { [key: string]: number } = {}
    
    // Get base allocations from PortfolioService
    const usdc = assets.find(asset => asset.id === 'usd-coin')
    const cryptoAssets = assets.filter(asset => asset.id !== 'usd-coin')
    
    // Base USDC allocation
    let usdcAllocation = 0
    switch (riskProfile) {
      case 'conservative': usdcAllocation = 10; break
      case 'balanced': usdcAllocation = 10; break
      case 'aggressive': usdcAllocation = 0; break
      case 'degen': usdcAllocation = 6; break
    }
    
    // Base crypto allocations
    cryptoAssets.forEach(asset => {
      allocation[asset.id] = this.getTargetAllocation(asset, riskProfile)
    })

    // Normalize to 100%
    const cryptoTotal = Object.values(allocation).reduce((sum, val) => sum + val, 0)
    const remainingAllocation = 100 - usdcAllocation
    
    if (cryptoTotal > 0) {
      Object.keys(allocation).forEach(key => {
        allocation[key] = (allocation[key] / cryptoTotal) * remainingAllocation
      })
    }

    if (usdc) {
      allocation[usdc.id] = usdcAllocation
    }

    return allocation
  }

  private static getTargetAllocation(asset: CryptoAsset, riskProfile: RiskProfile): number {
    if (asset.id === 'usd-coin') {
      switch (riskProfile) {
        case 'conservative': return 10
        case 'balanced': return 10
        case 'aggressive': return 0
      }
    }
    
    const marketCapRank = this.getMarketCapRank(asset.market_cap)
    
    switch (riskProfile) {
      case 'conservative':
        if (asset.symbol === 'BTC') return 60
        if (asset.symbol === 'ETH') return 30
        if (marketCapRank <= 10) return 5
        return 0
      case 'balanced':
        if (asset.symbol === 'BTC') return 50
        if (asset.symbol === 'ETH') return 25
        if (marketCapRank <= 10) return 8
        if (marketCapRank <= 20) return 5
        if (marketCapRank <= 50) return 2
        return 0
      case 'aggressive':
        if (asset.symbol === 'BTC') return 40
        if (asset.symbol === 'ETH') return 20
        if (marketCapRank <= 10) return 12
        if (marketCapRank <= 20) return 8
        if (marketCapRank <= 50) return 5
        if (marketCapRank <= 100) return 3
        return 2
      case 'degen':
        // Degen: 28% trending mid-caps, 66% speculative microcaps, 6% stablecoins
        if (asset.symbol === 'BTC') return 0
        if (asset.symbol === 'ETH') return 0
        if (marketCapRank <= 20) return 15 // Trending mid-caps
        if (marketCapRank <= 50) return 10 // Mid-tier altcoins
        if (marketCapRank <= 100) return 8 // Speculative plays
        return 5 // Microcaps
    }
  }

  private static getMarketCapRank(marketCap: number): number {
    if (marketCap > 100000000000) return 1
    if (marketCap > 50000000000) return 2
    if (marketCap > 20000000000) return 3
    if (marketCap > 10000000000) return 4
    if (marketCap > 5000000000) return 5
    if (marketCap > 2000000000) return 10
    if (marketCap > 1000000000) return 15
    if (marketCap > 500000000) return 20
    return 25
  }

  private static applySentimentAdjustments(
    allocation: { [key: string]: number },
    sentiment: MarketSentiment,
    adjustments: { reason: string; changes: { asset: string; from: number; to: number; reason: string }[] },
    recommendations: string[]
  ) {
    adjustments.reason = 'Market sentiment adjustments applied'

    // Bear market adjustments - increase stablecoins, reduce risk
    if (sentiment.signals.isBearMarket) {
      const usdc = Object.keys(allocation).find(key => key === 'usd-coin')
      if (usdc) {
        const currentUsdc = allocation[usdc]
        const newUsdc = Math.min(50, currentUsdc + 20) // Cap at 50%
        adjustments.changes.push({
          asset: 'USDC',
          from: currentUsdc,
          to: newUsdc,
          reason: 'Bear market - increasing stablecoin allocation for capital preservation'
        })
        allocation[usdc] = newUsdc
      }
      recommendations.push('Bear market detected - increasing stablecoin allocation for capital preservation')
    }

    // Bull market adjustments - increase growth assets
    if (sentiment.signals.isBullMarket) {
      const usdc = Object.keys(allocation).find(key => key === 'usd-coin')
      if (usdc && allocation[usdc] > 5) {
        const currentUsdc = allocation[usdc]
        const newUsdc = Math.max(5, currentUsdc - 10) // Minimum 5%
        adjustments.changes.push({
          asset: 'USDC',
          from: currentUsdc,
          to: newUsdc,
          reason: 'Bull market - reducing stablecoins to increase growth exposure'
        })
        allocation[usdc] = newUsdc
      }
      recommendations.push('Bull market detected - consider reducing stablecoins for growth exposure')
    }

    // Altcoin season adjustments
    if (sentiment.signals.isAltcoinSeason) {
      const btc = Object.keys(allocation).find(key => key === 'bitcoin')
      const eth = Object.keys(allocation).find(key => key === 'ethereum')
      
      if (btc && allocation[btc] > 30) {
        const currentBtc = allocation[btc]
        const newBtc = Math.max(30, currentBtc - 5)
        adjustments.changes.push({
          asset: 'Bitcoin',
          from: currentBtc,
          to: newBtc,
          reason: 'Altcoin season - reducing BTC dominance for altcoin exposure'
        })
        allocation[btc] = newBtc
      }
      
      if (eth && allocation[eth] > 15) {
        const currentEth = allocation[eth]
        const newEth = Math.max(15, currentEth - 3)
        adjustments.changes.push({
          asset: 'Ethereum',
          from: currentEth,
          to: newEth,
          reason: 'Altcoin season - reducing ETH for altcoin exposure'
        })
        allocation[eth] = newEth
      }
      
      recommendations.push('Altcoin season active - consider increasing altcoin exposure')
    }

    // High risk adjustments
    if (sentiment.signals.riskLevel === 'high') {
      const usdc = Object.keys(allocation).find(key => key === 'usd-coin')
      if (usdc) {
        const currentUsdc = allocation[usdc]
        const newUsdc = Math.min(40, currentUsdc + 15)
        adjustments.changes.push({
          asset: 'USDC',
          from: currentUsdc,
          to: newUsdc,
          reason: 'High volatility - increasing stablecoins for risk management'
        })
        allocation[usdc] = newUsdc
      }
      recommendations.push('High market volatility - increasing stablecoin allocation for risk management')
    }
  }

  private static applyRiskManagementRules(
    allocation: { [key: string]: number },
    adjustments: { reason: string; changes: { asset: string; from: number; to: number; reason: string }[] },
    recommendations: string[]
  ) {
    // Limit single asset exposure (never more than 40% in one asset)
    Object.keys(allocation).forEach(assetId => {
      if (allocation[assetId] > 40) {
        const currentAllocation = allocation[assetId]
        const newAllocation = 40
        adjustments.changes.push({
          asset: assetId,
          from: currentAllocation,
          to: newAllocation,
          reason: 'Risk management - limiting single asset exposure to 40%'
        })
        allocation[assetId] = newAllocation
      }
    })

    // Ensure minimum stablecoin allocation for capital preservation
    const usdc = Object.keys(allocation).find(key => key === 'usd-coin')
    if (usdc && allocation[usdc] < 5) {
      const currentUsdc = allocation[usdc]
      const newUsdc = 5
      adjustments.changes.push({
        asset: 'USDC',
        from: currentUsdc,
        to: newUsdc,
        reason: 'Capital preservation - maintaining minimum 5% stablecoin allocation'
      })
      allocation[usdc] = newUsdc
    }

    recommendations.push('Applied risk management rules - limited single asset exposure and ensured minimum stablecoin allocation')
  }

  private static applyCapitalPreservationStrategies(
    allocation: { [key: string]: number },
    sentiment: MarketSentiment,
    adjustments: { reason: string; changes: { asset: string; from: number; to: number; reason: string }[] },
    recommendations: string[]
  ) {
    // In high volatility, favor established assets
    if (sentiment.indicators.volatilityIndex > 60) {
      const btc = Object.keys(allocation).find(key => key === 'bitcoin')
      const eth = Object.keys(allocation).find(key => key === 'ethereum')
      
      if (btc && allocation[btc] < 35) {
        const currentBtc = allocation[btc]
        const newBtc = Math.min(50, currentBtc + 5)
        adjustments.changes.push({
          asset: 'Bitcoin',
          from: currentBtc,
          to: newBtc,
          reason: 'High volatility - increasing BTC allocation for stability'
        })
        allocation[btc] = newBtc
      }
      
      if (eth && allocation[eth] < 20) {
        const currentEth = allocation[eth]
        const newEth = Math.min(30, currentEth + 3)
        adjustments.changes.push({
          asset: 'Ethereum',
          from: currentEth,
          to: newEth,
          reason: 'High volatility - increasing ETH allocation for stability'
        })
        allocation[eth] = newEth
      }
      
      recommendations.push('High volatility detected - increasing allocation to established assets (BTC/ETH)')
    }

    // In extreme fear, increase stablecoins significantly
    if (sentiment.indicators.fearGreedIndex < 25) {
      const usdc = Object.keys(allocation).find(key => key === 'usd-coin')
      if (usdc) {
        const currentUsdc = allocation[usdc]
        const newUsdc = Math.min(60, currentUsdc + 25)
        adjustments.changes.push({
          asset: 'USDC',
          from: currentUsdc,
          to: newUsdc,
          reason: 'Extreme fear - significant increase in stablecoins for capital preservation'
        })
        allocation[usdc] = newUsdc
      }
      recommendations.push('Extreme fear detected - significantly increasing stablecoin allocation for capital preservation')
    }
  }

  private static applyVolatilityAdjustments(
    allocation: { [key: string]: number },
    sentiment: MarketSentiment,
    adjustments: { reason: string; changes: { asset: string; from: number; to: number; reason: string }[] },
    recommendations: string[]
  ) {
    // Based on the article's volatility analysis approach
    const volatilityIndex = sentiment.indicators.volatilityIndex
    
    if (volatilityIndex > 70) {
      // High volatility - reduce exposure to volatile assets
      recommendations.push('High volatility detected - reducing exposure to volatile assets and increasing stablecoins')
      
      // Increase stablecoin allocation in high volatility
      const usdc = Object.keys(allocation).find(key => key === 'usd-coin')
      if (usdc) {
        const currentUsdc = allocation[usdc]
        const newUsdc = Math.min(60, currentUsdc + 15)
        adjustments.changes.push({
          asset: 'USDC',
          from: currentUsdc,
          to: newUsdc,
          reason: 'High volatility - increasing stablecoins for risk management'
        })
        allocation[usdc] = newUsdc
      }
    } else if (volatilityIndex < 30) {
      // Low volatility - can increase exposure to growth assets
      recommendations.push('Low volatility detected - opportunity to increase exposure to growth assets')
      
      // Reduce stablecoin allocation in low volatility
      const usdc = Object.keys(allocation).find(key => key === 'usd-coin')
      if (usdc && allocation[usdc] > 10) {
        const currentUsdc = allocation[usdc]
        const newUsdc = Math.max(5, currentUsdc - 10)
        adjustments.changes.push({
          asset: 'USDC',
          from: currentUsdc,
          to: newUsdc,
          reason: 'Low volatility - reducing stablecoins for growth exposure'
        })
        allocation[usdc] = newUsdc
      }
    }
  }

  private static applyCorrelationAdjustments(
    allocation: { [key: string]: number },
    sentiment: MarketSentiment,
    adjustments: { reason: string; changes: { asset: string; from: number; to: number; reason: string }[] },
    recommendations: string[]
  ) {
    // Based on the article's correlation analysis approach
    // In crypto markets, correlations often increase during stress periods
    
    if (sentiment.indicators.fearGreedIndex < 30) {
      // High correlation environment - focus on established assets
      recommendations.push('High correlation environment detected - focusing on established assets for stability')
      
      // Increase BTC/ETH allocation when correlations are high
      const btc = Object.keys(allocation).find(key => key === 'bitcoin')
      const eth = Object.keys(allocation).find(key => key === 'ethereum')
      
      if (btc && allocation[btc] < 45) {
        const currentBtc = allocation[btc]
        const newBtc = Math.min(50, currentBtc + 5)
        adjustments.changes.push({
          asset: 'Bitcoin',
          from: currentBtc,
          to: newBtc,
          reason: 'High correlation - increasing BTC for stability'
        })
        allocation[btc] = newBtc
      }
      
      if (eth && allocation[eth] < 25) {
        const currentEth = allocation[eth]
        const newEth = Math.min(30, currentEth + 3)
        adjustments.changes.push({
          asset: 'Ethereum',
          from: currentEth,
          to: newEth,
          reason: 'High correlation - increasing ETH for stability'
        })
        allocation[eth] = newEth
      }
    }
  }

  private static normalizeAllocations(allocation: { [key: string]: number }) {
    const total = Object.values(allocation).reduce((sum, val) => sum + val, 0)
    
    if (Math.abs(total - 100) > 0.01) {
      Object.keys(allocation).forEach(key => {
        allocation[key] = (allocation[key] / total) * 100
      })
    }
  }

  // Get trading recommendations based on sentiment
  static getTradingRecommendations(sentiment: MarketSentiment): string[] {
    const recommendations: string[] = []

    if (sentiment.signals.isBearMarket) {
      recommendations.push('Consider defensive positioning - increase stablecoins and reduce altcoin exposure')
      recommendations.push('Set stop-losses on all positions to limit downside')
      recommendations.push('Focus on capital preservation over growth')
    }

    if (sentiment.signals.isBullMarket) {
      recommendations.push('Consider increasing exposure to growth assets')
      recommendations.push('Take partial profits on positions that have gained 50-100%')
      recommendations.push('Monitor for trend continuation signals')
    }

    if (sentiment.signals.isAltcoinSeason) {
      recommendations.push('Focus on altcoin diversification for maximum growth potential')
      recommendations.push('Consider reducing Bitcoin and Ethereum allocations')
      recommendations.push('Monitor altcoin performance relative to Bitcoin')
    }

    if (sentiment.signals.riskLevel === 'high') {
      recommendations.push('High volatility - consider reducing position sizes')
      recommendations.push('Use strict stop-losses and take profits more aggressively')
      recommendations.push('Avoid new high-risk positions')
    }

    if (sentiment.indicators.fearGreedIndex < 30) {
      recommendations.push('Extreme fear - consider buying opportunities in established assets')
      recommendations.push('Dollar-cost average into positions rather than lump sum')
      recommendations.push('Focus on projects with strong fundamentals')
    }

    if (sentiment.indicators.fearGreedIndex > 70) {
      recommendations.push('Extreme greed - consider taking profits and reducing exposure')
      recommendations.push('Be cautious of new investments at market peaks')
      recommendations.push('Increase stablecoin allocation for safety')
    }

    return recommendations
  }
} 