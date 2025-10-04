import React, { useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { TechnicalAnalysisData, ChartDataPoint, ToggleState } from '../../types'
import { CHART_HEIGHTS } from '../../constants/chart'
import { 
  filterChartDataByTimeRange, 
  getDefaultTimeRange, 
  formatTimeRange,
  type TimeRange 
} from '../../utils/chartDataFilter'
import { FaCalendarAlt, FaExpandArrowsAlt, FaCompressArrowsAlt } from 'react-icons/fa'

interface EChartsPriceChartProps {
  data: TechnicalAnalysisData
  chartData: ChartDataPoint[]
  toggles: ToggleState
  onToggleChange?: (key: keyof ToggleState, value: boolean | string) => void
  height?: number
}

const EChartsPriceChart: React.FC<EChartsPriceChartProps> = ({ 
  data, 
  chartData, 
  toggles, 
  onToggleChange,
  height = CHART_HEIGHTS.main 
}) => {
  // Detect mobile device for responsive height
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const responsiveHeight = isMobile ? CHART_HEIGHTS.mainMobile : height
  
  // Time range state
  const [timeRange] = useState<TimeRange>(() => getDefaultTimeRange(chartData))
  const [showFullRange, setShowFullRange] = useState(false)
  
  // Filter chart data based on time range
  const filteredChartData = useMemo(() => {
    if (showFullRange) {
      return chartData
    }
    return filterChartDataByTimeRange(chartData, timeRange)
  }, [chartData, timeRange, showFullRange])
  
  // Prepare data for ECharts line format
  const echartsData = useMemo(() => {
    return filteredChartData.map(point => [point.timestamp, point.price])
  }, [filteredChartData])

  // Prepare moving averages data
  const sma20Data = useMemo(() => {
    if (!toggles.showSMA20) return []
    return filteredChartData
      .map((point, index) => [point.timestamp, data.sma20[index]])
      .filter(item => !isNaN(item[1] as number))
  }, [filteredChartData, data.sma20, toggles.showSMA20])

  const sma50Data = useMemo(() => {
    if (!toggles.showSMA50) return []
    return filteredChartData
      .map((point, index) => [point.timestamp, data.sma50[index]])
      .filter(item => !isNaN(item[1] as number))
  }, [filteredChartData, data.sma50, toggles.showSMA50])

  const sma9Data = useMemo(() => {
    if (!toggles.showSMA9) return []
    return filteredChartData
      .map((point, index) => [point.timestamp, data.ema9[index]])
      .filter(item => !isNaN(item[1] as number))
  }, [filteredChartData, data.ema9, toggles.showSMA9])

  const ema21Data = useMemo(() => {
    if (!toggles.showEMA21) return []
    return filteredChartData
      .map((point, index) => [point.timestamp, data.ema20[index]])
      .filter(item => !isNaN(item[1] as number))
  }, [filteredChartData, data.ema20, toggles.showEMA21])

  // Prepare Bollinger Bands data
  const bollingerBandsData = useMemo(() => {
    if (!data.bollingerBands || !toggles.showBollingerBands) return { upper: [], middle: [], lower: [] }
    
    return {
      upper: filteredChartData
        .map((point, index) => [point.timestamp, data.bollingerBands!.upper[index]])
        .filter(item => !isNaN(item[1] as number)),
      middle: filteredChartData
        .map((point, index) => [point.timestamp, data.bollingerBands!.middle[index]])
        .filter(item => !isNaN(item[1] as number)),
      lower: filteredChartData
        .map((point, index) => [point.timestamp, data.bollingerBands!.lower[index]])
        .filter(item => !isNaN(item[1] as number))
    }
  }, [filteredChartData, data.bollingerBands, toggles.showBollingerBands])

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
    if (toggles.showSMA20 && sma20Data.length > 0) {
      series.push({
        name: 'SMA 20',
        type: 'line',
        data: sma20Data,
        smooth: true,
        lineStyle: {
          color: '#EF4444',
          width: 1,
          type: 'dashed'
        },
        symbol: 'none'
      })
    }

    if (toggles.showSMA50 && sma50Data.length > 0) {
      series.push({
        name: 'SMA 50',
        type: 'line',
        data: sma50Data,
        smooth: true,
        lineStyle: {
          color: '#F59E0B',
          width: 1,
          type: 'dashed'
        },
        symbol: 'none'
      })
    }

    if (toggles.showSMA9 && sma9Data.length > 0) {
      series.push({
        name: 'EMA 9',
        type: 'line',
        data: sma9Data,
        smooth: true,
        lineStyle: {
          color: '#8B5CF6',
          width: 1,
          type: 'dashed'
        },
        symbol: 'none'
      })
    }

    if (toggles.showEMA21 && ema21Data.length > 0) {
      series.push({
        name: 'EMA 21',
        type: 'line',
        data: ema21Data,
        smooth: true,
        lineStyle: {
          color: '#10B981',
          width: 1,
          type: 'dashed'
        },
        symbol: 'none'
      })
    }

    // Add Bollinger Bands
    if (data.bollingerBands && toggles.showBollingerBands) {
      series.push(
        {
          name: 'BB Upper',
          type: 'line',
          data: bollingerBandsData.upper,
          smooth: true,
          lineStyle: {
            color: '#C084FC',
            width: 1,
            type: 'dashed'
          },
          symbol: 'none'
        },
        {
          name: 'BB Lower',
          type: 'line',
          data: bollingerBandsData.lower,
          smooth: true,
          lineStyle: {
            color: '#C084FC',
            width: 1,
            type: 'dashed'
          },
          symbol: 'none'
        }
      )
    }

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
      legend: {
        data: series.map(s => s.name),
        bottom: 10,
        textStyle: {
          color: '#6B7280',
          fontSize: 12
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
      series
    }
  }, [echartsData, sma20Data, sma50Data, sma9Data, ema21Data, bollingerBandsData, toggles, data.bollingerBands])

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
          
          {/* Chart Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Time Range Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                <FaCalendarAlt className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {showFullRange ? 'All Data' : formatTimeRange(timeRange)}
                </span>
              </div>
              <button
                onClick={() => setShowFullRange(!showFullRange)}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={showFullRange ? 'Show last 3 months' : 'Show all data'}
              >
                {showFullRange ? (
                  <FaCompressArrowsAlt className="w-4 h-4" />
                ) : (
                  <FaExpandArrowsAlt className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Indicator Toggles */}
            {onToggleChange && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* EMA 9 Toggle */}
                <div 
                  className="flex items-center space-x-2 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors min-h-[44px] touch-manipulation"
                  onClick={() => onToggleChange('showSMA9', !toggles.showSMA9)}
                >
                  <div 
                    className="w-4 h-4 rounded-sm border border-gray-300 dark:border-gray-600 flex-shrink-0"
                    style={{ backgroundColor: toggles.showSMA9 ? '#8B5CF6' : '#E5E7EB' }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    EMA 9
                  </span>
                </div>

                {/* EMA 21 Toggle */}
                <div 
                  className="flex items-center space-x-2 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors min-h-[44px] touch-manipulation"
                  onClick={() => onToggleChange('showEMA21', !toggles.showEMA21)}
                >
                  <div 
                    className="w-4 h-4 rounded-sm border border-gray-300 dark:border-gray-600 flex-shrink-0"
                    style={{ backgroundColor: toggles.showEMA21 ? '#10B981' : '#E5E7EB' }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    EMA 21
                  </span>
                </div>

                {/* Bollinger Bands Toggle */}
                {data.bollingerBands && (
                  <div 
                    className="flex items-center space-x-2 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors min-h-[44px] touch-manipulation"
                    onClick={() => onToggleChange('showBollingerBands', !toggles.showBollingerBands)}
                  >
                    <div 
                      className="w-4 h-4 rounded-sm border border-gray-300 dark:border-gray-600 flex-shrink-0"
                      style={{ backgroundColor: toggles.showBollingerBands ? '#C084FC' : '#E5E7EB' }}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bollinger Bands
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <ReactECharts
        key={`${toggles.showSMA9}-${toggles.showEMA21}-${toggles.showBollingerBands}`}
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

export default EChartsPriceChart
