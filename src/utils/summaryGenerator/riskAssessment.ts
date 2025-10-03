import type { TradingRecommendation, RiskAssessmentResult } from './types'

export const generateRiskAssessment = (
  tradingRecommendation: TradingRecommendation,
  action: string
): RiskAssessmentResult => {
  const swingAnalysis = tradingRecommendation.swingAnalysis
  const confidence = tradingRecommendation.confidence
  
  // Calculate risk score based on multiple factors
  let riskScore = 50
  
  if (confidence === 'high') {
    riskScore -= 20
  } else if (confidence === 'low') {
    riskScore += 20
  }
  
  if (swingAnalysis.momentum === 'Overbought' && action === 'BUY') {
    riskScore += 15
  }
  if (swingAnalysis.momentum === 'Oversold' && action === 'SELL') {
    riskScore += 15
  }
  if (!swingAnalysis.hasVolumeConfirmation) {
    riskScore += 10
  }
  if (swingAnalysis.isChoppyMarket) {
    riskScore += 15
  }
  if (swingAnalysis.hasGoodRiskReward) {
    riskScore -= 10
  }
  
  // Determine risk level
  let riskLevel: 'Low' | 'Medium' | 'High' = 'Medium'
  let riskColor = '🟡'
  
  if (riskScore >= 70) {
    riskLevel = 'High'
    riskColor = '🔴'
  } else if (riskScore >= 40) {
    riskLevel = 'Medium'
    riskColor = '🟡'
  } else {
    riskLevel = 'Low'
    riskColor = '🟢'
  }
  
  // Risk factors
  const riskFactors = []
  
  if (swingAnalysis.momentum === 'Overbought' && action === 'BUY') {
    riskFactors.push('- Overbought conditions increase reversal risk')
  }
  if (swingAnalysis.momentum === 'Oversold' && action === 'SELL') {
    riskFactors.push('- Oversold conditions increase bounce risk')
  }
  if (!swingAnalysis.hasVolumeConfirmation) {
    riskFactors.push('- Weak volume confirmation reduces signal reliability')
  }
  if (swingAnalysis.isChoppyMarket) {
    riskFactors.push('- Choppy market conditions increase whipsaw risk')
  }
  if (confidence === 'low') {
    riskFactors.push('- Low confidence signal increases uncertainty')
  }
  
  // Position sizing recommendation
  const positionSizing = []
  if (riskLevel === 'High') {
    positionSizing.push('- Use smaller position size (1-2% of portfolio)')
    positionSizing.push('- Consider paper trading first')
  } else if (riskLevel === 'Medium') {
    positionSizing.push('- Use moderate position size (2-3% of portfolio)')
    positionSizing.push('- Monitor closely for early exit signals')
  } else {
    positionSizing.push('- Can use standard position size (3-5% of portfolio)')
    positionSizing.push('- Still maintain proper risk management')
  }
  
  return {
    riskLevel,
    riskScore,
    riskColor,
    riskFactors: riskFactors.length > 0 ? riskFactors : ['- No major risk factors identified'],
    positionSizing
  }
}

export const formatRiskAssessment = (riskAssessment: RiskAssessmentResult): string => {
  let assessment = `## ⚖️ Risk Assessment\n\n`
  
  assessment += `${riskAssessment.riskColor} **Risk Level**: ${riskAssessment.riskLevel} (${riskAssessment.riskScore}/100)\n\n`
  
  assessment += `**Risk Factors**:\n`
  assessment += riskAssessment.riskFactors.join('\n') + '\n\n'
  
  assessment += `**Position Sizing**:\n`
  assessment += riskAssessment.positionSizing.join('\n') + '\n\n'
  
  return assessment
}
