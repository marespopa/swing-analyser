import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import type { ChartDataPoint } from '../../types'
import { CHART_CONFIG, CHART_MARGINS, CHART_HEIGHTS } from '../../constants/chart'
import CustomTooltip from './CustomTooltip'

interface MACDChartProps {
  chartData: ChartDataPoint[]
}

const MACDChart: React.FC<MACDChartProps> = ({ chartData }) => {

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              MACD (Moving Average Convergence Divergence)
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Trend-following momentum indicator showing relationship between two moving averages
            </p>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={CHART_HEIGHTS.macd}>
        <LineChart data={chartData} margin={CHART_MARGINS}>
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
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '10px',
              fontSize: '11px'
            }}
          />
          
          {/* MACD Lines */}
          <Line
            type="monotone"
            dataKey="macd"
            stroke={CHART_CONFIG.colors.macd}
            strokeWidth={2.5}
            dot={false}
            name="MACD"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="signal"
            stroke={CHART_CONFIG.colors.signal}
            strokeWidth={2}
            dot={false}
            name="Signal"
            connectNulls={false}
          />
          
          {/* Zero Line */}
          <ReferenceLine 
            y={0} 
            stroke="#6B7280" 
            strokeWidth={1}
            strokeDasharray="2 2" 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default React.memo(MACDChart)
