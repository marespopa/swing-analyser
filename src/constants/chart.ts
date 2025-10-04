import type { ChartConfig } from '../types'

export const CHART_CONFIG: ChartConfig = {
  colors: {
    price: '#60A5FA',           // Brighter blue for main price (better dark mode visibility)
    sma20: '#F87171',           // Brighter red for SMA 20 (better dark mode visibility)
    sma50: '#FBBF24',           // Brighter orange for SMA 50 (better dark mode visibility)
    bbUpper: '#C084FC',         // Bright purple for Bollinger Bands (much better dark mode visibility)
    bbLower: '#C084FC',         // Bright purple for Bollinger Bands (much better dark mode visibility)
    bbFill: '#C084FC',          // Fill color for Bollinger Bands area
    support: '#34D399',         // Brighter green for support (better dark mode visibility)
    resistance: '#F87171',      // Brighter red for resistance (better dark mode visibility)
    macd: '#60A5FA',            // Brighter blue for MACD (better dark mode visibility)
    signal: '#FBBF24',          // Brighter orange for signal (better dark mode visibility)
    rsi: '#C084FC'              // Bright purple for RSI (better dark mode visibility)
  },
  strokeWidths: {
    price: 3,                   // Slightly thinner for cleaner look
    movingAverage: 1.5,         // Thinner moving averages
    bollingerBand: 2,           // Thicker Bollinger Bands for better visibility
    supportResistance: 2        // Keep support/resistance visible
  },
  opacities: {
    movingAverage: 0.8,         // More visible moving averages
    bollingerBand: 0.8,         // Much more visible Bollinger Bands
    bollingerFill: 0.1,         // Subtle fill for Bollinger Bands area
    supportResistance: 0.9      // Keep support/resistance visible
  }
}

export const CHART_DASH_PATTERNS = {
  movingAverage: '0',           // Solid lines for moving averages (EMA)
  bollingerBand: '4 4',         // Dotted lines for Bollinger Bands
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
  main: 300,
  mainMobile: 250,  // Smaller height for mobile
  rsi: 150,
  rsiMobile: 120,   // Smaller height for mobile
  macd: 150,
  macdMobile: 120,  // Smaller height for mobile
  volume: 120,
  volumeMobile: 100 // Smaller height for mobile
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
