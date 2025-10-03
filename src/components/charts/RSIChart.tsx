import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import type { ChartDataPoint } from '../../types'
import { CHART_CONFIG, CHART_MARGINS, CHART_HEIGHTS, RSI_LEVELS } from '../../constants/chart'
import CustomTooltip from './CustomTooltip'

interface RSIChartProps {
  chartData: ChartDataPoint[]
}

const RSIChart: React.FC<RSIChartProps> = ({ chartData }) => {

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              RSI (Relative Strength Index)
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Momentum oscillator measuring speed and change of price movements
            </p>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={CHART_HEIGHTS.rsi}>
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
            domain={[0, 100]}
            stroke="#9CA3AF"
            fontSize={11}
            tick={{ fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* RSI Line */}
          <Line
            type="monotone"
            dataKey="rsi"
            stroke={CHART_CONFIG.colors.rsi}
            strokeWidth={2.5}
            dot={false}
            name="RSI"
            connectNulls={false}
          />
          
          {/* Reference Lines */}
          <ReferenceLine 
            y={RSI_LEVELS.overbought} 
            stroke="#EF4444" 
            strokeWidth={1.5}
            strokeDasharray="4 4" 
            label={{ 
              value: "Overbought (70)", 
              position: "top",
              style: { fill: '#EF4444', fontSize: '10px', fontWeight: 'bold' }
            }}
          />
          <ReferenceLine 
            y={RSI_LEVELS.oversold} 
            stroke="#10B981" 
            strokeWidth={1.5}
            strokeDasharray="4 4" 
            label={{ 
              value: "Oversold (30)", 
              position: "bottom",
              style: { fill: '#10B981', fontSize: '10px', fontWeight: 'bold' }
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default React.memo(RSIChart)
