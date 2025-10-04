import type { TechnicalAnalysisData, ChartDataPoint } from '../types'

export interface BullishnessScore {
  overall: number // 0-100
  technical: number // 0-100
  momentum: number // 0-100
  volume: number // 0-100
  trend: number // 0-100
  breakdown: {
    movingAverages: number
    rsi: number
    macd: number
    volumeAnalysis: number
    priceAction: number
    trendStrength: number
  }
  signals: {
    bullish: string[]
    bearish: string[]
    neutral: string[]
  }
}

export class BullishnessIndicator {
  private data: TechnicalAnalysisData
  private chartData: ChartDataPoint[]

  constructor(data: TechnicalAnalysisData, chartData: ChartDataPoint[]) {
    this.data = data
    this.chartData = chartData
  }

  calculateBullishnessScore(): BullishnessScore {
    const movingAverages = this.analyzeMovingAverages()
    const rsi = this.analyzeRSI()
    const macd = this.analyzeMACD()
    const volumeAnalysis = this.analyzeVolume()
    const priceAction = this.analyzePriceAction()
    const trendStrength = this.analyzeTrendStrength()

    const breakdown = {
      movingAverages,
      rsi,
      macd,
      volumeAnalysis,
      priceAction,
      trendStrength
    }

    // Weighted technical score
    const technical = Math.round(
      (movingAverages * 0.25) +
      (rsi * 0.20) +
      (macd * 0.20) +
      (volumeAnalysis * 0.15) +
      (priceAction * 0.10) +
      (trendStrength * 0.10)
    )

    // Overall score (technical + momentum + volume + trend)
    const momentum = Math.round((rsi + macd) / 2)
    const volume = volumeAnalysis
    const trend = Math.round((movingAverages + trendStrength) / 2)

    const overall = Math.round(
      (technical * 0.4) +
      (momentum * 0.25) +
      (volume * 0.20) +
      (trend * 0.15)
    )

    const signals = this.generateSignals(breakdown)

    return {
      overall: Math.max(0, Math.min(100, overall)),
      technical: Math.max(0, Math.min(100, technical)),
      momentum: Math.max(0, Math.min(100, momentum)),
      volume: Math.max(0, Math.min(100, volume)),
      trend: Math.max(0, Math.min(100, trend)),
      breakdown,
      signals
    }
  }

  private analyzeMovingAverages(): number {
    if (!this.data.sma20 || !this.data.sma50 || !this.data.ema9 || !this.data.ema20) {
      return 50 // Neutral if no data
    }

    const latest = this.chartData[this.chartData.length - 1]
    const currentPrice = latest.price

    // Get latest MA values
    const sma20 = this.data.sma20[this.data.sma20.length - 1]
    const sma50 = this.data.sma50[this.data.sma50.length - 1]
    const ema9 = this.data.ema9[this.data.ema9.length - 1]
    const ema20 = this.data.ema20[this.data.ema20.length - 1]

    let score = 50 // Start neutral

    // Price above MAs (bullish)
    if (currentPrice > sma20) score += 15
    if (currentPrice > sma50) score += 15
    if (currentPrice > ema9) score += 10
    if (currentPrice > ema20) score += 10

    // MA alignment (bullish when short > long)
    if (sma20 > sma50) score += 15
    if (ema9 > ema20) score += 15
    if (sma20 > ema20) score += 10

    // MA slope analysis (increasing MAs are bullish)
    const sma20Slope = this.calculateSlope(this.data.sma20.slice(-5))
    const ema9Slope = this.calculateSlope(this.data.ema9.slice(-5))
    
    if (sma20Slope > 0) score += 10
    if (ema9Slope > 0) score += 10

    return Math.max(0, Math.min(100, score))
  }

  private analyzeRSI(): number {
    if (!this.data.rsi) return 50

    const latestRSI = this.data.rsi[this.data.rsi.length - 1]
    
    // RSI scoring
    if (latestRSI > 70) return 20 // Overbought
    if (latestRSI > 60) return 60 // Bullish momentum
    if (latestRSI > 50) return 70 // Above neutral
    if (latestRSI > 40) return 50 // Neutral
    if (latestRSI > 30) return 30 // Below neutral
    return 10 // Oversold
  }

  private analyzeMACD(): number {
    if (!this.data.macd) return 50

    const macd = this.data.macd.macd
    const signal = this.data.macd.signal
    const histogram = this.data.macd.histogram

    const latestMACD = macd[macd.length - 1]
    const latestSignal = signal[signal.length - 1]
    const latestHistogram = histogram[histogram.length - 1]

    let score = 50

    // MACD above signal line (bullish)
    if (latestMACD > latestSignal) score += 20

    // MACD above zero (bullish)
    if (latestMACD > 0) score += 15

    // Histogram increasing (bullish momentum)
    if (latestHistogram > 0) score += 15

    // MACD slope analysis
    const macdSlope = this.calculateSlope(macd.slice(-3))
    if (macdSlope > 0) score += 10

    return Math.max(0, Math.min(100, score))
  }

  private analyzeVolume(): number {
    if (!this.data.volumeAnalysis) return 50

    const volumeRatio = this.data.volumeAnalysis.volumeRatio
    // const volumeSMA = this.data.volumeAnalysis.volumeSMA

    const latestRatio = volumeRatio[volumeRatio.length - 1]
    // const latestSMA = volumeSMA[volumeSMA.length - 1]

    let score = 50

    // High volume relative to average (bullish)
    if (latestRatio > 1.5) score += 20
    else if (latestRatio > 1.2) score += 15
    else if (latestRatio > 1.0) score += 10

    // Volume trend analysis
    const volumeSlope = this.calculateSlope(volumeRatio.slice(-5))
    if (volumeSlope > 0) score += 15

    return Math.max(0, Math.min(100, score))
  }

  private analyzePriceAction(): number {
    if (this.chartData.length < 3) return 50

    const recent = this.chartData.slice(-5)
    let score = 50

    // Higher highs and higher lows pattern
    let higherHighs = 0
    let higherLows = 0

    for (let i = 1; i < recent.length; i++) {
      if (recent[i].price > recent[i-1].price) higherHighs++
      if (recent[i].price > recent[i-1].price) higherLows++
    }

    if (higherHighs >= 3) score += 20
    if (higherLows >= 3) score += 20

    // Price momentum
    const priceChange = (recent[recent.length - 1].price - recent[0].price) / recent[0].price
    if (priceChange > 0.05) score += 15 // 5%+ gain
    else if (priceChange > 0.02) score += 10 // 2%+ gain
    else if (priceChange < -0.05) score -= 20 // 5%+ loss

    return Math.max(0, Math.min(100, score))
  }

  private analyzeTrendStrength(): number {
    if (this.chartData.length < 10) return 50

    const recent = this.chartData.slice(-10)
    const prices = recent.map(p => p.price)
    
    // Linear regression to determine trend strength
    const trend = this.calculateLinearTrend(prices)
    const rSquared = this.calculateRSquared(prices, trend)

    let score = 50

    // Strong upward trend
    if (trend.slope > 0 && rSquared > 0.7) score += 30
    else if (trend.slope > 0 && rSquared > 0.5) score += 20
    else if (trend.slope > 0) score += 10
    else if (trend.slope < -0.1) score -= 20

    return Math.max(0, Math.min(100, score))
  }

  private generateSignals(breakdown: any): { bullish: string[]; bearish: string[]; neutral: string[] } {
    const signals = {
      bullish: [] as string[],
      bearish: [] as string[],
      neutral: [] as string[]
    }

    // Moving Average signals
    if (breakdown.movingAverages > 70) {
      signals.bullish.push('Strong MA alignment - Price above key moving averages')
    } else if (breakdown.movingAverages < 30) {
      signals.bearish.push('Weak MA alignment - Price below key moving averages')
    }

    // RSI signals
    if (breakdown.rsi > 70) {
      signals.bullish.push('RSI showing strong bullish momentum')
    } else if (breakdown.rsi < 30) {
      signals.bearish.push('RSI indicating oversold conditions')
    }

    // MACD signals
    if (breakdown.macd > 70) {
      signals.bullish.push('MACD confirming bullish trend')
    } else if (breakdown.macd < 30) {
      signals.bearish.push('MACD showing bearish divergence')
    }

    // Volume signals
    if (breakdown.volumeAnalysis > 70) {
      signals.bullish.push('High volume supporting price movement')
    } else if (breakdown.volumeAnalysis < 30) {
      signals.bearish.push('Low volume - weak conviction')
    }

    // Price action signals
    if (breakdown.priceAction > 70) {
      signals.bullish.push('Strong price action with higher highs')
    } else if (breakdown.priceAction < 30) {
      signals.bearish.push('Weak price action with lower lows')
    }

    // Trend strength signals
    if (breakdown.trendStrength > 70) {
      signals.bullish.push('Strong upward trend confirmed')
    } else if (breakdown.trendStrength < 30) {
      signals.bearish.push('Trend weakening or reversing')
    }

    return signals
  }

  private calculateSlope(values: number[]): number {
    if (values.length < 2) return 0
    
    const n = values.length
    const x = Array.from({ length: n }, (_, i) => i)
    const y = values

    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0)
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0)

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  }

  private calculateLinearTrend(prices: number[]): { slope: number; intercept: number } {
    const n = prices.length
    const x = Array.from({ length: n }, (_, i) => i)
    const y = prices

    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0)
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return { slope, intercept }
  }

  private calculateRSquared(prices: number[], trend: { slope: number; intercept: number }): number {
    const n = prices.length
    const x = Array.from({ length: n }, (_, i) => i)
    const y = prices

    const yMean = y.reduce((a, b) => a + b, 0) / n
    const yPredicted = x.map(xi => trend.slope * xi + trend.intercept)

    const ssRes = y.reduce((acc, yi, i) => acc + Math.pow(yi - yPredicted[i], 2), 0)
    const ssTot = y.reduce((acc, yi) => acc + Math.pow(yi - yMean, 2), 0)

    return 1 - (ssRes / ssTot)
  }
}

export const calculateBullishnessScore = (data: TechnicalAnalysisData, chartData: ChartDataPoint[]): BullishnessScore => {
  const indicator = new BullishnessIndicator(data, chartData)
  return indicator.calculateBullishnessScore()
}
