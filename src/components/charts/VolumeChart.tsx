import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { ChartDataPoint } from '../../types'
import { CHART_HEIGHTS } from '../../constants/chart'

interface VolumeChartProps {
  chartData: ChartDataPoint[]
}

const VolumeChart: React.FC<VolumeChartProps> = ({ chartData }) => {
  // Detect mobile device for responsive height
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const responsiveHeight = isMobile ? CHART_HEIGHTS.volumeMobile : CHART_HEIGHTS.volume

  // Prepare data for ECharts
  const volumeData = useMemo(() => {
    return chartData
      .map(point => [point.timestamp, point.volume])
      .filter(item => !isNaN(item[1] as number) && item[1] !== null)
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
        fontSize: 11,
        formatter: (value: number) => {
          if (value >= 1e9) return `${(value/1e9).toFixed(1)}B`
          if (value >= 1e6) return `${(value/1e6).toFixed(1)}M`
          if (value >= 1e3) return `${(value/1e3).toFixed(1)}K`
          return `${value}`
        }
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
        name: 'Volume',
        type: 'bar',
        data: volumeData,
        itemStyle: {
          color: '#60A5FA'
        },
        barWidth: '60%'
      }
    ],
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
        const value = data.value[1]
        const formattedValue = value >= 1e9 
          ? `${(value/1e9).toFixed(2)}B`
          : value >= 1e6 
          ? `${(value/1e6).toFixed(2)}M`
          : value >= 1e3 
          ? `${(value/1e3).toFixed(2)}K`
          : value.toFixed(0)
        
        return `${date}<br/>Volume: ${formattedValue}`
      }
    }
  }), [volumeData])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              Volume
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Daily trading volume
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

export default React.memo(VolumeChart)