import type { PriceDataPoint } from '../coingeckoApi'

export interface DoublePattern {
  index: number
  pattern: string
  signal: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  strength: 'weak' | 'moderate' | 'strong'
  volumeConfirmation?: boolean
  rsiConfirmation?: boolean
  maConfirmation?: boolean
  description: string
  entryPrice?: number
  stopLoss?: number
  takeProfit?: number
  riskRewardRatio?: number
  firstPeak: { index: number; price: number }
  secondPeak: { index: number; price: number }
  supportLevel: number
  targetPrice?: number
}

/**
 * Double pattern detection utilities (Double Top, Double Bottom)
 */
export class DoublePatterns {
  /**
   * Detect Double Top and Double Bottom Patterns
   */
  static detectDoublePatterns(
    data: PriceDataPoint[],
    rsi: number[],
    sma20: number[],
    sma50: number[]
  ): DoublePattern[] {
    const patterns: DoublePattern[] = []
    const prices = data.map(d => d.price)
    const volumes = data.map(d => d.volume || 0)
    
    // Look for double patterns over the last 25 periods (reduced from 40)
    const lookbackPeriod = Math.min(25, data.length - 10)
    const startIndex = Math.max(15, data.length - lookbackPeriod)
    
    // Only check every 3rd index to reduce overlapping detections
    for (let i = startIndex; i < data.length - 5; i += 3) {
      const window = 25
      const recentData = data.slice(i - window, i + 5)
      const recentPrices = recentData.map(d => d.price)
      
      if (recentPrices.length < 15) continue
      
      // Find local highs and lows
      const highs: { index: number; price: number }[] = []
      const lows: { index: number; price: number }[] = []
      
      for (let j = 2; j < recentPrices.length - 2; j++) {
        const currentPrice = recentPrices[j]
        const actualIndex = i - window + j
        
        // Local high
        if (currentPrice > recentPrices[j - 1] && currentPrice > recentPrices[j - 2] &&
            currentPrice > recentPrices[j + 1] && currentPrice > recentPrices[j + 2]) {
          highs.push({ index: actualIndex, price: currentPrice })
        }
        
        // Local low
        if (currentPrice < recentPrices[j - 1] && currentPrice < recentPrices[j - 2] &&
            currentPrice < recentPrices[j + 1] && currentPrice < recentPrices[j + 2]) {
          lows.push({ index: actualIndex, price: currentPrice })
        }
      }
      
      if (highs.length < 2) continue
      
      // Check for double top first
      const doubleTop = this.detectDoubleTop(highs, i, prices, volumes, rsi, sma20, sma50)
      
      if (lows.length < 2) {
        // If we have a double top but no lows, add it
        if (doubleTop) patterns.push(doubleTop)
        continue
      }
      
      // Check for double bottom
      const doubleBottom = this.detectDoubleBottom(lows, i, prices, volumes, rsi, sma20, sma50)
      
      // Only add one pattern per time window to avoid contradictory signals
      if (doubleTop && doubleBottom) {
        // If both are detected, choose the one with higher confidence
        if (doubleTop.confidence >= doubleBottom.confidence) {
          patterns.push(doubleTop)
        } else {
          patterns.push(doubleBottom)
        }
      } else if (doubleTop) {
        patterns.push(doubleTop)
      } else if (doubleBottom) {
        patterns.push(doubleBottom)
      }
    }
    
    return patterns
  }

  /**
   * Detect Double Top Pattern
   */
  private static detectDoubleTop(
    highs: { index: number; price: number }[],
    currentIndex: number,
    prices: number[],
    volumes: number[],
    rsi: number[],
    sma20: number[],
    sma50: number[]
  ): DoublePattern | null {
    if (highs.length < 2) return null
    
    // Sort by index
    const sortedHighs = highs.sort((a, b) => a.index - b.index)
    
    // Look for two peaks that are roughly equal height
    for (let i = 0; i < sortedHighs.length - 1; i++) {
      const firstPeak = sortedHighs[i]
      const secondPeak = sortedHighs[i + 1]
      
      // Check if peaks are roughly equal height (within 2% - stricter)
      const heightDiff = Math.abs(firstPeak.price - secondPeak.price) / Math.max(firstPeak.price, secondPeak.price)
      if (heightDiff > 0.02) continue
      
      // Check if there's a reasonable time gap between peaks (at least 7 periods)
      if (secondPeak.index - firstPeak.index < 7) continue
      
      // Additional validation: ensure significant price movement between peaks
      const supportLevel = Math.min(...prices.slice(firstPeak.index, secondPeak.index + 1))
      const peakHeight = Math.max(firstPeak.price, secondPeak.price)
      const valleyDepth = (peakHeight - supportLevel) / peakHeight
      if (valleyDepth < 0.03) continue // At least 3% valley depth
      
      // Check for volume confirmation (decreasing volume on second peak)
      const firstVolume = volumes[firstPeak.index] || 0
      const secondVolume = volumes[secondPeak.index] || 0
      const volumeConfirmation = secondVolume < firstVolume * 0.8
      
      // Check RSI confirmation (overbought at peaks)
      const firstRSI = rsi[firstPeak.index] || 50
      const secondRSI = rsi[secondPeak.index] || 50
      const rsiConfirmation = firstRSI > 70 && secondRSI > 70
      
      // Check MA confirmation
      const currentPrice = prices[currentIndex]
      const currentSMA20 = sma20[currentIndex] || currentPrice
      const currentSMA50 = sma50[currentIndex] || currentPrice
      const maConfirmation = currentPrice < currentSMA20 && currentPrice < currentSMA50
      
      let confidence = 0.6
      if (volumeConfirmation) confidence += 0.1
      if (rsiConfirmation) confidence += 0.1
      if (maConfirmation) confidence += 0.1
      
      const strength = confidence >= 0.8 ? 'strong' : confidence >= 0.7 ? 'moderate' : 'weak'
      
      const entryPrice = currentPrice
      const stopLoss = Math.max(firstPeak.price, secondPeak.price) * 1.02
      const targetPrice = supportLevel - (Math.max(firstPeak.price, secondPeak.price) - supportLevel)
      const takeProfit = targetPrice
      const risk = stopLoss - entryPrice
      const reward = entryPrice - takeProfit
      const riskRewardRatio = risk > 0 ? reward / risk : 0
      
      return {
        index: currentIndex,
        pattern: 'Double Top',
        signal: 'bearish',
        confidence: Math.min(confidence, 1.0),
        strength,
        volumeConfirmation,
        rsiConfirmation,
        maConfirmation,
        description: `Double top pattern with peaks at ${firstPeak.price.toFixed(2)} and ${secondPeak.price.toFixed(2)}. ${volumeConfirmation ? 'Volume confirmed.' : ''} ${rsiConfirmation ? 'RSI overbought.' : ''} ${maConfirmation ? 'Below MAs.' : ''}`,
        entryPrice,
        stopLoss,
        takeProfit,
        riskRewardRatio,
        firstPeak,
        secondPeak,
        supportLevel,
        targetPrice
      }
    }
    
    return null
  }

  /**
   * Detect Double Bottom Pattern
   */
  private static detectDoubleBottom(
    lows: { index: number; price: number }[],
    currentIndex: number,
    prices: number[],
    volumes: number[],
    rsi: number[],
    sma20: number[],
    sma50: number[]
  ): DoublePattern | null {
    if (lows.length < 2) return null
    
    const sortedLows = lows.sort((a, b) => a.index - b.index)
    
    for (let i = 0; i < sortedLows.length - 1; i++) {
      const firstBottom = sortedLows[i]
      const secondBottom = sortedLows[i + 1]
      
      // Check if bottoms are roughly equal height (within 3%)
      const heightDiff = Math.abs(firstBottom.price - secondBottom.price) / Math.max(firstBottom.price, secondBottom.price)
      if (heightDiff > 0.03) continue
      
      // Check time gap
      if (secondBottom.index - firstBottom.index < 5) continue
      
      // Calculate resistance level (highest point between bottoms)
      const resistanceLevel = Math.max(...prices.slice(firstBottom.index, secondBottom.index + 1))
      
      // Check for volume confirmation (increasing volume on second bottom)
      const firstVolume = volumes[firstBottom.index] || 0
      const secondVolume = volumes[secondBottom.index] || 0
      const volumeConfirmation = secondVolume > firstVolume * 1.2
      
      // Check RSI confirmation (oversold at bottoms)
      const firstRSI = rsi[firstBottom.index] || 50
      const secondRSI = rsi[secondBottom.index] || 50
      const rsiConfirmation = firstRSI < 30 && secondRSI < 30
      
      // Check MA confirmation
      const currentPrice = prices[currentIndex]
      const currentSMA20 = sma20[currentIndex] || currentPrice
      const currentSMA50 = sma50[currentIndex] || currentPrice
      const maConfirmation = currentPrice > currentSMA20 && currentPrice > currentSMA50
      
      let confidence = 0.6
      if (volumeConfirmation) confidence += 0.1
      if (rsiConfirmation) confidence += 0.1
      if (maConfirmation) confidence += 0.1
      
      const strength = confidence >= 0.8 ? 'strong' : confidence >= 0.7 ? 'moderate' : 'weak'
      
      const entryPrice = currentPrice
      const stopLoss = Math.min(firstBottom.price, secondBottom.price) * 0.98
      const targetPrice = resistanceLevel + (resistanceLevel - Math.min(firstBottom.price, secondBottom.price))
      const takeProfit = targetPrice
      const risk = entryPrice - stopLoss
      const reward = takeProfit - entryPrice
      const riskRewardRatio = risk > 0 ? reward / risk : 0
      
      return {
        index: currentIndex,
        pattern: 'Double Bottom',
        signal: 'bullish',
        confidence: Math.min(confidence, 1.0),
        strength,
        volumeConfirmation,
        rsiConfirmation,
        maConfirmation,
        description: `Double bottom pattern with bottoms at ${firstBottom.price.toFixed(2)} and ${secondBottom.price.toFixed(2)}. ${volumeConfirmation ? 'Volume confirmed.' : ''} ${rsiConfirmation ? 'RSI oversold.' : ''} ${maConfirmation ? 'Above MAs.' : ''}`,
        entryPrice,
        stopLoss,
        takeProfit,
        riskRewardRatio,
        firstPeak: firstBottom,
        secondPeak: secondBottom,
        supportLevel: Math.min(firstBottom.price, secondBottom.price),
        targetPrice
      }
    }
    
    return null
  }
}
