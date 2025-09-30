import type { PriceDataPoint } from '../coingeckoApi'

export interface HeadAndShouldersPattern {
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
  leftShoulder: { index: number; price: number }
  head: { index: number; price: number }
  rightShoulder: { index: number; price: number }
  neckline: number
  targetPrice?: number
}

/**
 * Head and Shoulders pattern detection utilities
 */
export class HeadAndShouldersPatterns {
  /**
   * Detect Head and Shoulders Pattern
   */
  static detectHeadAndShouldersPatterns(
    data: PriceDataPoint[],
    rsi: number[],
    sma20: number[],
    sma50: number[]
  ): HeadAndShouldersPattern[] {
    const patterns: HeadAndShouldersPattern[] = []
    const prices = data.map(d => d.price)
    const volumes = data.map(d => d.volume || 0)
    
    // Look for head and shoulders over the last 60 periods
    const lookbackPeriod = Math.min(60, data.length - 10)
    const startIndex = Math.max(20, data.length - lookbackPeriod)
    
    for (let i = startIndex; i < data.length - 10; i++) {
      const window = 30
      const recentData = data.slice(i - window, i + 10)
      const recentPrices = recentData.map(d => d.price)
      
      if (recentPrices.length < 20) continue
      
      // Find local highs
      const highs: { index: number; price: number }[] = []
      for (let j = 3; j < recentPrices.length - 3; j++) {
        const currentPrice = recentPrices[j]
        const actualIndex = i - window + j
        
        if (currentPrice > recentPrices[j - 1] && currentPrice > recentPrices[j - 2] && currentPrice > recentPrices[j - 3] &&
            currentPrice > recentPrices[j + 1] && currentPrice > recentPrices[j + 2] && currentPrice > recentPrices[j + 3]) {
          highs.push({ index: actualIndex, price: currentPrice })
        }
      }
      
      if (highs.length < 3) continue
      
      // Sort by index
      const sortedHighs = highs.sort((a, b) => a.index - b.index)
      
      // Check for head and shoulders pattern
      const hnsPattern = this.detectHeadAndShoulders(sortedHighs, i, prices, volumes, rsi, sma20, sma50)
      if (hnsPattern) patterns.push(hnsPattern)
      
      // Check for inverted head and shoulders pattern
      const ihnsPattern = this.detectInvertedHeadAndShoulders(sortedHighs, i, prices, volumes, rsi, sma20, sma50)
      if (ihnsPattern) patterns.push(ihnsPattern)
    }
    
    return patterns
  }

  /**
   * Detect Head and Shoulders Pattern (Bearish)
   */
  private static detectHeadAndShoulders(
    highs: { index: number; price: number }[],
    currentIndex: number,
    prices: number[],
    volumes: number[],
    rsi: number[],
    sma20: number[],
    sma50: number[]
  ): HeadAndShouldersPattern | null {
    if (highs.length < 3) return null
    
    // Look for three peaks where the middle one is highest
    for (let i = 0; i < highs.length - 2; i++) {
      const leftShoulder = highs[i]
      const head = highs[i + 1]
      const rightShoulder = highs[i + 2]
      
      // Check if head is higher than both shoulders
      if (head.price <= leftShoulder.price || head.price <= rightShoulder.price) continue
      
      // Check if shoulders are roughly equal height (within 5%)
      const shoulderHeightDiff = Math.abs(leftShoulder.price - rightShoulder.price) / Math.max(leftShoulder.price, rightShoulder.price)
      if (shoulderHeightDiff > 0.05) continue
      
      // Calculate neckline (support level between shoulders)
      const neckline = Math.min(leftShoulder.price, rightShoulder.price) * 0.98
      
      // Check for volume confirmation (decreasing volume from left to right)
      const leftVolume = volumes[leftShoulder.index] || 0
      const headVolume = volumes[head.index] || 0
      const rightVolume = volumes[rightShoulder.index] || 0
      const volumeConfirmation = headVolume > leftVolume && rightVolume < headVolume
      
      // Check RSI confirmation (overbought at head)
      const headRSI = rsi[head.index] || 50
      const rsiConfirmation = headRSI > 70
      
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
      const stopLoss = head.price * 1.02
      const targetPrice = neckline - (head.price - neckline)
      const takeProfit = targetPrice
      const risk = stopLoss - entryPrice
      const reward = entryPrice - takeProfit
      const riskRewardRatio = risk > 0 ? reward / risk : 0
      
      return {
        index: currentIndex,
        pattern: 'Head and Shoulders',
        signal: 'bearish',
        confidence: Math.min(confidence, 1.0),
        strength,
        volumeConfirmation,
        rsiConfirmation,
        maConfirmation,
        description: `Head and shoulders pattern with head at ${head.price.toFixed(2)}. ${volumeConfirmation ? 'Volume confirmed.' : ''} ${rsiConfirmation ? 'RSI overbought at head.' : ''} ${maConfirmation ? 'Below MAs.' : ''}`,
        entryPrice,
        stopLoss,
        takeProfit,
        riskRewardRatio,
        leftShoulder,
        head,
        rightShoulder,
        neckline,
        targetPrice
      }
    }
    
    return null
  }

  /**
   * Detect Inverted Head and Shoulders Pattern (Bullish)
   */
  private static detectInvertedHeadAndShoulders(
    highs: { index: number; price: number }[],
    _currentIndex: number,
    _prices: number[],
    _volumes: number[],
    _rsi: number[],
    _sma20: number[],
    _sma50: number[]
  ): HeadAndShouldersPattern | null {
    if (highs.length < 3) return null
    
    // For inverted H&S, we need to look at lows instead of highs
    // This is a simplified version - in practice, you'd analyze the lows
    // and look for three troughs where the middle one is lowest
    
    // For now, return null as this requires more complex low analysis
    return null
  }
}
