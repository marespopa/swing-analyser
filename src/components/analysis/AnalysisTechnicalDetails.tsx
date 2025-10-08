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

      {/* Pattern Detection moved to separate component at bottom of page */}

      {/* Technical Indicators Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
          Technical Indicators Breakdown
        </h3>

      {/* Detailed Indicator Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RSI Analysis - Primary Indicator for Crypto */}
        {analysis?.rsi && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">RSI</h4>
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                Momentum
              </span>
              <div className="group relative">
                <FaInfoCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help transition-colors" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  Overbought/Oversold & Momentum
                </div>
              </div>
            </div>
            
            {/* Current Value - Highlighted */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-750 rounded-lg border border-blue-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current</span>
                <span className={`text-2xl font-bold tabular-nums ${(() => {
                  const currentRSI = analysis.rsi[analysis.rsi.length - 1]
                  if (currentRSI >= 70) return 'text-red-600 dark:text-red-400'
                  if (currentRSI <= 30) return 'text-green-600 dark:text-green-400'
                  return 'text-gray-900 dark:text-white'
                })()}`}>
                  {analysis.rsi[analysis.rsi.length - 1]?.toFixed(1) || 'N/A'}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                {(() => {
                  const currentRSI = analysis.rsi[analysis.rsi.length - 1]
                  if (currentRSI >= 70) return 'Overbought territory (≥70) - Potential selling pressure'
                  if (currentRSI <= 30) return 'Oversold territory (≤30) - Potential buying opportunity'
                  return 'Neutral zone (30-70) - Normal price action'
                })()}
              </div>
            </div>

            {/* Trend Direction */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Trend</span>
                <span className={`text-sm font-semibold ${(() => {
                  const currentRSI = analysis.rsi[analysis.rsi.length - 1]
                  const previousRSI = analysis.rsi[analysis.rsi.length - 2]
                  const change = currentRSI - previousRSI
                  if (change > 2) return 'text-green-600 dark:text-green-400'
                  if (change < -2) return 'text-red-600 dark:text-red-400'
                  if (change > 0) return 'text-yellow-600 dark:text-yellow-400'
                  if (change < 0) return 'text-orange-600 dark:text-orange-400'
                  return 'text-gray-600 dark:text-gray-400'
                })()}`}>
                  {(() => {
                    const currentRSI = analysis.rsi[analysis.rsi.length - 1]
                    const previousRSI = analysis.rsi[analysis.rsi.length - 2]
                    const change = currentRSI - previousRSI
                    if (change > 2) return '↗ Rising'
                    if (change < -2) return '↘ Falling'
                    if (change > 0) return '→ Slightly Up'
                    if (change < 0) return '→ Slightly Down'
                    return '→ Flat'
                  })()}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {(() => {
                  const currentRSI = analysis.rsi[analysis.rsi.length - 1]
                  const previousRSI = analysis.rsi[analysis.rsi.length - 2]
                  const change = currentRSI - previousRSI
                  return `${previousRSI.toFixed(1)} → ${currentRSI.toFixed(1)} (${change > 0 ? '+' : ''}${change.toFixed(1)})`
                })()}
              </div>
            </div>
          </div>
        )}
        {/* EMA Analysis - Trend Identification */}
        {analysis?.ema9 && analysis?.ema20 && analysis?.ema50 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">EMA</h4>
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                Trend
              </span>
              <div className="group relative">
                <FaInfoCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help transition-colors" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  Dynamic Support/Resistance Levels
                </div>
              </div>
            </div>

            {/* EMA Values Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">9 EMA</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                  ${analysis.ema9[analysis.ema9.length - 1]?.toFixed(2)}
                </div>
                <div className={`text-xs mt-1 ${(() => {
                  const currentPrice = analysis.currentPrice || analysis.data[analysis.data.length - 1]?.price || 0
                  const ema9 = analysis.ema9[analysis.ema9.length - 1] || 0
                  return currentPrice > ema9 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                })()}`}>
                  {(() => {
                    const currentPrice = analysis.currentPrice || analysis.data[analysis.data.length - 1]?.price || 0
                    const ema9 = analysis.ema9[analysis.ema9.length - 1] || 0
                    const distance = Math.abs((currentPrice - ema9) / ema9 * 100)
                    return currentPrice > ema9 ? `+${distance.toFixed(1)}%` : `-${distance.toFixed(1)}%`
                  })()}
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">20 EMA</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                  ${analysis.ema20[analysis.ema20.length - 1]?.toFixed(2)}
                </div>
                <div className={`text-xs mt-1 ${(() => {
                  const currentPrice = analysis.currentPrice || analysis.data[analysis.data.length - 1]?.price || 0
                  const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                  return currentPrice > ema20 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                })()}`}>
                  {(() => {
                    const currentPrice = analysis.currentPrice || analysis.data[analysis.data.length - 1]?.price || 0
                    const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                    const distance = Math.abs((currentPrice - ema20) / ema20 * 100)
                    return currentPrice > ema20 ? `+${distance.toFixed(1)}%` : `-${distance.toFixed(1)}%`
                  })()}
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">50 EMA</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                  ${analysis.ema50[analysis.ema50.length - 1]?.toFixed(2)}
                </div>
                <div className={`text-xs mt-1 ${(() => {
                  const currentPrice = analysis.currentPrice || analysis.data[analysis.data.length - 1]?.price || 0
                  const ema50 = analysis.ema50[analysis.ema50.length - 1] || 0
                  return currentPrice > ema50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                })()}`}>
                  {(() => {
                    const currentPrice = analysis.currentPrice || analysis.data[analysis.data.length - 1]?.price || 0
                    const ema50 = analysis.ema50[analysis.ema50.length - 1] || 0
                    const distance = Math.abs((currentPrice - ema50) / ema50 * 100)
                    return currentPrice > ema50 ? `+${distance.toFixed(1)}%` : `-${distance.toFixed(1)}%`
                  })()}
                </div>
              </div>
            </div>

            {/* Alignment Status */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-750 rounded-lg border border-green-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Alignment</span>
                <span className={`text-sm font-bold ${(() => {
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
                    if (ema9 > ema20 && ema20 > ema50) return '↗ Bullish'
                    if (ema9 < ema20 && ema20 < ema50) return '↘ Bearish'
                    return '→ Mixed'
                  })()}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {(() => {
                  const ema9 = analysis.ema9[analysis.ema9.length - 1] || 0
                  const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                  const ema50 = analysis.ema50[analysis.ema50.length - 1] || 0
                  if (ema9 > ema20 && ema20 > ema50) return 'All EMAs aligned bullish (9>20>50)'
                  if (ema9 < ema20 && ema20 < ema50) return 'All EMAs aligned bearish (9<20<50)'
                  return 'Mixed alignment - consolidation phase'
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Bollinger Bands Analysis - Volatility & Reversals */}
        {analysis?.bollingerBands && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Bollinger Bands</h4>
              <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs font-medium rounded">
                Volatility
              </span>
              <div className="group relative">
                <FaInfoCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help transition-colors" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  Volatility & Reversal Zones
                </div>
              </div>
            </div>

            {/* Price Position */}
            <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-750 rounded-lg border border-orange-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Price Position</span>
                <span className={`text-sm font-bold ${(() => {
                  const currentPrice = analysis.currentPrice || analysis.data[analysis.data.length - 1]?.price || 0
                  const upperBand = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1] || 0
                  const lowerBand = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1] || 0
                  const middleBand = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1] || 0
                  if (currentPrice >= upperBand) return 'text-red-600 dark:text-red-400'
                  if (currentPrice <= lowerBand) return 'text-green-600 dark:text-green-400'
                  if (currentPrice > middleBand) return 'text-yellow-600 dark:text-yellow-400'
                  return 'text-blue-600 dark:text-blue-400'
                })()}`}>
                  {(() => {
                    const currentPrice = analysis.currentPrice || analysis.data[analysis.data.length - 1]?.price || 0
                    const upperBand = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1] || 0
                    const lowerBand = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1] || 0
                    const middleBand = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1] || 0
                    if (currentPrice >= upperBand) return 'Above Upper'
                    if (currentPrice <= lowerBand) return 'Below Lower'
                    if (currentPrice > middleBand) return 'Upper Half'
                    return 'Lower Half'
                  })()}
                </span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {(() => {
                  const currentPrice = analysis.currentPrice || analysis.data[analysis.data.length - 1]?.price || 0
                  const upperBand = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1] || 0
                  const lowerBand = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1] || 0
                  const middleBand = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1] || 0
                  if (currentPrice >= upperBand) return 'Overbought - Potential reversal zone'
                  if (currentPrice <= lowerBand) return 'Oversold - Potential reversal zone'
                  if (currentPrice > middleBand) return 'Bullish momentum zone'
                  return 'Bearish momentum zone'
                })()}
              </div>
            </div>

            {/* Band Values */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                <div className="text-xs text-gray-500 dark:text-gray-400">Upper</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                  ${analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1]?.toFixed(2)}
                </div>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                <div className="text-xs text-gray-500 dark:text-gray-400">Middle</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                  ${analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1]?.toFixed(2)}
                </div>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                <div className="text-xs text-gray-500 dark:text-gray-400">Lower</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                  ${analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1]?.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Volatility Status */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Volatility</span>
                <span className={`text-sm font-semibold ${(() => {
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
                    if (bandWidth < 2) return 'Squeeze'
                    if (bandWidth > 8) return 'High'
                    return 'Normal'
                  })()}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {(() => {
                  const upperBand = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1] || 0
                  const lowerBand = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1] || 0
                  const middleBand = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1] || 0
                  const bandWidth = ((upperBand - lowerBand) / middleBand) * 100
                  if (bandWidth < 2) return `Tight bands (${bandWidth.toFixed(1)}%) - Potential breakout`
                  if (bandWidth > 8) return `Wide bands (${bandWidth.toFixed(1)}%) - High volatility`
                  return `Band width: ${bandWidth.toFixed(1)}%`
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Trend Analysis - Market Direction Assessment */}
        {analysis?.ema9 && analysis?.ema20 && analysis?.sma20 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Market Condition</h4>
              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-medium rounded">
                Combined
              </span>
              <div className="group relative">
                <FaInfoCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help transition-colors" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  Overall Market Condition
                </div>
              </div>
            </div>

            {/* Overall Market Condition */}
            <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-750 rounded-lg border border-purple-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Status</span>
                <span className={`text-lg font-bold ${(() => {
                  const currentPrice = analysis.currentPrice || analysis.data[analysis.data.length - 1]?.price || 0
                  const ema9 = analysis.ema9[analysis.ema9.length - 1] || 0
                  const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                  const ema50 = analysis.ema50[analysis.ema50.length - 1] || 0
                  const rsi = analysis.rsi[analysis.rsi.length - 1] || 50
                  
                  if (currentPrice > ema9 && ema9 > ema20 && ema20 > ema50 && rsi < 70) return 'text-green-600 dark:text-green-400'
                  if (currentPrice < ema9 && ema9 < ema20 && ema20 < ema50 && rsi > 30) return 'text-red-600 dark:text-red-400'
                  if (currentPrice > ema20 && rsi < 65) return 'text-yellow-600 dark:text-yellow-400'
                  if (currentPrice < ema20 && rsi > 35) return 'text-orange-600 dark:text-orange-400'
                  return 'text-gray-600 dark:text-gray-400'
                })()}`}>
                  {(() => {
                    const currentPrice = analysis.currentPrice || analysis.data[analysis.data.length - 1]?.price || 0
                    const ema9 = analysis.ema9[analysis.ema9.length - 1] || 0
                    const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                    const ema50 = analysis.ema50[analysis.ema50.length - 1] || 0
                    const rsi = analysis.rsi[analysis.rsi.length - 1] || 50
                    
                    if (currentPrice > ema9 && ema9 > ema20 && ema20 > ema50 && rsi < 70) return 'Strong Bullish'
                    if (currentPrice < ema9 && ema9 < ema20 && ema20 < ema50 && rsi > 30) return 'Strong Bearish'
                    if (currentPrice > ema20 && rsi < 65) return 'Moderate Bullish'
                    if (currentPrice < ema20 && rsi > 35) return 'Moderate Bearish'
                    return 'Neutral'
                  })()}
                </span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {(() => {
                  const currentPrice = analysis.currentPrice || analysis.data[analysis.data.length - 1]?.price || 0
                  const ema9 = analysis.ema9[analysis.ema9.length - 1] || 0
                  const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                  const ema50 = analysis.ema50[analysis.ema50.length - 1] || 0
                  const rsi = analysis.rsi[analysis.rsi.length - 1] || 50
                  
                  if (currentPrice > ema9 && ema9 > ema20 && ema20 > ema50 && rsi < 70) {
                    return `Perfect bullish alignment with RSI ${rsi.toFixed(0)}`
                  }
                  if (currentPrice < ema9 && ema9 < ema20 && ema20 < ema50 && rsi > 30) {
                    return `Perfect bearish alignment with RSI ${rsi.toFixed(0)}`
                  }
                  if (currentPrice > ema20 && rsi < 65) {
                    return `Price above 20EMA with RSI ${rsi.toFixed(0)}`
                  }
                  if (currentPrice < ema20 && rsi > 35) {
                    return `Price below 20EMA with RSI ${rsi.toFixed(0)}`
                  }
                  return 'Mixed signals - consolidation phase'
                })()}
              </div>
            </div>

            {/* Key Levels Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Trend Direction</div>
                <div className={`text-sm font-semibold ${(() => {
                  const currentPrice = analysis.currentPrice || analysis.data[analysis.data.length - 1]?.price || 0
                  const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                  const ema50 = analysis.ema50[analysis.ema50.length - 1] || 0
                  if (currentPrice > ema20 && ema20 > ema50) return 'text-green-600 dark:text-green-400'
                  if (currentPrice < ema20 && ema20 < ema50) return 'text-red-600 dark:text-red-400'
                  return 'text-gray-600 dark:text-gray-400'
                })()}`}>
                  {(() => {
                    const currentPrice = analysis.currentPrice || analysis.data[analysis.data.length - 1]?.price || 0
                    const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                    const ema50 = analysis.ema50[analysis.ema50.length - 1] || 0
                    if (currentPrice > ema20 && ema20 > ema50) return '↗ Bullish'
                    if (currentPrice < ema20 && ema20 < ema50) return '↘ Bearish'
                    return '→ Sideways'
                  })()}
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Short-term Momentum</div>
                <div className={`text-sm font-semibold ${(() => {
                  const ema9 = analysis.ema9[analysis.ema9.length - 1] || 0
                  const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                  const currentPrice = analysis.currentPrice || analysis.data[analysis.data.length - 1]?.price || 0
                  if (currentPrice > ema9 && ema9 > ema20) return 'text-green-600 dark:text-green-400'
                  if (currentPrice < ema9 && ema9 < ema20) return 'text-red-600 dark:text-red-400'
                  return 'text-gray-600 dark:text-gray-400'
                })()}`}>
                  {(() => {
                    const ema9 = analysis.ema9[analysis.ema9.length - 1] || 0
                    const ema20 = analysis.ema20[analysis.ema20.length - 1] || 0
                    const currentPrice = analysis.currentPrice || analysis.data[analysis.data.length - 1]?.price || 0
                    if (currentPrice > ema9 && ema9 > ema20) return 'Bullish'
                    if (currentPrice < ema9 && ema9 < ema20) return 'Bearish'
                    return 'Mixed'
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demand Zones Analysis */}
        {analysis?.demandZones && analysis.demandZones.length > 0 && (
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Demand Zones</h4>
              <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded">
                {analysis.demandZones.length} Zones
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {analysis.demandZones.slice(0, 3).map((zone, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {zone.description}
                    </span>
                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                      zone.strength === 'very-strong'
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                        : zone.strength === 'strong'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : zone.strength === 'moderate'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}>
                      {zone.strength}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    ${zone.low.toFixed(2)} - ${zone.high.toFixed(2)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Touches:</span>
                      <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">{zone.touches}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Vol:</span>
                      <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">
                        {zone.volumeProfile.volumeRatio.toFixed(1)}x
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {analysis.demandZones.length > 3 && (
              <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                +{analysis.demandZones.length - 3} more zones detected
              </div>
            )}
          </div>
        )}

        {/* Advanced Volume Analysis */}
        {analysis?.advancedVolumeAnalysis && (
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Volume Analysis</h4>
              <span className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 text-xs font-medium rounded">
                Advanced
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Volume Trend */}
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Trend</div>
                <div className={`text-sm font-semibold ${
                  analysis.advancedVolumeAnalysis.volumeTrend === 'increasing'
                    ? 'text-green-600 dark:text-green-400'
                    : analysis.advancedVolumeAnalysis.volumeTrend === 'decreasing'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {analysis.advancedVolumeAnalysis.volumeTrend === 'increasing' ? '↗ Rising' : 
                   analysis.advancedVolumeAnalysis.volumeTrend === 'decreasing' ? '↘ Falling' : '→ Stable'}
                </div>
              </div>

              {/* Volume Spikes */}
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Spikes</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {analysis.advancedVolumeAnalysis.volumeSpikes.length}
                </div>
                {analysis.advancedVolumeAnalysis.volumeSpikes.length > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {analysis.advancedVolumeAnalysis.volumeSpikes[0].volumeRatio.toFixed(1)}x
                  </div>
                )}
              </div>

              {/* Volume Divergence */}
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Divergences</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {analysis.advancedVolumeAnalysis.volumeDivergence.length}
                </div>
                {analysis.advancedVolumeAnalysis.volumeDivergence.length > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {analysis.advancedVolumeAnalysis.volumeDivergence[0].type}
                  </div>
                )}
              </div>

              {/* Value Area */}
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Value Area</div>
                <div className="text-xs font-semibold text-gray-900 dark:text-white tabular-nums">
                  ${analysis.advancedVolumeAnalysis.volumeProfile.valueArea.low.toFixed(0)}-${analysis.advancedVolumeAnalysis.volumeProfile.valueArea.high.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {analysis.advancedVolumeAnalysis.volumeProfile.valueArea.volumePercent.toFixed(0)}% vol
                </div>
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
