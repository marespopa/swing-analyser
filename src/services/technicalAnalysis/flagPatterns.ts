import type { PriceDataPoint } from '../coingeckoApi'

export interface FlagPattern {
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
  flagpoleStart: { index: number; price: number }
  flagpoleEnd: { index: number; price: number }
  flagStart: { index: number; price: number }
  flagEnd: { index: number; price: number }
  targetPrice?: number
}

/**
 * Flag pattern detection utilities (Bull Flag, Bear Flag)
 */
export class FlagPatterns {
  /**
   * Detect Flag Patterns (Bull and Bear Flags)
   */
  static detectFlagPatterns(
    data: PriceDataPoint[],
    rsi: number[],
    sma20: number[],
    sma50: number[]
  ): FlagPattern[] {
    const patterns: FlagPattern[] = []
    const prices = data.map(d => d.price)
    const volumes = data.map(d => d.volume || 0)
    
    // Look for flag patterns over the last 30 periods
    const lookbackPeriod = Math.min(30, data.length - 5)
    const startIndex = Math.max(10, data.length - lookbackPeriod)
    
    for (let i = startIndex; i < data.length - 5; i++) {
      const window = 20
      const recentData = data.slice(i - window, i + 5)
      const recentPrices = recentData.map(d => d.price)
      
      if (recentPrices.length < 15) continue
      
      // Find significant moves (flagpoles)
      const moves: { start: { index: number; price: number }; end: { index: number; price: number }; direction: 'up' | 'down' }[] = []
      
      for (let j = 2; j < recentPrices.length - 2; j++) {
        const currentPrice = recentPrices[j]
        const actualIndex = i - window + j
        
        // Look for strong moves (at least 5% in 3-5 periods)
        for (let k = j + 3; k < Math.min(j + 6, recentPrices.length); k++) {
          const futurePrice = recentPrices[k]
          const futureActualIndex = i - window + k
          const movePercent = Math.abs(futurePrice - currentPrice) / currentPrice
          
          if (movePercent >= 0.05) {
            moves.push({
              start: { index: actualIndex, price: currentPrice },
              end: { index: futureActualIndex, price: futurePrice },
              direction: futurePrice > currentPrice ? 'up' : 'down'
            })
          }
        }
      }
      
      if (moves.length === 0) continue
      
      // Check for flag patterns after strong moves
      for (const move of moves) {
        const flagPattern = this.detectFlag(move, i, prices, volumes, rsi, sma20, sma50)
        if (flagPattern) patterns.push(flagPattern)
      }
    }
    
    return patterns
  }

  /**
   * Detect Flag Pattern
   */
  private static detectFlag(
    move: { start: { index: number; price: number }; end: { index: number; price: number }; direction: 'up' | 'down' },
    currentIndex: number,
    prices: number[],
    volumes: number[],
    rsi: number[],
    sma20: number[],
    sma50: number[]
  ): FlagPattern | null {
    const flagpoleStart = move.start
    const flagpoleEnd = move.end
    const direction = move.direction
    
    // Look for flag after the move (small consolidation)
    const flagStart = flagpoleEnd
    const flagEnd = { index: currentIndex, price: prices[currentIndex] }
    
    if (flagEnd.index - flagStart.index < 3) return null // Need at least 3 periods for flag
    
    // Check if flag is a small consolidation (opposite to flagpole direction)
    const flagPrices = prices.slice(flagStart.index, flagEnd.index + 1)
    const flagHigh = Math.max(...flagPrices)
    const flagLow = Math.min(...flagPrices)
    const flagRange = (flagHigh - flagLow) / flagpoleEnd.price
    
    if (flagRange > 0.05) return null // Flag should be small consolidation
    
    // Check if flag is in opposite direction to flagpole
    const flagDirection = flagPrices[flagPrices.length - 1] > flagPrices[0] ? 'up' : 'down'
    if (flagDirection === direction) return null // Should be opposite
    
    // Check for volume confirmation (decreasing during flag)
    const flagpoleVolume = volumes[flagpoleEnd.index] || 0
    const flagVolume = volumes.slice(flagStart.index, flagEnd.index + 1).reduce((sum, vol) => sum + vol, 0) / (flagEnd.index - flagStart.index + 1)
    const volumeConfirmation = flagVolume < flagpoleVolume * 0.7
    
    // Check RSI confirmation
    const currentRSI = rsi[currentIndex] || 50
    const rsiConfirmation = direction === 'up' ? currentRSI > 40 : currentRSI < 60
    
    // Check MA confirmation
    const currentPrice = prices[currentIndex]
    const currentSMA20 = sma20[currentIndex] || currentPrice
    const currentSMA50 = sma50[currentIndex] || currentPrice
    const maConfirmation = direction === 'up' ? 
      (currentPrice > currentSMA20 && currentPrice > currentSMA50) :
      (currentPrice < currentSMA20 && currentPrice < currentSMA50)
    
    let confidence = 0.6
    if (volumeConfirmation) confidence += 0.1
    if (rsiConfirmation) confidence += 0.1
    if (maConfirmation) confidence += 0.1
    
    const strength = confidence >= 0.8 ? 'strong' : confidence >= 0.7 ? 'moderate' : 'weak'
    
    const entryPrice = currentPrice
    const flagpoleHeight = Math.abs(flagpoleEnd.price - flagpoleStart.price)
    const stopLoss = direction === 'up' ? 
      flagLow * 0.98 : 
      flagHigh * 1.02
    const targetPrice = direction === 'up' ?
      currentPrice + flagpoleHeight :
      currentPrice - flagpoleHeight
    const takeProfit = targetPrice
    const risk = Math.abs(entryPrice - stopLoss)
    const reward = Math.abs(takeProfit - entryPrice)
    const riskRewardRatio = risk > 0 ? reward / risk : 0
    
    return {
      index: currentIndex,
      pattern: direction === 'up' ? 'Bull Flag' : 'Bear Flag',
      signal: direction === 'up' ? 'bullish' : 'bearish',
      confidence: Math.min(confidence, 1.0),
      strength,
      volumeConfirmation,
      rsiConfirmation,
      maConfirmation,
      description: `${direction === 'up' ? 'Bull' : 'Bear'} flag pattern after ${flagpoleHeight.toFixed(2)} move. ${volumeConfirmation ? 'Volume confirmed.' : ''} ${rsiConfirmation ? 'RSI favorable.' : ''} ${maConfirmation ? 'MA confirmed.' : ''}`,
      entryPrice,
      stopLoss,
      takeProfit,
      riskRewardRatio,
      flagpoleStart,
      flagpoleEnd,
      flagStart,
      flagEnd,
      targetPrice
    }
  }
}
