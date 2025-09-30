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
    if (trend === 'Bullish') {
      if (momentum === 'Oversold') {
        story += `🟢 The overall trend is bullish, and RSI oversold conditions suggest a potential buying opportunity as selling pressure may be exhausted.\n\n`
      } else if (momentum === 'Overbought') {
        story += `⚠️ While the trend remains bullish, RSI overbought conditions suggest caution as a pullback may be due.\n\n`
      } else if (strength === 'Strong') {
        story += `🚀 The overall trend is clearly bullish with strong momentum indicators supporting upward price movement.\n\n`
      } else {
        story += `📊 The trend is bullish but momentum is showing neutral conditions, suggesting a potential consolidation phase.\n\n`
      }
    } else if (trend === 'Bearish') {
      if (momentum === 'Overbought') {
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
      story += `✅ **MACD**: Shows a bullish crossover, confirming the positive momentum shift.\n\n`
    } else if (swingAnalysis.macdSignal === 'Bearish') {
      story += `❌ **MACD**: Indicates a bearish crossover, suggesting momentum is shifting to the downside.\n\n`
    } else {
      story += `➖ **MACD**: Signals are neutral at this time.\n\n`
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

    // 🎯 RISK MANAGEMENT (only for BUY signals)
    if (action === 'BUY' && analysis.volatilityStops) {
      const currentStopLoss = analysis.volatilityStops.stopLoss[analysis.volatilityStops.stopLoss.length - 1]
      const currentTakeProfit = analysis.volatilityStops.takeProfit[analysis.volatilityStops.takeProfit.length - 1]
      
      if (!isNaN(currentStopLoss) && !isNaN(currentTakeProfit)) {
        story += `## 🎯 Risk Management\n\n`
        
        // Stop Loss
        const stopLossPercentage = ((currentPrice - currentStopLoss) / currentPrice * 100).toFixed(1)
        story += `🛡️ **Stop Loss**: $${currentStopLoss.toFixed(2)} (${stopLossPercentage}%)\n\n`
        
        // Take Profit Levels
        const tp1 = currentPrice + (currentPrice - currentStopLoss) * 1.5
        const tp2 = currentPrice + (currentPrice - currentStopLoss) * 2.0
        const tp3 = currentPrice + (currentPrice - currentStopLoss) * 3.0
        
        story += `🎯 **TP1**: $${tp1.toFixed(2)}\n`
        story += `🎯 **TP2**: $${tp2.toFixed(2)}\n`
        story += `🎯 **TP3**: $${tp3.toFixed(2)}\n\n`
      }
    }

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


    return story
  }

  const narrative = generateNarrative()
  const actionEmoji = action === 'BUY' ? '🟢' : action === 'SELL' ? '🔴' : action === 'HOLD' ? '🟡' : '⏸️'
  const actionText = action === 'BUY' ? 'BUY SIGNAL' : action === 'SELL' ? 'SELL SIGNAL' : action === 'HOLD' ? 'HOLD POSITION' : 'WAIT'

  return `# ${actionEmoji} ${actionText}

${narrative}`
}
