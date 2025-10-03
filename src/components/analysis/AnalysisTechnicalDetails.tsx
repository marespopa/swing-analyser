import React from 'react'
import type { TechnicalAnalysisData } from '../../services/coingeckoApi'
import { FaInfoCircle } from 'react-icons/fa'

interface CoinInfo {
  id: string
  name: string
  symbol: string
  currentPrice?: number
}

interface AnalysisTechnicalDetailsProps {
  analysis: TechnicalAnalysisData | null
  coinInfo: CoinInfo | null
}

const AnalysisTechnicalDetails: React.FC<AnalysisTechnicalDetailsProps> = ({
  analysis,
  coinInfo,
}) => {
  if (!analysis) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative z-40">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        Technical Indicators Breakdown
      </h3>

      {/* Detailed Indicator Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* RSI Analysis */}
        {analysis?.rsi && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">RSI Analysis</h4>
              <div className="group relative">
                <FaInfoCircle className="w-4 h-4 text-gray-400 cursor-help" />
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
        {/* MACD Analysis */}
        {analysis?.macd && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">MACD Analysis</h4>
              <div className="group relative">
                <FaInfoCircle className="w-4 h-4 text-gray-400 cursor-help" />
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
      </div>
    </div>
  )
}

export default AnalysisTechnicalDetails
