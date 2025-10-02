import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import type { ChartDataPoint } from '../../types'
import { CHART_MARGINS, CHART_HEIGHTS } from '../../constants/chart'
import CustomTooltip from './CustomTooltip'

interface VolumeChartProps {
  chartData: ChartDataPoint[]
}

const VolumeChart: React.FC<VolumeChartProps> = ({ chartData }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
              Volume
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Daily trading volume
            </p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={CHART_HEIGHTS.volume}>
        <BarChart data={chartData} margin={CHART_MARGINS}>
          <CartesianGrid 
            strokeDasharray="1 3" 
            stroke="#E5E7EB" 
            opacity={0.5}
            vertical={false}
          />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF"
            fontSize={11}
            tick={{ fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={11}
            tick={{ fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            tickFormatter={(v: number) => {
              if (v >= 1e9) return `${(v/1e9).toFixed(1)}B`
              if (v >= 1e6) return `${(v/1e6).toFixed(1)}M`
              if (v >= 1e3) return `${(v/1e3).toFixed(1)}K`
              return `${v}`
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="volume" fill="#60A5FA" name="Volume" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default React.memo(VolumeChart)


