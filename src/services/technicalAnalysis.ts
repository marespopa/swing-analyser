import type { PriceDataPoint, Trendline, EntryPoint, TechnicalAnalysisData } from './coingeckoApi'

export class TechnicalAnalysis {
  /**
   * Calculate Simple Moving Average
   */
  static calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = []
    
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((acc, price) => acc + price, 0)
      sma.push(sum / period)
    }
    
    // Pad the beginning with the first available SMA value to extend lines to chart start
    const firstSMA = sma[0]
    return [...Array(period - 1).fill(firstSMA), ...sma]
  }

  /**
   * Calculate Exponential Moving Average (EMA)
   */
  static calculateEMA(prices: number[], period: number): number[] {
    const ema: number[] = []
    const multiplier = 2 / (period + 1)
    
    // First EMA is SMA
    const firstSMA = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period
    ema.push(firstSMA)
    
    for (let i = period; i < prices.length; i++) {
      const currentEMA = (prices[i] * multiplier) + (ema[ema.length - 1] * (1 - multiplier))
      ema.push(currentEMA)
    }
    
    // Pad the beginning with the first available EMA value to extend lines to chart start
    return [...Array(period - 1).fill(firstSMA), ...ema]
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   */
  static calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): {
    macd: number[]
    signal: number[]
    histogram: number[]
  } {
    const fastEMA = this.calculateEMA(prices, fastPeriod)
    const slowEMA = this.calculateEMA(prices, slowPeriod)
    
    const macd: number[] = []
    for (let i = 0; i < prices.length; i++) {
      if (!isNaN(fastEMA[i]) && !isNaN(slowEMA[i])) {
        macd.push(fastEMA[i] - slowEMA[i])
      } else {
        macd.push(NaN)
      }
    }
    
    const signal = this.calculateEMA(macd.filter(val => !isNaN(val)), signalPeriod)
    const paddedSignal = [...Array(macd.length - signal.length).fill(NaN), ...signal]
    
    const histogram: number[] = []
    for (let i = 0; i < macd.length; i++) {
      if (!isNaN(macd[i]) && !isNaN(paddedSignal[i])) {
        histogram.push(macd[i] - paddedSignal[i])
      } else {
        histogram.push(NaN)
      }
    }
    
    return { macd, signal: paddedSignal, histogram }
  }

  /**
   * Calculate Bollinger Bands
   */
  static calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): {
    upper: number[]
    middle: number[]
    lower: number[]
  } {
    const sma = this.calculateSMA(prices, period)
    const upper: number[] = []
    const lower: number[] = []
    
    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1)
      const mean = sma[i]
      const variance = slice.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) / period
      const standardDeviation = Math.sqrt(variance)
      
      upper.push(mean + (stdDev * standardDeviation))
      lower.push(mean - (stdDev * standardDeviation))
    }
    
    // Pad the beginning with first available values to extend lines to chart start
    const firstUpper = upper[0]
    const firstLower = lower[0]
    const paddedUpper = [...Array(period - 1).fill(firstUpper), ...upper]
    const paddedLower = [...Array(period - 1).fill(firstLower), ...lower]
    
    return {
      upper: paddedUpper,
      middle: sma,
      lower: paddedLower
    }
  }

  /**
   * Calculate Volume analysis (if volume data is available)
   */
  static calculateVolumeAnalysis(volumes: number[]): {
    volumeSMA: number[]
    volumeRatio: number[]
    volumeTrend: 'increasing' | 'decreasing' | 'stable'
  } {
    const volumeSMA = this.calculateSMA(volumes, 20)
    const volumeRatio: number[] = []
    
    for (let i = 0; i < volumes.length; i++) {
      if (!isNaN(volumeSMA[i]) && volumeSMA[i] > 0) {
        volumeRatio.push(volumes[i] / volumeSMA[i])
      } else {
        volumeRatio.push(NaN)
      }
    }
    
    // Determine volume trend
    const recentVolumes = volumes.slice(-10)
    const avgRecent = recentVolumes.reduce((sum, vol) => sum + vol, 0) / recentVolumes.length
    const avgEarlier = volumes.slice(-20, -10).reduce((sum, vol) => sum + vol, 0) / 10
    
    let volumeTrend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    if (avgRecent > avgEarlier * 1.1) volumeTrend = 'increasing'
    else if (avgRecent < avgEarlier * 0.9) volumeTrend = 'decreasing'
    
    return { volumeSMA, volumeRatio, volumeTrend }
  }

  /**
   * Detect Candlestick Patterns
   */
  static detectCandlestickPatterns(prices: number[]): {
    patterns: Array<{
      index: number
      pattern: string
      signal: 'bullish' | 'bearish' | 'neutral'
      confidence: number
    }>
  } {
    const patterns: Array<{
      index: number
      pattern: string
      signal: 'bullish' | 'bearish' | 'neutral'
      confidence: number
    }> = []

    for (let i = 2; i < prices.length; i++) {
      const current = prices[i]
      const previous = prices[i - 1]
      const beforePrevious = prices[i - 2]

      // Hammer pattern (bullish reversal)
      if (current > previous && previous < beforePrevious) {
        const bodySize = Math.abs(current - previous)
        const lowerShadow = Math.min(current, previous) - Math.min(previous, beforePrevious)
        const upperShadow = Math.max(current, previous) - Math.max(previous, beforePrevious)
        
        if (lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.5) {
          patterns.push({
            index: i,
            pattern: 'Hammer',
            signal: 'bullish',
            confidence: 0.7
          })
        }
      }

      // Shooting Star pattern (bearish reversal)
      if (current < previous && previous > beforePrevious) {
        const bodySize = Math.abs(current - previous)
        const upperShadow = Math.max(previous, beforePrevious) - Math.max(current, previous)
        const lowerShadow = Math.min(current, previous) - Math.min(previous, beforePrevious)
        
        if (upperShadow > bodySize * 2 && lowerShadow < bodySize * 0.5) {
          patterns.push({
            index: i,
            pattern: 'Shooting Star',
            signal: 'bearish',
            confidence: 0.7
          })
        }
      }

      // Doji pattern (indecision)
      const bodySize = Math.abs(current - previous)
      const totalRange = Math.max(current, previous) - Math.min(current, previous)
      
      if (bodySize < totalRange * 0.1) {
        patterns.push({
          index: i,
          pattern: 'Doji',
          signal: 'neutral',
          confidence: 0.6
        })
      }
    }

    return { patterns }
  }

  /**
   * Calculate Risk Management Levels with realistic support/resistance
   */
  static calculateRiskLevels(prices: number[]): {
    support: number[]
    resistance: number[]
    stopLoss: number[]
    takeProfit: number[]
    riskRewardRatio: number[]
  } {
    const support: number[] = []
    const resistance: number[] = []
    const stopLoss: number[] = []
    const takeProfit: number[] = []
    const riskRewardRatio: number[] = []

    // Calculate dynamic support and resistance levels
    for (let i = 0; i < prices.length; i++) {
      const currentPrice = prices[i]
      
      // Look back 20 periods for recent highs and lows
      const lookbackPeriod = Math.min(20, i)
      const recentPrices = prices.slice(Math.max(0, i - lookbackPeriod), i + 1)
      
      if (recentPrices.length < 3) {
        // Not enough data, use current price as fallback
        support.push(currentPrice * 0.95)
        resistance.push(currentPrice * 1.05)
        stopLoss.push(currentPrice * 0.93)
        takeProfit.push(currentPrice * 1.09)
        riskRewardRatio.push(2.0)
        continue
      }

      // Find recent significant highs and lows
      const recentHigh = Math.max(...recentPrices)
      const recentLow = Math.min(...recentPrices)
      const priceRange = recentHigh - recentLow
      
      // More conservative approach - use recent highs/lows with small buffers
      let supportLevel: number
      let resistanceLevel: number
      
      // Support: Use recent low with a small buffer (2-5% below recent low)
      const supportBuffer = Math.max(priceRange * 0.02, currentPrice * 0.02) // At least 2% of current price
      supportLevel = recentLow - supportBuffer
      
      // Resistance: Use recent high with a small buffer (2-5% above recent high)  
      const resistanceBuffer = Math.max(priceRange * 0.02, currentPrice * 0.02) // At least 2% of current price
      resistanceLevel = recentHigh + resistanceBuffer
      
      // Ensure levels are reasonable relative to current price
      // Support: Between 5% and 15% below current price
      supportLevel = Math.max(supportLevel, currentPrice * 0.85) // Min 15% below current price
      supportLevel = Math.min(supportLevel, currentPrice * 0.95) // Max 5% below current price
      
      // Resistance: Between 5% and 15% above current price
      resistanceLevel = Math.min(resistanceLevel, currentPrice * 1.15) // Max 15% above current price
      resistanceLevel = Math.max(resistanceLevel, currentPrice * 1.05) // Min 5% above current price
      
      support.push(supportLevel)
      resistance.push(resistanceLevel)

      // Dynamic stop loss based on volatility
      const volatility = priceRange / currentPrice
      const stopLossBuffer = Math.max(0.02, volatility * 0.5) // At least 2%, or half the volatility
      const stopLossLevel = supportLevel * (1 - stopLossBuffer)
      stopLoss.push(stopLossLevel)

      // Dynamic take profit based on risk-reward ratio
      const risk = currentPrice - stopLossLevel
      const targetRewardRatio = 2.5 // Aim for 2.5:1 risk-reward
      const takeProfitLevel = currentPrice + (risk * targetRewardRatio)
      takeProfit.push(takeProfitLevel)

      // Calculate actual risk-reward ratio
      const reward = takeProfitLevel - currentPrice
      const ratio = risk > 0 ? reward / risk : 0
      riskRewardRatio.push(ratio)
    }

    return { support, resistance, stopLoss, takeProfit, riskRewardRatio }
  }

  /**
   * Calculate Relative Strength Index (RSI)
   */
  static calculateRSI(prices: number[], period: number = 14): number[] {
    if (prices.length < period + 1) {
      return Array(prices.length).fill(NaN)
    }

    const gains: number[] = []
    const losses: number[] = []

    // Calculate price changes
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1]
      gains.push(change > 0 ? change : 0)
      losses.push(change < 0 ? Math.abs(change) : 0)
    }

    const rsi: number[] = []

    // Calculate initial average gain and loss
    let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period
    let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period

    // Calculate RSI for the first valid point
    let firstRSI: number
    if (avgLoss === 0) {
      firstRSI = 100
    } else {
      const rs = avgGain / avgLoss
      firstRSI = 100 - (100 / (1 + rs))
    }
    
    rsi.push(firstRSI)

    // Calculate RSI for remaining points using smoothed averages
    for (let i = period + 1; i < prices.length; i++) {
      avgGain = ((avgGain * (period - 1)) + gains[i - 1]) / period
      avgLoss = ((avgLoss * (period - 1)) + losses[i - 1]) / period

      if (avgLoss === 0) {
        rsi.push(100)
      } else {
        const rs = avgGain / avgLoss
        rsi.push(100 - (100 / (1 + rs)))
      }
    }

    // Pad the beginning with the first available RSI value to extend lines to chart start
    return [...Array(period).fill(firstRSI), ...rsi]
  }

  /**
   * Identify trendlines (simplified support and resistance)
   */
  static identifyTrendlines(data: PriceDataPoint[]): Trendline[] {
    if (data.length < 10) return []

    const trendlines: Trendline[] = []
    const prices = data.map(d => d.price)
    const timestamps = data.map(d => d.timestamp)

    // Find local minima and maxima
    const minima: { index: number; price: number }[] = []
    const maxima: { index: number; price: number }[] = []

    for (let i = 2; i < prices.length - 2; i++) {
      // Local minimum
      if (prices[i] < prices[i - 1] && prices[i] < prices[i - 2] && 
          prices[i] < prices[i + 1] && prices[i] < prices[i + 2]) {
        minima.push({ index: i, price: prices[i] })
      }
      
      // Local maximum
      if (prices[i] > prices[i - 1] && prices[i] > prices[i - 2] && 
          prices[i] > prices[i + 1] && prices[i] > prices[i + 2]) {
        maxima.push({ index: i, price: prices[i] })
      }
    }

    // Create support trendlines from minima
    if (minima.length >= 2) {
      for (let i = 0; i < minima.length - 1; i++) {
        for (let j = i + 1; j < minima.length; j++) {
          const slope = (minima[j].price - minima[i].price) / (minima[j].index - minima[i].index)
          const startY = minima[i].price - slope * minima[i].index
          const endY = startY + slope * (timestamps.length - 1)

          trendlines.push({
            start: { x: timestamps[minima[i].index], y: startY + slope * minima[i].index },
            end: { x: timestamps[timestamps.length - 1], y: endY },
            type: 'support'
          })
        }
      }
    }

    // Create resistance trendlines from maxima
    if (maxima.length >= 2) {
      for (let i = 0; i < maxima.length - 1; i++) {
        for (let j = i + 1; j < maxima.length; j++) {
          const slope = (maxima[j].price - maxima[i].price) / (maxima[j].index - maxima[i].index)
          const startY = maxima[i].price - slope * maxima[i].index
          const endY = startY + slope * (timestamps.length - 1)

          trendlines.push({
            start: { x: timestamps[maxima[i].index], y: startY + slope * maxima[i].index },
            end: { x: timestamps[timestamps.length - 1], y: endY },
            type: 'resistance'
          })
        }
      }
    }

    // Limit to top 3 most significant trendlines
    return trendlines.slice(0, 3)
  }

  /**
   * Identify potential entry points
   */
  static identifyEntryPoints(
    data: PriceDataPoint[], 
    sma20: number[], 
    sma50: number[], 
    rsi: number[]
  ): EntryPoint[] {
    const entryPoints: EntryPoint[] = []
    const prices = data.map(d => d.price)

    for (let i = 50; i < data.length; i++) { // Start after SMA50 is available
      const currentPrice = prices[i]
      const currentSMA20 = sma20[i]
      const currentSMA50 = sma50[i]
      const currentRSI = rsi[i]

      // Skip if any indicator is NaN
      if (isNaN(currentSMA20) || isNaN(currentSMA50) || isNaN(currentRSI)) {
        continue
      }

      const reasons: string[] = []
      let confidence: 'low' | 'medium' | 'high' = 'low'
      let score = 0

      // Golden Cross: SMA20 crosses above SMA50 (HIGH PRIORITY)
      if (i > 0 && sma20[i - 1] <= sma50[i - 1] && sma20[i] > sma50[i]) {
        reasons.push('Golden Cross (SMA20 > SMA50)')
        confidence = 'high'
        score += 100
      }

      // RSI Oversold with price recovery (HIGH PRIORITY)
      if (currentRSI < 30 && currentRSI > rsi[i - 1]) {
        reasons.push('RSI Oversold Recovery')
        confidence = 'high'
        score += 80
      }

      // Strong RSI momentum (MEDIUM PRIORITY)
      if (currentRSI > 45 && currentRSI < 55 && currentRSI > rsi[i - 1] && rsi[i - 1] > rsi[i - 2]) {
        reasons.push('RSI Bullish Momentum')
        confidence = 'medium'
        score += 40
      }

      // Price breaks above both SMAs with volume (MEDIUM PRIORITY)
      if (currentPrice > currentSMA20 && currentPrice > currentSMA50 && 
          prices[i - 1] <= sma20[i - 1]) {
        reasons.push('Price Breakout above SMAs')
        confidence = 'medium'
        score += 60
      }

      // Only add if we have meaningful signals
      if (reasons.length > 0 && score >= 40) {
        entryPoints.push({
          timestamp: data[i].timestamp,
          price: currentPrice,
          reason: reasons.join(', '),
          confidence
        })
      }
    }

    // Sort by confidence and limit to top signals
    const sortedPoints = entryPoints.sort((a, b) => {
      const confidenceOrder = { 'high': 3, 'medium': 2, 'low': 1 }
      return confidenceOrder[b.confidence] - confidenceOrder[a.confidence]
    })

    // Limit to maximum 15 signals per timeframe
    return sortedPoints.slice(0, 15)
  }

  /**
   * Calculate Fibonacci retracement levels using proper swing analysis
   */
  static calculateFibonacciLevels(prices: number[]): {
    level0: number
    level236: number
    level382: number
    level500: number
    level618: number
    level764: number
    level786: number
    level1000: number
    swingHigh: number
    swingLow: number
    trend: 'uptrend' | 'downtrend' | 'sideways'
  } {
    if (prices.length < 20) {
      const currentPrice = prices[0] || 0
      return {
        level0: currentPrice,
        level236: currentPrice,
        level382: currentPrice,
        level500: currentPrice,
        level618: currentPrice,
        level764: currentPrice,
        level786: currentPrice,
        level1000: currentPrice,
        swingHigh: currentPrice,
        swingLow: currentPrice,
        trend: 'sideways'
      }
    }

    // Find significant swing highs and lows using a more sophisticated approach
    const lookbackPeriod = Math.min(100, prices.length)
    const recentPrices = prices.slice(-lookbackPeriod)
    
    // Find swing highs and lows using local extrema detection
    const swingHighs: number[] = []
    const swingLows: number[] = []
    const window = 5 // Look for peaks/troughs within 5 periods
    
    for (let i = window; i < recentPrices.length - window; i++) {
      const currentPrice = recentPrices[i]
      
      // Check for swing high
      const isSwingHigh = recentPrices.slice(i - window, i).every(p => p < currentPrice) &&
                         recentPrices.slice(i + 1, i + window + 1).every(p => p < currentPrice)
      
      // Check for swing low
      const isSwingLow = recentPrices.slice(i - window, i).every(p => p > currentPrice) &&
                        recentPrices.slice(i + 1, i + window + 1).every(p => p > currentPrice)
      
      if (isSwingHigh) swingHighs.push(currentPrice)
      if (isSwingLow) swingLows.push(currentPrice)
    }
    
    // Get the most recent significant swing high and low
    const swingHigh = swingHighs.length > 0 ? Math.max(...swingHighs) : Math.max(...recentPrices)
    const swingLow = swingLows.length > 0 ? Math.min(...swingLows) : Math.min(...recentPrices)
    
    // Determine trend based on swing analysis
    const currentPrice = recentPrices[recentPrices.length - 1]
    const priceChange = (currentPrice - swingLow) / (swingHigh - swingLow)
    
    let trend: 'uptrend' | 'downtrend' | 'sideways' = 'sideways'
    if (priceChange > 0.6) trend = 'uptrend'
    else if (priceChange < 0.4) trend = 'downtrend'
    
    // Calculate Fibonacci levels - always use the higher value as high, lower as low
    const high = Math.max(swingHigh, swingLow)
    const low = Math.min(swingHigh, swingLow)
    
    // Determine which is the actual swing high and low for labeling
    const actualSwingHigh = swingHigh
    const actualSwingLow = swingLow
    
    const range = high - low

    return {
      level0: high,           // 0% (100% of the move)
      level236: high - (range * 0.236),  // 23.6% retracement
      level382: high - (range * 0.382),  // 38.2% retracement
      level500: high - (range * 0.500),  // 50% retracement
      level618: high - (range * 0.618),  // 61.8% retracement (golden ratio)
      level764: high - (range * 0.764),  // 76.4% retracement
      level786: high - (range * 0.786),  // 78.6% retracement
      level1000: low,         // 100% retracement (0% of the move)
      swingHigh: actualSwingHigh,
      swingLow: actualSwingLow,
      trend
    }
  }

  /**
   * Perform complete technical analysis
   */
  static performAnalysis(data: PriceDataPoint[]): TechnicalAnalysisData {
    if (data.length < 50) {
      throw new Error('Insufficient data for technical analysis. Need at least 50 data points.')
    }

    const prices = data.map(d => d.price)
    
    // Calculate basic indicators
    const sma20 = this.calculateSMA(prices, 20)
    const sma50 = this.calculateSMA(prices, 50)
    const rsi = this.calculateRSI(prices, 14)
    
    // Calculate advanced indicators
    const macd = this.calculateMACD(prices)
    const bollingerBands = this.calculateBollingerBands(prices)
    
    // Calculate risk management levels
    const riskLevels = this.calculateRiskLevels(prices)
    
    // Calculate Fibonacci retracement levels
    const fibonacciLevels = this.calculateFibonacciLevels(prices)
    
    // Detect candlestick patterns
    const candlestickPatterns = this.detectCandlestickPatterns(prices)
    
    // Identify trendlines and entry points
    const trendlines = this.identifyTrendlines(data)
    const entryPoints = this.identifyEntryPoints(data, sma20, sma50, rsi)

    return {
      interval: '1d', // This will be set by the calling function
      data,
      sma20,
      sma50,
      rsi,
      macd,
      bollingerBands,
      riskLevels,
      fibonacciLevels,
      candlestickPatterns,
      trendlines,
      entryPoints
    }
  }
}
