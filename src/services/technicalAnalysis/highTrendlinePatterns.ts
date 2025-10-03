import type { PriceDataPoint } from '../coingeckoApi'

export interface HighTrendlinePattern {
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
  resistanceLevel: number
  supportLevel: number
  trendlineSlope?: number
  breakoutDirection?: 'up' | 'down'
  breakoutPrice?: number
  touches: number
}

/**
 * High Trendline pattern detection utilities
 * Detects patterns where price creates a clear trendline with multiple touches
 */
export class HighTrendlinePatterns {
  /**
   * Detect High Trendline Patterns (Rising Trendlines, Falling Trendlines)
   */
  static detectHighTrendlinePatterns(
    data: PriceDataPoint[], 
    rsi: number[], 
    sma20: number[], 
    sma50: number[]
  ): HighTrendlinePattern[] {
    const patterns: HighTrendlinePattern[] = []
    const prices = data.map(d => d.price)
    const volumes = data.map(d => d.volume || 0)
    
    // Look for trendline patterns over the last 40 periods
    const lookbackPeriod = Math.min(40, data.length - 10)
    const startIndex = Math.max(15, data.length - lookbackPeriod)
    
    // Only check every 5th index to reduce overlapping detections
    for (let i = startIndex; i < data.length - 5; i += 5) {
      const window = Math.min(30, data.length - i)
      const recentData = data.slice(i - window, i + 5)
      const recentPrices = recentData.map(d => d.price)
      
      if (recentPrices.length < 15) continue
      
      // Find local highs and lows for trendline analysis
      const highs: { index: number; price: number }[] = []
      const lows: { index: number; price: number }[] = []
      
      for (let j = 3; j < recentPrices.length - 3; j++) {
        const currentPrice = recentPrices[j]
        const actualIndex = i - window + j
        
        // Local high - more strict criteria
        if (currentPrice > recentPrices[j - 1] && currentPrice > recentPrices[j - 2] && currentPrice > recentPrices[j - 3] &&
            currentPrice > recentPrices[j + 1] && currentPrice > recentPrices[j + 2] && currentPrice > recentPrices[j + 3]) {
          highs.push({ index: actualIndex, price: currentPrice })
        }
        
        // Local low - more strict criteria
        if (currentPrice < recentPrices[j - 1] && currentPrice < recentPrices[j - 2] && currentPrice < recentPrices[j - 3] &&
            currentPrice < recentPrices[j + 1] && currentPrice < recentPrices[j + 2] && currentPrice < recentPrices[j + 3]) {
          lows.push({ index: actualIndex, price: currentPrice })
        }
      }
      
      if (highs.length < 3 || lows.length < 3) continue
      
      // Check for rising trendline (support trendline)
      const risingTrendline = this.detectRisingTrendline(highs, lows, i, prices, volumes, rsi, sma20, sma50)
      if (risingTrendline) patterns.push(risingTrendline)
      
      // Check for falling trendline (resistance trendline)
      const fallingTrendline = this.detectFallingTrendline(highs, lows, i, prices, volumes, rsi, sma20, sma50)
      if (fallingTrendline) patterns.push(fallingTrendline)
    }
    
    return patterns
  }

  /**
   * Detect Rising Trendline Pattern (Support Trendline)
   */
  private static detectRisingTrendline(
    highs: { index: number; price: number }[],
    lows: { index: number; price: number }[],
    currentIndex: number,
    prices: number[],
    volumes: number[],
    rsi: number[],
    sma20: number[],
    sma50: number[]
  ): HighTrendlinePattern | null {
    if (lows.length < 3) return null
    
    // Sort lows by index to get chronological order
    const sortedLows = [...lows].sort((a, b) => a.index - b.index)
    
    // Try to find a trendline with at least 3 touches
    for (let i = 0; i < sortedLows.length - 2; i++) {
      const firstLow = sortedLows[i]
      const secondLow = sortedLows[i + 1]
      
      // Calculate the slope of the potential trendline
      const slope = (secondLow.price - firstLow.price) / (secondLow.index - firstLow.index)
      
      // Only consider positive slopes (rising trendline)
      if (slope <= 0) continue
      
      // Check if other lows also touch or are close to this trendline
      const touches: { index: number; price: number }[] = [firstLow, secondLow]
      
      for (let j = i + 2; j < sortedLows.length; j++) {
        const testLow = sortedLows[j]
        const expectedPrice = firstLow.price + slope * (testLow.index - firstLow.index)
        const priceDifference = Math.abs(testLow.price - expectedPrice)
        const tolerance = expectedPrice * 0.02 // 2% tolerance
        
        if (priceDifference <= tolerance) {
          touches.push(testLow)
        }
      }
      
      // Need at least 3 touches for a valid trendline
      if (touches.length < 3) continue
      
      // Calculate trendline levels
      const currentPrice = prices[currentIndex]
      const trendlineAtCurrent = firstLow.price + slope * (currentIndex - firstLow.index)
      const supportLevel = trendlineAtCurrent
      
      // Find the highest high between the trendline touches for resistance
      const startIndex = Math.min(...touches.map(t => t.index))
      const endIndex = Math.max(...touches.map(t => t.index))
      const highsInRange = highs.filter(h => h.index >= startIndex && h.index <= endIndex)
      const resistanceLevel = highsInRange.length > 0 ? Math.max(...highsInRange.map(h => h.price)) : currentPrice * 1.05
      
      // Check for volume confirmation
      const currentVolume = volumes[currentIndex] || 0
      const avgVolume = volumes.slice(currentIndex - 10, currentIndex).reduce((sum, vol) => sum + vol, 0) / 10
      const volumeConfirmation = currentVolume > avgVolume * 1.1
      
      // Check RSI confirmation (not overbought)
      const currentRSI = rsi[currentIndex] || 50
      const rsiConfirmation = currentRSI < 75 && currentRSI > 25
      
      // Check MA confirmation
      const currentSMA20 = sma20[currentIndex] || currentPrice
      const currentSMA50 = sma50[currentIndex] || currentPrice
      const maConfirmation = currentPrice > currentSMA20 && currentPrice > currentSMA50
      
      // Calculate confidence based on confirmations and trendline quality
      let confidence = 0.5 + (touches.length - 3) * 0.1 // More touches = higher confidence
      if (volumeConfirmation) confidence += 0.1
      if (rsiConfirmation) confidence += 0.1
      if (maConfirmation) confidence += 0.1
      
      // Bonus for strong upward slope
      if (slope > 0.01) confidence += 0.1
      
      const strength = confidence >= 0.8 ? 'strong' : confidence >= 0.7 ? 'moderate' : 'weak'
      
      // Calculate entry, stop loss, and take profit
      const entryPrice = currentPrice
      const stopLoss = supportLevel * 0.98 // 2% below trendline
      const takeProfit = resistanceLevel * 1.05 // 5% above resistance
      const risk = entryPrice - stopLoss
      const reward = takeProfit - entryPrice
      const riskRewardRatio = risk > 0 ? reward / risk : 0
      
      return {
        index: currentIndex,
        pattern: 'Rising Trendline',
        signal: 'bullish',
        confidence: Math.min(confidence, 1.0),
        strength,
        volumeConfirmation,
        rsiConfirmation,
        maConfirmation,
        description: `Rising support trendline with ${touches.length} touches. Slope: ${(slope * 100).toFixed(2)}%. ${volumeConfirmation ? 'Volume confirmed.' : ''} ${rsiConfirmation ? 'RSI favorable.' : ''} ${maConfirmation ? 'Above MAs.' : ''}`,
        entryPrice,
        stopLoss,
        takeProfit,
        riskRewardRatio,
        resistanceLevel,
        supportLevel: supportLevel,
        trendlineSlope: slope,
        breakoutDirection: 'up',
        breakoutPrice: resistanceLevel,
        touches: touches.length
      }
    }
    
    return null
  }

  /**
   * Detect Falling Trendline Pattern (Resistance Trendline)
   */
  private static detectFallingTrendline(
    highs: { index: number; price: number }[],
    lows: { index: number; price: number }[],
    currentIndex: number,
    prices: number[],
    volumes: number[],
    rsi: number[],
    sma20: number[],
    sma50: number[]
  ): HighTrendlinePattern | null {
    if (highs.length < 3) return null
    
    // Sort highs by index to get chronological order
    const sortedHighs = [...highs].sort((a, b) => a.index - b.index)
    
    // Try to find a trendline with at least 3 touches
    for (let i = 0; i < sortedHighs.length - 2; i++) {
      const firstHigh = sortedHighs[i]
      const secondHigh = sortedHighs[i + 1]
      
      // Calculate the slope of the potential trendline
      const slope = (secondHigh.price - firstHigh.price) / (secondHigh.index - firstHigh.index)
      
      // Only consider negative slopes (falling trendline)
      if (slope >= 0) continue
      
      // Check if other highs also touch or are close to this trendline
      const touches: { index: number; price: number }[] = [firstHigh, secondHigh]
      
      for (let j = i + 2; j < sortedHighs.length; j++) {
        const testHigh = sortedHighs[j]
        const expectedPrice = firstHigh.price + slope * (testHigh.index - firstHigh.index)
        const priceDifference = Math.abs(testHigh.price - expectedPrice)
        const tolerance = expectedPrice * 0.02 // 2% tolerance
        
        if (priceDifference <= tolerance) {
          touches.push(testHigh)
        }
      }
      
      // Need at least 3 touches for a valid trendline
      if (touches.length < 3) continue
      
      // Calculate trendline levels
      const currentPrice = prices[currentIndex]
      const trendlineAtCurrent = firstHigh.price + slope * (currentIndex - firstHigh.index)
      const resistanceLevel = trendlineAtCurrent
      
      // Find the lowest low between the trendline touches for support
      const startIndex = Math.min(...touches.map(t => t.index))
      const endIndex = Math.max(...touches.map(t => t.index))
      const lowsInRange = lows.filter(l => l.index >= startIndex && l.index <= endIndex)
      const supportLevel = lowsInRange.length > 0 ? Math.min(...lowsInRange.map(l => l.price)) : currentPrice * 0.95
      
      // Check for volume confirmation
      const currentVolume = volumes[currentIndex] || 0
      const avgVolume = volumes.slice(currentIndex - 10, currentIndex).reduce((sum, vol) => sum + vol, 0) / 10
      const volumeConfirmation = currentVolume > avgVolume * 1.1
      
      // Check RSI confirmation (not oversold)
      const currentRSI = rsi[currentIndex] || 50
      const rsiConfirmation = currentRSI > 25 && currentRSI < 75
      
      // Check MA confirmation
      const currentSMA20 = sma20[currentIndex] || currentPrice
      const currentSMA50 = sma50[currentIndex] || currentPrice
      const maConfirmation = currentPrice < currentSMA20 && currentPrice < currentSMA50
      
      // Calculate confidence based on confirmations and trendline quality
      let confidence = 0.5 + (touches.length - 3) * 0.1 // More touches = higher confidence
      if (volumeConfirmation) confidence += 0.1
      if (rsiConfirmation) confidence += 0.1
      if (maConfirmation) confidence += 0.1
      
      // Bonus for strong downward slope
      if (slope < -0.01) confidence += 0.1
      
      const strength = confidence >= 0.8 ? 'strong' : confidence >= 0.7 ? 'moderate' : 'weak'
      
      // Calculate entry, stop loss, and take profit
      const entryPrice = currentPrice
      const stopLoss = resistanceLevel * 1.02 // 2% above trendline
      const takeProfit = supportLevel * 0.95 // 5% below support
      const risk = stopLoss - entryPrice
      const reward = entryPrice - takeProfit
      const riskRewardRatio = risk > 0 ? reward / risk : 0
      
      return {
        index: currentIndex,
        pattern: 'Falling Trendline',
        signal: 'bearish',
        confidence: Math.min(confidence, 1.0),
        strength,
        volumeConfirmation,
        rsiConfirmation,
        maConfirmation,
        description: `Falling resistance trendline with ${touches.length} touches. Slope: ${(slope * 100).toFixed(2)}%. ${volumeConfirmation ? 'Volume confirmed.' : ''} ${rsiConfirmation ? 'RSI favorable.' : ''} ${maConfirmation ? 'Below MAs.' : ''}`,
        entryPrice,
        stopLoss,
        takeProfit,
        riskRewardRatio,
        resistanceLevel,
        supportLevel,
        trendlineSlope: slope,
        breakoutDirection: 'down',
        breakoutPrice: supportLevel,
        touches: touches.length
      }
    }
    
    return null
  }
}
