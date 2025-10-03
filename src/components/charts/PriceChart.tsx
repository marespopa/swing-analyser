import React from 'react'
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  ComposedChart
} from 'recharts'
import type { TechnicalAnalysisData, ChartDataPoint, ToggleState } from '../../types'
import { CHART_CONFIG, CHART_DASH_PATTERNS, CHART_MARGINS, CHART_HEIGHTS } from '../../constants/chart'
import CustomTooltip from './CustomTooltip'
import ChartWithCrosshair from './ChartWithCrosshair'

interface PriceChartProps {
  data: TechnicalAnalysisData
  chartData: ChartDataPoint[]
  toggles: ToggleState
  onToggleChange?: (key: keyof ToggleState, value: boolean | string) => void
  height?: number
}

const PriceChart: React.FC<PriceChartProps> = ({ 
  data, 
  chartData, 
  toggles, 
  onToggleChange,
  height = CHART_HEIGHTS.main 
}) => {

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: CHART_MARGINS
    }

    const commonElements = (
      <>
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
          domain={['dataMin * 0.98', 'dataMax * 1.02']}
          tickFormatter={(value) => `$${value.toFixed(4)}`}
          axisLine={false}
          tickLine={false}
          tickMargin={8}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ 
            paddingTop: '20px',
            fontSize: '12px'
          }}
        />
        
        {/* Price Area with Gradient Fill */}
        <Area
          type="monotone"
          dataKey="price"
          fill="url(#priceGradient)"
          stroke="none"
        />
        
        {/* Price Line */}
        <Line
          type="monotone"
          dataKey="price"
          stroke={CHART_CONFIG.colors.price}
          strokeWidth={CHART_CONFIG.strokeWidths.price}
          dot={false}
          name="Price"
        />
        
        {/* SMA 20 */}
        {toggles.showSMA20 && (
          <Line
            type="monotone"
            dataKey="sma20"
            stroke={CHART_CONFIG.colors.sma20}
            strokeWidth={CHART_CONFIG.strokeWidths.movingAverage}
            strokeDasharray={CHART_DASH_PATTERNS.movingAverage}
            dot={false}
            name="SMA 20"
            connectNulls={false}
            opacity={CHART_CONFIG.opacities.movingAverage}
          />
        )}

        {/* SMA 50 */}
        {toggles.showSMA50 && (
          <Line
            type="monotone"
            dataKey="sma50"
            stroke={CHART_CONFIG.colors.sma50}
            strokeWidth={CHART_CONFIG.strokeWidths.movingAverage}
            strokeDasharray={CHART_DASH_PATTERNS.movingAverage}
            dot={false}
            name="SMA 50"
            connectNulls={false}
            opacity={CHART_CONFIG.opacities.movingAverage}
          />
        )}
        
        {/* Bollinger Bands */}
        {data.bollingerBands && toggles.showBollingerBands && (
          <>
            <Line
              type="monotone"
              dataKey="bbUpper"
              stroke={CHART_CONFIG.colors.bbUpper}
              strokeWidth={CHART_CONFIG.strokeWidths.bollingerBand}
              strokeDasharray={CHART_DASH_PATTERNS.bollingerBand}
              dot={false}
              name="BB Upper"
              connectNulls={false}
              opacity={CHART_CONFIG.opacities.bollingerBand}
            />
            <Line
              type="monotone"
              dataKey="bbLower"
              stroke={CHART_CONFIG.colors.bbLower}
              strokeWidth={CHART_CONFIG.strokeWidths.bollingerBand}
              strokeDasharray={CHART_DASH_PATTERNS.bollingerBand}
              dot={false}
              name="BB Lower"
              connectNulls={false}
              opacity={CHART_CONFIG.opacities.bollingerBand}
            />
          </>
        )}
        
      </>
    )


    return (
      <ComposedChart {...commonProps}>
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3}/>
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.05}/>
          </linearGradient>
        </defs>
        {commonElements}
      </ComposedChart>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              Price Chart
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Daily price with technical indicators
            </p>
          </div>
          
          {/* Indicator Toggles */}
          {onToggleChange && (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Indicators:</span>
              <div className="flex items-center space-x-3">
                {/* SMA 20 Toggle */}
                <div 
                  className="flex items-center space-x-1 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                  onClick={() => onToggleChange('showSMA20', !toggles.showSMA20)}
                >
                  <div 
                    className="w-3 h-3 rounded-sm border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: toggles.showSMA20 ? '#EF4444' : '#E5E7EB' }}
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    SMA 20
                  </span>
                </div>

                {/* SMA 50 Toggle */}
                <div 
                  className="flex items-center space-x-1 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                  onClick={() => onToggleChange('showSMA50', !toggles.showSMA50)}
                >
                  <div 
                    className="w-3 h-3 rounded-sm border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: toggles.showSMA50 ? '#F59E0B' : '#E5E7EB' }}
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    SMA 50
                  </span>
                </div>

                {/* Bollinger Bands Toggle */}
                {data.bollingerBands && (
                  <div 
                    className="flex items-center space-x-1 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                    onClick={() => onToggleChange('showBollingerBands', !toggles.showBollingerBands)}
                  >
                    <div 
                      className="w-3 h-3 rounded-sm border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: toggles.showBollingerBands ? '#8B5CF6' : '#E5E7EB' }}
                    />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Bollinger Bands
                    </span>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      </div>
      
        <ChartWithCrosshair 
          height={height} 
          data={chartData}
        >
          {renderChart()}
        </ChartWithCrosshair>
    </div>
  )
}

export default React.memo(PriceChart)
