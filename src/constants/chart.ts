import type { ChartConfig } from '../types'

export const CHART_CONFIG: ChartConfig = {
  colors: {
    price: '#3B82F6',           // Blue for main price
    sma20: '#EF4444',           // Red for SMA 20
    sma50: '#F59E0B',           // Orange for SMA 50
    bbUpper: '#8B5CF6',         // Purple for Bollinger Bands
    bbLower: '#8B5CF6',         // Purple for Bollinger Bands
    support: '#10B981',         // Green for support
    resistance: '#EF4444',      // Red for resistance
    macd: '#3B82F6',            // Blue for MACD
    signal: '#F59E0B',          // Orange for signal
    rsi: '#8B5CF6'              // Purple for RSI
  },
  strokeWidths: {
    price: 3,                   // Slightly thinner for cleaner look
    movingAverage: 1.5,         // Thinner moving averages
    bollingerBand: 1,           // Very thin Bollinger Bands
    supportResistance: 2        // Keep support/resistance visible
  },
  opacities: {
    movingAverage: 0.8,         // More visible moving averages
    bollingerBand: 0.4,         // Much more subtle Bollinger Bands
    supportResistance: 0.9      // Keep support/resistance visible
  }
}

export const CHART_DASH_PATTERNS = {
  movingAverage: '8 4',
  bollingerBand: '4 4',
  supportResistance: '8 4',
  macd: '2 2'
} as const

export const CHART_MARGINS = {
  top: 5,
  right: 30,
  left: 20,
  bottom: 5
} as const

export const CHART_HEIGHTS = {
  main: 400,
  rsi: 200,
  macd: 200
} as const

export const RSI_LEVELS = {
  overbought: 70,
  oversold: 30
} as const

export const MACD_PERIODS = {
  fast: 12,
  slow: 26,
  signal: 9
} as const

export const MOVING_AVERAGE_PERIODS = {
  sma20: 20,
  sma50: 50
} as const

export const BOLLINGER_BAND_PERIODS = {
  period: 20,
  standardDeviation: 2
} as const
