import type { PriceDataPoint } from '../coingeckoApi'

export interface CupAndHandlePattern {
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
  cupStart: { index: number; price: number }
  cupBottom: { index: number; price: number }
  cupEnd: { index: number; price: number }
  handleStart: { index: number; price: number }
  handleEnd: { index: number; price: number }
  targetPrice?: number
}

/**
 * Cup and Handle pattern detection utilities
 */
export class CupAndHandlePatterns {
  /**
   * Detect Cup and Handle Pattern
   */
  static detectCupAndHandlePatterns(
    data: PriceDataPoint[],
    rsi: number[],
    sma20: number[],
    sma50: number[]
  ): CupAndHandlePattern[] {
    const patterns: CupAndHandlePattern[] = []
    const prices = data.map(d => d.price)
    const volumes = data.map(d => d.volume || 0)
    
    // Look for cup and handle over the last 10 days (focused on recent patterns)
    const lookbackPeriod = Math.min(10, data.length - 5)
    const startIndex = Math.max(5, data.length - lookbackPeriod)
    
    for (let i = startIndex; i < data.length - 5; i++) {
      const window = 10
      const recentData = data.slice(i - window, i + 5)
      const recentPrices = recentData.map(d => d.price)
      
      if (recentPrices.length < 30) continue
      
      // Find significant highs and lows
      const highs: { index: number; price: number }[] = []
      const lows: { index: number; price: number }[] = []
      
      for (let j = 3; j < recentPrices.length - 3; j++) {
        const currentPrice = recentPrices[j]
        const actualIndex = i - window + j
        
        // Local high
        if (currentPrice > recentPrices[j - 1] && currentPrice > recentPrices[j - 2] && currentPrice > recentPrices[j - 3] &&
            currentPrice > recentPrices[j + 1] && currentPrice > recentPrices[j + 2] && currentPrice > recentPrices[j + 3]) {
          highs.push({ index: actualIndex, price: currentPrice })
        }
        
        // Local low
        if (currentPrice < recentPrices[j - 1] && currentPrice < recentPrices[j - 2] && currentPrice < recentPrices[j - 3] &&
            currentPrice < recentPrices[j + 1] && currentPrice < recentPrices[j + 2] && currentPrice < recentPrices[j + 3]) {
          lows.push({ index: actualIndex, price: currentPrice })
        }
      }
      
      if (highs.length < 2 || lows.length < 1) continue
      
      const cupHandlePattern = this.detectCupAndHandle(highs, lows, i, prices, volumes, rsi, sma20, sma50)
      if (cupHandlePattern) patterns.push(cupHandlePattern)
    }
    
    return patterns
  }

  /**
   * Detect Cup and Handle Pattern (Bullish)
   */
  private static detectCupAndHandle(
    highs: { index: number; price: number }[],
    lows: { index: number; price: number }[],
    currentIndex: number,
    prices: number[],
    volumes: number[],
    rsi: number[],
    sma20: number[],
    sma50: number[]
  ): CupAndHandlePattern | null {
    if (highs.length < 2 || lows.length < 1) return null
    
    const sortedHighs = highs.sort((a, b) => a.index - b.index)
    const sortedLows = lows.sort((a, b) => a.index - b.index)
    
    // Look for cup pattern: two highs with a low between them
    for (let i = 0; i < sortedHighs.length - 1; i++) {
      const cupStart = sortedHighs[i]
      const cupEnd = sortedHighs[i + 1]
      
      // Find the lowest point between the two highs (cup bottom)
      const cupBottom = sortedLows.find(low => low.index > cupStart.index && low.index < cupEnd.index)
      if (!cupBottom) continue
      
      // Check if cup is U-shaped (not too deep, not too shallow)
      const cupDepth = (Math.max(cupStart.price, cupEnd.price) - cupBottom.price) / Math.max(cupStart.price, cupEnd.price)
      if (cupDepth < 0.1 || cupDepth > 0.4) continue // 10-40% depth
      
      // Check if cup ends at similar level to start (within 5%)
      const cupHeightDiff = Math.abs(cupStart.price - cupEnd.price) / Math.max(cupStart.price, cupEnd.price)
      if (cupHeightDiff > 0.05) continue
      
      // Look for handle after cup (small pullback)
      const handleStart = cupEnd
      const handleEnd = { index: currentIndex, price: prices[currentIndex] }
      
      // Check if handle is a small pullback (5-15% of cup height)
      const handleDepth = (cupEnd.price - Math.min(...prices.slice(cupEnd.index, currentIndex + 1))) / cupEnd.price
      if (handleDepth < 0.05 || handleDepth > 0.15) continue
      
      // Check for volume confirmation (decreasing during cup, increasing on breakout)
      const cupStartVolume = volumes[cupStart.index] || 0
      const cupBottomVolume = volumes[cupBottom.index] || 0
      const cupEndVolume = volumes[cupEnd.index] || 0
      const currentVolume = volumes[currentIndex] || 0
      
      const volumeConfirmation = cupBottomVolume < cupStartVolume && currentVolume > cupEndVolume * 1.2
      
      // Check RSI confirmation
      const currentRSI = rsi[currentIndex] || 50
      const rsiConfirmation = currentRSI > 40 && currentRSI < 70
      
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
      const stopLoss = cupBottom.price * 0.95
      const targetPrice = cupStart.price + (cupStart.price - cupBottom.price) * 0.618
      const takeProfit = targetPrice
      const risk = entryPrice - stopLoss
      const reward = takeProfit - entryPrice
      const riskRewardRatio = risk > 0 ? reward / risk : 0
      
      return {
        index: currentIndex,
        pattern: 'Cup and Handle',
        signal: 'bullish',
        confidence: Math.min(confidence, 1.0),
        strength,
        volumeConfirmation,
        rsiConfirmation,
        maConfirmation,
        description: `Cup and handle pattern with cup from ${cupStart.price.toFixed(2)} to ${cupEnd.price.toFixed(2)}. ${volumeConfirmation ? 'Volume confirmed.' : ''} ${rsiConfirmation ? 'RSI favorable.' : ''} ${maConfirmation ? 'Above MAs.' : ''}`,
        entryPrice,
        stopLoss,
        takeProfit,
        riskRewardRatio,
        cupStart,
        cupBottom,
        cupEnd,
        handleStart,
        handleEnd,
        targetPrice
      }
    }
    
    return null
  }
}
