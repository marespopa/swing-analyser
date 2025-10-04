import React from 'react'
import type { TechnicalAnalysisData } from '../../services/coingeckoApi'
import { FaInfoCircle } from 'react-icons/fa'
import BullishnessIndicator from './BullishnessIndicator'
import type { ChartDataPoint } from '../../types'

interface CoinInfo {
  id: string
  name: string
  symbol: string
  currentPrice?: number
}

interface AnalysisTechnicalDetailsProps {
  analysis: TechnicalAnalysisData | null
  coinInfo: CoinInfo | null
  chartData?: ChartDataPoint[]
}

const AnalysisTechnicalDetails: React.FC<AnalysisTechnicalDetailsProps> = ({
  analysis,
  coinInfo,
  chartData = [],
}) => {
  if (!analysis) return null

  return (
    <div className="space-y-6">
      {/* Bullishness Indicator */}
      {chartData.length > 0 && (
        <BullishnessIndicator data={analysis} chartData={chartData} />
      )}

      {/* Technical Indicators Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
          Technical Indicators Breakdown
        </h3>

      {/* Detailed Indicator Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* RSI Analysis - Primary Indicator for Crypto */}
        {analysis?.rsi && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">RSI Analysis</h4>
              <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
                PRIMARY
              </div>
              <div className="group relative">
                <FaInfoCircle className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Identifies overbought/oversold conditions and momentum shifts.
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Current RSI:</span>
                  <span className={`font-mono font-medium text-lg ${(() => {
                    const currentRSI = analysis.rsi[analysis.rsi.length - 1]
                    if (currentRSI >= 70) return 'text-red-600 dark:text-red-400'
                    if (currentRSI <= 30) return 'text-green-600 dark:text-green-400'
                    return 'text-gray-800 dark:text-white'
                  })()}`}>
                    {analysis.rsi[analysis.rsi.length - 1]?.toFixed(0) || 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Relative Strength Index</strong> - measures speed and magnitude of price changes.
                  {(() => {
                    const currentRSI = analysis.rsi[analysis.rsi.length - 1]
                    if (currentRSI >= 70) return ` At ${currentRSI.toFixed(0)}, ${coinInfo?.name || 'this coin'} is in overbought territory (70+), suggesting potential selling pressure.`
                    if (currentRSI <= 30) return ` At ${currentRSI.toFixed(0)}, ${coinInfo?.name || 'this coin'} is in oversold territory (30-), suggesting potential buying opportunity.`
                    return ` At ${currentRSI.toFixed(0)}, ${coinInfo?.name || 'this coin'} is in neutral zone (30-70), indicating normal price action.`
                  })()}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">RSI Trend:</span>
                  <span className={`text-sm font-medium ${(() => {
                    const currentRSI = analysis.rsi[analysis.rsi.length - 1]
                    const previousRSI = analysis.rsi[analysis.rsi.length - 2]
                    const change = currentRSI - previousRSI
                    const absChange = Math.abs(change)
                    
                    if (change > 0) {
                      return absChange <= 2 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                    }
                    if (change < 0) {
                      return absChange <= 2 ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
                    }
                    return 'text-gray-600 dark:text-gray-400'
                  })()}`}>
                    {(() => {
                      const currentRSI = analysis.rsi[analysis.rsi.length - 1]
                      const previousRSI = analysis.rsi[analysis.rsi.length - 2]
                      const change = currentRSI - previousRSI
                      const absChange = Math.abs(change)
                      
                      if (change > 0) {
                        return absChange <= 2 ? '↗ Slowly Rising' : '↗ Rising'
                      }
                      if (change < 0) {
                        return absChange <= 2 ? '↘ Slowly Falling' : '↘ Falling'
                      }
                      return '→ Flat'
                    })()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Momentum direction</strong> - shows if RSI is gaining or losing strength.
                  {(() => {
                    const currentRSI = analysis.rsi[analysis.rsi.length - 1]
                    const previousRSI = analysis.rsi[analysis.rsi.length - 2]
                    const change = currentRSI - previousRSI
                    const absChange = Math.abs(change)
                    
                    if (change > 0) {
                      if (absChange <= 2) {
                        return ` Slowly rising from ${previousRSI.toFixed(0)} to ${currentRSI.toFixed(0)} (+${change.toFixed(0)}), indicating gradual bullish momentum for ${coinInfo?.name || 'this coin'}.`
                      }
                      return ` Rising from ${previousRSI.toFixed(0)} to ${currentRSI.toFixed(0)} (+${change.toFixed(0)}), indicating increasing bullish momentum for ${coinInfo?.name || 'this coin'}.`
                    }
                    if (change < 0) {
                      if (absChange <= 2) {
                        return ` Slowly falling from ${previousRSI.toFixed(0)} to ${currentRSI.toFixed(0)} (${change.toFixed(0)}), indicating gradual bearish momentum for ${coinInfo?.name || 'this coin'}.`
                      }
                      return ` Falling from ${previousRSI.toFixed(0)} to ${currentRSI.toFixed(0)} (${change.toFixed(0)}), indicating increasing bearish momentum for ${coinInfo?.name || 'this coin'}.`
                    }
                    return ` Stable at ${currentRSI.toFixed(0)}, indicating momentum is stabilizing for ${coinInfo?.name || 'this coin'}.`
                  })()}
                </p>
              </div>
            </div>
          </div>
        )}
        {/* EMA Analysis - Critical for Entry Decisions */}
        {analysis?.ema9 && analysis?.ema20 && analysis?.ema50 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">EMA Analysis</h4>
              <div className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded">
                ENTRY
              </div>
              <div className="group relative">
                <FaInfoCircle className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  Responds quickly to price changes and provides dynamic support/resistance.
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">9 EMA:</span>
                  <span className="font-mono text-gray-800 dark:text-white">
                    ${analysis.ema9[analysis.ema9.length - 1]?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Fast EMA</strong> - reacts quickly to price changes, ideal for short-term entry signals.
                  {(() => {
                    const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                    const ema9 = analysis.ema9[analysis.ema9.length - 1] || 0
                    const position = currentPrice > ema9 ? 'above' : 'below'
                    const distance = Math.abs((currentPrice - ema9) / ema9 * 100)
                    return ` Price is ${position} 9EMA by ${distance.toFixed(1)}%, indicating ${position === 'above' ? 'bullish' : 'bearish'} momentum for ${coinInfo?.name || 'this coin'}.`
                  })()}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">20 EMA:</span>
                  <span className="font-mono text-gray-800 dark:text-white">
                    ${analysis.ema20[analysis.ema20.length - 1]?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Key Support/Resistance</strong> - most important EMA for crypto entries on short term charts.
                  {(() => {
                    const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                    const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                    const position = currentPrice > ema20 ? 'above' : 'below'
                    const distance = Math.abs((currentPrice - ema20) / ema20 * 100)
                    return ` Price is ${position} 20EMA by ${distance.toFixed(1)}%, suggesting ${position === 'above' ? 'bullish trend continuation' : 'bearish trend continuation'} for ${coinInfo?.name || 'this coin'}.`
                  })()}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">50 EMA:</span>
                  <span className="font-mono text-gray-800 dark:text-white">
                    ${analysis.ema50[analysis.ema50.length - 1]?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Trend Filter</strong> - defines overall trend direction for entry decisions.
                  {(() => {
                    const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                    const ema50 = analysis.ema50[analysis.ema50.length - 1] || 0
                    const position = currentPrice > ema50 ? 'above' : 'below'
                    const distance = Math.abs((currentPrice - ema50) / ema50 * 100)
                    return ` Price is ${position} 50EMA by ${distance.toFixed(1)}%, indicating ${position === 'above' ? 'bullish' : 'bearish'} trend for ${coinInfo?.name || 'this coin'}.`
                  })()}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">EMA Crossover:</span>
                  <span className={`text-sm font-medium ${(() => {
                    const ema9 = analysis.ema9[analysis.ema9.length - 1] || 0
                    const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                    const ema50 = analysis.ema50[analysis.ema50.length - 1] || 0
                    
                    if (ema9 > ema20 && ema20 > ema50) return 'text-green-600 dark:text-green-400'
                    if (ema9 < ema20 && ema20 < ema50) return 'text-red-600 dark:text-red-400'
                    return 'text-gray-600 dark:text-gray-400'
                  })()}`}>
                    {(() => {
                      const ema9 = analysis.ema9[analysis.ema9.length - 1] || 0
                      const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                      const ema50 = analysis.ema50[analysis.ema50.length - 1] || 0
                      
                      if (ema9 > ema20 && ema20 > ema50) return '↗ Bullish Alignment'
                      if (ema9 < ema20 && ema20 < ema50) return '↘ Bearish Alignment'
                      return '→ Mixed Signals'
                    })()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>EMA Alignment</strong> - shows trend strength and entry direction.
                  {(() => {
                    const ema9 = analysis.ema9[analysis.ema9.length - 1] || 0
                    const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                    const ema50 = analysis.ema50[analysis.ema50.length - 1] || 0
                    
                    if (ema9 > ema20 && ema20 > ema50) {
                      return ` All EMAs are aligned bullish (9EMA > 20EMA > 50EMA), indicating strong uptrend and potential long entries for ${coinInfo?.name || 'this coin'}.`
                    }
                    if (ema9 < ema20 && ema20 < ema50) {
                      return ` All EMAs are aligned bearish (9EMA < 20EMA < 50EMA), indicating strong downtrend and potential short entries for ${coinInfo?.name || 'this coin'}.`
                    }
                    return ` Mixed EMA alignment suggests consolidation or trend change, wait for clearer signals for ${coinInfo?.name || 'this coin'}.`
                  })()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bollinger Bands Analysis - Volatility & Reversals */}
        {analysis?.bollingerBands && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Bollinger Bands</h4>
              <div className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs font-medium rounded">
                VOLATILITY
              </div>
              <div className="group relative">
                <FaInfoCircle className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  Identifies volatility squeezes and reversal opportunities
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Price Position:</span>
                  <span className={`text-sm font-medium ${(() => {
                    const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                    const upperBand = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1] || 0
                    const lowerBand = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1] || 0
                    const middleBand = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1] || 0
                    
                    if (currentPrice >= upperBand) return 'text-red-600 dark:text-red-400'
                    if (currentPrice <= lowerBand) return 'text-green-600 dark:text-green-400'
                    if (currentPrice > middleBand) return 'text-yellow-600 dark:text-yellow-400'
                    return 'text-blue-600 dark:text-blue-400'
                  })()}`}>
                    {(() => {
                      const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                      const upperBand = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1] || 0
                      const lowerBand = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1] || 0
                      const middleBand = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1] || 0
                      
                      if (currentPrice >= upperBand) return '🔴 Above Upper Band'
                      if (currentPrice <= lowerBand) return '🟢 Below Lower Band'
                      if (currentPrice > middleBand) return '🟡 Upper Half'
                      return '🔵 Lower Half'
                    })()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Band position</strong> - identifies overbought/oversold conditions and reversal zones.
                  {(() => {
                    const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                    const upperBand = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1] || 0
                    const lowerBand = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1] || 0
                    const middleBand = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1] || 0
                    
                    if (currentPrice >= upperBand) {
                      return ` Price is above upper band (${upperBand.toFixed(2)}), indicating overbought conditions and potential reversal for ${coinInfo?.name || 'this coin'}.`
                    }
                    if (currentPrice <= lowerBand) {
                      return ` Price is below lower band (${lowerBand.toFixed(2)}), indicating oversold conditions and potential reversal for ${coinInfo?.name || 'this coin'}.`
                    }
                    if (currentPrice > middleBand) {
                      return ` Price is in upper half (${currentPrice.toFixed(2)} vs ${middleBand.toFixed(2)}), showing bullish momentum for ${coinInfo?.name || 'this coin'}.`
                    }
                    return ` Price is in lower half (${currentPrice.toFixed(2)} vs ${middleBand.toFixed(2)}), showing bearish momentum for ${coinInfo?.name || 'this coin'}.`
                  })()}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Middle Band (20 SMA):</span>
                  <span className="font-mono text-gray-800 dark:text-white">
                    ${analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1]?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Key support/resistance level</strong> - the 20-period SMA acts as dynamic support/resistance.
                  {(() => {
                    const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                    const middleBand = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1] || 0
                    const distance = Math.abs((currentPrice - middleBand) / middleBand * 100)
                    
                    if (distance < 0.5) {
                      return ` Price is very close to middle band (${distance.toFixed(2)}% away), creating a critical decision point for ${coinInfo?.name || 'this coin'}.`
                    }
                    if (currentPrice > middleBand) {
                      return ` Price is ${distance.toFixed(1)}% above middle band (${middleBand.toFixed(2)}), suggesting it as support for potential long entries for ${coinInfo?.name || 'this coin'}.`
                    }
                    return ` Price is ${distance.toFixed(1)}% below middle band (${middleBand.toFixed(2)}), suggesting it as resistance for potential short entries for ${coinInfo?.name || 'this coin'}.`
                  })()}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Band Width:</span>
                  <span className={`text-sm font-medium ${(() => {
                    const upperBand = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1] || 0
                    const lowerBand = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1] || 0
                    const middleBand = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1] || 0
                    const bandWidth = ((upperBand - lowerBand) / middleBand) * 100
                    
                    if (bandWidth < 2) return 'text-yellow-600 dark:text-yellow-400'
                    if (bandWidth > 8) return 'text-red-600 dark:text-red-400'
                    return 'text-green-600 dark:text-green-400'
                  })()}`}>
                    {(() => {
                      const upperBand = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1] || 0
                      const lowerBand = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1] || 0
                      const middleBand = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1] || 0
                      const bandWidth = ((upperBand - lowerBand) / middleBand) * 100
                      
                      if (bandWidth < 2) return '📉 Squeeze'
                      if (bandWidth > 8) return '📈 Expansion'
                      return '📊 Normal'
                    })()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Volatility level</strong> - shows market volatility and potential breakout conditions.
                  {(() => {
                    const upperBand = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1] || 0
                    const lowerBand = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1] || 0
                    const middleBand = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1] || 0
                    const bandWidth = ((upperBand - lowerBand) / middleBand) * 100
                    
                    if (bandWidth < 2) {
                      return ` Very tight bands (${bandWidth.toFixed(1)}% width) indicate low volatility and potential breakout for ${coinInfo?.name || 'this coin'}.`
                    }
                    if (bandWidth > 8) {
                      return ` Wide bands (${bandWidth.toFixed(1)}% width) indicate high volatility and potential reversal for ${coinInfo?.name || 'this coin'}.`
                    }
                    return ` Normal band width (${bandWidth.toFixed(1)}%) suggests stable volatility for ${coinInfo?.name || 'this coin'}.`
                  })()}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Squeeze Alert:</span>
                  <span className={`text-sm font-medium ${(() => {
                    const upperBand = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1] || 0
                    const lowerBand = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1] || 0
                    const middleBand = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1] || 0
                    const bandWidth = ((upperBand - lowerBand) / middleBand) * 100
                    
                    return bandWidth < 2 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'
                  })()}`}>
                    {(() => {
                      const upperBand = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1] || 0
                      const lowerBand = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1] || 0
                      const middleBand = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1] || 0
                      const bandWidth = ((upperBand - lowerBand) / middleBand) * 100
                      
                      return bandWidth < 2 ? '⚠️ Squeeze Detected' : '✅ Normal Range'
                    })()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Breakout signal</strong> - identifies low volatility periods before major moves.
                  {(() => {
                    const upperBand = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1] || 0
                    const lowerBand = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1] || 0
                    const middleBand = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1] || 0
                    const bandWidth = ((upperBand - lowerBand) / middleBand) * 100
                    
                    if (bandWidth < 2) {
                      return ` Bollinger Bands are squeezing (${bandWidth.toFixed(1)}% width), indicating low volatility before a potential breakout for ${coinInfo?.name || 'this coin'}.`
                    }
                    return ` Normal volatility range (${bandWidth.toFixed(1)}% width) suggests no immediate breakout signal for ${coinInfo?.name || 'this coin'}.`
                  })()}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Reversal Signal:</span>
                  <span className={`text-sm font-medium ${(() => {
                    const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                    const upperBand = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1] || 0
                    const lowerBand = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1] || 0
                    const middleBand = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1] || 0
                    
                    if (currentPrice >= upperBand) return 'text-red-600 dark:text-red-400'
                    if (currentPrice <= lowerBand) return 'text-green-600 dark:text-green-400'
                    if (currentPrice > middleBand) return 'text-yellow-600 dark:text-yellow-400'
                    return 'text-blue-600 dark:text-blue-400'
                  })()}`}>
                    {(() => {
                      const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                      const upperBand = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1] || 0
                      const lowerBand = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1] || 0
                      const middleBand = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1] || 0
                      
                      if (currentPrice >= upperBand) return '🔴 Strong Sell'
                      if (currentPrice <= lowerBand) return '🟢 Strong Buy'
                      if (currentPrice > middleBand) return '🟡 Weak Buy'
                      return '🔵 Weak Sell'
                    })()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Band touch signals</strong> - identifies potential reversal points using all three bands.
                  {(() => {
                    const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                    const upperBand = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1] || 0
                    const lowerBand = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1] || 0
                    const middleBand = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1] || 0
                    
                    if (currentPrice >= upperBand) {
                      return ` Price touching upper band (${upperBand.toFixed(2)}) suggests strong bearish reversal for ${coinInfo?.name || 'this coin'}.`
                    }
                    if (currentPrice <= lowerBand) {
                      return ` Price touching lower band (${lowerBand.toFixed(2)}) suggests strong bullish reversal for ${coinInfo?.name || 'this coin'}.`
                    }
                    if (currentPrice > middleBand) {
                      return ` Price above middle band (${middleBand.toFixed(2)}) suggests bullish momentum continuation for ${coinInfo?.name || 'this coin'}.`
                    }
                    return ` Price below middle band (${middleBand.toFixed(2)}) suggests bearish momentum continuation for ${coinInfo?.name || 'this coin'}.`
                  })()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trend Analysis - Most Practical for Crypto */}
        {analysis?.ema9 && analysis?.ema20 && analysis?.sma20 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Trend Analysis</h4>
              <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-medium rounded">
                TREND
              </div>
              <div className="group relative">
                <FaInfoCircle className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  Trend analysis using EMA and SMA for practical crypto trading decisions
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Trend Direction:</span>
                  <span className={`text-sm font-medium ${(() => {
                    const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                    const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                    const ema50 = analysis.ema50[analysis.ema50.length - 1] || 0
                    
                    if (currentPrice > ema20 && ema20 > ema50) return 'text-green-600 dark:text-green-400'
                    if (currentPrice < ema20 && ema20 < ema50) return 'text-red-600 dark:text-red-400'
                    return 'text-gray-600 dark:text-gray-400'
                  })()}`}>
                    {(() => {
                      const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                      const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                      const ema50 = analysis.ema50[analysis.ema50.length - 1] || 0
                      
                      if (currentPrice > ema20 && ema20 > ema50) return '↗ Bullish Trend'
                      if (currentPrice < ema20 && ema20 < ema50) return '↘ Bearish Trend'
                      return '→ Sideways/Consolidation'
                    })()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Overall trend</strong> - most important factor for entry decisions.
                  {(() => {
                    const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                    const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                    const ema50 = analysis.ema50[analysis.ema50.length - 1] || 0
                    
                    if (currentPrice > ema20 && ema20 > ema50) {
                      return ` Strong bullish trend confirmed by price > 20EMA > 50EMA. Look for long entries on pullbacks to 20EMA for ${coinInfo?.name || 'this coin'}.`
                    }
                    if (currentPrice < ema20 && ema20 < ema50) {
                      return ` Strong bearish trend confirmed by price < 20EMA < 50EMA. Look for short entries on rallies to 20EMA for ${coinInfo?.name || 'this coin'}.`
                    }
                    return ` Mixed trend signals suggest consolidation. Wait for clearer trend direction before entering ${coinInfo?.name || 'this coin'}.`
                  })()}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Support/Resistance:</span>
                  <span className={`text-sm font-medium ${(() => {
                    const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                    const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                    const distance = Math.abs((currentPrice - ema20) / ema20 * 100)
                    
                    if (distance < 1) return 'text-yellow-600 dark:text-yellow-400'
                    if (currentPrice > ema20) return 'text-green-600 dark:text-green-400'
                    return 'text-red-600 dark:text-red-400'
                  })()}`}>
                    {(() => {
                      const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                      const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                      const distance = Math.abs((currentPrice - ema20) / ema20 * 100)
                      
                      if (distance < 1) return '🎯 Near 20EMA'
                      if (currentPrice > ema20) return '📈 Above 20EMA'
                      return '📉 Below 20EMA'
                    })()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>20EMA as dynamic support/resistance</strong> - key level for entries.
                  {(() => {
                    const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                    const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                    const distance = Math.abs((currentPrice - ema20) / ema20 * 100)
                    
                    if (distance < 1) {
                      return ` Price is very close to 20EMA (${distance.toFixed(1)}% away), creating a critical decision point for ${coinInfo?.name || 'this coin'}.`
                    }
                    if (currentPrice > ema20) {
                      return ` Price is ${distance.toFixed(1)}% above 20EMA, suggesting 20EMA as support for potential long entries on pullbacks for ${coinInfo?.name || 'this coin'}.`
                    }
                    return ` Price is ${distance.toFixed(1)}% below 20EMA, suggesting 20EMA as resistance for potential short entries on rallies for ${coinInfo?.name || 'this coin'}.`
                  })()}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Momentum:</span>
                  <span className={`text-sm font-medium ${(() => {
                    const ema9 = analysis.ema9[analysis.ema9.length - 1] || 0
                    const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                    const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                    
                    if (currentPrice > ema9 && ema9 > ema20) return 'text-green-600 dark:text-green-400'
                    if (currentPrice < ema9 && ema9 < ema20) return 'text-red-600 dark:text-red-400'
                    return 'text-gray-600 dark:text-gray-400'
                  })()}`}>
                    {(() => {
                      const ema9 = analysis.ema9[analysis.ema9.length - 1] || 0
                      const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                      const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                      
                      if (currentPrice > ema9 && ema9 > ema20) return '🚀 Strong Bullish'
                      if (currentPrice < ema9 && ema9 < ema20) return '📉 Strong Bearish'
                      return '⚖️ Mixed Momentum'
                    })()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Short-term momentum</strong> - 9EMA vs 20EMA for entry timing.
                  {(() => {
                    const ema9 = analysis.ema9[analysis.ema9.length - 1] || 0
                    const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                    const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                    
                    if (currentPrice > ema9 && ema9 > ema20) {
                      return ` Strong bullish momentum with price > 9EMA > 20EMA, ideal for long entries for ${coinInfo?.name || 'this coin'}.`
                    }
                    if (currentPrice < ema9 && ema9 < ema20) {
                      return ` Strong bearish momentum with price < 9EMA < 20EMA, ideal for short entries for ${coinInfo?.name || 'this coin'}.`
                    }
                    return ` Mixed momentum signals suggest caution, wait for clearer direction for ${coinInfo?.name || 'this coin'}.`
                  })()}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Entry Signal:</span>
                  <span className={`text-sm font-medium ${(() => {
                    const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                    const ema9 = analysis.ema9[analysis.ema9.length - 1] || 0
                    const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                    const ema50 = analysis.ema50[analysis.ema50.length - 1] || 0
                    const rsi = analysis.rsi[analysis.rsi.length - 1] || 50
                    
                    // Strong buy signal
                    if (currentPrice > ema9 && ema9 > ema20 && ema20 > ema50 && rsi < 70) return 'text-green-600 dark:text-green-400'
                    // Strong sell signal
                    if (currentPrice < ema9 && ema9 < ema20 && ema20 < ema50 && rsi > 30) return 'text-red-600 dark:text-red-400'
                    // Weak buy signal
                    if (currentPrice > ema20 && rsi < 65) return 'text-yellow-600 dark:text-yellow-400'
                    // Weak sell signal
                    if (currentPrice < ema20 && rsi > 35) return 'text-orange-600 dark:text-orange-400'
                    return 'text-gray-600 dark:text-gray-400'
                  })()}`}>
                    {(() => {
                      const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                      const ema9 = analysis.ema9[analysis.ema9.length - 1] || 0
                      const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                      const ema50 = analysis.ema50[analysis.ema50.length - 1] || 0
                      const rsi = analysis.rsi[analysis.rsi.length - 1] || 50
                      
                      // Strong buy signal
                      if (currentPrice > ema9 && ema9 > ema20 && ema20 > ema50 && rsi < 70) return '🟢 Strong Buy'
                      // Strong sell signal
                      if (currentPrice < ema9 && ema9 < ema20 && ema20 < ema50 && rsi > 30) return '🔴 Strong Sell'
                      // Weak buy signal
                      if (currentPrice > ema20 && rsi < 65) return '🟡 Weak Buy'
                      // Weak sell signal
                      if (currentPrice < ema20 && rsi > 35) return '🟠 Weak Sell'
                      return '⚪ Wait'
                    })()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Combined signal</strong> - EMA alignment + RSI for practical entry decisions.
                  {(() => {
                    const currentPrice = analysis.data[analysis.data.length - 1]?.price || 0
                    const ema9 = analysis.ema9[analysis.ema9.length - 1] || 0
                    const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                    const ema50 = analysis.ema50[analysis.ema50.length - 1] || 0
                    const rsi = analysis.rsi[analysis.rsi.length - 1] || 50
                    
                    // Strong buy signal
                    if (currentPrice > ema9 && ema9 > ema20 && ema20 > ema50 && rsi < 70) {
                      return ` Perfect bullish setup: price > 9EMA > 20EMA > 50EMA with RSI ${rsi.toFixed(1)}. Strong long entry signal for ${coinInfo?.name || 'this coin'}.`
                    }
                    // Strong sell signal
                    if (currentPrice < ema9 && ema9 < ema20 && ema20 < ema50 && rsi > 30) {
                      return ` Perfect bearish setup: price < 9EMA < 20EMA < 50EMA with RSI ${rsi.toFixed(1)}. Strong short entry signal for ${coinInfo?.name || 'this coin'}.`
                    }
                    // Weak buy signal
                    if (currentPrice > ema20 && rsi < 65) {
                      return ` Moderate bullish setup: price above 20EMA with RSI ${rsi.toFixed(1)}. Consider long entries on pullbacks for ${coinInfo?.name || 'this coin'}.`
                    }
                    // Weak sell signal
                    if (currentPrice < ema20 && rsi > 35) {
                      return ` Moderate bearish setup: price below 20EMA with RSI ${rsi.toFixed(1)}. Consider short entries on rallies for ${coinInfo?.name || 'this coin'}.`
                    }
                    return ` Mixed signals suggest waiting for clearer setup before entering ${coinInfo?.name || 'this coin'}.`
                  })()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

export default AnalysisTechnicalDetails
