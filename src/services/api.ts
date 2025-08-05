import axios from 'axios'
import type { CryptoAsset, RiskProfile } from '../types'
import { CacheService } from './cache'
import { rateLimiter } from './rateLimiter'

// Request deduplication - prevent multiple simultaneous requests for the same data
const pendingRequests = new Map<string, Promise<CryptoAsset[]>>()

// Create a single axios instance
const api = axios.create({
  baseURL: '/api/coingecko', // Default to proxy
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Function to update the API configuration based on API key
const updateApiConfig = () => {
  const apiKey = localStorage.getItem('coingecko-api-key')
  
  // Always use proxy to avoid CORS issues in browser
  api.defaults.baseURL = '/api/coingecko'
  
  if (apiKey && apiKey.trim()) {
    // Add API key to headers for proxy requests
    api.defaults.headers['X-CG-API-KEY'] = apiKey
  } else {
    // Remove API key header
    delete api.defaults.headers['X-CG-API-KEY']
  }
}

// Function to handle API errors and retry without API key if needed
const handleApiError = async (error: unknown, retryWithoutKey = false) => {
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as { response?: { status?: number } }
    if (apiError.response?.status === 429 || apiError.response?.status === 403) {
      // Rate limited or invalid API key - retry without API key
      if (!retryWithoutKey) {
        console.log('API key error detected, retrying without API key...')
        delete api.defaults.headers['X-CG-API-KEY']
        return true // Signal to retry
      }
    }
  }
  return false // Don't retry
}

// Initialize API config
updateApiConfig()

export interface CoinGeckoResponse {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  fully_diluted_valuation: number
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  roi: unknown
  last_updated: string
  sparkline_in_7d?: {
    price: number[]
  }
}

export class CoinGeckoAPI {
  // Get top cryptocurrencies by market cap
  static async getTopCryptocurrencies(limit: number = 100): Promise<CryptoAsset[]> {
    // Check cache first
    const cached = CacheService.getTopCoins()
    if (cached && cached.length >= limit) {
      console.log(`Using cached top coins data (${cached.length} coins)`)
      // Filter out USDC from cached data
      const filteredCached = cached.filter(coin => coin.id !== 'usd-coin')
      return filteredCached.slice(0, limit)
    }

    // Rate limiting - wait for available slot
    await rateLimiter.waitForSlot()

    try {
      updateApiConfig() // Update config before each request
      const response = await api.get(`/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: true,
          price_change_percentage: '24h,7d'
        }
      })

      const coins = response.data
        .filter((coin: CoinGeckoResponse) => coin.id !== 'usd-coin') // Filter out USDC
        .map((coin: CoinGeckoResponse) => ({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          current_price: coin.current_price,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          price_change_percentage_7d: 0, // We'll calculate this separately if needed
          market_cap: coin.market_cap,
          total_volume: coin.total_volume,
          image: coin.image,
          sparkline_in_7d: coin.sparkline_in_7d
        }))

      // Cache the results
      CacheService.setTopCoins(coins)
      console.log(`Fetched and cached ${coins.length} top coins (excluding USDC)`)

      return coins
    } catch (error) {
      // Try fallback to proxy if API key fails
      if (await handleApiError(error)) {
        try {
          const response = await api.get(`/coins/markets`, {
            params: {
              vs_currency: 'usd',
              order: 'market_cap_desc',
              per_page: limit,
              page: 1,
              sparkline: true,
              price_change_percentage: '24h,7d'
            }
          })

          const coins = response.data
            .filter((coin: CoinGeckoResponse) => coin.id !== 'usd-coin') // Filter out USDC
            .map((coin: CoinGeckoResponse) => ({
              id: coin.id,
              symbol: coin.symbol.toUpperCase(),
              name: coin.name,
              current_price: coin.current_price,
              price_change_percentage_24h: coin.price_change_percentage_24h,
              price_change_percentage_7d: 0,
              market_cap: coin.market_cap,
              total_volume: coin.total_volume,
              image: coin.image,
              sparkline_in_7d: coin.sparkline_in_7d
            }))

          // Cache the results
          CacheService.setTopCoins(coins)
          console.log(`Fetched and cached ${coins.length} top coins (fallback, excluding USDC)`)

          return coins
        } catch (fallbackError) {
          console.error('Error fetching top cryptocurrencies (fallback):', fallbackError)
          throw new Error('Failed to fetch cryptocurrency data')
        }
      }
      
      console.error('Error fetching top cryptocurrencies:', error)
      throw new Error('Failed to fetch cryptocurrency data')
    }
  }

  // Get specific cryptocurrencies by IDs (batch request)
  static async getCryptocurrenciesByIds(ids: string[]): Promise<CryptoAsset[]> {
    if (ids.length === 0) return []

    // Create a unique key for this request
    const requestKey = `batch-${ids.sort().join(',')}`
    
    // Check if there's already a pending request for the same data
    if (pendingRequests.has(requestKey)) {
      console.log(`Deduplicating request for: ${requestKey}`)
      return await pendingRequests.get(requestKey)!
    }

    // Create the request promise
    const requestPromise = (async () => {
      try {
        updateApiConfig() // Update config before each request
        rateLimiter.recordRequest() // Record this request
        const response = await api.get(`/coins/markets`, {
          params: {
            vs_currency: 'usd',
            ids: ids.join(','),
            order: 'market_cap_desc',
            sparkline: true,
            price_change_percentage: '24h,7d'
          }
        })

      const coins = response.data.map((coin: CoinGeckoResponse) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        price_change_percentage_7d: 0,
        market_cap: coin.market_cap,
        total_volume: coin.total_volume,
        image: coin.image,
        sparkline_in_7d: coin.sparkline_in_7d
      }))

      console.log(`Fetched ${coins.length} specific coins by IDs`)
      return coins
    } catch (error) {
      console.error('Error fetching cryptocurrencies by IDs:', error)
      throw new Error('Failed to fetch cryptocurrency data')
    }
  })()

  // Store the request promise and clean it up when done
  pendingRequests.set(requestKey, requestPromise)
  
  try {
    const result = await requestPromise
    return result
  } finally {
    // Clean up the pending request
    pendingRequests.delete(requestKey)
  }
}

  // Get specific cryptocurrency by ID (single coin)
  static async getCryptocurrency(id: string): Promise<CryptoAsset> {
    // Check cache first
    const cached = CacheService.getIndividualCoin(id)
    if (cached) {
      console.log(`Using cached data for ${id}`)
      return cached
    }

    try {
      updateApiConfig() // Update config before each request
      const response = await api.get(`/coins/${id}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
          sparkline: true
        }
      })

      const coin = response.data
      const cryptoAsset = {
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.market_data.current_price.usd,
        price_change_percentage_24h: coin.market_data.price_change_percentage_24h,
        price_change_percentage_7d: coin.market_data.price_change_percentage_7d,
        market_cap: coin.market_data.market_cap.usd,
        total_volume: coin.market_data.total_volume.usd,
        image: coin.image.large,
        sparkline_in_7d: coin.market_data.sparkline_7d
      }

      // Cache the result
      CacheService.setIndividualCoin(id, cryptoAsset)
      console.log(`Fetched and cached data for ${id}`)

      return cryptoAsset
    } catch (error) {
      console.error(`Error fetching cryptocurrency ${id}:`, error)
      throw new Error(`Failed to fetch ${id} data`)
    }
  }

  // Get trending cryptocurrencies (optimized to use single API call)
  static async getTrendingCryptocurrencies(): Promise<CryptoAsset[]> {
    // Check cache first
    const cached = CacheService.getTrendingCoins()
    if (cached && cached.length > 0) {
      console.log(`Using cached trending coins data (${cached.length} coins)`)
      return cached
    }

    // Rate limiting - wait for available slot
    await rateLimiter.waitForSlot()

    try {
      updateApiConfig() // Update config before each request
      rateLimiter.recordRequest() // Record this request
      const response = await api.get('/search/trending')
      const trendingCoins = response.data.coins.slice(0, 10)

      // Get trending coin IDs for batch request
      const trendingIds = trendingCoins.map((coin: { item: { id: string } }) => coin.item.id)
      
      // Use batch request instead of individual calls
      const detailedCoins = await this.getCryptocurrenciesByIds(trendingIds)

      // Cache the results
      CacheService.setTrendingCoins(detailedCoins)
      console.log(`Fetched and cached ${detailedCoins.length} trending coins`)

      return detailedCoins
    } catch (error) {
      console.error('Error fetching trending cryptocurrencies:', error)
      throw new Error('Failed to fetch trending data')
    }
  }

  // Get cryptocurrencies with high volatility (potential swing trade opportunities)
  static async getHighVolatilityCryptocurrencies(): Promise<CryptoAsset[]> {
    // Check cache first
    const cached = CacheService.getVolatileCoins()
    if (cached && cached.length > 0) {
      console.log(`Using cached volatile coins data (${cached.length} coins)`)
      return cached
    }

    // Rate limiting - wait for available slot
    await rateLimiter.waitForSlot()

    try {
      updateApiConfig() // Update config before each request
      rateLimiter.recordRequest() // Record this request
      const response = await api.get(`/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'volume_desc',
          per_page: 50,
          page: 1,
          sparkline: true,
          price_change_percentage: '24h,7d'
        }
      })

      // Filter for high volatility (24h price change > 10% or < -10%)
      const volatileCoins = response.data.filter((coin: CoinGeckoResponse) => 
        Math.abs(coin.price_change_percentage_24h) > 10
      )

      const coins = volatileCoins.map((coin: CoinGeckoResponse) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        price_change_percentage_7d: 0,
        market_cap: coin.market_cap,
        total_volume: coin.total_volume,
        image: coin.image,
        sparkline_in_7d: coin.sparkline_in_7d
      }))

      // Cache the results
      CacheService.setVolatileCoins(coins)
      console.log(`Fetched and cached ${coins.length} volatile coins`)

      return coins
    } catch (error) {
      console.error('Error fetching high volatility cryptocurrencies:', error)
      throw new Error('Failed to fetch volatility data')
    }
  }

  // Get lower market cap coins for aggressive portfolios (higher potential)
  static async getLowerCapCryptocurrencies(): Promise<CryptoAsset[]> {
    // Check cache first
    const cached = CacheService.getLowerCapCoins()
    if (cached && cached.length > 0) {
      console.log(`Using cached lower cap coins data (${cached.length} coins)`)
      return cached
    }

    // Rate limiting - wait for available slot
    await rateLimiter.waitForSlot()

    try {
      updateApiConfig() // Update config before each request
      rateLimiter.recordRequest() // Record this request
      
      // Get coins ranked 50-200 by market cap (lower cap with potential)
      const response = await api.get(`/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 150,
          page: 2, // Skip top 50, get next 150
          sparkline: true,
          price_change_percentage: '24h,7d'
        }
      })

      // Filter out stablecoins and focus on coins with good volume
      const lowerCapCoins = response.data.filter((coin: CoinGeckoResponse) => 
        coin.id !== 'usd-coin' && 
        coin.id !== 'tether' && 
        coin.id !== 'dai' &&
        coin.total_volume > 10000000 // At least $10M daily volume
      )

      const coins = lowerCapCoins.map((coin: CoinGeckoResponse) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        price_change_percentage_7d: 0,
        market_cap: coin.market_cap,
        total_volume: coin.total_volume,
        image: coin.image,
        sparkline_in_7d: coin.sparkline_in_7d
      }))

      // Cache the results
      CacheService.setLowerCapCoins(coins)
      console.log(`Fetched and cached ${coins.length} lower cap coins`)

      return coins
    } catch (error) {
      console.error('Error fetching lower cap cryptocurrencies:', error)
      throw new Error('Failed to fetch lower cap data')
    }
  }
}

// Portfolio generation service
export class PortfolioService {
  // Create USDC stablecoin asset
  private static createUSDC(): CryptoAsset {
    return {
      id: 'usd-coin',
      symbol: 'USDC',
      name: 'USD Coin',
      current_price: 1.00,
      price_change_percentage_24h: 0.00,
      price_change_percentage_7d: 0.00,
      market_cap: 25000000000, // ~25B market cap
      total_volume: 5000000000,
      image: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
      sparkline_in_7d: {
        price: new Array(168).fill(1.00) // 7 days * 24 hours = 168 data points
      }
    }
  }

  // Generate portfolio based on risk profile using industry-standard allocations
  static async generatePortfolio(
    riskProfile: RiskProfile
  ): Promise<CryptoAsset[]> {
    try {
      // Always start with top cryptocurrencies to ensure Bitcoin and Ethereum are available
      const topCoins = await CoinGeckoAPI.getTopCryptocurrencies(50)
      
      // Ensure Bitcoin and Ethereum are always included
      const bitcoin = topCoins.find(coin => coin.symbol.toLowerCase() === 'btc')
      const ethereum = topCoins.find(coin => coin.symbol.toLowerCase() === 'eth')
      
      if (!bitcoin || !ethereum) {
        throw new Error('Bitcoin and Ethereum are required for portfolio generation')
      }
      
      // Always include Bitcoin and Ethereum first
      const selectedAssets: CryptoAsset[] = [bitcoin, ethereum]
      
              const additionalAssets = (() => {
          switch (riskProfile) {
            case 'conservative': {
              // Conservative: 60% BTC, 30% ETH, 10% stablecoins
              // Add 1-2 more top coins for minimal diversification
              const additionalCoins = topCoins
                .filter(coin => coin.symbol.toLowerCase() !== 'btc' && coin.symbol.toLowerCase() !== 'eth')
                .slice(0, 2)
              return additionalCoins
            }
              
            case 'balanced': {
              // Balanced: 50% BTC, 25% ETH, 15% altcoins, 10% stablecoins
              // Add 3-4 altcoins for balanced diversification
              const altcoins = topCoins
                .filter(coin => coin.symbol.toLowerCase() !== 'btc' && coin.symbol.toLowerCase() !== 'eth')
                .slice(0, 4)
              return altcoins
            }
              
            case 'aggressive': {
              // Aggressive: 40% BTC, 20% ETH, 25% altcoins, 15% speculative
              // Focus on 3-4 high-potential altcoins for maximum impact
              const altcoins = topCoins
                .filter(coin => coin.symbol.toLowerCase() !== 'btc' && coin.symbol.toLowerCase() !== 'eth')
                .slice(0, 3)
              
              // Add 1-2 volatile coins for speculative portion
              const volatileCoins = topCoins
                .filter(coin => 
                  coin.symbol.toLowerCase() !== 'btc' && 
                  coin.symbol.toLowerCase() !== 'eth' &&
                  Math.abs(coin.price_change_percentage_24h) > 8
                )
                .slice(0, 2)
              
              return [...altcoins, ...volatileCoins]
            }
          }
        })()

                // Add USDC as stablecoin position (except for aggressive portfolios)
        const stablecoinAssets = riskProfile !== 'aggressive' ? [this.createUSDC()] : []
        
        return [...selectedAssets, ...additionalAssets, ...stablecoinAssets]
    } catch (error) {
      console.error('Error generating portfolio:', error)
      
      // If we hit rate limits, try to use cached data
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number } }
        if (apiError.response?.status === 429) {
          console.log('Rate limited, trying to use cached data...')
          
          // Try to get cached top coins as fallback
          const cachedTopCoins = CacheService.getTopCoins()
          if (cachedTopCoins && cachedTopCoins.length > 0) {
            console.log('Using cached data for portfolio generation')
            const fallbackAssets = cachedTopCoins.slice(0, 6)
            const usdc = this.createUSDC()
            return [...fallbackAssets, usdc]
          }
        }
      }
      
      throw new Error('Failed to generate portfolio')
    }
  }

  // Calculate allocation percentages based on risk profile
  static calculateAllocations(
    assets: CryptoAsset[], 
    riskProfile: RiskProfile
  ): { [key: string]: number } {
    const allocations: { [key: string]: number } = {}
    
    // Separate USDC from other assets
    const usdc = assets.find(asset => asset.id === 'usd-coin')
    const cryptoAssets = assets.filter(asset => asset.id !== 'usd-coin')
    
    // Get USDC allocation based on risk profile
    let usdcAllocation = 0
    switch (riskProfile) {
      case 'conservative': usdcAllocation = 10; break
      case 'balanced': usdcAllocation = 10; break
      case 'aggressive': usdcAllocation = 0; break
    }
    
    // Calculate crypto allocations using industry-standard percentages
    cryptoAssets.forEach(asset => {
      allocations[asset.id] = this.getTargetAllocation(asset, riskProfile)
    })

    // Calculate total allocation to check if we need normalization
    const totalAllocation = Object.values(allocations).reduce((sum, val) => sum + val, 0) + usdcAllocation
    
    // If total allocation is not 100%, normalize the crypto allocations
    if (Math.abs(totalAllocation - 100) > 0.01) {
      const cryptoTotal = Object.values(allocations).reduce((sum, val) => sum + val, 0)
      const remainingAllocation = 100 - usdcAllocation
      
      if (cryptoTotal > 0) {
        Object.keys(allocations).forEach(key => {
          allocations[key] = (allocations[key] / cryptoTotal) * remainingAllocation
        })
      } else {
        // If no crypto allocations, distribute remaining allocation evenly
        cryptoAssets.forEach(asset => {
          allocations[asset.id] = remainingAllocation / cryptoAssets.length
        })
      }
    }

    // Add USDC allocation
    if (usdc) {
      allocations[usdc.id] = usdcAllocation
    }

    // Debug logging
    console.log(`Portfolio allocation calculation for ${riskProfile} profile:`)
    console.log(`- USDC allocation: ${usdcAllocation}%`)
    console.log(`- Crypto assets: ${cryptoAssets.length}`)
    console.log(`- Total allocation: ${Object.values(allocations).reduce((sum, val) => sum + val, 0).toFixed(2)}%`)
    Object.entries(allocations).forEach(([id, allocation]) => {
      const asset = assets.find(a => a.id === id)
      console.log(`- ${asset?.symbol || id}: ${allocation.toFixed(2)}%`)
    })

    return allocations
  }

  // Get target allocation based on risk profile and asset characteristics
  // Using industry-standard allocation percentages from research
  private static getTargetAllocation(asset: CryptoAsset, riskProfile: RiskProfile): number {
    // Handle USDC stablecoin
    if (asset.id === 'usd-coin') {
      switch (riskProfile) {
        case 'conservative': return 10 // 10% stablecoins for conservative
        case 'balanced': return 10 // 10% stablecoins for balanced
        case 'aggressive': return 0 // No stablecoins for aggressive
      }
    }
    
    // Get market cap rank for allocation
    const marketCapRank = this.getMarketCapRank(asset.market_cap)
    
    switch (riskProfile) {
      case 'conservative':
        // Conservative: 60% Bitcoin, 30% Ethereum, 10% stablecoins
        if (asset.symbol === 'BTC') return 60
        if (asset.symbol === 'ETH') return 30
        // Other top coins get minimal allocation
        if (marketCapRank <= 10) return 5
        return 0
      case 'balanced':
        // Balanced: 50% Bitcoin, 25% Ethereum, 15% altcoins, 10% stablecoins
        if (asset.symbol === 'BTC') return 50
        if (asset.symbol === 'ETH') return 25
        // Altcoins get 15% total, distributed by market cap
        if (marketCapRank <= 10) return 8
        if (marketCapRank <= 20) return 5
        if (marketCapRank <= 50) return 2
        return 0
      case 'aggressive':
        // Aggressive: 40% Bitcoin, 20% Ethereum, 25% altcoins, 15% speculative
        if (asset.symbol === 'BTC') return 40
        if (asset.symbol === 'ETH') return 20
        // Altcoins and speculative assets get 40% total
        if (marketCapRank <= 10) return 12
        if (marketCapRank <= 20) return 8
        if (marketCapRank <= 50) return 5
        if (marketCapRank <= 100) return 3
        return 2
    }
  }

  // Estimate market cap rank (same as rebalancing service)
  private static getMarketCapRank(marketCap: number): number {
    if (marketCap > 100000000000) return 1 // >100B
    if (marketCap > 50000000000) return 2 // >50B
    if (marketCap > 20000000000) return 3 // >20B
    if (marketCap > 10000000000) return 4 // >10B
    if (marketCap > 5000000000) return 5 // >5B
    if (marketCap > 2000000000) return 10 // >2B
    if (marketCap > 1000000000) return 15 // >1B
    if (marketCap > 500000000) return 20 // >500M
    return 25
  }
} 