import type { TradingRecommendation } from './types'

export const generateExecutiveSummary = (
  tradingRecommendation: TradingRecommendation,
  patterns: string[]
): string => {
  const swingAnalysis = tradingRecommendation.swingAnalysis
  const confidence = tradingRecommendation.confidence
  const action = tradingRecommendation.action
  
  let summary = `## 🎯 Executive Summary\n\n`
  
  // Primary signal and confidence
  const confidenceEmoji = confidence === 'high' ? '🟢' : confidence === 'medium' ? '🟡' : '🔴'
  summary += `${confidenceEmoji} **Signal**: ${action} (${confidence.toUpperCase()} confidence)\n\n`
  
  // Key opportunity/threat
  if (action === 'BUY') {
    if (swingAnalysis.momentum === 'Oversold') {
      summary += `📈 **Opportunity**: Oversold conditions present a potential buying opportunity with strong upside potential.\n\n`
    } else if (swingAnalysis.momentum === 'Overbought') {
      summary += `🚀 **Opportunity**: Strong bullish momentum continues, but monitor for exhaustion signals.\n\n`
    } else {
      summary += `📊 **Opportunity**: Bullish trend with moderate momentum suggests potential for continued upward movement.\n\n`
    }
  } else if (action === 'SELL') {
    if (swingAnalysis.momentum === 'Overbought') {
      summary += `📉 **Opportunity**: Overbought conditions suggest selling pressure may increase.\n\n`
    } else {
      summary += `🔴 **Threat**: Bearish trend suggests potential for further downside.\n\n`
    }
  } else {
    summary += `⏸️ **Situation**: Mixed signals create uncertainty - waiting for clearer direction.\n\n`
  }
  
  // Key risk factors
  const riskFactors = []
  if (swingAnalysis.momentum === 'Overbought' && action === 'BUY') {
    riskFactors.push('Overbought conditions may lead to pullback')
  }
  if (swingAnalysis.momentum === 'Oversold' && action === 'SELL') {
    riskFactors.push('Oversold conditions may trigger bounce')
  }
  if (!swingAnalysis.hasVolumeConfirmation) {
    riskFactors.push('Lack of volume confirmation')
  }
  if (patterns.length > 2) {
    riskFactors.push('Multiple conflicting patterns detected')
  }
  
  if (riskFactors.length > 0) {
    summary += `⚠️ **Key Risks**: ${riskFactors.join(', ')}\n\n`
  }
  
  // Recommended action
  if (action === 'BUY') {
    summary += `💡 **Recommendation**: Consider long position with tight stop-loss below support levels.\n\n`
  } else if (action === 'SELL') {
    summary += `💡 **Recommendation**: Consider short position or exit long positions with stop-loss above resistance.\n\n`
  } else {
    summary += `💡 **Recommendation**: Wait for clearer signals before taking action. Monitor key support/resistance levels.\n\n`
  }
  
  return summary
}
