// Vite Environment Types
declare global {
  interface ImportMetaEnv {
    readonly VITE_COINGECKO_API_KEY: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// CoinGecko API Types
export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_4h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: Roi | null;
  last_updated: string;
}

export interface Roi {
  times: number;
  currency: string;
  percentage: number;
}

// Historical Data Types
export interface HistoricalDataPoint {
  0: number; // timestamp
  1: number; // price
}

export type HistoricalData = HistoricalDataPoint[];

// Technical Analysis Types
export interface EMAData {
  ema50: number;
  ema200: number;
  isBullish: boolean;
  crossover: boolean;
  strength: string;
  signalStrength: number;
  rsi: string;
  isRSIHealthy: boolean;
  isRSIOptimal: boolean;
  isVolumeHealthy: boolean;
  isVolumeIncreasing: boolean;
  volumeRatio: number;
  volumeChange: number;
  isVolumeTrendingUp: boolean;
  signal: 'BUY' | 'HOLD' | 'SELL';
  qualityScore: number;
  swingTradingScore: number;
  holdingPeriod: HoldingPeriod;
  macd: MACDData | null;
  bollinger: BollingerBandsData | null;
  supportResistance: SupportResistanceData | null;
  riskMetrics: RiskMetricsData | null;
  shortTermPrediction: ShortTermPrediction | null;
  isRealData: boolean;
  dataQuality: 'excellent' | 'good' | 'limited' | 'basic';
  note?: string;
}

export interface HoldingPeriod {
  period: string;
  confidence: 'High' | 'Medium' | 'Low';
  reasoning: string[];
}

export interface MACDData {
  macdLine: string;
  signalLine: string;
  histogram: string;
  isBullish: boolean;
}

export interface BollingerBandsData {
  upper: string;
  middle: string;
  lower: string;
  percentB: string;
  isSqueeze: boolean;
  position: 'above' | 'below' | 'inside';
}

export interface SupportResistanceData {
  support: number;
  resistance: number;
  distanceToSupport: string;
  distanceToResistance: string;
}

export interface RiskMetricsData {
  stopLoss: number;
  takeProfit: number;
  riskRewardRatio: number;
  isGoodRiskReward: boolean;
  recommendedUnits: number;
}

export interface ShortTermPrediction {
  fourHour: TimeframePrediction;
  oneDay: TimeframePrediction;
  confidence: 'very_high' | 'high' | 'medium' | 'low';
}

export interface TimeframePrediction {
  sentiment: 'bullish' | 'slightly_bullish' | 'neutral' | 'slightly_bearish' | 'bearish';
  confidence: 'high' | 'medium' | 'low';
  score: number;
  reasoning: string;
  metrics: {
    recentChange: string;
    avgChange: string;
    volatility: string;
    pattern: string;
  };
}

// Market Sentiment Types
export interface MarketSentiment {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  upPercentage: number;
  downPercentage: number;
  upCount: number;
  downCount: number;
  neutralCount: number;
  total: number;
}

// API Error Types
export type ApiErrorType = 
  | 'rate_limit' 
  | 'network' 
  | 'partial_rate_limit' 
  | 'calculation_failed' 
  | 'partial_data' 
  | 'fallback_data';

// Processing Status Types
export interface ProcessingProgress {
  current: number;
  total: number;
  batch: number;
  totalBatches: number;
}

export interface ProcessingLogEntry {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
}

export interface RateLimitInfo {
  requestsThisMinute: number;
  lastReset: number;
}

// Component Props Types
export interface CoinCardProps {
  coin: Coin & { emaData: EMAData };
  index: number;
}

export interface MarketOverviewProps {
  coins: Coin[];
  filteredCoins: Coin[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  handleSort: (field: string) => void;
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
  marketSentiment: MarketSentiment;
  refreshData: () => void;
  lastRefresh: Date | null;
  autoRefreshEnabled: boolean;
  toggleAutoRefresh: () => void;
  countdown: number;
  rateLimitInfo: RateLimitInfo;
}

export interface SwingStrategyProps {
  coins: Coin[];
  swingSignals: (Coin & { emaData: EMAData })[];
  allAnalyzedCoins: (Coin & { emaData: EMAData })[];
  emaLoading: boolean;
  apiError: ApiErrorType | null;
  refreshData: () => void;
  lastRefresh: Date | null;
  autoRefreshEnabled: boolean;
  toggleAutoRefresh: () => void;
  countdown: number;
  rateLimitInfo: RateLimitInfo;
}

export interface ErrorBannerProps {
  errorType: ApiErrorType | null;
  onRetry: () => void;
}

export interface ProcessingStatusProps {
  emaLoading: boolean;
  processingStatus: string;
  processingProgress: ProcessingProgress;
  processingLog: ProcessingLogEntry[];
  rateLimitInfo: RateLimitInfo;
  totalCoins: number;
}

export interface RefreshControlsProps {
  onRefresh: () => void;
  onToggleAutoRefresh: () => void;
  loading: boolean;
  emaLoading?: boolean;
  lastRefresh: Date | null;
  autoRefreshEnabled: boolean;
  countdown: number;
  rateLimitInfo: RateLimitInfo;
  variant?: 'market' | 'swing';
}

// Hook Types
export interface UseCoinGeckoAPI {
  fetchTop100Coins: () => Promise<Coin[]>;
  fetchHistoricalData: (coinId: string, days?: number) => Promise<HistoricalData | null>;
  smartBatchProcessing: (coinIds: string[], days?: number) => Promise<Record<string, HistoricalData | null>>;
}

export interface UseRateLimiting {
  canMakeRequest: () => boolean;
  recordRequest: () => void;
  getWaitTime: () => number;
  rateLimitInfo: RateLimitInfo;
}

export interface UseSwingAnalysis {
  calculateSwingSignals: () => Promise<void>;
  swingSignals: (Coin & { emaData: EMAData })[];
  allAnalyzedCoins: (Coin & { emaData: EMAData })[];
  emaLoading: boolean;
  apiError: ApiErrorType | null;
} 