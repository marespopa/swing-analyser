import type { TradingRecommendation } from './types'
// import type { TechnicalAnalysisData } from '../../services/coingeckoApi'

export interface VolatilityScore {
  score: number
  level: string
  color: string
  recommendation: string
}

export const calculateVolatilityScore = (
  tradingRecommendation: TradingRecommendation,
  currentPrice: number
): VolatilityScore => {
  const swingAnalysis = tradingRecommendation.swingAnalysis
  
  // Calculate volatility score based on multiple factors
  let volatilityScore = 50 // Base score
  
  // Adjust based on price range
  if (currentPrice < 0.01) {
    volatilityScore += 30 // Very low price = high volatility
  } else if (currentPrice < 0.1) {
    volatilityScore += 20 // Low price = moderate-high volatility
  } else if (currentPrice < 1.0) {
    volatilityScore += 10 // Medium price = moderate volatility
  }
  
  // Adjust based on trend strength
  if (swingAnalysis.strength === 'Strong') {
    volatilityScore += 15
  } else if (swingAnalysis.strength === 'Moderate') {
    volatilityScore += 5
  }
  
  // Adjust based on momentum
  if (swingAnalysis.momentum === 'Oversold' || swingAnalysis.momentum === 'Overbought') {
    volatilityScore += 10
  }
  
  // Adjust based on volume confirmation
  if (swingAnalysis.hasVolumeConfirmation) {
    volatilityScore += 5
  }
  
  // Ensure score stays within 0-100 range
  volatilityScore = Math.max(0, Math.min(100, volatilityScore))
  
  // Get volatility level description
  let volatilityLevel = ''
  let volatilityColor = ''
  let recommendation = ''
  
  if (volatilityScore >= 80) {
    volatilityLevel = 'Very High'
    volatilityColor = '🔴'
    recommendation = 'Use wider SL/TP (3-5%)'
  } else if (volatilityScore >= 60) {
    volatilityLevel = 'High'
    volatilityColor = '🟠'
    recommendation = 'Use moderate SL/TP (2-3%)'
  } else if (volatilityScore >= 40) {
    volatilityLevel = 'Medium'
    volatilityColor = '🟡'
    recommendation = 'Use standard SL/TP (1-2%)'
  } else if (volatilityScore >= 20) {
    volatilityLevel = 'Low'
    volatilityColor = '🟢'
    recommendation = 'Use tight SL/TP (0.5-1%)'
  } else {
    volatilityLevel = 'Very Low'
    volatilityColor = '🔵'
    recommendation = 'Use very tight SL/TP (0.3-0.5%)'
  }
  
  return {
    score: volatilityScore,
    level: volatilityLevel,
    color: volatilityColor,
    recommendation
  }
}

export const formatVolatilityAnalysis = (volatilityScore: VolatilityScore): string => {
  let analysis = `## 📊 Volatility Score\n\n`
  
  analysis += `${volatilityScore.color} **Volatility Score**: ${volatilityScore.score}/100 (${volatilityScore.level})\n\n`
  analysis += `💡 **Recommendation**: ${volatilityScore.recommendation}\n\n`
  
  return analysis
}
