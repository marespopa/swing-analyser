import React from 'react'
import type { TechnicalAnalysisData } from '../../services/coingeckoApi'

interface CoinInfo {
  id: string
  name: string
  symbol: string
  currentPrice?: number
}

interface AnalysisTechnicalDetailsProps {
  analysis: TechnicalAnalysisData | null
  coinInfo: CoinInfo | null
  currentPrice: number | null
}

const AnalysisTechnicalDetails: React.FC<AnalysisTechnicalDetailsProps> = ({
  analysis,
  coinInfo,
  currentPrice
}) => {
  if (!analysis) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        Technical Indicators Breakdown
      </h3>

      {/* Technical Indicators Summary */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Key Technical Findings for {coinInfo?.name || 'This Asset'}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Overall Trend Assessment */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <h5 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${(() => {
                const macdHistogram = analysis?.macd?.histogram[analysis.macd.histogram.length - 1] || 0
                const rsi = analysis?.rsi?.[analysis.rsi.length - 1] || 50
                const sma20 = analysis?.sma20?.[analysis.sma20.length - 1] || 0

                if (macdHistogram > 0 && rsi > 50 && currentPrice && currentPrice > sma20) return 'bg-green-500'
                if (macdHistogram < 0 && rsi < 50 && currentPrice && currentPrice < sma20) return 'bg-red-500'
                return 'bg-yellow-500'
              })()}`}></div>
              Overall Trend
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {(() => {
                const macdHistogram = analysis?.macd?.histogram[analysis.macd.histogram.length - 1] || 0
                const rsi = analysis?.rsi?.[analysis.rsi.length - 1] || 50
                const sma20 = analysis?.sma20?.[analysis.sma20.length - 1] || 0

                if (macdHistogram > 0 && rsi > 50 && currentPrice && currentPrice > sma20) {
                  return 'Strong bullish momentum across all indicators'
                } else if (macdHistogram < 0 && rsi < 50 && currentPrice && currentPrice < sma20) {
                  return 'Strong bearish momentum across all indicators'
                } else if (macdHistogram > 0 || (rsi > 50 && currentPrice && currentPrice > sma20)) {
                  return 'Mixed signals leaning bullish'
                } else if (macdHistogram < 0 || (rsi < 50 && currentPrice && currentPrice < sma20)) {
                  return 'Mixed signals leaning bearish'
                }
                return 'Neutral trend with conflicting signals'
              })()}
            </p>
          </div>

          {/* Momentum Status */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <h5 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${(() => {
                const rsi = analysis?.rsi?.[analysis.rsi.length - 1] || 50
                if (rsi >= 70) return 'bg-red-500'
                if (rsi <= 30) return 'bg-green-500'
                return 'bg-blue-500'
              })()}`}></div>
              Momentum Status
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {(() => {
                const rsi = analysis?.rsi?.[analysis.rsi.length - 1] || 50
                const macdHistogram = analysis?.macd?.histogram[analysis.macd.histogram.length - 1] || 0

                if (rsi >= 70) return `Overbought (RSI: ${rsi.toFixed(0)}) - consider selling`
                if (rsi <= 30) return `Oversold (RSI: ${rsi.toFixed(0)}) - consider buying`
                if (macdHistogram > 0) return `Bullish momentum building (RSI: ${rsi.toFixed(0)})`
                if (macdHistogram < 0) return `Bearish momentum building (RSI: ${rsi.toFixed(0)})`
                return `Neutral momentum (RSI: ${rsi.toFixed(0)})`
              })()}
            </p>
          </div>

          {/* Price Position */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <h5 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${(() => {
                if (!currentPrice || !analysis?.bollingerBands) return 'bg-gray-400'
                const upper = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1]
                const lower = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1]
                if (currentPrice >= upper) return 'bg-red-500'
                if (currentPrice <= lower) return 'bg-green-500'
                return 'bg-blue-500'
              })()}`}></div>
              Price Position
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {(() => {
                if (!currentPrice || !analysis?.bollingerBands) return 'Price data unavailable'
                const upper = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1]
                const lower = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1]
                const middle = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1]

                if (currentPrice >= upper) return `At resistance ($${currentPrice.toFixed(4)} vs $${upper.toFixed(4)})`
                if (currentPrice <= lower) return `At support ($${currentPrice.toFixed(4)} vs $${lower.toFixed(4)})`
                if (currentPrice > middle) return `Above middle band ($${currentPrice.toFixed(4)} vs $${middle.toFixed(4)})`
                return `Below middle band ($${currentPrice.toFixed(4)} vs $${middle.toFixed(4)})`
              })()}
            </p>
          </div>

          {/* Volatility Assessment */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <h5 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${(() => {
                if (!analysis?.bollingerBands) return 'bg-gray-400'
                const upper = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1]
                const lower = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1]
                const middle = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1]
                const bandWidth = ((upper - lower) / middle * 100)
                if (bandWidth > 10) return 'bg-red-500'
                if (bandWidth > 5) return 'bg-yellow-500'
                return 'bg-green-500'
              })()}`}></div>
              Volatility Level
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {(() => {
                if (!analysis?.bollingerBands) return 'Volatility data unavailable'
                const upper = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1]
                const lower = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1]
                const middle = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1]
                const bandWidth = ((upper - lower) / middle * 100)

                if (bandWidth > 10) return `High volatility (${bandWidth.toFixed(1)}%) - expect large swings`
                if (bandWidth > 5) return `Moderate volatility (${bandWidth.toFixed(1)}%) - normal movement`
                return `Low volatility (${bandWidth.toFixed(1)}%) - price may consolidate`
              })()}
            </p>
          </div>

          {/* Risk Level */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <h5 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${(() => {
                const rsi = analysis?.rsi?.[analysis.rsi.length - 1] || 50
                const macdHistogram = analysis?.macd?.histogram[analysis.macd.histogram.length - 1] || 0
                const volatility = analysis?.bollingerBands ? (() => {
                  const upper = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1]
                  const lower = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1]
                  const middle = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1]
                  return ((upper - lower) / middle * 100)
                })() : 5

                if (volatility > 10 || (rsi >= 70 || rsi <= 30)) return 'bg-red-500'
                if (volatility > 5 || Math.abs(macdHistogram) > 0.05) return 'bg-yellow-500'
                return 'bg-green-500'
              })()}`}></div>
              Risk Assessment
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {(() => {
                const rsi = analysis?.rsi?.[analysis.rsi.length - 1] || 50
                const macdHistogram = analysis?.macd?.histogram[analysis.macd.histogram.length - 1] || 0
                const volatility = analysis?.bollingerBands ? (() => {
                  const upper = analysis.bollingerBands.upper[analysis.bollingerBands.upper.length - 1]
                  const lower = analysis.bollingerBands.lower[analysis.bollingerBands.lower.length - 1]
                  const middle = analysis.bollingerBands.middle[analysis.bollingerBands.middle.length - 1]
                  return ((upper - lower) / middle * 100)
                })() : 5

                if (volatility > 10 || (rsi >= 70 || rsi <= 30)) return 'High risk - extreme conditions'
                if (volatility > 5 || Math.abs(macdHistogram) > 0.05) return 'Medium risk - active market'
                return 'Low risk - stable conditions'
              })()}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Indicator Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* MACD Analysis */}
        {analysis?.macd && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">MACD Analysis</h4>
              <div className="group relative">
                <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  MACD measures momentum by comparing two moving averages
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">MACD Line:</span>
                  <span className="font-mono text-gray-800 dark:text-white">
                    {analysis.macd.macd[analysis.macd.macd.length - 1]?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  The difference between 12-day and 26-day exponential moving averages.
                  {analysis.macd.macd[analysis.macd.macd.length - 1] > 0
                    ? ` Currently ${analysis.macd.macd[analysis.macd.macd.length - 1].toFixed(2)}, indicating the short-term trend is stronger than the long-term trend for ${coinInfo?.name || 'this coin'}.`
                    : ` Currently ${analysis.macd.macd[analysis.macd.macd.length - 1].toFixed(2)}, indicating the long-term trend is stronger than the short-term trend for ${coinInfo?.name || 'this coin'}.`
                  }
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Signal Line:</span>
                  <span className="font-mono text-gray-800 dark:text-white">
                    {analysis.macd.signal[analysis.macd.signal.length - 1]?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  A 9-day exponential moving average of the MACD line.
                  {analysis.macd.signal[analysis.macd.signal.length - 1] > analysis.macd.macd[analysis.macd.macd.length - 1]
                    ? ` Currently ${analysis.macd.signal[analysis.macd.signal.length - 1].toFixed(2)} is above MACD (${analysis.macd.macd[analysis.macd.macd.length - 1].toFixed(2)}), suggesting a potential sell signal for ${coinInfo?.name || 'this coin'}.`
                    : ` Currently ${analysis.macd.signal[analysis.macd.signal.length - 1].toFixed(2)} is below MACD (${analysis.macd.macd[analysis.macd.macd.length - 1].toFixed(2)}), suggesting a potential buy signal for ${coinInfo?.name || 'this coin'}.`
                  }
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Histogram:</span>
                  <span className={`font-mono font-medium ${(analysis.macd.histogram[analysis.macd.histogram.length - 1] || 0) > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                    }`}>
                    {analysis.macd.histogram[analysis.macd.histogram.length - 1]?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  The difference between MACD and Signal lines.
                  {analysis.macd.histogram[analysis.macd.histogram.length - 1] > 0
                    ? ` Currently ${analysis.macd.histogram[analysis.macd.histogram.length - 1].toFixed(2)} (positive), indicating increasing bullish momentum for ${coinInfo?.name || 'this coin'}.`
                    : ` Currently ${analysis.macd.histogram[analysis.macd.histogram.length - 1].toFixed(2)} (negative), indicating decreasing momentum for ${coinInfo?.name || 'this coin'}.`
                  }
                  {Math.abs(analysis.macd.histogram[analysis.macd.histogram.length - 1]) < 0.01 && ' This near-zero value suggests potential trend change.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* RSI Analysis */}
        {analysis?.rsi && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">RSI Analysis</h4>
              <div className="group relative">
                <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  RSI measures momentum and identifies overbought/oversold conditions
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
                    if (currentRSI > previousRSI) return 'text-green-600 dark:text-green-400'
                    if (currentRSI < previousRSI) return 'text-red-600 dark:text-red-400'
                    return 'text-gray-600 dark:text-gray-400'
                  })()}`}>
                    {(() => {
                      const currentRSI = analysis.rsi[analysis.rsi.length - 1]
                      const previousRSI = analysis.rsi[analysis.rsi.length - 2]
                      if (currentRSI > previousRSI) return '↗ Rising'
                      if (currentRSI < previousRSI) return '↘ Falling'
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
                    if (change > 0) return ` Rising from ${previousRSI.toFixed(0)} to ${currentRSI.toFixed(0)} (+${change.toFixed(0)}), indicating increasing bullish momentum for ${coinInfo?.name || 'this coin'}.`
                    if (change < 0) return ` Falling from ${previousRSI.toFixed(0)} to ${currentRSI.toFixed(0)} (${change.toFixed(0)}), indicating increasing bearish momentum for ${coinInfo?.name || 'this coin'}.`
                    return ` Stable at ${currentRSI.toFixed(0)}, indicating momentum is stabilizing for ${coinInfo?.name || 'this coin'}.`
                  })()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalysisTechnicalDetails
