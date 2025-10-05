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
    if (data.length < 5) {
      throw new Error(`Insufficient data for technical analysis. Need at least 5 data points, but only have ${data.length}. This coin may be too new or have limited trading history. Try selecting a more established cryptocurrency.`)
    }

    const prices = data.map(d => d.price)
    const volumes = data.map(d => d.volume || 0)
    
    // Calculate basic indicators - adjust periods based on data availability
    const dataLength = prices.length
    
    // Graceful degradation for very limited data
    const smaPeriod20 = dataLength >= 20 ? 20 : Math.max(3, Math.floor(dataLength / 2))
    const smaPeriod50 = dataLength >= 50 ? 50 : dataLength >= 10 ? Math.max(5, Math.floor(dataLength / 2)) : 0
    const emaPeriod9 = dataLength >= 9 ? 9 : Math.max(2, Math.floor(dataLength / 3))
    const emaPeriod20 = dataLength >= 20 ? 20 : Math.max(3, Math.floor(dataLength / 2))
    const emaPeriod50 = dataLength >= 50 ? 50 : dataLength >= 10 ? Math.max(5, Math.floor(dataLength / 2)) : 0
    const rsiPeriod = dataLength >= 14 ? 14 : Math.max(3, Math.floor(dataLength / 2))
    
    // Calculate indicators with graceful degradation
    const sma20 = smaPeriod20 > 0 ? BaseTechnicalAnalysis.calculateSMA(prices, smaPeriod20) : []
    const sma50 = smaPeriod50 > 0 ? BaseTechnicalAnalysis.calculateSMA(prices, smaPeriod50) : []
    const rsi = rsiPeriod > 0 ? BaseTechnicalAnalysis.calculateRSI(prices, rsiPeriod) : []
    
    // Calculate EMAs for crypto entry decisions - adjusted periods
    const ema9 = emaPeriod9 > 0 ? BaseTechnicalAnalysis.calculateEMA(prices, emaPeriod9) : []
    const ema20 = emaPeriod20 > 0 ? BaseTechnicalAnalysis.calculateEMA(prices, emaPeriod20) : []
    const ema50 = emaPeriod50 > 0 ? BaseTechnicalAnalysis.calculateEMA(prices, emaPeriod50) : []
    
    // Calculate volume analysis
    const volumeAnalysis = dataLength >= 5 ? BaseTechnicalAnalysis.calculateVolumeAnalysis(volumes) : undefined
    
    // Calculate advanced indicators with graceful degradation
    // MACD: Use adaptive periods based on data availability
    const macd = dataLength >= 20 ? (() => {
      const fastPeriod = dataLength >= 26 ? 12 : Math.max(5, Math.floor(dataLength / 2))
      const slowPeriod = dataLength >= 26 ? 26 : Math.max(10, Math.floor(dataLength * 0.8))
      const signalPeriod = dataLength >= 26 ? 9 : Math.max(3, Math.floor(dataLength / 3))
      
      // Ensure fastPeriod < slowPeriod
      if (fastPeriod >= slowPeriod) {
        const adjustedSlowPeriod = fastPeriod + Math.max(2, Math.floor(dataLength / 4))
        return BaseTechnicalAnalysis.calculateMACD(prices, fastPeriod, adjustedSlowPeriod, signalPeriod)
      }
      
      return BaseTechnicalAnalysis.calculateMACD(prices, fastPeriod, slowPeriod, signalPeriod)
    })() : undefined
    const bollingerBands = dataLength >= 20 ? BaseTechnicalAnalysis.calculateBollingerBands(prices) : undefined
    
    // Calculate ATR and volatility-based risk management
    const atrPeriod = dataLength >= 14 ? 14 : Math.max(3, Math.floor(dataLength / 2))
    const atr = dataLength >= 5 ? BaseTechnicalAnalysis.calculateATR(data, atrPeriod) : []
    const volatilityRegimes = atr.length > 0 ? BaseTechnicalAnalysis.detectVolatilityRegime(atr, Math.min(20, Math.max(5, Math.floor(dataLength / 2)))) : undefined
    const volatilityStops = volatilityRegimes && atr.length > 0 ? BaseTechnicalAnalysis.calculateVolatilityBasedStops(data, atr, volatilityRegimes) : undefined
    
    // Calculate traditional risk management levels (for comparison)
    const riskLevels = dataLength >= 10 ? BaseTechnicalAnalysis.calculateRiskLevels(prices) : undefined
    
    // Calculate Fibonacci retracement levels
    const fibonacciLevels = dataLength >= 10 ? BaseTechnicalAnalysis.calculateFibonacciLevels(prices) : undefined
    
    // Detect candlestick patterns
    const candlestickPatterns = dataLength >= 5 ? BaseTechnicalAnalysis.detectCandlestickPatterns(prices) : undefined
    
    // Detect chart patterns with graceful degradation
    const allPatterns = []
    
    // Only run pattern detection if we have sufficient data for each pattern type
    if (dataLength >= 15) {
      allPatterns.push(...TrianglePatterns.detectTrianglePatterns(data, rsi, sma20, sma50))
      allPatterns.push(...HeadAndShouldersPatterns.detectHeadAndShouldersPatterns(data, rsi, sma20, sma50))
    }
    
    if (dataLength >= 10) {
      allPatterns.push(...DoublePatterns.detectDoublePatterns(data, rsi, sma20, sma50, atr, volatilityRegimes))
      allPatterns.push(...CupAndHandlePatterns.detectCupAndHandlePatterns(data, rsi, sma20, sma50))
      allPatterns.push(...FlagPatterns.detectFlagPatterns(data, rsi, sma20, sma50))
      allPatterns.push(...WedgePatterns.detectWedgePatterns(data, rsi, sma20, sma50))
    }
    
    if (dataLength >= 8) {
      allPatterns.push(...HighTrendlinePatterns.detectHighTrendlinePatterns(data, rsi, sma20, sma50))
    }

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
    
    // Identify trendlines and entry points with graceful degradation
    const trendlines = dataLength >= 10 ? BaseTechnicalAnalysis.identifyTrendlines(data) : []
    const entryPoints = dataLength >= 8 ? BaseTechnicalAnalysis.identifyEntryPoints(data, sma20, sma50, rsi) : []

    // Add data quality information
    const dataQuality = {
      totalDataPoints: dataLength,
      hasBasicIndicators: dataLength >= 5,
      hasAdvancedIndicators: dataLength >= 20,
      hasPatternDetection: dataLength >= 8,
      hasFullAnalysis: dataLength >= 50,
      limitations: dataLength < 20 ? 'Limited analysis available due to insufficient historical data' : undefined
    }

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
      volumeAnalysis,
      dataQuality
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
