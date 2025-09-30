import type { PriceDataPoint } from '../coingeckoApi'

export interface WedgePattern {
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
  upperTrendline: { start: { index: number; price: number }; end: { index: number; price: number } }
  lowerTrendline: { start: { index: number; price: number }; end: { index: number; price: number } }
  apexIndex?: number
  targetPrice?: number
}

/**
 * Wedge pattern detection utilities (Rising Wedge, Falling Wedge)
 */
export class WedgePatterns {
  /**
   * Detect Wedge Patterns (Rising and Falling Wedges)
   */
  static detectWedgePatterns(
    data: PriceDataPoint[],
    rsi: number[],
    sma20: number[],
    sma50: number[]
  ): WedgePattern[] {
    const patterns: WedgePattern[] = []
    const prices = data.map(d => d.price)
    const volumes = data.map(d => d.volume || 0)
    
    // Look for wedge patterns over the last 40 periods
    const lookbackPeriod = Math.min(40, data.length - 10)
    const startIndex = Math.max(15, data.length - lookbackPeriod)
    
    for (let i = startIndex; i < data.length - 5; i++) {
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
      
      if (highs.length < 2 || lows.length < 2) continue
      
      // Check for rising wedge
      const risingWedge = this.detectRisingWedge(highs, lows, i, prices, volumes, rsi, sma20, sma50)
      if (risingWedge) patterns.push(risingWedge)
      
      // Check for falling wedge
      const fallingWedge = this.detectFallingWedge(highs, lows, i, prices, volumes, rsi, sma20, sma50)
      if (fallingWedge) patterns.push(fallingWedge)
    }
    
    return patterns
  }

  /**
   * Detect Rising Wedge Pattern (Bearish)
   */
  private static detectRisingWedge(
    highs: { index: number; price: number }[],
    lows: { index: number; price: number }[],
    currentIndex: number,
    prices: number[],
    volumes: number[],
    rsi: number[],
    sma20: number[],
    sma50: number[]
  ): WedgePattern | null {
    if (highs.length < 2 || lows.length < 2) return null
    
    const sortedHighs = highs.sort((a, b) => a.index - b.index)
    const sortedLows = lows.sort((a, b) => a.index - b.index)
    
    // Check for rising wedge: both highs and lows are rising, but converging
    const recentHighs = sortedHighs.slice(-2)
    const recentLows = sortedLows.slice(-2)
    
    if (recentHighs.length < 2 || recentLows.length < 2) return null
    
    // Check if both highs and lows are rising
    const highsRising = recentHighs[1].price > recentHighs[0].price
    const lowsRising = recentLows[1].price > recentLows[0].price
    
    if (!highsRising || !lowsRising) return null
    
    // Check if they're converging (highs rising slower than lows)
    const highSlope = (recentHighs[1].price - recentHighs[0].price) / (recentHighs[1].index - recentHighs[0].index)
    const lowSlope = (recentLows[1].price - recentLows[0].price) / (recentLows[1].index - recentLows[0].index)
    
    if (highSlope >= lowSlope) return null // Should be converging
    
    // Calculate trendlines
    const upperTrendline = {
      start: recentHighs[0],
      end: recentHighs[1]
    }
    const lowerTrendline = {
      start: recentLows[0],
      end: recentLows[1]
    }
    
    // Check for volume confirmation (decreasing volume)
    const currentVolume = volumes[currentIndex] || 0
    const avgVolume = volumes.slice(currentIndex - 10, currentIndex).reduce((sum, vol) => sum + vol, 0) / 10
    const volumeConfirmation = currentVolume < avgVolume * 0.8
    
    // Check RSI confirmation (divergence)
    const currentRSI = rsi[currentIndex] || 50
    const earlierRSI = rsi[recentHighs[0].index] || 50
    const rsiConfirmation = currentRSI < earlierRSI && recentHighs[1].price > recentHighs[0].price
    
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
    const wedgeHeight = recentHighs[1].price - recentLows[1].price
    const stopLoss = recentHighs[1].price * 1.02
    const targetPrice = recentLows[1].price - wedgeHeight
    const takeProfit = targetPrice
    const risk = stopLoss - entryPrice
    const reward = entryPrice - takeProfit
    const riskRewardRatio = risk > 0 ? reward / risk : 0
    
    return {
      index: currentIndex,
      pattern: 'Rising Wedge',
      signal: 'bearish',
      confidence: Math.min(confidence, 1.0),
      strength,
      volumeConfirmation,
      rsiConfirmation,
      maConfirmation,
      description: `Rising wedge pattern with converging trendlines. ${volumeConfirmation ? 'Volume confirmed.' : ''} ${rsiConfirmation ? 'RSI divergence.' : ''} ${maConfirmation ? 'Below MAs.' : ''}`,
      entryPrice,
      stopLoss,
      takeProfit,
      riskRewardRatio,
      upperTrendline,
      lowerTrendline,
      apexIndex: currentIndex + 5, // Estimated apex
      targetPrice
    }
  }

  /**
   * Detect Falling Wedge Pattern (Bullish)
   */
  private static detectFallingWedge(
    highs: { index: number; price: number }[],
    lows: { index: number; price: number }[],
    currentIndex: number,
    prices: number[],
    volumes: number[],
    rsi: number[],
    sma20: number[],
    sma50: number[]
  ): WedgePattern | null {
    if (highs.length < 2 || lows.length < 2) return null
    
    const sortedHighs = highs.sort((a, b) => a.index - b.index)
    const sortedLows = lows.sort((a, b) => a.index - b.index)
    
    // Check for falling wedge: both highs and lows are falling, but converging
    const recentHighs = sortedHighs.slice(-2)
    const recentLows = sortedLows.slice(-2)
    
    if (recentHighs.length < 2 || recentLows.length < 2) return null
    
    // Check if both highs and lows are falling
    const highsFalling = recentHighs[1].price < recentHighs[0].price
    const lowsFalling = recentLows[1].price < recentLows[0].price
    
    if (!highsFalling || !lowsFalling) return null
    
    // Check if they're converging (lows falling slower than highs)
    const highSlope = (recentHighs[1].price - recentHighs[0].price) / (recentHighs[1].index - recentHighs[0].index)
    const lowSlope = (recentLows[1].price - recentLows[0].price) / (recentLows[1].index - recentLows[0].index)
    
    if (lowSlope >= highSlope) return null // Should be converging
    
    // Calculate trendlines
    const upperTrendline = {
      start: recentHighs[0],
      end: recentHighs[1]
    }
    const lowerTrendline = {
      start: recentLows[0],
      end: recentLows[1]
    }
    
    // Check for volume confirmation (decreasing volume)
    const currentVolume = volumes[currentIndex] || 0
    const avgVolume = volumes.slice(currentIndex - 10, currentIndex).reduce((sum, vol) => sum + vol, 0) / 10
    const volumeConfirmation = currentVolume < avgVolume * 0.8
    
    // Check RSI confirmation (divergence)
    const currentRSI = rsi[currentIndex] || 50
    const earlierRSI = rsi[recentLows[0].index] || 50
    const rsiConfirmation = currentRSI > earlierRSI && recentLows[1].price < recentLows[0].price
    
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
    const wedgeHeight = recentHighs[1].price - recentLows[1].price
    const stopLoss = recentLows[1].price * 0.98
    const targetPrice = recentHighs[1].price + wedgeHeight
    const takeProfit = targetPrice
    const risk = entryPrice - stopLoss
    const reward = takeProfit - entryPrice
    const riskRewardRatio = risk > 0 ? reward / risk : 0
    
    return {
      index: currentIndex,
      pattern: 'Falling Wedge',
      signal: 'bullish',
      confidence: Math.min(confidence, 1.0),
      strength,
      volumeConfirmation,
      rsiConfirmation,
      maConfirmation,
      description: `Falling wedge pattern with converging trendlines. ${volumeConfirmation ? 'Volume confirmed.' : ''} ${rsiConfirmation ? 'RSI divergence.' : ''} ${maConfirmation ? 'Above MAs.' : ''}`,
      entryPrice,
      stopLoss,
      takeProfit,
      riskRewardRatio,
      upperTrendline,
      lowerTrendline,
      apexIndex: currentIndex + 5, // Estimated apex
      targetPrice
    }
  }
}
