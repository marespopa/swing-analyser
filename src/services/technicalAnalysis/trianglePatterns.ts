import type { PriceDataPoint } from '../coingeckoApi'

export interface TrianglePattern {
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
  breakoutDirection?: 'up' | 'down'
  breakoutPrice?: number
}

/**
 * Triangle pattern detection utilities
 */
export class TrianglePatterns {
  /**
   * Detect Triangle Patterns (Ascending, Descending, Symmetrical)
   */
  static detectTrianglePatterns(
    data: PriceDataPoint[], 
    rsi: number[], 
    sma20: number[], 
    sma50: number[]
  ): TrianglePattern[] {
    const patterns: TrianglePattern[] = []
    const prices = data.map(d => d.price)
    const volumes = data.map(d => d.volume || 0)
    
    // Look for triangle patterns over the last 20 days (more lenient for Bitcoin)
    const lookbackPeriod = Math.min(20, data.length - 3)
    const startIndex = Math.max(3, data.length - lookbackPeriod)
    
    // Check every index for better pattern detection
    for (let i = startIndex; i < data.length - 2; i += 1) {
      const window = Math.min(15, data.length - i)
      const recentData = data.slice(i - window, i + 2)
      const recentPrices = recentData.map(d => d.price)
      
      if (recentPrices.length < 8) continue
      
      // Find local highs and lows in the window
      const highs: { index: number; price: number }[] = []
      const lows: { index: number; price: number }[] = []
      
      for (let j = 2; j < recentPrices.length - 2; j++) {
        const currentPrice = recentPrices[j]
        const actualIndex = i - window + j
        
        // Local high - more sensitive detection
        if (currentPrice > recentPrices[j - 1] && currentPrice > recentPrices[j + 1]) {
          highs.push({ index: actualIndex, price: currentPrice })
        }
        
        // Local low - more sensitive detection
        if (currentPrice < recentPrices[j - 1] && currentPrice < recentPrices[j + 1]) {
          lows.push({ index: actualIndex, price: currentPrice })
        }
      }
      
      if (highs.length < 1 || lows.length < 1) continue
      
      // Check for ascending triangle (higher lows, constant highs)
      const ascendingTriangle = this.detectAscendingTriangle(highs, lows, i, prices, volumes, rsi, sma20, sma50)
      if (ascendingTriangle) patterns.push(ascendingTriangle)
      
      // Check for descending triangle (lower highs, constant lows)
      const descendingTriangle = this.detectDescendingTriangle(highs, lows, i, prices, volumes, rsi, sma20, sma50)
      if (descendingTriangle) patterns.push(descendingTriangle)
      
      // Check for symmetrical triangle (converging highs and lows)
      const symmetricalTriangle = this.detectSymmetricalTriangle(highs, lows, i, prices, volumes, rsi, sma20, sma50)
      if (symmetricalTriangle) patterns.push(symmetricalTriangle)
    }
    
    return patterns
  }

  /**
   * Detect Ascending Triangle Pattern
   */
  private static detectAscendingTriangle(
    highs: { index: number; price: number }[],
    lows: { index: number; price: number }[],
    currentIndex: number,
    prices: number[],
    volumes: number[],
    rsi: number[],
    sma20: number[],
    sma50: number[]
  ): TrianglePattern | null {
    if (highs.length < 2 || lows.length < 2) return null
    
    // Sort by index to get chronological order
    const sortedHighs = [...highs].sort((a, b) => a.index - b.index)
    const sortedLows = [...lows].sort((a, b) => a.index - b.index)
    
    // Check if we have at least 2 highs and 2 lows
    if (sortedHighs.length < 2 || sortedLows.length < 2) return null
    
    // Get the most recent highs and lows
    const recentHighs = sortedHighs.slice(-2)
    const recentLows = sortedLows.slice(-2)
    
    // Check for ascending triangle characteristics
    const resistanceLevel = (recentHighs[0].price + recentHighs[1].price) / 2
    const resistanceTolerance = resistanceLevel * 0.015 // 1.5% tolerance (stricter)
    
    // Check if highs are relatively constant (within 1.5% tolerance)
    const highsConstant = Math.abs(recentHighs[0].price - recentHighs[1].price) <= resistanceTolerance
    
    // Check if lows are ascending with meaningful difference
    const lowsAscending = recentLows[1].price > recentLows[0].price * 1.01 // At least 1% higher
    
    // Additional validation: ensure there's enough price movement
    const priceRange = resistanceLevel - recentLows[0].price
    const minRange = resistanceLevel * 0.05 // At least 5% range
    
    if (!highsConstant || !lowsAscending || priceRange < minRange) return null
    
    // Calculate support level (trendline through lows)
    const supportLevel = recentLows[0].price
    
    // Check for volume confirmation
    const currentVolume = volumes[currentIndex] || 0
    const avgVolume = volumes.slice(currentIndex - 10, currentIndex).reduce((sum, vol) => sum + vol, 0) / 10
    const volumeConfirmation = currentVolume > avgVolume * 1.2
    
    // Check RSI confirmation (not overbought)
    const currentRSI = rsi[currentIndex] || 50
    const rsiConfirmation = currentRSI < 70 && currentRSI > 30
    
    // Check MA confirmation
    const currentPrice = prices[currentIndex]
    const currentSMA20 = sma20[currentIndex] || currentPrice
    const currentSMA50 = sma50[currentIndex] || currentPrice
    const maConfirmation = currentPrice > currentSMA20 && currentPrice > currentSMA50
    
    // Calculate confidence based on confirmations
    let confidence = 0.6
    if (volumeConfirmation) confidence += 0.1
    if (rsiConfirmation) confidence += 0.1
    if (maConfirmation) confidence += 0.1
    
    const strength = confidence >= 0.8 ? 'strong' : confidence >= 0.7 ? 'moderate' : 'weak'
    
    // Calculate entry, stop loss, and take profit
    const entryPrice = currentPrice
    const stopLoss = supportLevel * 0.98 // 2% below support
    const targetPrice = resistanceLevel + (resistanceLevel - supportLevel) * 0.618 // 61.8% of triangle height
    const takeProfit = targetPrice
    const risk = entryPrice - stopLoss
    const reward = takeProfit - entryPrice
    const riskRewardRatio = risk > 0 ? reward / risk : 0
    
    return {
      index: currentIndex,
      pattern: 'Ascending Triangle',
      signal: 'bullish',
      confidence: Math.min(confidence, 1.0),
      strength,
      volumeConfirmation,
      rsiConfirmation,
      maConfirmation,
      description: `Ascending triangle with resistance at ${resistanceLevel.toFixed(2)} and ascending support. ${volumeConfirmation ? 'Volume confirmed.' : ''} ${rsiConfirmation ? 'RSI favorable.' : ''} ${maConfirmation ? 'Above MAs.' : ''}`,
      entryPrice,
      stopLoss,
      takeProfit,
      riskRewardRatio,
      resistanceLevel,
      supportLevel,
      breakoutDirection: 'up',
      breakoutPrice: resistanceLevel
    }
  }

  /**
   * Detect Descending Triangle Pattern
   */
  private static detectDescendingTriangle(
    highs: { index: number; price: number }[],
    lows: { index: number; price: number }[],
    currentIndex: number,
    prices: number[],
    volumes: number[],
    rsi: number[],
    sma20: number[],
    sma50: number[]
  ): TrianglePattern | null {
    if (highs.length < 2 || lows.length < 2) return null
    
    const sortedHighs = [...highs].sort((a, b) => a.index - b.index)
    const sortedLows = [...lows].sort((a, b) => a.index - b.index)
    
    if (sortedHighs.length < 2 || sortedLows.length < 2) return null
    
    const recentHighs = sortedHighs.slice(-2)
    const recentLows = sortedLows.slice(-2)
    
    // Check for descending triangle characteristics
    const supportLevel = (recentLows[0].price + recentLows[1].price) / 2
    const supportTolerance = supportLevel * 0.02 // 2% tolerance
    
    // Check if lows are relatively constant (within 2% tolerance)
    const lowsConstant = Math.abs(recentLows[0].price - recentLows[1].price) <= supportTolerance
    
    // Check if highs are descending
    const highsDescending = recentHighs[1].price < recentHighs[0].price
    
    if (!lowsConstant || !highsDescending) return null
    
    const resistanceLevel = recentHighs[0].price
    
    // Check for volume confirmation
    const currentVolume = volumes[currentIndex] || 0
    const avgVolume = volumes.slice(currentIndex - 10, currentIndex).reduce((sum, vol) => sum + vol, 0) / 10
    const volumeConfirmation = currentVolume > avgVolume * 1.2
    
    // Check RSI confirmation (not oversold)
    const currentRSI = rsi[currentIndex] || 50
    const rsiConfirmation = currentRSI > 30 && currentRSI < 70
    
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
    const stopLoss = resistanceLevel * 1.02 // 2% above resistance
    const targetPrice = supportLevel - (resistanceLevel - supportLevel) * 0.618
    const takeProfit = targetPrice
    const risk = stopLoss - entryPrice
    const reward = entryPrice - takeProfit
    const riskRewardRatio = risk > 0 ? reward / risk : 0
    
    return {
      index: currentIndex,
      pattern: 'Descending Triangle',
      signal: 'bearish',
      confidence: Math.min(confidence, 1.0),
      strength,
      volumeConfirmation,
      rsiConfirmation,
      maConfirmation,
      description: `Descending triangle with support at ${supportLevel.toFixed(2)} and descending resistance. ${volumeConfirmation ? 'Volume confirmed.' : ''} ${rsiConfirmation ? 'RSI favorable.' : ''} ${maConfirmation ? 'Below MAs.' : ''}`,
      entryPrice,
      stopLoss,
      takeProfit,
      riskRewardRatio,
      resistanceLevel,
      supportLevel,
      breakoutDirection: 'down',
      breakoutPrice: supportLevel
    }
  }

  /**
   * Detect Symmetrical Triangle Pattern
   */
  private static detectSymmetricalTriangle(
    highs: { index: number; price: number }[],
    lows: { index: number; price: number }[],
    currentIndex: number,
    prices: number[],
    volumes: number[],
    rsi: number[],
    sma20: number[],
    _sma50: number[]
  ): TrianglePattern | null {
    if (highs.length < 2 || lows.length < 2) return null
    
    const sortedHighs = [...highs].sort((a, b) => a.index - b.index)
    const sortedLows = [...lows].sort((a, b) => a.index - b.index)
    
    if (sortedHighs.length < 2 || sortedLows.length < 2) return null
    
    const recentHighs = sortedHighs.slice(-2)
    const recentLows = sortedLows.slice(-2)
    
    // Check for symmetrical triangle characteristics
    const highSlope = (recentHighs[1].price - recentHighs[0].price) / (recentHighs[1].index - recentHighs[0].index)
    const lowSlope = (recentLows[1].price - recentLows[0].price) / (recentLows[1].index - recentLows[0].index)
    
    // Highs should be descending, lows should be ascending
    const highsDescending = highSlope < -0.001 // Small negative slope
    const lowsAscending = lowSlope > 0.001 // Small positive slope
    
    if (!highsDescending || !lowsAscending) return null
    
    const resistanceLevel = recentHighs[0].price
    const supportLevel = recentLows[0].price
    
    // Check for volume confirmation
    const currentVolume = volumes[currentIndex] || 0
    const avgVolume = volumes.slice(currentIndex - 10, currentIndex).reduce((sum, vol) => sum + vol, 0) / 10
    const volumeConfirmation = currentVolume > avgVolume * 1.1
    
    // Check RSI confirmation (neutral zone)
    const currentRSI = rsi[currentIndex] || 50
    const rsiConfirmation = currentRSI > 40 && currentRSI < 60
    
    // Check MA confirmation
    const currentPrice = prices[currentIndex]
    const currentSMA20 = sma20[currentIndex] || currentPrice
    const maConfirmation = Math.abs(currentPrice - currentSMA20) / currentSMA20 < 0.05 // Within 5% of SMA20
    
    let confidence = 0.5
    if (volumeConfirmation) confidence += 0.1
    if (rsiConfirmation) confidence += 0.1
    if (maConfirmation) confidence += 0.1
    
    const strength = confidence >= 0.7 ? 'moderate' : 'weak'
    
    const entryPrice = currentPrice
    const triangleHeight = resistanceLevel - supportLevel
    const stopLoss = supportLevel * 0.98
    const takeProfit = resistanceLevel + triangleHeight * 0.5
    const risk = entryPrice - stopLoss
    const reward = takeProfit - entryPrice
    const riskRewardRatio = risk > 0 ? reward / risk : 0
    
    return {
      index: currentIndex,
      pattern: 'Symmetrical Triangle',
      signal: 'neutral',
      confidence: Math.min(confidence, 1.0),
      strength,
      volumeConfirmation,
      rsiConfirmation,
      maConfirmation,
      description: `Symmetrical triangle with converging trendlines. ${volumeConfirmation ? 'Volume confirmed.' : ''} ${rsiConfirmation ? 'RSI neutral.' : ''} ${maConfirmation ? 'Near MAs.' : ''}`,
      entryPrice,
      stopLoss,
      takeProfit,
      riskRewardRatio,
      resistanceLevel,
      supportLevel,
      breakoutDirection: undefined,
      breakoutPrice: undefined
    }
  }
}
