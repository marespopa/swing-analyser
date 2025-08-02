import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Interface for historical data entry
export interface HistoricalDataEntry {
  coinId: string;
  data: number[];
  timestamp: number;
  days: number;
  isRealData: boolean;
  dataQuality: 'excellent' | 'good' | 'limited' | 'basic';
}

// Interface for cache statistics
export interface CacheStats {
  totalEntries: number;
  realDataEntries: number;
  mockDataEntries: number;
  oldestEntry: number;
  newestEntry: number;
}

// Atom for storing historical data with localStorage persistence
export const historicalDataAtom = atomWithStorage<Record<string, HistoricalDataEntry>>(
  'swing-analyzer-historical-data',
  {}
);

// Atom for cache statistics
export const cacheStatsAtom = atom((get) => {
  const data = get(historicalDataAtom);
  if (!data || typeof data !== 'object') {
    return {
      totalEntries: 0,
      realDataEntries: 0,
      mockDataEntries: 0,
      oldestEntry: 0,
      newestEntry: 0
    };
  }
  const entries = Object.values(data);
  
  if (entries.length === 0) {
    return {
      totalEntries: 0,
      realDataEntries: 0,
      mockDataEntries: 0,
      oldestEntry: 0,
      newestEntry: 0
    };
  }
  
  const timestamps = entries.map(entry => entry.timestamp);
  const realDataCount = entries.filter(entry => entry.isRealData).length;
  
  return {
    totalEntries: entries.length,
    realDataEntries: realDataCount,
    mockDataEntries: entries.length - realDataCount,
    oldestEntry: Math.min(...timestamps),
    newestEntry: Math.max(...timestamps)
  };
});

// Atom for data source info
export const dataSourceInfoAtom = atom((get) => {
  const stats = get(cacheStatsAtom);
  
  return {
    totalCoins: stats.totalEntries,
    realDataCoins: stats.realDataEntries,
    mockDataCoins: stats.mockDataEntries,
    dataQuality: stats.realDataEntries > 0 ? 'excellent' : 'limited'
  };
});

// Helper functions for managing historical data
export const historicalDataActions = {
  // Store historical data
  storeData: (
    set: (atom: any, value: any) => void,
    coinId: string,
    data: number[],
    days: number,
    isRealData: boolean,
    dataQuality: 'excellent' | 'good' | 'limited' | 'basic'
  ) => {
    set(historicalDataAtom, (prev: Record<string, HistoricalDataEntry> | undefined) => {
      const safePrev = prev && typeof prev === 'object' ? prev : {};
      return {
        ...safePrev,
        [coinId]: {
          coinId,
          data,
          timestamp: Date.now(),
          days,
          isRealData,
          dataQuality
        }
      };
    });
  },

  // Get historical data for a coin
  getData: (get: (atom: any) => any, coinId: string): HistoricalDataEntry | null => {
    const data = get(historicalDataAtom);
    if (!data || typeof data !== 'object') {
      return null;
    }
    return data[coinId] || null;
  },

  // Check if data is fresh (within cache duration)
  isDataFresh: (entry: HistoricalDataEntry, cacheDuration: number = 5 * 60 * 1000): boolean => {
    return Date.now() - entry.timestamp < cacheDuration;
  },

  // Clear all data
  clearAll: (set: (atom: any, value: any) => void) => {
    set(historicalDataAtom, {});
  },

  // Clear old data (older than specified duration)
  clearOldData: (set: (atom: any, value: any) => void, maxAge: number = 24 * 60 * 60 * 1000) => {
    set(historicalDataAtom, (prev: Record<string, HistoricalDataEntry> | undefined) => {
      if (!prev || typeof prev !== 'object') {
        return {};
      }
      
      const now = Date.now();
      const filtered: Record<string, HistoricalDataEntry> = {};
      
      Object.entries(prev).forEach(([coinId, entry]) => {
        if (now - entry.timestamp < maxAge) {
          filtered[coinId] = entry;
        }
      });
      
      return filtered;
    });
  },

  // Get data source info for a specific coin
  getDataSourceInfo: (get: (atom: any) => any, coinId: string) => {
    const entry = historicalDataActions.getData(get, coinId);
    
    if (!entry) {
      return { isRealData: false, dataQuality: 'limited' as const };
    }
    
    if (!historicalDataActions.isDataFresh(entry)) {
      return { isRealData: false, dataQuality: 'limited' as const };
    }
    
    return {
      isRealData: entry.isRealData,
      dataQuality: entry.dataQuality
    };
  }
}; 