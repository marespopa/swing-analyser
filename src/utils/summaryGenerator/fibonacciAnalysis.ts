import type { TechnicalAnalysisData } from '../../services/coingeckoApi'

// Fibonacci Analysis for Technical Trading

export const generateFibonacciLevelsSection = (
  analysis: TechnicalAnalysisData,
  currentPrice: number
): string => {
  if (!analysis.data || analysis.data.length === 0) return ''

  // Calculate Fibonacci retracement levels
  const priceData = analysis.data.slice(-50) // Use last 50 data points
  const high = Math.max(...priceData.map(d => d.price))
  const low = Math.min(...priceData.map(d => d.price))
  const range = high - low

  // Calculate Fibonacci levels
  const levels = {
    '0%': high,
    '23.6%': high - (range * 0.236),
    '38.2%': high - (range * 0.382),
    '50%': high - (range * 0.5),
    '61.8%': high - (range * 0.618),
    '78.6%': high - (range * 0.786),
    '100%': low
  }

  // Determine current position relative to Fibonacci levels
  let currentLevel = ''
  
  if (currentPrice >= levels['0%']) {
    currentLevel = 'Above 0% (New High)'
  } else if (currentPrice >= levels['23.6%']) {
    currentLevel = '23.6% Retracement'
  } else if (currentPrice >= levels['38.2%']) {
    currentLevel = '38.2% Retracement'
  } else if (currentPrice >= levels['50%']) {
    currentLevel = '50% Retracement'
  } else if (currentPrice >= levels['61.8%']) {
    currentLevel = '61.8% Retracement'
  } else if (currentPrice >= levels['78.6%']) {
    currentLevel = '78.6% Retracement'
  } else {
    currentLevel = 'Below 78.6% (Deep Retracement)'
  }

  // Calculate Fibonacci extension levels
  const extensionLevels = {
    '127.2%': high + (range * 0.272),
    '138.2%': high + (range * 0.382),
    '161.8%': high + (range * 0.618),
    '200%': high + range
  }

  let analysis_text = `## Fibonacci Analysis\n\n`
  
  analysis_text += `**Current Position**: ${currentLevel}\n\n`
  
  analysis_text += `**Retracement Levels**:\n`
  Object.entries(levels).forEach(([percentage, price]) => {
    const distance = ((currentPrice - price) / price) * 100
    const distanceText = distance > 0 ? `+${distance.toFixed(1)}%` : `${distance.toFixed(1)}%`
    
    analysis_text += `- ${percentage}: $${price.toFixed(2)} (${distanceText})\n`
  })
  analysis_text += `\n`
  
  analysis_text += `**Extension Levels**:\n`
  Object.entries(extensionLevels).forEach(([percentage, price]) => {
    const distance = ((price - currentPrice) / currentPrice) * 100
    analysis_text += `- ${percentage}: $${price.toFixed(2)} (+${distance.toFixed(1)}%)\n`
  })
  analysis_text += `\n`
  
  // Add interpretation
  if (currentPrice >= levels['0%']) {
    analysis_text += `**Strong Bullish**: Price above recent high - potential for new upward momentum\n\n`
  } else if (currentPrice >= levels['23.6%']) {
    analysis_text += `**Mild Pullback**: Shallow retracement suggests strong trend continuation\n\n`
  } else if (currentPrice >= levels['38.2%']) {
    analysis_text += `**Moderate Pullback**: Healthy retracement - watch for bounce or further decline\n\n`
  } else if (currentPrice >= levels['50%']) {
    analysis_text += `**Key Level**: 50% retracement is critical - often acts as support/resistance\n\n`
  } else if (currentPrice >= levels['61.8%']) {
    analysis_text += `**Deep Pullback**: 61.8% level suggests trend weakness or reversal potential\n\n`
  } else {
    analysis_text += `**Very Deep Pullback**: Below 78.6% suggests potential trend reversal\n\n`
  }

  return analysis_text
}
