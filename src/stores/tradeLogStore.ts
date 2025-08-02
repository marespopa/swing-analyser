import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export interface TradeEntry {
  id: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  coinImage: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  price: number;
  quantity: number;
  totalValue: number;
  timestamp: Date;
  stopLoss?: number;
  takeProfit?: number;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  closePrice?: number;
  closeTimestamp?: Date;
  profitLoss?: number;
  profitLossPercentage?: number;
}

export interface TradeFilters {
  status: 'ALL' | 'OPEN' | 'CLOSED' | 'CANCELLED';
  action: 'ALL' | 'BUY' | 'SELL' | 'HOLD';
  dateRange: 'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM';
  customStartDate?: Date;
  customEndDate?: Date;
  searchTerm: string;
}

export interface TradeStats {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  bestTrade: TradeEntry | null;
  worstTrade: TradeEntry | null;
}

// Main trade log atom with localStorage persistence
export const tradeLogAtom = atomWithStorage<TradeEntry[]>('swing-analyser-trades', []);

// Filters atom
export const tradeFiltersAtom = atom<TradeFilters>({
  status: 'ALL',
  action: 'ALL',
  dateRange: 'ALL',
  searchTerm: ''
});

// Computed filtered trades
export const filteredTradesAtom = atom((get) => {
  const trades = get(tradeLogAtom);
  const filters = get(tradeFiltersAtom);
  
  return trades.filter(trade => {
    // Status filter
    if (filters.status !== 'ALL' && trade.status !== filters.status) {
      return false;
    }
    
    // Action filter
    if (filters.action !== 'ALL' && trade.action !== filters.action) {
      return false;
    }
    
    // Date range filter
    if (filters.dateRange !== 'ALL') {
      const tradeDate = new Date(trade.timestamp);
      const now = new Date();
      
      switch (filters.dateRange) {
        case 'TODAY':
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (tradeDate < today) return false;
          break;
        case 'WEEK':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (tradeDate < weekAgo) return false;
          break;
        case 'MONTH':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (tradeDate < monthAgo) return false;
          break;
        case 'CUSTOM':
          if (filters.customStartDate && tradeDate < filters.customStartDate) return false;
          if (filters.customEndDate && tradeDate > filters.customEndDate) return false;
          break;
      }
    }
        
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        trade.coinName.toLowerCase().includes(searchLower) ||
        trade.coinSymbol.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }
    
    return true;
  });
});

// Computed trade statistics
export const tradeStatsAtom = atom((get) => {
  const trades = get(tradeLogAtom);
  const closedTrades = trades.filter(t => t.status === 'CLOSED');
  const openTrades = trades.filter(t => t.status === 'OPEN');
  
  const totalProfitLoss = closedTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0);
  const winningTrades = closedTrades.filter(t => (t.profitLoss || 0) > 0);
  const losingTrades = closedTrades.filter(t => (t.profitLoss || 0) < 0);
  
  const totalValue = closedTrades.reduce((sum, trade) => sum + trade.totalValue, 0);
  const totalProfitLossPercentage = totalValue > 0 ? (totalProfitLoss / totalValue) * 100 : 0;
  
  const bestTrade = closedTrades.length > 0 
    ? closedTrades.reduce((best, current) => 
        (current.profitLoss || 0) > (best.profitLoss || 0) ? current : best
      )
    : null;
    
  const worstTrade = closedTrades.length > 0 
    ? closedTrades.reduce((worst, current) => 
        (current.profitLoss || 0) < (worst.profitLoss || 0) ? current : worst
      )
    : null;
  
  return {
    totalTrades: trades.length,
    openTrades: openTrades.length,
    closedTrades: closedTrades.length,
    totalProfitLoss,
    totalProfitLossPercentage,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
    bestTrade,
    worstTrade
  };
});

// Actions
export const addTradeAtom = atom(
  null,
  (get, set, trade: Omit<TradeEntry, 'id' | 'timestamp'>) => {
    const trades = get(tradeLogAtom);
    const newTrade: TradeEntry = {
      ...trade,
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    set(tradeLogAtom, [newTrade, ...trades]);
  }
);

export const closeTradeAtom = atom(
  null,
  (get, set, tradeId: string, closePrice: number) => {
    const trades = get(tradeLogAtom);
    const updatedTrades = trades.map(trade => {
      if (trade.id === tradeId && trade.status === 'OPEN') {
        const profitLoss = (closePrice - trade.price) * trade.quantity;
        const profitLossPercentage = ((closePrice - trade.price) / trade.price) * 100;
        
        return {
          ...trade,
          status: 'CLOSED' as const,
          closePrice,
          closeTimestamp: new Date(),
          profitLoss,
          profitLossPercentage
        };
      }
      return trade;
    });
    set(tradeLogAtom, updatedTrades);
  }
);

export const cancelTradeAtom = atom(
  null,
  (get, set, tradeId: string) => {
    const trades = get(tradeLogAtom);
    const updatedTrades = trades.map(trade => {
      if (trade.id === tradeId && trade.status === 'OPEN') {
        return {
          ...trade,
          status: 'CANCELLED' as const
        };
      }
      return trade;
    });
    set(tradeLogAtom, updatedTrades);
  }
);

export const deleteTradeAtom = atom(
  null,
  (get, set, tradeId: string) => {
    const trades = get(tradeLogAtom);
    const updatedTrades = trades.filter(trade => trade.id !== tradeId);
    set(tradeLogAtom, updatedTrades);
  }
);

export const clearAllTradesAtom = atom(
  null,
  (_, set) => {
    set(tradeLogAtom, []);
  }
); 