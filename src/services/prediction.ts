import type { Portfolio, RiskProfile } from '../types'

export interface GrowthPrediction {
  timeframe: '1week' | '1month' | '3months' | '6months' | '1year'
  predictedValue: number
  predictedGrowth: number
  confidence: number
  scenarios: {
    optimistic: { value: number; growth: number }
    realistic: { value: number; growth: number }
    pessimistic: { value: number; growth: number }
  }
  factors: string[]
}

export interface PortfolioPrediction {
  currentValue: number
  predictions: GrowthPrediction[]
  riskAssessment: {
    volatility: number
    maxDrawdown: number
    sharpeRatio: number
    riskLevel: 'low' | 'medium' | 'high'
  }
  recommendations: string[]
}

export class PredictionService {
  // Calculate portfolio growth predictions
  static calculatePortfolioPrediction(portfolio: Portfolio): PortfolioPrediction {
    const currentValue = portfolio.totalValue
    const predictions: GrowthPrediction[] = []
    
    // Calculate portfolio metrics
    const volatility = this.calculatePortfolioVolatility(portfolio)
    const maxDrawdown = this.calculateMaxDrawdown(portfolio)
    const sharpeRatio = this.calculateSharpeRatio(portfolio)
    
    // Determine risk level
    const riskLevel = this.determineRiskLevel(volatility, maxDrawdown, sharpeRatio)
    
    // Generate predictions for different timeframes
    const timeframes: GrowthPrediction['timeframe'][] = ['1week', '1month', '3months', '6months', '1year']
    
    timeframes.forEach(timeframe => {
      const prediction = this.calculateTimeframePrediction(portfolio, timeframe, volatility, riskLevel)
      predictions.push(prediction)
    })
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(portfolio, riskLevel, predictions)
    
    return {
      currentValue,
      predictions,
      riskAssessment: {
        volatility,
        maxDrawdown,
        sharpeRatio,
        riskLevel
      },
      recommendations
    }
  }
  
  // Calculate prediction for specific timeframe
  private static calculateTimeframePrediction(
    portfolio: Portfolio, 
    timeframe: GrowthPrediction['timeframe'],
    volatility: number,
    riskLevel: 'low' | 'medium' | 'high'
  ): GrowthPrediction {
    const days = this.getDaysFromTimeframe(timeframe)
    const baseGrowthRate = this.getBaseGrowthRate(portfolio.riskProfile, timeframe)
    
    // Adjust for volatility and market conditions
    const volatilityAdjustment = Math.max(0.5, 1 - (volatility * 0.3))
    const adjustedGrowthRate = baseGrowthRate * volatilityAdjustment
    
    // Calculate scenarios
    const optimisticMultiplier = this.getOptimisticMultiplier(riskLevel)
    const pessimisticMultiplier = this.getPessimisticMultiplier(riskLevel)
    
    const realisticGrowth = adjustedGrowthRate * days
    const optimisticGrowth = realisticGrowth * optimisticMultiplier
    const pessimisticGrowth = realisticGrowth * pessimisticMultiplier
    
    const currentValue = portfolio.totalValue
    const realisticValue = currentValue * (1 + realisticGrowth / 100)
    const optimisticValue = currentValue * (1 + optimisticGrowth / 100)
    const pessimisticValue = currentValue * (1 + pessimisticGrowth / 100)
    
    // Calculate confidence based on volatility and timeframe
    const confidence = Math.max(20, Math.min(70, 60 - (volatility * 80) - (days * 0.3)))
    
    // Generate factors affecting prediction
    const factors = this.generatePredictionFactors(portfolio, timeframe, volatility)
    
    return {
      timeframe,
      predictedValue: realisticValue,
      predictedGrowth: realisticGrowth,
      confidence,
      scenarios: {
        optimistic: { value: optimisticValue, growth: optimisticGrowth },
        realistic: { value: realisticValue, growth: realisticGrowth },
        pessimistic: { value: pessimisticValue, growth: pessimisticGrowth }
      },
      factors
    }
  }
  
  // Calculate portfolio volatility
  private static calculatePortfolioVolatility(portfolio: Portfolio): number {
    const returns = portfolio.assets.map(asset => {
      // Use 24h price change as a proxy for volatility
      return Math.abs(asset.price_change_percentage_24h) / 100
    })
    
    if (returns.length === 0) return 0.05 // Default 5% volatility
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length
    
    return Math.sqrt(variance)
  }
  
  // Calculate maximum drawdown potential
  private static calculateMaxDrawdown(portfolio: Portfolio): number {
    // Estimate based on asset volatility and allocation
    const maxDrawdown = portfolio.assets.reduce((total, asset) => {
      const assetVolatility = Math.abs(asset.price_change_percentage_24h) / 100
      const weightedDrawdown = assetVolatility * (asset.allocation / 100)
      return total + weightedDrawdown
    }, 0)
    
    return Math.min(0.5, maxDrawdown * 2) // Cap at 50%
  }
  
  // Calculate Sharpe ratio approximation
  private static calculateSharpeRatio(portfolio: Portfolio): number {
    const totalReturn = portfolio.totalProfitLossPercentage / 100
    const volatility = this.calculatePortfolioVolatility(portfolio)
    
    if (volatility === 0) return 0
    
    // Assume risk-free rate of 2%
    const riskFreeRate = 0.02
    return (totalReturn - riskFreeRate) / volatility
  }
  
  // Determine risk level
  private static determineRiskLevel(
    volatility: number, 
    maxDrawdown: number, 
    sharpeRatio: number
  ): 'low' | 'medium' | 'high' {
    const riskScore = (volatility * 0.4) + (maxDrawdown * 0.4) + (Math.max(0, 1 - sharpeRatio) * 0.2)
    
    if (riskScore < 0.15) return 'low'
    if (riskScore < 0.3) return 'medium'
    return 'high'
  }
  
  // Get base growth rate by risk profile and timeframe
  private static getBaseGrowthRate(riskProfile: RiskProfile, timeframe: GrowthPrediction['timeframe']): number {
    const baseRates = {
      conservative: { '1week': 0.2, '1month': 0.8, '3months': 2.5, '6months': 5, '1year': 10 },
      balanced: { '1week': 0.4, '1month': 1.5, '3months': 4.5, '6months': 9, '1year': 18 },
      aggressive: { '1week': 0.8, '1month': 3, '3months': 9, '6months': 18, '1year': 35 }
    }
    
    return baseRates[riskProfile][timeframe]
  }
  
  // Get days from timeframe
  private static getDaysFromTimeframe(timeframe: GrowthPrediction['timeframe']): number {
    const daysMap = {
      '1week': 7,
      '1month': 30,
      '3months': 90,
      '6months': 180,
      '1year': 365
    }
    
    return daysMap[timeframe]
  }
  
    // Get optimistic multiplier based on risk level
  private static getOptimisticMultiplier(riskLevel: 'low' | 'medium' | 'high'): number {
    switch (riskLevel) {
      case 'low': return 1.3
      case 'medium': return 1.5
      case 'high': return 1.8
    }
  }

  // Get pessimistic multiplier based on risk level
  private static getPessimisticMultiplier(riskLevel: 'low' | 'medium' | 'high'): number {
    switch (riskLevel) {
      case 'low': return 0.6
      case 'medium': return 0.4
      case 'high': return 0.2
    }
  }
  
  // Generate factors affecting prediction
  private static generatePredictionFactors(
    portfolio: Portfolio, 
    timeframe: GrowthPrediction['timeframe'],
    volatility: number
  ): string[] {
    const factors: string[] = []
    
    // Market conditions
    if (volatility > 0.1) {
      factors.push('High market volatility may impact growth')
    }
    
    // Portfolio composition
    const hasStablecoin = portfolio.assets.some(asset => asset.id === 'usd-coin')
    if (!hasStablecoin) {
      factors.push('Missing stablecoin position increases risk')
    }
    
    // Timeframe specific factors
    if (timeframe === '1week') {
      factors.push('Short-term predictions are less reliable')
    } else if (timeframe === '1year') {
      factors.push('Long-term predictions based on historical crypto cycles')
    }
    
    // Risk profile factors
    if (portfolio.riskProfile === 'aggressive') {
      factors.push('Aggressive portfolio may see higher volatility')
    } else if (portfolio.riskProfile === 'conservative') {
      factors.push('Conservative allocation provides stability')
    }
    
    // Add realistic crypto market factors
    factors.push('Crypto markets are highly unpredictable')
    factors.push('Past performance does not guarantee future results')
    
    if (timeframe === '1year') {
      factors.push('Annual predictions are speculative due to crypto market cycles')
    }
    
    return factors
  }
  
  // Generate recommendations
  private static generateRecommendations(
    portfolio: Portfolio,
    riskLevel: 'low' | 'medium' | 'high',
    predictions: GrowthPrediction[]
  ): string[] {
    const recommendations: string[] = []
    
    // Risk-based recommendations
    if (riskLevel === 'high') {
      recommendations.push('Consider reducing position sizes to manage risk')
      recommendations.push('Monitor portfolio more frequently during volatile periods')
    }
    
    // Growth-based recommendations
    const oneYearPrediction = predictions.find(p => p.timeframe === '1year')
    if (oneYearPrediction && oneYearPrediction.predictedGrowth > 20) {
      recommendations.push('Moderate growth potential - consider dollar-cost averaging')
    }
    
    // Portfolio composition recommendations
    const hasStablecoin = portfolio.assets.some(asset => asset.id === 'usd-coin')
    if (!hasStablecoin) {
      recommendations.push('Add stablecoin position for risk management')
    }
    
    // Rebalancing recommendations
    if (portfolio.assets.length > 5) {
      recommendations.push('Consider rebalancing to maintain target allocations')
    }
    
    return recommendations
  }
} 