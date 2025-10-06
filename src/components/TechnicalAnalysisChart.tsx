import React, { lazy, Suspense, useState, useMemo } from 'react'
import type { TechnicalAnalysisData } from '../types'
import { useChartData } from '../hooks/useChartData'
import { useChartToggles } from '../hooks/useChartToggles'
import { 
  filterChartDataByTimeRange, 
  getDefaultTimeRange, 
  type TimeRange 
} from '../utils/chartDataFilter'

// Lazy load chart components to reduce bundle size
const PriceChart = lazy(() => import('./charts/PriceChart'))
const RSIChart = lazy(() => import('./charts/RSIChart'))
const MACDChart = lazy(() => import('./charts/MACDChart'))
const VolumeChart = lazy(() => import('./charts/VolumeChart'))

interface TechnicalAnalysisChartProps {
  data: TechnicalAnalysisData
  height?: number
}

const TechnicalAnalysisChart: React.FC<TechnicalAnalysisChartProps> = ({
  data,
  height = 400
}) => {
  const { 
    toggles
  } = useChartToggles()
  const { chartData } = useChartData(data, toggles)
  
  // Time range state - shared across all charts
  const [timeRange] = useState<TimeRange>(() => getDefaultTimeRange(chartData))
  const [showFullRange, setShowFullRange] = useState(false)
  
  // Filter chart data based on time range - shared across all charts
  const filteredChartData = useMemo(() => {
    if (showFullRange) {
      return chartData
    }
    return filterChartDataByTimeRange(chartData, timeRange)
  }, [chartData, timeRange, showFullRange])

  return (
    <div className="space-y-4">

      {/* Price Chart */}
      <Suspense fallback={
        <div className="flex items-center justify-center h-96 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading chart...</span>
        </div>
      }>
        <PriceChart 
          data={data} 
          chartData={filteredChartData} 
          toggles={toggles} 
          height={height}
          timeRange={timeRange}
          showFullRange={showFullRange}
          onToggleFullRange={setShowFullRange}
        />
      </Suspense>

      {/* Volume under Price */}
      <Suspense fallback={
        <div className="flex items-center justify-center h-48 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading Volume...</span>
        </div>
      }>
        <VolumeChart chartData={filteredChartData} />
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
          <RSIChart chartData={filteredChartData} />
        </Suspense>

        {/* MACD Chart */}
        {data.macd ? (
          <Suspense fallback={
            <div className="flex items-center justify-center h-64 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading MACD...</span>
            </div>
          }>
            <MACDChart chartData={filteredChartData} />
          </Suspense>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  MACD Not Available
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  MACD requires at least 20 data points for reliable calculation.
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  This coin may have limited trading history.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default React.memo(TechnicalAnalysisChart)