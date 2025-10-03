import type { TechnicalAnalysisData } from '../services/coingeckoApi'

interface CoinInfo {
  id: string
  name: string
  symbol: string
  currentPrice?: number
}

interface TradingRecommendation {
  action: 'BUY' | 'SELL' | 'HOLD' | 'WAIT'
  confidence: 'low' | 'medium' | 'high'
  signalColor: 'green' | 'amber' | 'red'
  trend: string
  strength: string
  priceChange: string
  swingAnalysis: {
    trend: 'Bullish' | 'Bearish' | 'Sideways'
    momentum: 'Oversold' | 'Overbought' | 'Neutral'
    macdSignal: 'Bullish' | 'Bearish' | 'Neutral'
    supportResistance: 'Near Support' | 'Near Resistance' | 'Middle Range'
    patterns: Array<{ name: string; signal: 'bullish' | 'bearish'; confidence: string }>
    hasGoodRiskReward: boolean
    riskReward: number
    hasVolumeConfirmation: boolean
    isChoppyMarket: boolean
    strength: string
    goldenCrossSignal?: 'Golden Cross' | 'Death Cross' | 'None'
  }
}

interface SummaryGeneratorParams {
  coinInfo: CoinInfo
  tradingRecommendation: TradingRecommendation
  currentPrice: number
  analysis: TechnicalAnalysisData
}

export const generateSummary = ({
  coinInfo,
  tradingRecommendation,
  currentPrice,
  analysis
}: SummaryGeneratorParams): string => {
  if (!coinInfo || !tradingRecommendation || !currentPrice) return ''

  const action = tradingRecommendation.action

  // Extract detected patterns from analysis (already deduplicated and prioritized)
  const getDetectedPatterns = (): string[] => {
    if (!analysis.patternDetection) return []
    
    const allPatterns = [
      ...analysis.patternDetection.triangles,
      ...analysis.patternDetection.headAndShoulders,
      ...analysis.patternDetection.doublePatterns,
      ...analysis.patternDetection.cupAndHandle,
      ...analysis.patternDetection.flags,
      ...analysis.patternDetection.wedges
    ]
    
    // Return only the top 3 most significant patterns to avoid overwhelming the summary
    return allPatterns
      .slice(0, 3)
      .map(pattern => pattern.pattern)
  }

  // Generate narrative story based on actual analysis data
  const generateNarrative = (): string => {
    const swingAnalysis = tradingRecommendation.swingAnalysis
    const patterns = getDetectedPatterns()
    
    let story = ``
    
    // Generate coherent narrative based on trend and momentum alignment
    const trend = swingAnalysis.trend
    const momentum = swingAnalysis.momentum
    const strength = swingAnalysis.strength
    
    // 📈 TREND ANALYSIS
    story += `## 📈 Trend Analysis\n\n`
    
    // Check for conflicting signals
    const hasConflictingSignals = (trend === 'Bullish' && swingAnalysis.macdSignal === 'Bearish') || 
                                 (trend === 'Bearish' && swingAnalysis.macdSignal === 'Bullish')
    
    if (trend === 'Bullish') {
      if (hasConflictingSignals) {
        story += `⚠️ The overall trend is bullish, but conflicting signals from MACD suggest momentum may be shifting. This creates uncertainty about the next move.\n\n`
      } else if (momentum === 'Oversold') {
        story += `🟢 The overall trend is bullish, and RSI oversold conditions suggest a potential buying opportunity as selling pressure may be exhausted.\n\n`
      } else if (momentum === 'Overbought') {
        story += `⚠️ While the trend remains bullish, RSI overbought conditions suggest caution as a pullback may be due.\n\n`
      } else if (strength === 'Strong') {
        story += `🚀 The overall trend is clearly bullish with strong momentum indicators supporting upward price movement.\n\n`
      } else {
        story += `📊 The trend is bullish but momentum is showing neutral conditions, suggesting a potential consolidation phase.\n\n`
      }
    } else if (trend === 'Bearish') {
      if (hasConflictingSignals) {
        story += `⚠️ The overall trend is bearish, but conflicting signals from MACD suggest momentum may be shifting. This creates uncertainty about the next move.\n\n`
      } else if (momentum === 'Overbought') {
        story += `🔴 The trend has turned bearish, and RSI overbought conditions suggest a potential selling opportunity as buying pressure weakens.\n\n`
      } else if (momentum === 'Oversold') {
        story += `🔄 While the trend is bearish, RSI oversold conditions suggest a potential bounce or reversal may be forming.\n\n`
      } else if (strength === 'Strong') {
        story += `📉 The trend has turned bearish with strong momentum indicators supporting downward price movement.\n\n`
      } else {
        story += `📊 The trend is bearish but momentum is showing neutral conditions, suggesting a potential consolidation phase.\n\n`
      }
    } else {
      // Sideways trend
      if (momentum === 'Oversold') {
        story += `↗️ The market is in a sideways phase, but RSI oversold conditions suggest a potential upward breakout.\n\n`
      } else if (momentum === 'Overbought') {
        story += `↘️ The market is in a sideways phase, but RSI overbought conditions suggest a potential downward breakout.\n\n`
      } else {
        story += `↔️ The market is currently in a sideways consolidation phase, with neutral momentum creating uncertainty about the next directional move.\n\n`
      }
    }

    // 📊 TECHNICAL INDICATORS
    story += `## 📊 Technical Indicators\n\n`
    
    // Use actual MACD data
    if (swingAnalysis.macdSignal === 'Bullish') {
      if (hasConflictingSignals) {
        story += `✅ **MACD**: Shows a bullish crossover, providing a positive signal that may counter the overall trend.\n\n`
      } else {
        story += `✅ **MACD**: Shows a bullish crossover, confirming the positive momentum shift.\n\n`
      }
    } else if (swingAnalysis.macdSignal === 'Bearish') {
      if (hasConflictingSignals) {
        story += `❌ **MACD**: Indicates a bearish crossover, creating a conflicting signal with the overall trend.\n\n`
      } else {
        story += `❌ **MACD**: Indicates a bearish crossover, suggesting momentum is shifting to the downside.\n\n`
      }
    } else {
      story += `➖ **MACD**: Signals are neutral at this time.\n\n`
    }

    // Add Golden Cross/Death Cross information
    if (swingAnalysis.goldenCrossSignal === 'Golden Cross') {
      story += `🌟 **Golden Cross**: SMA20 has crossed above SMA50, indicating a strong bullish signal and potential upward trend acceleration.\n\n`
    } else if (swingAnalysis.goldenCrossSignal === 'Death Cross') {
      story += `💀 **Death Cross**: SMA20 has crossed below SMA50, indicating a strong bearish signal and potential downward trend acceleration.\n\n`
    }

    // Use actual support/resistance data
    if (swingAnalysis.supportResistance === 'Near Support') {
      story += `🛡️ **Support/Resistance**: Price is currently testing a key support level, which could provide a springboard for higher prices if it holds.\n\n`
    } else if (swingAnalysis.supportResistance === 'Near Resistance') {
      story += `🚧 **Support/Resistance**: Price is approaching significant resistance, which could limit upside movement unless there's a strong breakout.\n\n`
    } else {
      story += `📊 **Support/Resistance**: Price is trading in the middle range between support and resistance.\n\n`
    }

    // Use actual volume data
    if (swingAnalysis.hasVolumeConfirmation) {
      story += `📈 **Volume**: Is confirming the current move, with increased trading activity supporting the direction.\n\n`
    } else {
      story += `📉 **Volume**: Is not providing strong confirmation for the current move.\n\n`
    }

    // Add conflicting signals guidance
    if (hasConflictingSignals) {
      story += `## ⚠️ Conflicting Signals Detected\n\n`
      story += `The analysis shows mixed signals between trend direction and momentum indicators. In such cases:\n\n`
      story += `- **Wait for confirmation** before making significant trades\n`
      story += `- **Monitor price action** for breakout or breakdown patterns\n`
      story += `- **Consider smaller position sizes** due to increased uncertainty\n`
      story += `- **Set tighter stop losses** to limit risk exposure\n\n`
    }

    // 📊 VOLATILITY SCORE (only for BUY signals)
    story += `## 📊 Volatility Score\n\n`
    
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
    
    story += `${volatilityColor} **Volatility Score**: ${volatilityScore}/100 (${volatilityLevel})\n\n`
    story += `💡 **Recommendation**: ${recommendation}\n\n`

    // 🔍 CHART PATTERNS
    if (patterns.length > 0) {
      story += `## 🔍 Chart Patterns Detected\n\n`
      const patternDescriptions: { [key: string]: string } = {
        'Double Bottom': '🔄 Double Bottom pattern forming - typically signals a bullish reversal as selling pressure appears exhausted.',
        'Double Top': '🔄 Double Top pattern emerged - often signals a bearish reversal as buying pressure weakens.',
        'Ascending Triangle': '📈 Ascending Triangle developing - typically signals a bullish continuation with higher lows and constant resistance.',
        'Descending Triangle': '📉 Descending Triangle forming - often signals a bearish continuation with lower highs and constant support.',
        'Symmetrical Triangle': '⚖️ Symmetrical Triangle emerging - indicates consolidation before a potential breakout in either direction.',
        'Head and Shoulders': '👤 Head and Shoulders pattern formed - typically signals a bearish reversal with the head being the highest peak.',
        'Cup and Handle': '☕ Cup and Handle pattern developing - a bullish continuation pattern indicating potential upward movement.',
        'Bull Flag': '🚩 Bull Flag pattern forming - typically signals a bullish continuation after a strong upward move.',
        'Bear Flag': '🚩 Bear Flag pattern emerged - often signals a bearish continuation after a strong downward move.',
        'Rising Wedge': '📐 Rising Wedge pattern forming - typically signals a bearish reversal despite rising prices.',
        'Falling Wedge': '📐 Falling Wedge pattern developing - actually a bullish reversal pattern despite falling prices.'
      }
      
      // Add descriptions for all detected patterns
      patterns.forEach((pattern) => {
        if (patternDescriptions[pattern]) {
          story += `- ${patternDescriptions[pattern]}\n`
        }
      })
      story += `\n`
    }


    // 📌 NEXT MOVES
    story += `## 📌 Next Moves\n\n`
    
    // Get current technical levels
    const latestPrice = analysis.data[analysis.data.length - 1]?.price || 0
    const sma20 = analysis.sma20[analysis.sma20.length - 1] || 0
    const sma50 = analysis.sma50[analysis.sma50.length - 1] || 0
    const rsi = analysis.rsi[analysis.rsi.length - 1] || 50
    const currentVolume = analysis.data[analysis.data.length - 1]?.volume || 0
    const avgVolume = analysis.volumeAnalysis?.volumeSMA[analysis.volumeAnalysis.volumeSMA.length - 1] || 0
    
    // Calculate resistance and support levels
    const recentHighs = analysis.data.slice(-20).map(d => d.price)
    const recentLows = analysis.data.slice(-20).map(d => d.price)
    const resistance = Math.max(...recentHighs)
    const support = Math.min(...recentLows)
    
    // MACD analysis
    let macdSignal = 'Neutral'
    if (analysis.macd && analysis.macd.macd.length >= 2 && analysis.macd.signal.length >= 2) {
      const currentMACD = analysis.macd.macd[analysis.macd.macd.length - 1]
      const previousMACD = analysis.macd.macd[analysis.macd.macd.length - 2]
      const currentSignal = analysis.macd.signal[analysis.macd.signal.length - 1]
      const previousSignal = analysis.macd.signal[analysis.macd.signal.length - 2]
      
      if (previousMACD <= previousSignal && currentMACD > currentSignal) {
        macdSignal = 'Bullish'
      } else if (previousMACD >= previousSignal && currentMACD < currentSignal) {
        macdSignal = 'Bearish'
      } else if (currentMACD > currentSignal) {
        macdSignal = 'Bullish'
      } else if (currentMACD < currentSignal) {
        macdSignal = 'Bearish'
      }
    }
    
    // Volume analysis
    const volumeRatio = avgVolume > 0 ? currentVolume / avgVolume : 1
    const isHighVolume = volumeRatio > 1.2
    const isLowVolume = volumeRatio < 0.8
    
    // Generate bullish scenario
    let bullishScenario = ''
    if (resistance > latestPrice) {
      const resistanceLevel = resistance.toFixed(2)
      if (isHighVolume) {
        bullishScenario = `Break above $${resistanceLevel} with strong volume (${(volumeRatio * 100).toFixed(0)}% above average)`
      } else {
        bullishScenario = `Break above $${resistanceLevel} with volume confirmation`
      }
    } else if (sma20 > latestPrice) {
      const smaLevel = sma20.toFixed(2)
      bullishScenario = `Break above $${smaLevel} (SMA 20) with strong volume`
    } else {
      bullishScenario = `Continue upward momentum with volume confirmation`
    }
    
    // Add MACD confirmation to bullish scenario
    if (macdSignal === 'Bullish') {
      bullishScenario += ` and MACD bullish crossover`
    }
    
    // Generate bearish scenario
    let bearishScenario = ''
    if (support < latestPrice) {
      const supportLevel = support.toFixed(2)
      const nextSupport = (support * 0.95).toFixed(2) // 5% below current support
      bearishScenario = `Drop below $${supportLevel} support could trigger a pullback toward $${nextSupport}`
    } else if (sma50 < latestPrice) {
      const smaLevel = sma50.toFixed(2)
      bearishScenario = `Break below $${smaLevel} (SMA 50) could signal trend reversal`
    } else {
      bearishScenario = `Break below current support levels could trigger selling pressure`
    }
    
    // Add MACD confirmation to bearish scenario
    if (macdSignal === 'Bearish') {
      bearishScenario += ` with MACD bearish divergence`
    }
    
    // Add volume context
    if (isLowVolume) {
      bearishScenario += ` (low volume weakness)`
    }
    
    story += `**Bullish scenario**: ${bullishScenario}\n\n`
    story += `**Bearish scenario**: ${bearishScenario}\n\n`
    
    // Add key levels
    story += `**Key Levels**:\n`
    story += `- Resistance: $${resistance.toFixed(2)}\n`
    story += `- Support: $${support.toFixed(2)}\n`
    story += `- SMA 20: $${sma20.toFixed(2)}\n`
    story += `- SMA 50: $${sma50.toFixed(2)}\n\n`
    
    // Add volume and MACD status
    story += `**Volume Status**: ${isHighVolume ? 'High' : isLowVolume ? 'Low' : 'Normal'} (${(volumeRatio * 100).toFixed(0)}% of average)\n`
    story += `**MACD Signal**: ${macdSignal}\n`
    story += `**RSI**: ${rsi.toFixed(1)} (${rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral'})\n\n`

    return story
  }

  const narrative = generateNarrative()
  const actionEmoji = action === 'BUY' ? '🟢' : action === 'SELL' ? '🔴' : action === 'HOLD' ? '🟡' : '⏸️'
  const actionText = action === 'BUY' ? 'BUY SIGNAL' : action === 'SELL' ? 'SELL SIGNAL' : action === 'HOLD' ? 'HOLD POSITION' : 'WAIT'

  return `# ${actionEmoji} ${actionText}

${narrative}`
}
