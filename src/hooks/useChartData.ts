import { useMemo } from 'react'
import type { TechnicalAnalysisData, ChartDataPoint, ToggleState } from '../types'


export const useChartData = (data: TechnicalAnalysisData, toggles: ToggleState) => {

  // Memoized chart data preparation
  const chartData: ChartDataPoint[] = useMemo(() => {
    return data.data.map((point, index) => {
      const date = new Date(point.timestamp)
      const time = data.interval === '1h' 
        ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : data.interval === '4h'
        ? date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

      const entryPoint = data.entryPoints.find(ep => ep.timestamp === point.timestamp)


      return {
        timestamp: point.timestamp,
        time,
        price: point.price,
        volume: typeof point.volume === 'number' ? point.volume : null,
        sma20: toggles.showSMA20 && !isNaN(data.sma20[index]) ? data.sma20[index] : null,
        sma50: toggles.showSMA50 && !isNaN(data.sma50[index]) ? data.sma50[index] : null,
        rsi: isNaN(data.rsi[index]) ? null : data.rsi[index],
        macd: data.macd ? (isNaN(data.macd.macd[index]) ? null : data.macd.macd[index]) : null,
        signal: data.macd ? (isNaN(data.macd.signal[index]) ? null : data.macd.signal[index]) : null,
        histogram: data.macd ? (isNaN(data.macd.histogram[index]) ? null : data.macd.histogram[index]) : null,
        bbUpper: data.bollingerBands && toggles.showBollingerBands ? (isNaN(data.bollingerBands.upper[index]) ? null : data.bollingerBands.upper[index]) : null,
        bbMiddle: data.bollingerBands && toggles.showBollingerBands ? (isNaN(data.bollingerBands.middle[index]) ? null : data.bollingerBands.middle[index]) : null,
        bbLower: data.bollingerBands && toggles.showBollingerBands ? (isNaN(data.bollingerBands.lower[index]) ? null : data.bollingerBands.lower[index]) : null,
        support: null, // Not used as line data anymore
        resistance: null, // Not used as line data anymore
        stopLoss: data.riskLevels ? (isNaN(data.riskLevels.stopLoss[index]) ? null : data.riskLevels.stopLoss[index]) : null,
        takeProfit: data.riskLevels ? (isNaN(data.riskLevels.takeProfit[index]) ? null : data.riskLevels.takeProfit[index]) : null,
        entryPoint: entryPoint || null,
        volumeSMA: data.volumeAnalysis ? (isNaN(data.volumeAnalysis.volumeSMA[index]) ? null : data.volumeAnalysis.volumeSMA[index]) : null,
        volumeRatio: data.volumeAnalysis ? (isNaN(data.volumeAnalysis.volumeRatio[index]) ? null : data.volumeAnalysis.volumeRatio[index]) : null
      }
    })
  }, [data, toggles])

  return { chartData }
}
