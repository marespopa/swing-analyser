import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { ChartDataPoint } from '../../types'
import { CHART_HEIGHTS } from '../../constants/chart'

interface MACDChartProps {
  chartData: ChartDataPoint[]
}

const MACDChart: React.FC<MACDChartProps> = ({ chartData }) => {
  // Detect mobile device for responsive height
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const responsiveHeight = isMobile ? CHART_HEIGHTS.macdMobile : CHART_HEIGHTS.macd

  // Prepare data for ECharts
  const macdData = useMemo(() => {
    return chartData
      .map(point => [point.timestamp, point.macd])
      .filter(item => !isNaN(item[1] as number))
  }, [chartData])

  const signalData = useMemo(() => {
    return chartData
      .map(point => [point.timestamp, point.signal])
      .filter(item => !isNaN(item[1] as number))
  }, [chartData])

  const histogramData = useMemo(() => {
    return chartData
      .map(point => [point.timestamp, (point.macd || 0) - (point.signal || 0)])
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
        name: 'MACD',
        type: 'line',
        data: macdData,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: '#60A5FA',
          width: 2
        }
      },
      {
        name: 'Signal',
        type: 'line',
        data: signalData,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: '#FBBF24',
          width: 2
        }
      },
      {
        name: 'Histogram',
        type: 'bar',
        data: histogramData,
        itemStyle: {
          color: (params: any) => {
            return params.value[1] >= 0 ? '#10B981' : '#EF4444'
          }
        },
        barWidth: '60%'
      }
    ],
    markLine: {
      data: [
        {
          yAxis: 0,
          lineStyle: {
            color: '#6B7280',
            type: 'dashed',
            width: 1
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
        const date = new Date(params[0].axisValue).toLocaleString()
        let result = `${date}<br/>`
        
        params.forEach((param: any) => {
          if (param.seriesName === 'MACD') {
            result += `MACD: ${param.value[1].toFixed(4)}<br/>`
          } else if (param.seriesName === 'Signal') {
            result += `Signal: ${param.value[1].toFixed(4)}<br/>`
          } else if (param.seriesName === 'Histogram') {
            result += `Histogram: ${param.value[1].toFixed(4)}<br/>`
          }
        })
        
        return result
      }
    },
    legend: {
      data: ['MACD', 'Signal', 'Histogram'],
      top: 'top',
      textStyle: {
        color: '#6B7280',
        fontSize: 11
      }
    }
  }), [macdData, signalData, histogramData])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
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

export default React.memo(MACDChart)