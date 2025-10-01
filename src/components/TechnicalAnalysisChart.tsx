import React, { lazy, Suspense } from 'react'
import type { TechnicalAnalysisData } from '../types'
import { useChartData } from '../hooks/useChartData'
import { useChartToggles } from '../hooks/useChartToggles'

// Lazy load chart components to reduce bundle size
const PriceChart = lazy(() => import('./charts/PriceChart'))
const RSIChart = lazy(() => import('./charts/RSIChart'))
const MACDChart = lazy(() => import('./charts/MACDChart'))

interface TechnicalAnalysisChartProps {
  data: TechnicalAnalysisData
  height?: number
}

const TechnicalAnalysisChart: React.FC<TechnicalAnalysisChartProps> = ({
  data,
  height = 400
}) => {
  const { 
    toggles, 
    handleToggleChange
  } = useChartToggles()
  const { chartData } = useChartData(data, toggles)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Technical Analysis Dashboard
        </h2>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            {data.interval.toUpperCase()} Timeframe
          </span>
          <span className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            {data.entryPoints.length} Entry Signals
          </span>
        </div>
      </div>

      {/* Price Chart */}
      <Suspense fallback={
        <div className="flex items-center justify-center h-96 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading chart...</span>
        </div>
      }>
        <PriceChart 
          data={data} 
          chartData={chartData} 
          toggles={toggles} 
          onToggleChange={handleToggleChange}
          height={height}
        />
      </Suspense>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RSI Chart */}
        <Suspense fallback={
          <div className="flex items-center justify-center h-64 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading RSI...</span>
          </div>
        }>
          <RSIChart chartData={chartData} />
        </Suspense>

        {/* MACD Chart */}
        {data.macd && (
          <Suspense fallback={
            <div className="flex items-center justify-center h-64 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading MACD...</span>
            </div>
          }>
            <MACDChart chartData={chartData} />
          </Suspense>
        )}
      </div>

    </div>
  )
}

export default React.memo(TechnicalAnalysisChart)