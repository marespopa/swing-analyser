import type { TechnicalAnalysisData } from '../../services/coingeckoApi'

export interface CoinInfo {
  id: string
  name: string
  symbol: string
  currentPrice?: number
}

export interface TradingRecommendation {
  action: 'BUY' | 'SELL' | 'HOLD' | 'WAIT'
  confidence: 'low' | 'medium' | 'high'
  signalColor: 'green' | 'amber' | 'red'
  trend: string
  strength: string
  priceChange: string
  swingAnalysis: {
    trend: 'Bullish' | 'Bearish' | 'Sideways'
    momentum: 'Oversold' | 'Overbought' | 'Neutral'
    macdSignal: 'Bullish' | 'Bearish' | 'Neutral'
    supportResistance: 'Near Support' | 'Near Resistance' | 'Middle Range'
    patterns: Array<{ name: string; signal: 'bullish' | 'bearish'; confidence: string }>
    hasGoodRiskReward: boolean
    riskReward: number
    hasVolumeConfirmation: boolean
    isChoppyMarket: boolean
    strength: string
    goldenCrossSignal?: 'Golden Cross' | 'Death Cross' | 'None'
  }
}

export interface SummaryGeneratorParams {
  coinInfo: CoinInfo
  tradingRecommendation: TradingRecommendation
  analysis: TechnicalAnalysisData
}

export interface RiskAssessmentResult {
  riskLevel: 'Low' | 'Medium' | 'High'
  riskScore: number
  riskFactors: string[]
  positionSizing: string[]
}

export interface ActionableRecommendations {
  entryStrategy: string[]
  exitStrategy?: string[]
  stopLoss: string
  takeProfit?: string
  target?: string
  riskReward: string
  timeHorizon: string[]
  keyLevels: string[]
}
