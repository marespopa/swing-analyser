import type { ChartDataPoint } from '../types'

export interface TimeRange {
  start: Date
  end: Date
}

export const getLast3Months = (): TimeRange => {
  const end = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - 3)
  return { start, end }
}

export const filterChartDataByTimeRange = (
  chartData: ChartDataPoint[],
  timeRange: TimeRange
): ChartDataPoint[] => {
  return chartData.filter(point => {
    const pointDate = new Date(point.timestamp)
    return pointDate >= timeRange.start && pointDate <= timeRange.end
  })
}

export const getDefaultTimeRange = (chartData: ChartDataPoint[]): TimeRange => {
  if (chartData.length === 0) {
    return getLast3Months()
  }
  
  const lastPoint = chartData[chartData.length - 1]
  const firstPoint = chartData[0]
  
  const end = new Date(lastPoint.timestamp)
  const start = new Date(firstPoint.timestamp)
  
  // If data spans more than 3 months, limit to last 3 months
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  
  if (start < threeMonthsAgo) {
    return getLast3Months()
  }
  
  return { start, end }
}

export const formatTimeRange = (timeRange: TimeRange): string => {
  const startStr = timeRange.start.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
  const endStr = timeRange.end.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
  return `${startStr} - ${endStr}`
}
