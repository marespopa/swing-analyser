import type { SummaryGeneratorParams } from './types'
import type { TechnicalAnalysisData } from '../../services/coingeckoApi'

export const generateSummary = ({
  coinInfo,
  tradingRecommendation,
  analysis
}: SummaryGeneratorParams): string => {
  if (!coinInfo || !tradingRecommendation) return ''

  // Generate new structured summary format
  return generateStructuredSummary({
    coinInfo,
    tradingRecommendation,
    analysis
  })
}

// Generate structured summary in the new format
const generateStructuredSummary = ({
  coinInfo,
  tradingRecommendation,
  analysis
}: SummaryGeneratorParams): string => {
  const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
  const rsi = analysis.rsi[analysis.rsi.length - 1] || 50
  const ema9 = analysis.ema9?.[analysis.ema9.length - 1] || 0
  const ema20 = analysis.ema20?.[analysis.ema20.length - 1] || 0
  const ema50 = analysis.ema50?.[analysis.ema50.length - 1] || 0
  
  // Determine signal type and emoji
  const bearishEMA = currentPrice < ema9 && ema9 < ema20 && ema20 < ema50
  
  let signalType = 'Long Setup Alert'
  let signalEmoji = '🚀'
  
  if (bearishEMA && rsi > 30) {
    signalType = 'Short Setup Alert'
    signalEmoji = '📉'
  } else if (rsi < 30) {
    signalType = 'Long Setup Alert'
    signalEmoji = '🚀'
  } else if (rsi > 70) {
    signalType = 'Short Setup Alert'
    signalEmoji = '📉'
  }
  
  // Get market data
  const priceData = analysis.data
  const recentData = priceData.slice(-24)
  const validHighs = recentData.map(d => d.high).filter(h => h !== undefined && !isNaN(h)) as number[]
  const validLows = recentData.map(d => d.low).filter(l => l !== undefined && !isNaN(l)) as number[]
  
  const high24h = validHighs.length > 0 ? Math.max(...validHighs) : currentPrice
  const low24h = validLows.length > 0 ? Math.min(...validLows) : currentPrice
  const volume24h = recentData.reduce((sum, d) => sum + (d.volume || 0), 0)
  
  // Calculate support and resistance levels
  const supportLevels = calculateSupportLevels(analysis, currentPrice)
  const resistanceLevels = calculateResistanceLevels(analysis, currentPrice)
  
  // Calculate trade setup
  const tradeSetup = calculateTradeSetup(analysis, currentPrice, signalType)
  
  // Generate invalidation conditions
  const invalidation = generateInvalidationConditions(analysis, currentPrice, signalType)
  
  // Generate summary text
  const summaryText = generateSummaryText(analysis, tradingRecommendation, signalType)
  
  // Format the complete summary with markdown
  return `# ${signalEmoji} ${coinInfo.symbol.toUpperCase()} ${signalType}

${generateMarketDescription(analysis, tradingRecommendation, signalType)}

## 📊 Market Snapshot

| Metric | Value |
|--------|-------|
| **Timeframe Analyzed** | ${analysis.interval} |
| **Current Price** | ${currentPrice.toFixed(5)} |
| **24h High** | ${high24h.toFixed(5)} |
| **24h Low** | ${low24h.toFixed(5)} |
| **Volume** | ${volume24h > 0 ? `${(volume24h / 1000000).toFixed(2)}M` : 'N/A'} ${coinInfo.symbol.toUpperCase()} |

## 📌 Key Levels to Watch

**Support:** ${supportLevels.join(', ')}

**Resistance:** ${resistanceLevels.join(', ')}

## 🎯 Trade Setup

| Level | Price |
|-------|-------|
| **Entry Zone** | ${tradeSetup.entryZone} |
| **TP1** | ${tradeSetup.tp1} |
| **TP2** | ${tradeSetup.tp2} |
| **TP3** | ${tradeSetup.tp3} |
| **SL** | ${tradeSetup.sl} |

## ⚠ Invalidation

${invalidation}

## ✨ Summary

${summaryText}

---
*Tags: #${coinInfo.symbol.toUpperCase()} #${coinInfo.name} #Binance*`
}

// Helper functions for the structured summary
const calculateSupportLevels = (analysis: TechnicalAnalysisData, currentPrice: number): string[] => {
  const levels: number[] = []
  
  // Add EMA levels as support
  if (analysis.ema20 && analysis.ema20.length > 0) {
    levels.push(analysis.ema20[analysis.ema20.length - 1])
  }
  if (analysis.ema50 && analysis.ema50.length > 0) {
    levels.push(analysis.ema50[analysis.ema50.length - 1])
  }
  
  // Add Bollinger Bands lower level
  if (analysis.bollingerBands && analysis.bollingerBands.lower.length > 0) {
    levels.push(analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1])
  }
  
  // Add recent lows
  const recentData = analysis.data.slice(-20)
  const recentLows = recentData.map(d => d.low).filter(l => l !== undefined).sort((a, b) => (a || 0) - (b || 0))
  if (recentLows[0] !== undefined) levels.push(recentLows[0]) // Lowest recent low
  if (recentLows.length > 1 && recentLows[1] !== undefined) {
    levels.push(recentLows[1]) // Second lowest
  }
  
  // Add Fibonacci levels if available
  if (analysis.fibonacciLevels) {
    levels.push(analysis.fibonacciLevels.level382)
    levels.push(analysis.fibonacciLevels.level618)
  }
  
  // Filter and sort levels below current price
  const supportLevels = levels
    .filter(level => level < currentPrice)
    .sort((a, b) => b - a) // Sort descending
    .slice(0, 4) // Take top 4
    .map(level => level.toFixed(5))
  
  return supportLevels.length > 0 ? supportLevels : [currentPrice.toFixed(5)]
}

const calculateResistanceLevels = (analysis: TechnicalAnalysisData, currentPrice: number): string[] => {
  const levels: number[] = []
  
  // Add EMA levels as resistance
  if (analysis.ema9 && analysis.ema9.length > 0) {
    levels.push(analysis.ema9[analysis.ema9.length - 1])
  }
  
  // Add Bollinger Bands upper level
  if (analysis.bollingerBands && analysis.bollingerBands.upper.length > 0) {
    levels.push(analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1])
  }
  
  // Add recent highs
  const recentData = analysis.data.slice(-20)
  const recentHighs = recentData.map(d => d.high).filter(h => h !== undefined).sort((a, b) => (b || 0) - (a || 0))
  if (recentHighs[0] !== undefined) levels.push(recentHighs[0]) // Highest recent high
  if (recentHighs.length > 1 && recentHighs[1] !== undefined) {
    levels.push(recentHighs[1]) // Second highest
  }
  
  // Add Fibonacci levels if available
  if (analysis.fibonacciLevels) {
    levels.push(analysis.fibonacciLevels.level618)
    levels.push(analysis.fibonacciLevels.level382)
  }
  
  // Filter and sort levels above current price
  const resistanceLevels = levels
    .filter(level => level > currentPrice)
    .sort((a, b) => a - b) // Sort ascending
    .slice(0, 4) // Take top 4
    .map(level => level.toFixed(5))
  
  return resistanceLevels.length > 0 ? resistanceLevels : [(currentPrice * 1.05).toFixed(5)]
}

const calculateTradeSetup = (analysis: TechnicalAnalysisData, currentPrice: number, signalType: string) => {
  const atr = analysis.atr?.[analysis.atr.length - 1] || currentPrice * 0.02
  
  let entryZone: string
  let tp1: string
  let tp2: string
  let tp3: string
  let sl: string
  
  if (signalType.includes('Long')) {
    // Long setup
    const entryLow = (currentPrice - atr * 0.5).toFixed(5)
    const entryHigh = (currentPrice + atr * 0.2).toFixed(5)
    entryZone = `${entryLow} to ${entryHigh}`
    
    tp1 = (currentPrice + atr * 1.5).toFixed(5)
    tp2 = (currentPrice + atr * 2.5).toFixed(5)
    tp3 = (currentPrice + atr * 3.5).toFixed(5)
    sl = (currentPrice - atr * 1.2).toFixed(5)
  } else {
    // Short setup
    const entryLow = (currentPrice - atr * 0.2).toFixed(5)
    const entryHigh = (currentPrice + atr * 0.5).toFixed(5)
    entryZone = `${entryLow} to ${entryHigh}`
    
    tp1 = (currentPrice - atr * 1.5).toFixed(5)
    tp2 = (currentPrice - atr * 2.5).toFixed(5)
    tp3 = (currentPrice - atr * 3.5).toFixed(5)
    sl = (currentPrice + atr * 1.2).toFixed(5)
  }
  
  return { entryZone, tp1, tp2, tp3, sl }
}

const generateInvalidationConditions = (analysis: TechnicalAnalysisData, currentPrice: number, signalType: string): string => {
  const atr = analysis.atr?.[analysis.atr.length - 1] || currentPrice * 0.02
  const invalidationLevel = signalType.includes('Long') 
    ? (currentPrice - atr * 1.2).toFixed(5)
    : (currentPrice + atr * 1.2).toFixed(5)
  
  const supportLevel = analysis.ema20?.[analysis.ema20.length - 1] || currentPrice * 0.98
  
  if (signalType.includes('Long')) {
    return `Setup invalid if a ${analysis.interval} close occurs below ${invalidationLevel} or price loses ${supportLevel.toFixed(5)} and fails to reclaim it on the retest.`
  } else {
    return `Setup invalid if a ${analysis.interval} close occurs above ${invalidationLevel} or price breaks ${supportLevel.toFixed(5)} and fails to reclaim it on the retest.`
  }
}

const generateMarketDescription = (analysis: TechnicalAnalysisData, _tradingRecommendation: any, signalType: string): string => {
  if (signalType.includes('Long')) {
    return `**${analysis.interval.toUpperCase()}** shows steady bullish structure, higher lows and a reclaim above key support. With momentum building, a move toward recent highs looks probable.`
  } else {
    return `**${analysis.interval.toUpperCase()}** shows bearish structure, lower highs and a break below key support. With selling pressure building, a move toward recent lows looks probable.`
  }
}

const generateSummaryText = (analysis: TechnicalAnalysisData, _tradingRecommendation: any, signalType: string): string => {
  const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
  const atr = analysis.atr?.[analysis.atr.length - 1] || currentPrice * 0.02
  
  if (signalType.includes('Long')) {
    const supportLevel = analysis.ema20?.[analysis.ema20.length - 1] || currentPrice * 0.98
    const targetLevel = (currentPrice + atr * 2.5).toFixed(5)
    return `Bull continuation favored. As long as price holds above ${supportLevel.toFixed(5)}, the path toward ${targetLevel} remains in play. Watch for a clean break and retest of key resistance with rising volume.`
  } else {
    const resistanceLevel = analysis.ema20?.[analysis.ema20.length - 1] || currentPrice * 1.02
    const targetLevel = (currentPrice - atr * 2.5).toFixed(5)
    return `Bear continuation favored. As long as price holds below ${resistanceLevel.toFixed(5)}, the path toward ${targetLevel} remains in play. Watch for a clean break and retest of key support with rising volume.`
  }
}

// Re-export types for convenience
export * from './types'
