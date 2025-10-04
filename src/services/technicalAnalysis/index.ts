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
    if (data.length < 50) {
      throw new Error('Insufficient data for technical analysis. Need at least 50 data points.')
    }

    const prices = data.map(d => d.price)
    const volumes = data.map(d => d.volume || 0)
    
    // Calculate basic indicators
    const sma20 = BaseTechnicalAnalysis.calculateSMA(prices, 20)
    const sma50 = BaseTechnicalAnalysis.calculateSMA(prices, 50)
    const rsi = BaseTechnicalAnalysis.calculateRSI(prices, 14)
    
    // Calculate EMAs for crypto entry decisions (9, 20, 50 periods)
    const ema9 = BaseTechnicalAnalysis.calculateEMA(prices, 9)
    const ema20 = BaseTechnicalAnalysis.calculateEMA(prices, 20)
    const ema50 = BaseTechnicalAnalysis.calculateEMA(prices, 50)
    
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

    // Filter to recent patterns and deduplicate
    const recentPatterns = filterRecentPatterns(allPatterns, data.length, 30)
    const prioritizedPatterns = deduplicateAndPrioritizePatterns(recentPatterns, 5)

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
