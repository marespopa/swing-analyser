import axios from 'axios'
import type { CryptoAsset, RiskProfile } from '../types'
import { CacheService } from './cache'

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
  
  if (apiKey && apiKey.trim()) {
    // Use direct CoinGecko API (Pro tier)
    api.defaults.baseURL = 'https://api.coingecko.com/api/v3'
    api.defaults.headers['X-CG-API-KEY'] = apiKey
  } else {
    // Use our proxy (free tier)
    api.defaults.baseURL = '/api/coingecko'
    delete api.defaults.headers['X-CG-API-KEY']
  }
}

// Function to handle API errors and fallback to proxy if needed
const handleApiError = async (error: unknown, retryWithProxy = false) => {
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as { response?: { status?: number } }
    if (apiError.response?.status === 429 || apiError.response?.status === 403) {
      // Rate limited or invalid API key - fallback to proxy
      if (!retryWithProxy) {
        console.log('API key error detected, falling back to proxy...')
        api.defaults.baseURL = '/api/coingecko'
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
      return cached.slice(0, limit)
    }

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

      const coins = response.data.map((coin: CoinGeckoResponse) => ({
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
      console.log(`Fetched and cached ${coins.length} top coins`)

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

          // Cache the results
          CacheService.setTopCoins(coins)
          console.log(`Fetched and cached ${coins.length} top coins (fallback)`)

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

  // Get specific cryptocurrency by ID
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

  // Get trending cryptocurrencies
  static async getTrendingCryptocurrencies(): Promise<CryptoAsset[]> {
    // Check cache first
    const cached = CacheService.getTrendingCoins()
    if (cached && cached.length > 0) {
      console.log(`Using cached trending coins data (${cached.length} coins)`)
      return cached
    }

    try {
      updateApiConfig() // Update config before each request
      const response = await api.get('/search/trending')
      const trendingCoins = response.data.coins.slice(0, 10)

      // Fetch detailed data for trending coins
      const detailedCoins = await Promise.all(
        trendingCoins.map((coin: { item: { id: string } }) => 
          this.getCryptocurrency(coin.item.id)
        )
      )

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

    try {
      updateApiConfig() // Update config before each request
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
}

// Portfolio generation service
export class PortfolioService {
  // Generate portfolio based on risk profile
  static async generatePortfolio(
    riskProfile: RiskProfile
  ): Promise<CryptoAsset[]> {
    try {
      let selectedAssets: CryptoAsset[] = []
      
      switch (riskProfile) {
        case 'conservative': {
          // Focus on top 10 coins with lower volatility
          const topCoins = await CoinGeckoAPI.getTopCryptocurrencies(20)
          selectedAssets = topCoins.slice(0, 8).filter(coin => 
            Math.abs(coin.price_change_percentage_24h) < 15
          ).slice(0, 6)
          break
        }
          
        case 'balanced': {
          // Mix of top coins and trending ones, avoiding overbought coins
          const [topCoinsBalanced, trendingCoins] = await Promise.all([
            CoinGeckoAPI.getTopCryptocurrencies(15),
            CoinGeckoAPI.getTrendingCryptocurrencies()
          ])
          
          // Filter trending coins to avoid overbought ones
          const goodTrendingCoins = trendingCoins.filter(coin => 
            coin.price_change_percentage_24h < 10 // Avoid coins that gained more than 10%
          )
          
          selectedAssets = [
            ...topCoinsBalanced.slice(0, 4),
            ...goodTrendingCoins.slice(0, 3)
          ]
          break
        }
          
        case 'aggressive': {
          // Include more volatile coins but prefer oversold ones for better entry points
          const [topCoinsAggressive, volatileCoins] = await Promise.all([
            CoinGeckoAPI.getTopCryptocurrencies(10),
            CoinGeckoAPI.getHighVolatilityCryptocurrencies()
          ])
          
          // Filter volatile coins to prefer oversold (negative price change) for better entry points
          const oversoldCoins = volatileCoins.filter(coin => coin.price_change_percentage_24h < -5)
          const otherVolatileCoins = volatileCoins.filter(coin => coin.price_change_percentage_24h >= -5)
          
          selectedAssets = [
            ...topCoinsAggressive.slice(0, 3),
            ...oversoldCoins.slice(0, 3), // Prefer oversold coins
            ...otherVolatileCoins.slice(0, 2) // Add some other volatile coins
          ]
          break
        }
      }

      return selectedAssets
    } catch (error) {
      console.error('Error generating portfolio:', error)
      throw new Error('Failed to generate portfolio')
    }
  }

  // Calculate allocation percentages based on risk profile
  static calculateAllocations(
    assets: CryptoAsset[], 
    riskProfile: RiskProfile
  ): { [key: string]: number } {
    const allocations: { [key: string]: number } = {}
    
    switch (riskProfile) {
      case 'conservative': {
        // More weight on top assets
        assets.forEach((asset) => {
          allocations[asset.id] = Math.max(10, 25 - (assets.indexOf(asset) * 2))
        })
        break
      }
        
      case 'balanced': {
        // Even distribution with slight preference for top assets
        const baseAllocation = 100 / assets.length
        assets.forEach((asset) => {
          const index = assets.indexOf(asset)
          allocations[asset.id] = baseAllocation + (index < 3 ? 5 : -2)
        })
        break
      }
        
      case 'aggressive': {
        // More weight on volatile assets
        assets.forEach((asset) => {
          const volatility = Math.abs(asset.price_change_percentage_24h)
          allocations[asset.id] = Math.max(8, 20 + (volatility / 2))
        })
        break
      }
    }

    // Normalize to 100%
    const total = Object.values(allocations).reduce((sum, val) => sum + val, 0)
    Object.keys(allocations).forEach(key => {
      allocations[key] = (allocations[key] / total) * 100
    })

    return allocations
  }
} 