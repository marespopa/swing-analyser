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

export interface TechnicalAnalysisData {
  interval: '1h' | '4h' | '1d'
  data: PriceDataPoint[]
  sma20: number[]
  sma50: number[]
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
      description: string
      entryPrice?: number
      stopLoss?: number
      takeProfit?: number
      riskRewardRatio?: number
      upperTrendline: { start: { index: number; price: number }; end: { index: number; price: number } }
      lowerTrendline: { start: { index: number; price: number }; end: { index: number; price: number } }
      apexIndex?: number
      targetPrice?: number
    }>
  }
  trendlines: Trendline[]
  entryPoints: EntryPoint[]
  volumeAnalysis?: {
    volumeSMA: number[]
    volumeRatio: number[]
    volumeTrend: 'increasing' | 'decreasing' | 'stable'
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
          throw new Error('Coin not found. Please check the coin ID or symbol.')
        } else if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.')
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
    interval: '1h' | '4h' | '1d',
    days: number = 30
  ): Promise<CoinGeckoResponse> {
    const vs_currency = 'usd'
    let vs_currency_param = `vs_currency=${vs_currency}`
    let days_param = `days=${days}`
    
    // Adjust days based on interval for better data density
    if (interval === '1h') {
      days = Math.min(days, 7) // Max 7 days for hourly data
    } else if (interval === '4h') {
      days = Math.min(days, 30) // Max 30 days for 4-hour data
    }

    let interval_param = ''
    if (interval === '1h') {
      interval_param = '&interval=hourly'
    } else if (interval === '4h') {
      interval_param = '&interval=hourly' // We'll filter this to 4h intervals
    }

    const endpoint = `/coins/${coinId}/market_chart?${vs_currency_param}&${days_param}${interval_param}`
    
    try {
      const data = await this.makeRequest(endpoint)
      
      // For 4h interval, filter data to every 4th point
      if (interval === '4h') {
        const filteredData = {
          prices: data.prices.filter((_: any, index: number) => index % 4 === 0),
          market_caps: data.market_caps.filter((_: any, index: number) => index % 4 === 0),
          total_volumes: data.total_volumes.filter((_: any, index: number) => index % 4 === 0)
        }
        return filteredData
      }

      return data
    } catch (error) {
      throw error
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
      const data = await this.makeRequest(`/coins/${coinId}`, {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false
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
      throw error
    }
  }
}

export const coinGeckoAPI = new CoinGeckoAPI()
