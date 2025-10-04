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
  _coinName: string
): string => {
  const rsi = analysis.rsi[analysis.rsi.length - 1] || 50
  const ema9 = analysis.ema9?.[analysis.ema9.length - 1] || 0
  const ema20 = analysis.ema20?.[analysis.ema20.length - 1] || 0
  const ema50 = analysis.ema50?.[analysis.ema50.length - 1] || 0
  const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
  
  // Hybrid approach: EMA alignment for trend + RSI for timing
  let signalType = 'WAIT'
  let confidence = 'low'
  let signalEmoji = '🟡'
  
  // Check EMA alignment for trend direction
  const bullishEMA = currentPrice > ema9 && ema9 > ema20 && ema20 > ema50
  const bearishEMA = currentPrice < ema9 && ema9 < ema20 && ema20 < ema50
  const neutralEMA = !bullishEMA && !bearishEMA
  
  // Hybrid logic: EMA trend + RSI timing
  if (bullishEMA && rsi < 70) {
    // Bullish trend + not overbought
    if (rsi < 30) {
      signalType = 'Strong Buy'
      confidence = 'high'
      signalEmoji = '🟢'
    } else if (rsi < 50) {
      signalType = 'Buy'
      confidence = 'high'
      signalEmoji = '🟢'
    } else {
      signalType = 'Buy'
      confidence = 'medium'
      signalEmoji = '🟡'
    }
  } else if (bearishEMA && rsi > 30) {
    // Bearish trend + not oversold
    if (rsi > 70) {
      signalType = 'Strong Sell'
      confidence = 'high'
      signalEmoji = '🔴'
    } else if (rsi > 50) {
      signalType = 'Sell'
      confidence = 'high'
      signalEmoji = '🔴'
    } else {
      signalType = 'Sell'
      confidence = 'medium'
      signalEmoji = '🟠'
    }
  } else if (rsi < 30) {
    // Strong oversold regardless of EMA
    signalType = 'Strong Buy'
    confidence = 'high'
    signalEmoji = '🟢'
  } else if (rsi > 70) {
    // Strong overbought regardless of EMA
    signalType = 'Strong Sell'
    confidence = 'high'
    signalEmoji = '🔴'
  } else if (neutralEMA) {
    // Neutral EMA alignment - use RSI for direction
    if (rsi < 40) {
      signalType = 'Buy'
      confidence = 'medium'
      signalEmoji = '🟡'
    } else if (rsi > 60) {
      signalType = 'Sell'
      confidence = 'medium'
      signalEmoji = '🟠'
    } else {
      signalType = 'Wait'
      confidence = 'low'
      signalEmoji = '⚪'
    }
  } else {
    // Conflicting signals
    signalType = 'Wait'
    confidence = 'low'
    signalEmoji = '⚪'
  }
  
  const confidenceText = confidence === 'high' ? 'high' : confidence === 'medium' ? 'medium' : 'low'
  
  // Generate a concise text paragraph
  if (signalType === 'Strong Buy') {
    if (rsi < 30) {
      return `${signalEmoji} Strong Buy Signal (${confidenceText} confidence) - RSI at ${rsi.toFixed(1)} indicates strong oversold conditions. Look for long entries on pullbacks to 20EMA ($${ema20.toFixed(2)}) or RSI oversold levels below 35.`
    } else {
      return `${signalEmoji} Strong Buy Signal (${confidenceText} confidence) - Perfect bullish setup with price above all EMAs (9>20>50) and RSI at ${rsi.toFixed(1)}. Look for long entries on pullbacks to 20EMA ($${ema20.toFixed(2)}) or RSI oversold levels below 35.`
    }
  } else if (signalType === 'Strong Sell') {
    if (rsi > 70) {
      return `${signalEmoji} Strong Sell Signal (${confidenceText} confidence) - RSI at ${rsi.toFixed(1)} indicates strong overbought conditions. Look for short entries on rallies to 20EMA ($${ema20.toFixed(2)}) or RSI overbought levels above 65.`
    } else {
      return `${signalEmoji} Strong Sell Signal (${confidenceText} confidence) - Perfect bearish setup with price below all EMAs (9<20<50) and RSI at ${rsi.toFixed(1)}. Look for short entries on rallies to 20EMA ($${ema20.toFixed(2)}) or RSI overbought levels above 65.`
    }
  } else if (signalType === 'Buy') {
    return `${signalEmoji} Buy Signal (${confidenceText} confidence) - Price above all EMAs (9>20>50) with RSI at ${rsi.toFixed(1)}. Consider long entries on pullbacks to 20EMA ($${ema20.toFixed(2)}) or RSI oversold levels below 35.`
  } else if (signalType === 'Sell') {
    return `${signalEmoji} Sell Signal (${confidenceText} confidence) - Price below all EMAs (9<20<50) with RSI at ${rsi.toFixed(1)}. Consider short entries on rallies to 20EMA ($${ema20.toFixed(2)}) or RSI overbought levels above 65.`
  } else {
    return `${signalEmoji} Wait Signal (${confidenceText} confidence) - Mixed signals with RSI at ${rsi.toFixed(1)}. Wait for clearer trend direction. Watch 20EMA ($${ema20.toFixed(2)}) and 50EMA ($${ema50.toFixed(2)}) for confirmation.`
  }
}


// Re-export types for convenience
export * from './types'
