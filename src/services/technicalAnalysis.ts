import type { CryptoAsset, PortfolioAsset } from '../types'

export interface TechnicalIndicators {
  rsi: number
  sma50: number
  sma200: number
  bollingerBands: {
    upper: number
    middle: number
    lower: number
    bandwidth: number
    percentB: number
  }
  macd: {
    macd: number
    signal: number
    histogram: number
  }
  volumeAnalysis: {
    volumeSMA: number
    volumeRatio: number
    priceVolumeTrend: number
  }
}

export interface AdvancedMetrics {
  sharpeRatio: number
  beta: number
  correlation: number
  var95: number // 95% Value at Risk
  maxDrawdown: number
  volatility: number
  expectedReturn: number
}

export interface SwingTradeSignal {
  asset: CryptoAsset
  signal: 'buy' | 'sell' | 'hold'
  strength: 'weak' | 'moderate' | 'strong'
  confidence: number
  reasons: string[]
  technicalScore: number
  riskScore: number
}

export class TechnicalAnalysisService {
  // RSI calculation (14-period default)
  static calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50 // Neutral if insufficient data

    let gains = 0
    let losses = 0

    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1]
      if (change > 0) {
        gains += change
      } else {
        losses += Math.abs(change)
      }
    }

    let avgGain = gains / period
    let avgLoss = losses / period

    // Calculate RSI using smoothed averages
    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1]
      if (change > 0) {
        avgGain = (avgGain * (period - 1) + change) / period
        avgLoss = (avgLoss * (period - 1)) / period
      } else {
        avgGain = (avgGain * (period - 1)) / period
        avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period
      }
    }

    if (avgLoss === 0) return 100
    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
  }

  // Simple Moving Average
  static calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1]
    
    const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0)
    return sum / period
  }

  // Bollinger Bands calculation
  static calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
    if (prices.length < period) {
      const currentPrice = prices[prices.length - 1]
      return {
        upper: currentPrice * 1.1,
        middle: currentPrice,
        lower: currentPrice * 0.9,
        bandwidth: 0.2,
        percentB: 0.5
      }
    }

    const sma = this.calculateSMA(prices, period)
    const recentPrices = prices.slice(-period)
    
    // Calculate standard deviation
    const variance = recentPrices.reduce((acc, price) => {
      return acc + Math.pow(price - sma, 2)
    }, 0) / period
    const standardDeviation = Math.sqrt(variance)

    const upper = sma + (standardDeviation * stdDev)
    const lower = sma - (standardDeviation * stdDev)
    const bandwidth = (upper - lower) / sma
    const percentB = (prices[prices.length - 1] - lower) / (upper - lower)

    return {
      upper,
      middle: sma,
      lower,
      bandwidth,
      percentB
    }
  }

  // MACD calculation
  static calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
    if (prices.length < slowPeriod) {
      return {
        macd: 0,
        signal: 0,
        histogram: 0
      }
    }

    const ema12 = this.calculateEMA(prices, fastPeriod)
    const ema26 = this.calculateEMA(prices, slowPeriod)
    const macd = ema12 - ema26

    // Calculate signal line (EMA of MACD)
    const macdValues = this.calculateMACDValues(prices, fastPeriod, slowPeriod)
    const signal = this.calculateEMA(macdValues, signalPeriod)
    const histogram = macd - signal

    return { macd, signal, histogram }
  }

  // Exponential Moving Average
  private static calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1]

    const multiplier = 2 / (period + 1)
    let ema = prices[0]

    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier))
    }

    return ema
  }

  // Calculate MACD values for signal line
  private static calculateMACDValues(prices: number[], fastPeriod: number, slowPeriod: number): number[] {
    const macdValues: number[] = []
    
    for (let i = slowPeriod - 1; i < prices.length; i++) {
      const fastEMA = this.calculateEMA(prices.slice(0, i + 1), fastPeriod)
      const slowEMA = this.calculateEMA(prices.slice(0, i + 1), slowPeriod)
      macdValues.push(fastEMA - slowEMA)
    }

    return macdValues
  }

  // Volume analysis
  static calculateVolumeAnalysis(prices: number[], volumes: number[], period: number = 20) {
    if (prices.length < period || volumes.length < period) {
      return {
        volumeSMA: volumes[volumes.length - 1] || 0,
        volumeRatio: 1,
        priceVolumeTrend: 0
      }
    }

    const volumeSMA = this.calculateSMA(volumes, period)
    const currentVolume = volumes[volumes.length - 1]
    const volumeRatio = currentVolume / volumeSMA

    // Price Volume Trend (PVT)
    let pvt = 0
    for (let i = 1; i < prices.length; i++) {
      const priceChange = (prices[i] - prices[i - 1]) / prices[i - 1]
      pvt += priceChange * volumes[i]
    }

    return {
      volumeSMA,
      volumeRatio,
      priceVolumeTrend: pvt
    }
  }

  // Calculate all technical indicators
  static calculateAllIndicators(asset: CryptoAsset): TechnicalIndicators {
    const prices = asset.sparkline_in_7d?.price || []
    const volumes = new Array(prices.length).fill(asset.total_volume / prices.length) // Approximate daily volumes

    const rsi = this.calculateRSI(prices)
    const sma50 = this.calculateSMA(prices, Math.min(50, prices.length))
    const sma200 = this.calculateSMA(prices, Math.min(200, prices.length))
    const bollingerBands = this.calculateBollingerBands(prices)
    const macd = this.calculateMACD(prices)
    const volumeAnalysis = this.calculateVolumeAnalysis(prices, volumes)

    return {
      rsi,
      sma50,
      sma200,
      bollingerBands,
      macd,
      volumeAnalysis
    }
  }

  // Advanced Metrics Calculations

  // Sharpe Ratio (risk-adjusted returns)
  static calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
    if (returns.length < 2) return 0

    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
    const stdDev = Math.sqrt(variance)

    if (stdDev === 0) return 0
    return (avgReturn - riskFreeRate) / stdDev
  }

  // Beta calculation (market correlation)
  static calculateBeta(assetReturns: number[], marketReturns: number[]): number {
    if (assetReturns.length !== marketReturns.length || assetReturns.length < 2) return 1

    const assetMean = assetReturns.reduce((sum, ret) => sum + ret, 0) / assetReturns.length
    const marketMean = marketReturns.reduce((sum, ret) => sum + ret, 0) / marketReturns.length

    let numerator = 0
    let denominator = 0

    for (let i = 0; i < assetReturns.length; i++) {
      const assetDiff = assetReturns[i] - assetMean
      const marketDiff = marketReturns[i] - marketMean
      numerator += assetDiff * marketDiff
      denominator += marketDiff * marketDiff
    }

    return denominator === 0 ? 1 : numerator / denominator
  }

  // Correlation calculation
  static calculateCorrelation(returns1: number[], returns2: number[]): number {
    if (returns1.length !== returns2.length || returns1.length < 2) return 0

    const mean1 = returns1.reduce((sum, ret) => sum + ret, 0) / returns1.length
    const mean2 = returns2.reduce((sum, ret) => sum + ret, 0) / returns2.length

    let numerator = 0
    let sumSq1 = 0
    let sumSq2 = 0

    for (let i = 0; i < returns1.length; i++) {
      const diff1 = returns1[i] - mean1
      const diff2 = returns2[i] - mean2
      numerator += diff1 * diff2
      sumSq1 += diff1 * diff1
      sumSq2 += diff2 * diff2
    }

    const denominator = Math.sqrt(sumSq1 * sumSq2)
    return denominator === 0 ? 0 : numerator / denominator
  }

  // Value at Risk (VaR) calculation
  static calculateVaR(returns: number[], confidenceLevel: number = 0.95): number {
    if (returns.length < 2) return 0

    const sortedReturns = [...returns].sort((a, b) => a - b)
    const index = Math.floor((1 - confidenceLevel) * sortedReturns.length)
    return Math.abs(sortedReturns[index] || 0)
  }

  // Maximum Drawdown calculation
  static calculateMaxDrawdown(prices: number[]): number {
    if (prices.length < 2) return 0

    let maxDrawdown = 0
    let peak = prices[0]

    for (let i = 1; i < prices.length; i++) {
      if (prices[i] > peak) {
        peak = prices[i]
      } else {
        const drawdown = (peak - prices[i]) / peak
        maxDrawdown = Math.max(maxDrawdown, drawdown)
      }
    }

    return maxDrawdown
  }

  // Calculate all advanced metrics
  static calculateAdvancedMetrics(asset: CryptoAsset, marketReturns: number[] = []): AdvancedMetrics {
    const prices = asset.sparkline_in_7d?.price || []
    const returns = this.calculateReturns(prices)
    
    // Use market returns if available, otherwise use asset returns as proxy
    const marketData = marketReturns.length > 0 ? marketReturns : returns
    
    const sharpeRatio = this.calculateSharpeRatio(returns)
    const beta = this.calculateBeta(returns, marketData)
    const correlation = this.calculateCorrelation(returns, marketData)
    const var95 = this.calculateVaR(returns, 0.95)
    const maxDrawdown = this.calculateMaxDrawdown(prices)
    const volatility = this.calculateVolatility(returns)
    const expectedReturn = this.calculateExpectedReturn(returns)

    return {
      sharpeRatio,
      beta,
      correlation,
      var95,
      maxDrawdown,
      volatility,
      expectedReturn
    }
  }

  // Helper methods
  private static calculateReturns(prices: number[]): number[] {
    const returns: number[] = []
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
    }
    return returns
  }

  private static calculateVolatility(returns: number[]): number {
    if (returns.length < 2) return 0
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length
    return Math.sqrt(variance)
  }

  private static calculateExpectedReturn(returns: number[]): number {
    if (returns.length === 0) return 0
    return returns.reduce((sum, ret) => sum + ret, 0) / returns.length
  }

  // Generate swing trade signals based on technical analysis
  static generateSwingTradeSignal(asset: CryptoAsset, portfolioAssets?: PortfolioAsset[]): SwingTradeSignal {
    const indicators = this.calculateAllIndicators(asset)
    const metrics = this.calculateAdvancedMetrics(asset)
    
    let signal: 'buy' | 'sell' | 'hold' = 'hold'
    let strength: 'weak' | 'moderate' | 'strong' = 'weak'
    let confidence = 50
    const reasons: string[] = []
    let technicalScore = 0
    let riskScore = 0

    // Check if asset is in portfolio for sell signals
    const isInPortfolio = portfolioAssets?.some(portfolioAsset => portfolioAsset.id === asset.id) ?? false

    // RSI Analysis
    if (indicators.rsi < 30) {
      signal = 'buy'
      strength = indicators.rsi < 20 ? 'strong' : 'moderate'
      confidence += 20
      reasons.push(`RSI oversold (${indicators.rsi.toFixed(1)})`)
      technicalScore += 30
    } else if (indicators.rsi > 70 && isInPortfolio) {
      // Only generate sell signals if asset is in portfolio
      signal = 'sell'
      strength = indicators.rsi > 80 ? 'strong' : 'moderate'
      confidence += 20
      reasons.push(`RSI overbought (${indicators.rsi.toFixed(1)})`)
      technicalScore += 30
    }

    // Moving Average Analysis
    const currentPrice = asset.current_price
    if (currentPrice > indicators.sma50 && indicators.sma50 > indicators.sma200) {
      if (signal === 'buy') {
        confidence += 15
        reasons.push('Bullish MA trend (price > SMA50 > SMA200)')
        technicalScore += 20
      }
    } else if (currentPrice < indicators.sma50 && indicators.sma50 < indicators.sma200) {
      if (signal === 'sell' && isInPortfolio) {
        confidence += 15
        reasons.push('Bearish MA trend (price < SMA50 < SMA200)')
        technicalScore += 20
      }
    }

    // Bollinger Bands Analysis
    if (indicators.bollingerBands.percentB < 0.2) {
      if (signal === 'buy') {
        confidence += 10
        reasons.push('Price near lower Bollinger Band')
        technicalScore += 15
      }
    } else if (indicators.bollingerBands.percentB > 0.8) {
      if (signal === 'sell' && isInPortfolio) {
        confidence += 10
        reasons.push('Price near upper Bollinger Band')
        technicalScore += 15
      }
    }

    // MACD Analysis
    if (indicators.macd.histogram > 0 && indicators.macd.macd > indicators.macd.signal) {
      if (signal === 'buy') {
        confidence += 10
        reasons.push('MACD bullish crossover')
        technicalScore += 15
      }
    } else if (indicators.macd.histogram < 0 && indicators.macd.macd < indicators.macd.signal) {
      if (signal === 'sell' && isInPortfolio) {
        confidence += 10
        reasons.push('MACD bearish crossover')
        technicalScore += 15
      }
    }

    // Volume Analysis
    if (indicators.volumeAnalysis.volumeRatio > 1.5) {
      confidence += 5
      reasons.push('High volume confirmation')
      technicalScore += 10
    }

    // Risk Assessment
    if (metrics.maxDrawdown > 0.3) {
      riskScore += 30
      reasons.push('High historical drawdown')
    }
    if (metrics.volatility > 0.05) {
      riskScore += 20
      reasons.push('High volatility')
    }
    if (metrics.var95 > 0.1) {
      riskScore += 25
      reasons.push('High Value at Risk')
    }

    // Adjust confidence based on risk
    confidence = Math.max(50, Math.min(95, confidence - riskScore / 2))

    return {
      asset,
      signal,
      strength,
      confidence,
      reasons,
      technicalScore,
      riskScore
    }
  }
} 