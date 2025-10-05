import axios from 'axios'

export interface PriceDataPoint {
  timestamp: number
  price: number
  volume?: number
  open?: number
  high?: number
  low?: number
  close?: number
}

export interface CoinGeckoResponse {
  prices: [number, number][]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

export interface ExchangeTicker {
  base: string
  target: string
  market: {
    name: string
    identifier: string
    has_trading_incentive: boolean
  }
  last: number
  volume: number
  converted_last: {
    btc: number
    eth: number
    usd: number
  }
  converted_volume: {
    btc: number
    eth: number
    usd: number
  }
  trust_score: string
  bid_ask_spread_percentage: number
  timestamp: string
  last_traded_at: string
  last_fetch_at: string
  is_anomaly: boolean
  is_stale: boolean
  trade_url: string
  token_info_url: string | null
  coin_id: string
  target_coin_id: string
}

export interface ExchangeInfo {
  isListedOnBinance: boolean
  binanceTicker?: ExchangeTicker
  otherExchanges: ExchangeTicker[]
}

export interface TechnicalAnalysisData {
  interval: '1h' | '4h' | '1d'
  data: PriceDataPoint[]
  sma20: number[]
  sma50: number[]
  ema9: number[]
  ema20: number[]
  ema50: number[]
  rsi: number[]
  macd?: {
    macd: number[]
    signal: number[]
    histogram: number[]
  }
  bollingerBands?: {
    upper: number[]
    middle: number[]
    lower: number[]
  }
  atr?: number[]
  volatilityRegimes?: Array<{
    regime: 'normal' | 'high' | 'low'
    multiplier: number
  }>
  volatilityStops?: {
    stopLoss: number[]
    takeProfit: number[]
    riskRewardRatio: number[]
  }
  riskLevels?: {
    support: number[]
    resistance: number[]
    stopLoss: number[]
    takeProfit: number[]
    riskRewardRatio: number[]
  }
  fibonacciLevels?: {
    level0: number
    level236: number
    level382: number
    level500: number
    level618: number
    level764: number
    level786: number
    level1000: number
    swingHigh: number
    swingLow: number
    trend: 'uptrend' | 'downtrend' | 'sideways'
  }
  candlestickPatterns?: {
    patterns: Array<{
      index: number
      pattern: string
      signal: 'bullish' | 'bearish' | 'neutral'
      confidence: number
    }>
  }
  patternDetection?: {
    triangles: Array<{
      index: number
      pattern: string
      signal: 'bullish' | 'bearish' | 'neutral'
      confidence: number
      strength: 'weak' | 'moderate' | 'strong'
      volumeConfirmation?: boolean
      rsiConfirmation?: boolean
      maConfirmation?: boolean
      description: string
      entryPrice?: number
      stopLoss?: number
      takeProfit?: number
      riskRewardRatio?: number
      resistanceLevel: number
      supportLevel: number
      breakoutDirection?: 'up' | 'down'
      breakoutPrice?: number
    }>
    headAndShoulders: Array<{
      index: number
      pattern: string
      signal: 'bullish' | 'bearish' | 'neutral'
      confidence: number
      strength: 'weak' | 'moderate' | 'strong'
      volumeConfirmation?: boolean
      rsiConfirmation?: boolean
      maConfirmation?: boolean
      description: string
      entryPrice?: number
      stopLoss?: number
      takeProfit?: number
      riskRewardRatio?: number
      leftShoulder: { index: number; price: number }
      head: { index: number; price: number }
      rightShoulder: { index: number; price: number }
      neckline: number
      targetPrice?: number
    }>
    doublePatterns: Array<{
      index: number
      pattern: string
      signal: 'bullish' | 'bearish' | 'neutral'
      confidence: number
      strength: 'weak' | 'moderate' | 'strong'
      volumeConfirmation?: boolean
      rsiConfirmation?: boolean
      maConfirmation?: boolean
      description: string
      entryPrice?: number
      stopLoss?: number
      takeProfit?: number
      riskRewardRatio?: number
      firstPeak: { index: number; price: number }
      secondPeak: { index: number; price: number }
      supportLevel: number
      targetPrice?: number
    }>
    cupAndHandle: Array<{
      index: number
      pattern: string
      signal: 'bullish' | 'bearish' | 'neutral'
      confidence: number
      strength: 'weak' | 'moderate' | 'strong'
      volumeConfirmation?: boolean
      rsiConfirmation?: boolean
      maConfirmation?: boolean
      description: string
      entryPrice?: number
      stopLoss?: number
      takeProfit?: number
      riskRewardRatio?: number
      cupStart: { index: number; price: number }
      cupBottom: { index: number; price: number }
      cupEnd: { index: number; price: number }
      handleStart: { index: number; price: number }
      handleEnd: { index: number; price: number }
      targetPrice?: number
    }>
    flags: Array<{
      index: number
      pattern: string
      signal: 'bullish' | 'bearish' | 'neutral'
      confidence: number
      strength: 'weak' | 'moderate' | 'strong'
      volumeConfirmation?: boolean
      rsiConfirmation?: boolean
      maConfirmation?: boolean
      description: string
      entryPrice?: number
      stopLoss?: number
      takeProfit?: number
      riskRewardRatio?: number
      flagpoleStart: { index: number; price: number }
      flagpoleEnd: { index: number; price: number }
      flagStart: { index: number; price: number }
      flagEnd: { index: number; price: number }
      targetPrice?: number
    }>
    wedges: Array<{
      index: number
      pattern: string
      signal: 'bullish' | 'bearish' | 'neutral'
      confidence: number
      strength: 'weak' | 'moderate' | 'strong'
      volumeConfirmation?: boolean
      rsiConfirmation?: boolean
      maConfirmation?: boolean
      breakoutConfirmation?: boolean
      fakeBreakoutRisk?: 'low' | 'medium' | 'high'
      marketContext?: 'uptrend' | 'downtrend' | 'sideways'
      completionTimeframe?: 'short' | 'medium' | 'long'
      description: string
      entryPrice?: number
      stopLoss?: number
      takeProfit?: number
      riskRewardRatio?: number
      upperTrendline: { start: { index: number; price: number }; end: { index: number; price: number } }
      lowerTrendline: { start: { index: number; price: number }; end: { index: number; price: number } }
      apexIndex?: number
      targetPrice?: number
      tradingAdvice?: string
      riskManagement?: string
    }>
    highTrendlines: Array<{
      index: number
      pattern: string
      signal: 'bullish' | 'bearish' | 'neutral'
      confidence: number
      strength: 'weak' | 'moderate' | 'strong'
      volumeConfirmation?: boolean
      rsiConfirmation?: boolean
      maConfirmation?: boolean
      description: string
      entryPrice?: number
      stopLoss?: number
      takeProfit?: number
      riskRewardRatio?: number
      resistanceLevel: number
      supportLevel: number
      trendlineSlope?: number
      breakoutDirection?: 'up' | 'down'
      breakoutPrice?: number
      touches: number
    }>
  }
  trendlines: Trendline[]
  entryPoints: EntryPoint[]
  volumeAnalysis?: {
    volumeSMA: number[]
    volumeRatio: number[]
    volumeTrend: 'increasing' | 'decreasing' | 'stable'
  }
  dataQuality?: {
    totalDataPoints: number
    hasBasicIndicators: boolean
    hasAdvancedIndicators: boolean
    hasPatternDetection: boolean
    hasFullAnalysis: boolean
    limitations?: string
  }
}

export interface Trendline {
  start: { x: number; y: number }
  end: { x: number; y: number }
  type: 'support' | 'resistance'
}

export interface EntryPoint {
  timestamp: number
  price: number
  reason: string
  confidence: 'low' | 'medium' | 'high'
}

class CoinGeckoAPI {
  private baseURL = 'https://api.coingecko.com/api/v3'
  private apiKey: string | null = null
  private lastRequestTime = 0
  private readonly MIN_REQUEST_INTERVAL = 1000 // 1 second between requests

  setApiKey(apiKey: string) {
    this.apiKey = this.cleanApiKey(apiKey)
  }

  private getApiKey(): string | null {
    if (this.apiKey && this.apiKey.trim()) {
      return this.cleanApiKey(this.apiKey)
    }
    
    try {
      const storedKey = localStorage.getItem('coingecko-api-key')
      if (storedKey && storedKey.trim()) {
        const cleanedKey = this.cleanApiKey(storedKey)
        this.apiKey = cleanedKey
        return cleanedKey
      }
    } catch (error) {
      console.warn('Failed to retrieve API key from localStorage:', error)
    }
    
    return null
  }

  private cleanApiKey(apiKey: string): string {
    return apiKey.replace(/^["']|["']$/g, '').replace(/\\[tnr]/g, '').trim()
  }

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    this.lastRequestTime = Date.now()
  }

  private async makeRequestWithRetry(endpoint: string, params: Record<string, any> = {}, maxRetries: number = 3): Promise<any> {
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.waitForRateLimit()
        return await this.makeRequest(endpoint, params)
      } catch (error) {
        lastError = error as Error
        
        // If it's a rate limit error, wait longer before retrying
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          const waitTime = Math.pow(2, attempt) * 2000 // Exponential backoff: 4s, 8s, 16s
          console.warn(`Rate limited. Waiting ${waitTime}ms before retry ${attempt}/${maxRetries}`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue
        }
        
        // For other errors, don't retry
        throw error
      }
    }
    
    throw lastError
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}) {
    try {
      const config: any = {
        params: {
          ...params
        }
      }

      const apiKey = this.getApiKey()
      if (apiKey) {
        config.params.x_cg_demo_api_key = apiKey
      }

      const response = await axios.get(`${this.baseURL}${endpoint}`, config)
      return response.data
    } catch (error) {
      console.error('API Request Error:', error)
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status)
        console.error('Response data:', error.response?.data)
        
        if (error.response?.status === 401) {
          throw new Error('Invalid API key. Please check your CoinGecko API key.')
        } else if (error.response?.status === 403) {
          throw new Error('API key access denied. Please check your CoinGecko API key permissions.')
        } else if (error.response?.status === 404) {
          const coinId = params.coinId || endpoint.split('/')[2] || 'unknown'
          throw new Error(`Coin "${coinId}" not found on CoinGecko. Please check the coin ID or symbol. Try searching for a valid cryptocurrency.`)
        } else if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. The system is making too many requests too quickly. Please wait a moment and try again.')
        } else {
          const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message
          throw new Error(`API Error: ${errorMessage}`)
        }
      }
      if (error instanceof Error && error.message.includes('API key is required')) {
        throw error
      }
      throw new Error('Network error. Please check your connection.')
    }
  }

  async searchCoin(query: string) {
    try {
      // Remove $ and # prefixes from the search query
      const cleanQuery = query.replace(/^[$#]/, '').trim()
      
      // Search endpoint doesn't require API key
      const response = await axios.get(`${this.baseURL}/search`, {
        params: { query: cleanQuery }
      })
      const data = response.data
      return data.coins.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        marketCapRank: coin.market_cap_rank
      }))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.')
        }
      }
      throw new Error('Failed to search for coins. Please try again.')
    }
  }

  async getHistoricalData(
    coinId: string, 
    _interval: '1d', // Only daily data for free tier optimization
    days: number = 30
  ): Promise<CoinGeckoResponse> {
    const endpoint = `/coins/${coinId}/market_chart`
    const params = {
      vs_currency: 'usd',
      days: days.toString(),
      coinId: coinId // Add coinId for better error messages
    }
    
    try {
      const data = await this.makeRequestWithRetry(endpoint, params)
      return data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.')
        }
        if (error.response?.status === 404) {
          throw new Error(`Coin "${coinId}" not found. Please check the coin ID or try searching for a valid cryptocurrency.`)
        }
        if (error.response?.status === 401) {
          throw new Error('API key invalid or expired. Please check your API key.')
        }
      }
      throw new Error('Failed to fetch historical data. Please try again.')
    }
  }

  async getOHLCData(
    coinId: string,
    days: number = 30
  ): Promise<[number, number, number, number, number][]> {
    const vs_currency = 'usd'
    const endpoint = `/coins/${coinId}/ohlc?vs_currency=${vs_currency}&days=${days}`
    
    try {
      const data = await this.makeRequest(endpoint)
      return data // Returns array of [timestamp, open, high, low, close]
    } catch (error) {
      throw error
    }
  }

  async getCoinInfo(coinId: string) {
    try {
      const data = await this.makeRequestWithRetry(`/coins/${coinId}`, {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false,
        coinId: coinId // Add coinId for better error messages
      })
      
      return {
        id: data.id,
        name: data.name,
        symbol: data.symbol.toUpperCase(),
        currentPrice: data.market_data.current_price.usd,
        priceChange24h: data.market_data.price_change_percentage_24h,
        marketCap: data.market_data.market_cap.usd,
        volume24h: data.market_data.total_volume.usd
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Coin "${coinId}" not found. Please check the coin ID or try searching for a valid cryptocurrency.`)
      }
      throw error
    }
  }

  async getExchangeInfo(coinId: string): Promise<ExchangeInfo> {
    const endpoint = `/coins/${coinId}/tickers`
    
    try {
      const response = await this.makeRequestWithRetry(endpoint, { coinId })
      const tickers: ExchangeTicker[] = response.tickers || []
      
      // Check if coin is listed on Binance
      const binanceTicker = tickers.find(ticker => 
        ticker.market.identifier === 'binance' || 
        ticker.market.name.toLowerCase().includes('binance')
      )
      
      const otherExchanges = tickers.filter(ticker => 
        ticker.market.identifier !== 'binance' && 
        !ticker.market.name.toLowerCase().includes('binance')
      )
      
      return {
        isListedOnBinance: !!binanceTicker,
        binanceTicker,
        otherExchanges: otherExchanges.slice(0, 10) // Limit to top 10 other exchanges
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.')
        }
        if (error.response?.status === 404) {
          throw new Error(`Coin "${coinId}" not found. Please check the coin ID or try searching for a valid cryptocurrency.`)
        }
        if (error.response?.status === 401) {
          throw new Error('API key invalid or expired. Please check your API key.')
        }
      }
      throw new Error('Failed to fetch exchange information. Please try again.')
    }
  }
}

export const coinGeckoAPI = new CoinGeckoAPI()
