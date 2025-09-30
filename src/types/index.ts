// Re-export all types from services
export type {
  TechnicalAnalysisData,
  PriceDataPoint,
  CoinGeckoResponse,
  EntryPoint,
  Trendline
} from '../services/coingeckoApi'

// Import EntryPoint for use in ChartDataPoint
import type { EntryPoint } from '../services/coingeckoApi'

// Chart-specific types
export interface ChartDataPoint {
  timestamp: number
  time: string
  price: number
  open?: number
  high?: number
  low?: number
  close?: number
  sma20: number | null
  sma50: number | null
  rsi: number | null
  macd?: number | null
  signal?: number | null
  histogram?: number | null
  bbUpper?: number | null
  bbMiddle?: number | null
  bbLower?: number | null
  support?: number | null
  resistance?: number | null
  stopLoss?: number | null
  takeProfit?: number | null
  entryPoint?: EntryPoint | null
}

export interface ToggleState {
  showBollingerBands: boolean
  showSMA20: boolean
  showSMA50: boolean
  showSupport: boolean
  showResistance: boolean
  chartType: 'line'
}

export type ChartType = 'line'

// UI Component types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

// Chart configuration types
export interface ChartConfig {
  colors: {
    price: string
    sma20: string
    sma50: string
    bbUpper: string
    bbLower: string
    support: string
    resistance: string
    macd: string
    signal: string
    rsi: string
  }
  strokeWidths: {
    price: number
    movingAverage: number
    bollingerBand: number
    supportResistance: number
  }
  opacities: {
    movingAverage: number
    bollingerBand: number
    supportResistance: number
  }
}

// API Response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
}

// Trade types
export interface Trade {
  id: string
  coin: string
  entryPrice: number
  exitPrice?: number
  quantity: number
  side: 'long' | 'short'
  status: 'open' | 'closed'
  entryTime: Date
  exitTime?: Date
  pnl?: number
  pnlPercentage?: number
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
}

// Theme types
export type Theme = 'light' | 'dark'

// Loading states
export interface LoadingState {
  isLoading: boolean
  error?: string
}
