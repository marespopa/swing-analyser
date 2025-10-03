import React from 'react'
import { useNavigate } from 'react-router-dom'
import { TechnicalAnalysis } from '../services/technicalAnalysis'
import type { TechnicalAnalysisData, PriceDataPoint } from '../services/coingeckoApi'
import { generateSummary } from '../utils/summaryGenerator'
import AnalysisHeader from './analysis/AnalysisHeader'
import AnalysisSummary from './analysis/AnalysisSummary'
import AnalysisMetrics from './analysis/AnalysisMetrics'
import AnalysisChart from './analysis/AnalysisChart'
import AnalysisTechnicalDetails from './analysis/AnalysisTechnicalDetails'
import AnalysisFibonacciLevels from './analysis/AnalysisFibonacciLevels'

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
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ 
  results, 
  isPriceLoading = false, 
  isInitialLoading = false,
}) => {
  const navigate = useNavigate()

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

  const generateTradingRecommendation = () => {
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
    const hasDecentRiskReward = riskReward >= 1.0
    
    // Calculate RSI trend
    const currentRSI = analysis.rsi[analysis.rsi.length - 1]
    const previousRSI = analysis.rsi[analysis.rsi.length - 2]
    const rsiTrend = currentRSI > previousRSI ? 'rising' : currentRSI < previousRSI ? 'falling' : 'flat'

    // Extract detected patterns (already deduplicated and prioritized)
    const detectedPatterns = analysis.patternDetection ? [
      ...analysis.patternDetection.triangles,
      ...analysis.patternDetection.headAndShoulders,
      ...analysis.patternDetection.doublePatterns,
      ...analysis.patternDetection.cupAndHandle,
      ...analysis.patternDetection.flags,
      ...analysis.patternDetection.wedges
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

    if (trend === 'Bullish') {
      if (rsi < 70 && currentPrice > lowerBand) {
        if (hasGoodRiskReward) {
          action = 'BUY'
          confidence = rsi < 30 ? 'high' : 'medium'
          signalColor = 'green'
        } else if (hasDecentRiskReward && strength === 'Strong') {
          action = 'BUY'
          confidence = 'medium'
          signalColor = 'green'
        } else if (strength === 'Strong') {
          action = 'BUY'
          confidence = 'low'
          signalColor = 'green'
        } else if (rsiTrend === 'falling' && rsi > 50) {
          // Falling RSI from high levels in bullish trend can be good (momentum building)
          action = 'BUY'
          confidence = 'low'
          signalColor = 'green'
        } else {
          action = 'WAIT'
          confidence = 'medium'
          signalColor = 'amber'
        }
      } else if (rsi >= 70) {
        if (rsiTrend === 'falling') {
          // RSI falling from overbought in bullish trend - potential buying opportunity
          action = 'BUY'
          confidence = 'low'
          signalColor = 'green'
        } else {
          action = 'WAIT'
          confidence = 'medium'
          signalColor = 'amber'
        }
      } else {
        action = 'WAIT'
        confidence = 'low'
        signalColor = 'amber'
      }

      // Handle conflicting signals - downgrade confidence or change to WAIT
      if (hasConflictingSignals) {
        if (action === 'BUY') {
          // Downgrade confidence and potentially change to WAIT
          if (confidence === 'high') {
            confidence = 'medium'
          } else if (confidence === 'medium') {
            confidence = 'low'
          } else {
            // If already low confidence, consider changing to WAIT
            if (strength !== 'Strong' || !hasDecentRiskReward) {
              action = 'WAIT'
              confidence = 'medium'
              signalColor = 'amber'
            }
          }
        }
      }

      // Boost confidence for Golden Cross or MACD bullish crossover (only if no conflicts)
      if (!hasConflictingSignals) {
        if ((goldenCrossSignal === 'Golden Cross' || macdSignal === 'Bullish') && action === 'BUY') {
          confidence = 'high'
        } else if (goldenCrossSignal === 'Golden Cross' && action === 'WAIT') {
          action = 'BUY'
          confidence = 'medium'
          signalColor = 'green'
        }
      }
    } else if (trend === 'Bearish') {
      if (rsi > 30 && currentPrice < upperBand) {
        if (hasGoodRiskReward) {
          action = 'SELL'
          confidence = rsi > 70 ? 'high' : 'medium'
          signalColor = 'red'
        } else if (hasDecentRiskReward && strength === 'Strong') {
          action = 'SELL'
          confidence = 'medium'
          signalColor = 'red'
        } else if (strength === 'Strong') {
          action = 'SELL'
          confidence = 'low'
          signalColor = 'red'
        } else {
          action = 'WAIT'
          confidence = 'medium'
          signalColor = 'amber'
        }
      } else if (rsi <= 30) {
        action = 'WAIT'
        confidence = 'medium'
        signalColor = 'amber'
      } else {
        action = 'WAIT'
        confidence = 'low'
        signalColor = 'amber'
      }

      // Handle conflicting signals - downgrade confidence or change to WAIT
      if (hasConflictingSignals) {
        if (action === 'SELL') {
          // Downgrade confidence and potentially change to WAIT
          if (confidence === 'high') {
            confidence = 'medium'
          } else if (confidence === 'medium') {
            confidence = 'low'
          } else {
            // If already low confidence, consider changing to WAIT
            if (strength !== 'Strong' || !hasDecentRiskReward) {
              action = 'WAIT'
              confidence = 'medium'
              signalColor = 'amber'
            }
          }
        }
      }

      // Boost confidence for Death Cross or MACD bearish crossover (only if no conflicts)
      if (!hasConflictingSignals) {
        if ((goldenCrossSignal === 'Death Cross' || macdSignal === 'Bearish') && action === 'SELL') {
          confidence = 'high'
        } else if (goldenCrossSignal === 'Death Cross' && action === 'WAIT') {
          action = 'SELL'
          confidence = 'medium'
          signalColor = 'red'
        }
      }
    } else {
      // Sideways trend
      action = 'WAIT'
      confidence = 'medium'
      signalColor = 'amber'
    }


    return {
      action,
      confidence,
      signalColor,
      trend,
      strength,
      priceChange: priceChange.toFixed(2),
      recommendation: `${action} - ${trend} trend with ${strength} momentum`,
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
  }

  const tradingRecommendation = generateTradingRecommendation()

  // Calculate price position for metrics
  const pricePosition = tradingRecommendation ? {
    position: tradingRecommendation.swingAnalysis.supportResistance === 'Near Support' ? 'Below Lower Band' :
              tradingRecommendation.swingAnalysis.supportResistance === 'Near Resistance' ? 'Above Upper Band' : 'Within Bands',
    percentage: tradingRecommendation.priceChange,
    color: tradingRecommendation.signalColor as 'green' | 'red' | 'yellow'
  } : null

  // Generate summary
  const generateSummaryText = () => {
    if (!coinInfo || !tradingRecommendation || !currentPrice || !analysis) return ''

    return generateSummary({
      coinInfo,
      tradingRecommendation: tradingRecommendation as any,
      currentPrice,
      analysis,
    })
  }

  const summary = generateSummaryText()

  const handleBack = () => {
    navigate('/')
  }

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summary)
  }

  const analysisTimestamp = new Date().toLocaleString()

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-3 sm:p-4 min-h-screen relative">
      {/* Combined Header and Summary Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative z-10">
        <AnalysisHeader
          coinInfo={coinInfo}
          currentPrice={currentPrice}
          priceChange24h={priceChange24h}
          onBack={handleBack}
          isPriceLoading={isPriceLoading || isInitialLoading}
        />

        <AnalysisSummary
          summary={summary}
          onCopySummary={handleCopySummary}
        />

        <AnalysisMetrics
          tradingRecommendation={tradingRecommendation}
          pricePosition={pricePosition}
        />

        {/* Analysis Timestamp */}
        <div className="text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
          Analysis generated on {analysisTimestamp}
        </div>
      </div>

      {/* Fibonacci Levels */}
      <AnalysisFibonacciLevels
        analysis={analysis || null}
        currentPrice={currentPrice}
      />

      {/* Detailed Technical Indicators */}
      <AnalysisTechnicalDetails
        analysis={analysis || null}
        coinInfo={coinInfo}
        currentPrice={currentPrice}
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
