import type { TradingRecommendation, ActionableRecommendations } from './types'
import type { TechnicalAnalysisData } from '../../services/coingeckoApi'

export const generateActionableRecommendations = (
  tradingRecommendation: TradingRecommendation,
  analysis: TechnicalAnalysisData
): ActionableRecommendations => {
  const swingAnalysis = tradingRecommendation.swingAnalysis
  const action = tradingRecommendation.action
  const sma20 = analysis.sma20[analysis.sma20.length - 1] || 0
  const sma50 = analysis.sma50[analysis.sma50.length - 1] || 0
  
  // Calculate key levels
  const recentHighs = analysis.data.slice(-20).map(d => d.price)
  const recentLows = analysis.data.slice(-20).map(d => d.price)
  const resistance = Math.max(...recentHighs)
  const support = Math.min(...recentLows)
  
  const recommendations: ActionableRecommendations = {
    entryStrategy: [],
    stopLoss: '',
    riskReward: swingAnalysis.riskReward.toFixed(1) + ':1',
    timeHorizon: [],
    keyLevels: [
      `- Resistance: $${resistance.toFixed(2)}`,
      `- Support: $${support.toFixed(2)}`,
      `- SMA 20: $${sma20.toFixed(2)}`,
      `- SMA 50: $${sma50.toFixed(2)}`
    ]
  }
  
  if (action === 'BUY') {
    recommendations.entryStrategy = []
    if (swingAnalysis.momentum === 'Oversold') {
      recommendations.entryStrategy.push('- **Immediate Entry**: Current price presents good buying opportunity')
      recommendations.entryStrategy.push(`- **Alternative**: Wait for pullback to $${(support * 1.02).toFixed(2)} for better entry`)
    } else if (swingAnalysis.momentum === 'Overbought') {
      recommendations.entryStrategy.push(`- **Wait for Pullback**: Look for entry around $${(sma20 * 0.98).toFixed(2)} (SMA20)`)
      recommendations.entryStrategy.push(`- **Breakout Entry**: Buy on break above $${(resistance * 1.01).toFixed(2)}`)
    } else {
      recommendations.entryStrategy.push('- **Current Entry**: Price is in good buying zone')
      recommendations.entryStrategy.push('- **Scale In**: Consider partial entry now, add on dips')
    }
    
    recommendations.stopLoss = `$${(support * 0.95).toFixed(2)} (5% below support)`
    recommendations.takeProfit = `$${(resistance * 1.10).toFixed(2)} (10% above resistance)`
    
  } else if (action === 'SELL') {
    recommendations.entryStrategy = []
    if (swingAnalysis.momentum === 'Overbought') {
      recommendations.entryStrategy.push('- **Immediate Exit**: Current price is good selling level')
      recommendations.entryStrategy.push(`- **Alternative**: Wait for bounce to $${(resistance * 0.98).toFixed(2)} for better exit`)
    } else {
      recommendations.entryStrategy.push('- **Current Exit**: Price is in selling zone')
    }
    
    recommendations.stopLoss = `$${(resistance * 1.05).toFixed(2)} (5% above resistance)`
    recommendations.target = `$${(support * 0.90).toFixed(2)} (10% below support)`
    
  } else {
    recommendations.entryStrategy = [
      `- **Monitor Support**: $${support.toFixed(2)} - break below = bearish`,
      `- **Monitor Resistance**: $${resistance.toFixed(2)} - break above = bullish`,
      `- **Key Levels**: SMA20 at $${sma20.toFixed(2)}, SMA50 at $${sma50.toFixed(2)}`,
      '- **Wait for**: Clear breakout with volume confirmation'
    ]
  }
  
  // Time horizon
  if (swingAnalysis.trend === 'Bullish' && swingAnalysis.strength === 'Strong') {
    recommendations.timeHorizon = [
      '- **Short-term**: 1-3 days for quick profits',
      '- **Swing**: 1-2 weeks for trend continuation'
    ]
  } else if (swingAnalysis.trend === 'Bearish' && swingAnalysis.strength === 'Strong') {
    recommendations.timeHorizon = [
      '- **Short-term**: 1-3 days for downside move',
      '- **Swing**: 1-2 weeks for trend continuation'
    ]
  } else {
    recommendations.timeHorizon = [
      '- **Short-term**: 1-2 days for quick moves',
      '- **Monitor**: Daily for breakout signals'
    ]
  }
  
  return recommendations
}

export const formatActionableRecommendations = (recommendations: ActionableRecommendations, action: string): string => {
  let formatted = `## 📋 Actionable Recommendations\n\n`
  
  if (action === 'BUY') {
    formatted += `**Entry Strategy**:\n`
    formatted += recommendations.entryStrategy.join('\n') + '\n\n'
    
    if (recommendations.takeProfit) {
      formatted += `**Stop Loss**: ${recommendations.stopLoss}\n`
      formatted += `**Take Profit**: ${recommendations.takeProfit}\n`
    }
    formatted += `**Risk/Reward**: ${recommendations.riskReward}\n\n`
    
  } else if (action === 'SELL') {
    formatted += `**Exit Strategy**:\n`
    formatted += recommendations.entryStrategy.join('\n') + '\n\n'
    
    formatted += `**Stop Loss**: ${recommendations.stopLoss}\n`
    if (recommendations.target) {
      formatted += `**Target**: ${recommendations.target}\n`
    }
    formatted += `**Risk/Reward**: ${recommendations.riskReward}\n\n`
    
  } else {
    formatted += `**Wait Strategy**:\n`
    formatted += recommendations.entryStrategy.join('\n') + '\n\n'
  }
  
  formatted += `**Time Horizon**:\n`
  formatted += recommendations.timeHorizon.join('\n') + '\n\n'
  
  return formatted
}
