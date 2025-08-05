import type { Portfolio, PortfolioAsset, RiskProfile } from '../types'

export interface StopLossRecommendation {
  asset: PortfolioAsset
  currentPrice: number
  recommendedStopLoss: number
  stopLossPercentage: number
  urgency: 'low' | 'medium' | 'high'
  reason: string
  suggestedAction: string
  riskLevel: 'conservative' | 'moderate' | 'aggressive'
}

export interface StopLossAnalysis {
  recommendations: StopLossRecommendation[]
  summary: {
    totalRisk: number
    highRiskPositions: number
    mediumRiskPositions: number
    lowRiskPositions: number
    averageStopLoss: number
  }
  generalAdvice: string[]
}

export class StopLossService {
  // Analyze portfolio and provide stop loss recommendations
  static analyzePortfolio(portfolio: Portfolio): StopLossAnalysis {
    const recommendations: StopLossRecommendation[] = []
    
    portfolio.assets.forEach(asset => {
      // Skip stablecoins - they don't need stop losses
      if (asset.id === 'usd-coin' || asset.symbol.toLowerCase() === 'usdc') {
        return
      }
      
      const recommendation = this.calculateStopLoss(asset, portfolio.riskProfile)
      recommendations.push(recommendation)
    })
    
    // Calculate summary statistics
    const summary = this.calculateSummary(recommendations)
    
    // Generate general advice
    const generalAdvice = this.generateGeneralAdvice(portfolio, summary)
    
    return {
      recommendations,
      summary,
      generalAdvice
    }
  }
  
  // Calculate stop loss for individual asset
  private static calculateStopLoss(asset: PortfolioAsset, riskProfile: RiskProfile): StopLossRecommendation {
    const currentPrice = asset.current_price
    const volatility = Math.abs(asset.price_change_percentage_24h) / 100
    
    // Get base stop loss percentage based on risk profile
    const baseStopLoss = this.getBaseStopLoss(riskProfile, volatility)
    
    // Adjust for asset-specific factors
    const adjustedStopLoss = this.adjustStopLoss(baseStopLoss, asset)
    
    const stopLossPrice = currentPrice * (1 - adjustedStopLoss / 100)
    const stopLossPercentage = adjustedStopLoss
    
    // Determine urgency based on risk factors
    const urgency = this.determineUrgency(asset, volatility)    
    
    // Generate reason and suggested action
    const { reason, suggestedAction } = this.generateStopLossReason(asset, urgency, riskProfile)
    
    // Determine risk level
    const riskLevel = this.determineRiskLevel(stopLossPercentage, volatility)
    
    return {
      asset,
      currentPrice,
      recommendedStopLoss: stopLossPrice,
      stopLossPercentage,
      urgency,
      reason,
      suggestedAction,
      riskLevel
    }
  }
  
  // Get base stop loss percentage by risk profile
  private static getBaseStopLoss(riskProfile: RiskProfile, volatility: number): number {
    const baseRates = {
      conservative: 8,   // 8% base stop loss
      balanced: 12,      // 12% base stop loss
      aggressive: 18,    // 18% base stop loss
      degen: 25         // 25% base stop loss for degen
    }
    
    let baseStopLoss = baseRates[riskProfile]
    
    // Adjust for volatility
    if (volatility > 0.1) {
      baseStopLoss *= 1.2 // Increase stop loss for high volatility
    } else if (volatility < 0.05) {
      baseStopLoss *= 0.8 // Decrease stop loss for low volatility
    }
    
    return baseStopLoss
  }
  
  // Adjust stop loss based on asset characteristics
  private static adjustStopLoss(baseStopLoss: number, asset: PortfolioAsset): number {
    let adjustedStopLoss = baseStopLoss
    
    // Adjust for market cap (smaller coins = wider stops)
    const marketCap = asset.market_cap
    if (marketCap < 1000000000) { // < 1B
      adjustedStopLoss *= 1.3
    } else if (marketCap < 10000000000) { // < 10B
      adjustedStopLoss *= 1.1
    } else if (marketCap > 100000000000) { // > 100B
      adjustedStopLoss *= 0.9
    }
    
    // Adjust for allocation size (larger positions = tighter stops)
    if (asset.allocation > 20) {
      adjustedStopLoss *= 0.8
    } else if (asset.allocation < 5) {
      adjustedStopLoss *= 1.2
    }
    
    // Adjust for recent performance
    if (asset.price_change_percentage_24h > 10) {
      adjustedStopLoss *= 1.2 // Wider stops for recent winners
    } else if (asset.price_change_percentage_24h < -10) {
      adjustedStopLoss *= 0.8 // Tighter stops for recent losers
    }
    
    // Cap the stop loss
    return Math.min(50, Math.max(5, adjustedStopLoss))
  }
  
  // Determine urgency level
  private static determineUrgency(asset: PortfolioAsset, volatility: number): 'low' | 'medium' | 'high' {
    let urgencyScore = 0
    
    // High volatility increases urgency
    if (volatility > 0.15) urgencyScore += 2
    else if (volatility > 0.1) urgencyScore += 1
    
    // Large allocation increases urgency
    if (asset.allocation > 25) urgencyScore += 2
    else if (asset.allocation > 15) urgencyScore += 1
    
    // Recent poor performance increases urgency
    if (asset.price_change_percentage_24h < -15) urgencyScore += 2
    else if (asset.price_change_percentage_24h < -5) urgencyScore += 1
    
    // Small market cap increases urgency
    if (asset.market_cap < 1000000000) urgencyScore += 1
    
    if (urgencyScore >= 4) return 'high'
    if (urgencyScore >= 2) return 'medium'
    return 'low'
  }
  
  // Generate stop loss reason and suggested action
  private static generateStopLossReason(
    asset: PortfolioAsset, 
    urgency: 'low' | 'medium' | 'high',
    riskProfile: RiskProfile
  ): { reason: string; suggestedAction: string } {
    let reason = ''
    let suggestedAction = ''
    
    // Generate reason based on asset characteristics
    if (asset.price_change_percentage_24h < -10) {
      reason = `${asset.symbol} has declined ${Math.abs(asset.price_change_percentage_24h).toFixed(1)}% in 24h`
    } else if (asset.market_cap < 1000000000) {
      reason = `${asset.symbol} is a small-cap asset with high volatility`
    } else if (asset.allocation > 20) {
      reason = `${asset.symbol} represents a large position (${asset.allocation.toFixed(1)}%)`
    } else {
      reason = `${asset.symbol} requires risk management based on current market conditions`
    }
    
    // Generate suggested action based on urgency and risk profile
    if (urgency === 'high') {
      if (riskProfile === 'degen') {
        suggestedAction = 'Set stop-loss immediately or consider reducing position size'
      } else {
        suggestedAction = 'Set stop-loss immediately to protect capital'
      }
    } else if (urgency === 'medium') {
      if (riskProfile === 'degen') {
        suggestedAction = 'Monitor closely and set stop-loss if trend continues'
      } else {
        suggestedAction = 'Set stop-loss within 24-48 hours'
      }
    } else {
      if (riskProfile === 'degen') {
        suggestedAction = 'Optional stop-loss for risk management'
      } else {
        suggestedAction = 'Set stop-loss for peace of mind'
      }
    }
    
    return { reason, suggestedAction }
  }
  
  // Determine risk level
  private static determineRiskLevel(stopLossPercentage: number, volatility: number): 'conservative' | 'moderate' | 'aggressive' {
    const riskScore = (stopLossPercentage / 50) + (volatility * 2)
    
    if (riskScore < 0.4) return 'conservative'
    if (riskScore < 0.7) return 'moderate'
    return 'aggressive'
  }
  
  // Calculate summary statistics
  private static calculateSummary(recommendations: StopLossRecommendation[]): StopLossAnalysis['summary'] {
    const totalRisk = recommendations.reduce((sum, rec) => sum + rec.stopLossPercentage, 0) / recommendations.length
    
    const highRiskPositions = recommendations.filter(rec => rec.urgency === 'high').length
    const mediumRiskPositions = recommendations.filter(rec => rec.urgency === 'medium').length
    const lowRiskPositions = recommendations.filter(rec => rec.urgency === 'low').length
    
    const averageStopLoss = recommendations.reduce((sum, rec) => sum + rec.stopLossPercentage, 0) / recommendations.length
    
    return {
      totalRisk,
      highRiskPositions,
      mediumRiskPositions,
      lowRiskPositions,
      averageStopLoss
    }
  }
  
  // Generate general advice
  private static generateGeneralAdvice(portfolio: Portfolio, summary: StopLossAnalysis['summary']): string[] {
    const advice: string[] = []
    
    // Risk profile specific advice
    if (portfolio.riskProfile === 'conservative') {
      advice.push('Use tight stop-losses (5-10%) to preserve capital')
      advice.push('Consider trailing stop-losses for winning positions')
    } else if (portfolio.riskProfile === 'balanced') {
      advice.push('Balance stop-loss protection with growth potential')
      advice.push('Use 10-15% stop-losses for most positions')
    } else if (portfolio.riskProfile === 'aggressive') {
      advice.push('Allow positions to breathe with 15-20% stop-losses')
      advice.push('Focus on trend following over strict stop-losses')
    } else if (portfolio.riskProfile === 'degen') {
      advice.push('Use wide stop-losses (20-30%) to let winners run')
      advice.push('Focus on momentum over strict risk management')
      advice.push('Consider position sizing over stop-losses')
    }
    
    // Summary-based advice
    if (summary.highRiskPositions > 0) {
      advice.push(`Address ${summary.highRiskPositions} high-risk position(s) first`)
    }
    
    if (summary.averageStopLoss > 20) {
      advice.push('Portfolio has wide stop-losses - suitable for volatile markets')
    } else if (summary.averageStopLoss < 10) {
      advice.push('Portfolio has tight stop-losses - good for capital preservation')
    }
    
    // General advice
    advice.push('Review stop-losses weekly and adjust based on market conditions')
    advice.push('Consider using trailing stop-losses for profitable positions')
    
    return advice
  }
  
  // Get stop loss strategy recommendation
  static getStopLossStrategy(riskProfile: RiskProfile): string {
    switch (riskProfile) {
      case 'conservative':
        return 'Conservative: Use tight 5-10% stop-losses with trailing stops for winners. Focus on capital preservation.'
      case 'balanced':
        return 'Balanced: Use 10-15% stop-losses with periodic reviews. Balance protection with growth potential.'
      case 'aggressive':
        return 'Aggressive: Use 15-20% stop-losses and focus on trend following. Let positions breathe.'
      case 'degen':
        return 'Degen: Use wide 20-30% stop-losses and focus on momentum. Position sizing over strict stops.'
    }
  }
} 