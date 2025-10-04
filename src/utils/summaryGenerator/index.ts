import type { SummaryGeneratorParams } from './types'
import type { TechnicalAnalysisData } from '../../services/coingeckoApi'

export const generateSummary = ({
  coinInfo,
  tradingRecommendation,
  analysis
}: SummaryGeneratorParams): string => {
  if (!coinInfo || !tradingRecommendation) return ''

  // Generate concise summary as a simple text paragraph
  const tradingSignal = generateTradingSignal(analysis, coinInfo.name)

  return tradingSignal
}

// Generate concise trading signal as a simple text paragraph
const generateTradingSignal = (
  analysis: TechnicalAnalysisData,
  coinName: string
): string => {
  const rsi = analysis.rsi[analysis.rsi.length - 1] || 50
  const ema9 = analysis.ema9?.[analysis.ema9.length - 1] || 0
  const ema20 = analysis.ema20?.[analysis.ema20.length - 1] || 0
  const ema50 = analysis.ema50?.[analysis.ema50.length - 1] || 0
  const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
  
  // Use the same enhanced logic as Technical Details
  let signalType = 'WAIT'
  let confidence = 'low'
  let signalEmoji = '🟡'
  
  // Strong buy signal
  if (currentPrice > ema9 && ema9 > ema20 && ema20 > ema50 && rsi < 70) {
    signalType = 'Strong Buy'
    confidence = 'high'
    signalEmoji = '🟢'
  }
  // Strong sell signal
  else if (currentPrice < ema9 && ema9 < ema20 && ema20 < ema50 && rsi > 30) {
    signalType = 'Strong Sell'
    confidence = 'high'
    signalEmoji = '🔴'
  }
  // Weak buy signal
  else if (currentPrice > ema20 && rsi < 65) {
    signalType = 'Weak Buy'
    confidence = 'medium'
    signalEmoji = '🟡'
  }
  // Weak sell signal
  else if (currentPrice < ema20 && rsi > 35) {
    signalType = 'Weak Sell'
    confidence = 'medium'
    signalEmoji = '🟠'
  }
  // Wait signal
  else {
    signalType = 'Wait'
    confidence = 'low'
    signalEmoji = '⚪'
  }
  
  const confidenceText = confidence === 'high' ? 'high' : confidence === 'medium' ? 'medium' : 'low'
  
  // Generate a concise text paragraph
  if (signalType === 'Strong Buy') {
    return `${signalEmoji} ${coinName} Strong Buy Signal (${confidenceText} confidence) - Perfect bullish setup with price above all EMAs (9>20>50) and RSI at ${rsi.toFixed(1)}. Look for long entries on pullbacks to 20EMA ($${ema20.toFixed(2)}) or RSI oversold levels below 35.`
  } else if (signalType === 'Strong Sell') {
    return `${signalEmoji} ${coinName} Strong Sell Signal (${confidenceText} confidence) - Perfect bearish setup with price below all EMAs (9<20<50) and RSI at ${rsi.toFixed(1)}. Look for short entries on rallies to 20EMA ($${ema20.toFixed(2)}) or RSI overbought levels above 65.`
  } else if (signalType === 'Weak Buy') {
    return `${signalEmoji} ${coinName} Weak Buy Signal (${confidenceText} confidence) - Moderate bullish setup with price above 20EMA ($${ema20.toFixed(2)}) and RSI at ${rsi.toFixed(1)}. Consider long entries on pullbacks with RSI confirmation.`
  } else if (signalType === 'Weak Sell') {
    return `${signalEmoji} ${coinName} Weak Sell Signal (${confidenceText} confidence) - Moderate bearish setup with price below 20EMA ($${ema20.toFixed(2)}) and RSI at ${rsi.toFixed(1)}. Consider short entries on rallies with RSI confirmation.`
  } else {
    return `${signalEmoji} ${coinName} Wait Signal (${confidenceText} confidence) - Mixed signals with RSI at ${rsi.toFixed(1)}. Wait for clearer trend direction. Watch 20EMA ($${ema20.toFixed(2)}) and 50EMA ($${ema50.toFixed(2)}) for confirmation.`
  }
}


// Re-export types for convenience
export * from './types'
