import { atomWithStorage } from 'jotai/utils'
import type { TradeLogEntry, TradeLogState } from '../types/tradeLog'

// Trade log storage with localStorage persistence
export const tradeLogAtom = atomWithStorage<TradeLogState>('swing_analyzer_trade_log', {
  entries: []
})

// Helper functions for trade log operations
export const addTradeLogEntry = (entry: Omit<TradeLogEntry, 'id' | 'createdAt' | 'profit' | 'profitPercentage' | 'updatedAt'>) => {
  const profit = entry.endingPortfolio ? entry.endingPortfolio - entry.startingPortfolio : undefined
  const profitPercentage = entry.endingPortfolio && entry.startingPortfolio !== 0
    ? ((entry.endingPortfolio - entry.startingPortfolio) / entry.startingPortfolio) * 100
    : undefined

  const newEntry: TradeLogEntry = {
    ...entry,
    id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    profit,
    profitPercentage
  }
  return newEntry
}

// Helper function to update ending portfolio value
export const updateEndingPortfolio = (entry: TradeLogEntry, endingPortfolio: number): TradeLogEntry => {
  const profit = endingPortfolio - entry.startingPortfolio
  const profitPercentage = entry.startingPortfolio !== 0
    ? (profit / entry.startingPortfolio) * 100
    : 0

  return {
    ...entry,
    endingPortfolio,
    profit,
    profitPercentage,
    updatedAt: new Date()
  }
}

export const removeTradeLogEntry = (id: string) => {
  return id
}

export const updateTradeLogEntry = (id: string, updates: Partial<Omit<TradeLogEntry, 'id' | 'createdAt' | 'profit' | 'profitPercentage'>>) => {
  return { id, updates }
}
