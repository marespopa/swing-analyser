import React from 'react'
import type { TechnicalAnalysisData } from '../types'
import { useChartData } from '../hooks/useChartData'
import { useChartToggles } from '../hooks/useChartToggles'
import { 
  PriceChart, 
  RSIChart, 
  MACDChart
} from './charts'

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
      <PriceChart 
        data={data} 
        chartData={chartData} 
        toggles={toggles} 
        onToggleChange={handleToggleChange}
        height={height}
      />


      {/* Indicators Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RSI Chart */}
        <RSIChart chartData={chartData} />

        {/* MACD Chart */}
        {data.macd && <MACDChart chartData={chartData} />}
      </div>

    </div>
  )
}

export default React.memo(TechnicalAnalysisChart)