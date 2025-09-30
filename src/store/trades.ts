import { atomWithStorage } from 'jotai/utils'

// Trade interface defining the structure of each trade
export interface Trade {
  id: number
  asset: string
  buyPrice: number
  stopLoss: number | null
  closePrice: number | null      // null if trade is still open
  isClosed: boolean              // true if closed, false if still open
  dateOpened: string            // when trade was opened
  dateClosed: string | null     // when trade was closed (null if open)
  profitLoss: number | null     // null if trade is open
  profitLossPercent: number | null  // null if trade is open
  notes: string                 // trade motivation and notes
}

// Jotai atom with localStorage persistence for trades
export const tradesAtom = atomWithStorage<Trade[]>('trades', [])
