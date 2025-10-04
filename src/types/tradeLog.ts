export interface TradeLogEntry {
  id: string
  date: string
  text: string
  startingPortfolio: number
  endingPortfolio?: number // Optional - can be added later
  profit?: number // Calculated when endingPortfolio is set
  profitPercentage?: number // Calculated when endingPortfolio is set
  createdAt: Date
  updatedAt?: Date // When endingPortfolio was added
}

export interface TradeLogState {
  entries: TradeLogEntry[]
}
