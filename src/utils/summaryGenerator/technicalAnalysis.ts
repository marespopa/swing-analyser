import type { TradingRecommendation } from './types'

export const generateTechnicalAnalysis = (tradingRecommendation: TradingRecommendation): string => {
  const swingAnalysis = tradingRecommendation.swingAnalysis
  
  let analysis = ``
  
  // Generate coherent narrative based on trend and momentum alignment
  const trend = swingAnalysis.trend
  const momentum = swingAnalysis.momentum
  const strength = swingAnalysis.strength
  
  // 📈 TREND ANALYSIS
  analysis += `## 📈 Trend Analysis\n\n`
  
  // Check for conflicting signals
  const hasConflictingSignals = (trend === 'Bullish' && swingAnalysis.macdSignal === 'Bearish') || 
                               (trend === 'Bearish' && swingAnalysis.macdSignal === 'Bullish')
  
  if (trend === 'Bullish') {
    if (hasConflictingSignals) {
      analysis += `⚠️ The overall trend is bullish, but conflicting signals from MACD suggest momentum may be shifting. This creates uncertainty about the next move.\n\n`
    } else if (momentum === 'Oversold') {
      analysis += `🟢 The overall trend is bullish, and RSI oversold conditions suggest a potential buying opportunity as selling pressure may be exhausted.\n\n`
    } else if (momentum === 'Overbought') {
      analysis += `🚀 The trend remains bullish with RSI overbought conditions indicating strong buying momentum. While this suggests continued upward pressure, monitor for potential exhaustion signals.\n\n`
    } else if (strength === 'Strong') {
      analysis += `🚀 The overall trend is clearly bullish with strong momentum indicators supporting upward price movement.\n\n`
    } else {
      analysis += `📊 The trend is bullish but momentum is showing neutral conditions, suggesting a potential consolidation phase.\n\n`
    }
  } else if (trend === 'Bearish') {
    if (hasConflictingSignals) {
      analysis += `⚠️ The overall trend is bearish, but conflicting signals from MACD suggest momentum may be shifting. This creates uncertainty about the next move.\n\n`
    } else if (momentum === 'Overbought') {
      analysis += `🔴 The trend has turned bearish, and RSI overbought conditions suggest a potential selling opportunity as buying pressure weakens.\n\n`
    } else if (momentum === 'Oversold') {
      analysis += `🔄 While the trend is bearish, RSI oversold conditions suggest a potential bounce or reversal may be forming.\n\n`
    } else if (strength === 'Strong') {
      analysis += `📉 The trend has turned bearish with strong momentum indicators supporting downward price movement.\n\n`
    } else {
      analysis += `📊 The trend is bearish but momentum is showing neutral conditions, suggesting a potential consolidation phase.\n\n`
    }
  } else {
    // Sideways trend
    if (momentum === 'Oversold') {
      analysis += `↗️ The market is in a sideways phase, but RSI oversold conditions suggest a potential upward breakout.\n\n`
    } else if (momentum === 'Overbought') {
      analysis += `↘️ The market is in a sideways phase, but RSI overbought conditions suggest a potential downward breakout.\n\n`
    } else {
      analysis += `↔️ The market is currently in a sideways consolidation phase, with neutral momentum creating uncertainty about the next directional move.\n\n`
    }
  }

  // 📊 TECHNICAL INDICATORS
  analysis += `## 📊 Technical Indicators\n\n`
  
  // Use actual MACD data
  if (swingAnalysis.macdSignal === 'Bullish') {
    if (hasConflictingSignals) {
      analysis += `✅ **MACD**: Shows a bullish crossover, providing a positive signal that may counter the overall trend.\n\n`
    } else {
      analysis += `✅ **MACD**: Shows a bullish crossover, confirming the positive momentum shift.\n\n`
    }
  } else if (swingAnalysis.macdSignal === 'Bearish') {
    if (hasConflictingSignals) {
      analysis += `❌ **MACD**: Indicates a bearish crossover, creating a conflicting signal with the overall trend.\n\n`
    } else {
      analysis += `❌ **MACD**: Indicates a bearish crossover, suggesting momentum is shifting to the downside.\n\n`
    }
  } else {
    analysis += `➖ **MACD**: Signals are neutral at this time.\n\n`
  }

  // Add Golden Cross/Death Cross information
  if (swingAnalysis.goldenCrossSignal === 'Golden Cross') {
    analysis += `🌟 **Golden Cross**: SMA20 has crossed above SMA50, indicating a strong bullish signal and potential upward trend acceleration.\n\n`
  } else if (swingAnalysis.goldenCrossSignal === 'Death Cross') {
    analysis += `💀 **Death Cross**: SMA20 has crossed below SMA50, indicating a strong bearish signal and potential downward trend acceleration.\n\n`
  }

  // Use actual support/resistance data
  if (swingAnalysis.supportResistance === 'Near Support') {
    analysis += `🛡️ **Support/Resistance**: Price is currently testing a key support level, which could provide a springboard for higher prices if it holds.\n\n`
  } else if (swingAnalysis.supportResistance === 'Near Resistance') {
    analysis += `🚧 **Support/Resistance**: Price is approaching significant resistance, which could limit upside movement unless there's a strong breakout.\n\n`
  } else {
    analysis += `📊 **Support/Resistance**: Price is trading in the middle range between support and resistance.\n\n`
  }

  // Use actual volume data
  if (swingAnalysis.hasVolumeConfirmation) {
    analysis += `📈 **Volume**: Is confirming the current move, with increased trading activity supporting the direction.\n\n`
  } else {
    analysis += `📉 **Volume**: Is not providing strong confirmation for the current move.\n\n`
  }

  // Add conflicting signals guidance
  if (hasConflictingSignals) {
    analysis += `## ⚠️ Conflicting Signals Detected\n\n`
    analysis += `The analysis shows mixed signals between trend direction and momentum indicators. In such cases:\n\n`
    analysis += `- **Wait for confirmation** before making significant trades\n`
    analysis += `- **Monitor price action** for breakout or breakdown patterns\n`
    analysis += `- **Consider smaller position sizes** due to increased uncertainty\n`
    analysis += `- **Set tighter stop losses** to limit risk exposure\n\n`
  }

  return analysis
}
