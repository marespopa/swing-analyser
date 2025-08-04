export interface CryptoAsset {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  price_change_percentage_7d: number
  market_cap: number
  total_volume: number
  image: string
  sparkline_in_7d?: {
    price: number[]
  }
}

export interface PortfolioAsset extends CryptoAsset {
  allocation: number // percentage
  quantity: number
  value: number
  profitLoss: number
  profitLossPercentage: number
}

export interface Portfolio {
  id: string
  name: string
  totalValue: number
  totalProfitLoss: number
  totalProfitLossPercentage: number
  assets: PortfolioAsset[]
  riskProfile: RiskProfile
  startingAmount: number
  createdAt: Date
  updatedAt: Date
}

export type RiskProfile = 'conservative' | 'balanced' | 'aggressive'

export interface SwingTradeOpportunity {
  id: string
  type: 'buy' | 'sell' | 'rebalance'
  asset: CryptoAsset
  reason: string
  confidence: number // 0-100
  suggestedAllocation: number
  expectedReturn: number
  riskLevel: 'low' | 'medium' | 'high'
  timestamp: Date
}

export interface UserPreferences {
  riskProfile: RiskProfile
  startingAmount: number
  apiKey?: string
  notifications: boolean
  autoRebalance: boolean
}

export interface AppState {
  currentStep: 'welcome' | 'setup' | 'portfolio' | 'dashboard'
  userPreferences: UserPreferences
  portfolio: Portfolio | null
  swingTradeOpportunities: SwingTradeOpportunity[]
  isLoading: boolean
  error: string | null
} 