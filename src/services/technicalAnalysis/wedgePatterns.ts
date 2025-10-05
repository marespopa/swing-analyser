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
  breakoutConfirmation?: boolean
  fakeBreakoutRisk?: 'low' | 'medium' | 'high'
  marketContext?: 'uptrend' | 'downtrend' | 'sideways'
  completionTimeframe?: 'short' | 'medium' | 'long'
  description: string
  entryPrice?: number
  stopLoss?: number
  takeProfit?: number
  riskRewardRatio?: number
  upperTrendline: { start: { index: number; price: number }; end: { index: number; price: number } }
  lowerTrendline: { start: { index: number; price: number }; end: { index: number; price: number } }
  apexIndex?: number
  targetPrice?: number
  tradingAdvice?: string
  riskManagement?: string
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
   * Rule: A rising wedge is bearish - both highs and lows are rising but converging
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
    
    // Enhanced volume analysis for crypto markets
    const currentVolume = volumes[currentIndex] || 0
    const recentVolumes = volumes.slice(currentIndex - 10, currentIndex)
    const avgVolume = recentVolumes.reduce((sum, vol) => sum + vol, 0) / recentVolumes.length
    const volumeTrend = recentVolumes.slice(-3).reduce((sum, vol) => sum + vol, 0) / 3
    const volumeConfirmation = currentVolume < avgVolume * 0.7 && volumeTrend < avgVolume * 0.8
    
    // Enhanced RSI analysis with divergence detection
    const currentRSI = rsi[currentIndex] || 50
    const earlierRSI = rsi[recentHighs[0].index] || 50
    const rsiConfirmation = currentRSI < earlierRSI && recentHighs[1].price > recentHighs[0].price && currentRSI > 60
    
    // Check market context and MA confirmation
    const currentPrice = prices[currentIndex]
    const currentSMA20 = sma20[currentIndex] || currentPrice
    const currentSMA50 = sma50[currentIndex] || currentPrice
    const maConfirmation = currentPrice < currentSMA20 && currentPrice < currentSMA50
    
    // Determine market context
    const priceChange = (currentPrice - prices[Math.max(0, currentIndex - 20)]) / prices[Math.max(0, currentIndex - 20)]
    const marketContext: 'uptrend' | 'downtrend' | 'sideways' = 
      priceChange > 0.05 ? 'uptrend' : priceChange < -0.05 ? 'downtrend' : 'sideways'
    
    // Assess fake breakout risk (higher in crypto due to volatility)
    const volatility = Math.abs(currentPrice - prices[currentIndex - 1]) / prices[currentIndex - 1]
    const fakeBreakoutRisk: 'low' | 'medium' | 'high' = 
      volatility > 0.1 ? 'high' : volatility > 0.05 ? 'medium' : 'low'
    
    // Estimate completion timeframe (crypto moves faster)
    const wedgeDuration = recentHighs[1].index - recentHighs[0].index
    const completionTimeframe: 'short' | 'medium' | 'long' = 
      wedgeDuration < 10 ? 'short' : wedgeDuration < 20 ? 'medium' : 'long'
    
    let confidence = 0.5 // Start lower for crypto markets
    if (volumeConfirmation) confidence += 0.15
    if (rsiConfirmation) confidence += 0.15
    if (maConfirmation) confidence += 0.1
    if (marketContext === 'uptrend') confidence += 0.1 // Rising wedge in uptrend is more bearish
    
    const strength = confidence >= 0.8 ? 'strong' : confidence >= 0.65 ? 'moderate' : 'weak'
    
    const entryPrice = currentPrice
    const wedgeHeight = recentHighs[1].price - recentLows[1].price
    const stopLoss = recentHighs[1].price * 1.015 // Tighter stop for crypto
    const targetPrice = recentLows[1].price - wedgeHeight
    const takeProfit = targetPrice
    const risk = stopLoss - entryPrice
    const reward = entryPrice - takeProfit
    const riskRewardRatio = risk > 0 ? reward / risk : 0
    
    // Generate trading advice based on pattern analysis
    const tradingAdvice = this.generateRisingWedgeAdvice(
      confidence, fakeBreakoutRisk, marketContext, completionTimeframe, volumeConfirmation
    )
    
    // Risk management guidance
    const riskManagement = this.generateRiskManagementAdvice(
      fakeBreakoutRisk, completionTimeframe, riskRewardRatio, marketContext
    )
    
    return {
      index: currentIndex,
      pattern: 'Rising Wedge',
      signal: 'bearish',
      confidence: Math.min(confidence, 1.0),
      strength,
      volumeConfirmation,
      rsiConfirmation,
      maConfirmation,
      breakoutConfirmation: false, // Will be true after breakout
      fakeBreakoutRisk,
      marketContext,
      completionTimeframe,
      description: `Bearish rising wedge pattern detected. ${marketContext} market context. ${volumeConfirmation ? 'Volume declining confirms weakness.' : 'Volume not confirming.'} ${rsiConfirmation ? 'RSI divergence present.' : ''} ${maConfirmation ? 'Below key moving averages.' : ''} Expected completion: ${completionTimeframe}.`,
      entryPrice,
      stopLoss,
      takeProfit,
      riskRewardRatio,
      upperTrendline,
      lowerTrendline,
      apexIndex: currentIndex + Math.floor(wedgeDuration * 1.2), // Better apex estimation
      targetPrice,
      tradingAdvice,
      riskManagement
    }
  }

  /**
   * Detect Falling Wedge Pattern (Bullish)
   * Rule: A falling wedge is bullish - both highs and lows are falling but converging
   * Strong pattern in both uptrends and downtrends, often signaling next leg up
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
    
    // Enhanced volume analysis for crypto markets
    const currentVolume = volumes[currentIndex] || 0
    const recentVolumes = volumes.slice(currentIndex - 10, currentIndex)
    const avgVolume = recentVolumes.reduce((sum, vol) => sum + vol, 0) / recentVolumes.length
    const volumeTrend = recentVolumes.slice(-3).reduce((sum, vol) => sum + vol, 0) / 3
    // For falling wedge, we want decreasing volume during formation, then increasing on breakout
    const volumeConfirmation = currentVolume < avgVolume * 0.7 && volumeTrend < avgVolume * 0.8
    
    // Enhanced RSI analysis with divergence detection
    const currentRSI = rsi[currentIndex] || 50
    const earlierRSI = rsi[recentLows[0].index] || 50
    const rsiConfirmation = currentRSI > earlierRSI && recentLows[1].price < recentLows[0].price && currentRSI < 40
    
    // Check market context and MA confirmation
    const currentPrice = prices[currentIndex]
    const currentSMA20 = sma20[currentIndex] || currentPrice
    const currentSMA50 = sma50[currentIndex] || currentPrice
    const maConfirmation = currentPrice > currentSMA20 && currentPrice > currentSMA50
    
    // Determine market context
    const priceChange = (currentPrice - prices[Math.max(0, currentIndex - 20)]) / prices[Math.max(0, currentIndex - 20)]
    const marketContext: 'uptrend' | 'downtrend' | 'sideways' = 
      priceChange > 0.05 ? 'uptrend' : priceChange < -0.05 ? 'downtrend' : 'sideways'
    
    // Assess fake breakout risk (higher in crypto due to volatility)
    const volatility = Math.abs(currentPrice - prices[currentIndex - 1]) / prices[currentIndex - 1]
    const fakeBreakoutRisk: 'low' | 'medium' | 'high' = 
      volatility > 0.1 ? 'high' : volatility > 0.05 ? 'medium' : 'low'
    
    // Estimate completion timeframe (crypto moves faster)
    const wedgeDuration = recentHighs[1].index - recentHighs[0].index
    const completionTimeframe: 'short' | 'medium' | 'long' = 
      wedgeDuration < 10 ? 'short' : wedgeDuration < 20 ? 'medium' : 'long'
    
    let confidence = 0.6 // Higher base confidence for falling wedge (bullish bias)
    if (volumeConfirmation) confidence += 0.15
    if (rsiConfirmation) confidence += 0.15
    if (maConfirmation) confidence += 0.1
    if (marketContext === 'downtrend') confidence += 0.1 // Falling wedge in downtrend is more bullish (reversal)
    
    const strength = confidence >= 0.8 ? 'strong' : confidence >= 0.7 ? 'moderate' : 'weak'
    
    const entryPrice = currentPrice
    const wedgeHeight = recentHighs[1].price - recentLows[1].price
    const stopLoss = recentLows[1].price * 0.985 // Tighter stop for crypto
    const targetPrice = recentHighs[1].price + wedgeHeight
    const takeProfit = targetPrice
    const risk = entryPrice - stopLoss
    const reward = takeProfit - entryPrice
    const riskRewardRatio = risk > 0 ? reward / risk : 0
    
    // Generate trading advice based on pattern analysis
    const tradingAdvice = this.generateFallingWedgeAdvice(
      confidence, fakeBreakoutRisk, marketContext, completionTimeframe, volumeConfirmation
    )
    
    // Risk management guidance
    const riskManagement = this.generateRiskManagementAdvice(
      fakeBreakoutRisk, completionTimeframe, riskRewardRatio, marketContext
    )
    
    return {
      index: currentIndex,
      pattern: 'Falling Wedge',
      signal: 'bullish',
      confidence: Math.min(confidence, 1.0),
      strength,
      volumeConfirmation,
      rsiConfirmation,
      maConfirmation,
      breakoutConfirmation: false, // Will be true after breakout
      fakeBreakoutRisk,
      marketContext,
      completionTimeframe,
      description: `Bullish falling wedge pattern detected. ${marketContext} market context. ${volumeConfirmation ? 'Volume declining during formation confirms pattern.' : 'Volume not confirming.'} ${rsiConfirmation ? 'RSI divergence present.' : ''} ${maConfirmation ? 'Above key moving averages.' : ''} Expected completion: ${completionTimeframe}.`,
      entryPrice,
      stopLoss,
      takeProfit,
      riskRewardRatio,
      upperTrendline,
      lowerTrendline,
      apexIndex: currentIndex + Math.floor(wedgeDuration * 1.2), // Better apex estimation
      targetPrice,
      tradingAdvice,
      riskManagement
    }
  }

  /**
   * Generate trading advice for rising wedge patterns
   */
  private static generateRisingWedgeAdvice(
    confidence: number,
    fakeBreakoutRisk: 'low' | 'medium' | 'high',
    marketContext: 'uptrend' | 'downtrend' | 'sideways',
    completionTimeframe: 'short' | 'medium' | 'long',
    volumeConfirmation: boolean
  ): string {
    let advice = "Rising wedge detected - bearish signal. "
    
    if (confidence >= 0.8) {
      advice += "High confidence setup. Consider short position on breakdown below lower trendline. "
    } else if (confidence >= 0.65) {
      advice += "Moderate confidence. Wait for clear breakdown with volume confirmation. "
    } else {
      advice += "Low confidence. Monitor for additional confirmation signals. "
    }
    
    if (marketContext === 'uptrend') {
      advice += "Particularly bearish in uptrend - potential trend reversal. "
    }
    
    if (fakeBreakoutRisk === 'high') {
      advice += "High fake breakout risk in volatile crypto market - use tight stops. "
    }
    
    if (completionTimeframe === 'short') {
      advice += "Quick completion expected in crypto - monitor closely. "
    }
    
    if (!volumeConfirmation) {
      advice += "Volume not confirming - wait for volume spike on breakdown. "
    }
    
    return advice.trim()
  }

  /**
   * Generate trading advice for falling wedge patterns
   */
  private static generateFallingWedgeAdvice(
    confidence: number,
    fakeBreakoutRisk: 'low' | 'medium' | 'high',
    marketContext: 'uptrend' | 'downtrend' | 'sideways',
    completionTimeframe: 'short' | 'medium' | 'long',
    volumeConfirmation: boolean
  ): string {
    let advice = "Falling wedge detected - bullish signal. "
    
    if (confidence >= 0.8) {
      advice += "High confidence setup. Consider long position on breakout above upper trendline. "
    } else if (confidence >= 0.7) {
      advice += "Good confidence. Wait for clear breakout with volume confirmation. "
    } else {
      advice += "Moderate confidence. Monitor for additional confirmation signals. "
    }
    
    if (marketContext === 'downtrend') {
      advice += "Particularly bullish in downtrend - potential reversal signal. "
    } else if (marketContext === 'uptrend') {
      advice += "Continuation pattern in uptrend - next leg up expected. "
    }
    
    if (fakeBreakoutRisk === 'high') {
      advice += "High fake breakout risk in volatile crypto market - use tight stops and wait for confirmation. "
    }
    
    if (completionTimeframe === 'short') {
      advice += "Quick completion expected in crypto - monitor closely for breakout. "
    }
    
    if (!volumeConfirmation) {
      advice += "Volume not confirming during formation - wait for volume spike on breakout. "
    }
    
    return advice.trim()
  }

  /**
   * Generate risk management advice for wedge patterns
   */
  private static generateRiskManagementAdvice(
    fakeBreakoutRisk: 'low' | 'medium' | 'high',
    completionTimeframe: 'short' | 'medium' | 'long',
    riskRewardRatio: number,
    marketContext: 'uptrend' | 'downtrend' | 'sideways'
  ): string {
    let advice = "Risk Management: "
    
    if (fakeBreakoutRisk === 'high') {
      advice += "High fake breakout risk - use strict stop-loss discipline. Never risk more than 2% of capital. "
    } else if (fakeBreakoutRisk === 'medium') {
      advice += "Moderate fake breakout risk - use stop-losses and position sizing. "
    }
    
    if (completionTimeframe === 'short') {
      advice += "Fast crypto market - be prepared for quick moves and adjust stops accordingly. "
    }
    
    if (riskRewardRatio < 1.5) {
      advice += "Poor risk/reward ratio - consider smaller position size or wait for better setup. "
    } else if (riskRewardRatio >= 2) {
      advice += "Good risk/reward ratio - consider standard position sizing. "
    }
    
    advice += "Remember: Wedge patterns are high-probability setups but not certainties. "
    advice += "In crypto markets, patterns can complete within days due to higher volatility. "
    advice += "Always use proper position sizing and stop-losses."
    
    return advice
  }
}
