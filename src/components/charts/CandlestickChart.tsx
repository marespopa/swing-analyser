import React, { useMemo } from 'react'
import type { ChartDataPoint } from '../../types'

interface CandlestickChartProps {
  data: ChartDataPoint[]
  height?: number
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ 
  data, 
  height = 400 
}) => {
  // Filter data to only include items with OHLC data
  const ohlcData = useMemo(() => {
    const filtered = data.filter(item => 
      item.open !== undefined && 
      item.high !== undefined && 
      item.low !== undefined && 
      item.close !== undefined
    )
    console.log('OHLC data sample:', filtered.slice(0, 3))
    return filtered
  }, [data])

  // Calculate chart dimensions and scales
  const chartData = useMemo(() => {
    if (ohlcData.length === 0) return { min: 0, max: 0, candlesticks: [] }

    const prices = ohlcData.flatMap(item => [item.high!, item.low!, item.open!, item.close!])
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const range = max - min
    const padding = range * 0.1

    const candlesticks = ohlcData.map((item, index) => {
      const isGreen = item.close! >= item.open!
      const color = isGreen ? '#26a69a' : '#ef5350' // TradingView colors
      
      // Debug: Log first few candles to see colors
      if (index < 3) {
        console.log(`Candle ${index}:`, {
          open: item.open,
          close: item.close,
          high: item.high,
          low: item.low,
          isGreen,
          color,
          priceRange: { min, max, range }
        })
      }
      
      // Calculate Y positions correctly (SVG coordinates are top-down)
      const highY = ((max + padding - item.high!) / (range + 2 * padding)) * 100
      const lowY = ((max + padding - item.low!) / (range + 2 * padding)) * 100
      const openY = ((max + padding - item.open!) / (range + 2 * padding)) * 100
      const closeY = ((max + padding - item.close!) / (range + 2 * padding)) * 100
      
      const bodyTop = Math.min(openY, closeY)
      const bodyHeight = Math.abs(closeY - openY)
      
      // Debug: Log Y positions for first few candles
      if (index < 3) {
        console.log(`Candle ${index} Y positions:`, {
          highY,
          lowY,
          openY,
          closeY,
          bodyTop,
          bodyHeight
        })
      }
      
      return {
        ...item,
        isGreen,
        color,
        x: (index / (ohlcData.length - 1)) * 100, // Percentage position
        highY,
        lowY,
        openY,
        closeY,
        bodyTop,
        bodyHeight: Math.max(bodyHeight, 0.5) // Minimum height for visibility
      }
    })

    return { min: min - padding, max: max + padding, candlesticks }
  }, [ohlcData])

  if (ohlcData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p>No candlestick data available</p>
          <p className="text-sm">Please check your data source</p>
        </div>
      </div>
    )
  }

  const barWidth = 100 / ohlcData.length * 0.8

  return (
    <div className="w-full relative bg-white dark:bg-gray-900" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Background */}
        <rect width="100" height="100" fill="currentColor" className="text-white dark:text-gray-900" />
        
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="currentColor" strokeWidth="0.1" className="text-gray-200 dark:text-gray-700"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        
        {/* Candlesticks */}
        {chartData.candlesticks.map((candle, index) => {
          const candleWidth = Math.max(barWidth * 0.7, 1.0) // Wider candles, minimum width
          const wickWidth = 0.3 // Thicker wicks
          const tickLength = 0.8 // Longer ticks
          
          return (
            <g key={index}>
              {/* High-Low Wick (vertical line) */}
              <line
                x1={`${candle.x}%`}
                y1={`${candle.highY}%`}
                x2={`${candle.x}%`}
                y2={`${candle.lowY}%`}
                stroke={candle.color}
                strokeWidth={wickWidth}
                strokeLinecap="round"
              />
              
              {/* Body */}
              <rect
                x={`${candle.x - candleWidth/2}%`}
                y={`${candle.bodyTop}%`}
                width={`${candleWidth}%`}
                height={`${candle.bodyHeight}%`}
                fill={candle.isGreen ? candle.color : 'transparent'}
                stroke={candle.color}
                strokeWidth="0.3"
                rx="0.2"
                ry="0.2"
              />
              
              {/* For red candles, add a filled rectangle to make them more visible */}
              {!candle.isGreen && candle.bodyHeight > 0.1 && (
                <rect
                  x={`${candle.x - candleWidth/2 + 0.1}%`}
                  y={`${candle.bodyTop + 0.1}%`}
                  width={`${candleWidth - 0.2}%`}
                  height={`${Math.max(candle.bodyHeight - 0.2, 0.1)}%`}
                  fill={candle.color}
                  opacity="0.3"
                  rx="0.1"
                  ry="0.1"
                />
              )}
              
              {/* Open tick (left side) */}
              <line
                x1={`${candle.x - candleWidth/2 - tickLength}%`}
                y1={`${candle.openY}%`}
                x2={`${candle.x - candleWidth/2}%`}
                y2={`${candle.openY}%`}
                stroke={candle.color}
                strokeWidth="0.25"
                strokeLinecap="round"
              />
              
              {/* Close tick (right side) */}
              <line
                x1={`${candle.x + candleWidth/2}%`}
                y1={`${candle.closeY}%`}
                x2={`${candle.x + candleWidth/2 + tickLength}%`}
                y2={`${candle.closeY}%`}
                stroke={candle.color}
                strokeWidth="0.25"
                strokeLinecap="round"
              />
            </g>
          )
        })}
      </svg>
      
      {/* Price labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-700 dark:text-gray-300 p-3 font-mono">
        <span className="bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded shadow-sm">${chartData.max.toFixed(4)}</span>
        <span className="bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded shadow-sm">${((chartData.max + chartData.min) / 2).toFixed(4)}</span>
        <span className="bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded shadow-sm">${chartData.min.toFixed(4)}</span>
      </div>
      
      {/* Time labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-700 dark:text-gray-300 p-3 font-mono">
        <span className="bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded shadow-sm">{ohlcData[0]?.time}</span>
        <span className="bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded shadow-sm">{ohlcData[Math.floor(ohlcData.length / 2)]?.time}</span>
        <span className="bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded shadow-sm">{ohlcData[ohlcData.length - 1]?.time}</span>
      </div>
    </div>
  )
}

export default CandlestickChart
