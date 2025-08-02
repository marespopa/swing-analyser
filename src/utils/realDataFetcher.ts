import { CoinGeckoAPI } from './api';
import { historicalDataActions, historicalDataAtom } from '../stores/historicalDataStore';

// Type for Jotai get/set functions
type JotaiGet = (atom: any) => any;
type JotaiSet = (atom: any, value: any) => void;

// Get shared API instance for rate limiting
const getAPI = (): CoinGeckoAPI => {
  return CoinGeckoAPI.getInstance();
};

// Fetch real historical data with Jotai localStorage persistence
export const fetchRealHistoricalData = async (
  coinId: string, 
  days: number = 200,
  get: (atom: any) => any,
  set: (atom: any, value: any) => void
): Promise<number[]> => {
  
  // Check if we have fresh data in localStorage
  const existingEntry = historicalDataActions.getData(get, coinId);
  
  if (existingEntry && historicalDataActions.isDataFresh(existingEntry)) {
    return existingEntry.data;
  }
  
  try {
    const historicalData = await getAPI().fetchHistoricalData(coinId, days);
    
    if (historicalData && historicalData.length > 0) {
      // Convert to price array
      const prices = historicalData.map((point: { 0: number; 1: number }) => point[1]);
      
      // Store in Jotai with localStorage persistence
      historicalDataActions.storeData(
        set,
        coinId,
        prices,
        days,
        true, // isRealData
        'excellent' // dataQuality
      );
      
      return prices;
    }
  } catch (error) {
    // Silently handle error
  }
  
  // No fallback to mock data - throw error if real data can't be fetched
  throw new Error(`Failed to fetch real historical data for ${coinId}`);
};

// Batch fetch historical data with rate limiting
export const fetchBatchHistoricalData = async (
  coinIds: string[],
  days: number = 200,
  get: JotaiGet,
  set: JotaiSet,
  onProgress?: (current: number, total: number, coinId: string) => void
): Promise<Record<string, number[]>> => {
  const results: Record<string, number[]> = {};
  const delayBetweenRequests = 2000; // 2 seconds between requests (30 req/min)
  
  for (let i = 0; i < coinIds.length; i++) {
    const coinId = coinIds[i];
    
    try {
      // Update progress
      onProgress?.(i + 1, coinIds.length, coinId);
      
      // Fetch data for this coin
      const data = await fetchRealHistoricalData(coinId, days, get, set);
      results[coinId] = data;
      
      // Wait before next request to respect rate limits
      if (i < coinIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
      }
      
    } catch (error) {
      // Continue with next coin instead of failing completely
    }
  }
  
  return results;
};

// Get data source info for a coin (now uses Jotai store)
export const getDataSourceInfo = (
  coinId: string,
  get: (atom: any) => any
): { isRealData: boolean; dataQuality: string } => {
  return historicalDataActions.getDataSourceInfo(get, coinId);
};

// Clear cache (now uses Jotai store)
export const clearHistoricalDataCache = (set: (atom: any, value: any) => void) => {
  historicalDataActions.clearAll(set);
};

// Get cache statistics (now uses Jotai store)
export const getCacheStats = (get: (atom: any) => any) => {
  const data = get(historicalDataAtom);
  if (!data || typeof data !== 'object') {
    return {
      size: 0,
      entries: []
    };
  }
  return {
    size: Object.keys(data).length,
    entries: Object.keys(data)
  };
}; 