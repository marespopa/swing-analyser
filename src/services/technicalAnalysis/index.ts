import type { PriceDataPoint, TechnicalAnalysisData } from '../coingeckoApi'
import { BaseTechnicalAnalysis } from './base'
import { TrianglePatterns } from './trianglePatterns'
import { HeadAndShouldersPatterns } from './headAndShouldersPatterns'
import { DoublePatterns } from './doublePatterns'
import { CupAndHandlePatterns } from './cupAndHandlePatterns'
import { FlagPatterns } from './flagPatterns'
import { WedgePatterns } from './wedgePatterns'
import { HighTrendlinePatterns } from './highTrendlinePatterns'
import { deduplicateAndPrioritizePatterns, filterRecentPatterns } from './patternUtils'

/**
 * Main Technical Analysis orchestrator class
 * Combines all pattern detection and technical indicators
 */
export class TechnicalAnalysis {
  /**
   * Perform complete technical analysis
   */
  static performAnalysis(data: PriceDataPoint[]): TechnicalAnalysisData {
    if (data.length < 14) {
      throw new Error('Insufficient data for technical analysis. Need at least 14 data points.')
    }

    const prices = data.map(d => d.price)
    const volumes = data.map(d => d.volume || 0)
    
    // Calculate basic indicators - adjust periods based on data availability
    const dataLength = prices.length
    const smaPeriod20 = Math.min(20, Math.max(5, Math.floor(dataLength / 3)))
    const smaPeriod50 = Math.min(50, Math.max(10, Math.floor(dataLength / 2)))
    const emaPeriod9 = Math.min(9, Math.max(3, Math.floor(dataLength / 6)))
    const emaPeriod20 = Math.min(20, Math.max(5, Math.floor(dataLength / 3)))
    const emaPeriod50 = Math.min(50, Math.max(10, Math.floor(dataLength / 2)))
    
    const sma20 = BaseTechnicalAnalysis.calculateSMA(prices, smaPeriod20)
    const sma50 = dataLength >= 50 ? BaseTechnicalAnalysis.calculateSMA(prices, smaPeriod50) : []
    const rsi = BaseTechnicalAnalysis.calculateRSI(prices, 14)
    
    // Calculate EMAs for crypto entry decisions - adjusted periods
    const ema9 = BaseTechnicalAnalysis.calculateEMA(prices, emaPeriod9)
    const ema20 = BaseTechnicalAnalysis.calculateEMA(prices, emaPeriod20)
    const ema50 = dataLength >= 50 ? BaseTechnicalAnalysis.calculateEMA(prices, emaPeriod50) : []
    
    // Calculate volume analysis
    const volumeAnalysis = BaseTechnicalAnalysis.calculateVolumeAnalysis(volumes)
    
    // Calculate advanced indicators
    const macd = BaseTechnicalAnalysis.calculateMACD(prices)
    const bollingerBands = BaseTechnicalAnalysis.calculateBollingerBands(prices)
    
    // Calculate ATR and volatility-based risk management
    const atr = BaseTechnicalAnalysis.calculateATR(data, 14)
    const volatilityRegimes = BaseTechnicalAnalysis.detectVolatilityRegime(atr, 20)
    const volatilityStops = BaseTechnicalAnalysis.calculateVolatilityBasedStops(data, atr, volatilityRegimes)
    
    // Calculate traditional risk management levels (for comparison)
    const riskLevels = BaseTechnicalAnalysis.calculateRiskLevels(prices)
    
    // Calculate Fibonacci retracement levels
    const fibonacciLevels = BaseTechnicalAnalysis.calculateFibonacciLevels(prices)
    
    // Detect candlestick patterns
    const candlestickPatterns = BaseTechnicalAnalysis.detectCandlestickPatterns(prices)
    
    // Detect chart patterns
    const allPatterns = [
      ...TrianglePatterns.detectTrianglePatterns(data, rsi, sma20, sma50),
      ...HeadAndShouldersPatterns.detectHeadAndShouldersPatterns(data, rsi, sma20, sma50),
      ...DoublePatterns.detectDoublePatterns(data, rsi, sma20, sma50, atr, volatilityRegimes),
      ...CupAndHandlePatterns.detectCupAndHandlePatterns(data, rsi, sma20, sma50),
      ...FlagPatterns.detectFlagPatterns(data, rsi, sma20, sma50),
      ...WedgePatterns.detectWedgePatterns(data, rsi, sma20, sma50),
      ...HighTrendlinePatterns.detectHighTrendlinePatterns(data, rsi, sma20, sma50)
    ]

    // Filter to recent patterns and deduplicate - adjust based on data length
    const maxPeriodsBack = Math.min(30, Math.max(10, Math.floor(data.length / 2)))
    const maxPatterns = Math.min(5, Math.max(2, Math.floor(data.length / 20)))
    const recentPatterns = filterRecentPatterns(allPatterns, data.length, maxPeriodsBack)
    const prioritizedPatterns = deduplicateAndPrioritizePatterns(recentPatterns, maxPatterns)

    // Group patterns by type for the response (using type assertion for flexibility)
    const triangles = prioritizedPatterns.filter(p => 
      ['Ascending Triangle', 'Descending Triangle', 'Symmetrical Triangle'].includes(p.pattern)
    ) as any[]
    const headAndShoulders = prioritizedPatterns.filter(p => 
      p.pattern.includes('Head and Shoulders')
    ) as any[]
    const doublePatterns = prioritizedPatterns.filter(p => 
      ['Double Top', 'Double Bottom'].includes(p.pattern)
    ) as any[]
    const cupAndHandle = prioritizedPatterns.filter(p => 
      p.pattern.includes('Cup and Handle')
    ) as any[]
    const flags = prioritizedPatterns.filter(p => 
      p.pattern.includes('Flag')
    ) as any[]
    const wedges = prioritizedPatterns.filter(p => 
      p.pattern.includes('Wedge')
    ) as any[]
    const highTrendlines = prioritizedPatterns.filter(p => 
      p.pattern.includes('Trendline')
    ) as any[]
    
    // Identify trendlines and entry points
    const trendlines = BaseTechnicalAnalysis.identifyTrendlines(data)
    const entryPoints = BaseTechnicalAnalysis.identifyEntryPoints(data, sma20, sma50, rsi)

    return {
      interval: '1d', // This will be set by the calling function
      data,
      sma20,
      sma50,
      ema9,
      ema20,
      ema50,
      rsi,
      macd,
      bollingerBands,
      atr,
      volatilityRegimes,
      volatilityStops,
      riskLevels,
      fibonacciLevels,
      candlestickPatterns,
      patternDetection: {
        triangles,
        headAndShoulders,
        doublePatterns,
        cupAndHandle,
        flags,
        wedges,
        highTrendlines
      },
      trendlines,
      entryPoints,
      volumeAnalysis
    }
  }
}

// Re-export all pattern types for convenience
export type {
  TrianglePattern
} from './trianglePatterns'

export type {
  HeadAndShouldersPattern
} from './headAndShouldersPatterns'

export type {
  DoublePattern
} from './doublePatterns'

export type {
  CupAndHandlePattern
} from './cupAndHandlePatterns'

export type {
  FlagPattern
} from './flagPatterns'

export type {
  WedgePattern
} from './wedgePatterns'

export type {
  HighTrendlinePattern
} from './highTrendlinePatterns'

// Re-export base utilities
export { BaseTechnicalAnalysis }
