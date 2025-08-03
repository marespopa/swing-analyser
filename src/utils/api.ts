import type { Coin, HistoricalData } from '@/types';

const MAX_REQUESTS_PER_MINUTE = 30;
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds

export class RateLimiter {
  private requestsThisMinute = 0;
  private lastReset = Date.now();

  canMakeRequest(): boolean {
    const now = Date.now();
    const timeSinceReset = now - this.lastReset;
    
    // Reset counter if a minute has passed
    if (timeSinceReset >= RATE_LIMIT_WINDOW) {
      this.requestsThisMinute = 0;
      this.lastReset = now;
      return true;
    }
    
    return this.requestsThisMinute < MAX_REQUESTS_PER_MINUTE;
  }

  recordRequest(): void {
    this.requestsThisMinute++;
  }

  getWaitTime(): number {
    const now = Date.now();
    const timeSinceReset = now - this.lastReset;
    const timeUntilReset = RATE_LIMIT_WINDOW - timeSinceReset;
    
    if (this.requestsThisMinute >= MAX_REQUESTS_PER_MINUTE) {
      return timeUntilReset;
    }
    
    return 0;
  }

  getRateLimitInfo() {
    return {
      requestsThisMinute: this.requestsThisMinute,
      lastReset: this.lastReset
    };
  }
}

// Singleton instance for shared rate limiting
let globalAPIInstance: CoinGeckoAPI | null = null;

export class CoinGeckoAPI {
  private rateLimiter: RateLimiter;

  constructor() {
    this.rateLimiter = new RateLimiter();
  }

  // Get the global singleton instance
  static getInstance(): CoinGeckoAPI {
    if (!globalAPIInstance) {
      globalAPIInstance = new CoinGeckoAPI();
    }
    return globalAPIInstance;
  }

  private async makeRequest<T>(url: string): Promise<T> {
    const apiKey = import.meta.env.VITE_COINGECKO_API_KEY;

    if (!apiKey) {
      throw new Error('CoinGecko API key is missing. Please add VITE_COINGECKO_API_KEY to your .env file.');
    }

    const waitTime = this.rateLimiter.getWaitTime();
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.rateLimiter.recordRequest();
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('API_RATE_LIMIT');
      }
      throw new Error(`API request failed: ${response.status}`);
    }
    
    return response.json();
  }

  async fetchTop100Coins(): Promise<Coin[]> {
    const apiKey = import.meta.env.VITE_COINGECKO_API_KEY;
    // Fetch 250 coins (1 page) to optimize API usage while maintaining good coverage
    // This ensures we have ~200 meaningful coins after filtering
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=1h,4h,24h,7d&x_cg_demo_api_key=${apiKey}`;
    
    return this.makeRequest<Coin[]>(url);
  }

  async fetchHistoricalData(coinId: string, days = 200): Promise<HistoricalData | null> {
    const apiKey = import.meta.env.VITE_COINGECKO_API_KEY;
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily&x_cg_demo_api_key=${apiKey}`;
    
    try {
      const data = await this.makeRequest<{ prices: HistoricalData }>(url);
      return data.prices;
    } catch (error) {
      return null;
    }
  }

  async smartBatchProcessing(coinIds: string[], days = 200): Promise<Record<string, HistoricalData | null>> {
    const results: Record<string, HistoricalData | null> = {};
    const batchSize = 4;
    
    for (let i = 0; i < coinIds.length; i += batchSize) {
      const batch = coinIds.slice(i, i + batchSize);
      
      // Process batch sequentially to respect rate limits
      for (const coinId of batch) {
        const waitTime = this.rateLimiter.getWaitTime();
        
        if (waitTime > 0) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        try {
          const data = await this.fetchHistoricalData(coinId, days);
          results[coinId] = data;
        } catch (error) {
          console.error(`Error processing ${coinId}:`, error);
          results[coinId] = null;
        }
      }
      
      // Delay between batches
      if (i + batchSize < coinIds.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return results;
  }

  getRateLimitInfo() {
    return this.rateLimiter.getRateLimitInfo();
  }
} 

// Removed standalone functions - use CoinGeckoAPI.getInstance() instead

interface ProcessingStatus {
  requestsThisMinute: number;
  lastReset: number;
}

// Smart batch processing with rate limiting
export const smartBatchProcessing = async (
  coinIds: string[], 
  days: number = 200, 
  updateProcessingStatus: (status: string, type: string) => void,
  setProcessingProgress: (progress: { current: number; total: number; batch: number; totalBatches: number } | ((prev: { current: number; total: number; batch: number; totalBatches: number }) => { current: number; total: number; batch: number; totalBatches: number })) => void,
  rateLimitInfo: ProcessingStatus,
  recordRequest: () => void
): Promise<Record<string, HistoricalData | null>> => {
  const results: Record<string, HistoricalData | null> = {};
  const batchSize = 4; // Increased batch size for faster processing of more coins
  const totalBatches = Math.ceil(coinIds.length / batchSize);
  let processedCount = 0;

  updateProcessingStatus(`Starting batch processing: ${coinIds.length} coins in ${totalBatches} batches of ${batchSize}`, 'info');
  setProcessingProgress({ current: 0, total: coinIds.length, batch: 1, totalBatches });

  for (let i = 0; i < coinIds.length; i += batchSize) {
    const batch = coinIds.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;

    updateProcessingStatus(`Processing batch ${batchNumber}/${totalBatches}: ${batch.join(', ')}`, 'info');
    setProcessingProgress(prev => ({ ...prev, batch: batchNumber }));

    // Process batch sequentially to respect rate limits
    const api = CoinGeckoAPI.getInstance();
    for (const coinId of batch) {
      try {
        recordRequest();
        const data = await api.fetchHistoricalData(coinId, days);
        results[coinId] = data;
        processedCount++;
        setProcessingProgress(prev => ({ ...prev, current: processedCount }));

        if (data) {
          updateProcessingStatus(`✓ Successfully fetched data for ${coinId} (${processedCount}/${coinIds.length})`, 'success');
        } else {
          updateProcessingStatus(`✗ No data available for ${coinId} (${processedCount}/${coinIds.length})`, 'error');
        }
      } catch (error: any) {
        updateProcessingStatus(`Error fetching data for ${coinId}: ${error.message}`, 'error');
        results[coinId] = null;
        processedCount++;
        setProcessingProgress(prev => ({ ...prev, current: processedCount }));
      }
    }

    // Longer delay between batches to be more conservative
    if (i + batchSize < coinIds.length) {
      updateProcessingStatus(`Waiting 2s before next batch... (API usage: ${rateLimitInfo.requestsThisMinute}/30)`, 'info');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  updateProcessingStatus(`Batch processing complete. Processed ${processedCount}/${coinIds.length} coins.`, 'success');
  return results;
}; 