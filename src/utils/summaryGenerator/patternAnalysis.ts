import type { TechnicalAnalysisData } from '../../services/coingeckoApi'

export const getDetectedPatterns = (analysis: TechnicalAnalysisData): string[] => {
  if (!analysis.patternDetection) return []
  
  const allPatterns = [
    ...analysis.patternDetection.triangles,
    ...analysis.patternDetection.headAndShoulders,
    ...analysis.patternDetection.doublePatterns,
    ...analysis.patternDetection.cupAndHandle,
    ...analysis.patternDetection.flags,
    ...analysis.patternDetection.wedges,
    ...analysis.patternDetection.highTrendlines
  ]
  
  // Return only the top 3 most significant patterns to avoid overwhelming the summary
  return allPatterns
    .slice(0, 3)
    .map(pattern => pattern.pattern)
}

export const formatChartPatterns = (patterns: string[]): string => {
  if (patterns.length === 0) return ''
  
  let formatted = `## Chart Patterns\n\n`
  
  const patternDescriptions: { [key: string]: string } = {
    'Double Bottom': 'Double Bottom pattern forming - typically signals a bullish reversal as selling pressure appears exhausted.',
    'Double Top': 'Double Top pattern emerged - often signals a bearish reversal as buying pressure weakens.',
    'Ascending Triangle': 'Ascending Triangle developing - typically signals a bullish continuation with higher lows and constant resistance.',
    'Descending Triangle': 'Descending Triangle forming - often signals a bearish continuation with lower highs and constant support.',
    'Symmetrical Triangle': 'Symmetrical Triangle emerging - indicates consolidation before a potential breakout in either direction.',
    'Head and Shoulders': 'Head and Shoulders pattern formed - typically signals a bearish reversal with the head being the highest peak.',
    'Cup and Handle': 'Cup and Handle pattern developing - a bullish continuation pattern indicating potential upward movement.',
    'Bull Flag': 'Bull Flag pattern forming - typically signals a bullish continuation after a strong upward move.',
    'Bear Flag': 'Bear Flag pattern emerged - often signals a bearish continuation after a strong downward move.',
    'Rising Wedge': 'Rising Wedge pattern forming - typically signals a bearish reversal despite rising prices.',
    'Falling Wedge': 'Falling Wedge pattern developing - actually a bullish reversal pattern despite falling prices.',
    'Rising Trendline': 'Rising Trendline (Support) - multiple touches creating ascending support, typically signals bullish continuation.',
    'Falling Trendline': 'Falling Trendline (Resistance) - multiple touches creating descending resistance, typically signals bearish continuation.'
  }
  
  // Add descriptions for all detected patterns
  patterns.forEach((pattern) => {
    if (patternDescriptions[pattern]) {
      formatted += `- ${patternDescriptions[pattern]}\n`
    }
  })
  formatted += `\n`
  
  return formatted
}

export const generateRSITrendlineAnalysis = (analysis: TechnicalAnalysisData): string => {
  if (!analysis.patternDetection?.highTrendlines || analysis.patternDetection.highTrendlines.length === 0) {
    return ''
  }

  const rsi = analysis.rsi[analysis.rsi.length - 1] || 50
  const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
  const trendlinePatterns = analysis.patternDetection.highTrendlines
  
  let analysisText = ''
  
  // Find the most recent and significant trendline pattern
  const mostRecentPattern = trendlinePatterns[0] // Already sorted by priority
  
  if (mostRecentPattern) {
    const pattern = mostRecentPattern.pattern
    const touches = mostRecentPattern.touches
    const supportLevel = mostRecentPattern.supportLevel || 0
    const resistanceLevel = mostRecentPattern.resistanceLevel || 0
    
    // Calculate distances for both pattern types
    const distanceToSupport = ((currentPrice - supportLevel) / supportLevel) * 100
    const distanceToResistance = ((resistanceLevel - currentPrice) / currentPrice) * 100
    
    analysisText += `## RSI + Trendline Analysis\n\n`
    
    if (pattern === 'Rising Trendline') {
      // Rising trendline (support) analysis
      
      if (rsi < 30) {
        analysisText += `🟢 **Strong Buy Signal**: Price is near the rising support trendline (${distanceToSupport.toFixed(1)}% above) with RSI oversold (${rsi.toFixed(1)}). This creates a high-probability buying opportunity.\n\n`
      } else if (rsi < 50) {
        analysisText += `🟡 **Moderate Buy Signal**: Price is near the rising support trendline with RSI below neutral (${rsi.toFixed(1)}). Consider buying on any pullback to the trendline.\n\n`
      } else if (rsi > 70) {
        analysisText += `🚀 **Strong Bullish Momentum**: Price is near the rising support trendline with RSI overbought (${rsi.toFixed(1)}). This indicates strong bullish momentum - the trendline support combined with sustained buying pressure suggests continued upward movement.\n\n`
      } else {
        analysisText += `🟢 **Buy on Pullback**: Rising trendline with ${touches} touches provides strong support. RSI at ${rsi.toFixed(1)} suggests buying on any pullback to the trendline.\n\n`
      }
      
      if (currentPrice <= supportLevel * 1.02) {
        analysisText += `⚠️ **Breakout Alert**: Price is very close to or has broken below the rising support trendline. Monitor for confirmation of breakdown.\n\n`
      }
    } else if (pattern === 'Falling Trendline') {
      // Falling trendline (resistance) analysis
      
      if (rsi > 70) {
        analysisText += `🔴 **Strong Sell Signal**: Price is near the falling resistance trendline (${distanceToResistance.toFixed(1)}% below) with RSI overbought (${rsi.toFixed(1)}). This creates a high-probability selling opportunity.\n\n`
      } else if (rsi > 50) {
        analysisText += `🟡 **Moderate Sell Signal**: Price is near the falling resistance trendline with RSI above neutral (${rsi.toFixed(1)}). Consider selling on any rally to the trendline.\n\n`
      } else if (rsi < 30) {
        analysisText += `🟢 **Caution**: While price is near the falling resistance trendline, RSI is oversold (${rsi.toFixed(1)}). Wait for RSI to recover before selling.\n\n`
      } else {
        analysisText += `🔴 **Sell on Rally**: Falling trendline with ${touches} touches provides strong resistance. RSI at ${rsi.toFixed(1)} suggests selling on any rally to the trendline.\n\n`
      }
      
      if (currentPrice >= resistanceLevel * 0.98) {
        analysisText += `⚠️ **Breakout Alert**: Price is very close to or has broken above the falling resistance trendline. Monitor for confirmation of breakout.\n\n`
      }
    }
    
    // Add trendline-specific guidance
    analysisText += `**Trendline Details**:\n`
    analysisText += `- Pattern: ${pattern} with ${touches} touches\n`
    if (pattern === 'Rising Trendline') {
      analysisText += `- Support Level: $${supportLevel.toFixed(2)}\n`
      analysisText += `- Current Distance: ${distanceToSupport.toFixed(1)}% above support\n`
    } else {
      analysisText += `- Resistance Level: $${resistanceLevel.toFixed(2)}\n`
      analysisText += `- Current Distance: ${distanceToResistance.toFixed(1)}% below resistance\n`
    }
    analysisText += `- RSI Level: ${rsi.toFixed(1)} (${rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral'})\n`
    
    // Add RSI interpretation context
    if (rsi > 70) {
      if (pattern === 'Rising Trendline') {
        analysisText += `- RSI Interpretation: Overbought RSI in a bullish trendline pattern indicates strong buying momentum rather than weakness. This can signal continued upward movement.\n\n`
      } else {
        analysisText += `- RSI Interpretation: Overbought RSI near resistance suggests selling pressure may increase. Watch for reversal signals.\n\n`
      }
    } else if (rsi < 30) {
      if (pattern === 'Falling Trendline') {
        analysisText += `- RSI Interpretation: Oversold RSI in a bearish trendline pattern indicates strong selling momentum rather than strength. This can signal continued downward movement.\n\n`
      } else {
        analysisText += `- RSI Interpretation: Oversold RSI near support suggests buying pressure may increase. Watch for reversal signals.\n\n`
      }
    } else {
      analysisText += `- RSI Interpretation: Neutral RSI levels provide balanced conditions for trend continuation.\n\n`
    }
  }
  
  return analysisText
}

export const generatePatternAnalysisSection = (analysis: TechnicalAnalysisData): string => {
  const patterns = getDetectedPatterns(analysis)
  const patternAnalysis = formatChartPatterns(patterns)
  const rsiTrendlineAnalysis = generateRSITrendlineAnalysis(analysis)
  
  return patternAnalysis + rsiTrendlineAnalysis
}
