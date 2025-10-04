import React from 'react'
import { calculateBullishnessScore, type BullishnessScore } from '../../utils/bullishnessIndicator'
import type { TechnicalAnalysisData, ChartDataPoint } from '../../types'

interface BullishnessIndicatorProps {
  data: TechnicalAnalysisData
  chartData: ChartDataPoint[]
}

const BullishnessIndicator: React.FC<BullishnessIndicatorProps> = ({ data, chartData }) => {
  const score = calculateBullishnessScore(data, chartData)

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400'
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 70) return 'bg-green-100 dark:bg-green-900/20'
    if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900/20'
    return 'bg-red-100 dark:bg-red-900/20'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Very Bullish'
    if (score >= 70) return 'Bullish'
    if (score >= 60) return 'Moderately Bullish'
    if (score >= 50) return 'Neutral'
    if (score >= 40) return 'Moderately Bearish'
    if (score >= 30) return 'Bearish'
    return 'Very Bearish'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 70) return '🚀'
    if (score >= 50) return '📈'
    return '📉'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {getScoreIcon(score.overall)} Bullishness Indicator
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Comprehensive technical analysis score
          </p>
        </div>
        
        <div className={`px-4 py-2 rounded-lg ${getScoreBgColor(score.overall)}`}>
          <div className={`text-2xl font-bold ${getScoreColor(score.overall)}`}>
            {score.overall}
          </div>
          <div className={`text-sm font-medium ${getScoreColor(score.overall)}`}>
            {getScoreLabel(score.overall)}
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Technical</div>
          <div className={`text-lg font-semibold ${getScoreColor(score.technical)}`}>
            {score.technical}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Momentum</div>
          <div className={`text-lg font-semibold ${getScoreColor(score.momentum)}`}>
            {score.momentum}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Volume</div>
          <div className={`text-lg font-semibold ${getScoreColor(score.volume)}`}>
            {score.volume}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trend</div>
          <div className={`text-lg font-semibold ${getScoreColor(score.trend)}`}>
            {score.trend}
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900 dark:text-white">Detailed Analysis</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Moving Averages</span>
              <span className={`text-sm font-medium ${getScoreColor(score.breakdown.movingAverages)}`}>
                {score.breakdown.movingAverages}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${score.breakdown.movingAverages >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${score.breakdown.movingAverages}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">RSI</span>
              <span className={`text-sm font-medium ${getScoreColor(score.breakdown.rsi)}`}>
                {score.breakdown.rsi}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${score.breakdown.rsi >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${score.breakdown.rsi}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">MACD</span>
              <span className={`text-sm font-medium ${getScoreColor(score.breakdown.macd)}`}>
                {score.breakdown.macd}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${score.breakdown.macd >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${score.breakdown.macd}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Volume Analysis</span>
              <span className={`text-sm font-medium ${getScoreColor(score.breakdown.volumeAnalysis)}`}>
                {score.breakdown.volumeAnalysis}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${score.breakdown.volumeAnalysis >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${score.breakdown.volumeAnalysis}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Price Action</span>
              <span className={`text-sm font-medium ${getScoreColor(score.breakdown.priceAction)}`}>
                {score.breakdown.priceAction}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${score.breakdown.priceAction >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${score.breakdown.priceAction}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Trend Strength</span>
              <span className={`text-sm font-medium ${getScoreColor(score.breakdown.trendStrength)}`}>
                {score.breakdown.trendStrength}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${score.breakdown.trendStrength >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${score.breakdown.trendStrength}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Signals */}
      {(score.signals.bullish.length > 0 || score.signals.bearish.length > 0 || score.signals.neutral.length > 0) && (
        <div className="mt-6 space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">Market Signals</h4>
          
          {score.signals.bullish.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                🟢 Bullish Signals
              </h5>
              <ul className="space-y-1">
                {score.signals.bullish.map((signal, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {signal}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {score.signals.bearish.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
                🔴 Bearish Signals
              </h5>
              <ul className="space-y-1">
                {score.signals.bearish.map((signal, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    {signal}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {score.signals.neutral.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2 flex items-center gap-1">
                🟡 Neutral Signals
              </h5>
              <ul className="space-y-1">
                {score.signals.neutral.map((signal, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    {signal}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BullishnessIndicator
