import type { PriceDataPoint } from '../coingeckoApi'

export interface EnhancedPattern {
  index: number
  pattern: string
  signal: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  strength: 'weak' | 'moderate' | 'strong' | 'very-strong'
  description: string
  volumeConfirmation: boolean
  rsiConfirmation: boolean
  maConfirmation: boolean
  breakoutConfirmation: boolean
  fakeBreakoutRisk: 'low' | 'medium' | 'high'
  marketContext: 'bullish' | 'bearish' | 'sideways'
  completionTimeframe: 'short' | 'medium' | 'long'
  entryPrice?: number
  stopLoss?: number
  takeProfit?: number
  riskRewardRatio?: number
  patternScore: number
  reliabilityScore: number
  marketStructure: {
    higherHighs: boolean
    higherLows: boolean
    lowerHighs: boolean
    lowerLows: boolean
    trend: 'bullish' | 'bearish' | 'sideways'
  }
}

/**
 * Enhanced Pattern Detection with Advanced Algorithms
 * Uses multiple confirmation signals and market structure analysis
 */
export class EnhancedPatterns {
  /**
   * Detect enhanced patterns with multiple confirmation signals
   */
  static detectEnhancedPatterns(
    data: PriceDataPoint[],
    rsi: number[],
    sma20: number[],
    sma50: number[],
    atr?: number[]
  ): EnhancedPattern[] {
    const patterns: EnhancedPattern[] = []
    const prices = data.map(d => d.price)
    const volumes = data.map(d => d.volume || 0)
    
    // Detect various enhanced patterns
    patterns.push(...this.detectBreakoutPatterns(data, prices, volumes, rsi, sma20, sma50, atr))
    patterns.push(...this.detectReversalPatterns(data, prices, volumes, rsi, sma20, sma50, atr))
    patterns.push(...this.detectContinuationPatterns(data, prices, volumes, rsi, sma20, sma50, atr))
    patterns.push(...this.detectVolumePatterns(data, prices, volumes, rsi, sma20, sma50))
    patterns.push(...this.detectMomentumPatterns(data, prices, volumes, rsi, sma20, sma50))
    
    // Filter and score patterns
    return this.filterAndScorePatterns(patterns, data.length)
  }

  /**
   * Detect breakout patterns with volume confirmation
   */
  private static detectBreakoutPatterns(
    data: PriceDataPoint[],
    prices: number[],
    volumes: number[],
    rsi: number[],
    sma20: number[],
    sma50: number[],
    atr?: number[]
  ): EnhancedPattern[] {
    const patterns: EnhancedPattern[] = []
    
    for (let i = 20; i < data.length - 5; i++) {
      const currentPrice = prices[i]
      const currentVolume = volumes[i]
      const avgVolume = this.calculateAverageVolume(volumes, i, 20)
      const volumeRatio = avgVolume > 0 ? currentVolume / avgVolume : 1
      
      // Resistance breakout
      if (this.isResistanceBreakout(prices, i, 20)) {
        const marketStructure = this.analyzeMarketStructure(prices, i)
        const patternScore = this.calculateBreakoutScore(prices, volumes, rsi, i, 'resistance')
        
        if (patternScore > 40) {
          patterns.push({
            index: i,
            pattern: 'Resistance Breakout',
            signal: 'bullish',
            confidence: patternScore,
            strength: this.getStrengthFromScore(patternScore),
            description: `Price breaks above resistance with ${volumeRatio.toFixed(1)}x volume`,
            volumeConfirmation: volumeRatio > 1.5,
            rsiConfirmation: rsi[i] > 50,
            maConfirmation: currentPrice > sma20[i] && currentPrice > sma50[i],
            breakoutConfirmation: true,
            fakeBreakoutRisk: this.assessFakeBreakoutRisk(prices, volumes, i),
            marketContext: marketStructure.trend,
            completionTimeframe: 'short',
            entryPrice: currentPrice * 1.002,
            stopLoss: this.calculateStopLoss(prices, i, 'long'),
            takeProfit: this.calculateTakeProfit(currentPrice, 'long', atr?.[i]),
            riskRewardRatio: this.calculateRiskReward(currentPrice, 'long', atr?.[i]),
            patternScore,
            reliabilityScore: this.calculateReliabilityScore(patternScore, volumeRatio, marketStructure),
            marketStructure
          })
        }
      }
      
      // Support breakdown
      if (this.isSupportBreakdown(prices, i, 20)) {
        const marketStructure = this.analyzeMarketStructure(prices, i)
        const patternScore = this.calculateBreakoutScore(prices, volumes, rsi, i, 'support')
        
        if (patternScore > 40) {
          patterns.push({
            index: i,
            pattern: 'Support Breakdown',
            signal: 'bearish',
            confidence: patternScore,
            strength: this.getStrengthFromScore(patternScore),
            description: `Price breaks below support with ${volumeRatio.toFixed(1)}x volume`,
            volumeConfirmation: volumeRatio > 1.5,
            rsiConfirmation: rsi[i] < 50,
            maConfirmation: currentPrice < sma20[i] && currentPrice < sma50[i],
            breakoutConfirmation: true,
            fakeBreakoutRisk: this.assessFakeBreakoutRisk(prices, volumes, i),
            marketContext: marketStructure.trend,
            completionTimeframe: 'short',
            entryPrice: currentPrice * 0.998,
            stopLoss: this.calculateStopLoss(prices, i, 'short'),
            takeProfit: this.calculateTakeProfit(currentPrice, 'short', atr?.[i]),
            riskRewardRatio: this.calculateRiskReward(currentPrice, 'short', atr?.[i]),
            patternScore,
            reliabilityScore: this.calculateReliabilityScore(patternScore, volumeRatio, marketStructure),
            marketStructure
          })
        }
      }
    }
    
    return patterns
  }

  /**
   * Detect reversal patterns with multiple confirmations
   */
  private static detectReversalPatterns(
    data: PriceDataPoint[],
    prices: number[],
    volumes: number[],
    rsi: number[],
    sma20: number[],
    sma50: number[],
    atr?: number[]
  ): EnhancedPattern[] {
    const patterns: EnhancedPattern[] = []
    
    for (let i = 20; i < data.length - 10; i++) {
      // Bullish reversal patterns
      if (this.isBullishReversal(prices, volumes, rsi, i)) {
        const marketStructure = this.analyzeMarketStructure(prices, i)
        const patternScore = this.calculateReversalScore(prices, volumes, rsi, i, 'bullish')
        
        if (patternScore > 45) {
          patterns.push({
            index: i,
            pattern: 'Bullish Reversal',
            signal: 'bullish',
            confidence: patternScore,
            strength: this.getStrengthFromScore(patternScore),
            description: 'Price shows signs of bullish reversal with volume confirmation',
            volumeConfirmation: this.hasVolumeConfirmation(volumes, i, 'bullish'),
            rsiConfirmation: rsi[i] < 30 && rsi[i] > rsi[i - 1],
            maConfirmation: this.hasMAConfirmation(prices, sma20, sma50, i, 'bullish'),
            breakoutConfirmation: false,
            fakeBreakoutRisk: 'low',
            marketContext: marketStructure.trend,
            completionTimeframe: 'medium',
            entryPrice: prices[i] * 1.001,
            stopLoss: this.calculateStopLoss(prices, i, 'long'),
            takeProfit: this.calculateTakeProfit(prices[i], 'long', atr?.[i]),
            riskRewardRatio: this.calculateRiskReward(prices[i], 'long', atr?.[i]),
            patternScore,
            reliabilityScore: this.calculateReliabilityScore(patternScore, 1, marketStructure),
            marketStructure
          })
        }
      }
      
      // Bearish reversal patterns
      if (this.isBearishReversal(prices, volumes, rsi, i)) {
        const marketStructure = this.analyzeMarketStructure(prices, i)
        const patternScore = this.calculateReversalScore(prices, volumes, rsi, i, 'bearish')
        
        if (patternScore > 45) {
          patterns.push({
            index: i,
            pattern: 'Bearish Reversal',
            signal: 'bearish',
            confidence: patternScore,
            strength: this.getStrengthFromScore(patternScore),
            description: 'Price shows signs of bearish reversal with volume confirmation',
            volumeConfirmation: this.hasVolumeConfirmation(volumes, i, 'bearish'),
            rsiConfirmation: rsi[i] > 70 && rsi[i] < rsi[i - 1],
            maConfirmation: this.hasMAConfirmation(prices, sma20, sma50, i, 'bearish'),
            breakoutConfirmation: false,
            fakeBreakoutRisk: 'low',
            marketContext: marketStructure.trend,
            completionTimeframe: 'medium',
            entryPrice: prices[i] * 0.999,
            stopLoss: this.calculateStopLoss(prices, i, 'short'),
            takeProfit: this.calculateTakeProfit(prices[i], 'short', atr?.[i]),
            riskRewardRatio: this.calculateRiskReward(prices[i], 'short', atr?.[i]),
            patternScore,
            reliabilityScore: this.calculateReliabilityScore(patternScore, 1, marketStructure),
            marketStructure
          })
        }
      }
    }
    
    return patterns
  }

  /**
   * Detect continuation patterns
   */
  private static detectContinuationPatterns(
    data: PriceDataPoint[],
    prices: number[],
    volumes: number[],
    rsi: number[],
    sma20: number[],
    sma50: number[],
    atr?: number[]
  ): EnhancedPattern[] {
    const patterns: EnhancedPattern[] = []
    
    for (let i = 20; i < data.length - 10; i++) {
      const marketStructure = this.analyzeMarketStructure(prices, i)
      
      // Bull flag pattern
      if (this.isBullFlag(prices, volumes, rsi, i)) {
        const patternScore = this.calculateContinuationScore(prices, volumes, rsi, i, 'bull')
        
        if (patternScore > 40) {
          patterns.push({
            index: i,
            pattern: 'Bull Flag',
            signal: 'bullish',
            confidence: patternScore,
            strength: this.getStrengthFromScore(patternScore),
            description: 'Bull flag continuation pattern with volume confirmation',
            volumeConfirmation: this.hasVolumeConfirmation(volumes, i, 'bullish'),
            rsiConfirmation: rsi[i] > 40 && rsi[i] < 60,
            maConfirmation: prices[i] > sma20[i] && sma20[i] > sma50[i],
            breakoutConfirmation: false,
            fakeBreakoutRisk: 'medium',
            marketContext: marketStructure.trend,
            completionTimeframe: 'short',
            entryPrice: prices[i] * 1.001,
            stopLoss: this.calculateStopLoss(prices, i, 'long'),
            takeProfit: this.calculateTakeProfit(prices[i], 'long', atr?.[i]),
            riskRewardRatio: this.calculateRiskReward(prices[i], 'long', atr?.[i]),
            patternScore,
            reliabilityScore: this.calculateReliabilityScore(patternScore, 1, marketStructure),
            marketStructure
          })
        }
      }
      
      // Bear flag pattern
      if (this.isBearFlag(prices, volumes, rsi, i)) {
        const patternScore = this.calculateContinuationScore(prices, volumes, rsi, i, 'bear')
        
        if (patternScore > 40) {
          patterns.push({
            index: i,
            pattern: 'Bear Flag',
            signal: 'bearish',
            confidence: patternScore,
            strength: this.getStrengthFromScore(patternScore),
            description: 'Bear flag continuation pattern with volume confirmation',
            volumeConfirmation: this.hasVolumeConfirmation(volumes, i, 'bearish'),
            rsiConfirmation: rsi[i] > 40 && rsi[i] < 60,
            maConfirmation: prices[i] < sma20[i] && sma20[i] < sma50[i],
            breakoutConfirmation: false,
            fakeBreakoutRisk: 'medium',
            marketContext: marketStructure.trend,
            completionTimeframe: 'short',
            entryPrice: prices[i] * 0.999,
            stopLoss: this.calculateStopLoss(prices, i, 'short'),
            takeProfit: this.calculateTakeProfit(prices[i], 'short', atr?.[i]),
            riskRewardRatio: this.calculateRiskReward(prices[i], 'short', atr?.[i]),
            patternScore,
            reliabilityScore: this.calculateReliabilityScore(patternScore, 1, marketStructure),
            marketStructure
          })
        }
      }
    }
    
    return patterns
  }

  /**
   * Detect volume-based patterns
   */
  private static detectVolumePatterns(
    data: PriceDataPoint[],
    prices: number[],
    volumes: number[],
    rsi: number[],
    sma20: number[],
    _sma50: number[]
  ): EnhancedPattern[] {
    const patterns: EnhancedPattern[] = []
    
    for (let i = 20; i < data.length - 5; i++) {
      const currentVolume = volumes[i]
      const avgVolume = this.calculateAverageVolume(volumes, i, 20)
      const volumeRatio = avgVolume > 0 ? currentVolume / avgVolume : 1
      
      // Volume spike with price movement
      if (volumeRatio > 2.0) {
        const priceChange = (prices[i] - prices[i - 1]) / prices[i - 1]
        const marketStructure = this.analyzeMarketStructure(prices, i)
        
        if (Math.abs(priceChange) > 0.02) { // At least 2% price change
          const signal = priceChange > 0 ? 'bullish' : 'bearish'
          const patternScore = this.calculateVolumePatternScore(volumeRatio, Math.abs(priceChange), rsi[i])
          
          if (patternScore > 70) {
            patterns.push({
              index: i,
              pattern: 'Volume Spike',
              signal,
              confidence: patternScore,
              strength: this.getStrengthFromScore(patternScore),
              description: `Volume spike (${volumeRatio.toFixed(1)}x) with ${(priceChange * 100).toFixed(1)}% price movement`,
              volumeConfirmation: true,
              rsiConfirmation: signal === 'bullish' ? rsi[i] > 45 : rsi[i] < 55,
              maConfirmation: signal === 'bullish' ? prices[i] > sma20[i] : prices[i] < sma20[i],
              breakoutConfirmation: false,
              fakeBreakoutRisk: 'low',
              marketContext: marketStructure.trend,
              completionTimeframe: 'short',
              entryPrice: prices[i] * (signal === 'bullish' ? 1.001 : 0.999),
              stopLoss: this.calculateStopLoss(prices, i, signal === 'bullish' ? 'long' : 'short'),
              takeProfit: this.calculateTakeProfit(prices[i], signal === 'bullish' ? 'long' : 'short'),
              riskRewardRatio: this.calculateRiskReward(prices[i], signal === 'bullish' ? 'long' : 'short'),
              patternScore,
              reliabilityScore: this.calculateReliabilityScore(patternScore, volumeRatio, marketStructure),
              marketStructure
            })
          }
        }
      }
    }
    
    return patterns
  }

  /**
   * Detect momentum patterns
   */
  private static detectMomentumPatterns(
    data: PriceDataPoint[],
    prices: number[],
    volumes: number[],
    rsi: number[],
    sma20: number[],
    _sma50: number[]
  ): EnhancedPattern[] {
    const patterns: EnhancedPattern[] = []
    
    for (let i = 20; i < data.length - 5; i++) {
      const marketStructure = this.analyzeMarketStructure(prices, i)
      
      // Momentum divergence patterns
      if (this.hasMomentumDivergence(prices, rsi, i)) {
        const patternScore = this.calculateMomentumScore(prices, rsi, i)
        
        if (patternScore > 45) {
          const signal = this.getMomentumSignal(prices, rsi, i)
          
          patterns.push({
            index: i,
            pattern: 'Momentum Divergence',
            signal,
            confidence: patternScore,
            strength: this.getStrengthFromScore(patternScore),
            description: 'Price and RSI show divergence indicating potential reversal',
            volumeConfirmation: this.hasVolumeConfirmation(volumes, i, signal),
            rsiConfirmation: true,
            maConfirmation: this.hasMAConfirmation(prices, sma20, _sma50, i, signal),
            breakoutConfirmation: false,
            fakeBreakoutRisk: 'medium',
            marketContext: marketStructure.trend,
            completionTimeframe: 'medium',
            entryPrice: prices[i] * (signal === 'bullish' ? 1.001 : 0.999),
            stopLoss: this.calculateStopLoss(prices, i, signal === 'bullish' ? 'long' : 'short'),
            takeProfit: this.calculateTakeProfit(prices[i], signal === 'bullish' ? 'long' : 'short'),
            riskRewardRatio: this.calculateRiskReward(prices[i], signal === 'bullish' ? 'long' : 'short'),
            patternScore,
            reliabilityScore: this.calculateReliabilityScore(patternScore, 1, marketStructure),
            marketStructure
          })
        }
      }
    }
    
    return patterns
  }

  // Helper methods for pattern detection
  private static isResistanceBreakout(prices: number[], index: number, lookback: number): boolean {
    const currentPrice = prices[index]
    const recentHigh = Math.max(...prices.slice(index - lookback, index))
    
    return currentPrice > recentHigh * 1.005 // 0.5% above recent high
  }

  private static isSupportBreakdown(prices: number[], index: number, lookback: number): boolean {
    const currentPrice = prices[index]
    const recentLow = Math.min(...prices.slice(index - lookback, index))
    
    return currentPrice < recentLow * 0.995 // 0.5% below recent low
  }

  private static isBullishReversal(prices: number[], volumes: number[], rsi: number[], index: number): boolean {
    const priceChange = (prices[index] - prices[index - 1]) / prices[index - 1]
    const volumeRatio = this.calculateAverageVolume(volumes, index, 20) > 0 ? 
      volumes[index] / this.calculateAverageVolume(volumes, index, 20) : 1
    
    return priceChange > 0.02 && // At least 2% price increase
           rsi[index] < 35 && // RSI oversold
           rsi[index] > rsi[index - 1] && // RSI improving
           volumeRatio > 1.2 // Above average volume
  }

  private static isBearishReversal(prices: number[], volumes: number[], rsi: number[], index: number): boolean {
    const priceChange = (prices[index] - prices[index - 1]) / prices[index - 1]
    const volumeRatio = this.calculateAverageVolume(volumes, index, 20) > 0 ? 
      volumes[index] / this.calculateAverageVolume(volumes, index, 20) : 1
    
    return priceChange < -0.02 && // At least 2% price decrease
           rsi[index] > 65 && // RSI overbought
           rsi[index] < rsi[index - 1] && // RSI declining
           volumeRatio > 1.2 // Above average volume
  }

  private static isBullFlag(prices: number[], volumes: number[], rsi: number[], index: number): boolean {
    // Look for a sharp rise followed by a consolidation
    const lookback = 10
    const recentPrices = prices.slice(index - lookback, index + 1)
    const recentVolumes = volumes.slice(index - lookback, index + 1)
    
    const maxPrice = Math.max(...recentPrices)
    const minPrice = Math.min(...recentPrices)
    const priceRange = (maxPrice - minPrice) / minPrice
    
    const avgVolume = this.calculateAverageVolume(recentVolumes, recentVolumes.length - 1, 5)
    const currentVolume = recentVolumes[recentVolumes.length - 1]
    const volumeRatio = avgVolume > 0 ? currentVolume / avgVolume : 1
    
    return priceRange > 0.05 && // At least 5% range
           priceRange < 0.15 && // But not too volatile
           rsi[index] > 40 && rsi[index] < 60 && // RSI in middle range
           volumeRatio < 0.8 // Declining volume (consolidation)
  }

  private static isBearFlag(prices: number[], volumes: number[], rsi: number[], index: number): boolean {
    // Similar to bull flag but for bearish continuation
    const lookback = 10
    const recentPrices = prices.slice(index - lookback, index + 1)
    const recentVolumes = volumes.slice(index - lookback, index + 1)
    
    const maxPrice = Math.max(...recentPrices)
    const minPrice = Math.min(...recentPrices)
    const priceRange = (maxPrice - minPrice) / minPrice
    
    const avgVolume = this.calculateAverageVolume(recentVolumes, recentVolumes.length - 1, 5)
    const currentVolume = recentVolumes[recentVolumes.length - 1]
    const volumeRatio = avgVolume > 0 ? currentVolume / avgVolume : 1
    
    return priceRange > 0.05 && // At least 5% range
           priceRange < 0.15 && // But not too volatile
           rsi[index] > 40 && rsi[index] < 60 && // RSI in middle range
           volumeRatio < 0.8 // Declining volume (consolidation)
  }

  private static hasMomentumDivergence(prices: number[], rsi: number[], index: number): boolean {
    const lookback = 10
    const recentPrices = prices.slice(index - lookback, index + 1)
    const recentRSI = rsi.slice(index - lookback, index + 1)
    
    // Check for bullish divergence (price makes lower low, RSI makes higher low)
    const priceLow = Math.min(...recentPrices)
    const rsiLow = Math.min(...recentRSI)
    const priceLowIndex = recentPrices.indexOf(priceLow)
    const rsiLowIndex = recentRSI.indexOf(rsiLow)
    
    if (priceLowIndex > 0 && rsiLowIndex > 0 && priceLowIndex !== rsiLowIndex) {
      const priceTrend = recentPrices[0] - recentPrices[recentPrices.length - 1]
      const rsiTrend = recentRSI[0] - recentRSI[recentRSI.length - 1]
      
      return priceTrend < 0 && rsiTrend > 0 // Price down, RSI up
    }
    
    return false
  }

  private static getMomentumSignal(prices: number[], rsi: number[], index: number): 'bullish' | 'bearish' {
    const recentPrices = prices.slice(index - 5, index + 1)
    const recentRSI = rsi.slice(index - 5, index + 1)
    
    const priceTrend = recentPrices[recentPrices.length - 1] - recentPrices[0]
    const rsiTrend = recentRSI[recentRSI.length - 1] - recentRSI[0]
    
    if (priceTrend < 0 && rsiTrend > 0) return 'bullish'
    if (priceTrend > 0 && rsiTrend < 0) return 'bearish'
    
    return 'bullish' // Default to bullish if no clear signal
  }

  // Scoring and analysis methods
  private static calculateBreakoutScore(prices: number[], volumes: number[], rsi: number[], index: number, type: string): number {
    let score = 50
    
    const volumeRatio = this.calculateAverageVolume(volumes, index, 20) > 0 ? 
      volumes[index] / this.calculateAverageVolume(volumes, index, 20) : 1
    
    // Volume confirmation
    if (volumeRatio > 2.0) score += 20
    else if (volumeRatio > 1.5) score += 15
    else if (volumeRatio > 1.2) score += 10
    
    // RSI confirmation
    if (type === 'resistance' && rsi[index] > 50) score += 15
    if (type === 'support' && rsi[index] < 50) score += 15
    
    // Price momentum
    const priceChange = Math.abs((prices[index] - prices[index - 1]) / prices[index - 1])
    if (priceChange > 0.03) score += 15
    else if (priceChange > 0.02) score += 10
    
    return Math.min(100, score)
  }

  private static calculateReversalScore(prices: number[], volumes: number[], rsi: number[], index: number, type: string): number {
    let score = 40
    
    const volumeRatio = this.calculateAverageVolume(volumes, index, 20) > 0 ? 
      volumes[index] / this.calculateAverageVolume(volumes, index, 20) : 1
    
    // Volume confirmation
    if (volumeRatio > 1.5) score += 20
    else if (volumeRatio > 1.2) score += 15
    
    // RSI extreme levels
    if (type === 'bullish' && rsi[index] < 30) score += 25
    if (type === 'bearish' && rsi[index] > 70) score += 25
    
    // Price change magnitude
    const priceChange = Math.abs((prices[index] - prices[index - 1]) / prices[index - 1])
    if (priceChange > 0.03) score += 15
    else if (priceChange > 0.02) score += 10
    
    return Math.min(100, score)
  }

  private static calculateContinuationScore(prices: number[], volumes: number[], rsi: number[], index: number, _type: string): number {
    let score = 45
    
    // RSI in middle range (40-60) is good for continuation
    if (rsi[index] >= 40 && rsi[index] <= 60) score += 20
    
    // Volume declining (consolidation)
    const volumeRatio = this.calculateAverageVolume(volumes, index, 20) > 0 ? 
      volumes[index] / this.calculateAverageVolume(volumes, index, 20) : 1
    
    if (volumeRatio < 0.8) score += 15
    else if (volumeRatio < 1.0) score += 10
    
    // Price consolidation (not too volatile)
    const recentPrices = prices.slice(index - 5, index + 1)
    const priceRange = (Math.max(...recentPrices) - Math.min(...recentPrices)) / Math.min(...recentPrices)
    
    if (priceRange < 0.1) score += 20
    else if (priceRange < 0.15) score += 15
    
    return Math.min(100, score)
  }

  private static calculateVolumePatternScore(volumeRatio: number, priceChange: number, rsi: number): number {
    let score = 50
    
    // Volume ratio scoring
    if (volumeRatio > 3.0) score += 25
    else if (volumeRatio > 2.0) score += 20
    else if (volumeRatio > 1.5) score += 15
    
    // Price change scoring
    if (priceChange > 0.05) score += 20
    else if (priceChange > 0.03) score += 15
    else if (priceChange > 0.02) score += 10
    
    // RSI confirmation
    if (rsi > 40 && rsi < 60) score += 5
    
    return Math.min(100, score)
  }

  private static calculateMomentumScore(prices: number[], rsi: number[], index: number): number {
    let score = 50
    
    const recentPrices = prices.slice(index - 10, index + 1)
    const recentRSI = rsi.slice(index - 10, index + 1)
    
    // Calculate trends
    const priceTrend = (recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices[0]
    const rsiTrend = recentRSI[recentRSI.length - 1] - recentRSI[0]
    
    // Divergence strength
    const divergenceStrength = Math.abs(priceTrend) * Math.abs(rsiTrend) * 100
    if (divergenceStrength > 0.1) score += 30
    else if (divergenceStrength > 0.05) score += 20
    
    // RSI level
    if (rsi[index] < 30 || rsi[index] > 70) score += 20
    
    return Math.min(100, score)
  }

  private static analyzeMarketStructure(prices: number[], index: number): {
    higherHighs: boolean
    higherLows: boolean
    lowerHighs: boolean
    lowerLows: boolean
    trend: 'bullish' | 'bearish' | 'sideways'
  } {
    const lookback = 20
    const recentPrices = prices.slice(Math.max(0, index - lookback), index + 1)
    
    if (recentPrices.length < 10) {
      return {
        higherHighs: false,
        higherLows: false,
        lowerHighs: false,
        lowerLows: false,
        trend: 'sideways'
      }
    }
    
    // Find significant highs and lows
    const highs: number[] = []
    const lows: number[] = []
    
    for (let i = 2; i < recentPrices.length - 2; i++) {
      const current = recentPrices[i]
      if (current > recentPrices[i - 1] && current > recentPrices[i - 2] &&
          current > recentPrices[i + 1] && current > recentPrices[i + 2]) {
        highs.push(current)
      }
      if (current < recentPrices[i - 1] && current < recentPrices[i - 2] &&
          current < recentPrices[i + 1] && current < recentPrices[i + 2]) {
        lows.push(current)
      }
    }
    
    // Analyze structure
    const higherHighs = highs.length >= 2 && highs[highs.length - 1] > highs[highs.length - 2]
    const higherLows = lows.length >= 2 && lows[lows.length - 1] > lows[lows.length - 2]
    const lowerHighs = highs.length >= 2 && highs[highs.length - 1] < highs[highs.length - 2]
    const lowerLows = lows.length >= 2 && lows[lows.length - 1] < lows[lows.length - 2]
    
    let trend: 'bullish' | 'bearish' | 'sideways' = 'sideways'
    if (higherHighs && higherLows) trend = 'bullish'
    else if (lowerHighs && lowerLows) trend = 'bearish'
    
    return { higherHighs, higherLows, lowerHighs, lowerLows, trend }
  }

  private static getStrengthFromScore(score: number): 'weak' | 'moderate' | 'strong' | 'very-strong' {
    if (score >= 85) return 'very-strong'
    if (score >= 70) return 'strong'
    if (score >= 55) return 'moderate'
    return 'weak'
  }

  private static calculateReliabilityScore(patternScore: number, volumeRatio: number, marketStructure: any): number {
    let reliability = patternScore * 0.6 // Base reliability from pattern score
    
    // Volume confirmation bonus
    if (volumeRatio > 1.5) reliability += 15
    else if (volumeRatio > 1.2) reliability += 10
    
    // Market structure bonus
    if (marketStructure.trend === 'bullish' || marketStructure.trend === 'bearish') {
      reliability += 10
    }
    
    return Math.min(100, reliability)
  }

  private static filterAndScorePatterns(patterns: EnhancedPattern[], dataLength: number): EnhancedPattern[] {
    // Sort by reliability score and confidence
    const sortedPatterns = patterns.sort((a, b) => {
      const scoreA = a.reliabilityScore * 0.7 + a.confidence * 0.3
      const scoreB = b.reliabilityScore * 0.7 + b.confidence * 0.3
      return scoreB - scoreA
    })
    
    // Remove duplicates and keep only recent patterns - more lenient for Bitcoin
    const recentPatterns = sortedPatterns.filter(p => dataLength - p.index <= 20)
    
    // Group by pattern type and keep the best of each
    const groupedPatterns = new Map<string, EnhancedPattern>()
    
    for (const pattern of recentPatterns) {
      const key = pattern.pattern
      if (!groupedPatterns.has(key) || pattern.reliabilityScore > groupedPatterns.get(key)!.reliabilityScore) {
        groupedPatterns.set(key, pattern)
      }
    }
    
    return Array.from(groupedPatterns.values()).slice(0, 8) // Return top 8 patterns
  }

  // Additional helper methods
  private static calculateAverageVolume(volumes: number[], index: number, period: number): number {
    const start = Math.max(0, index - period + 1)
    const end = index + 1
    const validVolumes = volumes.slice(start, end).filter(v => !isNaN(v) && v > 0)
    
    if (validVolumes.length === 0) return 0
    return validVolumes.reduce((a, b) => a + b, 0) / validVolumes.length
  }

  private static hasVolumeConfirmation(volumes: number[], index: number, _signal: string): boolean {
    const volumeRatio = this.calculateAverageVolume(volumes, index, 20) > 0 ? 
      volumes[index] / this.calculateAverageVolume(volumes, index, 20) : 1
    
    return volumeRatio > 1.2
  }

  private static hasMAConfirmation(prices: number[], sma20: number[], sma50: number[], index: number, signal: string): boolean {
    const currentPrice = prices[index]
    const currentSMA20 = sma20[index]
    const currentSMA50 = sma50[index]
    
    if (signal === 'bullish') {
      return currentPrice > currentSMA20 && currentSMA20 > currentSMA50
    } else {
      return currentPrice < currentSMA20 && currentSMA20 < currentSMA50
    }
  }

  private static assessFakeBreakoutRisk(_prices: number[], volumes: number[], index: number): 'low' | 'medium' | 'high' {
    const volumeRatio = this.calculateAverageVolume(volumes, index, 20) > 0 ? 
      volumes[index] / this.calculateAverageVolume(volumes, index, 20) : 1
    
    if (volumeRatio > 2.0) return 'low'
    if (volumeRatio > 1.2) return 'medium'
    return 'high'
  }

  private static calculateStopLoss(prices: number[], index: number, direction: 'long' | 'short'): number {
    const currentPrice = prices[index]
    const atr = this.calculateATR(prices, index, 14)
    
    if (direction === 'long') {
      return currentPrice - (atr * 2) // 2 ATR below entry
    } else {
      return currentPrice + (atr * 2) // 2 ATR above entry
    }
  }

  private static calculateTakeProfit(price: number, direction: 'long' | 'short', atr?: number): number {
    const atrValue = atr || price * 0.02 // Default 2% if no ATR
    
    if (direction === 'long') {
      return price + (atrValue * 3) // 3 ATR above entry
    } else {
      return price - (atrValue * 3) // 3 ATR below entry
    }
  }

  private static calculateRiskReward(price: number, direction: 'long' | 'short', atr?: number): number {
    const atrValue = atr || price * 0.02
    const stopLoss = direction === 'long' ? price - (atrValue * 2) : price + (atrValue * 2)
    const takeProfit = direction === 'long' ? price + (atrValue * 3) : price - (atrValue * 3)
    
    const risk = Math.abs(price - stopLoss)
    const reward = Math.abs(takeProfit - price)
    
    return risk > 0 ? reward / risk : 0
  }

  private static calculateATR(prices: number[], index: number, period: number): number {
    if (index < period) return prices[index] * 0.02 // Default 2% if not enough data
    
    let sum = 0
    for (let i = index - period + 1; i <= index; i++) {
      if (i > 0) {
        const high = prices[i]
        const low = prices[i - 1]
        const tr = Math.abs(high - low)
        sum += tr
      }
    }
    
    return sum / period
  }
}
