import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { ChartDataPoint } from '../../types'
import { CHART_HEIGHTS, RSI_LEVELS } from '../../constants/chart'

interface RSIChartProps {
  chartData: ChartDataPoint[]
}

const RSIChart: React.FC<RSIChartProps> = ({ chartData }) => {
  // Detect mobile device for responsive height
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const responsiveHeight = isMobile ? CHART_HEIGHTS.rsiMobile : CHART_HEIGHTS.rsi

  // Prepare data for ECharts
  const echartsData = useMemo(() => {
    return chartData
      .map(point => [point.timestamp, point.rsi])
      .filter(item => !isNaN(item[1] as number))
  }, [chartData])

  const option = useMemo(() => ({
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#6B7280',
        fontSize: 11
      },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#6B7280',
        fontSize: 11
      },
      splitLine: {
        lineStyle: {
          color: '#E5E7EB',
          type: 'dashed',
          opacity: 0.5
        }
      }
    },
    series: [
      {
        name: 'RSI',
        type: 'line',
        data: echartsData,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: '#C084FC',
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
              { offset: 0, color: 'rgba(192, 132, 252, 0.3)' },
              { offset: 1, color: 'rgba(192, 132, 252, 0.05)' }
            ]
          }
        }
      }
    ],
    markLine: {
      data: [
        {
          yAxis: RSI_LEVELS.overbought,
          lineStyle: {
            color: '#EF4444',
            type: 'dashed',
            width: 2
          },
          label: {
            show: true,
            position: 'end',
            formatter: 'Overbought (70)',
            color: '#EF4444',
            fontSize: 11
          }
        },
        {
          yAxis: RSI_LEVELS.oversold,
          lineStyle: {
            color: '#10B981',
            type: 'dashed',
            width: 2
          },
          label: {
            show: true,
            position: 'end',
            formatter: 'Oversold (30)',
            color: '#10B981',
            fontSize: 11
          }
        }
      ]
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#374151',
      textStyle: {
        color: '#F9FAFB',
        fontSize: 12
      },
      formatter: (params: any) => {
        const data = params[0]
        const date = new Date(data.axisValue).toLocaleString()
        const value = data.value[1].toFixed(2)
        return `${date}<br/>RSI: ${value}`
      }
    }
  }), [echartsData])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              RSI (Relative Strength Index)
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Momentum oscillator measuring speed and magnitude of price changes
            </p>
          </div>
        </div>
      </div>
      
      <ReactECharts
        option={option}
        style={{ height: responsiveHeight, width: '100%' }}
        opts={{ 
          renderer: 'canvas'
        }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  )
}

export default React.memo(RSIChart)