import React, { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { TechnicalAnalysis } from '../services/technicalAnalysis/index'
import type { TechnicalAnalysisData, PriceDataPoint } from '../services/coingeckoApi'
import { generateSummary } from '../utils/summaryGenerator'
import AnalysisHeader from './analysis/AnalysisHeader'
import AnalysisSummary from './analysis/AnalysisSummary'
import AnalysisMetrics from './analysis/AnalysisMetrics'
import AnalysisChart from './analysis/AnalysisChart'
import AnalysisTechnicalDetails from './analysis/AnalysisTechnicalDetails'

interface AnalysisResultsProps {
  results: {
    [key: string]: {
      coin: any
      interval: string
      priceData?: PriceDataPoint[]
      currentPriceData?: any
      error?: string
    }
  }
  isPriceLoading?: boolean
  isInitialLoading?: boolean
  isRefreshing?: boolean
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ 
  results, 
  isPriceLoading = false, 
  isInitialLoading = false,
}) => {
  const navigate = useNavigate()

  // Memoize expensive technical analysis calculations
  const { processedResults, errors, coinInfo, currentPrice, priceChange24h, analysis } = useMemo(() => {
    const processedResults: { [key: string]: TechnicalAnalysisData | null } = {}
    const errors: { [key: string]: string } = {}

    Object.entries(results).forEach(([interval, result]) => {
      if (result.error) {
        errors[interval] = result.error
      } else if (result.priceData && result.priceData.length > 0) {
        try {
          processedResults[interval] = TechnicalAnalysis.performAnalysis(result.priceData)
        } catch (error) {
          errors[interval] = `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }
    })

    const coinInfo = Object.values(results)[0]?.coin
    const currentPriceData = Object.values(results)[0]?.currentPriceData
    const currentPrice = currentPriceData?.currentPrice || Object.values(processedResults).find(result => result?.data?.length)?.data?.slice(-1)[0]?.price
    const priceChange24h = currentPriceData?.priceChange24h || null
    const analysis = Object.values(processedResults).find(result => result !== null)

    return { processedResults, errors, coinInfo, currentPrice, priceChange24h, analysis }
  }, [results])

  const generateTradingRecommendation = useCallback(() => {
    if (!analysis || !currentPrice) return null

    const recentPrices = analysis.data.slice(-10).map(d => d.price)
    const priceChange = (recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices[0] * 100

    const upperBand = analysis.bollingerBands?.upper[analysis.bollingerBands.upper.length - 1] || 0
    const lowerBand = analysis.bollingerBands?.lower[analysis.bollingerBands.lower.length - 1] || 0

    let pricePosition = 'Within Bands'

    if (currentPrice >= upperBand) {
      pricePosition = 'Above Upper Band'
    } else if (currentPrice <= lowerBand) {
      pricePosition = 'Below Lower Band'
    }

    const sma20 = analysis.sma20?.[analysis.sma20.length - 1] || 0
    const sma50 = analysis.sma50?.[analysis.sma50.length - 1] || 0
    const rsi = analysis.rsi?.[analysis.rsi.length - 1] || 50
    const ema9 = analysis.ema9?.[analysis.ema9.length - 1] || 0
    const ema20 = analysis.ema20?.[analysis.ema20.length - 1] || 0
    const ema50 = analysis.ema50?.[analysis.ema50.length - 1] || 0

    let macdSignal: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral'
    if (analysis.macd && analysis.macd.macd.length >= 2 && analysis.macd.signal.length >= 2) {
      const currentMACD = analysis.macd.macd[analysis.macd.macd.length - 1]
      const previousMACD = analysis.macd.macd[analysis.macd.macd.length - 2]
      const currentSignal = analysis.macd.signal[analysis.macd.signal.length - 1]
      const previousSignal = analysis.macd.signal[analysis.macd.signal.length - 2]
      
      if (previousMACD <= previousSignal && currentMACD > currentSignal) {
        macdSignal = 'Bullish'
      }
      else if (previousMACD >= previousSignal && currentMACD < currentSignal) {
        macdSignal = 'Bearish'
      }
      else if (currentMACD > currentSignal) {
        macdSignal = 'Bullish'
      }
      else if (currentMACD < currentSignal) {
        macdSignal = 'Bearish'
      }
    }

    // Detect Golden Cross (SMA20 crosses above SMA50) or Death Cross (SMA50 crosses above SMA20)
    let goldenCrossSignal: 'Golden Cross' | 'Death Cross' | 'None' = 'None'
    if (analysis.sma20.length >= 2 && analysis.sma50.length >= 2) {
      const currentSMA20 = analysis.sma20[analysis.sma20.length - 1]
      const previousSMA20 = analysis.sma20[analysis.sma20.length - 2]
      const currentSMA50 = analysis.sma50[analysis.sma50.length - 1]
      const previousSMA50 = analysis.sma50[analysis.sma50.length - 2]
      
      // Golden Cross: SMA20 crosses above SMA50
      if (previousSMA20 <= previousSMA50 && currentSMA20 > currentSMA50) {
        goldenCrossSignal = 'Golden Cross'
      }
      // Death Cross: SMA20 crosses below SMA50
      else if (previousSMA20 >= previousSMA50 && currentSMA20 < currentSMA50) {
        goldenCrossSignal = 'Death Cross'
      }
    }

    // Determine trend
    let trend = 'Sideways'
    let strength = 'Weak'
    if (sma20 > sma50 && currentPrice > sma20) {
      trend = 'Bullish'
      strength = 'Strong'
    } else if (sma20 < sma50 && currentPrice < sma20) {
      trend = 'Bearish'
      strength = 'Strong'
    }

    // Calculate stop loss and take profit based on trend
    let stopLoss: number
    let takeProfit: number
    
    if (trend === 'Bullish') {
      // For bullish trades: stop loss below support, take profit above resistance
      stopLoss = lowerBand * 0.95  // 5% below lower Bollinger Band
      takeProfit = upperBand * 1.05  // 5% above upper Bollinger Band
    } else if (trend === 'Bearish') {
      // For bearish trades: stop loss above resistance, take profit below support
      stopLoss = upperBand * 1.05  // 5% above upper Bollinger Band
      takeProfit = lowerBand * 0.95  // 5% below lower Bollinger Band
    } else {
      // For sideways trades: use Bollinger Bands as reference
      stopLoss = lowerBand * 0.98
      takeProfit = upperBand * 1.02
    }
    
    // Calculate risk-reward ratio
    const potentialProfit = takeProfit - currentPrice
    const potentialLoss = currentPrice - stopLoss
    const riskReward = potentialLoss > 0 ? potentialProfit / potentialLoss : 0

    // Determine action based on multiple factors with more nuanced logic
    let action: 'BUY' | 'SELL' | 'WAIT' = 'WAIT'
    let confidence: 'low' | 'medium' | 'high' = 'low'
    let signalColor: 'green' | 'amber' | 'red' = 'red'

    const hasGoodRiskReward = riskReward >= 1.5
    
    // Extract detected patterns (already deduplicated and prioritized)
    const detectedPatterns = analysis.patternDetection ? [
      ...analysis.patternDetection.triangles,
      ...analysis.patternDetection.headAndShoulders,
      ...analysis.patternDetection.doublePatterns,
      ...analysis.patternDetection.cupAndHandle,
      ...analysis.patternDetection.flags,
      ...analysis.patternDetection.wedges,
      ...analysis.patternDetection.highTrendlines
    ] : []

    // Convert to the format expected by the trading recommendation
    const recentPatterns = detectedPatterns.map(pattern => ({
      name: pattern.pattern,
      signal: pattern.signal,
      confidence: pattern.strength,
      description: pattern.description
    }))

    // Check for conflicting signals
    const hasConflictingSignals = (trend === 'Bullish' && macdSignal === 'Bearish') || 
                                 (trend === 'Bearish' && macdSignal === 'Bullish')

    // Hybrid approach: EMA alignment for trend + RSI for timing
    // Check EMA alignment for trend direction
    const bullishEMA = currentPrice > ema9 && ema9 > ema20 && ema20 > ema50
    const bearishEMA = currentPrice < ema9 && ema9 < ema20 && ema20 < ema50
    const neutralEMA = !bullishEMA && !bearishEMA
    
    // Hybrid logic: EMA trend + RSI timing
    if (bullishEMA && rsi < 70) {
      // Bullish trend + not overbought
      if (rsi < 30) {
        action = 'BUY'
        confidence = 'high'
        signalColor = 'green'
      } else if (rsi < 50) {
        action = 'BUY'
        confidence = 'high'
        signalColor = 'green'
      } else {
        action = 'BUY'
        confidence = 'medium'
        signalColor = 'green'
      }
    } else if (bearishEMA && rsi > 30) {
      // Bearish trend + not oversold
      if (rsi > 70) {
        action = 'SELL'
        confidence = 'high'
        signalColor = 'red'
      } else if (rsi > 50) {
        action = 'SELL'
        confidence = 'high'
        signalColor = 'red'
      } else {
        action = 'SELL'
        confidence = 'medium'
        signalColor = 'red'
      }
    } else if (rsi < 30) {
      // Strong oversold regardless of EMA
      action = 'BUY'
      confidence = 'high'
      signalColor = 'green'
    } else if (rsi > 70) {
      // Strong overbought regardless of EMA
      action = 'SELL'
      confidence = 'high'
      signalColor = 'red'
    } else if (neutralEMA) {
      // Neutral EMA alignment - use RSI for direction
      if (rsi < 40) {
        action = 'BUY'
        confidence = 'medium'
        signalColor = 'green'
      } else if (rsi > 60) {
        action = 'SELL'
        confidence = 'medium'
        signalColor = 'red'
      } else {
        action = 'WAIT'
        confidence = 'low'
        signalColor = 'amber'
      }
    } else {
      // Conflicting signals
      action = 'WAIT'
      confidence = 'low'
      signalColor = 'amber'
    }

    // Handle conflicting signals - only downgrade confidence, don't change to WAIT
    if (hasConflictingSignals) {
      if (confidence === 'high') {
        confidence = 'medium'
      } else if (confidence === 'medium') {
        confidence = 'low'
      }
    }

    // Boost confidence for Golden Cross/Death Cross or MACD signals (only if no conflicts)
    if (!hasConflictingSignals) {
      if (action === 'BUY' && (goldenCrossSignal === 'Golden Cross' || macdSignal === 'Bullish')) {
        confidence = 'high'
      } else if (action === 'SELL' && (goldenCrossSignal === 'Death Cross' || macdSignal === 'Bearish')) {
        confidence = 'high'
      } else if (goldenCrossSignal === 'Golden Cross' && action === 'WAIT') {
        action = 'BUY'
        confidence = 'medium'
        signalColor = 'green'
      } else if (goldenCrossSignal === 'Death Cross' && action === 'WAIT') {
        action = 'SELL'
        confidence = 'medium'
        signalColor = 'red'
      }
    }

    // Calculate bullishness score using enhanced EMA + RSI logic
    let bullishnessScore = 50 // Start neutral
    const buySignals: string[] = []
    const sellSignals: string[] = []

    // Strong bullish setup: price > 9EMA > 20EMA > 50EMA + RSI < 70
    if (currentPrice > ema9 && ema9 > ema20 && ema20 > ema50 && rsi < 70) {
      bullishnessScore += 35
      buySignals.push('Perfect bullish EMA alignment + RSI confirmation')
    }
    // Strong bearish setup: price < 9EMA < 20EMA < 50EMA + RSI > 30
    else if (currentPrice < ema9 && ema9 < ema20 && ema20 < ema50 && rsi > 30) {
      bullishnessScore -= 35
      sellSignals.push('Perfect bearish EMA alignment + RSI confirmation')
    }
    // Weak bullish setup: price > 20EMA + RSI < 65
    else if (currentPrice > ema20 && rsi < 65) {
      bullishnessScore += 20
      buySignals.push('Moderate bullish EMA + RSI setup')
    }
    // Weak bearish setup: price < 20EMA + RSI > 35
    else if (currentPrice < ema20 && rsi > 35) {
      bullishnessScore -= 20
      sellSignals.push('Moderate bearish EMA + RSI setup')
    }

    // RSI signals (additional to EMA alignment)
    if (rsi < 30) {
      bullishnessScore += 15
      buySignals.push('RSI oversold (<30)')
    } else if (rsi > 70) {
      bullishnessScore -= 15
      sellSignals.push('RSI overbought (>70)')
    } else if (rsi < 35) {
      bullishnessScore += 8
      buySignals.push('RSI near oversold (<35)')
    } else if (rsi > 65) {
      bullishnessScore -= 8
      sellSignals.push('RSI near overbought (>65)')
    } else if (rsi > 50) {
      bullishnessScore += 3
    } else {
      bullishnessScore -= 3
    }

    // EMA alignment bonus (if not already counted above)
    if (ema9 > ema20 && ema20 > ema50) {
      bullishnessScore += 10
      buySignals.push('EMA bullish alignment (9>20>50)')
    } else if (ema9 < ema20 && ema20 < ema50) {
      bullishnessScore -= 10
      sellSignals.push('EMA bearish alignment (9<20<50)')
    }

    // MACD signals (as confirmation)
    if (macdSignal === 'Bullish') {
      bullishnessScore += 8
      buySignals.push('MACD bullish crossover')
    } else if (macdSignal === 'Bearish') {
      bullishnessScore -= 8
      sellSignals.push('MACD bearish crossover')
    }

    // Bollinger Bands position
    if (currentPrice <= lowerBand * 1.02) {
      bullishnessScore += 8
      buySignals.push('Price near lower Bollinger Band')
    } else if (currentPrice >= upperBand * 0.98) {
      bullishnessScore -= 8
      sellSignals.push('Price near upper Bollinger Band')
    }

    // Volume confirmation
    const currentVolume = analysis.data[analysis.data.length - 1]?.volume || 0
    const avgVolume = analysis.volumeAnalysis?.volumeSMA[analysis.volumeAnalysis.volumeSMA.length - 1] || 0
    const volumeRatio = avgVolume > 0 ? currentVolume / avgVolume : 1

    if (volumeRatio > 1.2 && trend === 'Bullish') {
      bullishnessScore += 5
      buySignals.push('High volume bullish confirmation')
    } else if (volumeRatio > 1.2 && trend === 'Bearish') {
      bullishnessScore -= 5
      sellSignals.push('High volume bearish confirmation')
    }

    // Pattern-based signals
    if (detectedPatterns.length > 0) {
      const bullishPatterns = detectedPatterns.filter(p => p.signal === 'bullish').length
      const bearishPatterns = detectedPatterns.filter(p => p.signal === 'bearish').length
      
      if (bullishPatterns > bearishPatterns) {
        bullishnessScore += 8
        buySignals.push(`${bullishPatterns} bullish pattern(s) detected`)
      } else if (bearishPatterns > bullishPatterns) {
        bullishnessScore -= 8
        sellSignals.push(`${bearishPatterns} bearish pattern(s) detected`)
      }
    }

    // Ensure score stays within 0-100 range
    bullishnessScore = Math.max(0, Math.min(100, bullishnessScore))


    return {
      action,
      confidence,
      signalColor,
      trend,
      strength,
      priceChange: priceChange.toFixed(2),
      recommendation: `${action} - ${trend} trend with ${strength} momentum`,
      bullishnessScore: Math.round(bullishnessScore),
      buySignals,
      sellSignals,
      swingAnalysis: {
        trend: trend as 'Bullish' | 'Bearish' | 'Sideways',
        momentum: rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral',
        macdSignal: macdSignal,
        supportResistance: pricePosition === 'Below Lower Band' ? 'Near Support' : 
                          pricePosition === 'Above Upper Band' ? 'Near Resistance' : 'Middle Range',
        patterns: recentPatterns,
        hasGoodRiskReward: hasGoodRiskReward,
        riskReward: riskReward,
        hasVolumeConfirmation: false,
        isChoppyMarket: false,
        strength,
        goldenCrossSignal: goldenCrossSignal
      }
    }
  }, [analysis, currentPrice])

  const tradingRecommendation = useMemo(() => generateTradingRecommendation(), [generateTradingRecommendation])

  // Calculate price position for metrics
  const pricePosition = tradingRecommendation ? {
    position: tradingRecommendation.swingAnalysis.supportResistance === 'Near Support' ? 'Below Lower Band' :
              tradingRecommendation.swingAnalysis.supportResistance === 'Near Resistance' ? 'Above Upper Band' : 'Within Bands',
    percentage: tradingRecommendation.priceChange,
    color: tradingRecommendation.signalColor as 'green' | 'red' | 'yellow'
  } : null

  // Generate summary
  const summary = useMemo(() => {
    if (!coinInfo || !tradingRecommendation || !currentPrice || !analysis) return ''

    return generateSummary({
      coinInfo,
      tradingRecommendation: tradingRecommendation as any,
      analysis,
    })
  }, [coinInfo, tradingRecommendation, analysis])

  const handleBack = () => {
    navigate('/')
  }

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summary)
  }


  return (
    <div className="max-w-6xl mx-auto space-y-6 p-3 sm:p-4 min-h-screen relative">
      {/* Combined Header and Summary Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <AnalysisHeader
          coinInfo={coinInfo}
          currentPrice={currentPrice}
          priceChange24h={priceChange24h}
          onBack={handleBack}
          isPriceLoading={isPriceLoading || isInitialLoading}
        />

        <AnalysisMetrics
          tradingRecommendation={tradingRecommendation}
          pricePosition={pricePosition}
        />

        <AnalysisSummary
          summary={summary}
          onCopySummary={handleCopySummary}
        />
      </div>

      {/* Detailed Technical Indicators */}
      <AnalysisTechnicalDetails
        analysis={analysis || null}
        coinInfo={coinInfo}
      />

      {/* Technical Analysis Chart */}
      <AnalysisChart
        analysis={processedResults['1d'] || null}
        error={errors['1d'] || null}
      />
    </div>
  )
}

export default AnalysisResults
