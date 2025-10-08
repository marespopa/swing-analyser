import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { TechnicalAnalysisData, ChartDataPoint, ToggleState } from '../../types'
import { CHART_HEIGHTS } from '../../constants/chart'
import { 
  formatTimeRange,
  type TimeRange 
} from '../../utils/chartDataFilter'
import { FaCalendarAlt, FaExpandArrowsAlt, FaCompressArrowsAlt } from 'react-icons/fa'

interface PriceChartProps {
  data: TechnicalAnalysisData
  chartData: ChartDataPoint[]
  toggles: ToggleState
  height?: number
  timeRange?: TimeRange
  showFullRange?: boolean
  onToggleFullRange?: (showFull: boolean) => void
}

const PriceChart: React.FC<PriceChartProps> = ({ 
  data, 
  chartData, 
  toggles, 
  height = CHART_HEIGHTS.main,
  timeRange,
  showFullRange = false,
  onToggleFullRange
}) => {
  // Detect mobile device for responsive height
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const responsiveHeight = isMobile ? CHART_HEIGHTS.mainMobile : height
  
  // Use chartData directly since it's already filtered by parent component
  const filteredChartData = chartData
  
  // Prepare data for ECharts line format
  const echartsData = useMemo(() => {
    return filteredChartData.map(point => [point.timestamp, point.price])
  }, [filteredChartData])

  // Prepare moving averages data
  const ema9Data = useMemo(() => {
    if (!toggles.showEMA9 || !data.ema9) return []
    
    // Find the corresponding EMA values for the filtered chart data
    return filteredChartData
      .map((point) => {
        // Find the index of this timestamp in the original data
        const originalIndex = data.data.findIndex(d => d.timestamp === point.timestamp)
        if (originalIndex === -1 || originalIndex >= data.ema9.length) return null
        
        const emaValue = data.ema9[originalIndex]
        if (isNaN(emaValue) || emaValue === null) return null
        
        return [point.timestamp, emaValue]
      })
      .filter(item => item !== null)
  }, [filteredChartData, data.ema9, data.data, toggles.showEMA9])

  const ema21Data = useMemo(() => {
    if (!toggles.showEMA21 || !data.ema20) return []
    
    // Find the corresponding EMA values for the filtered chart data (same approach as ema9Data)
    return filteredChartData
      .map((point) => {
        // Find the index of this timestamp in the original data
        const originalIndex = data.data.findIndex(d => d.timestamp === point.timestamp)
        if (originalIndex === -1 || originalIndex >= data.ema20.length) return null
        
        const emaValue = data.ema20[originalIndex]
        if (isNaN(emaValue) || emaValue === null) return null
        
        return [point.timestamp, emaValue]
      })
      .filter(item => item !== null)
  }, [filteredChartData, data.ema20, data.data, toggles.showEMA21])

  // Prepare Bollinger Bands data
  const bollingerBandsData = useMemo(() => {
    if (!data.bollingerBands || !toggles.showBollingerBands) return { upper: [], middle: [], lower: [] }
    
    return {
      upper: filteredChartData
        .map((point) => {
          const originalIndex = data.data.findIndex(d => d.timestamp === point.timestamp)
          if (originalIndex === -1 || originalIndex >= data.bollingerBands!.upper.length) return null
          const value = data.bollingerBands!.upper[originalIndex]
          if (isNaN(value) || value === null) return null
          return [point.timestamp, value]
        })
        .filter(item => item !== null),
      middle: filteredChartData
        .map((point) => {
          const originalIndex = data.data.findIndex(d => d.timestamp === point.timestamp)
          if (originalIndex === -1 || originalIndex >= data.bollingerBands!.middle.length) return null
          const value = data.bollingerBands!.middle[originalIndex]
          if (isNaN(value) || value === null) return null
          return [point.timestamp, value]
        })
        .filter(item => item !== null),
      lower: filteredChartData
        .map((point) => {
          const originalIndex = data.data.findIndex(d => d.timestamp === point.timestamp)
          if (originalIndex === -1 || originalIndex >= data.bollingerBands!.lower.length) return null
          const value = data.bollingerBands!.lower[originalIndex]
          if (isNaN(value) || value === null) return null
          return [point.timestamp, value]
        })
        .filter(item => item !== null)
    }
  }, [filteredChartData, data.bollingerBands, data.data, toggles.showBollingerBands])

  const option = useMemo(() => {
    const series: any[] = []

    // Line chart with area
    series.push({
      name: 'Price',
      type: 'line',
      data: echartsData,
      smooth: true,
      symbol: 'none', // Remove dots
      lineStyle: {
        color: '#60A5FA',
        width: 2
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(96, 165, 250, 0.3)' },
            { offset: 1, color: 'rgba(96, 165, 250, 0.05)' }
          ]
        }
      }
    })

    // Add moving averages
    if (toggles.showEMA9 && ema9Data.length > 0) {
      series.push({
        name: 'EMA 9',
        type: 'line',
        data: ema9Data,
        smooth: true,
        lineStyle: {
          color: '#FBBF24',
          width: 2,
          type: 'solid'
        },
        symbol: 'none'
      })
    }

    if (toggles.showEMA21 && ema21Data.length > 0) {
      series.push({
        name: 'EMA 20',
        type: 'line',
        data: ema21Data,
        smooth: true,
        lineStyle: {
          color: '#10B981',
          width: 2,
          type: 'solid'
        },
        symbol: 'none'
      })
    }

    // Add Bollinger Bands - Temporarily disabled due to calculation issues
    // TODO: Fix Bollinger Bands calculations to properly follow price movement

    // if (data.bollingerBands && toggles.showBollingerBands) {
    //   series.push(
    //     {
    //       name: 'BB Upper',
    //       type: 'line',
    //       data: bollingerBandsData.upper,
    //       smooth: true,
    //       lineStyle: {
    //         color: '#C084FC',
    //         width: 1,
    //         type: 'dashed'
    //       },
    //       symbol: 'none'
    //     },
    //     {
    //       name: 'BB Lower',
    //       type: 'line',
    //       data: bollingerBandsData.lower,
    //       smooth: true,
    //       lineStyle: {
    //         color: '#C084FC',
    //         width: 1,
    //         type: 'dashed'
    //       },
    //       symbol: 'none'
    //     }
    //   )
    // }

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        textStyle: {
          color: '#374151'
        },
        formatter: (params: any) => {
          let result = `<div style="padding: 8px;"><div style="font-weight: bold; margin-bottom: 4px;">${new Date(params[0].data[0]).toLocaleString()}</div>`
          params.forEach((param: any) => {
            result += `<div>${param.seriesName}: $${param.data[1].toFixed(4)}</div>`
          })
          result += '</div>'
          return result
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '5%',
        containLabel: true
      },
      xAxis: {
        type: 'time',
        axisLine: {
          lineStyle: {
            color: '#9CA3AF'
          }
        },
        axisLabel: {
          color: '#6B7280',
          fontSize: 11
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLine: {
          lineStyle: {
            color: '#9CA3AF'
          }
        },
        axisLabel: {
          color: '#6B7280',
          fontSize: 11,
          formatter: (value: number) => `$${value.toFixed(4)}`
        },
        splitLine: {
          lineStyle: {
            color: '#E5E7EB',
            type: 'dashed',
            opacity: 0.5
          }
        }
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
          zoomLock: false
        }
      ],
      legend: {
        data: series.map(s => s.name),
        bottom: 10,
        textStyle: {
          color: '#6B7280',
          fontSize: 12
        }
      },
      series
    }
  }, [echartsData, ema9Data, ema21Data, bollingerBandsData, toggles, data.bollingerBands])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              Price Chart
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Daily price
            </p>
          </div>
          
          {/* Chart Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Time Range Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                <FaCalendarAlt className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {showFullRange ? 'All Data' : timeRange ? formatTimeRange(timeRange) : 'Loading...'}
                </span>
              </div>
              {onToggleFullRange && (
                <button
                  onClick={() => onToggleFullRange(!showFullRange)}
                  className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={showFullRange ? 'Show last 3 months' : 'Show all data'}
                >
                  {showFullRange ? (
                    <FaCompressArrowsAlt className="w-4 h-4" />
                  ) : (
                    <FaExpandArrowsAlt className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
      
      <ReactECharts
        key={`price-chart-${filteredChartData.length}`}
        option={option}
        style={{ height: responsiveHeight, width: '100%' }}
        opts={{ 
          renderer: 'canvas'
        }}
        notMerge={true} // Force complete re-render for better performance
        lazyUpdate={true} // Lazy update for better performance
      />
    </div>
  )
}

export default PriceChart
