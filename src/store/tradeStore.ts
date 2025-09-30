import { atom } from 'jotai'

export interface ProfitEvent {
  id: number
  price: number
  amount: number
  date: Date
  notes?: string
}

export interface StopLossEvent {
  id: number
  price: number
  amount: number
  date: Date
  notes?: string
}

export interface Trade {
  id: number
  asset: string
  buyPrice: number
  stopLoss: number | null
  closePrice: number | null
  profitAmount: number | null
  profitPercentage: number | null
  status: 'open' | 'closed' | 'stopped-out'
  tradeDate: Date
  openDate: Date
  closeDate: Date | null
  profitEvents: ProfitEvent[]
  stopLossEvents: StopLossEvent[]
  totalProfitTaken: number
  totalLossTaken: number
}

// Main trades atom with localStorage persistence
export const tradesAtom = atom<Trade[]>([])

// Derived atoms for filtered trades
export const openTradesAtom = atom((get) => 
  get(tradesAtom).filter((trade: Trade) => trade.status === 'open')
)

export const closedTradesAtom = atom((get) => 
  get(tradesAtom).filter((trade: Trade) => trade.status === 'closed')
)

export const stoppedOutTradesAtom = atom((get) => 
  get(tradesAtom).filter((trade: Trade) => trade.status === 'stopped-out')
)

// Form data atoms
export const formDataAtom = atom({
  asset: '',
  buyPrice: '',
  stopLoss: '',
  tradeDate: ''
})

export const closeTradeDataAtom = atom({
  closePrice: ''
})

export const takeProfitDataAtom = atom({
  price: '',
  amount: '',
  notes: ''
})

export const updateStopLossDataAtom = atom({
  newStopLoss: '',
  notes: ''
})

export const stopLossHitDataAtom = atom({
  price: '',
  amount: '',
  notes: ''
})

// UI state atoms
export const selectedTradeIdAtom = atom<number | null>(null)
export const selectedActionAtom = atom<'close' | 'take-profit' | 'update-sl' | 'stop-loss-hit' | null>(null)
