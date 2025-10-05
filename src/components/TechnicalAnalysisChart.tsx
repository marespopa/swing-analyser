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
const EChartsPriceChart = lazy(() => import('./charts/EChartsPriceChart'))
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
    toggles, 
    handleToggleChange
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
        <EChartsPriceChart 
          data={data} 
          chartData={filteredChartData} 
          toggles={toggles} 
          onToggleChange={handleToggleChange}
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
        {data.macd && (
          <Suspense fallback={
            <div className="flex items-center justify-center h-64 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading MACD...</span>
            </div>
          }>
            <MACDChart chartData={filteredChartData} />
          </Suspense>
        )}
      </div>

    </div>
  )
}

export default React.memo(TechnicalAnalysisChart)