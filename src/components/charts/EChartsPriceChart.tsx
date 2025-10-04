import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { TechnicalAnalysisData, ChartDataPoint, ToggleState } from '../../types'
import { CHART_HEIGHTS } from '../../constants/chart'

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
  
  // Prepare data for ECharts line format
  const echartsData = useMemo(() => {
    return chartData.map(point => [point.timestamp, point.price])
  }, [chartData])

  // Prepare moving averages data
  const sma20Data = useMemo(() => {
    if (!toggles.showSMA20) return []
    return chartData
      .map((point, index) => [point.timestamp, data.sma20[index]])
      .filter(item => !isNaN(item[1] as number))
  }, [chartData, data.sma20, toggles.showSMA20])

  const sma50Data = useMemo(() => {
    if (!toggles.showSMA50) return []
    return chartData
      .map((point, index) => [point.timestamp, data.sma50[index]])
      .filter(item => !isNaN(item[1] as number))
  }, [chartData, data.sma50, toggles.showSMA50])

  const sma9Data = useMemo(() => {
    if (!toggles.showSMA9) return []
    return chartData
      .map((point, index) => [point.timestamp, data.ema9[index]])
      .filter(item => !isNaN(item[1] as number))
  }, [chartData, data.ema9, toggles.showSMA9])

  const ema21Data = useMemo(() => {
    if (!toggles.showEMA21) return []
    return chartData
      .map((point, index) => [point.timestamp, data.ema20[index]])
      .filter(item => !isNaN(item[1] as number))
  }, [chartData, data.ema20, toggles.showEMA21])

  // Prepare Bollinger Bands data
  const bollingerBandsData = useMemo(() => {
    if (!data.bollingerBands || !toggles.showBollingerBands) return { upper: [], middle: [], lower: [] }
    
    return {
      upper: chartData
        .map((point, index) => [point.timestamp, data.bollingerBands!.upper[index]])
        .filter(item => !isNaN(item[1] as number)),
      middle: chartData
        .map((point, index) => [point.timestamp, data.bollingerBands!.middle[index]])
        .filter(item => !isNaN(item[1] as number)),
      lower: chartData
        .map((point, index) => [point.timestamp, data.bollingerBands!.lower[index]])
        .filter(item => !isNaN(item[1] as number))
    }
  }, [chartData, data.bollingerBands, toggles.showBollingerBands])

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
          {onToggleChange && (
            <div className="flex items-center space-x-4">
              {/* Indicator Toggles */}
              <div className="flex items-center space-x-3">
                {/* EMA 9 Toggle */}
                <div 
                  className="flex items-center space-x-1 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                  onClick={() => onToggleChange('showSMA9', !toggles.showSMA9)}
                >
                  <div 
                    className="w-3 h-3 rounded-sm border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: toggles.showSMA9 ? '#8B5CF6' : '#E5E7EB' }}
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    EMA 9
                  </span>
                </div>

                {/* EMA 21 Toggle */}
                <div 
                  className="flex items-center space-x-1 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                  onClick={() => onToggleChange('showEMA21', !toggles.showEMA21)}
                >
                  <div 
                    className="w-3 h-3 rounded-sm border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: toggles.showEMA21 ? '#10B981' : '#E5E7EB' }}
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    EMA 21
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
                      style={{ backgroundColor: toggles.showBollingerBands ? '#C084FC' : '#E5E7EB' }}
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
      
      <ReactECharts
        key={`${toggles.showSMA9}-${toggles.showEMA21}-${toggles.showBollingerBands}`}
        option={option}
        style={{ height: height, width: '100%' }}
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
